import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { accounts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('address');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Check if account exists in database
    const existingAccount = await db
      .select()
      .from(accounts)
      .where(eq(accounts.wallet_address, walletAddress));

    const isActivated = existingAccount.length > 0 && existingAccount[0].is_active;

    return NextResponse.json({
      isActivated,
      account: existingAccount[0] || null,
    });

  } catch (error) {
    console.error('❌ Error checking account status:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 