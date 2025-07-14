import { getAccount } from "@/lib/account";
import { stackServerApp } from "@/lib/stack/stack.server";
import { getTokenBySymbol } from "@/lib/tokens";
import { NextResponse } from "next/server";
import { Address, parseUnits } from "viem";
import { handleTokenAllowance } from "./utils";
import { publicClient } from "./utils";

export async function POST(request: Request) {

    const user = await stackServerApp.getUser();
    if (user === null) {
        return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const { fromToken, toToken, fromAmount } = await request.json();

    if (!fromToken || !toToken || !fromAmount) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { smartAccount } = await getAccount(user.id);
    if (!smartAccount) {
        return NextResponse.json({ error: "Smart account not found" }, { status: 400 });
    }

    const fromTokenObj = getTokenBySymbol(fromToken);
    const toTokenObj = getTokenBySymbol(toToken);

    if (!fromTokenObj || !toTokenObj) {
        return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const fromAmountBigInt = parseUnits(fromAmount, fromTokenObj.decimals);

    if (!fromToken.isNativeAsset) {
        await handleTokenAllowance(
            smartAccount,
            fromTokenObj.address as Address,
            fromTokenObj.symbol,
            fromAmountBigInt
        );
    }

    const result = await smartAccount.swap({
        network: "base",
        toToken: toTokenObj.address as Address,
        fromToken: fromTokenObj.address as Address,
        fromAmount: fromAmountBigInt,
        slippageBps: 100,
    });

    const receipt = await publicClient.waitForTransactionReceipt({
        hash: result.userOpHash,
    });
    const response = {
        hash: result.userOpHash,
        blockNumber: receipt.blockNumber.toString(),
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 'success' ? 'Success ✅' : 'Failed ❌',
        transactionExplorer: `https://basescan.org/tx/${result.userOpHash}`
    }
    return NextResponse.json(response);
}