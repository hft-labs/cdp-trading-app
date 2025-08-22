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
import { Skeleton } from "@/components/ui/skeleton";
import { useOnramp } from "@/hooks/use-onramp";
import { usePortfolio } from "@/hooks/use-portfolio";
import { useCurrentUser, useEvmAddress } from "@coinbase/cdp-hooks";

export function AssetsTable() {
    const { evmAddress } = useEvmAddress();
    const { currentUser } = useCurrentUser();
    console.log('currentUser', currentUser);
    const { positions, isPending, error } = usePortfolio();
    const { handleOnramp } = useOnramp({
        address: evmAddress as string,
        partnerUserId: currentUser?.userId as string,
    });

    if (isPending) {
        return (
            <div className="overflow-hidden shadow-xl bg-black w-full h-full">
                <Table className="min-w-full">
                    <TableHeader className="border-none !border-0 bg-black">
                        <TableRow className="!border-0">
                            <TableHead className="text-white/60 font-bold text-sm px-6 py-4 border-none">Asset</TableHead>
                            <TableHead className="text-white/60 font-bold text-sm px-6 py-4 border-none">Balance</TableHead>
                            <TableHead className="text-white/60 font-bold text-sm px-6 py-4 border-none">Price</TableHead>
                            <TableHead className="text-white/60 font-bold text-sm px-6 py-4 border-none text-right">Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-black">
                        {[...Array(5)].map((_, idx) => (
                            <TableRow key={idx} className="!border-0">
                                <TableCell className="px-6 py-4 align-middle">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-8 h-8 rounded-full bg-gray-700" />
                                        <Skeleton className="h-5 w-16 bg-gray-700" />
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 align-middle">
                                    <Skeleton className="h-5 w-20 bg-gray-700" />
                                </TableCell>
                                <TableCell className="px-6 py-4 align-middle">
                                    <Skeleton className="h-5 w-16 bg-gray-700" />
                                </TableCell>
                                <TableCell className="px-6 py-4 text-right align-middle">
                                    <Skeleton className="h-5 w-20 bg-gray-700 ml-auto" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] bg-black w-full shadow-xl">
                <div className="text-2xl font-semibold text-white mb-2">Error loading assets</div>
                <div className="text-zinc-400">There was an issue loading your portfolio data.</div>
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

    console.log('Portfolio positions:', positions);
    console.log('Checking if portfolio is empty...');
    console.log('Positions length:', positions?.length);
    console.log('Positions with zero value:', positions?.filter(p => !p.value || Number(p.value) === 0).map(p => p.symbol));
    console.log('All position values:', positions?.map(p => ({ symbol: p.symbol, value: p.value, balance: p.balance })));
    
    // Check if any position has a non-zero balance, even if value is 0 (for very small amounts)
    const hasAnyBalance = positions?.some(p => {
        const balanceNum = parseFloat(p.balance);
        return balanceNum > 0;
    });
    
    console.log('Has any balance:', hasAnyBalance);
    
    // Show positions if they have any balance, even if value is 0 (for very small amounts or failed price fetches)
    const isEmpty = !positions || positions.length === 0 || !hasAnyBalance;

    if (isEmpty) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] bg-black w-full h-full shadow-xl">
                <div className="text-2xl font-semibold text-white mb-2">You don't have any assets yet</div>
                <div className="text-zinc-400">Start by making your first deposit to see your assets here.</div>
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
                        <TableHead className="text-white/60 font-bold text-sm px-6 py-4 border-none">Asset</TableHead>
                        <TableHead className="text-white/60 font-bold text-sm px-6 py-4 border-none">Balance</TableHead>
                        <TableHead className="text-white/60 font-bold text-sm px-6 py-4 border-none">Price</TableHead>
                        <TableHead className="text-white/60 font-bold text-sm px-6 py-4 border-none text-right">Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="bg-black">
                    {positions.map((position, idx) => {
                        const price = position.price
                        const value = position.value
                        const token = position.symbol
                        const balanceNum = parseFloat(position.balance)
                        
                        console.log(`Rendering position ${token}: balance=${position.balance}, value=${value}, balanceNum=${balanceNum}`);
                        
                        if (!token) return null
                        return (
                            <TableRow
                                key={position.symbol}
                                className={
                                    `!border-0 transition-colors hover:bg-[#23242A]/60` +
                                    (idx === 0 ? "" : "")
                                }
                            >
                                <TableCell className="font-semibold px-6 py-4 text-white/90 align-middle">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={position.image}
                                            alt={token}
                                            className="w-8 h-8 rounded-full border border-[#23242A] bg-[#23242A] object-cover shadow-sm"
                                        />
                                        <span className="text-base font-semibold text-white/90">{token.toUpperCase()}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-zinc-300 align-middle font-medium">
                                    {parseFloat(position.balance) > 0 ? 
                                        (parseFloat(position.balance) < 0.001 ? 
                                            parseFloat(position.balance).toFixed(12) : 
                                            position.balance
                                        ) : 
                                        '0.000000'
                                    }
                                </TableCell>
                                <TableCell className="px-6 py-4 text-zinc-300 align-middle font-medium">
                                    ${price > 0 ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                                </TableCell>
                                <TableCell className="px-6 py-4 text-right text-zinc-300 align-middle font-medium">
                                    ${value > 0 ? 
                                        (value < 0.01 ? 
                                            value.toFixed(6) : 
                                            value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                        ) : 
                                        '0.00'
                                    }
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
} 