"use client";

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
	const handleOfframp = async () => {
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
		const callbackUrl = `${redirectUrl}/api/offramp/callback`;
		const url = `https://pay.coinbase.com/v3/sell/input?sessionToken=${sessionToken}&partnerUserId=${partnerUserId}&defaultAsset=USDC&defaultNetwork=base&redirectUrl=${encodeURIComponent(callbackUrl)}`;
		console.log('url', url);
		window.open(url, "_blank");
	};

	return { handleOfframp };
}