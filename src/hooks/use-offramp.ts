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

interface UseOfframpProps {
	address: string;
	partnerUserId: string;
}

export function useOfframp({ address, partnerUserId }: UseOfframpProps) {
	const assets = ["USDC"];
	const assetsString = JSON.stringify(assets);
	const handleOfframp = useCallback(() => {
		const callbackUrl = `${redirectUrl}/api/offramp/callback`;
		const url = `https://pay.coinbase.com/v3/sell/input?appId=${appId}&partnerUserId=${partnerUserId}&addresses={"${address}":["base"]}&assets=${assetsString}&redirectUrl=${encodeURIComponent(callbackUrl)}`;
		window.open(url, "_blank");
	}, [address, partnerUserId, assetsString]);

	return { handleOfframp };
}