import { baseTokens } from "@/lib/tokens";
import { createPublicClient, http, erc20Abi } from "viem";
import { base } from "viem/chains";

const publicClient = createPublicClient({
    chain: base,
    transport: http(),
});

export const getToken = (symbol: string) => {

    if (symbol === "ETH") {
        const token = baseTokens.find((token) => token.symbol === 'WETH' && token.chainId === base.id);
        if (!token) {
            throw new Error(`Token ${symbol} not found`);
        }
        return token;
    } else {
        const token = baseTokens.find((token) => token.symbol === symbol && token.chainId === base.id);
        if (!token) {
            throw new Error(`Token ${symbol} not found`);
        }
        return token;
    }
}

export async function handleTokenAllowance(
    userAddress: `0x${string}`,
    tokenAddress: `0x${string}`,
    tokenSymbol: string,
    requiredAmount: bigint,
    spenderAddress: `0x${string}`,
    sendTransaction: (...args: any[]) => Promise<any>
) {
    console.log(`\n🔍 Checking ${tokenSymbol} allowance...`);

    try {
        // Check current allowance
        const currentAllowance = await publicClient.readContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'allowance',
            args: [userAddress, spenderAddress],
        });

        console.log(`Current allowance: ${currentAllowance.toString()}`);
        console.log(`Required amount: ${requiredAmount.toString()}`);

        // If allowance is sufficient, no need to approve
        if (currentAllowance >= requiredAmount) {
            console.log(`✅ Sufficient ${tokenSymbol} allowance already exists`);
            return true;
        }

        console.log(`❌ Insufficient ${tokenSymbol} allowance. Requesting approval...`);

        // Request approval for maximum amount to avoid future approvals
        const maxApproval = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

        // Prepare approval transaction data
        const approveData = `0x095ea7b3${spenderAddress.slice(2).padStart(64, "0")}${maxApproval.toString(16).padStart(64, "0")}`;

        // Send approval transaction
        const approvalTx = await sendTransaction({
            evmAccount: userAddress,
            transaction: {
                to: tokenAddress,
                data: approveData,
                value: BigInt(0),
                chainId: 8453,
                type: "eip1559",
                maxFeePerGas: BigInt("10000000000"),
                maxPriorityFeePerGas: BigInt("1000000000"),
            },
            network: "base",
        });

        console.log(`✅ ${tokenSymbol} approval transaction sent: ${approvalTx}`);

        // Wait a bit for the transaction to be mined
        await new Promise(resolve => setTimeout(resolve, 3000));

        return true;
    } catch (error) {
        console.error(`❌ Error handling ${tokenSymbol} allowance:`, error);
        if (error instanceof Error) {
            throw new Error(`Failed to approve ${tokenSymbol}: ${error.message}`);
        }
        throw new Error(`Failed to approve ${tokenSymbol}: ${String(error)}`);
    }
}