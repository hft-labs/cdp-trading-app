import { wallets } from '../db/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { cdp } from './cdp-client';

export async function getAccount(userId: string | undefined) {
    try {
        if (!userId) {
            return {
                owner: null,
                smartAccount: null
            }
        }
        const accountData = await
            db.select().from(wallets)
                .where(
                    eq(wallets.user_id, userId))
                .limit(1);
        let ownerAddress: `0x${string}`
        let smartAccountAddress: `0x${string}`
        if (accountData.length === 0) {
            const newAccount = await createSmartAccount(userId);
            ownerAddress = newAccount.ownerAddress
            smartAccountAddress = newAccount.smartAccountAddress
        } else {
            ownerAddress = accountData[0].owner_address as `0x${string}`
            smartAccountAddress = accountData[0].smart_account_address as `0x${string}`
        }
        const owner = await cdp.evm.getAccount({
            address: ownerAddress,
        })
        const smartAccount = await cdp.evm.getSmartAccount({
            address: smartAccountAddress,
            owner
        })

        return {
            owner,
            smartAccount
        };
    } catch (error) {
        console.error("Error getting account:", error);
        throw error;
    }
}

export async function createSmartAccount(userId: string) {
    try {
        const owner = await cdp.evm.createAccount();
        const smartAccount = await cdp.evm.createSmartAccount({
            owner,
        })
        const account = {
            user_id: userId,
            owner_address: owner.address,
            smart_account_address: smartAccount.address,
        }
        await db.insert(wallets).values({
            user_id: account.user_id,
            owner_address: account.owner_address,
            smart_account_address: account.smart_account_address,
        });
        return {
            userId: userId,
            ownerAddress: owner.address,
            smartAccountAddress: smartAccount.address,
        };
    } catch (error) {
        console.error("Error creating smart account:", error);
        throw error;
    }
}