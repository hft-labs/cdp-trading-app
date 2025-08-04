"use client";

import { SwapProvider } from "@/components/swap/swap-provider";
import { AssetsTable } from "./assets-table";
import { WalletControls } from "@/components/wallet-controls";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { usePortfolio } from "@/hooks/use-portfolio";
import { SwapWidget } from "@/components/swap/swap-widget";
import { Separator } from "@/components/ui/separator";

export const PageClient = () => {
    const address = useEvmAddress();
    const { positions, isLoading, error } = usePortfolio();
    const totalValue = positions.reduce((acc: number, position: { value: number }) => acc + position.value, 0);
    return (
        <SwapProvider>
            <div className="flex flex-row w-full h-full ">
                <div className="basis-2/3">
                    <div className="bg-black rounded-tl-xl px-8 pt-6 pb-4">
                        <span className="text-5xl font-semibold text-white block">${totalValue.toFixed(2)}</span>
                    </div>
                    <AssetsTable />
                </div>
                <div className="basis-1/3 border-l border-white/10">
                    <SwapWidget />
                    <Separator className="my-4" />
                    <WalletControls />
                </div>
            </div>
        </SwapProvider>
    );
}