import { NextRequest, NextResponse } from 'next/server';

interface SQLQueryRequest {
    sql: string;
}

interface SQLQueryResponse {
    result: any[];
    schema: {
        columns: Array<{
            name: string;
            type: string;
        }>;
    };
    metadata: {
        cached: boolean;
        executionTimeMs: number;
        rowCount: number;
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: SQLQueryRequest = await request.json();
        const { sql } = body;

        if (!sql) {
            return NextResponse.json(
                { error: 'SQL query is required' },
                { status: 400 }
            );
        }

        // Generate JWT token for CDP API authentication
        // This is a simplified version - you'll need to implement proper JWT signing
        const apiKeyId = process.env.CDP_API_KEY_ID;
        const apiKeySecret = process.env.CDP_API_KEY_SECRET;

        if (!apiKeyId || !apiKeySecret) {
            return NextResponse.json(
                { error: 'CDP API credentials not configured' },
                { status: 500 }
            );
        }

        // Log the request for debugging
        console.log('SQL API request:', { sql: sql.substring(0, 100) + '...' });

        // Generate JWT token for CDP API authentication using the correct host
        const { generateJwt } = await import('@coinbase/cdp-sdk/auth');
        
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
            console.error('SQL API Error:', response.status, errorText);
            console.error('Request details:', { sql: sql.substring(0, 100) + '...' });
            console.error('Response headers:', Object.fromEntries(response.headers.entries()));
            return NextResponse.json(
                { error: `SQL API Error: ${response.status}`, details: errorText },
                { status: response.status }
            );
        }

        const responseText = await response.text();
        console.log('SQL API Response:', responseText.substring(0, 200) + '...');
        
        let data: SQLQueryResponse;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Response text:', responseText);
            return NextResponse.json(
                { error: 'Invalid JSON response from SQL API' },
                { status: 500 }
            );
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('SQL Query API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 