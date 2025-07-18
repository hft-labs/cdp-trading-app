import { NextRequest, NextResponse } from "next/server";
import { CdpClient } from "@coinbase/cdp-sdk";
import { getTokenBySymbol } from "@/lib/tokens";
import { formatUnits, parseUnits } from "viem";

const cdp = new CdpClient({
    apiKeyId: process.env.CDP_API_KEY_ID,
    apiKeySecret: process.env.CDP_API_KEY_SECRET,
    walletSecret: process.env.CDP_WALLET_SECRET
});

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    if (!symbol) {
        return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }
    if (symbol === "USDC") {
        return NextResponse.json({ symbol: "USDC", price: 1 });
    }
    const fromToken = getTokenBySymbol("USDC");

    const toToken = getTokenBySymbol(symbol);

    if (!fromToken || !toToken) {
        return NextResponse.json({ error: "Invalid token symbol" }, { status: 400 });
    }
    const tenUSDC = parseUnits("10", fromToken.decimals);
    const swapPrice = await cdp.evm.getSwapPrice({
        fromToken: fromToken.address as `0x${string}`,
        toToken: toToken.address as `0x${string}`,
        fromAmount: tenUSDC,
        network: "base",
        taker: "0xA454ECF80b30E82126d90fdEe1f1e339c21d998C" as `0x${string}`
    });

    if (swapPrice.liquidityAvailable) {
        const toAmount = formatUnits(swapPrice.toAmount, toToken.decimals);
        const fromAmount = formatUnits(swapPrice.fromAmount, fromToken.decimals);
        const price = parseFloat(fromAmount) / parseFloat(toAmount);
        return NextResponse.json({ symbol: toToken.symbol, price });
    } else {
        return NextResponse.json({ error: "Swap is unavailable" }, { status: 400 });
    }
}

