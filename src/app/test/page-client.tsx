"use client";
import { useState } from "react";
import { parseEther } from "viem";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";

/**
 * The burn address (0x0000000000000000000000000000000000000000)
 */
const BURN_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

/**
 * The amount to send in ETH (0.00001 ETH)
 */
const AMOUNT_TO_SEND = "0.00001";

/**
 * A component that demonstrates wagmi's useSendTransaction hook
 * by sending 0.00001 ETH to the burn address.
 *
 * @returns A component that allows the user to send a transaction using wagmi.
 */
export default function WagmiTransaction() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  const { data: hash, sendTransaction, isPending, error } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSendTransaction = async () => {
    if (!address) return;

    setIsLoading(true);

    try {
      sendTransaction({
        to: BURN_ADDRESS,
        value: parseEther(AMOUNT_TO_SEND),
      });
    } catch (error) {
      console.error("Failed to send transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    // Reset by refreshing the page or clearing state
    window.location.reload();
  };

  return (
    <div>
      <div>
        <p>
          ⚠️ Warning: This will send {AMOUNT_TO_SEND} ETH to the burn address (0x0000...0000). 
          This transaction cannot be reversed and the ETH will be permanently lost.
        </p>
      </div>

      <div>
        <div>
          <div>Amount: {AMOUNT_TO_SEND} ETH</div>
          <div>To (Burn Address): {BURN_ADDRESS.slice(0, 6)}...{BURN_ADDRESS.slice(-4)}</div>
          <div>From: {address?.slice(0, 6)}...{address?.slice(-4)}</div>
        </div>
      </div>

      {error && (
        <div>
          <strong>Error:</strong> {error.message}
        </div>
      )}

      {!hash && !isPending && !isLoading && (
        <button disabled={!address} onClick={handleSendTransaction}>
          Send {AMOUNT_TO_SEND} ETH to Burn Address
        </button>
      )}

      {(isPending || isConfirming) && (
        <div>
          <div>Sending transaction...</div>
          {hash && (
            <div>
              Hash: {hash.slice(0, 10)}...{hash.slice(-8)}
            </div>
          )}
        </div>
      )}

      {isSuccess && hash && (
        <div>
          <div>
            <div>✅</div>
          </div>

          <div>
            <div>Transaction Confirmed!</div>
            <div>Your transaction has been successfully sent to the burn address</div>
          </div>

          <div>
            <div>Amount: {AMOUNT_TO_SEND} ETH</div>
            <div>To: {BURN_ADDRESS.slice(0, 6)}...{BURN_ADDRESS.slice(-4)}</div>
            <div>
              Block Explorer:{" "}
              <a
                href={`https://sepolia.basescan.org/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {hash.slice(0, 10)}...{hash.slice(-8)}
              </a>
            </div>
          </div>

          <button onClick={handleReset}>
            Send Another Transaction →
          </button>
        </div>
      )}
    </div>
  );
}