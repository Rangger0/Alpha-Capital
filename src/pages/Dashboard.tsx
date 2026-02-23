// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Clock,
  PiggyBank,
  Flame,
  Target,
  ChevronUp,
  ChevronDown,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Activity,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getTransactions } from '@/lib/supabase';
import type { Transaction } from '@/types';
import { 
  formatCompactNumber,
} from '@/utils/formatters';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TerminalCard, 
  TerminalText, 
  TerminalPrompt,
  TerminalStat,
  TerminalBadge,
  TerminalButton,
} from '@/components/ui/TerminalCard';
import { CryptoChart } from '@/components/ui/CryptoChart';
import Layout from '@/components/layout/Layout';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart as RePieChart,
  Pie,
  Cell,
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
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [topExpenses, setTopExpenses] = useState<{category: string; amount: number}[]>([]);

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
          color: [
            theme === 'dark' ? '#10B981' : '#3B82F6',
            theme === 'dark' ? '#EF4444' : '#EF4444',
            theme === 'dark' ? '#F59E0B' : '#F59E0B',
            theme === 'dark' ? '#8B5CF6' : '#8B5CF6',
            theme === 'dark' ? '#EC4899' : '#EC4899',
          ][index % 5],
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      setCategoryData(pieData);

      const topExp = Array.from(expenseMap.entries())
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
      setTopExpenses(topExp);

      setRecentTransactions(allTransactions.slice(0, 5));

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
    
    // Calculate starting balance from transactions before the range
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

    // Process transactions
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

    // Calculate cumulative, high, low, open, close
    let cumulative = runningBalance;
    data.forEach((d, index) => {
      cumulative += d.net;
      d.cumulative = cumulative;
      d.close = cumulative;
      
      // Calculate high and low based on the day's movement
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
      <div className={`
        flex items-center gap-2 text-xs font-mono 
        ${theme === 'dark' ? 'text-green-400/70' : 'text-blue-500/70'}
        bg-muted/30 px-3 py-1.5 rounded border
        ${theme === 'dark' ? 'border-green-500/20' : 'border-blue-500/20'}
      `}>
        <Clock className="h-3 w-3" />
        <span>{time.toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        <span className="text-muted-foreground">|</span>
        <span>{time.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
      </div>
    );
  };

  // Time Range Selector
  const TimeRangeSelector: React.FC = () => (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border">
      {(['7days', '30days', 'year'] as TimeRange[]).map((range) => (
        <button
          key={range}
          onClick={() => setTimeRange(range)}
          className={`
            px-3 py-1.5 rounded text-xs font-mono transition-all duration-200
            ${timeRange === range 
              ? (theme === 'dark' 
                ? 'bg-green-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                : 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]')
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
    delay?: number;
  }> = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendUp,
    delay = 0,
  }) => (
    <TerminalCard 
      title={title.toLowerCase().replace(/\s/g, '_')} 
      delay={delay}
      className="h-full"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <TerminalText 
              text={title} 
              prefix="$ " 
              className={`text-xs uppercase tracking-wider ${theme === 'dark' ? 'text-green-400/70' : 'text-blue-500/70'}`}
            />
            {trend && !loading && (
              <TerminalBadge variant={trendUp ? 'success' : 'danger'}>
                {trendUp ? '▲' : '▼'} {trend}
              </TerminalBadge>
            )}
          </div>
          {loading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {value}
            </p>
          )}
          {subtitle && !loading && (
            <p className="text-xs text-muted-foreground font-mono">{subtitle}</p>
          )}
        </div>
        <div className={`
          p-3 rounded-lg 
          ${theme === 'dark' 
            ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
            : 'bg-blue-500/10 text-blue-500 border border-blue-500/30'}
        `}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </TerminalCard>
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-border/50">
          <div>
            <TerminalPrompt 
              command={t('terminal.dashboard')} 
              className="mb-2"
            />
            <h1 className="text-3xl font-bold tracking-tight">
              <TerminalText 
                text={t('dashboard.title')} 
                typing 
                delay={100}
                className={theme === 'dark' ? 'text-green-400' : 'text-blue-500'}
              />
            </h1>
            <p className="text-muted-foreground mt-1 font-mono text-sm">
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
            <div className={`
              w-2 h-2 rounded-full animate-pulse
              ${theme === 'dark' ? 'bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]'}
            `} />
            <span className="text-xs text-muted-foreground font-mono">
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
            delay={0}
          />
          <StatCard
            title={t('dashboard.totalIncome')}
            value={formatCurrency(totalIncome)}
            subtitle={`${t('dashboard.periodPrefix')} ${timeRange === '7days' ? t('dashboard.days7') : timeRange === '30days' ? t('dashboard.days30') : t('dashboard.year')}`}
            icon={TrendingUp}
            trend="+12.5%"
            trendUp={true}
            delay={100}
          />
          <StatCard
            title={t('dashboard.totalExpense')}
            value={formatCurrency(totalExpense)}
            subtitle={`${t('dashboard.periodPrefix')} ${timeRange === '7days' ? t('dashboard.days7') : timeRange === '30days' ? t('dashboard.days30') : t('dashboard.year')}`}
            icon={TrendingDown}
            trend="+5.2%"
            trendUp={false}
            delay={200}
          />
          <StatCard
            title={t('dashboard.netProfit')}
            value={formatCurrency(Math.abs(netProfit))}
            subtitle={netProfit >= 0 ? t('dashboard.profit') : t('dashboard.loss')}
            icon={netProfit >= 0 ? ArrowUpRight : ArrowDownRight}
            delay={300}
          />
          <StatCard
            title={t('dashboard.burnRate')}
            value={formatCurrency(burnRate * 30)}
            subtitle={t('dashboard.estMonthly')}
            icon={Flame}
            delay={400}
          />
          <TerminalCard 
            title="savings_ratio" 
            delay={500}
            className="h-full"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <TerminalText 
                  text={t('dashboard.savingsRatio')} 
                  prefix="$ "
                  className={`text-xs uppercase tracking-wider ${theme === 'dark' ? 'text-green-400/70' : 'text-blue-500/70'}`}
                />
                {loading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <>
                    <p className="text-2xl font-bold font-mono">{savingRatio.toFixed(1)}%</p>
                    <SavingRatioBadge ratio={savingRatio} />
                  </>
                )}
              </div>
              <div className={`
                p-3 rounded-lg 
                ${theme === 'dark' 
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' 
                  : 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/30'}
              `}>
                <PiggyBank className="h-5 w-5" />
              </div>
            </div>
            <Progress 
              value={Math.max(0, Math.min(100, savingRatio))} 
              className="mt-4 h-2"
            />
          </TerminalCard>
        </div>

        {/* Charts Section - Crypto Style */}
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
            delay={700}
          >
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : categoryData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground font-mono">
                {t('status.no_data')}
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <RePieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: `1px solid ${theme === 'dark' ? 'rgba(16,185,129,0.3)' : 'rgba(59,130,246,0.3)'}`, 
                        borderRadius: '8px',
                        fontFamily: 'JetBrains Mono',
                      }} 
                      formatter={(value: number) => formatCurrency(value)} 
                    />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {categoryData.slice(0, 4).map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-muted-foreground truncate max-w-[100px] font-mono text-xs">{cat.name}</span>
                      </div>
                      <span className="font-mono font-medium text-xs">{formatCompactNumber(cat.value)}</span>
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
            delay={800}
          >
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : topExpenses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground font-mono">
                {t('status.no_data')}
              </div>
            ) : (
              <div className="space-y-3">
                {topExpenses.map((expense, index) => (
                  <div key={expense.category} className="flex items-center gap-4">
                    <div className={`
                      flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm font-mono
                      ${theme === 'dark' 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
                        : 'bg-red-500/10 text-red-500 border border-red-500/30'}
                    `}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm truncate">{expense.category}</span>
                        <span className="font-mono font-semibold text-sm">{formatCurrency(expense.amount)}</span>
                      </div>
                      <Progress value={(expense.amount / topExpenses[0].amount) * 100} className="h-1.5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TerminalCard>

          <TerminalCard 
            title="recent_transactions" 
            subtitle={t('dashboard.last5Transactions')}
            delay={900}
          >
            <div className="flex justify-end mb-4">
              <TerminalButton 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/transactions')}
                glow={false}
              >
                {t('dashboard.viewAll')} →
              </TerminalButton>
            </div>
            
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground font-mono">
                {t('status.no_data')}
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => navigate('/transactions')}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        p-2 rounded-lg
                        ${transaction.type === 'income' 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-red-500/10 text-red-500'}
                      `}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{transaction.category}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <span className={`
                      font-mono font-semibold
                      ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}
                    `}>
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