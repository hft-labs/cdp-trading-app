import { usePortfolio } from "@/hooks/use-portfolio";
import { Skeleton } from "@/components/ui/skeleton";

export function TotalValue() {
    const { positions, isPending } = usePortfolio();
    console.log('isPending', isPending);
    console.log('TotalValue - positions:', positions);
    const totalValue = positions.reduce((acc, position) => {
        console.log(`Adding ${position.symbol}: ${position.value} (type: ${typeof position.value}) (balance: ${position.balance}, price: ${position.price})`);
        const numericValue = typeof position.value === 'string' ? parseFloat(position.value) : position.value;
        console.log(`  -> numeric value: ${numericValue}`);
        return acc + numericValue;
    }, 0);
    console.log('TotalValue - calculated total:', totalValue);
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