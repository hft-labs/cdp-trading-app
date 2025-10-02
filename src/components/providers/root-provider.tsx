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

const CDP_CONFIG = {
	projectId: process.env.NEXT_PUBLIC_COINBASE_APP_ID ?? "",
	ethereum: {
		createOnLogin: 'eoa',
	},
	appName: "CDP Next.js StarterKit",
	appLogoUrl: "http://localhost:3000/logo.svg",
	authMethods: ["email", "sms"],
} as Config;


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
			<CDPReactProvider config={CDP_CONFIG} theme={themeOverrides}>
				<CDPHooksProvider config={CDP_CONFIG}>
					<QueryClientProvider client={queryClient}>
						{children}
					</QueryClientProvider>
				</CDPHooksProvider>
			</CDPReactProvider>
		</ThemeProvider>
	);
}
