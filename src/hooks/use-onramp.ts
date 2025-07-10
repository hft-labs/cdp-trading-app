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

    console.log('in onrampaddress', address);
    console.log('partnerUserId', partnerUserId);
    

    return { handleOnramp };
}