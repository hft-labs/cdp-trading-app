import { parseSwap } from "@0x/0x-parser"
import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { Redis } from '@upstash/redis';
import { runSQLQueryServer } from "@/lib/sql-api";  

// Initialize Redis (optional - will be undefined if not configured)
let redis: Redis | undefined;
try {
    redis = Redis.fromEnv();
} catch (error) {
    console.warn('Redis not configured, caching will be disabled');
}

const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.ALCHEMY_RPC_URL)
});

export async function GET(request: Request) {
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



    const sqlQuery = `
                SELECT DISTINCT transaction_hash
                FROM base.transactions 
                WHERE from_address = '${address.toLowerCase()}' OR to_address = '${address.toLowerCase()}'
                ORDER BY block_number DESC
                LIMIT ${limit}
            `;

    const response = await runSQLQueryServer(sqlQuery);
    hashes = response.result.map((row: any) => row.transaction_hash);

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
                // if (false) {
                //     const txCacheKey = `tx:${transactionHash}`;
                //     const cachedTx = await redis.get(txCacheKey);
                    
                //     if (cachedTx) {
                //         return cachedTx;
                //     }
                // }
                
                const data = await parseSwap({
                    publicClient: publicClient as any,
                    transactionHash: transactionHash as `0x${string}`,
                });
                
                if (data === null) {
                    return {
                        error: 'Transaction not found or reverted',
                        transactionHash: transactionHash,
                        type: 'error'
                    };
                }
                
                if (redis) {
                    const txCacheKey = `tx:${transactionHash}`;
                    await redis.setex(txCacheKey, 3600, data);
                }
                
                return {
                    ...data,
                    transactionHash: transactionHash,
                    type: 'parsed'
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

    // Count successful and failed transactions
    const successfulTransactions = parsedTransactions.filter(tx => tx.type === 'parsed');
    const failedTransactions = parsedTransactions.filter(tx => tx.type === 'error');

    const result = {
        total: hashes.length,
        parsed: successfulTransactions.length,
        failed: failedTransactions.length,
        transactions: successfulTransactions, // Only return successfully parsed transactions
        ...(address && { address, source: 'CDP SQL API' })
    };

    return NextResponse.json(result);
}