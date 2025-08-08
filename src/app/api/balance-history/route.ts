import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // Get balance history from database
    const result = await db.execute(sql`
      SELECT 
        DATE(bh.recorded_at) as date,
        SUM(bh.balance_usd) as daily_value
      FROM balance_history bh
      JOIN accounts a ON bh.account_id = a.id
      WHERE a.wallet_address = ${address}
      GROUP BY DATE(bh.recorded_at)
      ORDER BY date ASC
    `);

    const historyData = result.rows as any[];
    
    // Convert to chart format
    const chartPoints = historyData.map((row: any) => ({
      date: row.date,
      value: parseFloat(row.daily_value.toString())
    }));

    return NextResponse.json({ data: chartPoints });
  } catch (error) {
    console.error('Error fetching balance history:', error);
    return NextResponse.json({ error: 'Failed to fetch balance history' }, { status: 500 });
  }
} 