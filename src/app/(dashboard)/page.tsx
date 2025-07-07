import { getAccount } from "@/lib/account";
import { stackServerApp } from "@/lib/stack/stack.server";
import { AccountProvider } from "@/components/providers/account-provider";
import { SwapProvider } from "@/components/swap/swap-provider";
import { SwapWidget } from "@/components/swap/swap-widget";

export default async function Home() {
  const user = await stackServerApp.getUser();
  const account = await getAccount(user?.id);

  return (
    <AccountProvider accountAddress={account.smartAccount?.address}>
      <SwapProvider>
        <SwapWidget />
      </SwapProvider>
    </AccountProvider>
  );
}