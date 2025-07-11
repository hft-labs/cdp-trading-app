"use client";

import { UserButton } from "@stackframe/stack";
import { useTheme } from "next-themes";
import { Wallet } from "./wallet";

export function Navbar() {
	const { resolvedTheme, setTheme } = useTheme();
	
	return (
		<header
			className="sticky top-0 z-30 flex flex-col  mx-auto bg-white dark:bg-black border-b w-full"
		>
			<div
				className="flex items-center justify-between px-4 shrink-0"
				style={{ height: "50px" }}
			>
				<div className="flex items-center justify-center">
					<div className="flex items-center justify-center text-2xl font-bold">
						BYOC
					</div>
				</div>
				<div className="flex items-center">
					<div className="flex gap-4 items-center">
						<Wallet />
						<UserButton
							colorModeToggle={() =>
								setTheme(resolvedTheme === "light" ? "dark" : "light")
							}
						/>
					</div>
				</div>
			</div>
		</header>
	);
}