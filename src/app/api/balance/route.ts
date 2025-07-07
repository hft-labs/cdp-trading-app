import { createPublicClient, formatUnits } from "viem";
import { base } from "viem/chains";
import { http } from "viem";
import { NextResponse } from "next/server";
import { getTokenBySymbol } from "@/lib/tokens";
import { getBalance, readContract } from "viem/actions";

if (!process.env.PAYMASTER_URL) {
    throw new Error("PAYMASTER_URL is not set");
}

const publicClient = createPublicClient({
	chain: base,
	transport: http(process.env.PAYMASTER_URL),
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    if (!symbol) {
        return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
    }
    const token = getTokenBySymbol(symbol);
    if (!token) {
        return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
    }
    const address = searchParams.get("address");
    if (!address) {
        return NextResponse.json({ error: "Missing address" }, { status: 400 });
    }
    if (token.symbol === "ETH") {
        const balance = await getBalance(publicClient, {
            address: address as `0x${string}`,
        });
        return NextResponse.json({ availableBalance: formatUnits(balance, 18) });
    }
    const availableBalance = await readContract(publicClient, {
		address: token.address as `0x${string}`,
		abi: [{
			inputs: [{ name: "account", type: "address" }],
			name: "balanceOf",
			outputs: [{ name: "", type: "uint256" }],
			stateMutability: "view",
			type: "function",
		}],
		functionName: "balanceOf",
		args: [address as `0x${string}`],
	});
    return NextResponse.json({ availableBalance: formatUnits(availableBalance, token.decimals) });
}