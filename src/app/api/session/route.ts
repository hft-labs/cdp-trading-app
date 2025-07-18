import { NextRequest, NextResponse } from 'next/server';
import { generateJWT } from '@/lib/session-token-api';

interface SessionTokenRequest {
    addresses: Array<{
        address: string;
        blockchains: string[];
    }>;
    assets?: string[];
}

export async function POST(request: NextRequest) {
    const keyName = process.env.CDP_API_KEY_ID;
    const keySecret = process.env.CDP_API_KEY_SECRET;

    if (!keyName || !keySecret) {
        return NextResponse.json(
            {
                error: 'Missing CDP API credentials. Please set CDP_API_KEY and CDP_API_SECRET environment variables.',
            },
            { status: 500 }
        );
    }

    const body = await request.json();
    const { addresses, assets } = body as SessionTokenRequest;

    if (!addresses || addresses.length === 0) {
        return NextResponse.json(
            {
                error: 'Addresses parameter is required',
            },
            { status: 400 }
        );
    }

    const jwtToken = await generateJWT(keyName, keySecret);

    const cdpApiUrl = 'https://api.developer.coinbase.com/onramp/v1/token';

    const requestBody = {
        addresses,
        ...(assets && { assets }),
    };

    const response = await fetch(cdpApiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();

    const data = JSON.parse(responseText);

    return NextResponse.json({
        token: data.token,
        channel_id: data.channelId || data.channel_id,
    });
} 