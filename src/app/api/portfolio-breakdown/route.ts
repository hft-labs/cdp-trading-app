import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    // Get current portfolio breakdown
    const result = await db.execute(sql`
      SELECT 
        t.symbol,
        t.name,
        tb.balance_amount,
        tb.balance_usd,
        tb.token_price_usd,
        ROUND(tb.balance_usd::numeric, 2) as rounded_usd_value
      FROM token_balances tb
      JOIN tokens t ON tb.token_id = t.id
      JOIN accounts a ON tb.account_id = a.id
      WHERE a.wallet_address = ${address}
      ORDER BY tb.balance_usd DESC
    `);

    // Calculate total portfolio value
    const totalValue = result.rows.reduce((sum: number, row: any) => {
      return sum + parseFloat(row.balance_usd || '0');
    }, 0);

    // Format the response
    const portfolio = {
      wallet_address: address,
      total_value: Math.round(totalValue * 100) / 100,
      assets: result.rows.map((row: any) => ({
        symbol: row.symbol,
        name: row.name,
        balance: parseFloat(row.balance_amount).toFixed(6),
        price_usd: parseFloat(row.token_price_usd).toFixed(2),
        value_usd: parseFloat(row.balance_usd).toFixed(2),
        percentage: totalValue > 0 ? ((parseFloat(row.balance_usd) / totalValue) * 100).toFixed(1) : '0.0'
      }))
    };

    return NextResponse.json(portfolio);

  } catch (error) {
    console.error('❌ Error fetching portfolio breakdown:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 