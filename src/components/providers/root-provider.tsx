"use client";
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from "next-themes";
import { getQueryClient } from '@/lib/get-query-client';
import { CDPReactProvider, type Theme } from '@coinbase/cdp-react';
import { CDPHooksProvider } from '@coinbase/cdp-hooks';

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
			<CDPHooksProvider config={cdpConfig}>
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			</CDPHooksProvider>
		</ThemeProvider>
	);
}
