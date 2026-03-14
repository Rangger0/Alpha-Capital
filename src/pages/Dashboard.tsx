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
import { useIsMobile } from '@/hooks/use-mobile';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TerminalCard, 
   
  TerminalBadge,
  TerminalButton,
} from '@/components/ui/TerminalCard';
import { CryptoChart } from '@/components/ui/CryptoChart';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  
  ResponsiveContainer,
} from 'recharts';

type TimeRange = '1day' | '7days' | '30days' | 'year';

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
  const isMobile = useIsMobile();

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [topExpenses, setTopExpenses] = useState<{category: string; amount: number}[]>([]);

  // Palette derived from CSS variables to keep light/dark in sync
  const tone = (cssVar: string) => `hsl(var(${cssVar}))`;
  const toneA = (cssVar: string, alpha = 0.14) => `hsl(var(${cssVar}) / ${alpha})`;

  const colors = {
    green: tone('--finance-positive'),
    red: tone('--finance-negative'),
    accent: tone('--primary'),
    blue: tone('--accent'),
    chartColors: [
      tone('--finance-positive'),
      tone('--primary'),
      tone('--accent'),
      tone('--finance-negative'),
      tone('--muted-foreground'),
    ],
    alpha: {
      green: toneA('--finance-positive'),
      red: toneA('--finance-negative'),
      accent: toneA('--primary'),
      muted: toneA('--muted'),
    },
  };

  const netProfit = totalIncome - totalExpense;
  const savingRatio = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  const burnRate = totalExpense / (timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 365);

  useEffect(() => {
    if (!user) return;
    loadDashboardData();
  }, [user, timeRange, language, theme]);

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

        if (timeRange === '1day') return diffDays <= 0;
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

    let runningBalance = 0;
    allTransactions.forEach((t) => {
      const tDate = new Date(t.date);
      const diffDays = Math.floor((now.getTime() - tDate.getTime()) / (1000 * 60 * 60 * 24));

      let isBeforeRange = false;
      if (range === '1day') isBeforeRange = diffDays > 0;
      else if (range === '7days') isBeforeRange = diffDays > 7;
      else if (range === '30days') isBeforeRange = diffDays > 30;
      else if (range === 'year') isBeforeRange = diffDays > 365;

      if (isBeforeRange) {
        if (t.type === 'income') runningBalance += t.amount;
        else runningBalance -= t.amount;
      }
    });

    if (range === '1day') {
      const dateStr = now.toISOString().split('T')[0];
      data.push({
        date: dateStr,
        label: language === 'id' ? 'Hari ini' : 'Today',
        income: 0,
        expense: 0,
        net: 0,
        cumulative: runningBalance,
        high: runningBalance,
        low: runningBalance,
        open: runningBalance,
        close: runningBalance,
      });
    } else if (range === '7days') {
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

      if (range === '1day') {
        const dayData = data.find(d => d.date === t.date);
        if (dayData) {
          if (t.type === 'income') dayData.income += t.amount;
          else dayData.expense += t.amount;
          dayData.net = dayData.income - dayData.expense;
        }
      } else if (range === '7days') {
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
      <div className="flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur">
        <Clock className="h-3.5 w-3.5 text-primary" />
        <span className="text-foreground">
          {time.toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
        <span className="text-muted-foreground">|</span>
        <span className="text-muted-foreground">
          {time.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>
    );
  };

  // Time Range Selector
  const TimeRangeSelector: React.FC = () => (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card/90 p-1 shadow-sm">
      {[{key:'1day',label:'1D'},{key:'7days',label:'1W'},{key:'30days',label:'1M'},{key:'year',label:'1Y'}].map(({key,label}) => (
        <button
          key={key}
          onClick={() => setTimeRange(key as TimeRange)}
          className={`
            rounded-full px-3.5 py-2 text-xs font-medium transition-all duration-200
            ${timeRange === key 
              ? 'bg-primary text-primary-foreground shadow-glow'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }
          `}
        >
          {label}
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
            <span className="text-xs uppercase tracking-wider font-mono text-muted-foreground">
              {title}
            </span>
            {trend && !loading && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${trendUp ? 'chip-positive' : 'chip-negative'}`}>
                {trendUp ? '▲' : '▼'} {trend}
              </span>
            )}
          </div>
          {loading ? (
            <Skeleton className="h-8 w-32 bg-muted" />
          ) : (
            <p className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {value}
            </p>
          )}
          {subtitle && !loading && (
            <p className="text-xs font-mono text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="p-3 rounded border border-border bg-muted text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </TerminalCard>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          eyebrow={language === 'id' ? 'Ringkasan' : 'Overview'}
          title={t('dashboard.title')}
          subtitle={t('dashboard.subtitle')}
          action={!isMobile ? (
            <>
              <DigitalClock />
              <TerminalButton onClick={() => navigate('/transactions/new')}>
                <Plus className="mr-2 h-4 w-4" />
                {t('dashboard.addTransaction')}
              </TerminalButton>
            </>
          ) : undefined}
        />

        <CryptoChart 
          data={chartData}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          loading={loading}
        />

        <TerminalCard 
          title="top_categories" 
          subtitle={t('dashboard.expenseDistribution')}
        >
          {loading ? (
            <Skeleton className="h-64 w-full bg-muted" />
          ) : categoryData.length === 0 ? (
            <div className="flex h-64 items-center justify-center font-mono text-muted-foreground">
              {t('status.no_data')}
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <RePieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                    {categoryData.map((cat, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={cat.color}
                        stroke={isDark ? tone('--background') : '#ffffff'}
                        strokeWidth={1.5}
                        fillOpacity={1}
                      />
                    ))}
                  </Pie>
                </RePieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {categoryData.slice(0, 4).map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full ring-1 ring-border shadow-[0_0_6px_currentColor]"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className={`max-w-[180px] truncate font-mono text-xs ${isDark ? 'text-foreground' : 'text-slate-800'}`}>
                        {cat.name}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-medium text-foreground">{formatCompactNumber(cat.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </TerminalCard>

        <TerminalCard 
          title="top_expenses" 
          subtitle={t('dashboard.highestExpenseCategories')}
        >
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-muted" />
              ))}
            </div>
          ) : topExpenses.length === 0 ? (
            <div className="py-8 text-center font-mono text-muted-foreground">
              {t('status.no_data')}
            </div>
          ) : (
            <div className="space-y-3">
              {topExpenses.map((expense, index) => (
                <div key={expense.category} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border border-border bg-muted text-sm font-bold font-mono text-destructive">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="truncate text-sm font-medium text-foreground">{expense.category}</span>
                      <span className="text-sm font-mono font-semibold" style={{ color: colors.red }}>{formatCurrency(expense.amount)}</span>
                    </div>
                    <Progress value={(expense.amount / topExpenses[0].amount) * 100} className="h-1.5 bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </TerminalCard>

        <div className="flex flex-col gap-4 rounded-[24px] border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <TimeRangeSelector />
          <div className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: colors.green, boxShadow: `0 0 10px ${toneA('--finance-positive', 0.6)}` }}
            />
            <span className="text-xs text-muted-foreground">
              {t('footer.systemOnline')} | {t('footer.version')}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                <span className="text-xs uppercase tracking-wider font-mono text-muted-foreground">
                  {t('dashboard.savingsRatio')}
                </span>
                {loading ? (
                  <Skeleton className="h-8 w-32 bg-muted" />
                ) : (
                  <>
                    <p className="text-2xl font-bold font-mono text-foreground">{savingRatio.toFixed(1)}%</p>
                    <SavingRatioBadge ratio={savingRatio} />
                  </>
                )}
              </div>
              <div className="rounded border border-border bg-muted p-3 text-accent">
                <PiggyBank className="h-5 w-5" />
              </div>
            </div>
            <Progress 
              value={Math.max(0, Math.min(100, savingRatio))} 
              className="mt-4 h-2 bg-muted"
            />
          </TerminalCard>
        </div>

        <TerminalCard 
          title="recent_transactions" 
          subtitle={t('dashboard.last5Transactions')}
        >
          <div className="mb-4 flex justify-end">
            <TerminalButton 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/transactions')}
              glow={false}
              className="text-muted-foreground hover:text-foreground"
            >
              {t('dashboard.viewAll')} →
            </TerminalButton>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-muted" />
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="py-8 text-center font-mono text-muted-foreground">
              {t('status.no_data')}
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => {
                const isIncome = transaction.type === 'income';
                const amountColor = isIncome ? colors.green : colors.red;
                return (
                  <div 
                    key={transaction.id} 
                    className="flex cursor-pointer items-center justify-between rounded border border-border bg-card p-3 transition-colors hover:bg-muted"
                    onClick={() => navigate('/transactions')}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="rounded p-2"
                        style={{ 
                          backgroundColor: isIncome ? toneA('--finance-positive', 0.16) : toneA('--finance-negative', 0.16),
                          color: amountColor,
                        }}
                      >
                        {isIncome ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{transaction.category}</p>
                        <p className="text-xs font-mono text-muted-foreground">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <span className="font-mono font-semibold" style={{ color: amountColor }}>
                      {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </TerminalCard>
      </div>
    </Layout>
  );
};

export default Dashboard;
