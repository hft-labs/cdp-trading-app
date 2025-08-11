"use client";

import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { useBalanceHistory } from "@/hooks/use-balance-history";

interface BalanceChartProps {
  className?: string;
}

export function BalanceChart({ className }: BalanceChartProps) {
 
  const { data: chartData = [], isLoading, error } = useBalanceHistory();
  console.log("chartData", chartData);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatCurrencyCompact = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
      notation: value >= 1000 ? 'compact' : 'standard'
    }).format(value);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <Card className={`bg-black border-white/10 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`bg-black border-white/10 p-6 ${className}`}>
        <div className="text-center text-red-500">
          <Typography type="h4" className="text-white mb-2">Error Loading Chart</Typography>
          <Typography type="p" className="text-red-400">
            {error instanceof Error ? error.message : 'Failed to load balance history'}
          </Typography>
        </div>
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card className={`bg-black border-white/10 p-6 ${className}`}>
        <div className="text-center text-zinc-400">
          <Typography type="h4" className="text-white mb-2">Portfolio Value</Typography>
          <Typography type="p">No balance history available</Typography>
        </div>
      </Card>
    );
  }

  // Calculate chart dimensions with more space for axes
  const chartHeight = 280;
  const chartWidth = 700;
  const paddingLeft = 80;  // More space for Y-axis labels
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 60; // More space for X-axis labels
  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const values = chartData.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1; // Prevent division by zero

  // Calculate Y-axis ticks (5 evenly spaced values)
  const yAxisTicks = 5;
  const yAxisValues = Array.from({ length: yAxisTicks }, (_, i) => {
    return minValue + (valueRange * i) / (yAxisTicks - 1);
  });

  const points = chartData.map((point, index) => {
    const x = paddingLeft + (index / Math.max(chartData.length - 1, 1)) * innerWidth;
    const y = paddingTop + innerHeight - ((point.value - minValue) / valueRange) * innerHeight;
    return `${isNaN(x) ? paddingLeft : x},${isNaN(y) ? paddingTop + innerHeight : y}`;
  }).join(' ');

  const currentValue = chartData[chartData.length - 1]?.value || 0;
  const previousValue = chartData[chartData.length - 2]?.value || currentValue;
  const change24h = currentValue - previousValue;
  const changePercent = previousValue > 0 ? (change24h / previousValue) * 100 : 0;

  return (
    <Card className={`bg-black border-white/10 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
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
          {/* Grid lines and Y-axis */}
          {yAxisValues.map((value, index) => {
            const y = paddingTop + innerHeight - ((value - minValue) / valueRange) * innerHeight;
            return (
              <g key={index}>
                {/* Horizontal grid line */}
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={paddingLeft + innerWidth}
                  y2={y}
                  stroke="#333"
                  strokeWidth="1"
                  opacity="0.3"
                />
                {/* Y-axis label */}
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#9CA3AF"
                  className="font-mono"
                >
                  {formatCurrencyCompact(value)}
                </text>
              </g>
            );
          })}

          {/* Vertical grid lines */}
          {chartData.map((_, index) => {
            if (index % Math.max(1, Math.floor(chartData.length / 4)) === 0) {
              const x = paddingLeft + (index / Math.max(chartData.length - 1, 1)) * innerWidth;
              return (
                <line
                  key={index}
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={paddingTop + innerHeight}
                  stroke="#333"
                  strokeWidth="1"
                  opacity="0.2"
                />
              );
            }
            return null;
          })}

          {/* Chart area background */}
          <rect 
            x={paddingLeft} 
            y={paddingTop} 
            width={innerWidth} 
            height={innerHeight} 
            fill="none" 
            stroke="#333" 
            strokeWidth="1" 
            opacity="0.3"
          />

          {/* Gradient fill under the line */}
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0"/>
            </linearGradient>
          </defs>
          
          <path
            d={`M ${points.split(' ')[0]} L ${points} L ${points.split(' ').slice(-1)[0].split(',')[0]},${paddingTop + innerHeight} L ${points.split(' ')[0].split(',')[0]},${paddingTop + innerHeight} Z`}
            fill="url(#chartGradient)"
          />

          {/* Main chart line */}
          <polyline
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            points={points}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {chartData.map((point, index) => {
            const x = paddingLeft + (index / Math.max(chartData.length - 1, 1)) * innerWidth;
            const y = paddingTop + innerHeight - ((point.value - minValue) / valueRange) * innerHeight;
            
            if (isNaN(x) || isNaN(y)) return null;
            
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#3B82F6"
                  className="opacity-0 hover:opacity-100 transition-opacity"
                />
                {/* Hover tooltip */}
                <title>{`${formatDateTime(point.date)}: ${formatCurrency(point.value)}`}</title>
              </g>
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 px-20 text-xs text-zinc-400">
          {chartData.length > 0 && (
            <>
              <span className="text-center">
                <div>{formatDateShort(chartData[0].date)}</div>
                <div className="text-zinc-500 text-xs">
                  {new Date(chartData[0].date).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit', 
                    hour12: true 
                  })}
                </div>
              </span>
              {chartData.length > 2 && (
                <span className="text-center">
                  <div>{formatDateShort(chartData[Math.floor(chartData.length / 2)].date)}</div>
                  <div className="text-zinc-500 text-xs">
                    {new Date(chartData[Math.floor(chartData.length / 2)].date).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit', 
                      hour12: true 
                    })}
                  </div>
                </span>
              )}
              <span className="text-center">
                <div>{formatDateShort(chartData[chartData.length - 1].date)}</div>
                <div className="text-zinc-500 text-xs">
                  {new Date(chartData[chartData.length - 1].date).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit', 
                    hour12: true 
                  })}
                </div>
              </span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}