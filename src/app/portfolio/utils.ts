export const getPortfolio = async (address: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    const response = await fetch(`${baseUrl}/api/portfolio?address=${address}`);
    const data = await response.json();
    return data;
}