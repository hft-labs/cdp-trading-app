"use client";

import SidebarLayout from "@/components/sidebar-layout";
import { useCurrentUser, useEvmAddress } from "@coinbase/cdp-hooks";
import { SwapProvider } from "@/components/swap/swap-provider";
import { DashboardOverview } from "./dashboard-overview";
import { SwapWidget } from "@/components/swap/swap-widget";
import { Separator } from "@/components/ui/separator";
import { WalletControls } from "@/components/wallet-controls";

export default function PageClient() {
    const user = useCurrentUser();
    const evmAddress = useEvmAddress();
    return <SidebarLayout>
        <SwapProvider>
            <div className="flex flex-row w-full h-full px-8 gap-8 bg-black">
                <div className="basis-2/3">
                    <DashboardOverview />
                </div>
                <div className="basis-1/3">
                    <SwapWidget />
                    <Separator className="my-4" />
                    <WalletControls />
                </div>
            </div>
        </SwapProvider>
    </SidebarLayout>
}