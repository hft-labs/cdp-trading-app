import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db';
import { accounts } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, userId = 'user_001' } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Check if account already exists
    const existingAccount = await db
      .select()
      .from(accounts)
      .where(eq(accounts.wallet_address, walletAddress));

    if (existingAccount.length > 0) {
      // Update existing account to be active
      await db
        .update(accounts)
        .set({ is_active: true })
        .where(eq(accounts.wallet_address, walletAddress));

      return NextResponse.json({
        success: true,
        message: 'Account activated successfully',
        account: {
          wallet_address: walletAddress,
          is_active: true
        }
      });
    }

    // Create new account
    const newAccount = await db.insert(accounts).values({
      user_id: userId,
      wallet_address: walletAddress,
      network: 'base',
      is_active: true
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'Account created and activated successfully',
      account: newAccount[0]
    });

  } catch (error) {
    console.error('❌ Error activating account:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 