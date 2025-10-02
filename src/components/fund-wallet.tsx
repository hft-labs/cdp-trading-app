"use client";

import {
  FundModal,
  type FundModalProps,
} from "@coinbase/cdp-react";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { useCallback } from "react";

import { getBuyOptions, createBuyQuote } from "@/lib/onramp-api";

/**
 * A component that wraps the FundModal component
 *
 * @param props - The props for the FundWallet component
 * @param props.onSuccess - The callback function to call when the onramp purchase is successful
 * @returns The FundWallet component
 */
export default function FundWallet({ onSuccess }: { onSuccess: () => void }) {
  const { evmAddress } = useEvmAddress();

  // Get the user's location (i.e. from IP geolocation)
  const userCountry = "US";

  // If user is in the US, the state is also required
  const userSubdivision = userCountry === "US" ? "CA" : undefined;

  // Call your buy quote endpoint
  const fetchBuyQuote: FundModalProps["fetchBuyQuote"] = useCallback(async params => {
    return createBuyQuote(params);
  }, []);

  // Call your buy options endpoint
  const fetchBuyOptions: FundModalProps["fetchBuyOptions"] = useCallback(async params => {
    return getBuyOptions(params);
  }, []);

  return (
    <FundModal
      country={userCountry}
      subdivision={userSubdivision}
      cryptoCurrency="eth"
      fiatCurrency="usd"
      fetchBuyQuote={fetchBuyQuote}
      fetchBuyOptions={fetchBuyOptions}
      network="base"
      presetAmountInputs={[10, 25, 50]}
      onSuccess={onSuccess}
      destinationAddress={evmAddress as string}
    />
  );
}