import { NextResponse } from "next/server";
import { getTokenByAddress } from "@/lib/tokens";
import { formatUnits } from "viem";
import { getPrice } from "./utils";
import { CdpClient } from "@coinbase/cdp-sdk";

const cdp = new CdpClient({
    apiKeyId: process.env.CDP_API_KEY_ID,
    apiKeySecret: process.env.CDP_API_KEY_SECRET,
    walletSecret: process.env.CDP_WALLET_SECRET
});

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