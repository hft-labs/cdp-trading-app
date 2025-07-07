import { useQuery } from "@tanstack/react-query";
import { useAccountContext } from "@/components/providers/account-provider";

const twoSeconds = 2000;

export const useBalance = (symbol: string) => {
    const { accountAddress } = useAccountContext();
    const { data, isLoading, error } = useQuery({
        queryKey: ['balance', symbol],
        queryFn: () => fetch(`/api/balance?symbol=${symbol}&address=${accountAddress}`).then(res => res.json()),
        refetchInterval: twoSeconds,
        enabled: !!accountAddress && accountAddress.length > 1,
    });
    const availableBalance = data?.availableBalance;
    return { availableBalance, isLoading, error };
}