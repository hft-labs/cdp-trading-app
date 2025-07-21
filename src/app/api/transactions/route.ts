import { NextRequest, NextResponse } from "next/server";
import { getTransactionHistory } from "@/lib/transaction-history";
import { stackServerApp } from "@/lib/stack/stack.server";
import { getAccount } from "@/lib/account";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const network = searchParams.get("network") || "base";
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");
  const user = await stackServerApp.getUser({ or: "redirect" });

  const { smartAccount } = await getAccount(user.id);
  const address = smartAccount?.address;
  if (!smartAccount) {
      throw new Error("Smart account not found");
  }
  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  try {
    // Get transaction history using CDP JSON-RPC API
    const transactions = await getTransactionHistory({
      address,
      network,
      limit,
      offset,
    });

    // Get balance history for analytics

    return NextResponse.json({
      transactions,
      pagination: {
        limit,
        offset,
        total: transactions.length,
      },
      metadata: {
        address,
        network,
        source: "CDP Wallet History API",
      },
    });

  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction history" },
      { status: 500 }
    );
  }
} 