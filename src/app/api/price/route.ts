import { NextRequest } from "next/server";
import { getTokenBySymbol } from "@/lib/tokens";
import { parseUnits, formatUnits } from "viem";
import { cdp } from "@/lib/cdp-client";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fromToken, toToken, fromAmount, taker } = body;

        console.log('Price API request:', { fromToken, toToken, fromAmount, taker });

        let fromTokenInfo = getTokenBySymbol(fromToken);
        let toTokenInfo = getTokenBySymbol(toToken);

        if (!fromTokenInfo || !toTokenInfo) {
            return Response.json({ error: 'Invalid token' }, { status: 400 });
        }

        // Convert ETH to WETH for CDP API since ETH is a native asset
        if (fromTokenInfo.symbol === 'ETH') {
            const wethToken = getTokenBySymbol('WETH');
            if (!wethToken) {
                return Response.json({ error: 'WETH token not found' }, { status: 500 });
            }
            fromTokenInfo = wethToken;
        }
        
        if (toTokenInfo.symbol === 'ETH') {
            const wethToken = getTokenBySymbol('WETH');
            if (!wethToken) {
                return Response.json({ error: 'WETH token not found' }, { status: 500 });
            }
            toTokenInfo = wethToken;
        }

        console.log('Token info:', { 
            from: { symbol: fromTokenInfo.symbol, address: fromTokenInfo.address, decimals: fromTokenInfo.decimals },
            to: { symbol: toTokenInfo.symbol, address: toTokenInfo.address, decimals: toTokenInfo.decimals }
        });

        // Validate input parameters
        if (!taker || !taker.startsWith('0x') || taker.length !== 42) {
            return Response.json({ error: 'Invalid taker address' }, { status: 400 });
        }

        if (!fromAmount || isNaN(Number(fromAmount)) || Number(fromAmount) <= 0) {
            return Response.json({ error: 'Invalid fromAmount' }, { status: 400 });
        }

        const fromAmountParsed = parseUnits(fromAmount, fromTokenInfo.decimals);
        console.log('Parsed amount:', { fromAmount, decimals: fromTokenInfo.decimals, parsed: fromAmountParsed.toString() });

        const swapPrice = await cdp.evm.getSwapPrice({
            fromToken: fromTokenInfo.address as `0x${string}`,
            toToken: toTokenInfo.address as `0x${string}`,
            fromAmount: fromAmountParsed,
            taker: taker as `0x${string}`,
            network: "base",
        });

        if ('toAmount' in swapPrice) {
            // Format the amounts to human-readable values using the token decimals
            const formattedToAmount = formatUnits(swapPrice.toAmount, toTokenInfo.decimals);
            const formattedFromAmount = formatUnits(swapPrice.fromAmount, fromTokenInfo.decimals);
            
            return Response.json({
                toAmount: formattedToAmount,
                fromAmount: formattedFromAmount,
            });
        } else {
            return Response.json({ error: 'Swap is unavailable' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error getting price:', error);
        return Response.json({ error: 'Failed to get price' }, { status: 500 });
    }
}