import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Token } from "@/types/token";
import { baseTokens } from "@/lib/tokens";

export const TokenSection = ({
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
    const tokens = baseTokens;
    return (
      <div
        className={`p-6 rounded-2xl transition-all duration-200 ${isFocused
            ? "border border-blue-500 bg-gray-900/80"
            : "border border-transparent bg-gray-900/60 hover:bg-gray-900/70"
          }`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
                {tokens.map((tokenOption: Token) => (
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
              onClick={() => {}}
              className="text-blue-400 hover:text-blue-300 h-auto p-0 font-medium text-lg"
            >
              Max
            </Button>
          </div>
        </div>
      </div>
    )
  }