"use client"

import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { Token } from "@/types/token"
import { baseTokens } from "@/lib/tokens"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowDown, ChevronDown } from "lucide-react"

export function SwapWidget({ tokens = [...baseTokens] }: { tokens?: Token[] }) {
  const [fromAmount, setFromAmount] = useState("0.0")
  const [toAmount, setToAmount] = useState("0.0")
  const [fromToken, setFromToken] = useState("ETH")
  const [toToken, setToToken] = useState("USDC")
  const [focusedInput, setFocusedInput] = useState("from")

  const handleSwapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const handleMaxClick = (type: "from" | "to") => {
    if (type === "from") {
      setFromAmount("0.00")
    } else {
      setToAmount("0.00")
    }
  }

  const TokenSection = ({
    type,
    amount,
    setAmount,
    tokenSymbol,
    setTokenSymbol,
    isFocused,
  }: {
    type: "from" | "to"
    amount: string
    setAmount: (value: string) => void
    tokenSymbol: string
    setTokenSymbol: (value: string) => void
    isFocused: boolean
  }) => {
    return (
      <div
        className={`p-6 rounded-2xl transition-all duration-200 ${isFocused
            ? "border border-blue-500 bg-gray-900/80"
            : "border border-transparent bg-gray-900/60 hover:bg-gray-900/70"
          }`}
        onClick={() => setFocusedInput(type)}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onFocus={() => setFocusedInput(type)}
              className="text-4xl md:text-5xl lg:text-4xl font-bold !bg-transparent border-none p-0 h-auto text-white placeholder:text-gray-400 focus-visible:ring-0 focus:outline-none focus:ring-0 focus:border-none outline-none ring-0 focus-visible:outline-none focus-visible:ring-offset-0 focus-visible:border-none"
              placeholder="0.0"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700 rounded-2xl px-4 py-3 h-auto w-32 min-w-32"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-lg">{tokenSymbol}</span>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black border-gray-800">
                {tokens.map((tokenOption) => (
                  <DropdownMenuItem
                    key={tokenOption.symbol}
                    onClick={() => setTokenSymbol(tokenOption.symbol)}
                    className="text-gray-300 hover:bg-gray-900 hover:text-white"
                  >
                    {tokenOption.symbol}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-lg">0.00</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMaxClick(type)}
              className="text-blue-400 hover:text-blue-300 h-auto p-0 font-medium text-lg"
            >
              Max
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-black border-gray-800 rounded-3xl">
        <div className="p-6 space-y-4">
          <TokenSection
            type="from"
            amount={fromAmount}
            setAmount={setFromAmount}
            tokenSymbol={fromToken}
            setTokenSymbol={setFromToken}
            isFocused={focusedInput === "from"}
          />

          <div className="flex justify-center -my-2 relative z-10">
            <Button
              onClick={handleSwapTokens}
              variant="secondary"
              size="icon"
              className="bg-gray-800 hover:bg-gray-700 border-gray-700 rounded-2xl w-14 h-14"
            >
              <ArrowDown className="w-6 h-6 text-gray-300" />
            </Button>
          </div>

          <TokenSection
            type="to"
            amount={toAmount}
            setAmount={setToAmount}
            tokenSymbol={toToken}
            setTokenSymbol={setToToken}
            isFocused={focusedInput === "to"}
          />

          <div className="pt-4">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl text-lg">
              Swap
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
