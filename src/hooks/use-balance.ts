import { useQuery } from "@tanstack/react-query";
import { useEvmAddress } from "@coinbase/cdp-hooks";

const twoSeconds = 2000;

export const useBalance = (symbol: string) => {
    const accountAddress = useEvmAddress();
    const { data, isLoading, error } = useQuery({
        queryKey: ['balance', symbol],
        queryFn: () => fetch(`/api/balance?symbol=${symbol}&address=${accountAddress}`).then(res => res.json()),
        refetchInterval: twoSeconds,
        enabled: !!accountAddress && accountAddress.length > 1,
    });
    const availableBalance = data?.availableBalance;
    return { availableBalance, isLoading, error };
}