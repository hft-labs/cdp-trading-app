import { useQuery } from "@tanstack/react-query";
import { useEvmAddress } from "@coinbase/cdp-hooks";

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
    const address = useEvmAddress();
    
    const { data, isLoading, error } = useQuery({
        queryKey: ['portfolio', address],
        queryFn: async (): Promise<PortfolioData> => {
            if (!address) {
                throw new Error("Address is required");
            }
            const response = await fetch(`/api/portfolio?address=${address}`);
            if (!response.ok) {
                throw new Error("Failed to fetch portfolio data");
            }
            return response.json();
        },
        enabled: !!address,
        refetchInterval: 5000, // Refetch every 5 seconds
    });

    return {
        portfolio: data,
        positions: data?.positions || [],
        isLoading,
        error,
    };
}; 