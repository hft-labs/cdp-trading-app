import { getTokenBySymbol } from "@/lib/tokens";
import { formatUnits } from "viem";
import { getPrice } from "@/lib/price";
import { cdp } from "@/lib/cdp-client";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
        return Response.json({ error: 'Address is required' }, { status: 400 });
    }

    try {
        const page = await cdp.evm.listTokenBalances({
            address: address as `0x${string}`,
            network: "base",
        });

        if (!page.balances || page.balances.length === 0) {
            return Response.json({
                positions: [],
            });
        }

        const positions = await Promise.all(
            page.balances.map(async (balance: any) => {
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
                        console.log(`${symbol}: balance=${formattedBalance}, price=${price}, value=${value}`);
                    } catch (error) {
                        console.error(`Error getting price for ${symbol}:`, error);
                        // Keep price and value as 0 for tokens without liquidity
                    }
                } else {
                    price = 1;
                    value = parseFloat(formattedBalance);
                    console.log(`${symbol}: balance=${formattedBalance}, price=${price}, value=${value}`);
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
        
        return Response.json({
            positions: validPositions,
        });

    } catch (error) {
        console.error('Error fetching portfolio:', error);
        return Response.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
    }
}