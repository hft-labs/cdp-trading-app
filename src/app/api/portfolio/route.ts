import { NextResponse } from "next/server";
import { getTokenByAddress } from "@/lib/tokens";
import { formatUnits } from "viem";
import { getPrice } from "./utils";
import { cdp } from "@/lib/cdp-client";


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
        return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const balancesResponse = await cdp.evm.listTokenBalances({
        address: address as `0x${string}`,
        network: "base",
    });

    // Note: CDP EVM API doesn't have transaction history methods
    // Transaction history is available through CDP's JSON-RPC API
    // See src/lib/transaction-history.ts for the correct implementation

    const tokens = await Promise.all(
        (balancesResponse.balances || []).map(async (balance: any) => {
            const tokenInfo = getTokenByAddress(balance.token?.contractAddress);
            if (!tokenInfo) return null;
            const symbol = tokenInfo.symbol;
            const decimals = tokenInfo.decimals;
            const balanceFormatted = formatUnits(BigInt(balance.amount.amount), decimals);
            const price = symbol ? await getPrice(symbol) : 0;
            const value = parseFloat(balanceFormatted) * price;
            return {
                symbol,
                name: tokenInfo.name,
                address: tokenInfo.address,
                decimals,
                image: tokenInfo.image,
                chainId: tokenInfo.chainId,
                balance: balanceFormatted,
                price: price,
                value: value,
            };
        })
    );


    const filteredTokens = tokens.filter(Boolean);
    return NextResponse.json({ positions: filteredTokens });
}