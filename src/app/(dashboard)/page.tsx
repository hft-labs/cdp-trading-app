'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useEvmAddress, useIsInitialized, useGetAccessToken, useIsSignedIn } from "@coinbase/cdp-hooks";
import { usePortfolio } from "@/hooks/use-portfolio";
import { useTransactions } from "@/hooks/use-transactions";
import { useBalance } from "@/hooks/use-balance";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Activity, ArrowUpRight, Wallet, Clock, CheckCircle, XCircle } from "lucide-react";

export default function Dashboard() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string>('');
    const [error, setError] = useState<string>('');
    
    const { evmAddress } = useEvmAddress();
    const { isInitialized } = useIsInitialized();
    const { isSignedIn } = useIsSignedIn();
    const { getAccessToken } = useGetAccessToken();
    const { portfolio, positions, isPending: portfolioLoading, error: portfolioError } = usePortfolio();
    const { transactions, isLoading: transactionsLoading, error: transactionsError } = useTransactions(evmAddress);
    const { availableBalance: ethBalance, isLoading: balanceLoading } = useBalance('ETH');

    const testActivateAccount = async () => {
        setIsLoading(true);
        setResult('');
        setError('');

        try {
            if (!isSignedIn) {
                setError('User is not signed in. Please sign in first.');
                return;
            }

            if (!evmAddress) {
                setError('No wallet address available. Please connect your wallet.');
                return;
            }

            // Get the actual access token from the user's session
            const accessToken = await getAccessToken();
            
            if (!accessToken) {
                setError('No access token available. Please sign in again.');
                return;
            }

            const requestData = {
                walletAddress: evmAddress,
                accessToken: accessToken
            };

            console.log('Sending activate account request with:', {
                walletAddress: evmAddress,
                accessToken: accessToken ? '***' + accessToken.slice(-4) : 'none'
            });

            const response = await fetch('/api/activate-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            const data = await response.json();

            if (response.ok) {
                setResult(JSON.stringify(data, null, 2));
            } else {
                setError(`Error ${response.status}: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            setError(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate total portfolio value
    const totalValue = positions.reduce((acc, position) => acc + position.value, 0);
    
    // Mock 24h change (in a real app, this would come from an API)
    const change24h = totalValue * 0.0234; // 2.34% change
    const changePercent = 2.34;

    if (!isInitialized) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
                    <div className="h-12 bg-gray-700 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    if (!evmAddress) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <Typography type="h2" className="text-white mb-2">
                    Welcome to Basecoin
                </Typography>
                <Typography type="p" className="text-zinc-400 mb-4">
                    Please connect your wallet to view your dashboard
                </Typography>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Typography type="h2" className="text-white">
                    Dashboard
                </Typography>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Wallet className="h-4 w-4" />
                    {evmAddress.slice(0, 6)}...{evmAddress.slice(-4)}
                </div>
            </div>
            
            {/* Portfolio Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-5 w-5 text-blue-500" />
                        <Typography type="label" className="text-white/60">Total Value</Typography>
                    </div>
                    {portfolioLoading ? (
                        <div className="h-8 bg-gray-700 rounded animate-pulse"></div>
                    ) : (
                        <Typography type="h3" className="text-white">
                            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                    )}
                </Card>

                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-5 w-5 text-green-500" />
                        <Typography type="label" className="text-white/60">24h Change</Typography>
                    </div>
                    <div className="flex items-center gap-2">
                        {changePercent >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <Typography type="h3" className={changePercent >= 0 ? "text-green-500" : "text-red-500"}>
                            {changePercent >= 0 ? "+" : ""}{changePercent.toFixed(2)}%
                        </Typography>
                    </div>
                </Card>

                <Card className="bg-white/5 border-white/10 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <ArrowUpRight className="h-5 w-5 text-purple-500" />
                        <Typography type="label" className="text-white/60">Assets</Typography>
                    </div>
                    <Typography type="h3" className="text-white">
                        {positions.length}
                    </Typography>
                </Card>
            </div>

            {/* Portfolio Positions */}
            <Card className="bg-white/5 border-white/10 p-6">
                <Typography type="h4" className="text-white mb-4">Portfolio Positions</Typography>
                {portfolioLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                                    <div>
                                        <div className="h-4 bg-gray-700 rounded w-16 mb-1"></div>
                                        <div className="h-3 bg-gray-700 rounded w-24"></div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="h-4 bg-gray-700 rounded w-20 mb-1"></div>
                                    <div className="h-3 bg-gray-700 rounded w-16"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : portfolioError ? (
                    <Typography type="p" className="text-red-400">
                        Error loading portfolio: {portfolioError.message}
                    </Typography>
                ) : positions.length === 0 ? (
                    <Typography type="p" className="text-zinc-400">
                        No positions found. Start trading to see your portfolio here.
                    </Typography>
                ) : (
                    <div className="space-y-3">
                        {positions.slice(0, 5).map((position) => (
                            <div key={position.symbol} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={position.image}
                                        alt={position.symbol}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <div>
                                        <Typography type="p" className="text-white font-medium">
                                            {position.symbol}
                                        </Typography>
                                        <Typography type="footnote" className="text-zinc-400">
                                            {parseFloat(position.balance).toFixed(4)} {position.symbol}
                                        </Typography>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Typography type="p" className="text-white font-medium">
                                        ${position.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </Typography>
                                    <Typography type="footnote" className="text-zinc-400">
                                        ${position.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </Typography>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Recent Transactions */}
            <Card className="bg-white/5 border-white/10 p-6">
                <Typography type="h4" className="text-white mb-4">Recent Transactions</Typography>
                {transactionsLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                                    <div>
                                        <div className="h-4 bg-gray-700 rounded w-20 mb-1"></div>
                                        <div className="h-3 bg-gray-700 rounded w-32"></div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="h-4 bg-gray-700 rounded w-16 mb-1"></div>
                                    <div className="h-3 bg-gray-700 rounded w-12"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : transactionsError ? (
                    <Typography type="p" className="text-red-400">
                        Error loading transactions: {transactionsError.message}
                    </Typography>
                ) : transactions.length === 0 ? (
                    <Typography type="p" className="text-zinc-400">
                        No transactions found. Your transaction history will appear here.
                    </Typography>
                ) : (
                    <div className="space-y-3">
                        {transactions.slice(0, 5).map((tx) => (
                            <div key={tx.hash} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                                        {tx.status === 'confirmed' ? (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        ) : tx.status === 'pending' ? (
                                            <Clock className="h-5 w-5 text-yellow-500" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-500" />
                                        )}
                                    </div>
                                    <div>
                                        <Typography type="p" className="text-white font-medium capitalize">
                                            {tx.type}
                                        </Typography>
                                        <Typography type="footnote" className="text-zinc-400">
                                            {new Date(tx.timestamp).toLocaleDateString()}
                                        </Typography>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Typography type="p" className="text-white font-medium">
                                        {parseFloat(tx.value).toFixed(4)} {tx.asset}
                                    </Typography>
                                    <Typography type="footnote" className="text-zinc-400 capitalize">
                                        {tx.status}
                                    </Typography>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/5 border-white/10 p-6">
                <Typography type="h4" className="text-white mb-4">Quick Actions</Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white h-12">
                        <DollarSign className="h-5 w-5 mr-2" />
                        Deposit Funds
                    </Button>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 h-12">
                        <ArrowUpRight className="h-5 w-5 mr-2" />
                        Start Trading
                    </Button>
                </div>
            </Card>

            {/* Test Activate Account */}
            <Card className="bg-white/5 border-white/10 p-6">
                <Typography type="h4" className="text-white mb-4">Activate Account</Typography>
                <Typography type="p" className="text-zinc-400 mb-4">
                    Activate your account using your connected wallet and authentication token.
                </Typography>
                
                <Button 
                    onClick={testActivateAccount}
                    disabled={isLoading || !isSignedIn || !evmAddress}
                    className="mb-4"
                    variant="outline"
                >
                    {isLoading ? 'Activating...' : 'Activate Account'}
                </Button>

                {error && (
                    <div className="bg-red-900/20 border border-red-800 rounded-md p-3 mb-4">
                        <Typography type="label" className="text-red-200">Error:</Typography>
                        <pre className="text-sm text-red-300 mt-1 whitespace-pre-wrap">{error}</pre>
                    </div>
                )}

                {result && (
                    <div className="bg-green-900/20 border border-green-800 rounded-md p-3">
                        <Typography type="label" className="text-green-200">Response:</Typography>
                        <pre className="text-sm text-green-300 mt-1 whitespace-pre-wrap overflow-auto">{result}</pre>
                    </div>
                )}
            </Card>
        </div>
    );
}