import { base, baseSepolia } from 'viem/chains';

export type Token = {
  name: string;
  address: string;
  symbol: string;
  decimals: number;
  image: string;
  chainId: number;
  isNativeAsset: boolean;
};

export const ethSepoliaToken: Token = {
  name: 'ETH',
  address: '',
  symbol: 'ETH',
  decimals: 18,
  image:
    'https://wallet-api-production.s3.amazonaws.com/uploads/tokens/eth_288.png',
  chainId: baseSepolia.id,
  isNativeAsset: true
};

export const usdcToken: Token = {
  name: 'USDC',
  address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  symbol: 'USDC',
  decimals: 6,
  image:
    'https://d3r81g40ycuhqg.cloudfront.net/wallet/wais/44/2b/442b80bd16af0c0d9b22e03a16753823fe826e5bfd457292b55fa0ba8c1ba213-ZWUzYjJmZGUtMDYxNy00NDcyLTg0NjQtMWI4OGEwYjBiODE2',
  chainId: base.id,
  isNativeAsset: false
};

export const usdcSepoliaToken: Token = {
  name: 'USDC',
  address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  symbol: 'USDC',
  decimals: 6,
  image:
    'https://d3r81g40ycuhqg.cloudfront.net/wallet/wais/44/2b/442b80bd16af0c0d9b22e03a16753823fe826e5bfd457292b55fa0ba8c1ba213-ZWUzYjJmZGUtMDYxNy00NDcyLTg0NjQtMWI4OGEwYjBiODE2',
  chainId: baseSepolia.id,
  isNativeAsset: false
};

export const degenToken: Token = {
  name: 'DEGEN',
  address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
  symbol: 'DEGEN',
  decimals: 18,
  image:
    'https://d3r81g40ycuhqg.cloudfront.net/wallet/wais/3b/bf/3bbf118b5e6dc2f9e7fc607a6e7526647b4ba8f0bea87125f971446d57b296d2-MDNmNjY0MmEtNGFiZi00N2I0LWIwMTItMDUyMzg2ZDZhMWNm',
  chainId: base.id,
  isNativeAsset: false
};

export const daiToken: Token = {
  name: 'DAI',
  address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
  symbol: 'DAI',
  decimals: 18,
  image:
    'https://d3r81g40ycuhqg.cloudfront.net/wallet/wais/92/13/9213e31b84c98a693f4c624580fdbe6e4c1cb550efbba15aa9ea68fd25ffb90c-ZTE1NmNjMGUtZGVkYi00ZDliLWI2N2QtNTY2ZWRjMmYwZmMw',
  chainId: base.id,
  isNativeAsset: false
};

const wethToken: Token = {
  name: 'WETH',
  address: '0x4200000000000000000000000000000000000006',
  symbol: 'WETH',
  decimals: 18,
  image:
    'https://d3r81g40ycuhqg.cloudfront.net/wallet/wais/47/bc/47bc3593c2dec7c846b66b7ba5f6fa6bd69ec34f8ebb931f2a43072e5aaac7a8-YmUwNmRjZDUtMjczYy00NDFiLWJhZDUtMzgwNjFmYWM0Njkx',
  chainId: base.id,
  isNativeAsset: false
};

const lbtcToken: Token = {
  name: 'LBTC',
  address: '0xecAc9C5F704e954931349Da37F60E39f515c11c1',
  symbol: 'LBTC',
  decimals: 8,
  image:
    'https://d3r81g40ycuhqg.cloudfront.net/wallet/wais/a3/40/a340085995bc54eddbcb66bab87833a7089edd1513847c39fc1799cab9207db4-Zjk2YzQ2MmQtMTY2OS00YWQyLWFkMGQtMjQ3OGYzNzljMWY2',
  chainId: base.id,
  isNativeAsset: false
};

const cbbtcToken: Token = {
  name: 'cbBTC',
  address: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
  symbol: 'cbBTC',
  decimals: 8,
  image: 'https://go.wallet.coinbase.com/static/CBBTCMedium.png',
  chainId: base.id,
  isNativeAsset: false
};

const eUsdToken: Token = {
  name: 'eUSD',
  address: '0xCfA3Ef56d303AE4fAabA0592388F19d7C3399FB4',
  symbol: 'eUSD',
  decimals: 18,
  image:
    'https://d3r81g40ycuhqg.cloudfront.net/wallet/wais/bf/a4/bfa445583916854508ae5d88f9cca19cd5a0910d8c4d7cd9385eb40a597017d7-MDFhM2E0YmQtZGU3NS00Yzk3LWFlMzAtMzA1Y2UyYzU2ZGEy',
  chainId: base.id,
  isNativeAsset: false
};
const eurcToken: Token = {
  name: 'EURC',
  address: '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42',
  symbol: 'EURC',
  decimals: 6,
  image:
    'https://d3r81g40ycuhqg.cloudfront.net/wallet/wais/54/f4/54f4216472dd25b1ffb5caf32cc0d81f645c84be166cd713f759a80f05a1418f-M2YxNTczYTItNjk3YS00N2FiLThkZjktYzBiYzExZTk1ZTFj',
  chainId: base.id,
  isNativeAsset: false
};



// ETH token for Base network (native asset)
const ethToken: Token = {
  name: 'ETH',
  address: '', // Native asset, no contract address
  symbol: 'ETH',
  decimals: 18,
  image: 'https://wallet-api-production.s3.amazonaws.com/uploads/tokens/eth_288.png',
  chainId: base.id,
  isNativeAsset: true
};

const baseTokens = [
  ethToken,
  wethToken,
  usdcToken,
  degenToken,
  daiToken,
  lbtcToken,
  cbbtcToken,
  eUsdToken,
  eurcToken,
] as const;

export const getTokenBySymbol = (symbol: string) => {
  const token = baseTokens.find((token) => token.symbol === symbol && token.chainId === base.id);
  return token;
}

export const getTokenByAddress = (address: string) => {
  const token = baseTokens.find((token) => token.address === address && token.chainId === base.id);
  return token;
}

export { baseTokens };

// Common token addresses on Base network
export const TOKEN_ADDRESSES: Record<string, { symbol: string; decimals: number; name: string }> = {
    // USDC on Base
    '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': {
        symbol: 'USDC',
        decimals: 6,
        name: 'USD Coin'
    },
    // WETH on Base
    '0x4200000000000000000000000000000000000006': {
        symbol: 'WETH',
        decimals: 18,
        name: 'Wrapped Ether'
    },
    // DEGEN on Base
    '0x4ed4e862860bed51a9570b96d89af5e1b0efefed': {
        symbol: 'DEGEN',
        decimals: 18,
        name: 'Degen'
    },
    // AERO on Base
    '0x940181a94a35a4569e4529a3cdfb74e38fd98631': {
        symbol: 'AERO',
        decimals: 18,
        name: 'Aerodrome'
    },
    // BAL on Base
    '0x4158734d47fc9692176b5085e0f52ee0da5d47f1': {
        symbol: 'BAL',
        decimals: 18,
        name: 'Balancer'
    },
    // CRV on Base
    '0x7f5373ae26c3e1324da5f9f2cac9846050fc90f9': {
        symbol: 'CRV',
        decimals: 18,
        name: 'Curve DAO Token'
    },
    // SNX on Base
    '0x22e6966b799c4d5b13be962e1d117b56327fda66': {
        symbol: 'SNX',
        decimals: 18,
        name: 'Synthetix Network Token'
    },
    // UNI on Base
    '0x6fd9d7ad17242c41f7131d257212c54a0e816691': {
        symbol: 'UNI',
        decimals: 18,
        name: 'Uniswap'
    },
    // LINK on Base
    '0x88dfaaabaf06f3a25d4a0ae4b3bf4c8c76249b0b': {
        symbol: 'LINK',
        decimals: 18,
        name: 'Chainlink'
    },
    // AAVE on Base
    '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22': {
        symbol: 'AAVE',
        decimals: 18,
        name: 'Aave'
    },
    // COMP on Base
    '0x9e1028f5f1d5ede59748ffce553474997d6eca76': {
        symbol: 'COMP',
        decimals: 18,
        name: 'Compound'
    },
    // Only include tokens we're certain about
    // For unknown tokens, the system will show "TOKEN" as a fallback
};

/**
 * Get token information by contract address
 */
export function getTokenInfo(contractAddress: string): { symbol: string; decimals: number; name: string } | null {
    const normalizedAddress = contractAddress.toLowerCase();
    console.log(`Looking up token: ${contractAddress} -> ${normalizedAddress}`);
    console.log(`Available tokens:`, Object.keys(TOKEN_ADDRESSES));
    const result = TOKEN_ADDRESSES[normalizedAddress];
    console.log(`Result:`, result);
    return result || null;
}

/**
 * Format token amount with proper decimals
 */
export function formatTokenAmount(amount: string, decimals: number): string {
    const amountBigInt = BigInt(amount);
    const divisor = BigInt(10 ** decimals);
    const quotient = amountBigInt / divisor;
    const remainder = amountBigInt % divisor;
    
    // Convert to decimal
    const formattedAmount = Number(quotient) + Number(remainder) / Number(divisor);
    
    // Handle very large numbers to avoid scientific notation
    if (formattedAmount > 1000000) {
        return formattedAmount.toLocaleString('en-US', { 
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });
    }
    
    // Handle very small numbers
    if (formattedAmount < 0.000001) {
        return formattedAmount.toExponential(6);
    }
    
    // For amounts less than 1, show more precision
    if (formattedAmount < 1) {
        return formattedAmount.toFixed(8);
    }
    
    return formattedAmount.toFixed(6);
}

/**
 * Parse ERC20 transfer input data
 */
export function parseERC20Transfer(input: string): { from: string; to: string; amount: string } | null {
    if (!input || input.length < 74) {
        return null;
    }
    
    try {
        // Handle transferFrom (0x23b872dd)
        if (input.startsWith('0x23b872dd') && input.length >= 138) {
            // Extract from address (32 bytes starting at position 4)
            const fromHex = input.slice(4, 68);
            const from = '0x' + fromHex.slice(24); // Remove padding
            
            // Extract to address (32 bytes starting at position 68)
            const toHex = input.slice(68, 132);
            const to = '0x' + toHex.slice(24); // Remove padding
            
            // Extract amount (32 bytes starting at position 138)
            const amountHex = input.slice(138);
            const amount = BigInt('0x' + amountHex).toString();
            
            return { from, to, amount };
        }
        
        // Handle transfer (0xa9059cbb)
        if (input.startsWith('0xa9059cbb') && input.length >= 74) {
            // Extract to address (32 bytes starting at position 4)
            const toHex = input.slice(4, 68);
            const to = '0x' + toHex.slice(24); // Remove padding
            
            // Extract amount (32 bytes starting at position 68)
            const amountHex = input.slice(68);
            const amount = BigInt('0x' + amountHex).toString();
            
            // For transfer, the 'from' address is the transaction sender (we'll get this from the transaction)
            return { from: '', to, amount };
        }
        
        return null;
    } catch (error) {
        console.error('Error parsing ERC20 transfer:', error);
        return null;
    }
}

/**
 * Parse ERC20 approval input data
 */
export function parseERC20Approval(input: string): { spender: string; amount: string } | null {
    if (!input || input.length < 74) {
        return null;
    }
    
    try {
        // Handle approve (0x095ea7b3)
        if (input.startsWith('0x095ea7b3') && input.length >= 74) {
            // Extract spender address (32 bytes starting at position 4)
            const spenderHex = input.slice(4, 68);
            const spender = '0x' + spenderHex.slice(24); // Remove padding
            
            // Extract amount (32 bytes starting at position 68)
            const amountHex = input.slice(68);
            const amount = BigInt('0x' + amountHex).toString();
            
            return { spender, amount };
        }
        
        return null;
    } catch (error) {
        console.error('Error parsing ERC20 approval:', error);
        return null;
    }
}