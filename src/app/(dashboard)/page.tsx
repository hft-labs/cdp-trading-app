import { getAccount } from "@/lib/account";
import { stackServerApp } from "@/lib/stack/stack.server";
import { AccountProvider } from "@/components/providers/account-provider";
import { SwapProvider } from "@/components/swap/swap-provider";
import { SwapWidget } from "@/components/swap/swap-widget";
import SidebarLayout from "@/components/sidebar-layout";
import { PageClient } from "./page-client";

export default async function Home() {
  
  return (
      <SwapProvider>
            <PageClient />
      </SwapProvider>
  );
}