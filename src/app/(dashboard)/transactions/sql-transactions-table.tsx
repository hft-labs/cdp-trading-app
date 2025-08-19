"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button";
import { useOnramp } from "@/hooks/use-onramp";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft, ExternalLink, Loader2, Database } from "lucide-react";
import { useCurrentUser, useEvmAddress } from "@coinbase/cdp-hooks";
import { useSQLTransactions, type SQLTransaction } from "@/hooks/use-sql-transactions";

export function SQLTransactionsTable() {
    const { currentUser } = useCurrentUser();
    const { evmAddress } = useEvmAddress();
    
    const { transactions, isLoading: loading, error } = useSQLTransactions(evmAddress);
    
    const { handleOnramp } = useOnramp({
        address: evmAddress as string,
        partnerUserId: currentUser?.userId as string,
    });
    
    if (!evmAddress) {
        return null;
    }

    const getTransactionIcon = (type: SQLTransaction['type']) => {
        switch (type) {
            case 'swap':
                return <ArrowRightLeft className="h-4 w-4 text-blue-500" />;
            case 'deposit':
                return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
            case 'withdrawal':
                return <ArrowUpRight className="h-4 w-4 text-red-500" />;
            case 'transfer':
                return <ArrowRightLeft className="h-4 w-4 text-purple-500" />;
            default:
                return <ArrowRightLeft className="h-4 w-4 text-gray-500" />;
        }
    };

    const getTransactionDescription = (tx: SQLTransaction) => {
        // If we have swap details, use them for a more accurate description
        if (tx.type === 'swap' && tx.swapDetails?.description) {
            console.log('Using swap details description:', tx.swapDetails.description);
            return tx.swapDetails.description;
        }
        
        let value = 0;
        let decimals = 18; // Default for ETH
        
        if (tx.asset === 'TOKEN' && tx.tokenDecimals) {
            decimals = tx.tokenDecimals;
        }
        
        value = tx.value ? parseFloat(tx.value) / Math.pow(10, decimals) : 0;
        const formattedValue = value.toFixed(6);
        
        const assetName = tx.asset === 'TOKEN' ? 
            (tx.tokenSymbol || 'Token') : 
            tx.asset;
        
        switch (tx.type) {
            case 'swap':
                return `Swapped ${formattedValue} ${assetName}`;
            case 'deposit':
                return `Deposited ${formattedValue} ${assetName}`;
            case 'withdrawal':
                return `Withdrew ${formattedValue} ${assetName}`;
            case 'transfer':
                return `Transferred ${formattedValue} ${assetName}`;
            default:
                return 'Transaction';
        }
    };

    const getStatusColor = (status: SQLTransaction['status']) => {
        switch (status) {
            case 'confirmed':
                return 'text-green-500';
            case 'pending':
                return 'text-yellow-500';
            case 'failed':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    const getExplorerUrl = (hash: string, network: string) => {
        switch (network) {
            case 'base':
                return `https://basescan.org/tx/${hash}`;
            case 'base-sepolia':
                return `https://sepolia.basescan.org/tx/${hash}`;
            case 'ethereum':
                return `https://etherscan.io/tx/${hash}`;
            default:
                return `https://basescan.org/tx/${hash}`;
        }
    };

    const formatGasUsed = (gasUsed: string) => {
        const gas = parseInt(gasUsed);
        if (gas > 1000000) {
            return `${(gas / 1000000).toFixed(2)}M`;
        } else if (gas > 1000) {
            return `${(gas / 1000).toFixed(2)}K`;
        }
        return gas.toString();
    };

    if (loading) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] bg-black w-full shadow-xl">
                <div className="flex items-center gap-2 text-white">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-lg">Loading transactions from SQL API...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] bg-black w-full shadow-xl">
                <div className="text-2xl font-semibold text-white mb-2">Error loading transactions</div>
                <div className="text-zinc-400 mb-6">{error instanceof Error ? error.message : 'Failed to load transaction history'}</div>
                <Button
                    onClick={() => window.location.reload()}
                    variant="ghost"
                    className="bg-white text-black"
                >
                    Try Again
                </Button>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] bg-black w-full shadow-xl">
                <div className="text-2xl font-semibold text-white mb-2">No transactions found</div>
                <div className="text-zinc-400 mb-4">This could be because:</div>
                <div className="text-zinc-400 mb-6 text-center max-w-md">
                    • You haven't made any transactions on Base network yet<br/>
                    • The SQL API is not configured or accessible<br/>
                    • Your wallet address has no transaction history
                </div>
                <Button
                    onClick={handleOnramp}
                    variant="ghost"
                    className="bg-white text-black"
                >
                    Deposit Now
                </Button>
            </div>
        );
    }

    return (
        <div className="overflow-hidden shadow-xl bg-black w-full h-full">
            <Table className="min-w-full">
                <TableHeader className="border-none !border-0 bg-black">
                    <TableRow className="!border-0">
                        <TableHead className="text-white/60 font-bold text-sm px-6 py-4 border-none">Type</TableHead>
                        <TableHead className="text-white/60 font-bold text-sm px-6 py-4 border-none">Asset</TableHead>
                        <TableHead className="text-white/60 font-bold text-sm px-6 py-4 border-none">Description</TableHead>
                        <TableHead className="text-white/60 font-bold text-sm px-6 py-4 border-none">Status</TableHead>
                        <TableHead className="text-white/60 font-bold text-sm px-6 py-4 border-none">Gas Used</TableHead>
                        <TableHead className="text-white/60 font-bold text-sm px-6 py-4 border-none">Time</TableHead>
                        <TableHead className="text-white/60 font-bold text-sm px-6 py-4 border-none text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="bg-black">
                    {transactions.map((tx, idx) => (
                        <TableRow
                            key={tx.hash}
                            className={`!border-0 transition-colors hover:bg-[#23242A]/60`}
                        >
                            <TableCell className="font-semibold px-6 py-4 text-white/90 align-middle">
                                <div className="flex items-center gap-3">
                                    {getTransactionIcon(tx.type)}
                                    <span className="text-base font-semibold text-white/90 capitalize">{tx.type}</span>
                                </div>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-zinc-300 align-middle font-medium">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    tx.asset === 'ETH' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                                }`}>
                                    {tx.asset === 'TOKEN' ? (tx.tokenSymbol || 'Token') : tx.asset}
                                </span>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-zinc-300 align-middle font-medium">
                                {getTransactionDescription(tx)}
                            </TableCell>
                            <TableCell className="px-6 py-4 text-zinc-300 align-middle font-medium">
                                <span className={`capitalize ${getStatusColor(tx.status)}`}>
                                    {tx.status}
                                </span>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-zinc-300 align-middle font-medium">
                                {formatGasUsed(tx.gasUsed)}
                            </TableCell>
                            <TableCell className="px-6 py-4 text-zinc-300 align-middle font-medium">
                                {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
                            </TableCell>
                            <TableCell className="px-6 py-4 text-right text-zinc-300 align-middle font-medium">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(getExplorerUrl(tx.hash, tx.network), '_blank')}
                                    className="text-blue-500 hover:text-blue-400"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            
            {/* SQL API Integration Note */}
            <div className="p-4 border-t border-white/10">
                <div className="text-xs text-zinc-400 text-center flex items-center justify-center gap-2">
                    <Database className="h-3 w-3" />
                    Powered by Coinbase SQL API • Real-time blockchain data • Base network transactions
                </div>
            </div>
        </div>
    )
} 