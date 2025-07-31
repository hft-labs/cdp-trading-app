"use client";
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from "next-themes";
import { getQueryClient } from '@/lib/get-query-client';
import { CDPReactProvider, type Theme } from '@coinbase/cdp-react';

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

const themeOverrides: Partial<Theme> = {
	"colors-background": "black",
	"colors-backgroundOverlay": "rgba(0,0,0,0.5)",
	"colors-text": "white",
	"colors-textSecondary": "#999999",
	"colors-secondary": "transparent", // or "black" if you want a dark outline
	"colors-secondaryText": "white",
	"colors-secondaryHoverBackground": "#222", // or a subtle highlight
	"colors-secondaryHoverText": "white",
	"colors-secondaryFocusRing": "#fff",
	"colors-border": "white", // ensures the outline is visible
};

export function RootProviders({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient()
	return (
		<ThemeProvider defaultTheme="dark" attribute="class">
			<CDPReactProvider config={cdpConfig} app={appConfig} theme={themeOverrides}>
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			</CDPReactProvider>
		</ThemeProvider>
	);
}
