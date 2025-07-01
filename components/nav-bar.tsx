"use client";

import { UserButton } from "@stackframe/stack";
import { useTheme } from "next-themes";
import NextLink from "next/link";
import NextImage from "next/image";
import { useState } from "react";
import { useEffect } from "react";

interface NavbarProps {
	userData?: {
		usdcAvailable: string;
		smartAccountAddress: string;
		userId: string;
		name: string;
	};
	showTabs?: boolean;
	showWallet?: boolean;
}

export function Navbar({
	userData,
	showWallet = true,
}: NavbarProps) {
	const { resolvedTheme, setTheme } = useTheme();
	const [isLightMode, setIsLightMode] = useState(false);
	useEffect(() => {
		setIsLightMode(resolvedTheme === "light");
	}, [resolvedTheme]);
	console.log(isLightMode);
	return (
		<header
			className="sticky top-0 z-30 flex flex-col  mx-auto bg-white dark:bg-black border-b w-full"
		>
			<div
				className="flex items-center justify-between px-4 shrink-0"
				style={{ height: "50px" }}
			>
				<div className="flex items-center justify-center text-2xl font-bold">
					HFT
				</div>
				<div className="flex items-center">
					<div className="flex gap-4 items-center">
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