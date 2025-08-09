"use client";

import { SwapProvider } from "@/components/swap/swap-provider";
import { AssetsTable } from "./assets-table";
import { WalletControls } from "@/components/wallet-controls";
import { SwapWidget } from "@/components/swap/swap-widget";
import { Separator } from "@/components/ui/separator";
import SidebarLayout from "@/components/sidebar-layout";
import { BalanceChart } from "@/components/balance-chart";

export const PageClient = () => {
    return (
        <SidebarLayout>
            <SwapProvider>
                <div className="flex flex-row w-full h-full ">
                    <div className="basis-2/3">
                        <BalanceChart className="mb-6" />
                        <AssetsTable />
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
}