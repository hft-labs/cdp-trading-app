import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { accounts, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cdp } from '@/lib/cdp-client';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, accessToken } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    // Validate the access token with CDP
    let endUser;
    try {
      endUser = await cdp.endUser.validateAccessToken({
        accessToken,
      });
      console.log('endUser', endUser);
    } catch (authError) {
      const errorMessage =
        (authError as { errorMessage?: string }).errorMessage ??
        (authError as { message?: string }).message ??
        "Authentication failed";
      return NextResponse.json(
        { error: 'Authentication failed', details: errorMessage },
        { status: 401 }
      );
    }

    // Use the authenticated user's ID from CDP
    const userId = endUser.userId;

    // Check if user exists, if not create them
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.user_id, userId));

    if (existingUser.length === 0) {
      // Create new user with end user data
      await db.insert(users).values({
        user_id: userId,
        authentication_methods: endUser.authenticationMethods || [],
        evm_accounts: endUser.evmAccounts || [],
        evm_smart_accounts: endUser.evmSmartAccounts || [],
        solana_accounts: endUser.solanaAccounts || [],
      });
    } else {
      // Update existing user with latest data
      await db
        .update(users)
        .set({
          authentication_methods: endUser.authenticationMethods || [],
          evm_accounts: endUser.evmAccounts || [],
          evm_smart_accounts: endUser.evmSmartAccounts || [],
          solana_accounts: endUser.solanaAccounts || [],
          updated_at: new Date(),
        })
        .where(eq(users.user_id, userId));
    }

    // Check if account already exists
    const existingAccount = await db
      .select()
      .from(accounts)
      .where(eq(accounts.wallet_address, walletAddress));

    if (existingAccount.length > 0) {
      // Update existing account to be active and update user_id if needed
      await db
        .update(accounts)
        .set({ 
          is_active: true,
          user_id: userId // Update with authenticated user ID
        })
        .where(eq(accounts.wallet_address, walletAddress));

      return NextResponse.json({
        success: true,
        message: 'Account activated successfully',
        account: {
          wallet_address: walletAddress,
          user_id: userId,
          is_active: true
        },
        user: {
          user_id: userId,
          authentication_methods: endUser.authenticationMethods,
          evm_accounts: endUser.evmAccounts,
          evm_smart_accounts: endUser.evmSmartAccounts,
          solana_accounts: endUser.solanaAccounts,
        },
        endUser
      });
    }

    // Create new account with authenticated user ID
    const newAccount = await db.insert(accounts).values({
      user_id: userId,
      wallet_address: walletAddress,
      network: 'base',
      is_active: true
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'Account created and activated successfully',
      account: newAccount[0],
      user: {
        user_id: userId,
        authentication_methods: endUser.authenticationMethods,
        evm_accounts: endUser.evmAccounts,
        evm_smart_accounts: endUser.evmSmartAccounts,
        solana_accounts: endUser.solanaAccounts,
      },
      endUser
    });

  } catch (error) {
    console.error('❌ Error activating account:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 