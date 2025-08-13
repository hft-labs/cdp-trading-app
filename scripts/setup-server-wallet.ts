#!/usr/bin/env tsx

import { CdpClient } from "@coinbase/cdp-sdk";
import "dotenv/config";

async function setupServerWallet() {
  try {
    console.log("🚀 Setting up default server wallet...");
    
    // Initialize CDP client
    const cdp = new CdpClient({
      apiKeyId: process.env.CDP_API_KEY_ID,
      apiKeySecret: process.env.CDP_API_KEY_SECRET,
      walletSecret: process.env.CDP_WALLET_SECRET
    });

    // Check if environment variables are set
    if (!process.env.CDP_API_KEY_ID || !process.env.CDP_API_KEY_SECRET) {
      throw new Error("CDP_API_KEY_ID and CDP_API_KEY_SECRET environment variables are required");
    }

    console.log("📋 Creating default server wallet...");
    
    // Create a named account for the server wallet
    const serverWallet = await cdp.evm.getOrCreateAccount({
      name: "ServerWallet"
    });

    console.log("✅ Server wallet created successfully!");
    console.log(`📍 Address: ${serverWallet.address}`);
    console.log(`🏷️  Name: ${serverWallet.name}`);

    // Get token balances for the account
    console.log("💰 Checking account balances...");
    const balanceResult = await cdp.evm.listTokenBalances({
      address: serverWallet.address,
      network: "base"
    });
    
    console.log(`📊 Found ${balanceResult.balances.length} token balances`);
    for (const balance of balanceResult.balances) {
      console.log(`  - ${balance.token.contractAddress}: ${balance.amount.amount} (${balance.amount.decimals} decimals)`);
    }
    
    console.log("\n🎉 Server wallet setup complete!");
    console.log("💡 You can now use this wallet for server-side operations.");
    
    return serverWallet;
  } catch (error) {
    console.error("❌ Error setting up server wallet:", error);
    process.exit(1);
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupServerWallet();
}

export { setupServerWallet }; 