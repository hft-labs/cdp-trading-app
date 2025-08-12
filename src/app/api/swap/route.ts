import { NextRequest } from "next/server";
import { getTokenBySymbol } from "@/lib/tokens";
import { parseUnits } from "viem";
import { cdp } from "@/lib/cdp-client";

// Helper function to convert BigInt values to strings recursively
function convertBigIntsToStrings(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj;
    }
    
    if (typeof obj === 'bigint') {
        return obj.toString();
    }
    
    if (Array.isArray(obj)) {
        return obj.map(convertBigIntsToStrings);
    }
    
    if (typeof obj === 'object') {
        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = convertBigIntsToStrings(value);
        }
        return result;
    }
    
    return obj;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fromToken, toToken, fromAmount, address } = body;
        const taker = address;

        // Validate environment variables
        if (!process.env.CDP_API_KEY_ID || !process.env.CDP_API_KEY_SECRET || !process.env.CDP_WALLET_SECRET) {
            console.error('Missing CDP environment variables');
            return Response.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const fromTokenInfo = getTokenBySymbol(fromToken);
        const toTokenInfo = getTokenBySymbol(toToken);

        if (!fromTokenInfo || !toTokenInfo) {
            console.error('Invalid token info:', { fromToken, toToken });
            return Response.json({ error: 'Invalid token' }, { status: 400 });
        }

        const swapQuote = await cdp.evm.createSwapQuote({
            fromToken: fromTokenInfo.address as `0x${string}`,
            toToken: toTokenInfo.address as `0x${string}`,
            fromAmount: BigInt(fromAmount),
            taker: taker as `0x${string}`,
            network: "base",
        });

        if (!swapQuote.liquidityAvailable) {
            return Response.json({ error: 'Insufficient liquidity for swap' }, { status: 400 });
        }

        // Convert BigInt values to strings before serializing
        const serializableTransaction = convertBigIntsToStrings(swapQuote.transaction);
        const serializablePermit2 = swapQuote.permit2 ? convertBigIntsToStrings(swapQuote.permit2) : undefined;

        // Return the transaction data for the client to execute
        return Response.json({
            success: true,
            transaction: serializableTransaction,
            permit2: serializablePermit2
        }, { status: 200 });

    } catch (error) {
        console.error('Error creating swap quote:', error);
        
        // Provide more specific error messages
        if (error instanceof Error) {
            if (error.message.includes('insufficient balance')) {
                return Response.json({ error: 'Insufficient balance for swap' }, { status: 400 });
            }
            if (error.message.includes('liquidity')) {
                return Response.json({ error: 'Insufficient liquidity for swap' }, { status: 400 });
            }
        }
        
        return Response.json({ error: 'Failed to create swap quote' }, { status: 500 });
    }
}