"use client";

import { UserButton } from "@stackframe/stack";
import { useTheme } from "next-themes";
import { UserPill } from "@privy-io/react-auth/ui";
import { FeedbackDialog } from "./feedback-dialog";
import { Button } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { Wallet } from "./wallet";

export function Navbar() {
	const { resolvedTheme, setTheme } = useTheme();
	const pathname = usePathname();
	const onLoginPage = pathname === "/login";
	const { ready, user, login } = usePrivy();
	console.log(user?.wallet?.address);
	const showLogin = !ready || user === null || onLoginPage;
	const router = useRouter();

	return (
		<header
			className="sticky top-0 z-30 flex flex-col  mx-auto dark:bg-black border-b w-full"
		>
			<div
				className="flex items-center justify-between px-4 shrink-0"
				style={{ height: "50px" }}
			>
				<div className="flex items-center justify-center">
					<div className="flex items-center justify-center text-2xl font-bold">
						HFT
					</div>

				</div>
				<div className="flex items-center">
					<div className="flex gap-4 items-center">
						<Wallet />
						<FeedbackDialog
							trigger={<Button variant="outline" size='sm'>Feedback</Button>}
						/>
					</div>
					{(
						<UserPill
							action={{ type: 'login', options: { loginMethods: ['email', 'wallet'] } }}
							size={32}
							ui={{
								minimal: false,
								background: "accent",
							}}
						/>
					)}
				</div>
			</div>
			{/* <NavTabs tabs={[{ title: "Swap", href: "/swap" }, { title: "Pool", href: "/pool" }]} /> */}
		</header>
	);
}