# Balance Chart Setup

## Overview

The `BalanceChart` component has been updated to use real database data instead of mock data. The component now fetches balance history from the database through the `/api/balance-history` endpoint.

## Database Setup

### Seeding the Database

The application includes two seed scripts:

1. **Full Seed** (30 days of data, 5 users, 5 tokens):
   ```bash
   npm run db:seed
   ```

2. **Quick Seed** (7 days of data, 1 user, 2 tokens):
   ```bash
   npm run db:quick-seed
   ```

### Test Wallet Addresses

After seeding, you can test with these wallet addresses:

- `0xA0f307ac2Dc9ddCFEA03Fb2b8945d21a4A81C9c5` (user_001 - your wallet)
- `0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6` (user_002)
- `0x8ba1f109551bD432803012645Hac136c772c3c7b` (user_003)
- `0x1234567890123456789012345678901234567890` (user_004)
- `0xabcdefabcdefabcdefabcdefabcdefabcdefabcd` (user_005)

## API Endpoint

### GET /api/balance-history

Fetches balance history for a specific wallet address.

**Parameters:**
- `address` (required): The wallet address to fetch balance history for

**Response:**
```json
{
  "data": [
    {
      "date": "2025-08-02",
      "value": 16724.93471744
    },
    {
      "date": "2025-08-03", 
      "value": 16977.36089893
    }
  ]
}
```

**Example:**
```bash
curl "http://localhost:3001/api/balance-history?address=0xA0f307ac2Dc9ddCFEA03Fb2b8945d21a4A81C9c5"
```

## Component Usage

The `BalanceChart` component automatically:

1. Uses the connected wallet address from `useEvmAddress()` if available
2. Falls back to your wallet address (`0xA0f307ac2Dc9ddCFEA03Fb2b8945d21a4A81C9c5`) for development/testing
3. Fetches real balance history from the database
4. Displays the data in a line chart with 24h change indicators

### Key Changes Made

1. **Removed Mock Data**: The component no longer generates fake data when API calls fail
2. **Real Database Integration**: Uses actual seeded data from the database
3. **Better Error Handling**: Shows appropriate messages when no data is found
4. **Your Wallet Address**: Uses your actual wallet address as the default test address

## Testing

1. Run the seed script: `npm run db:quick-seed`
2. Start the development server: `npm run dev`
3. Navigate to the dashboard to see the BalanceChart with real data
4. The chart will automatically use your wallet address (`0xA0f307ac2Dc9ddCFEA03Fb2b8945d21a4A81C9c5`)

## Production Usage

In production, the component will use the actual connected wallet address from `useEvmAddress()` and fetch real balance data for that address from the database. 