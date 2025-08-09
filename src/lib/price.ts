import { getTokenBySymbol } from "@/lib/tokens";
import { parseUnits, formatUnits } from "viem";
import { cdp } from "@/lib/cdp-client";


export const getPrice = async (symbol: string): Promise<number> => {
    const fromToken = getTokenBySymbol("USDC");
    let toToken = getTokenBySymbol(symbol);
    
    if (!fromToken || !toToken) {
        throw new Error(`Token ${symbol} not found`);
    }
    
    if (symbol === "USDC") {
        return 1;
    }
    
    // For ETH, use WETH for pricing since they have the same value
    if (symbol === "ETH") {
        toToken = getTokenBySymbol("WETH");
        if (!toToken) {
            throw new Error(`WETH token not found for ETH pricing`);
        }
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
        // Fix: If fromAmount USDC gets toAmount of token, then 1 token = fromAmount/toAmount USD
        // But we want price per token, so it should be fromAmount/toAmount
        // Actually, let me think: 10 USDC -> X WETH means 1 WETH = 10/X USD
        const price = parseFloat(fromAmount) / parseFloat(toAmount);
        return price;
    }
    throw new Error(`Swap price not available for ${symbol}`);
}