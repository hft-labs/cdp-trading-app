import { db } from './index';
import { accounts, tokens, token_balances, balance_history } from './schema';
import { subDays } from 'date-fns';

const mockUsers = [
  { id: 'user_001', wallet: '0xA0f307ac2Dc9ddCFEA03Fb2b8945d21a4A81C9c5' },
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
];

// Generate simple price data
const generatePriceData = (basePrice: number, days: number) => {
  const prices = [];
  let currentPrice = basePrice;
  
  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.5) * 0.05; // ±2.5%
    currentPrice = currentPrice * (1 + change);
    prices.push(Math.max(currentPrice, 0.01));
  }
  
  return prices;
};

// Generate simple balance data
const generateBalanceData = (baseBalance: number, days: number) => {
  const balances = [];
  let currentBalance = baseBalance;
  
  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.5) * 0.01; // ±0.5%
    currentBalance = currentBalance * (1 + change);
    balances.push(Math.max(currentBalance, 0));
  }
  
  return balances;
};

async function quickSeedDatabase() {
  console.log('🌱 Starting quick database seeding...');

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

    // Generate 7 days of historical data
    const days = 7;
    const today = new Date();
    
    console.log('📊 Generating historical balance data...');
    
    for (const account of insertedAccounts) {
      for (const token of insertedTokens) {
        // Generate realistic base balances
        let baseBalance = 0;
        if (token.symbol === 'USDC') {
          baseBalance = 5000 + Math.random() * 2000; // $5k-$7k USDC
        } else if (token.symbol === 'ETH') {
          baseBalance = 2 + Math.random() * 3; // 2-5 ETH
        }

        // Generate price data
        let basePrice = 1;
        if (token.symbol === 'ETH') {
          basePrice = 3000 + Math.random() * 500; // $3k-$3.5k
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

        await db.insert(balance_history).values(historyRecords);
      }
    }

    console.log('✅ Quick database seeding completed successfully!');
    console.log('\n📈 Generated data includes:');
    console.log(`   - ${insertedAccounts.length} user accounts`);
    console.log(`   - ${insertedTokens.length} tokens`);
    console.log(`   - ${days} days of historical data`);
    console.log(`   - Current balances for all users`);
    
    console.log('\n🧪 Test the system with:');
    console.log('   - GET /api/balance-history?address=0xA0f307ac2Dc9ddCFEA03Fb2b8945d21a4A81C9c5');
    console.log('   - The BalanceChart component should now show real data');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  quickSeedDatabase()
    .then(() => {
      console.log('🎉 Quick seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Quick seeding failed:', error);
      process.exit(1);
    });
}

export { quickSeedDatabase }; 