"use client";
import React from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpIcon, ArrowDownIcon, WalletIcon, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useOfframp } from "@/hooks/use-offramp";
import { useOnramp } from "@/hooks/use-onramp";
import { Typography } from "@/components/ui/typography";
import { LogOut } from "lucide-react";
import { useUser } from "@stackframe/stack";
import { useAccountContext } from "./providers/account-provider";
import { useQuery } from "@tanstack/react-query";

function Item(props: { text: string, icon: React.ReactNode, onClick: () => void | Promise<void> }) {
	return (
		<DropdownMenuItem onClick={() => props.onClick()}>
			<div className="flex gap-2 items-center">
				{props.icon}
				<Typography>{props.text}</Typography>
			</div>
		</DropdownMenuItem>
	);
}

function DropdownMenuLabel(props: { text: string, icon: React.ReactNode }) {
	return (
		<div className="flex gap-2 items-center">
			{props.icon}
			<Typography>{props.text}</Typography>
		</div>
	);
}

export const WalletControls = () => {
	const user = useUser({
		or: 'redirect'
	});
	const { accountAddress } = useAccountContext();
	if (!accountAddress) {
		throw new Error("Account address not found");
	}
	const { handleOnramp } = useOnramp({
		address: accountAddress as string,
		partnerUserId: user?.id as string,
	});
	const { handleOfframp } = useOfframp({
		address: accountAddress as string,
		partnerUserId: user?.id as string,
	});

	const handleSend = () => { handleOnramp() };
	const handleReceive = () => { handleOfframp() };
	const handleDeposit = () => { /* TODO: implement deposit */ };
	const handleWithdraw = () => { /* TODO: implement withdraw */ };

	return (
		<div className="flex flex-col gap-1">
			<button
				onClick={handleSend}
				className="flex items-center gap-2 px-3 py-2 rounded transition-colors hover:bg-blue-950/40 focus:outline-none w-full"
			>
				<span className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center">
					<ArrowUpIcon className="h-5 w-5 text-white" />
				</span>
				<span className="text-base text-white">Send crypto</span>
			</button>
			<button
				onClick={handleReceive}
				className="flex items-center gap-2 px-3 py-2 rounded transition-colors hover:bg-blue-950/40 focus:outline-none w-full"
			>
				<span className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center">
					<ArrowDownIcon className="h-5 w-5 text-white" />
				</span>
				<span className="text-base text-white">Receive crypto</span>
			</button>
			<button
				onClick={handleOnramp}
				className="flex items-center gap-2 px-3 py-2 rounded transition-colors hover:bg-blue-950/40 focus:outline-none w-full"
			>
				<span className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center">
					{/* Bank icon */}
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10v10h18V10M4 10l8-6 8 6M4 10h16" /></svg>
				</span>
				<span className="text-base text-white">Deposit cash</span>
			</button>
			<button
				onClick={handleOfframp}
				className="flex items-center gap-2 px-3 py-2 rounded transition-colors hover:bg-blue-950/40 focus:outline-none w-full"
			>
				<span className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center">
					<WalletIcon className="h-5 w-5 text-white" />
				</span>
				<span className="text-base text-white">Withdraw cash</span>
			</button>
		</div>
	);
};