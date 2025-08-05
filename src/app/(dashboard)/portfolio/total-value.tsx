import { usePortfolio } from "@/hooks/use-portfolio";
import { Skeleton } from "@/components/ui/skeleton";

export function TotalValue() {
    const { positions, isPending } = usePortfolio();
    console.log('isPending', isPending);
    const totalValue = positions.reduce((acc, position) => acc + position.value, 0);
    if (isPending) {
        return (
            <div className="bg-black rounded-tl-xl px-8 pt-6 pb-4">
                <Skeleton className="h-12 w-32 bg-gray-700" />
            </div>
        );
    }
    return (
        <div className="bg-black rounded-tl-xl px-8 pt-6 pb-4">
            <span className="text-5xl font-semibold text-white block">${totalValue.toFixed(2)}</span>
        </div>
    )
}