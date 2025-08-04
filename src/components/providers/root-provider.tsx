"use client";
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from "next-themes";
import { getQueryClient } from '@/lib/get-query-client';
import { CDPReactProvider } from '@coinbase/cdp-react';

if (!process.env.NEXT_PUBLIC_COINBASE_APP_ID) {
	throw new Error("NEXT_PUBLIC_COINBASE_APP_ID is not set");
}

const cdpConfig = {
	projectId: process.env.NEXT_PUBLIC_COINBASE_APP_ID
}

const appConfig = {
	name: "Basecoin",
	logo: "/logo.png",
}

export function RootProviders({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient()
	return (
		<ThemeProvider defaultTheme="dark" attribute="class">
			<CDPReactProvider config={cdpConfig} app={appConfig}>
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			</CDPReactProvider>
		</ThemeProvider>
	);
}
