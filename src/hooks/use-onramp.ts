"use client";
import { useCallback } from "react";

const appId = process.env.NEXT_PUBLIC_COINBASE_APP_ID as string;
const redirectUrl = process.env.NEXT_PUBLIC_APP_URL as string;

if (!appId) {
    throw new Error("NEXT_PUBLIC_COINBASE_APP_ID is not set");
}

if (!redirectUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is not set");
}

interface UseOnrampProps {
    address: string;
    partnerUserId: string;
}

export function useOnramp({ address, partnerUserId }: UseOnrampProps) {

    const handleOnramp = useCallback(() => {
        const callbackUrl = `${redirectUrl}/explore`;
        const buyUrl = `https://pay.coinbase.com/buy/select-asset?appId=${process.env.NEXT_PUBLIC_COINBASE_APP_ID}&addresses={"${address}":["base"]}&assets=["USDC"]&partnerUserId=${partnerUserId}&redirectUrl=${encodeURIComponent(callbackUrl)}`;
        window.open(buyUrl, "_blank");
    }, [address, partnerUserId]);

    return { handleOnramp };
}