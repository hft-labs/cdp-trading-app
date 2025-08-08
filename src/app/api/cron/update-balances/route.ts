import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db';
import { accounts, tokens, token_balances, balance_history } from '@/app/db/schema';
import { eq, and } from 'drizzle-orm';
import { CdpClient } from '@coinbase/cdp-sdk';
import { getPrice } from '@/lib/price';

// Initialize CDP client
const cdp = new CdpClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting hourly balance update...');
    
    // Verify this is a cron job request (you can add authentication here)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Missing or invalid authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // For now, accept any Bearer token (you should implement proper validation)
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      console.log('❌ Empty Bearer token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active accounts
    const activeAccounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.is_active, true));

    console.log(`📊 Found ${activeAccounts.length} active accounts to update`);

    const updateResults = [];

    for (const account of activeAccounts) {
      try {
        console.log(`🔄 Updating balances for account: ${account.wallet_address}`);
        
        // Get token balances from CDP SDK
        const result = await cdp.evm.listTokenBalances({
          address: account.wallet_address as `0x${string}`,
          network: 'base',
        });

        // Process each token balance
        for (const balance of result.balances) {
          const tokenAddress = balance.token.contractAddress;
          const amount = balance.amount.amount;
          const decimals = balance.amount.decimals;
          const readableAmount = Number(amount) / Math.pow(10, decimals);

          // Check if token exists in our database, if not create it
          let token = await db
            .select()
            .from(tokens)
            .where(eq(tokens.contract_address, tokenAddress));

          if (token.length === 0) {
            // Create new token record
            const newToken = await db.insert(tokens).values({
              symbol: balance.token.symbol,
              name: balance.token.name || balance.token.symbol, // Fallback to symbol if name is null
              contract_address: tokenAddress,
              decimals: decimals,
              network: 'base',
              is_active: true
            } as any).returning();
            token = newToken;
          }

          const tokenId = token[0].id;

          // Skip tokens with zero balance
          if (readableAmount === 0) {
            console.log(`  ⏭️ Skipping ${balance.token.symbol}: zero balance`);
            continue;
          }

          // Get real price using the price method
          let priceUsd = 1; // Default for stablecoins
          try {
            if (balance.token.symbol && balance.token.symbol !== 'USDC' && balance.token.symbol !== 'USDbC') {
              priceUsd = await getPrice(balance.token.symbol);
              console.log(`  💰 ${balance.token.symbol} price: $${priceUsd}`);
            }
          } catch (error) {
            console.log(`  ⚠️ Could not get price for ${balance.token.symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            continue; // Skip tokens we can't price
          }

          const balanceUsd = readableAmount * priceUsd;

          // Update or create token balance record
          const existingBalance = await db
            .select()
            .from(token_balances)
            .where(and(
              eq(token_balances.account_id, account.id),
              eq(token_balances.token_id, tokenId)
            ));

          if (existingBalance.length > 0) {
            // Update existing balance
            await db
              .update(token_balances)
              .set({
                balance_amount: readableAmount.toString(),
                balance_usd: balanceUsd.toString(),
                token_price_usd: priceUsd.toString(),
                last_updated: new Date()
              })
              .where(eq(token_balances.id, existingBalance[0].id));
          } else {
            // Create new balance record
            await db.insert(token_balances).values({
              account_id: account.id,
              token_id: tokenId,
              balance_amount: readableAmount.toString(),
              balance_usd: balanceUsd.toString(),
              token_price_usd: priceUsd.toString(),
              last_updated: new Date()
            });
          }

          // Add to balance history
          await db.insert(balance_history).values({
            account_id: account.id,
            token_id: tokenId,
            balance_amount: readableAmount.toString(),
            balance_usd: balanceUsd.toString(),
            token_price_usd: priceUsd.toString(),
            recorded_at: new Date()
          });

          console.log(`  ✅ Updated ${balance.token.symbol}: ${readableAmount} @ $${priceUsd} = $${balanceUsd.toFixed(2)}`);
        }

        updateResults.push({
          account: account.wallet_address,
          status: 'success',
          tokensUpdated: result.balances.length
        });

      } catch (error) {
        console.error(`❌ Error updating account ${account.wallet_address}:`, error);
        updateResults.push({
          account: account.wallet_address,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log('✅ Hourly balance update completed');
    
    return NextResponse.json({
      success: true,
      message: 'Balance update completed',
      results: updateResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in balance update cron job:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 