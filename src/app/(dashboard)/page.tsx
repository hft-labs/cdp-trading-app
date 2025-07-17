import { getAccount } from "@/lib/account";
import { stackServerApp } from "@/lib/stack/stack.server";
import { AccountProvider } from "@/components/providers/account-provider";
import { SwapProvider } from "@/components/swap/swap-provider";
import { SwapWidget } from "@/components/swap/swap-widget";
import { Separator } from "@/components/ui/separator";
import { WalletControls } from "@/components/wallet-controls";

export default async function Home() {
  const user = await stackServerApp.getUser();
  const account = await getAccount(user?.id);

  return (
    <AccountProvider accountAddress={account.smartAccount?.address}>
      <SwapProvider>
        <div className="flex flex-row w-full h-full px-8  gap-8">
          <div className="basis-2/3">
            <div>main content</div>
          </div>
          <div className="basis-1/3">
            <SwapWidget />
            <Separator className="my-4" />
            <WalletControls />
          </div>
        </div>
      </SwapProvider>
    </AccountProvider>
  );
}