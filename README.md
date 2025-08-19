# BYOC: Build Your Own Coinbase

> **🚀 A fully functional DEX-based trading app built entirely with Coinbase Developer Platform**

[![CDP SDK](https://img.shields.io/badge/CDP%20SDK-1.22.0-blue.svg)](https://docs.cdp.coinbase.com)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black.svg)](https://nextjs.org)
[![Base](https://img.shields.io/badge/Base-L2-orange.svg)](https://base.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🎯 Project Vision

**BYOC (Build Your Own Coinbase)** demonstrates the power and completeness of the Coinbase Developer Platform by showcasing a fully functional DEX-based trading app. It proves that developers can now build their own Coinbase-like experience using open, modular building blocks powered exclusively by CDP.

### Key Components
- **Embedded Wallets** – for user custody and key management
- **Onramp** – for fiat-to-crypto funding  
- **Swap API** – to trade assets on-chain
- **Balances API** – to show token holdings
- **Smart Accounts** – for gasless transactions
- **Wallet History API** – for analytics and historical data

## ✨ Features

### 🏠 **Dashboard Overview**
- Portfolio value tracking with 24h change
- Top assets display with real-time prices
- Quick action buttons for deposits and trading
- Responsive design with dark theme

### 💱 **Advanced Swap Interface**
- Real-time price quotes with rate display
- Token selection with popular Base tokens
- Slippage protection (1% default)
- Transaction status tracking
- Error handling and user feedback

### 📊 **Portfolio Management**
- Complete asset overview with balances
- Real-time price updates
- Value calculations in USD
- Historical balance tracking via CDP Wallet History API
- Performance analytics and trading metrics
- Empty state with deposit CTA

### 📜 **Transaction History**
- Complete transaction log with status
- Transaction type indicators (swap, deposit, withdrawal)
- Block explorer links
- Time-based sorting

### 💳 **Fiat On/Off Ramp**
- Seamless fiat-to-crypto deposits
- Crypto-to-fiat withdrawals
- Coinbase Pay integration
- Session token management

### 🔐 **Self-Custody Wallet**
- Embedded wallet creation
- Smart account deployment
- Gasless transaction support
- Secure key management

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Radix UI** - Accessible components

### Backend & Infrastructure
- **CDP SDK** - Coinbase Developer Platform integration
- **Stack Auth** - Authentication and user management
- **Drizzle ORM** - Database management
- **PostgreSQL** - Primary database
- **Base L2** - Ethereum L2 for transactions

### Key Libraries
- **Viem** - Ethereum interaction
- **Wagmi** - React hooks for Ethereum
- **Zod** - Schema validation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL database
- Coinbase Developer Platform account

### 1. Clone & Install
```bash
git clone https://github.com/your-username/byoc-trading-app.git
cd byoc-trading-app
pnpm install
```

### 2. Environment Setup
Create a `.env.local` file:
```env
# CDP Configuration
CDP_API_KEY_ID=your_cdp_api_key_id
CDP_API_KEY_SECRET=your_cdp_api_key_secret
CDP_WALLET_SECRET=your_cdp_wallet_secret

# Database
DATABASE_URL=your_postgresql_connection_string

# Stack Auth
STACK_APP_ID=your_stack_app_id
STACK_APP_SECRET=your_stack_app_secret

# Coinbase Pay
NEXT_PUBLIC_COINBASE_APP_ID=your_coinbase_app_id
NEXT_PUBLIC_APP_URL=http://localhost:3000

# RPC Endpoints
PAYMASTER_URL=your_base_rpc_url

# Redis Cache (Optional - for transaction caching)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

### 3. Database Setup
```bash
# Generate migrations
pnpm migrate

# Apply migrations
pnpm migrate:apply
```

### 4. Run Development Server
```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your BYOC app!

## 📱 App Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── page.tsx       # Main dashboard
│   │   ├── portfolio/     # Portfolio management
│   │   └── transactions/  # Transaction history
│   └── api/               # API routes
│       ├── swap/          # Swap functionality
│       ├── portfolio/     # Portfolio data
│       ├── quote/         # Price quotes
│       └── session/       # Auth sessions
├── components/            # React components
│   ├── swap/             # Swap interface
│   ├── ui/               # Reusable UI components
│   └── providers/        # Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
└── db/                   # Database schema & migrations
```

## 🔧 API Endpoints

### Swap Operations
- `POST /api/swap` - Execute token swaps
- `POST /api/quote` - Get swap quotes
- `GET /api/price?symbol=TOKEN` - Get token prices

### Portfolio Management
- `GET /api/portfolio?address=0x...` - Get portfolio data
- `GET /api/balance?symbol=TOKEN&address=0x...` - Get token balance

### Authentication
- `POST /api/session` - Generate session tokens
- `GET /api/session` - Validate sessions

### Transaction History
- `GET /api/transactions-parsed?address=0x...&limit=100` - Get parsed transaction history (individual transactions cached)

## ⚡ Performance Optimizations

### Redis Caching
The transaction parsing API includes intelligent Redis caching to improve performance:

- **Transaction-Level Caching**: Individual parsed transactions are cached for 1 hour
- **Graceful Degradation**: API works without Redis (caching disabled)

**Cache Keys**:
- `tx:{transactionHash}` - Individual transaction data

**Setup**: Add Upstash Redis environment variables to enable caching:
```env
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

## 🎨 UI/UX Features

### Modern Design
- **Dark Theme** - Professional trading interface
- **Responsive Layout** - Works on desktop and mobile
- **Loading States** - Smooth user experience
- **Error Handling** - Clear feedback for users

### Interactive Elements
- **Real-time Quotes** - Live price updates
- **Transaction Tracking** - Status indicators
- **Portfolio Charts** - Visual data representation
- **Quick Actions** - Streamlined workflows

## 🔐 Security Features

- **Self-Custody** - Users control their private keys
- **Smart Accounts** - Gasless transaction support
- **Session Management** - Secure authentication
- **Input Validation** - Zod schema validation
- **Error Boundaries** - Graceful error handling

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables
Set all required environment variables in your deployment platform:
- Vercel: Dashboard → Settings → Environment Variables
- Railway: Project → Variables
- Render: Environment → Environment Variables

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Resources

### Documentation
- [CDP Documentation](https://docs.cdp.coinbase.com)
- [Base Documentation](https://docs.base.org)
- [Next.js Documentation](https://nextjs.org/docs)

### Community
- [CDP Discord](https://discord.gg/cdp)
- [Base Discord](https://discord.gg/buildonbase)
- [Stack Auth Discord](https://discord.gg/stack-auth)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

**Alpha Software Warning**
> This project is in active development and is currently in an alpha state. It is not production-ready and should not be used for real funds or in public deployments. Features may change, break, or be removed at any time. Use at your own risk.

## 🙏 Acknowledgments

- **Coinbase Developer Platform** - For providing the infrastructure
- **Base Team** - For the L2 scaling solution
- **Stack Auth** - For authentication services
- **Open Source Community** - For the amazing tools and libraries

---

**Built with ❤️ by the CDP community**

[![CDP](https://img.shields.io/badge/Powered%20by-CDP-blue.svg)](https://docs.cdp.coinbase.com)
[![Base](https://img.shields.io/badge/Built%20on-Base-orange.svg)](https://base.org)


