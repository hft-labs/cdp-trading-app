import { useQuery } from "@tanstack/react-query";
import { useAccountContext } from "@/components/providers/account-provider";
import { usePrivy } from "@privy-io/react-auth";

const twoSeconds = 2000;

export const useBalance = (symbol: string) => {
    const { ready, user } = usePrivy();
    const address = user?.wallet?.address
    console.log('add', address);
    const { data, isLoading, error } = useQuery({
        queryKey: ['balance', symbol],
        queryFn: () => fetch(`/api/balance?symbol=${symbol}&address=${address}`).then(res => res.json()),
        refetchInterval: twoSeconds,
        enabled: !!address && address.length > 1,
    });
    const availableBalance = data?.availableBalance;
    return { availableBalance, isLoading, error };
}