import { parseSwap } from "@0x/0x-parser"
import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { Redis } from '@upstash/redis';
import { runSQLQueryServer } from "@/lib/sql-api";
import { parseERC20Transfer, parseERC20Approval, getTokenInfo, formatTokenAmount } from "@/lib/tokens";  

const redis = Redis.fromEnv();
const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.ALCHEMY_RPC_URL)
});

export async function GET(request: Request) {
    const startTime = Date.now();
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const limit = parseInt(searchParams.get('limit') || '100');

    let hashes: string[] = [];

    if (!address) {
        return NextResponse.json({
            error: 'Address is required',
            details: 'Please provide an address to fetch transactions'
        }, { status: 400 });
    }
    const startBlock = 30000000;
    const fromAddressQuery = `
        SELECT transaction_hash, block_number
        FROM base.transactions 
        WHERE from_address = '${address.toLowerCase()}'
            AND block_number > ${startBlock}
        ORDER BY block_number DESC
        LIMIT ${limit}
    `;

    const toAddressQuery = `
        SELECT transaction_hash, block_number
        FROM base.transactions 
        WHERE to_address = '${address.toLowerCase()}'
            AND block_number > ${startBlock}
        ORDER BY block_number DESC
        LIMIT ${limit}
    `;

    const sqlStartTime = Date.now();
    
    const [fromResponse, toResponse] = await Promise.all([
        runSQLQueryServer(fromAddressQuery),
        runSQLQueryServer(toAddressQuery)
    ]);
    
    const sqlEndTime = Date.now();
    const sqlDuration = sqlEndTime - sqlStartTime;
    
    const fromResults = fromResponse.result || [];
    const toResults = toResponse.result || [];
    
    const allTransactions = [
        ...fromResults.map((row: any) => ({ ...row, source: 'from' })),
        ...toResults.map((row: any) => ({ ...row, source: 'to' }))
    ];
    
    const uniqueTransactions = allTransactions
        .filter((tx, index, self) => 
            index === self.findIndex(t => t.transaction_hash === tx.transaction_hash)
        )
        .sort((a, b) => parseInt(b.block_number) - parseInt(a.block_number))
        .slice(0, limit);
    
    hashes = uniqueTransactions.map((row: any) => row.transaction_hash);
    
    console.log(`SQL API took ${sqlDuration}ms to return ${hashes.length} transaction hashes (from: ${fromResults.length}, to: ${toResults.length})`);

    if (hashes.length === 0) {
        const emptyResult = {
            total: 0,
            parsed: 0,
            failed: 0,
            transactions: [],
            message: `No transactions found for address: ${address}`
        };
        
        return NextResponse.json(emptyResult);
    }

    const parsedTransactions = await Promise.all(
        hashes.map(async (transactionHash) => {
            try {
                // Check if individual transaction is cached (if Redis is available)
                if (redis) {
                    const txCacheKey = `tx:${transactionHash}`;
                    const cachedTx = await redis.get(txCacheKey);
                    
                    if (cachedTx) {
                        return cachedTx;
                    }
                }
                
                // Validate transaction hash format
                if (!transactionHash.startsWith('0x') || transactionHash.length !== 66) {
                    return {
                        error: 'Invalid transaction hash format',
                        transactionHash: transactionHash,
                        type: 'error'
                    };
                }
                
                // Get transaction details
                let tx;
                try {
                    tx = await publicClient.getTransaction({
                        hash: transactionHash as `0x${string}`
                    });
                } catch (txError) {
                    return {
                        error: 'Could not fetch transaction details',
                        transactionHash: transactionHash,
                        type: 'error'
                    };
                }
                
                // Get transaction receipt to get block number and timestamp
                const receipt = await publicClient.getTransactionReceipt({
                    hash: transactionHash as `0x${string}`
                });
                
                // Get block information to get timestamp
                const block = await publicClient.getBlock({
                    blockNumber: receipt.blockNumber
                });
                
                // Try to parse as a swap first
                try {
                    const swapData = await parseSwap({
                        publicClient: publicClient as any,
                        transactionHash: transactionHash as `0x${string}`,
                    });
                    
                    if (swapData !== null) {
                        if (redis) {
                            const txCacheKey = `tx:${transactionHash}`;
                            await redis.setex(txCacheKey, 3600, swapData);
                        }
                        
                        return {
                            ...swapData,
                            transactionHash: transactionHash,
                            blockNumber: receipt.blockNumber.toString(),
                            gasUsed: receipt.gasUsed.toString(),
                            blockTimestamp: block.timestamp.toString(),
                            type: 'swap'
                        };
                    }
                } catch (swapError) {
                    // Continue to other parsing methods if swap parsing fails
                }
                
                // Try to parse as ERC20 transfer
                const erc20Transfer = parseERC20Transfer(tx.input);
                if (erc20Transfer) {
                    const tokenInfo = getTokenInfo(tx.to!);
                    const formattedAmount = formatTokenAmount(erc20Transfer.amount, tokenInfo?.decimals || 18);
                    
                    // For regular transfer calls, the 'from' address is the transaction sender
                    const fromAddress = erc20Transfer.from || tx.from;
                    const isIncoming = erc20Transfer.to.toLowerCase() === address.toLowerCase();
                    
                    return {
                        transactionHash: transactionHash,
                        blockNumber: receipt.blockNumber.toString(),
                        gasUsed: receipt.gasUsed.toString(),
                        blockTimestamp: block.timestamp.toString(),
                        type: 'erc20_transfer',
                        asset: tokenInfo?.symbol || 'TOKEN',
                        tokenAddress: tx.to!,
                        tokenSymbol: tokenInfo?.symbol || 'TOKEN',
                        tokenName: tokenInfo?.name || 'Unknown Token',
                        from: fromAddress,
                        to: erc20Transfer.to,
                        amount: erc20Transfer.amount,
                        formattedAmount: formattedAmount,
                        direction: isIncoming ? 'in' : 'out',
                        description: isIncoming ? `Received ${formattedAmount} ${tokenInfo?.symbol || 'TOKEN'}` : `Sent ${formattedAmount} ${tokenInfo?.symbol || 'TOKEN'}`
                    };
                }
                
                // Try to parse as ERC20 approval
                const erc20Approval = parseERC20Approval(tx.input);
                if (erc20Approval) {
                    console.log(`ERC20 Approval - Contract Address: ${tx.to!}`);
                    const tokenInfo = getTokenInfo(tx.to!);
                    console.log(`Token Info:`, tokenInfo);
                    const formattedAmount = formatTokenAmount(erc20Approval.amount, tokenInfo?.decimals || 18);
                    
                    return {
                        transactionHash: transactionHash,
                        blockNumber: receipt.blockNumber.toString(),
                        gasUsed: receipt.gasUsed.toString(),
                        blockTimestamp: block.timestamp.toString(),
                        type: 'erc20_approval',
                        asset: tokenInfo?.symbol || 'TOKEN',
                        tokenAddress: tx.to!,
                        tokenSymbol: tokenInfo?.symbol || 'TOKEN',
                        tokenName: tokenInfo?.name || 'Unknown Token',
                        from: tx.from,
                        to: erc20Approval.spender,
                        amount: erc20Approval.amount,
                        formattedAmount: formattedAmount,
                        direction: 'out',
                        description: `Approved ${erc20Approval.spender.slice(0, 6)}...${erc20Approval.spender.slice(-4)} to spend ${tokenInfo?.symbol || 'TOKEN'}`
                    };
                }
                
                // Check for native token transfer (ETH)
                if (tx.value && tx.value > BigInt(0)) {
                    const formattedAmount = formatTokenAmount(tx.value.toString(), 18);
                    const isIncoming = tx.to!.toLowerCase() === address.toLowerCase();
                    
                    return {
                        transactionHash: transactionHash,
                        blockNumber: receipt.blockNumber.toString(),
                        gasUsed: receipt.gasUsed.toString(),
                        blockTimestamp: block.timestamp.toString(),
                        type: 'native_transfer',
                        asset: 'ETH',
                        tokenSymbol: 'ETH',
                        tokenName: 'Ethereum',
                        from: tx.from,
                        to: tx.to!,
                        amount: tx.value.toString(),
                        formattedAmount: formattedAmount,
                        direction: isIncoming ? 'in' : 'out',
                        description: isIncoming ? `Received ${formattedAmount} ETH` : `Sent ${formattedAmount} ETH`
                    };
                }
                
                // If we can't parse it as any known type, return as unknown
                return {
                    transactionHash: transactionHash,
                    blockNumber: receipt.blockNumber.toString(),
                    gasUsed: receipt.gasUsed.toString(),
                    blockTimestamp: block.timestamp.toString(),
                    type: 'unknown',
                    from: tx.from,
                    to: tx.to,
                    value: tx.value.toString(),
                    input: tx.input,
                    direction: tx.from.toLowerCase() === address.toLowerCase() ? 'out' : 'in'
                };
            } catch (error) {
                console.error(`Error parsing transaction ${transactionHash}:`, error);
                return {
                    error: error instanceof Error ? error.message : 'Unknown parsing error',
                    transactionHash: transactionHash,
                    type: 'error'
                };
            }
        })
    );

    // Count different types of transactions
    const successfulTransactions = parsedTransactions.filter((tx: any) => tx.type !== 'error');
    const failedTransactions = parsedTransactions.filter((tx: any) => tx.type === 'error');

    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    console.log(`Total API execution time: ${totalDuration}ms`);
    
    const result = {
        total: hashes.length,
        parsed: successfulTransactions.length,
        failed: failedTransactions.length,
        transactions: successfulTransactions,
    };

    return NextResponse.json(result);
}