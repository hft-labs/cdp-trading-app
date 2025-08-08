import { getTokenBySymbol } from "@/lib/tokens";
import { formatUnits } from "viem";
import { getPrice } from "@/lib/price";
import { cdp } from "@/lib/cdp-client";
import { db } from "@/app/db";
import { accounts, token_balances, tokens } from "@/app/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
        return Response.json({ error: 'Address is required' }, { status: 400 });
    }

    try {
        // First try to get real blockchain data from CDP
        const page = await cdp.evm.listTokenBalances({
            address: address as `0x${string}`,
            network: "base",
        });

        console.log("CDP balances", page.balances);
        
        // If we have real balances, use them
        if (page.balances && page.balances.length > 0) {
            const positions = await Promise.all(
                (page.balances || []).map(async (balance: any) => {
                    // Access the correct nested structure
                    const symbol = balance.token.symbol;
                    const contractAddress = balance.token.contractAddress;
                    const amount = balance.amount.amount;
                    const decimals = balance.amount.decimals;

                    // Only process tokens that are in our baseTokens list
                    const tokenInfo = getTokenBySymbol(symbol);
                    if (!tokenInfo) {
                        return null; // Skip unknown tokens
                    }

                    const formattedBalance = formatUnits(amount, decimals);
                    
                    // Only try to get price for known tokens that have USDC pairs
                    let price = 0;
                    let value = 0;
                    
                    if (symbol !== 'USDC') {
                        try {
                            price = await getPrice(symbol);
                            value = parseFloat(formattedBalance) * price;
                        } catch (error) {
                            console.error(`Error getting price for ${symbol}:`, error);
                            // Keep price and value as 0 for tokens without liquidity
                        }
                    } else {
                        price = 1;
                        value = parseFloat(formattedBalance);
                    }

                    return {
                        symbol: symbol,
                        name: tokenInfo.name,
                        address: contractAddress,
                        decimals: decimals,
                        image: tokenInfo.image,
                        chainId: 8453, // Base mainnet
                        balance: formattedBalance,
                        price: price,
                        value: value,
                    };
                })
            );

            const validPositions = positions.filter(Boolean);
            console.log("CDP validPositions", validPositions);
            
            if (validPositions.length > 0) {
                return Response.json({
                    positions: validPositions,
                });
            }
        }

        // If no real balances found, try to get demo data from local database
        console.log("No CDP balances found, trying local database for demo data");
        
        // Get demo data using raw SQL query
        const demoDataResult = await db.execute(sql`
            SELECT 
                t.symbol,
                t.name,
                t.contract_address,
                t.decimals,
                t.image_url,
                tb.balance_amount,
                tb.balance_usd,
                tb.token_price_usd
            FROM token_balances tb
            JOIN tokens t ON tb.token_id = t.id
            JOIN accounts a ON tb.account_id = a.id
            WHERE a.wallet_address = ${address}
        `);

        const demoData = demoDataResult.rows;

        if (!demoData || demoData.length === 0) {
            console.log("No demo data found for address:", address);
            return Response.json({
                positions: [],
            });
        }

        // Convert database data to portfolio format
        const positions = demoData.map((row: any) => {
            const tokenInfo = getTokenBySymbol(row.symbol);
            
            return {
                symbol: row.symbol,
                name: tokenInfo?.name || row.name,
                address: row.contract_address,
                decimals: row.decimals,
                image: tokenInfo?.image || row.image_url || '',
                chainId: 8453, // Base mainnet
                balance: row.balance_amount,
                price: parseFloat(row.token_price_usd.toString()),
                value: parseFloat(row.balance_usd.toString()),
            };
        });

        console.log("Demo positions from database:", positions);
        return Response.json({
            positions: positions,
        });

    } catch (error) {
        console.error('Error fetching portfolio:', error);
        return Response.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
    }
}