import { generateJwt } from '@coinbase/cdp-sdk/auth';

export async function runSQLQueryServer(sql: string) {
    const apiKeyId = process.env.CDP_API_KEY_ID;
    const apiKeySecret = process.env.CDP_API_KEY_SECRET;

    if (!apiKeyId || !apiKeySecret) {
        throw new Error('CDP API credentials not configured');
    }

    const jwt = await generateJwt({
        apiKeyId: apiKeyId,
        apiKeySecret: apiKeySecret,
        requestMethod: 'POST',
        requestHost: 'api.cdp.coinbase.com',
        requestPath: '/platform/v2/data/query/run',
        expiresIn: 120
    });

    const url = 'https://api.cdp.coinbase.com/platform/v2/data/query/run';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`CDP API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
}