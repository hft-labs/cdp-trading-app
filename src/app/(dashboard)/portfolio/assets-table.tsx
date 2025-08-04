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
import { usePortfolio } from "@/hooks/use-portfolio";
import { useCurrentUser, useEvmAddress } from "@coinbase/cdp-hooks";

export function AssetsTable() {
    const address = useEvmAddress();
    const user = useCurrentUser();
    const { positions, isLoading, error } = usePortfolio();
    const { handleOnramp } = useOnramp({
        address: address as string,
        partnerUserId: user?.userId as string,
    });

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] bg-black w-full shadow-xl">
                <div className="text-2xl font-semibold text-white mb-2">Loading your assets...</div>
                <div className="text-zinc-400 mb-6">Please wait while we fetch your portfolio data.</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] bg-black w-full shadow-xl">
                <div className="text-2xl font-semibold text-white mb-2">Error loading assets</div>
                <div className="text-zinc-400 mb-6">There was an issue loading your portfolio data.</div>
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

    const isEmpty = !positions || positions.length === 0 || positions.every((p) => !p.value || Number(p.value) === 0);

    if (isEmpty) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] bg-black w-full shadow-xl">
                <div className="text-2xl font-semibold text-white mb-2">You don't have any assets yet</div>
                <div className="text-zinc-400 mb-6">Start by making your first deposit to see your assets here.</div>
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
                                <TableCell className="px-6 py-4 text-zinc-300 align-middle font-medium">{position.balance}</TableCell>
                                <TableCell className="px-6 py-4 text-zinc-300 align-middle font-medium">${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                <TableCell className="px-6 py-4 text-right text-zinc-300 align-middle font-medium">
                                    ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
} 