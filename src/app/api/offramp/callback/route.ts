import { NextResponse } from "next/server";
import { createRequest } from "@/lib/coinbase"; 
import { getAccount } from "@/lib/account";
import { getTokenBySymbol } from "@/lib/tokens";
import { stackServerApp } from "@/lib/stack/stack.server";
import { parseUnits } from "viem";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

export async function GET() {
	const user = await stackServerApp.getUser({ or: "redirect" });

	const { smartAccount } = await getAccount(user.id);
	if (!smartAccount) {
		throw new Error("Smart account not found");
	}

	const { url, jwt } = await createRequest({
		request_method: "GET",
		request_path: `/onramp/v1/sell/user/${user.id}/transactions`,
	});

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${jwt}`,
		},
	});
	

	const data = await response.json();
	const latestTransaction = data.transactions[0];
	if (!latestTransaction) {
		throw new Error("No recent transactions found");
	}

	const amount = latestTransaction.sell_amount.value;

	const symbol = latestTransaction.asset.toLocaleLowerCase();
	if (symbol !== "usdc") {
		throw new Error("Invalid asset");
	}
	const usdc = await getTokenBySymbol("USDC");
    if (!usdc) {
        throw new Error("USDC token not found");
    }
	const formattedAmount = parseUnits(amount, usdc.decimals);

    smartAccount.transfer({
        to: latestTransaction.to_address,
        amount: formattedAmount,
        token: usdc.address as `0x${string}`,
        network: "base",
    })

	const successUrl = new URL("/", baseUrl);

	return NextResponse.redirect(successUrl);
}