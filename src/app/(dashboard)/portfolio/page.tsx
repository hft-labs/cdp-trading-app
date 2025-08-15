"use client";

import { SwapProvider } from "@/components/swap/swap-provider";
import { AssetsTable } from "./assets-table";
import { WalletControls } from "@/components/wallet-controls";
import { SwapWidget } from "@/components/swap/swap-widget";
import { Separator } from "@/components/ui/separator";
import SidebarLayout from "@/components/sidebar-layout";
import { BalanceChart } from "@/components/balance-chart";
import ClientApp from "@/components/app-client";

export default function PortfolioPage() {
    return (
        <SidebarLayout>

        <ClientApp>
            <SwapProvider>
                <div className="flex flex-row w-full h-full ">
                    <div className="basis-2/3 h-full">
                        <BalanceChart />
                        <AssetsTable />
                    </div>
                    <div className="basis-1/3 border-l border-white/10 h-full">
                        <SwapWidget />
                        <Separator className="my-4" />
                        <WalletControls />
                    </div>
                </div>
                </SwapProvider>
            </ClientApp>
        </SidebarLayout>
    );
}