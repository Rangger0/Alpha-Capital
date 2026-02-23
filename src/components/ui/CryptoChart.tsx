// src/components/ui/CryptoChart.tsx
import React, { useState, useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { TerminalCard, TerminalText, TerminalBadge } from './TerminalCard';

type TimeRange = '7days' | '30days' | 'year';

interface ChartData {
  date: string;
  label: string;
  income: number;
  expense: number;
  net: number;
  cumulative: number;
  high: number;
  low: number;
  open: number;
  close: number;
}

interface CryptoChartProps {
  data: ChartData[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  loading?: boolean;
}

export const CryptoChart: React.FC<CryptoChartProps> = ({
  data,
  timeRange,
  onTimeRangeChange,
  loading = false,
}) => {
  const { theme } = useTheme();
  const [hoveredData, setHoveredData] = useState<ChartData | null>(null);

  const stats = useMemo(() => {
    if (!data.length) return null;
    const totalIncome = data.reduce((sum, d) => sum + d.income, 0);
    const totalExpense = data.reduce((sum, d) => sum + d.expense, 0);
    const net = totalIncome - totalExpense;
    const avgDaily = net / data.length;
    const volatility = Math.sqrt(
      data.reduce((sum, d) => sum + Math.pow(d.net - avgDaily, 2), 0) / data.length
    );
    
    return {
      totalIncome,
      totalExpense,
      net,
      avgDaily,
      volatility,
      maxDrawdown: Math.min(...data.map(d => d.cumulative)),
      maxProfit: Math.max(...data.map(d => d.cumulative)),
    };
  }, [data]);

  const currentPrice = hoveredData?.cumulative ?? data[data.length - 1]?.cumulative ?? 0;
  const previousPrice = data[data.length - 2]?.cumulative ?? 0;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice !== 0 ? (priceChange / Math.abs(previousPrice)) * 100 : 0;

  const formatCurrency = (val: number) => {
    if (Math.abs(val) >= 1000000) return `$${(val / 1000000).toFixed(2)}JT`;
    if (Math.abs(val) >= 1000) return `$${(val / 1000).toFixed(2)}`;
    return `$${val.toFixed(2)}`;
  };

  const timeRangeButtons: { key: TimeRange; label: string }[] = [
    { key: '7days', label: '1W' },
    { key: '30days', label: '1M' },
    { key: 'year', label: '1Y' },
  ];

  if (loading) {
    return (
      <TerminalCard title="market_analysis" className="h-[400px]">
        <div className="h-full flex items-center justify-center">
          <div className="animate-pulse flex space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce delay-100" />
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce delay-200" />
          </div>
        </div>
      </TerminalCard>
    );
  }

  return (
    <TerminalCard 
      title="cashflow_analysis" 
      subtitle={`${timeRange === '7days' ? '7 days' : timeRange === '30days' ? '30 days' : '1 year'} timeframe`}
      className="h-full"
    >
      {/* Header Stats - Crypto Style */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        {/* Price Display */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold font-mono tracking-tight">
            {formatCurrency(currentPrice)}
          </span>
          <span className={`flex items-center font-mono text-sm ${
            priceChange >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {priceChange >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
          </span>
        </div>

        {/* Time Range Selector - Crypto Exchange Style */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border">
          {timeRangeButtons.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onTimeRangeChange(key)}
              className={`
                px-3 py-1.5 rounded text-xs font-mono font-bold transition-all duration-200
                ${timeRange === key
                  ? (theme === 'dark' 
                    ? 'bg-green-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                    : 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]')
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mb-1">Volume (In)</p>
            <p className="text-sm font-bold font-mono text-green-500">{formatCurrency(stats.totalIncome)}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mb-1">Volume (Out)</p>
            <p className="text-sm font-bold font-mono text-red-500">{formatCurrency(stats.totalExpense)}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mb-1">Net Flow</p>
            <p className={`text-sm font-bold font-mono ${stats.net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(stats.net)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mb-1">Volatility</p>
            <p className="text-sm font-bold font-mono text-yellow-500">±{formatCurrency(stats.volatility)}</p>
          </div>
        </div>
      )}

      {/* Main Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            onMouseMove={(e: any) => {
              if (e.activePayload) setHoveredData(e.activePayload[0].payload);
            }}
            onMouseLeave={() => setHoveredData(null)}
          >
            <defs>
              <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme === 'dark' ? '#10B981' : '#3B82F6'} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={theme === 'dark' ? '#10B981' : '#3B82F6'} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>

            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={theme === 'dark' ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)'} 
              vertical={false}
            />

            <XAxis 
              dataKey="label" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontFamily: 'JetBrains Mono' }} 
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={false}
            />

            <YAxis 
              yAxisId="left"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontFamily: 'JetBrains Mono' }} 
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => formatCurrency(value)}
            />

            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontFamily: 'JetBrains Mono' }} 
              axisLine={false}
              tickLine={false}
              hide
            />

            <Tooltip 
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload as ChartData;
                return (
                  <div className={`
                    p-3 rounded-lg border shadow-xl
                    ${theme === 'dark' 
                      ? 'bg-slate-900 border-green-500/30' 
                      : 'bg-white border-blue-500/30'}
                  `}>
                    <p className="text-xs text-muted-foreground font-mono mb-2">{data.date}</p>
                    <div className="space-y-1 font-mono text-xs">
                      <p className="text-green-500">In: {formatCurrency(data.income)}</p>
                      <p className="text-red-500">Out: {formatCurrency(data.expense)}</p>
                      <p className={`${data.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        Net: {formatCurrency(data.net)}
                      </p>
                      <p className="text-foreground border-t border-border pt-1 mt-1">
                        Cum: {formatCurrency(data.cumulative)}
                      </p>
                    </div>
                  </div>
                );
              }}
            />

            {/* Volume Bars */}
            <Bar 
              yAxisId="right"
              dataKey="income" 
              fill="url(#colorIncome)" 
              radius={[2, 2, 0, 0]}
              maxBarSize={20}
            />
            <Bar 
              yAxisId="right"
              dataKey="expense" 
              fill="url(#colorExpense)" 
              radius={[2, 2, 0, 0]}
              maxBarSize={20}
            />

            {/* Cumulative Line - Crypto Style */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="cumulative"
              stroke={theme === 'dark' ? '#10B981' : '#3B82F6'}
              strokeWidth={2}
              fill="url(#colorCumulative)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: theme === 'dark' ? '#10B981' : '#3B82F6' }}
            />

            {/* Zero Line */}
            <ReferenceLine y={0} yAxisId="left" stroke="hsl(var(--border))" strokeDasharray="3 3" />

            {/* Max/Min Lines */}
            {stats && (
              <>
                <ReferenceLine 
                  y={stats.maxProfit} 
                  yAxisId="left" 
                  stroke="#22c55e" 
                  strokeDasharray="5 5"
                  strokeOpacity={0.5}
                />
                <ReferenceLine 
                  y={stats.maxDrawdown} 
                  yAxisId="left" 
                  stroke="#ef4444" 
                  strokeDasharray="5 5"
                  strokeOpacity={0.5}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Income
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            Expense
          </span>
          <span className="flex items-center gap-1">
            <div className="w-4 h-0.5 bg-blue-500" />
            Cumulative
          </span>
        </div>
        <TerminalBadge variant={priceChange >= 0 ? 'success' : 'danger'}>
          {priceChange >= 0 ? 'BULLISH' : 'BEARISH'}
        </TerminalBadge>
      </div>
    </TerminalCard>
  );
};