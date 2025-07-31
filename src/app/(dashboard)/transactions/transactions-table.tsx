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
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft, ExternalLink, Loader2 } from "lucide-react";
import { useCurrentUser, useEvmAddress } from "@coinbase/cdp-hooks";

interface Transaction {
    hash: string;
    timestamp: string;
    type: 'swap' | 'transfer' | 'deposit' | 'withdrawal';
    from: string;
    to: string;
    value: string;
    asset: string;
    status: 'pending' | 'confirmed' | 'failed';
    blockNumber?: string;
    gasUsed?: string;
    network: string;
}

export function TransactionsTable() {
    const user = useCurrentUser();
    if (!user) {
        return null;
    }
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const accountAddress = useEvmAddress();
   
    const { handleOnramp } = useOnramp({
        address: accountAddress || "",
        partnerUserId: user?.userId || "",
    });

    useEffect(() => {
        const fetchTransactions = async () => {
            if (!accountAddress) return;
            
            try {
                setLoading(true);
                setError(null);
                
            console.log("accountAddress", accountAddress);
                const response = await fetch(`/api/transactions?address=${accountAddress}&network=base&limit=50`);
                console.log("response", response);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                setTransactions(data.transactions || []);
                
            } catch (error) {
                console.error("Error fetching transactions:", error);
                setError("Failed to load transaction history");
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [accountAddress]);

    const getTransactionIcon = (type: Transaction['type']) => {
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

    const getTransactionDescription = (tx: Transaction) => {
        switch (tx.type) {
            case 'swap':
                return `Swapped ${tx.value} ${tx.asset}`;
            case 'deposit':
                return `Deposited ${tx.value} ${tx.asset}`;
            case 'withdrawal':
                return `Withdrew ${tx.value} ${tx.asset}`;
            case 'transfer':
                return `Transferred ${tx.value} ${tx.asset}`;
            default:
                return 'Transaction';
        }
    };

    const getStatusColor = (status: Transaction['status']) => {
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

    if (loading) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] bg-black w-full shadow-xl">
                <div className="flex items-center gap-2 text-white">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-lg">Loading transactions...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] bg-black w-full shadow-xl">
                <div className="text-2xl font-semibold text-white mb-2">Error loading transactions</div>
                <div className="text-zinc-400 mb-6">{error}</div>
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
                <div className="text-2xl font-semibold text-white mb-2">No transactions yet</div>
                <div className="text-zinc-400 mb-6">Start trading to see your transaction history here.</div>
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
                        <TableHead className="text-white/60 font-bold text-sm px-6 py-4 border-none">Description</TableHead>
                        <TableHead className="text-white/60 font-bold text-sm px-6 py-4 border-none">Status</TableHead>
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
                                {getTransactionDescription(tx)}
                            </TableCell>
                            <TableCell className="px-6 py-4 text-zinc-300 align-middle font-medium">
                                <span className={`capitalize ${getStatusColor(tx.status)}`}>
                                    {tx.status}
                                </span>
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
            
            {/* CDP Integration Note */}
            <div className="p-4 border-t border-white/10">
                <div className="text-xs text-zinc-400 text-center">
                    💡 Powered by CDP Wallet History API • Real-time transaction data • Multi-chain support
                </div>
            </div>
        </div>
    )
} 