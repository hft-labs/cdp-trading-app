import { CdpClient } from "@coinbase/cdp-sdk";
import { 
  createPublicClient, 
  http, 
  erc20Abi,
  encodeFunctionData,
  formatEther,
  type Address,
} from "viem";
import { base } from "viem/chains";

const cdp = new CdpClient({
    apiKeyId: process.env.CDP_API_KEY_ID,
    apiKeySecret: process.env.CDP_API_KEY_SECRET,
    walletSecret: process.env.CDP_WALLET_SECRET
});

const PERMIT2_ADDRESS: Address = "0x000000000022D473030F116dDEE9F6B43aC78BA3";

export const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.PAYMASTER_URL)
});



/**
 * Handles token allowance check and approval if needed for smart accounts
 * @param smartAccount - The smart account instance
 * @param tokenAddress - The address of the token to be sent
 * @param tokenSymbol - The symbol of the token (e.g., WETH, USDC)
 * @param fromAmount - The amount to be sent
 * @returns A promise that resolves when allowance is sufficient
 */
export async function handleTokenAllowance(
    smartAccount: any,
    tokenAddress: Address,
    tokenSymbol: string,
    fromAmount: bigint
  ): Promise<void> {
    console.log("\n🔐 Checking token allowance for smart account...");
    
    // Check allowance before attempting the swap
    const currentAllowance = await getAllowance(
      smartAccount.address as Address, 
      tokenAddress,
      tokenSymbol
    );
    
    // If allowance is insufficient, approve tokens
    if (currentAllowance < fromAmount) {
      console.log(`❌ Allowance insufficient. Current: ${formatEther(currentAllowance)}, Required: ${formatEther(fromAmount)}`);
      
      // Set the allowance to the required amount via user operation
      await approveTokenAllowance(
        smartAccount,
        tokenAddress,
        PERMIT2_ADDRESS,
        fromAmount
      );
      console.log(`✅ Set allowance to ${formatEther(fromAmount)} ${tokenSymbol}`);
    } else {
      console.log(`✅ Token allowance sufficient. Current: ${formatEther(currentAllowance)} ${tokenSymbol}`);
    }
  }
/**
 * Handle approval for token allowance if needed for smart accounts
 * This is necessary when swapping ERC20 tokens (not native ETH)
 * The Permit2 contract needs approval to move tokens on behalf of the smart account
 * @param smartAccount - The smart account instance
 * @param tokenAddress - The token contract address
 * @param spenderAddress - The address allowed to spend the tokens
 * @param amount - The amount to approve
 * @returns The user operation receipt
 */
export async function approveTokenAllowance(
    smartAccount: any,
    tokenAddress: Address, 
    spenderAddress: Address, 
    amount: bigint
  ) {
    console.log(`\nApproving token allowance for ${tokenAddress} to spender ${spenderAddress}`);
    
    // Encode the approve function call
    const data = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: [spenderAddress, amount]
    });
    
    // Send the approve transaction via user operation
    const userOpResult = await smartAccount.sendUserOperation({
      network: "base",
      calls: [
        {
          to: tokenAddress,
          data,
          value: BigInt(0),
        }
      ],
    });
    
    console.log(`Approval user operation hash: ${userOpResult.userOpHash}`);
    
    // Wait for approval user operation to be confirmed
    const receipt = await smartAccount.waitForUserOperation({
      userOpHash: userOpResult.userOpHash,
    });
    
    console.log(`Approval confirmed with status: ${receipt.status} ✅`);
    return receipt;
  }
  
  /**
   * Check token allowance for the Permit2 contract
   * @param owner - The token owner's address (smart account)
   * @param token - The token contract address
   * @param symbol - The token symbol for logging
   * @returns The current allowance
   */
  export async function getAllowance(
    owner: Address, 
    token: Address,
    symbol: string
  ): Promise<bigint> {
    console.log(`\nChecking allowance for ${symbol} (${token}) to Permit2 contract...`);
    
    try {
      const allowance = await publicClient.readContract({
        address: token,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [owner, PERMIT2_ADDRESS]
      });
      
      console.log(`Current allowance: ${formatEther(allowance)} ${symbol}`);
      return allowance;
    } catch (error) {
      console.error("Error checking allowance:", error);
      return BigInt(0);
    }
  }