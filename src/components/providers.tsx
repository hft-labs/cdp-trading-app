"use client";

import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "@/lib/stack/stack.client";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider defaultTheme="dark" attribute="class">
			<StackProvider app={stackClientApp}>
				<StackTheme>{children}</StackTheme>
			</StackProvider>
		</ThemeProvider>
	);
}
