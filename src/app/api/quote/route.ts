import { NextRequest, NextResponse } from "next/server";
import { CdpClient } from "@coinbase/cdp-sdk";
import { z } from "zod";
import { getTokenBySymbol } from "@/lib/tokens";
import { formatUnits } from "viem";

const cdp = new CdpClient({
    apiKeyId: process.env.CDP_API_KEY_ID,
    apiKeySecret: process.env.CDP_API_KEY_SECRET,
    walletSecret: process.env.CDP_WALLET_SECRET
});

const SwapQuoteSchema = z.object({
    fromToken: z.string(),
    toToken: z.string(),
    fromAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "fromAmount must be a positive number"
    }),
    amountReference: z.string().optional(),
    taker: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid taker address format")
});


export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = SwapQuoteSchema.parse(body);

        const fromToken = getTokenBySymbol(validatedData.fromToken);
        const toToken = getTokenBySymbol(validatedData.toToken);

        if (!fromToken || !toToken) {
            return NextResponse.json({ error: "Invalid token symbol" }, { status: 400 });
        }

        const swapPrice = await cdp.evm.getSwapPrice({
            fromToken: fromToken.address as `0x${string}`,
            toToken: toToken.address as `0x${string}`,
            fromAmount: BigInt(validatedData.fromAmount),
            network: "base",
            taker: validatedData.taker as `0x${string}`
        });

        if (swapPrice.liquidityAvailable) {
            const toAmount = formatUnits(swapPrice.toAmount, toToken.decimals);
            const fromAmount = formatUnits(swapPrice.fromAmount, fromToken.decimals);
            return NextResponse.json({ toAmount, fromAmount, fromToken: fromToken.symbol, toToken: toToken.symbol });
        } else {
            console.log("Swap is unavailable");
            return NextResponse.json({ error: "Swap is unavailable" }, { status: 400 });
        }
    } catch (error) {
        console.log(error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                },
                { status: 400 }
            );
        }
        console.error(error);
        return NextResponse.json(
            { error: "Failed to get swap price" },
            { status: 500 }
        );
    }
}