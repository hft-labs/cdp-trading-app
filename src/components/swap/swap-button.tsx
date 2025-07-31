"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSwapProvider } from "./swap-provider";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useCurrentUser, useEvmAddress, useSendEvmTransaction, useSignEvmTypedData } from "@coinbase/cdp-hooks";
import { getTokenBySymbol } from "@/lib/tokens";
import { concat, createPublicClient, http, numberToHex, parseAbi, parseUnits, size } from "viem";
import { base } from "viem/chains";
import { Address } from "viem";
import { handleTokenAllowance } from "./utils";



const ERC20_ABI = parseAbi([
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)', // Added for balance checks
]);

export function SwapButton() {
  const user = useCurrentUser();
  const isSignedIn = user !== null;
  const router = useRouter();
  const { fromAmount, fromToken, toToken } = useSwapProvider();
  const accountAddress = useEvmAddress();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const sendTransaction = useSendEvmTransaction();
  const signTypedData = useSignEvmTypedData();

  const handleSwap = async () => {
    if (!accountAddress) {
      setErrorMessage("Account not found. Please try refreshing the page.");
      setStatus('error');
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setErrorMessage("Please enter a valid amount to swap.");
      setStatus('error');
      return;
    }

    if (fromToken === toToken) {
      setErrorMessage("Cannot swap the same token.");
      setStatus('error');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      // Convert fromAmount to correct decimals
      const fromTokenObj = getTokenBySymbol(fromToken);
      if (!fromTokenObj) {
        setErrorMessage("Invalid from token.");
        setStatus('error');
        setIsLoading(false);
        return;
      }
      const decimals = fromTokenObj?.decimals ?? 18;
      const amountInSmallestUnits = parseUnits(fromAmount, decimals).toString();

      console.log('Converted fromAmount:', fromAmount, '->', amountInSmallestUnits, 'with decimals', decimals);

      // Fetch the quote from the server
      const response = await fetch("/api/swap", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromToken: fromToken,
          toToken: toToken,
          fromAmount: amountInSmallestUnits,
          address: accountAddress
        })
      });

      const swapData = await response.json();
      console.log('Swap data:', swapData);

      if (!response.ok) {
        throw new Error(swapData.error || 'Swap failed');
      }
      // --- Continue with Permit2 EIP-712 message generation ---
      let txData = swapData.transaction.data;
      if (swapData.permit2?.eip712) {
        console.log("Signing Permit2 message...");
        
        // Sign the Permit2 typed data message
        const signature = await signTypedData({
          domain: swapData.permit2.eip712.domain,
          types: swapData.permit2.eip712.types,
          primaryType: swapData.permit2.eip712.primaryType,
          message: swapData.permit2.eip712.message,
        });
        
        console.log("Permit2 signature obtained");
        
        // Calculate the signature length as a 32-byte hex value
        const signatureLengthInHex = numberToHex(size(signature.signature), {
          signed: false,
          size: 32,
        });
        
        // Append the signature length and signature to the transaction data
        txData = concat([txData, signatureLengthInHex, signature]);
      }

      // Prepare and send the swap transaction
      const maxFeePerGas = swapData.transaction.gasPrice ? BigInt(swapData.transaction.gasPrice) : BigInt("10000000000");
      const maxPriorityFeePerGas = maxFeePerGas < BigInt("1000000000") ? maxFeePerGas : BigInt("1000000000");
      
      const tx = {
        to: swapData.transaction.to,
        value: BigInt(swapData.transaction.value || "0"),
        data: txData,
        gas: swapData.transaction.gas ? BigInt(swapData.transaction.gas) : undefined,
        chainId: 8453,
        type: "eip1559" as const,
        maxFeePerGas,
        maxPriorityFeePerGas,
      };

      console.log('🚀 Executing swap transaction...');
      
      const txResult = await sendTransaction({
        evmAccount: accountAddress,
        transaction: tx,
        network: 'base',
      });

      console.log('✅ Swap transaction sent:', txResult);
      setStatus('success');
      
      setTimeout(() => {
        setStatus('idle');
      }, 3000);

    } catch (error) {
      console.error('Swap error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Swap failed. Please try again.');
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    if (!isSignedIn) {
      return "Sign in to swap";
    }

    if (isLoading) {
      return (
        <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Swapping...
        </>
      );
    }

    if (status === 'success') {
      return (
        <>
          <CheckCircle className="h-5 w-5 mr-2" />
          Swap Successful!
        </>
      );
    }

    if (status === 'error') {
      return (
        <>
          <AlertCircle className="h-5 w-5 mr-2" />
          Swap Failed
        </>
      );
    }

    return "Swap";
  };

  const getButtonVariant = () => {
    if (status === 'success') return 'default';
    if (status === 'error') return 'destructive';
    return 'default';
  };

  const isDisabled = isLoading || status === 'success' || !fromAmount || parseFloat(fromAmount) <= 0 || fromToken === toToken;

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSwap}
        disabled={isDisabled}
        variant={getButtonVariant()}
        className={`w-full font-semibold py-4 rounded-2xl text-lg ${
          status === 'success' 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : status === 'error'
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {getButtonContent()}
      </Button>
      
      {status === 'error' && errorMessage && (
        <div className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-lg">
          {errorMessage}
        </div>
      )}
      
      {status === 'success' && (
        <div className="text-green-500 text-sm text-center bg-green-500/10 p-2 rounded-lg">
          Your swap has been submitted successfully!
        </div>
      )}
    </div>
  );
}
