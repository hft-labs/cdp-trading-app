# Scripts

This directory contains utility scripts for the CDP Trading App.

## Setup Server Wallet

The `setup-server-wallet.ts` script creates a default server wallet for your application using the CDP SDK.

### Prerequisites

1. Make sure you have the required environment variables set in your `.env` file:
   ```
   CDP_API_KEY_ID=your_api_key_id
   CDP_API_KEY_SECRET=your_api_key_secret
   CDP_WALLET_SECRET=your_wallet_secret
   ```

2. Ensure you have the CDP SDK installed:
   ```bash
   pnpm install @coinbase/cdp-sdk
   ```

### Usage

Run the script using npm/pnpm:

```bash
pnpm run setup-wallet
```

Or run it directly with bun:

```bash
bun run scripts/setup-server-wallet.ts
```

### What it does

1. Creates a named account called "ServerWallet" using the CDP SDK
2. Displays the wallet address and name
3. Checks and displays token balances for the wallet on Base Sepolia network
4. Provides a summary of the setup

### Output Example

```
🚀 Setting up default server wallet...
📋 Creating default server wallet...
✅ Server wallet created successfully!
📍 Address: 0x1234567890123456789012345678901234567890
🏷️  Name: ServerWallet
💰 Checking account balances...
📊 Found 2 token balances
  - 0x0000000000000000000000000000000000000000: 0.1 (18 decimals)
  - 0x1234567890123456789012345678901234567890: 100 (6 decimals)

🎉 Server wallet setup complete!
💡 You can now use this wallet for server-side operations.
```

### Notes

- The script uses Base Sepolia testnet by default for checking balances
- The wallet will be created with the name "ServerWallet" - you can modify this in the script if needed
- If an account with the same name already exists, it will be retrieved instead of creating a new one 