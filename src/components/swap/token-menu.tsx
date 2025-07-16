import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";
import { baseTokens } from "@/lib/tokens";
import { useSwapProvider } from "./swap-provider";

export const TokenMenu = ({
  type
}: {
  type: "from" | "to";
}) => {
  const { fromToken, toToken, setFromToken, setToToken } = useSwapProvider();

  const onClick = (symbol: string) => {
    if (type === "from") {
      setFromToken(symbol);
    } else {
      setToToken(symbol);
    }
  }

  return (
    <DropdownMenu modal={true}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          
        >
          <div className="flex items-center gap-3">
            <span className="font-semibold text-lg">{type === "from" ? fromToken : toToken}</span>
            <ChevronDown className="w-5 h-5" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-black border-gray-800">
        {baseTokens.map((tokenOption) => (
          <DropdownMenuItem
            key={tokenOption.symbol}
            onClick={() => onClick(tokenOption.symbol)}
            className="text-gray-300 hover:bg-gray-900 hover:text-white"
          >
            {tokenOption.symbol}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}