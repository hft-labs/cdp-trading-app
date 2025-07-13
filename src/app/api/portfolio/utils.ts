import { getTokenBySymbol } from "@/lib/tokens";
import { parseUnits } from "viem";
import { CdpClient } from "@coinbase/cdp-sdk";
import { formatUnits } from "viem";

const cdp = new CdpClient({
    apiKeyId: process.env.CDP_API_KEY_ID,
    apiKeySecret: process.env.CDP_API_KEY_SECRET,
    walletSecret: process.env.CDP_WALLET_SECRET
});


export const getPrice = async (symbol: string): Promise<number> => {
    const fromToken = getTokenBySymbol("USDC");
    const toToken = getTokenBySymbol(symbol);
    if (!fromToken || !toToken) {
        throw new Error(`Token ${symbol} not found`);
    }
    if (symbol === "USDC") {
        return 1;
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
        return price;
    }
    throw new Error(`Swap price not available for ${symbol}`);
}