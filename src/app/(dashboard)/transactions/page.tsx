import { SwapProvider } from "@/components/swap/swap-provider";
import { TransactionsPageClient } from "./page-client";
import SidebarLayout from "@/components/sidebar-layout";

export default async function Home() {
  return (
    <SidebarLayout>
      <SwapProvider>
        <TransactionsPageClient />
      </SwapProvider>
    </SidebarLayout>
  );
}