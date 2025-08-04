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

        const positions = await Promise.all(
            (page.balances || []).map(async (balance: any) => {
                const tokenInfo = getTokenBySymbol(balance.symbol);
                if (!tokenInfo) {
                    return null;
                }

                const formattedBalance = formatUnits(balance.amount, tokenInfo.decimals);
                const price = await getPrice(balance.symbol);
                const value = parseFloat(formattedBalance) * price;

                return {
                    symbol: balance.symbol,
                    name: tokenInfo.name,
                    address: balance.address,
                    decimals: tokenInfo.decimals,
                    image: tokenInfo.image,
                    chainId: 8453, // Base mainnet
                    balance: formattedBalance,
                    price: price,
                    value: value,
                };
            })
        );

        const validPositions = positions.filter(Boolean);

        return Response.json({
            positions: validPositions,
        });
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        return Response.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
    }
}