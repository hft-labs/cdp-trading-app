import { useQuery } from "@tanstack/react-query";
import { runSQLQuery } from "@/lib/sql-api";

export interface SQLTransaction {
    hash: string;
    timestamp: string;
    type: 'swap' | 'transfer' | 'deposit' | 'withdrawal';
    from: string;
    to: string;
    value: string;
    asset: string;
    status: 'confirmed' | 'pending' | 'failed';
    blockNumber: string;
    gasUsed: string;
    network: string;
    contractAddress?: string;
    tokenSymbol?: string;
    tokenDecimals?: number;
}

export interface SQLTransactionsData {
    transactions: SQLTransaction[];
}

// Fallback function to get transactions from the existing API
async function getFallbackTransactions(address: string, limit: number): Promise<SQLTransactionsData> {
    try {
        const response = await fetch(`/api/transactions?address=${address}&network=base&limit=${limit}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Transform the existing transaction format to match our interface
        const transactions: SQLTransaction[] = data.transactions.map((tx: any) => ({
            hash: tx.hash,
            timestamp: tx.timestamp,
            type: tx.type,
            from: tx.from,
            to: tx.to,
            value: tx.value,
            asset: tx.asset,
            status: tx.status,
            blockNumber: tx.blockNumber || '0',
            gasUsed: tx.gasUsed || '0',
            network: tx.network,
            contractAddress: tx.contractAddress,
            tokenSymbol: tx.tokenSymbol,
            tokenDecimals: tx.tokenDecimals,
        }));
        
        return { transactions };
    } catch (error) {
        console.error('Fallback API Error:', error);
        return { transactions: [] };
    }
}

export const useSQLTransactions = (address: string | null, limit: number = 50) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['sql-transactions', address, limit],
        queryFn: async (): Promise<SQLTransactionsData> => {
            if (!address) {
                throw new Error("Address is required");
            }

            // Try SQL API first
            try {
                // Enhanced query with timestamps and address filtering
                const sqlQuery = `
                    SELECT 
                        t.transaction_hash,
                        t.block_number,
                        t.from_address,
                        t.to_address,
                        t.value,
                        b.timestamp
                    FROM base.transactions t
                    JOIN base.blocks b ON t.block_number = b.block_number
                    WHERE t.from_address = '${address.toLowerCase()}' OR t.to_address = '${address.toLowerCase()}'
                    ORDER BY b.timestamp DESC
                    LIMIT ${limit}
                `;

                const response = await runSQLQuery(sqlQuery);

                // Transform the response to match our interface
                const transactions: SQLTransaction[] = response.result.map((row: any) => {
                    // Determine transaction type based on address involvement
                    let type: 'deposit' | 'withdrawal' | 'transfer' = 'transfer';
                    if (row.from_address === address.toLowerCase()) {
                        type = 'withdrawal';
                    } else if (row.to_address === address.toLowerCase()) {
                        type = 'deposit';
                    }

                    return {
                        hash: row.transaction_hash,
                        timestamp: row.timestamp || new Date().toISOString(),
                        type,
                        from: row.from_address,
                        to: row.to_address,
                        value: row.value || '0',
                        asset: 'ETH',
                        status: 'confirmed' as const,
                        blockNumber: row.block_number,
                        gasUsed: '0', // Default value
                        network: 'base',
                        contractAddress: undefined,
                        tokenSymbol: undefined,
                        tokenDecimals: undefined,
                    };
                });

                return { transactions };
            } catch (sqlError) {
                console.warn('SQL API failed, using fallback:', sqlError);
                
                // Fallback to existing transaction API
                return await getFallbackTransactions(address, limit);
            }
        },
        enabled: !!address,
        refetchInterval: 30000, // Refetch every 30 seconds
        staleTime: 10000, // Consider data stale after 10 seconds
    });

    return {
        transactions: data?.transactions || [],
        isLoading,
        error,
    };
}; 