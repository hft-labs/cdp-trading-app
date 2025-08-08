"use client";

import { useEffect, useState } from "react";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { useEvmAddress } from "@coinbase/cdp-hooks";

interface BalanceHistoryPoint {
  date: string;
  value: number;
}

interface BalanceChartProps {
  className?: string;
}

export function BalanceChart({ className }: BalanceChartProps) {
  const [chartData, setChartData] = useState<BalanceHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const address = useEvmAddress();

  useEffect(() => {
    const fetchBalanceHistory = async () => {
      // For testing purposes, use one of the seeded wallet addresses
      // Available test addresses from seed data:
      // - 0xA0f307ac2Dc9ddCFEA03Fb2b8945d21a4A81C9c5 (user_001 - your wallet)
      // - 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 (user_002)
      // - 0x8ba1f109551bD432803012645Hac136c772c3c7b (user_003)
      // - 0x1234567890123456789012345678901234567890 (user_004)
      // - 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd (user_005)
      const testAddress = address || '0xA0f307ac2Dc9ddCFEA03Fb2b8945d21a4A81C9c5';

      try {
        // Get balance history from API
        const response = await fetch(`/api/balance-history?address=${testAddress}`);
        
        if (response.ok) {
          const result = await response.json();
          const chartPoints = result.data;
          
          if (chartPoints && chartPoints.length > 0) {
            setChartData(chartPoints);
            setTotalValue(chartPoints[chartPoints.length - 1]?.value || 0);
          } else {
            // No data found for this address (empty array or no data)
            setChartData([]);
            setTotalValue(0);
          }
        } else {
          console.error("API error:", response.status, response.statusText);
          setChartData([]);
          setTotalValue(0);
        }
      } catch (error) {
        console.error("Error fetching balance history:", error);
        setChartData([]);
        setTotalValue(0);
      } finally {
        setLoading(false);
      }
    };

    fetchBalanceHistory();
  }, [address]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <Card className={`bg-black border-white/10 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className={`bg-black border-white/10 p-6 ${className}`}>
        <Typography type="h4" className="text-white mb-2">Portfolio Value</Typography>
        <Typography type="p" className="text-zinc-400 mb-4">No balance history available</Typography>
        <div className="h-32 bg-gray-800 rounded flex items-center justify-center">
          <Typography type="p" className="text-zinc-500 text-center">
            {address ? 
              'No historical data found for your wallet. Connect your wallet to see real-time balances.' : 
              'Connect your wallet to view balance history'
            }
          </Typography>
        </div>
      </Card>
    );
  }

  // Calculate chart dimensions
  const chartHeight = 200;
  const chartWidth = 600;
  const padding = 40;
  const innerWidth = chartWidth - 2 * padding;
  const innerHeight = chartHeight - 2 * padding;

  // Find min and max values
  const values = chartData.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1; // Prevent division by zero

  // Generate SVG path
  const points = chartData.map((point, index) => {
    const x = padding + (index / Math.max(chartData.length - 1, 1)) * innerWidth;
    const y = padding + innerHeight - ((point.value - minValue) / valueRange) * innerHeight;
    // Ensure we don't return NaN values
    return `${isNaN(x) ? padding : x},${isNaN(y) ? padding + innerHeight : y}`;
  }).join(' ');

  // Calculate 24h change
  const currentValue = chartData[chartData.length - 1]?.value || 0;
  const previousValue = chartData[chartData.length - 2]?.value || currentValue;
  const change24h = currentValue - previousValue;
  const changePercent = previousValue > 0 ? (change24h / previousValue) * 100 : 0;

  return (
    <Card className={`bg-black border-white/10 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <Typography type="h4" className="text-white">Portfolio Value</Typography>
        <div className="text-right">
          <Typography type="h3" className="text-white">
            {formatCurrency(currentValue)}
          </Typography>
          <Typography 
            type="footnote" 
            className={change24h >= 0 ? "text-green-500" : "text-red-500"}
          >
            {change24h >= 0 ? "+" : ""}{formatCurrency(change24h)} ({changePercent >= 0 ? "+" : ""}{changePercent.toFixed(2)}%)
          </Typography>
        </div>
      </div>

      <div className="relative">
        <svg 
          width={chartWidth} 
          height={chartHeight} 
          className="w-full h-auto"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="60" height="40" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 40" fill="none" stroke="#333" strokeWidth="1" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Chart line */}
          <polyline
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            points={points}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Gradient fill */}
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0"/>
            </linearGradient>
          </defs>
          
          {/* Area fill */}
          <path
            d={`M ${points.split(' ')[0]} L ${points} L ${points.split(' ').slice(-1)[0].split(',')[0]},${chartHeight - padding} L ${points.split(' ')[0].split(',')[0]},${chartHeight - padding} Z`}
            fill="url(#chartGradient)"
          />

          {/* Data points */}
          {chartData.map((point, index) => {
            const x = padding + (index / Math.max(chartData.length - 1, 1)) * innerWidth;
            const y = padding + innerHeight - ((point.value - minValue) / valueRange) * innerHeight;
            
            // Skip rendering if we have NaN values
            if (isNaN(x) || isNaN(y)) return null;
            
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#3B82F6"
                className="opacity-0 hover:opacity-100 transition-opacity"
              />
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-zinc-400">
          {chartData.length > 0 && (
            <>
              <span>{formatDate(chartData[0].date)}</span>
              <span>{formatDate(chartData[Math.floor(chartData.length / 2)].date)}</span>
              <span>{formatDate(chartData[chartData.length - 1].date)}</span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}