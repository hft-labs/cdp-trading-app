"use client";

import { useEffect, useState } from "react";
import { Typography } from "@/components/ui/typography";
import { TrendingUp, TrendingDown, DollarSign, Activity, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { BalanceChart } from "@/components/balance-chart";

interface PortfolioData {
  totalValue: number;
  change24h: number;
  changePercent: number;
  assets: Array<{
    symbol: string;
    name: string;
    balance: string;
    value: number;
    price: number;
    image: string;
  }>;
}

export function DashboardOverview() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const address = useEvmAddress();

  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!address) return;

      try {
        const response = await fetch(`/api/portfolio?address=${address}`);
        if (response.ok) {
          const data = await response.json();
          const totalValue = data.positions.reduce((acc: number, pos: any) => acc + pos.value, 0);
          const change24h = totalValue * 0.0234; // Mock 2.34% change
          const changePercent = 2.34;

          setPortfolioData({
            totalValue,
            change24h,
            changePercent,
            assets: data.positions.slice(0, 5) // Show top 5 assets
          });
        }
      } catch (error) {
        console.error("Error fetching portfolio data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [address]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-black rounded-xl p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-12 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <div className="space-y-6">
          <Typography type="h2" className="text-white mb-2">
            Welcome to Basecoin
          </Typography>
          <Typography type="p" className="text-zinc-400 mb-4">
            Your self-custodied trading experience powered by Coinbase Developer Platform
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-blue-500" />
                <Typography type="label" className="text-white/60">Total Value</Typography>
              </div>
              <Typography type="h3" className="text-white">$0.00</Typography>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-green-500" />
                <Typography type="label" className="text-white/60">24h Change</Typography>
              </div>
              <Typography type="h3" className="text-white">$0.00</Typography>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="h-5 w-5 text-purple-500" />
                <Typography type="label" className="text-white/60">Assets</Typography>
              </div>
              <Typography type="h3" className="text-white">0</Typography>
            </div>
          </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-black">
      {/* Portfolio Summary */}
      <div className="flex items-center justify-between mb-4">
        <Typography type="h2" className="text-white">
          Portfolio Overview
        </Typography>
        <Button variant="ghost" className="text-blue-500 hover:text-blue-400">
          View All <ArrowUpRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-blue-500" />
            <Typography type="label" className="text-white/60">Total Value</Typography>
          </div>
          <Typography type="h3" className="text-white">
            ${portfolioData.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
        </div>

        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-green-500" />
            <Typography type="label" className="text-white/60">24h Change</Typography>
          </div>
          <div className="flex items-center gap-2">
            {portfolioData.changePercent >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <Typography type="h3" className={portfolioData.changePercent >= 0 ? "text-green-500" : "text-red-500"}>
              {portfolioData.changePercent >= 0 ? "+" : ""}{portfolioData.changePercent.toFixed(2)}%
            </Typography>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="h-5 w-5 text-purple-500" />
            <Typography type="label" className="text-white/60">Assets</Typography>
          </div>
          <Typography type="h3" className="text-white">
            {portfolioData.assets.length}
          </Typography>
        </div>
      </div>

      {/* Top Assets */}
      <div>
        <Typography type="h4" className="text-white mb-4">Top Assets</Typography>
        <div className="space-y-3">
          {portfolioData.assets.map((asset, index) => (
            <div key={asset.symbol} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <img
                  src={asset.image}
                  alt={asset.symbol}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <Typography type="p" className="text-white font-medium">
                    {asset.symbol}
                  </Typography>
                  <Typography type="footnote" className="text-zinc-400">
                    {asset.balance} {asset.symbol}
                  </Typography>
                </div>
              </div>
              <div className="text-right">
                <Typography type="p" className="text-white font-medium">
                  ${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
                <Typography type="footnote" className="text-zinc-400">
                  ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Balance Chart */}
      <BalanceChart className="mb-6" />

      {/* Quick Actions */}
      <div className="bg-black border border-white/10 rounded-lg p-6">
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
      </div>
    </div>
  );
} 