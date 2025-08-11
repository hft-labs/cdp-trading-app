import { useQuery } from "@tanstack/react-query";
import { getTokenBySymbol } from "@/lib/tokens";
import { useEvmAddress } from "@coinbase/cdp-hooks";

const defaultTaker = "0xFB122c4a6F14BeB76a590990C049d9952faE7CE1";

export const usePrice = (fromToken: string, toToken: string, amount: string) => {
    const accountAddress = useEvmAddress();
    const { data, isLoading, error } = useQuery({
        queryKey: ['price', fromToken, toToken, amount], queryFn: async () => {
            const body = {
                fromToken: getTokenBySymbol(fromToken)!.symbol,
                toToken: getTokenBySymbol(toToken)!.symbol,
                fromAmount: amount, // Send human-readable amount, let API parse it
                taker: accountAddress || defaultTaker,
            }
            const response = await fetch(`/api/price`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body)
            })
            const data = await response.json();
            if (amount === "") {
                return {
                    quote: null,
                    loading: false,
                    error: "Amount is required"
                }
            }
            return data;
        },
        refetchInterval: 1000,
    });
    return {
        quote: data,
        loading: isLoading,
        error: error
    };
}