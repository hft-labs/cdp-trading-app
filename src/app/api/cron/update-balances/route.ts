import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { accounts, tokens, token_balances, balance_history } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { CdpClient } from '@coinbase/cdp-sdk';
import { getPrice } from '@/lib/price';
import { getTokenBySymbol } from '@/lib/tokens';

// Initialize CDP client
const cdp = new CdpClient();

interface TokenBalance {
    accountId: number;
    tokenId: number;
    amount: string;
    amountUsd: string;
    priceUsd: string;
    symbol: string;
}

interface ProcessedAccount {
    accountId: number;
    walletAddress: string;
    tokenBalances: TokenBalance[];
    totalValueUsd: number;
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new Response('Unauthorized', { status: 401 });
        }

        const startTime = Date.now();
        console.log('🚀 Starting balance update job...');

        // Fetch all active accounts
        const activeAccounts = await db
            .select()
            .from(accounts)
            .where(eq(accounts.is_active, true));

        if (activeAccounts.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No active accounts to process',
                results: []
            });
        }

        const allTokens = await db.select().from(tokens);
        const tokensByAddress = new Map(
            allTokens.map(token => [token.contract_address.toLowerCase(), token])
        );

        const BATCH_SIZE = 10;
        const processedAccounts: ProcessedAccount[] = [];
        
        for (let i = 0; i < activeAccounts.length; i += BATCH_SIZE) {
            const batch = activeAccounts.slice(i, i + BATCH_SIZE);
            const batchResults = await Promise.allSettled(
                batch.map(account => processAccount(account, tokensByAddress))
            );

            for (const result of batchResults) {
                if (result.status === 'fulfilled' && result.value) {
                    processedAccounts.push(result.value);
                }
            }
        }

        // Batch update database in a transaction
        await updateDatabaseInTransaction(processedAccounts);

        const executionTime = Date.now() - startTime;
        console.log(`✅ Balance update completed in ${executionTime}ms`);

        return NextResponse.json({
            success: true,
            message: 'Balance update completed',
            results: processedAccounts.map(acc => ({
                account: acc.walletAddress,
                status: 'success',
                tokensUpdated: acc.tokenBalances.length,
                totalValueUsd: acc.totalValueUsd
            })),
            executionTimeMs: executionTime,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error in balance update cron job:', error);
        return NextResponse.json(
            { 
                error: 'Internal server error', 
                details: error instanceof Error ? error.message : 'Unknown error' 
            },
            { status: 500 }
        );
    }
}

async function processAccount(
    account: any, 
    tokensByAddress: Map<string, any>
): Promise<ProcessedAccount | null> {
    try {
        console.log(`🔄 Processing account: ${account.wallet_address}`);

        const result = await cdp.evm.listTokenBalances({
            address: account.wallet_address as `0x${string}`,
            network: 'base',
        });

        const tokenBalances: TokenBalance[] = [];
        let totalValueUsd = 0;

        // Collect all token symbols for batch price fetching
        const tokenSymbols = new Set<string>();
        const validBalances = [];

        for (const balance of result.balances) {
            const tokenAddress = balance.token.contractAddress.toLowerCase();
            const amount = balance.amount.amount;
            const decimals = balance.amount.decimals;
            const readableAmount = Number(amount) / Math.pow(10, decimals);

            if (readableAmount === 0) continue;

            // Check if we know about this token
            if (!balance.token.symbol) continue;
            
            const knownToken = getTokenBySymbol(balance.token.symbol);
            if (!knownToken && !['USDC', 'USDbC'].includes(balance.token.symbol)) {
                console.log(`  ⏭️ Skipping unknown token: ${balance.token.symbol}`);
                continue;
            }

            let token = tokensByAddress.get(tokenAddress);
            if (!token) {
                // Create new token (this should be rare)
                const newTokens = await db.insert(tokens).values({
                    symbol: balance.token.symbol || 'UNKNOWN',
                    name: balance.token.name || balance.token.symbol || 'Unknown Token',
                    contract_address: tokenAddress,
                    decimals: decimals,
                    network: 'base',
                    is_active: true
                } as any).returning();
                token = newTokens[0];
                tokensByAddress.set(tokenAddress, token);
            }

            validBalances.push({
                balance,
                token,
                readableAmount
            });

            if (balance.token.symbol && !['USDC', 'USDbC'].includes(balance.token.symbol)) {
                tokenSymbols.add(balance.token.symbol);
            }
        }

        // Batch fetch prices
        const prices = await batchFetchPrices(Array.from(tokenSymbols));

        // Process balances with prices
        for (const { balance, token, readableAmount } of validBalances) {
            if (!balance.token.symbol) continue;
            
            const priceUsd = prices.get(balance.token.symbol) || 1;
            const balanceUsd = readableAmount * priceUsd;

            tokenBalances.push({
                accountId: account.id,
                tokenId: token.id,
                amount: readableAmount.toString(),
                amountUsd: balanceUsd.toString(),
                priceUsd: priceUsd.toString(),
                symbol: balance.token.symbol
            });

            totalValueUsd += balanceUsd;
        }

        return {
            accountId: account.id,
            walletAddress: account.wallet_address,
            tokenBalances,
            totalValueUsd
        };

    } catch (error) {
        console.error(`❌ Error processing account ${account.wallet_address}:`, error);
        return null;
    }
}

async function batchFetchPrices(symbols: string[]): Promise<Map<string, number>> {
    const prices = new Map<string, number>();
    
    // Process prices in parallel
    const pricePromises = symbols.map(async symbol => {
        try {
            const price = await getPrice(symbol);
            prices.set(symbol, price);
            console.log(`  💰 ${symbol}: $${price}`);
        } catch (error) {
            console.log(`  ⚠️ Could not get price for ${symbol}`);
        }
    });

    await Promise.allSettled(pricePromises);
    return prices;
}

async function updateDatabaseInTransaction(processedAccounts: ProcessedAccount[]) {
    // Note: Using direct DB operations since neon-http doesn't support transactions
    // TODO: Switch to neon-ws driver for transaction support
    const now = new Date();

        // Prepare batch operations
        const balanceUpdates: any[] = [];
        const balanceInserts: any[] = [];
        const historyInserts: any[] = [];

        // Get existing balances for all accounts/tokens
        const accountIds = processedAccounts.map(acc => acc.accountId);
        const existingBalances = await db
            .select()
            .from(token_balances)
            .where(inArray(token_balances.account_id, accountIds));

        const existingBalanceMap = new Map<string, any>();
        existingBalances.forEach((balance: any) => {
            const key = `${balance.account_id}-${balance.token_id}`;
            existingBalanceMap.set(key, balance);
        });

        // Process all accounts
        for (const account of processedAccounts) {
            for (const tokenBalance of account.tokenBalances) {
                const key = `${tokenBalance.accountId}-${tokenBalance.tokenId}`;
                const existing = existingBalanceMap.get(key);

                if (existing) {
                    balanceUpdates.push({
                        id: existing.id,
                        balance_amount: tokenBalance.amount,
                        balance_usd: tokenBalance.amountUsd,
                        token_price_usd: tokenBalance.priceUsd,
                        last_updated: now
                    });
                } else {
                    balanceInserts.push({
                        account_id: tokenBalance.accountId,
                        token_id: tokenBalance.tokenId,
                        balance_amount: tokenBalance.amount,
                        balance_usd: tokenBalance.amountUsd,
                        token_price_usd: tokenBalance.priceUsd,
                        last_updated: now
                    });
                }

                // Add to history
                historyInserts.push({
                    account_id: tokenBalance.accountId,
                    token_id: tokenBalance.tokenId,
                    balance_amount: tokenBalance.amount,
                    balance_usd: tokenBalance.amountUsd,
                    token_price_usd: tokenBalance.priceUsd,
                    recorded_at: now
                });
            }
        }

        // Execute batch operations
        if (balanceUpdates.length > 0) {
            for (const update of balanceUpdates) {
                await db.update(token_balances)
                    .set({
                        balance_amount: update.balance_amount,
                        balance_usd: update.balance_usd,
                        token_price_usd: update.token_price_usd,
                        last_updated: update.last_updated
                    })
                    .where(eq(token_balances.id, update.id));
            }
        }

        if (balanceInserts.length > 0) {
            await db.insert(token_balances).values(balanceInserts);
        }

        if (historyInserts.length > 0) {
            await db.insert(balance_history).values(historyInserts);
        }

        console.log(`📊 Database updated: ${balanceUpdates.length} updates, ${balanceInserts.length} inserts, ${historyInserts.length} history records`);
} 