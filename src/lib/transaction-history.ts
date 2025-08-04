import { getTokenInfo, formatTokenAmount, parseERC20Transfer } from './tokens';

export interface Transaction {
    hash: string;
    timestamp: string;
    type: 'swap' | 'transfer' | 'deposit' | 'withdrawal';
    from: string;
    to: string;
    value: string;
    asset: string;
    description: string;
    status: 'pending' | 'confirmed' | 'failed';
    blockNumber?: string;
    gasUsed?: string;
    network: string;
}

export interface TransactionHistoryParams {
    address: string;
    network?: string;
    limit?: number;
    offset?: number;
    pageToken?: string;
}

export async function getTransactionHistory(params: TransactionHistoryParams): Promise<Transaction[]> {
    const { address, network = 'base', limit = 50, offset = 0, pageToken = "" } = params;

    console.log("address", address);
    console.log("network", network);
    console.log("limit", limit);
    console.log("offset", offset);


    const rpcUrl = process.env.CDP_RPC_URL;
    if (!rpcUrl) {
        throw new Error('CDP_RPC_URL is not set');
    }
    const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "id": 1,
            jsonrpc: '2.0',
            method: 'cdp_listAddressTransactions',
            params: [{
                address: address,
                pageToken: pageToken,
                pageSize: 5,
            }],
        }),
    });

    if (!response.ok) {
        console.log(`CDP RPC Error: ${response.status} - ${response.statusText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("data", data);
    
    if (data.error) {
        throw new Error(`CDP API error: ${data.error.message}`);
    }

    return transformCDPTransactions(data.result?.addressTransactions || [], network);

}

function transformCDPTransactions(cdpTransactions: any[], network: string): Transaction[] {
    return cdpTransactions.map((tx: any) => {
        const ethereum = tx.ethereum;
        console.log("ethereum", tx);
        
        // Extract ERC20 transfer details
        const erc20Details = extractERC20TransferDetails(ethereum);
        
        // Create user-friendly description
        const description = createTransactionDescription(tx, erc20Details);
        
        return {
            hash: tx.hash,
            timestamp: ethereum?.blockTimestamp || new Date().toISOString(),
            type: determineTransactionType(tx),
            from: ethereum?.from || '',
            to: ethereum?.to || '',
            value: erc20Details?.amount || ethereum?.value || '0',
            asset: erc20Details?.symbol || (ethereum?.value !== '0' ? 'ETH' : 'ERC20'),
            description: description,
            status: tx.status?.toLowerCase() === 'confirmed' ? 'confirmed' : 'pending',
            blockNumber: ethereum?.blockNumber,
            gasUsed: ethereum?.receipt?.gasUsed,
            network,
        };
    });
}

/**
 * Create user-friendly transaction description
 */
function createTransactionDescription(tx: any, erc20Details: any): string {
    const ethereum = tx.ethereum;
    
    // Check if this is a deposit (from zero address)
    if (ethereum?.from === '0x0000000000000000000000000000000000000000') {
        if (erc20Details?.symbol) {
            return `Deposited ${erc20Details.amount} ${erc20Details.symbol}`;
        } else if (ethereum?.value && ethereum.value !== '0') {
            return `Deposited ${ethereum.value} ETH`;
        }
        return 'Deposited funds';
    }
    
    // Check if this is a withdrawal (to zero address)
    if (ethereum?.to === '0x0000000000000000000000000000000000000000') {
        if (erc20Details?.symbol) {
            return `Withdrew ${erc20Details.amount} ${erc20Details.symbol}`;
        } else if (ethereum?.value && ethereum.value !== '0') {
            return `Withdrew ${ethereum.value} ETH`;
        }
        return 'Withdrew funds';
    }
    
               // Check for specific token conversions
           if (erc20Details?.symbol) {
               const symbol = erc20Details.symbol.toUpperCase();
               
               // Only show specific names for known tokens
               if (symbol === 'USDC' || symbol === 'USDT') {
                   return `Converted to USD`;
               } else if (symbol === 'WETH' || symbol === 'ETH') {
                   return `Converted to ETH`;
               } else if (symbol === 'WBTC' || symbol === 'BTC') {
                   return `Converted to BTC`;
               } else if (symbol === 'TOKEN') {
                   return `Swapped tokens`;
               } else {
                   return `Converted to ${symbol}`;
               }
           }
    
    // Check for ETH transfers
    if (ethereum?.value && ethereum.value !== '0') {
        return 'Converted to ETH';
    }
    
    // Default fallback
    return 'Swapped tokens';
}

/**
 * Extract ERC20 transfer details from flattened traces
 */
function extractERC20TransferDetails(ethereum: any): { amount: string; symbol: string } | null {
    if (!ethereum?.flattenedTraces) return null;
    
    // Find ERC20 transfer traces
    const erc20Traces = ethereum.flattenedTraces.filter((trace: any) => 
        trace.input && trace.input.startsWith('0x23b872dd')
    );
    
    if (erc20Traces.length === 0) return null;
    
    // Parse the first ERC20 transfer
    const firstTrace = erc20Traces[0];
    console.log("Parsing trace:", firstTrace.input);
    const transferData = parseERC20Transfer(firstTrace.input);
    console.log("Parsed transfer data:", transferData);
    
    if (!transferData) {
        return {
            amount: '0',
            symbol: 'ERC20'
        };
    }
    
    // Get token info from the contract address (the 'to' address in the main transaction)
    const tokenInfo = getTokenInfo(ethereum.to);
    
    if (tokenInfo) {
        // Format the amount with proper decimals
        const formattedAmount = formatTokenAmount(transferData.amount, tokenInfo.decimals);
        return {
            amount: formattedAmount,
            symbol: tokenInfo.symbol
        };
    }
    
               return {
               amount: formatTokenAmount(transferData.amount, 18), // Default to 18 decimals for unknown tokens
               symbol: 'TOKEN' // Fallback for unknown tokens
           };
}

/**
 * Determine transaction type based on CDP transaction data
 */
function determineTransactionType(tx: any): Transaction['type'] {
    const ethereum = tx.ethereum;

    // Check for ERC20 transfers in flattened traces
    if (ethereum?.flattenedTraces) {
        const erc20Transfers = ethereum.flattenedTraces.filter((trace: any) => 
            trace.input && trace.input.startsWith('0x23b872dd') // transferFrom function
        );
        if (erc20Transfers.length > 0) {
            return 'swap';
        }
    }

    // Check for contract interactions (non-zero input data)
    if (ethereum?.input && ethereum.input !== '0x') {
        return 'swap';
    }

    // Check for native transfers
    if (ethereum?.value && ethereum.value !== '0') {
        if (ethereum.from === '0x0000000000000000000000000000000000000000') {
            return 'deposit';
        }
        if (ethereum.to === '0x0000000000000000000000000000000000000000') {
            return 'withdrawal';
        }
        return 'transfer';
    }

    return 'transfer';
}

/**
 * Mock transaction history for demo purposes
 */
function getMockTransactionHistory(address: string, network: string): Transaction[] {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    return [
        {
            hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            timestamp: new Date(now - oneHour).toISOString(),
            type: "swap",
            from: address,
            to: "0x4200000000000000000000000000000000000006", // WETH contract
            value: "1000.00",
            asset: "USDC",
            description: "Converted to USD",
            status: "confirmed",
            blockNumber: "12345678",
            gasUsed: "150000",
            network,
        },
        {
            hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            timestamp: new Date(now - 2 * oneHour).toISOString(),
            type: "deposit",
            from: "0x0000000000000000000000000000000000000000",
            to: address,
            value: "500.00",
            asset: "USDC",
            description: "Deposited funds",
            status: "confirmed",
            blockNumber: "12345675",
            gasUsed: "21000",
            network,
        },
        {
            hash: "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
            timestamp: new Date(now - 3 * oneHour).toISOString(),
            type: "swap",
            from: address,
            to: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed", // DEGEN contract
            value: "0.1",
            asset: "WETH",
            description: "Converted to ETH",
            status: "confirmed",
            blockNumber: "12345670",
            gasUsed: "180000",
            network,
        },
    ];
}

/**
 * Get transaction details using CDP SDK (if available)
 * Note: This is a placeholder for future CDP SDK functionality
 */
export async function getTransactionDetails(hash: string, network: string = 'base') {
    try {
        // Future: This might be available in CDP SDK
        // const transaction = await cdp.evm.getTransaction({ hash, network });
        // return transaction;

        // For now, we'll use a public RPC endpoint
        const response = await fetch(`https://mainnet.base.org`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_getTransactionByHash',
                params: [hash],
                id: 1,
            }),
        });

        const data = await response.json();
        return data.result;

    } catch (error) {
        console.error('Error fetching transaction details:', error);
        return null;
    }
} 