import { NextResponse } from "next/server";
import { getAccount } from "@/lib/account";
import { getTokenBySymbol } from "@/lib/tokens";
import { stackServerApp } from "@/lib/stack/stack.server";

export async function GET() {
	const user = await stackServerApp.getUser({ or: "redirect" });

	const { smartAccount } = await getAccount(user.id);
	if (!smartAccount) {
		throw new Error("Smart account not found");
	}

	const transactions = await fetch(`/api/onramp/transactions`).then(res => res.json());

	const latestTransaction = transactions[0];
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
        throw new Error("USDC not found");
    }
    const { userOpHash } = await smartAccount.transfer({
        to: latestTransaction.to_address,
        amount: amount,
        token: usdc.address as `0x${string}`,
        network: "base",
    });

    const receipt = await smartAccount.waitForUserOperation({ userOpHash });

    if (receipt.status !== "complete") {
        throw new Error("Transfer failed");
    }

	const successUrl = new URL("/explore", process.env.NEXT_PUBLIC_BASE_URL);

	return NextResponse.redirect(successUrl);
}