import { db } from './index';
import { sql } from 'drizzle-orm';
import { accounts, tokens, token_balances, balance_history, transactions } from './schema';

const resetDatabase = async () => {
  try {
    console.log('🔄 Starting database reset...');

    // Drop all tables in the correct order (respecting foreign key constraints)
    console.log('🗑️ Dropping existing tables...');
    await db.execute(sql`DROP TABLE IF EXISTS "balance_history" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "token_balances" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "transactions" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "accounts" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "tokens" CASCADE`);

    console.log('✅ Tables dropped successfully');

    // Run migrations to recreate tables
    console.log('🏗️ Running migrations...');
    const { migrate } = await import('drizzle-orm/neon-http/migrator');
    const path = await import('node:path');
    const migrationsFolder = path.join(process.cwd(), 'src', 'app', 'db', 'migrations');
    await migrate(db, { migrationsFolder });

    console.log('✅ Migrations completed');

    // Seed with sample data
    console.log('🌱 Seeding database with sample data...');

    // Insert sample tokens
    const sampleTokens = await db.insert(tokens).values([
      {
        symbol: 'USDC',
        name: 'USD Coin',
        contract_address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        decimals: 6,
        network: 'base',
        image_url: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
        is_active: true
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        contract_address: '0x4200000000000000000000000000000000000006',
        decimals: 18,
        network: 'base',
        image_url: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png',
        is_active: true
      },
      {
        symbol: 'WETH',
        name: 'Wrapped Ethereum',
        contract_address: '0x4200000000000000000000000000000000000006',
        decimals: 18,
        network: 'base',
        image_url: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png',
        is_active: true
      }
    ]).returning();

    console.log('✅ Tokens seeded');

    // Insert sample accounts
    const sampleAccounts = await db.insert(accounts).values([
      {
        user_id: 'demo-user-1',
        wallet_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        network: 'base',
        is_active: true
      },
      {
        user_id: 'demo-user-2',
        wallet_address: '0x8ba1f109551bD432803012645Hac136c22C177e9',
        network: 'base',
        is_active: true
      }
    ]).returning();

    console.log('✅ Accounts seeded');

    // Insert sample token balances
    await db.insert(token_balances).values([
      {
        account_id: sampleAccounts[0].id,
        token_id: sampleTokens[0].id, // USDC
        balance_amount: '1000.000000',
        balance_usd: '1000.00',
        token_price_usd: '1.00'
      },
      {
        account_id: sampleAccounts[0].id,
        token_id: sampleTokens[1].id, // ETH
        balance_amount: '2.500000000000000000',
        balance_usd: '7500.00',
        token_price_usd: '3000.00'
      },
      {
        account_id: sampleAccounts[1].id,
        token_id: sampleTokens[0].id, // USDC
        balance_amount: '500.000000',
        balance_usd: '500.00',
        token_price_usd: '1.00'
      }
    ]);

    console.log('✅ Token balances seeded');

    // Insert sample transactions
    await db.insert(transactions).values([
      {
        transaction_type: 'buy',
        description: 'Bought USDC',
        value_usd: '1000.00',
        asset_amount: '1000.000000',
        asset_symbol: 'USDC',
        wallet_address: sampleAccounts[0].wallet_address,
        transaction_hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        block_number: '12345678',
        gas_fee: '0.001000000000000000',
        gas_fee_usd: '3.00',
        user_id: sampleAccounts[0].user_id,
        network: 'base',
        is_successful: true
      },
      {
        transaction_type: 'swap',
        description: 'Swapped ETH for USDC',
        value_usd: '500.00',
        asset_amount: '0.166666666666666667',
        asset_symbol: 'ETH',
        wallet_address: sampleAccounts[0].wallet_address,
        transaction_hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        block_number: '12345679',
        gas_fee: '0.002000000000000000',
        gas_fee_usd: '6.00',
        user_id: sampleAccounts[0].user_id,
        network: 'base',
        is_successful: true
      },
      {
        transaction_type: 'transfer',
        description: 'Sent USDC to friend',
        value_usd: '100.00',
        asset_amount: '100.000000',
        asset_symbol: 'USDC',
        wallet_address: sampleAccounts[1].wallet_address,
        counterparty_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        transaction_hash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
        block_number: '12345680',
        gas_fee: '0.000500000000000000',
        gas_fee_usd: '1.50',
        user_id: sampleAccounts[1].user_id,
        network: 'base',
        is_successful: true
      }
    ]);

    console.log('✅ Transactions seeded');

    // Insert sample balance history
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    await db.insert(balance_history).values([
      {
        account_id: sampleAccounts[0].id,
        token_id: sampleTokens[0].id, // USDC
        balance_amount: '1000.000000',
        balance_usd: '1000.00',
        token_price_usd: '1.00',
        recorded_at: twoHoursAgo
      },
      {
        account_id: sampleAccounts[0].id,
        token_id: sampleTokens[0].id, // USDC
        balance_amount: '1100.000000',
        balance_usd: '1100.00',
        token_price_usd: '1.00',
        recorded_at: oneHourAgo
      },
      {
        account_id: sampleAccounts[0].id,
        token_id: sampleTokens[0].id, // USDC
        balance_amount: '1000.000000',
        balance_usd: '1000.00',
        token_price_usd: '1.00',
        recorded_at: now
      },
      {
        account_id: sampleAccounts[0].id,
        token_id: sampleTokens[1].id, // ETH
        balance_amount: '2.500000000000000000',
        balance_usd: '7500.00',
        token_price_usd: '3000.00',
        recorded_at: now
      }
    ]);

    console.log('✅ Balance history seeded');

    console.log('🎉 Database reset and seeding completed successfully!');
    console.log(`📊 Created ${sampleTokens.length} tokens, ${sampleAccounts.length} accounts, and sample data`);

  } catch (error) {
    console.error('❌ Error during database reset:', error);
    process.exit(1);
  }
};

resetDatabase(); 