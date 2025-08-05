import { cdp } from "@/lib/cdp-client";

export async function getBalanceHistory(address: string) {
    const rpcUrl = process.env.CDP_RPC_URL;
    if (!rpcUrl) {
        throw new Error('CDP_RPC_URL is not set');
    }
    const page = await cdp.evm.listTokenBalances({
        address: address as `0x${string}`,
        network: "base",
        pageSize: 100
      });

      console.log('page', page);
      page.balances.forEach(balance => {
        console.log('balance', balance);
      });
    return page;
}
