import { useQuery } from "@tanstack/react-query";

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
    swapDetails?: {
        inputToken: string;
        outputToken: string;
        inputAmount: string;
        outputAmount: string;
        inputSymbol?: string;
        outputSymbol?: string;
        inputDecimals?: number;
        outputDecimals?: number;
        description?: string;
    };
}

export interface SQLTransactionsData {
    transactions: SQLTransaction[];
}

// Function to fetch transactions from the parsed API
async function getParsedTransactions(address: string, limit: number): Promise<SQLTransactionsData> {
    try {
        const response = await fetch(`/api/transactions-parsed?address=${address}&network=base&limit=${limit}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Transform the parsed transaction data to match our interface
        const transactions: SQLTransaction[] = data.transactions.map((tx: any) => {
            // Handle different transaction formats from the parsed API
            if (tx.error || tx.type === 'error') {
                // Skip transactions that failed to parse
                return null;
            }

            // Extract basic transaction info
            const hash = tx.transactionHash || tx.hash;
            // Convert block timestamp (seconds since epoch) to ISO string
            const timestamp = tx.blockTimestamp ? 
                new Date(parseInt(tx.blockTimestamp) * 1000).toISOString() : 
                new Date().toISOString();
            
            // Determine transaction type based on parsed data
            let type: 'swap' | 'transfer' | 'deposit' | 'withdrawal' = 'transfer';
            if (tx.type === 'swap' || tx.swap || tx.tokenIn) {
                type = 'swap';
            } else if (tx.type === 'transfer') {
                type = 'transfer';
            }

            // Extract swap details if available
            let swapDetails = undefined;
            if (type === 'swap' && (tx.swap || tx.tokenIn)) {
                // Handle both old format (tx.swap) and new format (tx.tokenIn/tokenOut)
                if (tx.tokenIn && tx.tokenOut) {
                    // New format from 0x parser
                    swapDetails = {
                        inputToken: tx.tokenIn.address || '',
                        outputToken: tx.tokenOut.address || '',
                        inputAmount: tx.tokenIn.amount || '0',
                        outputAmount: tx.tokenOut.amount || '0',
                        inputSymbol: tx.tokenIn.symbol,
                        outputSymbol: tx.tokenOut.symbol,
                        inputDecimals: undefined,
                        outputDecimals: undefined,
                        description: `Swap ${tx.tokenIn.amount || '0'} ${tx.tokenIn.symbol || 'tokens'} for ${tx.tokenOut.amount || '0'} ${tx.tokenOut.symbol || 'tokens'}`
                    };
                } else if (tx.swap) {
                    // Old format
                    swapDetails = {
                        inputToken: tx.swap.inputToken || '',
                        outputToken: tx.swap.outputToken || '',
                        inputAmount: tx.swap.inputAmount || '0',
                        outputAmount: tx.swap.outputAmount || '0',
                        inputSymbol: tx.swap.inputSymbol,
                        outputSymbol: tx.swap.outputSymbol,
                        inputDecimals: tx.swap.inputDecimals,
                        outputDecimals: tx.swap.outputDecimals,
                        description: `Swap ${tx.swap.inputAmount || '0'} ${tx.swap.inputSymbol || 'tokens'} for ${tx.swap.outputAmount || '0'} ${tx.swap.outputSymbol || 'tokens'}`
                    };
                }
            }

            return {
                hash,
                timestamp,
                type,
                from: tx.from || '',
                to: tx.to || '',
                value: tx.value || '0',
                asset: tx.asset || 'ETH',
                status: 'confirmed' as const,
                blockNumber: tx.blockNumber || '0',
                gasUsed: tx.gasUsed || '0',
                network: 'base',
                contractAddress: tx.contractAddress,
                tokenSymbol: tx.tokenSymbol,
                tokenDecimals: tx.tokenDecimals,
                swapDetails,
            };
        }).filter(Boolean); // Remove null entries

        console.log(`Successfully parsed ${transactions.length} out of ${data.total} transactions (${data.failed} failed)`);
        
        // Debug timestamps
        transactions.forEach((tx, index) => {
            console.log(`Transaction ${index + 1} timestamp:`, {
                original: tx.timestamp,
                date: new Date(tx.timestamp),
                formatted: new Date(tx.timestamp).toLocaleString()
            });
        });
        
        return { transactions };
    } catch (error) {
        console.error('Parsed API Error:', error);
        throw error;
    }
}

export const useSQLTransactions = (address: string | null, limit: number = 50) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['sql-transactions', address, limit],
        queryFn: async (): Promise<SQLTransactionsData> => {
            if (!address) {
                throw new Error("Address is required");
            }

            console.log('Fetching transactions from parsed API...');
            return await getParsedTransactions(address, limit);
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