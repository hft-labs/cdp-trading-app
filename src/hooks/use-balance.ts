import { useQuery } from "@tanstack/react-query";
import { useEvmAddress } from "@coinbase/cdp-hooks";

const twoSeconds = 2000;

export const useBalance = (symbol: string) => {
    const { evmAddress } = useEvmAddress();
    const { data, isLoading, error } = useQuery({
        queryKey: ['balance', symbol],
        queryFn: () => fetch(`/api/balance?symbol=${symbol}&address=${evmAddress}`).then(res => res.json()),
        refetchInterval: twoSeconds,
        enabled: !!evmAddress && evmAddress.length > 1,
    });
    const availableBalance = data?.availableBalance;
    return { availableBalance, isLoading, error };
}