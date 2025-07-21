import { useQuery } from "@tanstack/react-query";
import { getTokenBySymbol } from "@/lib/tokens";
import { parseUnits } from "viem";
import { useAccountContext } from "../components/providers/account-provider";

// WHy do we need a taker address for a qoute?
const defaultTaker = "0xFB122c4a6F14BeB76a590990C049d9952faE7CE1";

export const usePrice = (fromToken: string, toToken: string, amount: string) => {
    const { accountAddress } = useAccountContext();
    const { data, isLoading, error } = useQuery({
        queryKey: ['price', fromToken, toToken, amount], queryFn: async () => {
            const parsedAmount = parseUnits(amount, getTokenBySymbol(fromToken)!.decimals).toString()

            const body = {
                fromToken: getTokenBySymbol(fromToken)!.symbol,
                toToken: getTokenBySymbol(toToken)!.symbol,
                fromAmount: parsedAmount,
                taker: accountAddress || defaultTaker,
            }
            const response = await fetch(`/api/price`, {
                method: "POST",
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