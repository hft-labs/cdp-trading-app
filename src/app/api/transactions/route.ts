import { NextRequest, NextResponse } from "next/server";
import { getTransactionHistory } from "@/lib/transaction-history";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const network = searchParams.get("network") || "base";
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  const address = searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  console.log("address", address);
  console.log("network", network);
  console.log("limit", limit);
  console.log("offset", offset);
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