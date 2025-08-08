import { db } from './index';
import { accounts, tokens, token_balances, balance_history } from './schema';
import { eq, and } from 'drizzle-orm';
import { CdpClient } from '@coinbase/cdp-sdk';

// Initialize CDP client
const cdp = new CdpClient();

const testCronJob = async () => {
  try {
    console.log('🧪 Testing cron job functionality...');
    
    // Get all active accounts
    const activeAccounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.is_active, true));

    console.log(`📊 Found ${activeAccounts.length} active accounts`);

    if (activeAccounts.length === 0) {
      console.log('⚠️ No active accounts found. Please add some accounts first.');
      return;
    }

    // Test with the first account
    const account = activeAccounts[0];
    console.log(`🔄 Testing with account: ${account.wallet_address}`);
    
    // Get token balances from CDP SDK
    const result = await cdp.evm.listTokenBalances({
      address: account.wallet_address as `0x${string}`,
      network: 'base',
    });

    console.log(`📈 Found ${result.balances.length} token balances`);

    // Display the balances
    result.balances.forEach((balance) => {
      const amount = balance.amount.amount;
      const decimals = balance.amount.decimals;
      const readableAmount = Number(amount) / Math.pow(10, decimals);
      
      console.log(`  ${balance.token.symbol}: ${readableAmount.toFixed(6)} (${balance.token.contractAddress})`);
    });

    console.log('✅ Test completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Set up your CDP API credentials in .env');
    console.log('2. Add your cron secret to .env');
    console.log('3. Deploy to Vercel or set up external cron service');
    console.log('4. Test the cron job endpoint manually');

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        console.log('\n💡 Make sure you have set up your CDP API credentials:');
        console.log('   CDP_API_KEY_ID=your_api_key_id');
        console.log('   CDP_API_KEY_SECRET=your_api_key_secret');
      }
    }
  }
};

testCronJob(); 