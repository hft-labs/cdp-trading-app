import { getAccount } from "@/lib/account";
import { stackServerApp } from "@/lib/stack/stack.server";
import { getTokenBySymbol } from "@/lib/tokens";
import { NextResponse } from "next/server";
import { Address, formatEther, parseUnits } from "viem";
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

	const { smartAccount, owner } = await getAccount(user.id);
	if (!smartAccount) {
		return NextResponse.json({ error: "Smart account not found" }, { status:400 });
	}

    const fromTokenObj = getTokenBySymbol(fromToken);
    const toTokenObj = getTokenBySymbol(toToken);

    if (!fromTokenObj || !toTokenObj) {
        return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

  
    // Get or create an account to use for the swap
    console.log(`\nUsing account: ${smartAccount.address}`);
  
    try {
      
      // Set the amount we want to send
      const fromAmountBigInt = parseUnits(fromAmount, fromTokenObj.decimals); // 0.1 WETH
      
      console.log(`\nInitiating swap of ${formatEther(fromAmountBigInt)} ${fromTokenObj.symbol} for ${toTokenObj.symbol}`);
  
      // Handle token allowance check and approval if needed (applicable when sending non-native assets only)
      if (!fromToken.isNativeAsset) {
        await handleTokenAllowance(
          smartAccount,
          fromTokenObj.address as Address,
          fromTokenObj.symbol,
          fromAmountBigInt // <-- use the correct amount
        );
      }
      
      // Create and submit the swap transaction
      console.log("\nCreating and submitting swap in one call...");
      
      console.log('')
      console.log("toTokenObj", toTokenObj);
      console.log("fromAmount", fromAmount);
      console.log("fromAmountBigInt", fromAmountBigInt);
      console.log("fromTokenObj.address", fromTokenObj.address);
      console.log("toTokenObj.address", toTokenObj.address);
      
      try {
        // Approach 1: All-in-one pattern
        // Create and execute the swap in one call - simpler but less control
        const result = await smartAccount.swap({
          network: "base",
          toToken: toTokenObj.address as Address,
          fromToken: fromTokenObj.address as Address,
          fromAmount: fromAmountBigInt,
          slippageBps: 100, // 1% slippage tolerance
        });
  
  
        console.log(`\n✅ Swap submitted successfully!`);
        console.log(`Transaction hash: ${result.userOpHash}`);
        console.log(`Waiting for confirmation...`);
  
        // Wait for transaction confirmation using viem
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
        console.log(response);
        return NextResponse.json(response);
        
      } catch (error: any) {
        // The all-in-one pattern will throw an error if liquidity is not available
        if (error.message?.includes("Insufficient liquidity")) {
          console.log("\n❌ Swap failed: Insufficient liquidity for this swap pair or amount.");
          console.log("Try reducing the swap amount or using a different token pair.");
        } else {
          throw error;
        }
      }
      
    } catch (error) {
      console.error("Error executing swap:", error);
    }
  }