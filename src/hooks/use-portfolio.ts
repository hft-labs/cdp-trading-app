import { useQuery } from "@tanstack/react-query";
import { useEvmAddress, useIsInitialized } from "@coinbase/cdp-hooks";

export interface PortfolioPosition {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    image: string;
    chainId: number;
    balance: string;
    price: number;
    value: number;
}

export interface PortfolioData {
    positions: PortfolioPosition[];
}

export const usePortfolio = () => {
    const { evmAddress } = useEvmAddress();
    const { isInitialized } = useIsInitialized();
    
    const { data, isLoading, isPending, error } = useQuery({
        queryKey: ['portfolio', evmAddress],
        queryFn: async (): Promise<PortfolioData> => {
            if (!evmAddress) {
                throw new Error("Address is required");
            }
            console.log('Fetching portfolio for address:', evmAddress);
            const response = await fetch(`/api/portfolio?address=${evmAddress}`);
            if (!response.ok) {
                throw new Error("Failed to fetch portfolio data");
            }
            const result = await response.json();
            console.log('Portfolio API response:', result);
            return result;
            },
            enabled: !!evmAddress && isInitialized,
        refetchInterval: 5000, // Refetch every 5 seconds
    });

    return {
        portfolio: data,
        positions: data?.positions || [],
        isPending,
        error,
    };
}; 