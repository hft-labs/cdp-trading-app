import { useQuery } from "@tanstack/react-query";

export interface Transaction {
    hash: string;
    timestamp: string;
    type: 'swap' | 'transfer' | 'deposit' | 'withdrawal';
    from: string;
    to: string;
    value: string;
    asset: string;
    status: 'pending' | 'confirmed' | 'failed';
    blockNumber?: string;
    gasUsed?: string;
    network: string;
}

export interface TransactionsData {
    transactions: Transaction[];
}

export const useTransactions = (address: string | null, network: string = 'base', limit: number = 50) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['transactions', address, network, limit],
        queryFn: async (): Promise<TransactionsData> => {
            if (!address) {
                throw new Error("Address is required");
            }
            const response = await fetch(`/api/transactions?address=${address}&network=${network}&limit=${limit}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        },
        enabled: !!address,
        refetchInterval: 10000, // Refetch every 10 seconds
    });

    return {
        transactions: data?.transactions || [],
        isLoading,
        error,
    };
}; 