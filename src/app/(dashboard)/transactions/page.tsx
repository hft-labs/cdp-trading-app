"use client";

import { WalletControls } from "@/components/wallet-controls";
import { Separator } from "@/components/ui/separator";
import { SwapWidget } from "@/components/swap/swap-widget";
import { TransactionsTable } from "./transactions-table";
import SidebarLayout from "@/components/sidebar-layout";
import { SwapProvider } from "@/components/swap/swap-provider";

export default function TransactionsPage() {
    return (
        <SidebarLayout>
            <SwapProvider>
                <div className="flex flex-row w-full h-full ">
                    <div className="basis-2/3">
                        <TransactionsTable />
                    </div>
                    <div className="basis-1/3 border-l border-white/10">
                        <SwapWidget />
                        <Separator className="my-4" />
                        <WalletControls />
                    </div>
                </div>
            </SwapProvider>
        </SidebarLayout>
    );
};