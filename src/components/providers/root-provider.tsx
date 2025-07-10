"use client";
import { QueryClientProvider } from '@tanstack/react-query'
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "@/lib/stack/stack.client";
import { ThemeProvider } from "next-themes";
import { getQueryClient } from '@/lib/get-query-client';
import {PrivyProvider} from '@privy-io/react-auth';
import { base } from 'viem/chains';

export function RootProviders({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient()
	return (
		<ThemeProvider defaultTheme="dark" attribute="class">
			<QueryClientProvider client={queryClient}>
				<PrivyProvider
				 config={{
					defaultChain: base,
					appearance:{
						logo: "https://auth.privy.io/logos/privy-logo.png",
							accentColor: "#000",
							theme: "light",
							showWalletLoginFirst: false,
						walletChainType: "ethereum-and-solana",
						walletList: ["detected_wallets", "metamask", "phantom"],
					},
					embeddedWallets: {
						ethereum: { 
							createOnLogin: 'users-without-wallets',
						},
						 
					}, 
				}}
				 appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}>
					<StackProvider app={stackClientApp}>
						<StackTheme>{children}</StackTheme>
					</StackProvider>
				</PrivyProvider>
			</QueryClientProvider>
		</ThemeProvider>
	);
}
