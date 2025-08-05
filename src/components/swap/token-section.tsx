"use client";
import { Input } from "@/components/ui/input"
import { useSwapProvider } from "./swap-provider"
import { usePrice } from "../../hooks/use-price"
import { MaxButton } from "./max-button"
import { TokenMenu } from "./token-menu"
import { useBalance } from "@/hooks/use-balance"
import { cn } from "@/lib/utils"

export const TokenSection = ({
    type
  }: {
    type: "from" | "to"
  }) => {
    const {
        setToAmount,
        setFromAmount,
        fromAmount,
        fromToken,
        toToken,
    } = useSwapProvider();


 
    const handleSetAmount = (value: string) => {
        if (type === "from") {
            setFromAmount(value);
        } else {
            setToAmount(value);
        }
    }

    const { quote, loading } = usePrice(fromToken, toToken, fromAmount);

    const currentToken = type === "from" ? fromToken : toToken;
    const { availableBalance, isLoading, error } = useBalance(currentToken);
    
    let amount = "";
    if (type === "from") {
        amount = fromAmount;
    } else {
          amount = loading ? "" : quote?.toAmount ?? "";
    }

    return (
      <div
        className={cn(
          "p-6 rounded-2xl transition-all duration-200 border",
          "bg-gray-900/60 hover:bg-gray-900/70 border-transparent",
          "focus-within:border-blue-500 focus-within:bg-gray-900/80"
        )}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Input
              type="text"
              value={amount}
              onChange={(e) => handleSetAmount(e.target.value)}
              {...(type === "to"
                ? {
                    readOnly: true,
                    tabIndex: -1,
                    className:
                      "pointer-events-none text-4xl md:text-5xl lg:text-4xl font-bold !bg-transparent border-none p-0 h-auto text-white placeholder:text-gray-400",
                  }
                : {
                    className:
                      "text-4xl md:text-5xl lg:text-4xl font-bold !bg-transparent border-none p-0 h-auto text-white placeholder:text-gray-400 focus-visible:ring-0 focus:outline-none focus:ring-0 focus:border-none outline-none ring-0 focus-visible:outline-none focus-visible:ring-offset-0 focus-visible:border-none",
                  })}
              placeholder="0.0"
            />
            <TokenMenu type={type} />
          </div>
          {/* {isLoggedIn && <div className="flex items-center gap-3">
            <span className="text-gray-400 text-lg">
              {availableBalance}
            </span>
            <MaxButton type={type} />
          </div>} */}
        </div>
      </div>
    )
  }