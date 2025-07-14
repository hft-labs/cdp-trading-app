"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

/**
 * defaultPortfolio [
  {
    name: 'WETH',
    address: '0x4200000000000000000000000000000000000006',
    symbol: 'WETH',
    decimals: 18,
    image: 'https://d3r81g40ycuhqg.cloudfront.net/wallet/wais/47/bc/47bc3593c2dec7c846b66b7ba5f6fa6bd69ec34f8ebb931f2a43072e5aaac7a8-YmUwNmRjZDUtMjczYy00NDFiLWJhZDUtMzgwNjFmYWM0Njkx',
    chainId: 8453,
    assetId: '600db6d1-1e7a-5bab-bffb-976c775392ba',
    balance: '0.000132483358304661',
    price: 2993.4256420978436,
    value: 0.3965790819004085
  },
  {
    name: 'USDC',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    symbol: 'USDC',
    decimals: 6,
    image: 'https://d3r81g40ycuhqg.cloudfront.net/wallet/wais/44/2b/442b80bd16af0c0d9b22e03a16753823fe826e5bfd457292b55fa0ba8c1ba213-ZWUzYjJmZGUtMDYxNy00NDcyLTg0NjQtMWI4OGEwYjBiODE2',
    chainId: 8453,
    assetId: 'a5e293d2-a416-5937-a804-39200a2becd1',
    balance: '4.6',
    price: 1,
    value: 4.6
  },
  {
    name: 'DEGEN',
    address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
    symbol: 'DEGEN',
    decimals: 18,
    image: 'https://d3r81g40ycuhqg.cloudfront.net/wallet/wais/3b/bf/3bbf118b5e6dc2f9e7fc607a6e7526647b4ba8f0bea87125f971446d57b296d2-MDNmNjY0MmEtNGFiZi00N2I0LWIwMTItMDUyMzg2ZDZhMWNm',
    chainId: 8453,
    balance: '0',
    price: 0.004283089250017495,
    value: 0
  },
  {
    name: 'DAI',
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    symbol: 'DAI',
    decimals: 18,
    image: 'https://d3r81g40ycuhqg.cloudfront.net/wallet/wais/92/13/9213e31b84c98a693f4c624580fdbe6e4c1cb550efbba15aa9ea68fd25ffb90c-ZTE1NmNjMGUtZGVkYi00ZDliLWI2N2QtNTY2ZWRjMmYwZmMw',
    chainId: 8453,
    balance: '0',
    price: 1.0001023942648497,
    value: 0
  },
  {
    name: 'LBTC',
    address: '0xecAc9C5F704e954931349Da37F60E39f515c11c1',
    symbol: 'LBTC',
    decimals: 8,
    image: 'https://d3r81g40ycuhqg.cloudfront.net/wallet/wais/a3/40/a340085995bc54eddbcb66bab87833a7089edd1513847c39fc1799cab9207db4-Zjk2YzQ2MmQtMTY2OS00YWQyLWFkMGQtMjQ3OGYzNzljMWY2',
    chainId: 8453,
    balance: '0',
    price: 119789.17105893628,
    value: 0
  },
  {
    name: 'cbBTC',
    address: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
    symbol: 'cbBTC',
    decimals: 8,
    image: 'https://go.wallet.coinbase.com/static/CBBTCMedium.png',
    chainId: 8453,
    balance: '0',
    price: 119918.4554502938,
    value: 0
  },
  {
    name: 'eUSD',
    address: '0xCfA3Ef56d303AE4fAabA0592388F19d7C3399FB4',
    symbol: 'eUSD',
    decimals: 18,
    image: 'https://d3r81g40ycuhqg.cloudfront.net/wallet/wais/bf/a4/bfa445583916854508ae5d88f9cca19cd5a0910d8c4d7cd9385eb40a597017d7-MDFhM2E0YmQtZGU3NS00Yzk3LWFlMzAtMzA1Y2UyYzU2ZGEy',
    chainId: 8453,
    balance: '0',
    price: 1.0012814337651084,
    value: 0
  },
  {
    name: 'EURC',
    address: '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42',
    symbol: 'EURC',
    decimals: 6,
    image: 'https://d3r81g40ycuhqg.cloudfront.net/wallet/wais/54/f4/54f4216472dd25b1ffb5caf32cc0d81f645c84be166cd713f759a80f05a1418f-M2YxNTczYTItNjk3YS00N2FiLThkZjktYzBiYzExZTk1ZTFj',
    chainId: 8453,
    balance: '0',
    price: 1.1726018299155117,
    value: 0
  }
]
 */

type Position = {
    name: string
    address: string
    symbol: string
    decimals: number
    image: string
    balance: string
    price: number
    value: number
}
interface AssetsTableProps {
    positions: Position[]
}

export function AssetsTable({ positions }: AssetsTableProps) {
    return (
        <div className="rounded-2xl overflow-hidden shadow-xl bg-[#181A20] border border-[#23242A] max-w-4xl mx-auto mt-8">
            <Table className="min-w-full">
                <TableHeader className="bg-[#23242A]">
                    <TableRow>
                        <TableHead className="text-white font-bold text-sm px-6 py-4 border-none">Asset</TableHead>
                        <TableHead className="text-white font-bold text-sm px-6 py-4 border-none">Balance</TableHead>
                        <TableHead className="text-white font-bold text-sm px-6 py-4 border-none">Price</TableHead>
                        <TableHead className="text-white font-bold text-sm px-6 py-4 border-none text-right">Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {positions.map((position, idx) => {
                        const price = position.price
                        const value = position.value
                        const token = position.symbol
                        if (!token) return null
                        return (
                            <TableRow
                                key={position.symbol}
                                className={
                                    `transition-colors border-b border-[#23242A] last:border-0 hover:bg-[#23242A]/60` +
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