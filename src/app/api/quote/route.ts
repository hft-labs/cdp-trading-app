import { NextRequest } from "next/server";
import { getTokenBySymbol } from "@/lib/tokens";
import { parseUnits } from "viem";
import { cdp } from "@/lib/cdp-client";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fromToken, toToken, fromAmount, taker } = body;

        const fromTokenInfo = getTokenBySymbol(fromToken);
        const toTokenInfo = getTokenBySymbol(toToken);

        if (!fromTokenInfo || !toTokenInfo) {
            return Response.json({ error: 'Invalid token' }, { status: 400 });
        }

        const swapPrice = await cdp.evm.getSwapPrice({
            fromToken: fromTokenInfo.address as `0x${string}`,
            toToken: toTokenInfo.address as `0x${string}`,
            fromAmount: parseUnits(fromAmount, fromTokenInfo.decimals),
            taker: taker as `0x${string}`,
            network: "base",
        });

        if ('toAmount' in swapPrice) {
            return Response.json({
                toAmount: swapPrice.toAmount.toString(),
                fromAmount: swapPrice.fromAmount.toString(),
            });
        } else {
            return Response.json({ error: 'Swap is unavailable' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error getting quote:', error);
        return Response.json({ error: 'Failed to get quote' }, { status: 500 });
    }
}