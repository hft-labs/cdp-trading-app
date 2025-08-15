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

interface SQLQueryRequest {
    sql: string;
}

export async function runSQLQuery(sql: string): Promise<SQLQueryResponse> {
    const response = await fetch('/api/sql-query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql } as SQLQueryRequest),
    });

    if (!response.ok) {
        throw new Error(`SQL API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
} 