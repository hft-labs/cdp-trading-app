import { Button } from "../ui/button"
import { useSwapProvider } from "./swap-provider";

export const MaxButton = (
    props: {
        type: "from" | "to"
    }
) => {
    if (props.type === "to") {
        return null;
    }
    const { setToAmount } = useSwapProvider();
    const onClick = () => {
        setToAmount("0.00");
    }
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            className="text-blue-400 hover:text-blue-300 h-auto p-0 font-medium text-lg"
        >
            Max
        </Button>
    )
}