// src/components/ui/CryptoChart.tsx
import React, { useState, useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Area,
  Line,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { TerminalCard, TerminalBadge } from './TerminalCard';

type TimeRange = '7days' | '30days' | 'year';

interface ChartData {
  date: string;
  label: string;
  income: number;
  expense: number;
  net: number;
  cumulative: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CryptoChartProps {
  data: ChartData[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  loading?: boolean;
}

// Warna tema
const getThemeColors = (theme: string) => ({
  // Dark mode: Merah bearish, Kuning bullish, Putih volume
  // Light mode: Biru tua bearish, Biru muda bullish, Kuning volume
  bullish: theme === 'dark' ? '#EAB308' : '#3987e6', // Kuning (dark) / Biru muda (light)
  bearish: theme === 'dark' ? '#ff0303' : '#083ed1', // Merah (dark) / Biru tua (light)
  volume: theme === 'dark' ? '#FFFFFF' : '#EAB308', // Putih (dark) / Kuning (light)
  trend: theme === 'dark' ? '#ffffff' : '#030917', // Garis trend
  grid: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0, 0, 0, 0.02)',
});

// Custom Candlestick Component
const CandlestickBar = (props: any) => {
  const { x, y, width, height, payload, themeColors } = props;
  
  const isGreen = payload.close >= payload.open;
  const color = isGreen ? themeColors.bullish : themeColors.bearish;
  
  const candleWidth = Math.max(width * 0.6, 4);
  const candleX = x + (width - candleWidth) / 2;
  
  const maxVal = Math.max(payload.open, payload.close, payload.high);
  const minVal = Math.min(payload.open, payload.close, payload.low);
  const range = maxVal - minVal || 1;
  
  const wickTop = y;
  const wickBottom = y + height;
  const wickX = x + width / 2;
  
  const bodyTop = y + (maxVal - Math.max(payload.open, payload.close)) / range * height;
  const bodyHeight = Math.abs(payload.close - payload.open) / range * height || 2;
  
  return (
    <g>
      {/* Upper Wick */}
      <line
        x1={wickX}
        y1={wickTop}
        x2={wickX}
        y2={bodyTop}
        stroke={color}
        strokeWidth={1}
      />
      {/* Lower Wick */}
      <line
        x1={wickX}
        y1={bodyTop + bodyHeight}
        x2={wickX}
        y2={wickBottom}
        stroke={color}
        strokeWidth={1}
      />
      {/* Candle Body */}
      <rect
        x={candleX}
        y={bodyTop}
        width={candleWidth}
        height={Math.max(bodyHeight, 2)}
        fill={color}
        rx={1}
        opacity={0.9}
      />
    </g>
  );
};

export const CryptoChart: React.FC<CryptoChartProps> = ({
  data,
  timeRange,
  onTimeRangeChange,
  loading = false,
}) => {
  const { theme } = useTheme();
  const [hoveredData, setHoveredData] = useState<ChartData | null>(null);
  const themeColors = getThemeColors(theme);

  // Transform data for candlestick
  const candleData = useMemo(() => {
    return data.map((item, index) => {
      const prevClose = index > 0 ? data[index - 1].cumulative : item.cumulative;
      const open = prevClose;
      const close = item.cumulative;
      const high = Math.max(open, close, item.income > 0 ? item.income : 0);
      const low = Math.min(open, close, item.expense > 0 ? -item.expense : 0);
      
      return {
        ...item,
        open,
        high,
        low,
        close,
      };
    });
  }, [data]);

  const stats = useMemo(() => {
    if (!data.length) return null;
    const totalIncome = data.reduce((sum, d) => sum + d.income, 0);
    const totalExpense = data.reduce((sum, d) => sum + d.expense, 0);
    const net = totalIncome - totalExpense;
    const avgDaily = net / data.length;
    
    return {
      totalIncome,
      totalExpense,
      net,
      avgDaily,
      maxDrawdown: Math.min(...data.map(d => d.cumulative)),
      maxProfit: Math.max(...data.map(d => d.cumulative)),
    };
  }, [data]);

  const currentPrice = hoveredData?.cumulative ?? data[data.length - 1]?.cumulative ?? 0;
  const previousPrice = data[data.length - 2]?.cumulative ?? 0;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice !== 0 ? (priceChange / Math.abs(previousPrice)) * 100 : 0;
  const isBullish = priceChange >= 0;

  const formatCurrency = (val: number) => {
    if (Math.abs(val) >= 1000000) return `$${(val / 1000000).toFixed(2)}JT`;
    if (Math.abs(val) >= 1000) return `$${(val / 1000).toFixed(2)}K`;
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
            <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: themeColors.bullish }} />
            <div className="w-3 h-3 rounded-full animate-bounce delay-100" style={{ backgroundColor: themeColors.bearish }} />
            <div className="w-3 h-3 rounded-full animate-bounce delay-200" style={{ backgroundColor: themeColors.volume }} />
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
      {/* Header Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold font-mono tracking-tight">
            {formatCurrency(currentPrice)}
          </span>
          <span 
            className="flex items-center font-mono text-sm"
            style={{ color: isBullish ? themeColors.bullish : themeColors.bearish }}
          >
            {isBullish ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {isBullish ? '+' : ''}{priceChangePercent.toFixed(2)}%
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border">
          {timeRangeButtons.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onTimeRangeChange(key)}
              className={`
                px-3 py-1.5 rounded text-xs font-mono font-bold transition-all duration-200
                ${timeRange === key
                  ? (theme === 'dark' 
                    ? 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.5)]' 
                    : 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]')
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
            <p 
              className="text-sm font-bold font-mono"
              style={{ color: themeColors.bullish }}
            >
              {formatCurrency(stats.totalIncome)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mb-1">Volume (Out)</p>
            <p 
              className="text-sm font-bold font-mono"
              style={{ color: themeColors.bearish }}
            >
              {formatCurrency(stats.totalExpense)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mb-1">Net Flow</p>
            <p 
              className="text-sm font-bold font-mono"
              style={{ color: stats.net >= 0 ? themeColors.bullish : themeColors.bearish }}
            >
              {formatCurrency(stats.net)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mb-1">Avg Daily</p>
            <p 
              className="text-sm font-bold font-mono"
              style={{ color: stats.avgDaily >= 0 ? themeColors.bullish : themeColors.bearish }}
            >
              {formatCurrency(stats.avgDaily)}
            </p>
          </div>
        </div>
      )}

      {/* Main Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={candleData}
            onMouseMove={(e: any) => {
              if (e.activePayload) setHoveredData(e.activePayload[0].payload);
            }}
            onMouseLeave={() => setHoveredData(null)}
          >
            <defs>
              <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={themeColors.trend} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={themeColors.trend} stopOpacity={0}/>
              </linearGradient>
            </defs>

            {/* Grid */}
            <CartesianGrid 
              strokeDasharray="0" 
              stroke={themeColors.grid}
              vertical={true}
              horizontal={true}
            />

            <XAxis 
              dataKey="label" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
              axisLine={{ stroke: 'hsl(var(--border))', opacity: 0.5 }}
              tickLine={false}
              dy={10}
            />

            <YAxis 
              yAxisId="left"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => formatCurrency(value)}
              domain={['auto', 'auto']}
            />

            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
              axisLine={false}
              tickLine={false}
              hide
            />

            <Tooltip 
              cursor={{ stroke: themeColors.trend, strokeWidth: 1, strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload as ChartData;
                const isGreen = data.close >= data.open;
                return (
                  <div className={`
                    p-3 rounded-lg border shadow-xl backdrop-blur-md
                    ${theme === 'dark' 
                      ? 'bg-black/95 border-yellow-500/30' 
                      : 'bg-white/95 border-blue-500/30'}
                  `}>
                    <p className="text-xs text-muted-foreground font-mono mb-2">{data.date}</p>
                    <div className="space-y-1 font-mono text-xs">
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Open</span>
                        <span style={{ color: isGreen ? themeColors.bullish : themeColors.bearish }}>
                          {formatCurrency(data.open)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">High</span>
                        <span style={{ color: themeColors.bullish }}>{formatCurrency(data.high)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Low</span>
                        <span style={{ color: themeColors.bearish }}>{formatCurrency(data.low)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Close</span>
                        <span style={{ color: isGreen ? themeColors.bullish : themeColors.bearish }}>
                          {formatCurrency(data.close)}
                        </span>
                      </div>
                      <div className="border-t border-border pt-1 mt-1 flex justify-between gap-4">
                        <span className="text-muted-foreground">Income</span>
                        <span style={{ color: themeColors.bullish }}>+{formatCurrency(data.income)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Expense</span>
                        <span style={{ color: themeColors.bearish }}>-{formatCurrency(data.expense)}</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />

            {/* Area fill */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="cumulative"
              stroke="none"
              fill="url(#colorArea)"
            />

            {/* Trend Line */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="cumulative"
              stroke={themeColors.trend}
              strokeWidth={2}
              dot={false}
              strokeOpacity={0.8}
            />

            {/* Volume Bars - Warna putih (dark) atau kuning (light) */}
            <Bar
              yAxisId="right"
              dataKey="income"
              fill={themeColors.volume}
              opacity={0.3}
              barSize={8}
              radius={[2, 2, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="expense"
              fill={themeColors.volume}
              opacity={0.2}
              barSize={8}
              radius={[2, 2, 0, 0]}
            />

            {/* Candlestick Bars */}
            <Bar
              yAxisId="left"
              dataKey="high"
              shape={(props: any) => <CandlestickBar {...props} themeColors={themeColors} />}
              barSize={20}
            />

          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
          <span className="flex items-center gap-1">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: themeColors.bullish }}
            />
            Bullish
          </span>
          <span className="flex items-center gap-1">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: themeColors.bearish }}
            />
            Bearish
          </span>
          <span className="flex items-center gap-1">
            <div 
              className="w-4 h-0.5" 
              style={{ backgroundColor: themeColors.volume }}
            />
            Volume
          </span>
        </div>
       <TerminalBadge 
             variant={isBullish ? 'success' : 'danger'}
             className={`
           ${isBullish 
      ? (theme === 'dark' ? 'bg-yellow-500 text-black' : 'bg-blue-400 text-white')
      : (theme === 'dark' ? 'bg-red-600 text-white' : 'bg-blue-800 text-white')
         }
           `}
           >
         {isBullish ? 'BULLISH' : 'BEARISH'}
        </TerminalBadge> 
      </div>
    </TerminalCard>
  );
};