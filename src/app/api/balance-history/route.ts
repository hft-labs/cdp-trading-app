import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // First, let's see what's actually in the balance_history table
    const debugResult = await db.execute(sql`
      SELECT 
        bh.recorded_at,
        t.symbol,
        bh.balance_usd,
        bh.balance_amount
      FROM balance_history bh
      JOIN accounts a ON bh.account_id = a.id
      JOIN tokens t ON bh.token_id = t.id
      WHERE a.wallet_address = ${address}
      ORDER BY bh.recorded_at DESC
      LIMIT 20
    `);
    console.log("Debug - Recent balance history entries:", debugResult.rows);

    const result = await db.execute(sql`
      WITH unique_snapshots AS (
        SELECT 
          bh.recorded_at,
          bh.token_id,
          bh.balance_usd,
          ROW_NUMBER() OVER (
            PARTITION BY DATE_TRUNC('minute', bh.recorded_at), bh.token_id
            ORDER BY bh.recorded_at DESC
          ) as rn
        FROM balance_history bh
        JOIN accounts a ON bh.account_id = a.id
        WHERE a.wallet_address = ${address}
      )
      SELECT 
        DATE_TRUNC('minute', recorded_at) as timestamp,
        SUM(balance_usd) as total_value
      FROM unique_snapshots
      WHERE rn = 1
      GROUP BY DATE_TRUNC('minute', recorded_at)
      ORDER BY DATE_TRUNC('minute', recorded_at) ASC
    `);

    const historyData = result.rows as any[];
    console.log("historyData", historyData);
    
    const chartPoints = historyData.map((row: any) => ({
      date: row.timestamp,
      value: parseFloat(row.total_value.toString())
    }));

    return NextResponse.json({ data: chartPoints });
  } catch (error) {
    console.error('Error fetching balance history:', error);
    return NextResponse.json({ error: 'Failed to fetch balance history' }, { status: 500 });
  }
} 