import { SwapProvider } from "@/components/swap/swap-provider";
import { TransactionsPageClient } from "./page-client";

export default async function Home() {
  return (
      <SwapProvider>
          <TransactionsPageClient />
      </SwapProvider>
  );
}