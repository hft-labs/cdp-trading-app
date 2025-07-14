import { NextResponse } from "next/server";
import { baseTokens } from "@/lib/tokens";
import { formatUnits } from "viem";
import { BalanceResponse } from "./types";
import { getPrice } from "./utils";

const rpcUrl = process.env.CDP_RPC_URL;
if (rpcUrl === undefined) {
    throw new Error("CDP_RPC_URL is not set");
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
        return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const body = {
        jsonrpc: "2.0",
        id: 1,
        method: "cdp_listBalances",
        params: [
            {
                address: address,
                pageToken: "",
                pageSize: 200
            }
        ]
    };

    const response = await fetch(rpcUrl!, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    const priceMap = new Map<string, number>();
    await Promise.all(baseTokens.map(async (token) => {
        const price = await getPrice(token.symbol);
        priceMap.set(token.symbol, price);
    }));
    const data = await response.json() as BalanceResponse;

    const tokens = baseTokens.map((token) => {
        const rawBalance = data.result.balances.find((balance) => balance.asset.groupId === token.address);
        const formattedBalance = rawBalance ? formatUnits(BigInt(rawBalance.value || 0), token.decimals) : "0";
        return {
            ...token,
            assetId: rawBalance?.asset?.id,
            balance: formattedBalance,
            price: priceMap.get(token.symbol) || 0,
            value: parseFloat(formattedBalance) * (priceMap.get(token.symbol) || 0)
        }
    });

    return NextResponse.json(tokens);
}