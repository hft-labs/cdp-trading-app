"use client";
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from "next-themes";
import { getQueryClient } from '@/lib/get-query-client';
import { CDPReactProvider, type Theme } from '@coinbase/cdp-react';
import { CDPHooksProvider } from '@coinbase/cdp-hooks';
import { Config } from '@coinbase/cdp-core';

if (!process.env.NEXT_PUBLIC_COINBASE_APP_ID) {
	throw new Error("NEXT_PUBLIC_COINBASE_APP_ID is not set");
}

const cdpConfig: Config = {
	projectId: process.env.NEXT_PUBLIC_COINBASE_APP_ID,
	createAccountOnLogin: "evm-smart",
}

const appConfig = {
	name: "Swapper",
	logoUrl: "https://picsum.photos/64",
}


const themeOverrides: Partial<Theme> = {
	"colors-bg-default": "black",
	"colors-bg-alternate": "#121212",
	"colors-fg-default": "white",
	"colors-fg-muted": "#999999",
}


export function RootProviders({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient()
	return (
		<ThemeProvider defaultTheme="dark" attribute="class">
			<CDPReactProvider config={cdpConfig} app={appConfig} theme={themeOverrides}>
				<CDPHooksProvider config={cdpConfig}>
					<QueryClientProvider client={queryClient}>
						{children}
					</QueryClientProvider>
				</CDPHooksProvider>
			</CDPReactProvider>
		</ThemeProvider>
	);
}
