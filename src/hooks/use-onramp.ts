"use client";
import { useCallback } from "react";

const redirectUrl = process.env.NEXT_PUBLIC_APP_URL as string;

if (!redirectUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is not set");
}

interface UseOnrampProps {
    address: string;
    partnerUserId: string;
}

export function useOnramp({ address, partnerUserId }: UseOnrampProps) {

    const handleOnramp = useCallback(async () => {
        const sessionResponse = await fetch('/api/session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                addresses: [
                    {
                        address,
                        blockchains: ["base"],
                    }
                ],
                assets: ["USDC"],
            }),
        });

        const sessionData = await sessionResponse.json();
        const sessionToken = sessionData.token;
        const callbackUrl = `${redirectUrl}/explore`;
        const buyUrl = `https://pay.coinbase.com/buy/select-asset?sessionToken=${sessionToken}&partnerUserId=${partnerUserId}&defaultAsset=USDC&defaultNetwork=base&redirectUrl=${encodeURIComponent(callbackUrl)}`;
        window.open(buyUrl, "_blank");
    }, [address, partnerUserId]);

    return { handleOnramp };
}           