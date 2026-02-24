import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Clock,
  PiggyBank,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getTransactions } from '@/lib/supabase';
import type { Transaction } from '@/types';
import { formatCompactNumber } from '@/utils/formatters';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TerminalCard, 
   
  TerminalPrompt,
  TerminalBadge,
  TerminalButton,
} from '@/components/ui/TerminalCard';
import { CryptoChart } from '@/components/ui/CryptoChart';
import Layout from '@/components/layout/Layout';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  
  ResponsiveContainer,
} from 'recharts';

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

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language, formatCurrency, formatDate } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [topExpenses, setTopExpenses] = useState<{category: string; amount: number}[]>([]);

  // Colors
  const colors = {
    green: isDark ? '#00d084' : '#22c55e',
    red: isDark ? '#ff4757' : '#ef4444',
    orange: isDark ? '#ffa502' : '#3b82f6',
    blue: isDark ? '#3742fa' : '#6366f1',
    chartColors: isDark 
      ? ['#00d084', '#ffa502', '#3742fa', '#ff6b6b', '#4ecdc4']
      : ['#22c55e', '#3b82f6', '#6366f1', '#f59e0b', '#ec4899'],
  };

  const netProfit = totalIncome - totalExpense;
  const savingRatio = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  const burnRate = totalExpense / (timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 365);

  useEffect(() => {
    if (!user) return;
    loadDashboardData();
  }, [user, timeRange, language]);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: allTransactions } = await getTransactions(user.id);

      if (!allTransactions) return;

      let balance = 0;
      allTransactions.forEach((t) => {
        if (t.type === 'income') balance += t.amount;
        else balance -= t.amount;
      });
      setTotalBalance(balance);

      const now = new Date();
      const filteredTransactions = allTransactions.filter((t) => {
        const tDate = new Date(t.date);
        const diffDays = Math.floor((now.getTime() - tDate.getTime()) / (1000 * 60 * 60 * 24));

        if (timeRange === '7days') return diffDays <= 7;
        if (timeRange === '30days') return diffDays <= 30;
        if (timeRange === 'year') return diffDays <= 365;
        return true;
      });

      let income = 0;
      let expense = 0;
      const categoryMap = new Map<string, number>();
      const expenseMap = new Map<string, number>();

      filteredTransactions.forEach((t) => {
        if (t.type === 'income') {
          income += t.amount;
        } else {
          expense += t.amount;
          const current = categoryMap.get(t.category) || 0;
          categoryMap.set(t.category, current + t.amount);
          const expCurrent = expenseMap.get(t.category) || 0;
          expenseMap.set(t.category, expCurrent + t.amount);
        }
      });

      setTotalIncome(income);
      setTotalExpense(expense);

      const chartData = prepareChartData(filteredTransactions, timeRange, allTransactions);
      setChartData(chartData);

      const pieData: CategoryData[] = Array.from(categoryMap.entries())
        .map(([name, value], index) => ({
          name,
          value,
          color: colors.chartColors[index % colors.chartColors.length],
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      setCategoryData(pieData);

      const topExp = Array.from(expenseMap.entries())
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
      setTopExpenses(topExp);

      setRecentTransactions(allTransactions.slice(0,1));

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (
    transactions: Transaction[], 
    range: TimeRange,
    allTransactions: Transaction[]
  ): ChartData[] => {
    const data: ChartData[] = [];
    const now = new Date();

    let runningBalance = 0;
    allTransactions.forEach((t) => {
      const tDate = new Date(t.date);
      const diffDays = Math.floor((now.getTime() - tDate.getTime()) / (1000 * 60 * 60 * 24));

      let isBeforeRange = false;
      if (range === '7days') isBeforeRange = diffDays > 7;
      else if (range === '30days') isBeforeRange = diffDays > 30;
      else if (range === 'year') isBeforeRange = diffDays > 365;

      if (isBeforeRange) {
        if (t.type === 'income') runningBalance += t.amount;
        else runningBalance -= t.amount;
      }
    });

    if (range === '7days') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        data.push({
          date: dateStr,
          label: date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { weekday: 'short' }),
          income: 0,
          expense: 0,
          net: 0,
          cumulative: runningBalance,
          high: runningBalance,
          low: runningBalance,
          open: runningBalance,
          close: runningBalance,
        });
      }
    } else if (range === '30days') {
      for (let i = 4; i >= 0; i--) {
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() - (i * 7));
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 6);

        data.push({
          date: startDate.toISOString().split('T')[0],
          label: language === 'id' ? `Minggu ${5-i}` : `Week ${5-i}`,
          income: 0,
          expense: 0,
          net: 0,
          cumulative: runningBalance,
          high: runningBalance,
          low: runningBalance,
          open: runningBalance,
          close: runningBalance,
        });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        data.push({
          date: date.toISOString().split('T')[0],
          label: date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short' }),
          income: 0,
          expense: 0,
          net: 0,
          cumulative: runningBalance,
          high: runningBalance,
          low: runningBalance,
          open: runningBalance,
          close: runningBalance,
        });
      }
    }

    transactions.forEach((t) => {
      const tDate = new Date(t.date);

      if (range === '7days') {
        const dayData = data.find(d => d.date === t.date);
        if (dayData) {
          if (t.type === 'income') dayData.income += t.amount;
          else dayData.expense += t.amount;
          dayData.net = dayData.income - dayData.expense;
        }
      } else if (range === '30days') {
        const daysDiff = Math.floor((now.getTime() - tDate.getTime()) / (1000 * 60 * 60 * 24));
        const weekIndex = Math.floor(daysDiff / 7);
        if (weekIndex >= 0 && weekIndex < 5) {
          const weekData = data[4 - weekIndex];
          if (t.type === 'income') weekData.income += t.amount;
          else weekData.expense += t.amount;
          weekData.net = weekData.income - weekData.expense;
        }
      } else {
        const monthKey = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}`;
        const monthData = data.find(d => d.date.startsWith(monthKey));
        if (monthData) {
          if (t.type === 'income') monthData.income += t.amount;
          else monthData.expense += t.amount;
          monthData.net = monthData.income - monthData.expense;
        }
      }
    });

    let cumulative = runningBalance;
    data.forEach((d, index) => {
      cumulative += d.net;
      d.cumulative = cumulative;
      d.close = cumulative;
      const dayStart = index === 0 ? runningBalance : data[index - 1].cumulative;
      d.open = dayStart;
      d.high = Math.max(dayStart, cumulative, dayStart + d.income);
      d.low = Math.min(dayStart, cumulative, dayStart - d.expense);
    });

    return data;
  };

  // Digital Clock Component
  const DigitalClock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
      const timer = setInterval(() => setTime(new Date()), 1000);
      return () => clearInterval(timer);
    }, []);

    return (
      <div className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded border ${isDark ? 'text-[#a0a0a0] bg-[#1a1a1a] border-[#333333]' : 'text-gray-500 bg-gray-100 border-gray-200'}`}>
        <Clock className={`h-3 w-3 ${isDark ? 'text-[#ffa502]' : 'text-blue-500'}`} />
        <span className={isDark ? 'text-white' : 'text-gray-900'}>{time.toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        <span className={isDark ? 'text-[#555555]' : 'text-gray-400'}>|</span>
        <span>{time.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
      </div>
    );
  };

  // Time Range Selector
  const TimeRangeSelector: React.FC = () => (
    <div className={`flex items-center gap-1 p-1 rounded border ${isDark ? 'bg-[#1a1a1a] border-[#333333]' : 'bg-gray-100 border-gray-200'}`}>
      {(['7days', '30days', 'year'] as TimeRange[]).map((range) => (
        <button
          key={range}
          onClick={() => setTimeRange(range)}
          className={`
            px-3 py-1.5 rounded text-xs font-mono transition-all duration-200
            ${timeRange === range 
              ? (isDark 
                  ? 'bg-[#333333] text-white shadow-[0_0_10px_rgba(255,165,2,0.3)]' 
                  : 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]')
              : (isDark 
                  ? 'text-[#a0a0a0] hover:text-white hover:bg-[#252525]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200')
            }
          `}
        >
          {t(`time.${range}`)}
        </button>
      ))}
    </div>
  );

  // Saving Ratio Badge
  const SavingRatioBadge: React.FC<{ ratio: number }> = ({ ratio }) => {
    let variant: 'success' | 'warning' | 'danger' = 'danger';
    let label = t('dashboard.risk');

    if (ratio > 30) {
      variant = 'success';
      label = t('dashboard.healthy');
    } else if (ratio >= 10) {
      variant = 'warning';
      label = t('dashboard.normal');
    }

    return (
      <TerminalBadge variant={variant}>
        {label} • {ratio.toFixed(1)}%
      </TerminalBadge>
    );
  };

  // Stat Card Component
  const StatCard: React.FC<{
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ElementType;
    trend?: string;
    trendUp?: boolean;
  }> = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendUp,
  }) => (
    <TerminalCard 
      title={title.toLowerCase().replace(/\s/g, '_')} 
      className="h-full"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-xs uppercase tracking-wider font-mono ${isDark ? 'text-[#a0a0a0]' : 'text-gray-500'}`}>
              {title}
            </span>
            {trend && !loading && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${trendUp ? (isDark ? 'text-[#00d084] bg-[#00d084]/10' : 'text-green-600 bg-green-100') : (isDark ? 'text-[#ff4757] bg-[#ff4757]/10' : 'text-red-600 bg-red-100')}`}>
                {trendUp ? '▲' : '▼'} {trend}
              </span>
            )}
          </div>
          {loading ? (
            <Skeleton className={`h-8 w-32 ${isDark ? 'bg-[#252525]' : 'bg-gray-200'}`} />
          ) : (
            <p className={`text-2xl font-bold font-mono tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </p>
          )}
          {subtitle && !loading && (
            <p className={`text-xs font-mono ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded border ${isDark ? 'bg-[#1a1a1a] border-[#333333] text-[#ffa502]' : 'bg-gray-100 border-gray-200 text-blue-500'}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </TerminalCard>
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b ${isDark ? 'border-[#333333]' : 'border-gray-200'}`}>
          <div>
            <TerminalPrompt 
              command={t('terminal.dashboard')} 
              className={`mb-2 ${isDark ? 'text-[#a0a0a0]' : 'text-gray-500'}`}
            />
            <h1 className={`text-3xl font-bold tracking-tight font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('dashboard.title')}
            </h1>
            <p className={`mt-1 font-mono text-sm ${isDark ? 'text-[#a0a0a0]' : 'text-gray-600'}`}>
              {t('dashboard.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <DigitalClock />
            <TerminalButton 
              onClick={() => navigate('/transactions/new')}
              glow
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('dashboard.addTransaction')}
            </TerminalButton>
          </div>
        </div>

        {/* Time Range & Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TimeRangeSelector />
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-[#00d084] shadow-[0_0_8px_rgba(0,208,132,0.8)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`} />
            <span className={`text-xs font-mono ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>
              {t('footer.systemOnline')} | {t('footer.version')}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title={t('dashboard.totalBalance')}
            value={formatCurrency(totalBalance)}
            subtitle={t('dashboard.allPeriod')}
            icon={Wallet}
          />
          <StatCard
            title={t('dashboard.totalIncome')}
            value={formatCurrency(totalIncome)}
            subtitle={`${t('dashboard.periodPrefix')} ${timeRange === '7days' ? t('dashboard.days7') : timeRange === '30days' ? t('dashboard.days30') : t('dashboard.year')}`}
            icon={TrendingUp}
            trend="+12.5%"
            trendUp={true}
          />
          <StatCard
            title={t('dashboard.totalExpense')}
            value={formatCurrency(totalExpense)}
            subtitle={`${t('dashboard.periodPrefix')} ${timeRange === '7days' ? t('dashboard.days7') : timeRange === '30days' ? t('dashboard.days30') : t('dashboard.year')}`}
            icon={TrendingDown}
            trend="+5.2%"
            trendUp={false}
          />
          <StatCard
            title={t('dashboard.netProfit')}
            value={formatCurrency(Math.abs(netProfit))}
            subtitle={netProfit >= 0 ? t('dashboard.profit') : t('dashboard.loss')}
            icon={netProfit >= 0 ? ArrowUpRight : ArrowDownRight}
          />
          <StatCard
            title={t('dashboard.burnRate')}
            value={formatCurrency(burnRate * 30)}
            subtitle={t('dashboard.estMonthly')}
            icon={Flame}
          />
          <TerminalCard 
            title="savings_ratio" 
            className="h-full"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <span className={`text-xs uppercase tracking-wider font-mono ${isDark ? 'text-[#a0a0a0]' : 'text-gray-500'}`}>
                  {t('dashboard.savingsRatio')}
                </span>
                {loading ? (
                  <Skeleton className={`h-8 w-32 ${isDark ? 'bg-[#252525]' : 'bg-gray-200'}`} />
                ) : (
                  <>
                    <p className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{savingRatio.toFixed(1)}%</p>
                    <SavingRatioBadge ratio={savingRatio} />
                  </>
                )}
              </div>
              <div className={`p-3 rounded border ${isDark ? 'bg-[#1a1a1a] border-[#333333] text-[#3742fa]' : 'bg-gray-100 border-gray-200 text-indigo-500'}`}>
                <PiggyBank className="h-5 w-5" />
              </div>
            </div>
            <Progress 
              value={Math.max(0, Math.min(100, savingRatio))} 
              className={`mt-4 h-2 ${isDark ? 'bg-[#252525]' : 'bg-gray-200'}`}
            />
          </TerminalCard>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CryptoChart 
              data={chartData}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              loading={loading}
            />
          </div>

          <TerminalCard 
            title="top_categories" 
            subtitle={t('dashboard.expenseDistribution')}
          >
            {loading ? (
              <Skeleton className={`h-64 w-full ${isDark ? 'bg-[#252525]' : 'bg-gray-200'}`} />
            ) : categoryData.length === 0 ? (
              <div className={`h-64 flex items-center justify-center font-mono ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>
                {t('status.no_data')}
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
               <RePieChart>
  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
    {categoryData.map((_, index) => (
      <Cell 
        key={`cell-${index}`} 
        fill={isDark 
          ? ['#EAB308', '#F59E0B', '#D97706', '#B45309'][index % 4] // Kuning gradasi (dark)
          : ['#EAB308', '#F59E0B', '#D97706', '#B45309'][index % 4] // Kuning gradasi (light)
        } 
      />
    ))}
  </Pie>
  ...
</RePieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {categoryData.slice(0, 4).map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className={`truncate max-w-[100px] font-mono text-xs ${isDark ? 'text-[#a0a0a0]' : 'text-gray-500'}`}>{cat.name}</span>
                      </div>
                      <span className={`font-mono font-medium text-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCompactNumber(cat.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TerminalCard>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TerminalCard 
            title="top_expenses" 
            subtitle={t('dashboard.highestExpenseCategories')}
          >
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className={`h-12 w-full ${isDark ? 'bg-[#252525]' : 'bg-gray-200'}`} />
                ))}
              </div>
            ) : topExpenses.length === 0 ? (
              <div className={`text-center py-8 font-mono ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>
                {t('status.no_data')}
              </div>
            ) : (
              <div className="space-y-3">
                {topExpenses.map((expense, index) => (
                  <div key={expense.category} className="flex items-center gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded border flex items-center justify-center font-bold text-sm font-mono ${isDark ? 'bg-[#1a1a1a] border-[#333333] text-[#ff4757]' : 'bg-gray-100 border-gray-200 text-red-500'}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{expense.category}</span>
                        <span className="font-mono font-semibold text-sm" style={{ color: colors.red }}>{formatCurrency(expense.amount)}</span>
                      </div>
                      <Progress value={(expense.amount / topExpenses[0].amount) * 100} className={`h-1.5 ${isDark ? 'bg-[#252525]' : 'bg-gray-200'}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TerminalCard>

          <TerminalCard 
            title="recent_transactions" 
            subtitle={t('dashboard.last5Transactions')}
          >
            <div className="flex justify-end mb-4">
              <TerminalButton 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/transactions')}
                glow={false}
                className={isDark ? 'text-[#a0a0a0] hover:text-white' : 'text-gray-600 hover:text-gray-900'}
              >
                {t('dashboard.viewAll')} →
              </TerminalButton>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className={`h-12 w-full ${isDark ? 'bg-[#252525]' : 'bg-gray-200'}`} />
                ))}
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className={`text-center py-8 font-mono ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>
                {t('status.no_data')}
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-colors ${
                      isDark 
                        ? 'bg-[#1a1a1a] border-[#252525] hover:border-[#333333]' 
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => navigate('/transactions')}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${transaction.type === 'income' ? (isDark ? 'bg-[#00d084]/10 text-[#00d084]' : 'bg-green-100 text-green-600') : (isDark ? 'bg-[#ff4757]/10 text-[#ff4757]' : 'bg-red-100 text-red-600')}`}>
                        {transaction.type === 'income' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{transaction.category}</p>
                        <p className={`text-xs font-mono ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <span className={`font-mono font-semibold ${transaction.type === 'income' ? (isDark ? 'text-[#00d084]' : 'text-green-600') : (isDark ? 'text-[#ff4757]' : 'text-red-600')}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </TerminalCard>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;