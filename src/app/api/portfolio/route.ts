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
        console.log('Fetching balances for address:', address);
        const page = await cdp.evm.listTokenBalances({
            address: address as `0x${string}`,
            network: "base",
        });

        console.log('Raw balance response:', JSON.stringify(page, null, 2));

        if (!page.balances || page.balances.length === 0) {
            console.log('No balances found');
            return Response.json({
                positions: [],
            });
        }

        console.log('Found balances:', page.balances.length);
        page.balances.forEach((balance: any, index: number) => {
            console.log(`Balance ${index}:`, {
                symbol: balance.token?.symbol,
                contractAddress: balance.token?.contractAddress,
                amount: balance.amount?.amount,
                decimals: balance.amount?.decimals
            });
        });

        const positions = await Promise.all(
            page.balances.map(async (balance: any) => {
                // Access the correct nested structure
                const symbol = balance.token.symbol;
                const contractAddress = balance.token.contractAddress;
                const amount = balance.amount.amount;
                const decimals = balance.amount.decimals;

                // Only process tokens that are in our baseTokens list
                const tokenInfo = getTokenBySymbol(symbol);
                console.log(`Processing token ${symbol}:`, { tokenInfo, contractAddress, amount, decimals });
                if (!tokenInfo) {
                    console.log(`Skipping unknown token: ${symbol}`);
                    return null; // Skip unknown tokens
                }

                const formattedBalance = formatUnits(amount, decimals);
                console.log(`Formatted balance for ${symbol}: ${formattedBalance} (raw: ${amount}, decimals: ${decimals})`);
                
                // Handle very small balances that might be displayed as 0
                const balanceNum = parseFloat(formattedBalance);
                console.log(`${symbol}: balanceNum = ${balanceNum}`);
                
                if (balanceNum > 0 && balanceNum < 0.000001) {
                    console.log(`Very small balance detected for ${symbol}: ${formattedBalance}`);
                }
                
                // Only try to get price for known tokens that have USDC pairs
                let price = 0;
                let value = 0;
                
                // Check if balance is very small but not zero
                console.log(`${symbol}: raw balance number: ${balanceNum}, is greater than 0: ${balanceNum > 0}`);
                
                if (symbol !== 'USDC') {
                    try {
                        price = await getPrice(symbol);
                        value = balanceNum * price;
                        console.log(`${symbol}: balance=${formattedBalance}, price=${price}, value=${value}`);
                    } catch (error) {
                        console.error(`Error getting price for ${symbol}:`, error);
                        // Keep price and value as 0 for tokens without liquidity
                        // But still show the position if there's a balance
                        price = 0;
                        value = 0;
                        console.log(`${symbol}: Price fetch failed, but showing position with balance ${formattedBalance}`);
                    }
                } else {
                    price = 1;
                    value = balanceNum;
                    console.log(`${symbol}: balance=${formattedBalance}, price=${price}, value=${value}`);
                }

                const position = {
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
                
                console.log(`Created position for ${symbol}:`, position);
                return position;
            })
        );

        const validPositions = positions.filter(Boolean);
        
        console.log('Final positions:', validPositions.map(p => p ? { 
            symbol: p.symbol, 
            balance: p.balance, 
            balanceNum: parseFloat(p.balance),
            value: p.value,
            hasBalance: parseFloat(p.balance) > 0
        } : null).filter(Boolean));
        
        return Response.json({
            positions: validPositions,
        });

    } catch (error) {
        console.error('Error fetching portfolio:', error);
        return Response.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
    }
}