"use client";
import React from "react";
import { ArrowUpIcon, ArrowDownIcon, WalletIcon } from "lucide-react";
import { useOfframp } from "@/hooks/use-offramp";
import { useOnramp } from "@/hooks/use-onramp";
import { useCurrentUser, useEvmAddress } from "@coinbase/cdp-hooks";

export const WalletControls = () => {
	const address = useEvmAddress();
	const user = useCurrentUser();
	
	const { handleOnramp } = useOnramp({
		address: address as string,
		partnerUserId: user?.userId as string,
	});
	const { handleOfframp } = useOfframp({
		address: address as string,
		partnerUserId: user?.userId as string,
	});

	const handleSend = () => { };
	const handleReceive = () => { };

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