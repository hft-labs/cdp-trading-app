import { getAccount } from "@/lib/account";
import { stackServerApp } from "@/lib/stack/stack.server";
import { AccountProvider } from "@/components/providers/account-provider";
import { SwapProvider } from "@/components/swap/swap-provider";
import { TransactionsPageClient } from "./page-client";

export default async function Home() {
  const user = await stackServerApp.getUser({
    or: "redirect"
  });

  const account = await getAccount(user?.id);
  return (
    <AccountProvider accountAddress={account.smartAccount?.address}>
      <SwapProvider>
          <TransactionsPageClient />
      </SwapProvider>
    </AccountProvider>
  );
}