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

export interface TransactionHistoryParams {
    address: string;
    network?: string;
    limit?: number;
    offset?: number;
}

export async function getTransactionHistory(params: TransactionHistoryParams): Promise<Transaction[]> {
    const { address, network = 'base', limit = 50, offset = 0 } = params;


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
            jsonrpc: '2.0',
            method: 'cdp_listAddressTransactions',
            params: [{
                address,
                pageSize: limit.toString(),
                pageToken: offset > 0 ? offset.toString() : '',
            }],
            id: 1,
        }),
    });

    if (!response.ok) {
        console.log(`CDP RPC Error: ${response.status} - ${response.statusText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(`CDP API error: ${data.error.message}`);
    }

    return transformCDPTransactions(data.result?.addressTransactions || [], network);

}

function transformCDPTransactions(cdpTransactions: any[], network: string): Transaction[] {
    return cdpTransactions.map((tx: any) => {
        const ethereum = tx.ethereum;
        return {
            hash: tx.hash,
            timestamp: ethereum?.blockTimestamp || new Date().toISOString(),
            type: determineTransactionType(tx),
            from: ethereum?.from || '',
            to: ethereum?.to || '',
            value: ethereum?.value || '0',
            asset: 'ETH',
            status: tx.status?.toLowerCase() === 'confirmed' ? 'confirmed' : 'pending',
            blockNumber: ethereum?.blockNumber,
            gasUsed: ethereum?.receipt?.gasUsed,
            network,
        };
    });
}

/**
 * Determine transaction type based on CDP transaction data
 */
function determineTransactionType(tx: any): Transaction['type'] {
    const ethereum = tx.ethereum;

    // Check for token transfers
    if (ethereum?.tokenTransfers && ethereum.tokenTransfers.length > 0) {
        return 'swap';
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