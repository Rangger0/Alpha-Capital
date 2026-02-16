import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Wallet, Calendar, Plus, Github, Twitter, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardStats, getTransactions } from '@/lib/supabase';
import type { Transaction } from '@/types';
import { formatRupiah, formatDate, formatShortDate } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Layout from '@/components/layout/Layout';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface WeeklyData {
  date: string;
  income: number;
  expense: number;
  label: string;
}

// TikTok Icon Component
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Social Links Component
const SocialLinks = () => (
  <div className="mt-12 pt-8 border-t border-border/50">
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-muted-foreground">Hubungi Kami</p>
      <div className="flex items-center justify-center gap-4">
        <a 
          href="https://github.com/Rangger0" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-3 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 hover:rotate-6"
          aria-label="GitHub"
        >
          <Github className="w-5 h-5" />
        </a>
        <a 
          href="https://x.com/rinzx_" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-3 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 hover:-rotate-6"
          aria-label="X (Twitter)"
        >
          <Twitter className="w-5 h-5" />
        </a>
        <a 
          href="https://www.tiktok.com/@rinzzx0" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-3 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 hover:rotate-6"
          aria-label="TikTok"
        >
          <TikTokIcon />
        </a>
        <a 
          href="mailto:Allgazali011@gmail.com"
          className="p-3 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 hover:-rotate-6"
          aria-label="Email"
        >
          <Mail className="w-5 h-5" />
        </a>
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) return;
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Get dashboard stats
      const { monthlyTransactions, allTransactions, weeklyTransactions } = await getDashboardStats(user.id);

      // Calculate monthly income and expense
      let income = 0;
      let expense = 0;
      monthlyTransactions?.forEach((t) => {
        if (t.type === 'income') {
          income += t.amount;
        } else {
          expense += t.amount;
        }
      });
      setMonthlyIncome(income);
      setMonthlyExpense(expense);

      // Calculate total balance
      let balance = 0;
      allTransactions?.forEach((t) => {
        if (t.type === 'income') {
          balance += t.amount;
        } else {
          balance -= t.amount;
        }
      });
      setTotalBalance(balance);

      // Prepare weekly chart data
      const last7Days: WeeklyData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        last7Days.push({
          date: dateStr,
          income: 0,
          expense: 0,
          label: formatShortDate(dateStr),
        });
      }

      weeklyTransactions?.forEach((t) => {
        const dayData = last7Days.find((d) => d.date === t.date);
        if (dayData) {
          if (t.type === 'income') {
            dayData.income += t.amount;
          } else {
            dayData.expense += t.amount;
          }
        }
      });
      setWeeklyData(last7Days);

      // Get recent transactions
      const { data: transactions } = await getTransactions(user.id, { limit: 5 } as any);
      setRecentTransactions(transactions?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendUp,
    color,
  }: {
    title: string;
    value: string;
    icon: React.ElementType;
    trend?: string;
    trendUp?: boolean;
    color: string;
  }) => (
    <Card className="border-border/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
            {trend && !loading && (
              <div className={`flex items-center text-sm ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                {trendUp ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {trend}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Ringkasan keuangan Anda</p>
          </div>
          <Button onClick={() => navigate('/transactions/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Transaksi
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Saldo"
            value={formatRupiah(totalBalance)}
            icon={Wallet}
            color="bg-gradient-to-br from-[#A67C52] to-[#C6A75E]"
          />
          <StatCard
            title="Pemasukan Bulan Ini"
            value={formatRupiah(monthlyIncome)}
            icon={TrendingUp}
            trend="Bulan berjalan"
            trendUp={true}
            color="bg-green-500"
          />
          <StatCard
            title="Pengeluaran Bulan Ini"
            value={formatRupiah(monthlyExpense)}
            icon={TrendingDown}
            trend="Bulan berjalan"
            trendUp={false}
            color="bg-red-500"
          />
        </div>

        {/* Chart and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">7 Hari Terakhir</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={256}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      tickFormatter={(value) => `Rp${value / 1000}K`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => formatRupiah(value)}
                    />
                    <Bar dataKey="income" name="Pemasukan" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Transaksi Terbaru</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>
                Lihat Semua
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
                  <p>Belum ada transaksi</p>
                  <p className="text-sm">Mulai catat transaksi pertama Anda</p>
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
                        <div
                          className={`p-2 rounded-lg ${
                            transaction.type === 'income'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {transaction.type === 'income' ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{transaction.category}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                        </div>
                      </div>
                      <span
                        className={`font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
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

        {/* Social Links - TAMBAHAN */}
        <SocialLinks />
      </div>
    </Layout>
  );
};

export default Dashboard;