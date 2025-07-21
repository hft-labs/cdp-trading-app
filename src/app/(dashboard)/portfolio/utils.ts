import { baseUrl } from "@/lib/utils/api";

export const getPortfolio = async (address: string) => {
    const response = await fetch(`${baseUrl}/api/portfolio?address=${address}`);
    const data = await response.json();
    return data.positions;
}