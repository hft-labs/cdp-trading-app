import { db } from './index';
import { accounts, tokens, token_balances, balance_history } from './schema';
import { addDays, subDays } from 'date-fns';

const mockUsers = [
  { id: 'user_001', wallet: '0xA0f307ac2Dc9ddCFEA03Fb2b8945d21a4A81C9c5' },
  { id: 'user_002', wallet: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6' },
  { id: 'user_003', wallet: '0x8ba1f109551bD432803012645Hac136c772c3c7b' },
  { id: 'user_004', wallet: '0x1234567890123456789012345678901234567890' },
  { id: 'user_005', wallet: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' },
];

const mockTokens = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    contract_address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    decimals: 6,
    image_url: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
  },
  {
    symbol: 'ETH',
    name: 'Ether',
    contract_address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    decimals: 18,
    image_url: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    contract_address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    decimals: 18,
    image_url: 'https://cryptologos.cc/logos/weth-logo.png'
  },
  {
    symbol: 'AERO',
    name: 'Aerodrome',
    contract_address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
    decimals: 18,
    image_url: 'https://cryptologos.cc/logos/aerodrome-aero-logo.png'
  },
  {
    symbol: 'USDbC',
    name: 'USD Base Coin',
    contract_address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
    decimals: 6,
    image_url: 'https://cryptologos.cc/logos/usd-base-coin-usdbc-logo.png'
  }
];

// Generate realistic price data with some volatility
const generatePriceData = (basePrice: number, days: number) => {
  const prices = [];
  let currentPrice = basePrice;
  
  for (let i = 0; i < days; i++) {
    // Add some random volatility (±5% daily change)
    const change = (Math.random() - 0.5) * 0.1; // ±5%
    currentPrice = currentPrice * (1 + change);
    prices.push(Math.max(currentPrice, 0.01)); // Ensure price doesn't go below 0.01
  }
  
  return prices;
};

// Generate balance data with realistic changes
const generateBalanceData = (baseBalance: number, days: number) => {
  const balances = [];
  let currentBalance = baseBalance;
  
  for (let i = 0; i < days; i++) {
    // Simulate some trading activity (small random changes)
    const change = (Math.random() - 0.5) * 0.02; // ±1% daily change
    currentBalance = currentBalance * (1 + change);
    balances.push(Math.max(currentBalance, 0)); // Ensure balance doesn't go negative
  }
  
  return balances;
};

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await db.delete(balance_history);
    await db.delete(token_balances);
    await db.delete(accounts);
    await db.delete(tokens);

    // Insert tokens
    console.log('🪙 Inserting tokens...');
    const insertedTokens = await db.insert(tokens).values(mockTokens).returning();
    console.log(`✅ Inserted ${insertedTokens.length} tokens`);

    // Insert accounts
    console.log('👤 Inserting accounts...');
    const insertedAccounts = await db.insert(accounts).values(
      mockUsers.map(user => ({
        user_id: user.id,
        wallet_address: user.wallet,
        network: 'base',
        is_active: true
      }))
    ).returning();
    console.log(`✅ Inserted ${insertedAccounts.length} accounts`);

    // Generate 30 days of historical data
    const days = 30;
    const today = new Date();
    
    console.log('📊 Generating historical balance data...');
    
    for (const account of insertedAccounts) {
      // Generate different token holdings for each user
      const userTokens = insertedTokens.slice(0, Math.floor(Math.random() * 3) + 2); // 2-4 tokens per user
      
      for (const token of userTokens) {
        // Generate realistic base balances
        let baseBalance = 0;
        if (token.symbol === 'USDC') {
          baseBalance = Math.random() * 10000 + 1000; // $1k-$11k USDC
        } else if (token.symbol === 'ETH') {
          baseBalance = Math.random() * 10 + 1; // 1-11 ETH
        } else if (token.symbol === 'WETH') {
          baseBalance = Math.random() * 5 + 0.5; // 0.5-5.5 WETH
        } else if (token.symbol === 'AERO') {
          baseBalance = Math.random() * 1000 + 100; // 100-1100 AERO
        } else {
          baseBalance = Math.random() * 5000 + 500; // Generic range
        }

        // Generate price data
        let basePrice = 1;
        if (token.symbol === 'ETH' || token.symbol === 'WETH') {
          basePrice = 3000 + Math.random() * 1000; // $3k-$4k
        } else if (token.symbol === 'AERO') {
          basePrice = 0.5 + Math.random() * 0.5; // $0.5-$1
        } else if (token.symbol === 'USDbC') {
          basePrice = 1; // Stablecoin
        }

        const prices = generatePriceData(basePrice, days);
        const balances = generateBalanceData(baseBalance, days);

        // Create current balance record
        const currentBalance = balances[balances.length - 1];
        const currentPrice = prices[prices.length - 1];
        const currentValue = currentBalance * currentPrice;

        await db.insert(token_balances).values({
          account_id: account.id,
          token_id: token.id,
          balance_amount: currentBalance.toString(),
          balance_usd: currentValue.toString(),
          token_price_usd: currentPrice.toString(),
          last_updated: today
        });

        // Create historical records
        const historyRecords = [];
        for (let i = 0; i < days; i++) {
          const date = subDays(today, days - 1 - i);
          const balance = balances[i];
          const price = prices[i];
          const value = balance * price;

          historyRecords.push({
            account_id: account.id,
            token_id: token.id,
            balance_amount: balance.toString(),
            balance_usd: value.toString(),
            token_price_usd: price.toString(),
            recorded_at: date
          });
        }

        // Insert historical data in batches
        const batchSize = 10;
        for (let i = 0; i < historyRecords.length; i += batchSize) {
          const batch = historyRecords.slice(i, i + batchSize);
          await db.insert(balance_history).values(batch);
        }
      }
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📈 Generated data includes:');
    console.log(`   - ${insertedAccounts.length} user accounts`);
    console.log(`   - ${insertedTokens.length} tokens`);
    console.log(`   - ${days} days of historical data`);
    console.log(`   - Current balances for all users`);
    
    console.log('\n🧪 Test the system with:');
    console.log('   - GET /api/balance/history?userId=user_001&days=30');
    console.log('   - POST /api/balance/update (with userId and walletAddress)');
    console.log('   - Use the BalanceChart component in your UI');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase }; 