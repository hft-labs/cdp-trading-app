"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useSwapProvider } from "./swap-provider";
import { useAccountContext } from "@/components/providers/account-provider";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export function SwapButton() {
  const user = useUser();
  const isSignedIn = user !== null;
  const router = useRouter();
  const { fromAmount, fromToken, toToken, toAmount } = useSwapProvider();
  const { accountAddress } = useAccountContext();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSwap = async () => {
    if (!isSignedIn) {
      router.push("/handler/sign-in");
      return;
    }

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
      const response = await fetch("/api/swap", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromToken: fromToken,
          toToken: toToken,
          fromAmount: fromAmount
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Swap failed');
      }

      setStatus('success');
      console.log('Swap successful:', data);
      
      // Reset form after successful swap
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
