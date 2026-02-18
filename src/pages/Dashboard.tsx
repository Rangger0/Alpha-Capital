import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar, 
  Plus, 
  Github, 
  Twitter, 
  Mail,
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
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTransactions } from '@/lib/supabase';
import type { Transaction } from '@/types';
import { 
  formatRupiah, 
  formatDate, 
  formatShortDate, 
  formatCompactNumber 
} from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');
  
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [topExpenses, setTopExpenses] = useState<{category: string; amount: number}[]>([]);

  const netProfit = totalIncome - totalExpense;
  const savingRatio = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  const burnRate = totalExpense / (timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 365);

  useEffect(() => {
    if (!user) return;
    loadDashboardData();
  }, [user, timeRange]);

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

      const chartData = prepareChartData(filteredTransactions, timeRange);
      setChartData(chartData);

      const pieData: CategoryData[] = Array.from(categoryMap.entries())
        .map(([name, value], index) => ({
          name,
          value,
          color: ['#C6A75E', '#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'][index % 7],
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

  const prepareChartData = (transactions: Transaction[], range: TimeRange): ChartData[] => {
    const data: ChartData[] = [];
    const now = new Date();
    const locale = language === 'id' ? 'id-ID' : 'en-US';

    if (range === '7days') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        data.push({
          date: dateStr,
          label: date.toLocaleDateString(locale, { weekday: 'short' }),
          income: 0,
          expense: 0,
          net: 0,
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
        });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        data.push({
          date: date.toISOString().split('T')[0],
          label: date.toLocaleDateString(locale, { month: 'short' }),
          income: 0,
          expense: 0,
          net: 0,
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

    return data;
  };

  const DigitalClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
      const timer = setInterval(() => setTime(new Date()), 1000);
      return () => clearInterval(timer);
    }, []);

    const locale = language === 'id' ? 'id-ID' : 'en-US';

    return (
      <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
        <Clock className="h-4 w-4" />
        <span>{time.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        <span className="text-border">|</span>
        <span>{time.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
      </div>
    );
  };

  const SavingRatioBadge = ({ ratio }: { ratio: number }) => {
    let color = 'text-finance-danger bg-finance-danger/10';
    let label = t('dashboard.risk');

    if (ratio > 30) {
      color = 'text-finance-success bg-finance-success/10';
      label = t('dashboard.healthy');
    } else if (ratio >= 10) {
      color = 'text-gold bg-gold/10';
      label = t('dashboard.normal');
    }

    return (
      <Badge variant="outline" className={`${color} border-0 font-medium`}>
        {label} • {ratio.toFixed(1)}%
      </Badge>
    );
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendUp,
    color,
    delay = 0,
  }: {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ElementType;
    trend?: string;
    trendUp?: boolean;
    color: string;
    delay?: number;
  }) => (
    <Card className="stat-card-glow card-hover border-border/50" style={{ animationDelay: `${delay}ms` }}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground font-medium">{title}</p>
              {trend && !loading && (
                <Badge variant="outline" className={`text-xs ${trendUp ? 'text-finance-success border-finance-success/30' : 'text-finance-danger border-finance-danger/30'}`}>
                  {trendUp ? <ChevronUp className="h-3 w-3 mr-0.5" /> : <ChevronDown className="h-3 w-3 mr-0.5" />}
                  {trend}
                </Badge>
              )}
            </div>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p className="text-2xl font-bold font-mono-tabular tracking-tight">{value}</p>
            )}
            {subtitle && !loading && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color} shadow-lg`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-border/50">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gradient-gold">{t('dashboard.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <DigitalClock />
            <Button 
              onClick={() => navigate('/transactions/new')}
              className="bg-gold hover:bg-gold-dark text-finance-dark font-semibold shadow-glow hover:shadow-glow-lg transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('dashboard.addTransaction')}
            </Button>
          </div>
        </div>

        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)} className="w-full">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="7days" className="data-[state=active]:bg-gold data-[state=active]:text-finance-dark">
              {t('time.7days')}
            </TabsTrigger>
            <TabsTrigger value="30days" className="data-[state=active]:bg-gold data-[state=active]:text-finance-dark">
              {t('time.30days')}
            </TabsTrigger>
            <TabsTrigger value="year" className="data-[state=active]:bg-gold data-[state=active]:text-finance-dark">
              {t('time.year')}
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <StatCard
              title={t('dashboard.totalBalance')}
              value={formatRupiah(totalBalance)}
              subtitle={t('dashboard.allPeriod')}
              icon={Wallet}
              color="bg-gradient-to-br from-gold to-gold-dark"
              delay={0}
            />
            <StatCard
              title={t('dashboard.totalIncome')}
              value={formatRupiah(totalIncome)}
              subtitle={`${t('dashboard.periodPrefix')} ${timeRange === '7days' ? t('dashboard.days7') : timeRange === '30days' ? t('dashboard.days30') : t('dashboard.year')}`}
              icon={TrendingUp}
              trend="+12.5%"
              trendUp={true}
              color="bg-finance-success"
              delay={100}
            />
            <StatCard
              title={t('dashboard.totalExpense')}
              value={formatRupiah(totalExpense)}
              subtitle={`${t('dashboard.periodPrefix')} ${timeRange === '7days' ? t('dashboard.days7') : timeRange === '30days' ? t('dashboard.days30') : t('dashboard.year')}`}
              icon={TrendingDown}
              trend="+5.2%"
              trendUp={false}
              color="bg-finance-danger"
              delay={200}
            />
            <StatCard
              title={t('dashboard.netProfit')}
              value={formatRupiah(Math.abs(netProfit))}
              subtitle={netProfit >= 0 ? t('dashboard.profit') : t('dashboard.loss')}
              icon={netProfit >= 0 ? ArrowUpRight : ArrowDownRight}
              color={netProfit >= 0 ? 'bg-finance-success' : 'bg-finance-danger'}
              delay={300}
            />
            <StatCard
              title={t('dashboard.burnRate')}
              value={formatRupiah(burnRate * 30)}
              subtitle={t('dashboard.estMonthly')}
              icon={Flame}
              color="bg-finance-warning"
              delay={400}
            />
            <Card className="stat-card-glow card-hover border-border/50" style={{ animationDelay: '500ms' }}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">{t('dashboard.savingRatio')}</p>
                    {loading ? (
                      <Skeleton className="h-8 w-32" />
                    ) : (
                      <>
                        <p className="text-2xl font-bold font-mono-tabular">{savingRatio.toFixed(1)}%</p>
                        <SavingRatioBadge ratio={savingRatio} />
                      </>
                    )}
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                    <PiggyBank className="h-5 w-5 text-white" />
                  </div>
                </div>
                <Progress 
                  value={Math.max(0, Math.min(100, savingRatio))} 
                  className="mt-4 h-2"
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <Card className="lg:col-span-2 border-border/50 card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-gold" />
                    {t('dashboard.cashflowAnalysis')}
                  </CardTitle>
                  <CardDescription>
                    {timeRange === '7days' ? t('dashboard.last7Days') : timeRange === '30days' ? t('dashboard.last5Weeks') : t('dashboard.last12Months')}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-80 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    {timeRange === 'year' ? (
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickFormatter={(value) => formatCompactNumber(value)} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(value: number) => formatRupiah(value)} />
                        <Area type="monotone" dataKey="income" name={t('dashboard.totalIncome')} stroke="#10B981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                        <Area type="monotone" dataKey="expense" name={t('dashboard.totalExpense')} stroke="#EF4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
                      </AreaChart>
                    ) : (
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickFormatter={(value) => formatCompactNumber(value)} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(value: number) => formatRupiah(value)} />
                        <Bar dataKey="income" name={t('dashboard.totalIncome')} fill="#10B981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" name={t('dashboard.totalExpense')} fill="#EF4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-gold" />
                  {t('dashboard.topCategories')}
                </CardTitle>
                <CardDescription>{t('dashboard.expenseDistribution')}</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : categoryData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    {language === 'id' ? 'Tidak ada data' : 'No data'}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <RePieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(value: number) => formatRupiah(value)} />
                    </RePieChart>
                  </ResponsiveContainer>
                )}
                <div className="space-y-2 mt-4">
                  {categoryData.slice(0, 4).map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-muted-foreground truncate max-w-[100px]">{cat.name}</span>
                      </div>
                      <span className="font-mono font-medium">{formatCompactNumber(cat.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card className="border-border/50 card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg font-semibold">{t('dashboard.top5Expenses')}</CardTitle>
                  <CardDescription>{t('dashboard.highestExpenseCategories')}</CardDescription>
                </div>
                <Target className="h-5 w-5 text-finance-danger" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : topExpenses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {language === 'id' ? 'Belum ada data' : 'No data yet'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topExpenses.map((expense, index) => (
                      <div key={expense.category} className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-finance-danger/10 flex items-center justify-center text-finance-danger font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm truncate">{expense.category}</span>
                            <span className="font-mono font-semibold text-sm">{formatRupiah(expense.amount)}</span>
                          </div>
                          <Progress value={(expense.amount / topExpenses[0].amount) * 100} className="h-1.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg font-semibold">{t('dashboard.recentTransactions')}</CardTitle>
                  <CardDescription>{t('dashboard.last5Transactions')}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')} className="text-gold hover:text-gold-light">
                  {t('dashboard.viewAll')}
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-14 w-full" />
                    ))}
                  </div>
                ) : recentTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>{language === 'id' ? 'Belum ada transaksi' : 'No transactions'}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer group"
                        onClick={() => navigate('/transactions')}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg transition-colors ${transaction.type === 'income' ? 'bg-finance-success/10 text-finance-success group-hover:bg-finance-success/20' : 'bg-finance-danger/10 text-finance-danger group-hover:bg-finance-danger/20'}`}>
                            {transaction.type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{transaction.category}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                          </div>
                        </div>
                        <span className={`font-mono font-semibold ${transaction.type === 'income' ? 'text-finance-success' : 'text-finance-danger'}`}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatRupiah(transaction.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </Tabs>

        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">{t('footer.contact')}</p>
            <div className="flex items-center justify-center gap-4">
              <a href="https://github.com/Rangger0" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-muted hover:bg-gold hover:text-finance-dark transition-all duration-300 hover:scale-110">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://x.com/rinzx_" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-muted hover:bg-gold hover:text-finance-dark transition-all duration-300 hover:scale-110">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://www.tiktok.com/@rinzzx0" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-muted hover:bg-gold hover:text-finance-dark transition-all duration-300 hover:scale-110">
                <TikTokIcon />
              </a>
              <a href="mailto:Allgazali011@gmail.com" className="p-3 rounded-full bg-muted hover:bg-gold hover:text-finance-dark transition-all duration-300 hover:scale-110">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;