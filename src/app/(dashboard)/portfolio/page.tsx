import { getAccount } from "@/lib/account";
import { stackServerApp } from "@/lib/stack/stack.server";
import { AccountProvider } from "@/components/providers/account-provider";
import { SwapProvider } from "@/components/swap/swap-provider";
import { getPortfolio } from "./utils"; 
import { AssetsTable } from "./assets-table";
import { SwapWidget } from "@/components/swap/swap-widget";
import { Separator } from "@/components/ui/separator";
import { WalletControls } from "@/components/wallet-controls";

export default async function Home() {
  const user = await stackServerApp.getUser({
    or: "redirect"
  });
  const account = await getAccount(user?.id);
  const defaultPortfolio = await getPortfolio(account.smartAccount?.address as `0x${string}`);
  const totalValue = defaultPortfolio.reduce((acc: number, position: { value: number }) => acc + position.value, 0);
  return (
    <AccountProvider accountAddress={account.smartAccount?.address}>
      <SwapProvider>
      <AccountProvider accountAddress={account.smartAccount?.address}>
            <SwapProvider>
                <div className="flex flex-row w-full h-full ">
                    <div className="basis-2/3">
                        <div className="bg-black rounded-tl-xl px-8 pt-6 pb-4">
                            <span className="text-5xl font-semibold text-white block">${totalValue.toFixed(2)}</span>
                        </div>
                        <AssetsTable
                            positions={defaultPortfolio}
                        />
                    </div>
                    <div className="basis-1/3 border-l border-white/10">
                        <SwapWidget />
                        <Separator className="my-4" />
                        <WalletControls />
                    </div>
                </div>
            </SwapProvider>
        </AccountProvider>
      </SwapProvider>
    </AccountProvider>
  );
}