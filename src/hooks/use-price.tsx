import { useQuery } from "@tanstack/react-query";
import { getTokenBySymbol } from "@/lib/tokens";
import { useEvmAddress } from "@coinbase/cdp-hooks";

const defaultTaker = "0xFB122c4a6F14BeB76a590990C049d9952faE7CE1";

export const usePrice = (fromToken: string, toToken: string, amount: string) => {
    const { evmAddress } = useEvmAddress();
    const { data, isLoading, error } = useQuery({
        queryKey: ['price', fromToken, toToken, amount], 
        queryFn: async () => {
            // Don't make API call if amount is empty or invalid
            if (!amount || amount === "" || isNaN(Number(amount)) || Number(amount) <= 0) {
                return {
                    quote: null,
                    loading: false,
                    error: "Amount is required"
                };
            }

            const body = {
                fromToken: getTokenBySymbol(fromToken)!.symbol,
                toToken: getTokenBySymbol(toToken)!.symbol,
                fromAmount: amount, // Send human-readable amount, let API parse it
                taker: evmAddress || defaultTaker,
            }
            const response = await fetch(`/api/price`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body)
            })
            const data = await response.json();
            return data;
        },
        enabled: !!amount && amount !== "" && !isNaN(Number(amount)) && Number(amount) > 0 && !!evmAddress,
        refetchInterval: 1000,
    });
    return {
        quote: data,
        loading: isLoading,
        error: error
    };
}