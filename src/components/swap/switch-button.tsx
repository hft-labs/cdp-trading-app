import { Button } from "../ui/button";
import { useSwapProvider } from "./swap-provider";
import { ArrowDown } from "lucide-react";


export function SwitchButton() {
    const {
        fromAmount, setFromAmount,
        toAmount, setToAmount,
        fromToken, setFromToken,
        toToken, setToToken,
    } = useSwapProvider();

    const handleSwitchTokens = () => {
        setFromToken(toToken);
        setToToken(fromToken);
        setFromAmount(toAmount);
        setToAmount(fromAmount);
    };

    return (
        <Button
            onClick={handleSwitchTokens}
            variant="secondary"
            size="icon"
            
        >
            <ArrowDown className="w-6 h-6 text-gray-300" />
        </Button>
    )
}