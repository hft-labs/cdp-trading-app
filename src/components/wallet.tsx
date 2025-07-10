"use client";
import React, { useEffect, useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpIcon, ArrowDownIcon, WalletIcon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useOfframp } from "@/hooks/use-offramp";
import { useOnramp } from "@/hooks/use-onramp";
import { useBalance } from "@/hooks/use-balance";
import { usePrivy } from "@privy-io/react-auth";

interface WalletProps {
	userData: {
		usdcAvailable: string;
		smartAccountAddress: string;
		userId: string;
		name: string;
	};
}

function Item(props: { text: string, icon: React.ReactNode, onClick: () => void | Promise<void> }) {
	return (
	  <DropdownMenuItem onClick={() => props.onClick()}>
		<div className="flex gap-2 items-center">
		  {props.icon}
		  <span>{props.text}</span>
		</div>
	  </DropdownMenuItem>
	);
  }

function DropdownMenuLabel(props: { text: string, icon: React.ReactNode }) {
	return (
		<div className="flex gap-2 items-center">
			{props.icon}	
			<span>{props.text}</span>
		</div>
	);
}

export const Wallet = () => {
	const router = useRouter();
	const [ address, setAddress ] = useState<string | undefined>(undefined);
	const { ready, user } = usePrivy();
	useEffect(() => {
		setAddress(user?.wallet?.address);
	}, [user]);
	const accountAddress = user?.wallet?.address

    const { availableBalance, isLoading, error } = useBalance("USDC");
	console.log(availableBalance, 'availableBalance');

	const { handleOnramp } = useOnramp({
		address: address ?? "",
		partnerUserId: user?.id ?? "",
	});
	const { handleOfframp } = useOfframp({
		address: address ?? "",
		partnerUserId: user?.id ?? "",
	});

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
				>   
					<WalletIcon className="h-4 w-4" />
					<span>${availableBalance}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				<DropdownMenuLabel text={user?.email?.toString() ?? accountAddress ?? ""} icon={<User className="h-4 w-4 " />} />
				<Item text="Deposit" icon={<ArrowDownIcon className="h-4 w-4 " />} onClick={handleOnramp} />
				<Item text="Withdraw" icon={<ArrowUpIcon className="h-4 w-4 " />} onClick={handleOfframp} />
			</DropdownMenuContent>
		</DropdownMenu>
	);
};