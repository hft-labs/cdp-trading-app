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

export const Wallet = () => {
	const router = useRouter();
	const user = useUser();	
    const { accountAddress } = useAccountContext();
    if (!user) {
        return null;
    }

	const handleSignOut = async () => {
		user.signOut();
		router.push("/handler/sign-in");
	};

	if (!accountAddress) {
		return null;
	}

	const { handleOnramp } = useOnramp({
		address: accountAddress,
		partnerUserId: user.id,
	});
	const { handleOfframp } = useOfframp({
		address: accountAddress,
		partnerUserId: user.id,
	});

    const { data, isLoading, error } = useQuery({
        queryKey: ['balance', accountAddress, 'USDC'],
        queryFn: () => fetch(`/api/balance?address=${accountAddress}&symbol=USDC`).then(res => res.json()),
        refetchInterval: 1000
    });

    const availableBalance = isLoading ? "-" : data?.availableBalance;

    if (isLoading) {
        return <Button variant="outline" size="sm">
            <WalletIcon className="h-4 w-4" />
            <Loader2 className="h-4 w-4 animate-spin" />
        </Button>;
    }
    if (error) {
        return <Button variant="outline" size="sm">
            <WalletIcon className="h-4 w-4" />
            <span>Error: {error.message}</span>
        </Button>;
    }

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
				<DropdownMenuLabel text={user.primaryEmail ?? ""} icon={<User className="h-4 w-4 " />} />
				<Item text="Deposit" icon={<ArrowDownIcon className="h-4 w-4 " />} onClick={handleOnramp} />
				<Item text="Withdraw" icon={<ArrowUpIcon className="h-4 w-4 " />} onClick={handleOfframp} />
				<DropdownMenuSeparator />
				<Item text="Sign out" icon={<LogOut className="h-4 w-4 " />} onClick={handleSignOut} />	
			</DropdownMenuContent>
		</DropdownMenu>
	);
};