import { http, useAccount } from "wagmi";
import { useCapabilities } from "wagmi/";
import { useMemo } from "react";
import { TransactButton } from "./transact-button";
import { erc20Abi } from "viem";
import { usdcToken } from "@/lib/tokens";

export function TransactWithPaymaster() {
  const account = useAccount();
  const { data: availableCapabilities } = useCapabilities({
    account: account.address,
  });
  const capabilities = useMemo(() => {
    if (!availableCapabilities || !account.chainId) return;
    const capabilitiesForChain = availableCapabilities[account.chainId];
    if (
      capabilitiesForChain["paymasterService"] &&
      capabilitiesForChain["paymasterService"].supported
    ) {
        console.log('paymasterService', capabilitiesForChain["paymasterService"]);
      const paymasterServiceUrl = "https://api.developer.coinbase.com/rpc/v1/base/uaeeN4tXYvdmnlYuCgECqSEJMqVgUuUR";
      return {
        paymasterService: {
          url: paymasterServiceUrl,
        },
      };
    }
  }, [availableCapabilities, account.chainId]);

  // Permit2 address (Base mainnet)
  const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
  // Approve 10 USDC (6 decimals)
  const approveAmount = BigInt(1 * 10 ** (usdcToken.decimals ?? 6));
  console.log('usdcToken', usdcToken);
  console.log('usdcToken.decimals', usdcToken.decimals);
  console.log('approveAmount', approveAmount);
  console.log('erc20Abi', erc20Abi);

  return (
    <div>
      <h2>Approve USDC Spend (ERC20)</h2>
      <div>
        <TransactButton
          text="Approve USDC"
          contracts={[
            {
              address: usdcToken.address,
              abi: erc20Abi,
              functionName: "approve",
              args: [PERMIT2_ADDRESS, approveAmount],
            },
          ]}
          
        />
      </div>
    </div>
  );
}