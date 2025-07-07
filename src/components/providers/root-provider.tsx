"use client";
import { QueryClientProvider } from '@tanstack/react-query'
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "@/lib/stack/stack.client";
import { ThemeProvider } from "next-themes";
import { getQueryClient } from '@/lib/get-query-client';

export function RootProviders({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient()
	return (
		<ThemeProvider defaultTheme="dark" attribute="class">
			<QueryClientProvider client={queryClient}>
				<StackProvider app={stackClientApp}>
					<StackTheme>{children}</StackTheme>
				</StackProvider>
			</QueryClientProvider>
		</ThemeProvider>
	);
}
