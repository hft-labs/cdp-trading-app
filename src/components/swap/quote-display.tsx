"use client";

import { useEffect, useState } from "react";
import { useSwapProvider } from "./swap-provider";
import { useAccountContext } from "@/components/providers/account-provider";
import { Typography } from "@/components/ui/typography";
import { Loader2, ArrowDown, Info } from "lucide-react";
import { getTokenBySymbol } from "@/lib/tokens";

interface PriceData {
  fromAmount: string;
  toAmount: string;
  fromToken: string;
  toToken: string;
  rate?: string;
}

export function PriceDisplay() {
  const { fromAmount, fromToken, toToken, toAmount, setToAmount } = useSwapProvider();
  const { accountAddress } = useAccountContext();
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!fromAmount || !fromToken || !toToken || !accountAddress || parseFloat(fromAmount) <= 0) {
        setPriceData(null);
        setError(null);
        return;
      }

      if (fromToken === toToken) {
        setPriceData(null);
        setError("Cannot swap the same token");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/prices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fromToken,
            toToken,
            fromAmount: parseUnits(fromAmount, getTokenBySymbol(fromToken)?.decimals || 18).toString(),
            taker: accountAddress,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to get quote");
        }

        const data = await response.json();
        
        // Calculate rate
        const rate = (parseFloat(data.fromAmount) / parseFloat(data.toAmount)).toFixed(6);
        
        setPriceData({
          fromAmount: data.fromAmount,
          toAmount: data.toAmount,
          fromToken: data.fromToken,
          toToken: data.toToken,
          rate,
        });

        // Update the toAmount in the swap provider
        setToAmount(data.toAmount);

      } catch (err) {
        console.error("Quote error:", err);
        setError(err instanceof Error ? err.message : "Failed to get quote");
        setPriceData(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the quote request
    const timeoutId = setTimeout(fetchQuote, 500);
    return () => clearTimeout(timeoutId);
  }, [fromAmount, fromToken, toToken, accountAddress, setToAmount]);

  if (!fromAmount || parseFloat(fromAmount) <= 0) {
    return null;
  }

  if (fromToken === toToken) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 text-yellow-500">
          <Info className="h-4 w-4" />
          <Typography type="footnote">Cannot swap the same token</Typography>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 text-red-500">
          <Info className="h-4 w-4" />
          <Typography type="footnote">{error}</Typography>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white/5 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-center gap-2 text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <Typography type="footnote">Getting quote...</Typography>
        </div>
      </div>
    );
  }

  if (!priceData) {
    return null;
  }

  return (
    <div className="bg-white/5 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between mb-2">
        <Typography type="footnote" className="text-zinc-400">Rate</Typography>
        <Typography type="footnote" className="text-white">
          1 {fromToken} = {priceData.rate} {toToken}
        </Typography>
      </div>
      
      <div className="flex items-center justify-center my-2">
        <ArrowDown className="h-4 w-4 text-zinc-400" />
      </div>
      
      <div className="flex items-center justify-between">
        <Typography type="footnote" className="text-zinc-400">You'll receive</Typography>
        <Typography type="p" className="text-white font-medium">
          {parseFloat(priceData.toAmount).toFixed(6)} {toToken}
        </Typography>
      </div>
      
      <div className="mt-2 pt-2 border-t border-white/10">
        <Typography type="footnote" className="text-zinc-400">
          Slippage: 1.00%
        </Typography>
      </div>
    </div>
  );
}

// Helper function to parse units
function parseUnits(value: string, decimals: number): bigint {
  const [whole, fraction = ''] = value.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + paddedFraction);
} 