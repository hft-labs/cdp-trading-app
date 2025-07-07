import { baseTokens } from "@/lib/tokens";
import { base } from "viem/chains";

export const getToken = (symbol: string) => {
    
    if (symbol === "ETH") {
        const token = baseTokens.find((token) => token.symbol === 'WETH' && token.chainId === base.id);
        if (!token) {
            throw new Error(`Token ${symbol} not found`);
        }
        return token;
    } else {
        const token = baseTokens.find((token) => token.symbol === symbol && token.chainId === base.id);
        if (!token) {
            throw new Error(`Token ${symbol} not found`);
        }
        return token;
    }
}