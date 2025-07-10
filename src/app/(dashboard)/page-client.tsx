"use client";
import { usePrivy, useFundWallet } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SwapWidget } from "@/components/swap/swap-widget";
import { base } from "viem/chains";
import { Button } from "@/components/ui/button";

export const PageClient = () => {
    const { ready, user } = usePrivy();
    const router = useRouter();
    const { fundWallet } = useFundWallet();
    // useEffect(() => {
    //     if (ready && user) {
    //         const address = user.linkedAccounts?.find(account => account.type === "wallet" && account.chainType === "ethereum")?.address
    //         if (address) {
    //             fundWallet(address, {
    //                 amount: "0.001",
    //                 chain: base,
    //             });
    //         }
    //     }
    // }, [ready, user, fundWallet]);
    useEffect(() => {
        if (!ready || user === null) {
            router.push("/login");
        }
    }, [ready, user, router]);
    const address = user?.wallet?.address
    return (
        <div>
            <Button onClick={() => {
                fundWallet(address!, {
                    chain: base,
                });
            }}>
                Fund Wallet</Button>
            <SwapWidget />
        </div>
    );
};