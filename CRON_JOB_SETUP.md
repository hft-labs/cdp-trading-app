# Cron Job Setup for Token Balance Updates

## Overview

This document explains how to set up a cron job that runs every hour to update token balances for all accounts in your database using the CDP SDK.

## API Endpoint

The cron job uses the following API endpoint:
- **URL**: `POST /api/cron/update-balances`
- **Authentication**: Requires Bearer token in Authorization header
- **Frequency**: Should run every hour

## What the Cron Job Does

1. **Fetches Active Accounts**: Gets all active accounts from the database
2. **Retrieves Token Balances**: Uses CDP SDK to get current token balances for each wallet
3. **Updates Database**: 
   - Creates new tokens if they don't exist
   - Updates or creates token balance records
   - Adds entries to balance history for tracking
4. **Logs Results**: Provides detailed logging of the update process

## Setup Instructions

### 1. Environment Variables

Make sure you have the following environment variables set in your `.env` file:

```bash
# CDP API Credentials
CDP_API_KEY_ID=your_api_key_id
CDP_API_KEY_SECRET=your_api_key_secret

# Database
DATABASE_URL=your_database_url

# Cron Job Secret (for authentication)
CRON_SECRET=your_secret_token_here
```

### 2. Cron Job Configuration

#### Option A: Using Vercel Cron Jobs (Recommended)

If you're deploying on Vercel, add this to your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/update-balances",
      "schedule": "0 * * * *"
    }
  ]
}
```

#### Option B: Using External Cron Service

You can use services like:
- **Cron-job.org**: Free cron job service
- **EasyCron**: Simple cron job service
- **SetCronJob**: Another free option

Configure the cron job with:
- **URL**: `https://your-domain.com/api/cron/update-balances`
- **Method**: POST
- **Headers**: 
  - `Authorization: Bearer your_cron_secret_here`
- **Schedule**: Every hour (`0 * * * *`)

#### Option C: Server Cron (Linux/Mac)

Add to your crontab (`crontab -e`):

```bash
# Update token balances every hour
0 * * * * curl -X POST https://your-domain.com/api/cron/update-balances \
  -H "Authorization: Bearer your_cron_secret_here"
```

### 3. Testing the Cron Job

You can test the cron job manually:

```bash
curl -X POST http://localhost:3002/api/cron/update-balances \
  -H "Authorization: Bearer your_cron_secret_here"
```

Expected response:
```json
{
  "success": true,
  "message": "Balance update completed",
  "results": [
    {
      "account": "0xA0f307ac2Dc9ddCFEA03Fb2b8945d21a4A81C9c5",
      "status": "success",
      "tokensUpdated": 3
    }
  ],
  "timestamp": "2025-01-08T12:00:00.000Z"
}
```

## Database Schema Requirements

The cron job requires the following tables to exist:
- `accounts` - User accounts with wallet addresses
- `tokens` - Token information (symbol, name, contract address, etc.)
- `token_balances` - Current token balances for each account
- `balance_history` - Historical balance data for charts

## Error Handling

The cron job includes comprehensive error handling:
- **Individual Account Errors**: If one account fails, others continue processing
- **Detailed Logging**: All operations are logged for debugging
- **Graceful Degradation**: Partial failures don't stop the entire process

## Monitoring

### Logs
Check your application logs for:
- `🔄 Starting hourly balance update...`
- `📊 Found X active accounts to update`
- `✅ Updated [TOKEN]: [AMOUNT] ($[VALUE])`
- `✅ Hourly balance update completed`

### Database Queries
Monitor these queries to verify the cron job is working:
```sql
-- Check recent balance updates
SELECT * FROM token_balances 
WHERE last_updated > NOW() - INTERVAL '2 hours'
ORDER BY last_updated DESC;

-- Check balance history
SELECT * FROM balance_history 
WHERE recorded_at > NOW() - INTERVAL '2 hours'
ORDER BY recorded_at DESC;
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify the `Authorization` header is set correctly
   - Check that the `CRON_SECRET` environment variable is set

2. **CDP API Errors**
   - Verify CDP API credentials are correct
   - Check API rate limits
   - Ensure wallet addresses are valid

3. **Database Errors**
   - Verify database connection
   - Check that all required tables exist
   - Ensure proper database permissions

### Debug Mode

To enable debug logging, set the environment variable:
```bash
DEBUG=true
```

## Security Considerations

1. **Cron Secret**: Use a strong, unique secret for cron job authentication
2. **Rate Limiting**: Consider implementing rate limiting on the endpoint
3. **IP Whitelisting**: If possible, whitelist the cron job service IP addresses
4. **Monitoring**: Set up alerts for cron job failures

## Performance Optimization

1. **Batch Processing**: For large numbers of accounts, consider batching
2. **Concurrent Processing**: Process multiple accounts simultaneously
3. **Caching**: Cache token information to reduce API calls
4. **Database Indexing**: Ensure proper indexes on frequently queried columns

## Next Steps

1. Set up the cron job using one of the methods above
2. Test the endpoint manually
3. Monitor the logs to ensure it's working correctly
4. Set up alerts for failures
5. Consider implementing price fetching for more accurate USD values 