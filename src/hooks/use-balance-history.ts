import { useQuery } from '@tanstack/react-query';
import { useIsInitialized, useEvmAddress } from '@coinbase/cdp-hooks';

interface BalanceHistoryPoint {
  date: string;
  value: number;
}

interface BalanceHistoryResponse {
  data: BalanceHistoryPoint[];
}

const fetchBalanceHistory: (address: string) => Promise<BalanceHistoryPoint[]> = async (address) => {


  const response = await fetch(`/api/balance-history?address=${address}`);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const result: BalanceHistoryResponse = await response.json();
  return result.data || [];
};

export function useBalanceHistory() {
  const { isInitialized } = useIsInitialized();
   const { evmAddress } = useEvmAddress();

  return useQuery({
    queryKey: ['balance-history', evmAddress],
    queryFn: () => fetchBalanceHistory(evmAddress!),
    enabled: !!evmAddress && isInitialized && false,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
} 