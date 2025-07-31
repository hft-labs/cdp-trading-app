"use client";

import { getQueryClient } from '@/lib/get-query-client';
import { Config }from '@coinbase/cdp-core';
import { createCDPEmbeddedWalletConnector } from '@coinbase/cdp-wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http }from "viem";
import { baseSepolia, base } from 'viem/chains';
import { WagmiProvider, createConfig } from 'wagmi';

// Your CDP config
const cdpConfig: Config = {
  projectId: "your-project-id", // Copy your Project ID here.
}

const connector = createCDPEmbeddedWalletConnector({
 cdpConfig: cdpConfig,
 providerConfig:{
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http()
  }
 }
});

const wagmiConfig = createConfig({
  connectors: [connector],
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

export function TestProvider({ children }: { children: React.ReactNode }) {
    const queryClient = getQueryClient();
    return <WagmiProvider config={wagmiConfig} >
    <QueryClientProvider client={ queryClient }>
            {children}
        </QueryClientProvider>
    </WagmiProvider>
}