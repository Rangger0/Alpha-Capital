import React, { useEffect, useState } from 'react';
import { Download, TrendingUp, TrendingDown, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTransactions } from '@/lib/supabase';
import type { Transaction } from '@/types';
import { getMonthName } from '@/utils/formatters';
import Layout from '@/components/layout/Layout';
import { CryptoChart } from '@/components/ui/CryptoChart';
import {
  TerminalCard,
  TerminalButton,
  TerminalBadge,
} from '@/components/ui/TerminalCard';
import PageHeader from '@/components/layout/PageHeader';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type TimeRange = '1day' | '7days' | '30days' | 'year';

interface ReportSummary {
  income: number;
  expense: number;
  balance: number;
  categoryBreakdown: { name: string; amount: number; type: 'income' | 'expense' }[];
}

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

const Reports: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t, language, formatCurrency, formatDate: formatDateLang } = useLanguage();
  const isDark = theme === 'dark';
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  // Colors
  const tone = (cssVar: string) => `hsl(var(${cssVar}))`;
  const toneA = (cssVar: string, alpha: number) => `hsl(var(${cssVar}) / ${alpha})`;
  const colors = {
    green: tone('--finance-positive'),
    red: tone('--finance-negative'),
    chartColors: [
      tone('--finance-positive'),
      tone('--primary'),
      tone('--accent'),
      tone('--finance-negative'),
      tone('--finance-warning'),
      tone('--muted-foreground'),
    ],
  };
  const expensePalette = [
    tone('--finance-negative'),
    toneA('--finance-negative', 0.85),
    toneA('--finance-negative', 0.7),
    toneA('--finance-negative', 0.55),
    toneA('--finance-negative', 0.4),
    toneA('--finance-negative', 0.25),
  ];
  const incomePalette = [
    tone('--finance-positive'),
    toneA('--finance-positive', 0.85),
    toneA('--finance-positive', 0.7),
    toneA('--finance-positive', 0.55),
    toneA('--finance-positive', 0.4),
    toneA('--finance-positive', 0.25),
  ];

  useEffect(() => {
    if (!user) return;
    loadTransactions();
  }, [user]);

  useEffect(() => {
    const now = new Date();
    if (reportType === 'daily') {
      setSelectedPeriod(now.toISOString().split('T')[0]);
    } else if (reportType === 'monthly') {
      setSelectedPeriod(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    } else {
      setSelectedPeriod(now.getFullYear().toString());
    }
  }, [reportType]);

  useEffect(() => {
    if (transactions.length > 0) {
      const data = prepareChartData(transactions, timeRange);
      setChartData(data);
    }
  }, [transactions, timeRange, language]);

  const loadTransactions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await getTransactions(user.id);
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (allTransactions: Transaction[], range: TimeRange): ChartData[] => {
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

    allTransactions.forEach((t) => {
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

  const getFilteredTransactions = () => {
    if (!selectedPeriod) return [];
    return transactions.filter((t) => {
      if (reportType === 'daily') return t.date === selectedPeriod;
      if (reportType === 'monthly') {
        const [year, month] = selectedPeriod.split('-');
        const tDate = new Date(t.date);
        return tDate.getFullYear() === parseInt(year) && tDate.getMonth() === parseInt(month) - 1;
      }
      const tDate = new Date(t.date);
      return tDate.getFullYear() === parseInt(selectedPeriod);
    });
  };

  const getReportSummary = (): ReportSummary => {
    const filtered = getFilteredTransactions();
    const income = filtered.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = filtered.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    const categoryMap = new Map<string, { amount: number; type: 'income' | 'expense' }>();
    filtered.forEach((t) => {
      const existing = categoryMap.get(t.category);
      if (existing) existing.amount += t.amount;
      else categoryMap.set(t.category, { amount: t.amount, type: t.type });
    });

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount);

    return { income, expense, balance: income - expense, categoryBreakdown };
  };

  const exportToCSV = () => {
    const filtered = getFilteredTransactions();
    if (filtered.length === 0) return;

    const headers = language === 'id' 
      ? ['Tanggal', 'Jenis', 'Kategori', 'Nominal', 'Deskripsi']
      : ['Date', 'Type', 'Category', 'Amount', 'Description'];

    const rows = filtered.map((t) => [
      t.date,
      t.type === 'income' ? (language === 'id' ? 'Pemasukan' : 'Income') : (language === 'id' ? 'Pengeluaran' : 'Expense'),
      t.category,
      t.amount,
      t.description || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${language === 'id' ? 'laporan' : 'report'}-${reportType}-${selectedPeriod}.csv`;
    link.click();
  };

  const summary = getReportSummary();
  const filteredTransactions = getFilteredTransactions();
  const incomeCategories = summary.categoryBreakdown.filter((c) => c.type === 'income');
  const expenseCategories = summary.categoryBreakdown.filter((c) => c.type === 'expense');

  const getPeriodOptions = () => {
    const options: { value: string; label: string }[] = [];
    const now = new Date();

    if (reportType === 'daily') {
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        const value = date.toISOString().split('T')[0];
        options.push({ value, label: formatDateLang(value) });
      }
    } else if (reportType === 'weekly') {
      for (let i = 0; i < 12; i++) {
        const end = new Date(now);
        end.setDate(now.getDate() - i * 7);
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        const value = `${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}`;
        const label = language === 'id'
          ? `Minggu ${i + 1} (${formatDateLang(start.toISOString().split('T')[0])} - ${formatDateLang(end.toISOString().split('T')[0])})`
          : `Week ${i + 1} (${formatDateLang(start.toISOString().split('T')[0])} - ${formatDateLang(end.toISOString().split('T')[0])})`;
        options.push({ value, label });
      }
    } else if (reportType === 'monthly') {
      for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = language === 'id' 
          ? `${getMonthName(date.getMonth())} ${date.getFullYear()}`
          : date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        options.push({ value, label });
      }
    } else {
      for (let i = 0; i < 5; i++) {
        const year = now.getFullYear() - i;
        options.push({ value: year.toString(), label: year.toString() });
      }
    }
    return options;
  };

  const reportTypeButtons = {
    daily: language === 'id' ? 'Harian' : 'Daily',
    weekly: language === 'id' ? 'Mingguan' : 'Weekly',
    monthly: language === 'id' ? 'Bulanan' : 'Monthly',
    yearly: language === 'id' ? 'Tahunan' : 'Yearly',
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader
          eyebrow={language === 'id' ? 'Analisis' : 'Analytics'}
          title={t('nav.reports')}
          subtitle={language === 'id' ? 'Analisis dan ekspor data keuangan' : 'Analyze and export financial data in a lighter layout.'}
          action={(
            <TerminalButton
              onClick={exportToCSV}
              disabled={filteredTransactions.length === 0}
              variant="secondary"
              glow={false}
              className={isDark ? 'bg-[#1a1a1a] text-white border-[#333333] hover:bg-[#252525]' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}
            >
              <Download className={`mr-2 h-4 w-4 ${isDark ? 'text-[#ffa502]' : 'text-blue-500'}`} />
              Export CSV
            </TerminalButton>
          )}
        />

        <CryptoChart 
          data={chartData}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          loading={loading}
        />

        {/* Filters */}
        <TerminalCard 
          title="filter_config" 
          subtitle={language === 'id' ? 'konfigurasi_parameter' : 'parameter_config'} 
          glow={false}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${isDark ? 'text-[#a0a0a0]' : 'text-gray-500'}`}>
                {language === 'id' ? 'Jenis Laporan' : 'Report Type'}
              </label>
              <div className="flex flex-wrap gap-2">
                {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setReportType(type)}
                    className={`
                      px-4 py-2 rounded font-mono text-sm transition-all duration-200 flex-1 basis-[48%] sm:basis-auto
                      ${reportType === type
                        ? (isDark 
                            ? 'bg-[#333333] text-white shadow-[0_0_10px_rgba(255,165,2,0.3)]' 
                            : 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]')
                        : (isDark 
                            ? 'bg-[#1a1a1a] text-[#a0a0a0] hover:text-white hover:bg-[#252525]'
                            : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200')
                      }
                    `}
                  >
                    {reportTypeButtons[type]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <label className={`block text-xs font-mono uppercase tracking-wider mb-2 ${isDark ? 'text-[#a0a0a0]' : 'text-gray-500'}`}>
                {language === 'id' ? 'Periode' : 'Period'}
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className={`w-full px-4 py-2 rounded font-mono text-sm outline-none transition-all ${
                  isDark 
                    ? 'bg-[#1a1a1a] border border-[#333333] text-white focus:border-[#ffa502]' 
                    : 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500'
                }`}
              >
                {getPeriodOptions().map((opt) => (
                  <option key={opt.value} value={opt.value} className={isDark ? 'bg-[#111111]' : 'bg-white'}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </TerminalCard>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TerminalCard title="total_income">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <span className={`text-xs uppercase tracking-wider font-mono ${isDark ? 'text-[#a0a0a0]' : 'text-gray-500'}`}>
                  {t('dashboard.totalIncome')}
                </span>
                <p className="text-2xl font-bold font-mono" style={{ color: colors.green }}>
                  {formatCurrency(summary.income)}
                </p>
              </div>
              <div className={`p-3 rounded border ${isDark ? 'bg-[#1a1a1a] border-[#333333]' : 'bg-gray-100 border-gray-200'}`} style={{ color: colors.green }}>
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </TerminalCard>

          <TerminalCard title="total_expense">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <span className={`text-xs uppercase tracking-wider font-mono ${isDark ? 'text-[#a0a0a0]' : 'text-gray-500'}`}>
                  {t('dashboard.totalExpense')}
                </span>
                <p className="text-2xl font-bold font-mono" style={{ color: colors.red }}>
                  {formatCurrency(summary.expense)}
                </p>
              </div>
              <div className={`p-3 rounded border ${isDark ? 'bg-[#1a1a1a] border-[#333333]' : 'bg-gray-100 border-gray-200'}`} style={{ color: colors.red }}>
                <TrendingDown className="h-5 w-5" />
              </div>
            </div>
          </TerminalCard>

          <TerminalCard title="balance_diff">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <span className={`text-xs uppercase tracking-wider font-mono ${isDark ? 'text-[#a0a0a0]' : 'text-gray-500'}`}>
                  {language === 'id' ? 'Selisih' : 'Balance'}
                </span>
                <p className="text-2xl font-bold font-mono" style={{ color: summary.balance >= 0 ? colors.green : colors.red }}>
                  {formatCurrency(summary.balance)}
                </p>
                <TerminalBadge variant={summary.balance >= 0 ? 'success' : 'danger'}>
                  {summary.balance >= 0 ? (language === 'id' ? 'Surplus' : 'Surplus') : (language === 'id' ? 'Defisit' : 'Deficit')}
                </TerminalBadge>
              </div>
              <div className={`p-3 rounded border ${isDark ? 'bg-[#1a1a1a] border-[#333333]' : 'bg-gray-100 border-gray-200'}`} style={{ color: summary.balance >= 0 ? colors.green : colors.red }}>
                {summary.balance >= 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
              </div>
            </div>
          </TerminalCard>
        </div>

        {/* Charts */}
        {filteredTransactions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TerminalCard 
              title="category_distribution" 
              subtitle={language === 'id' ? 'visualisasi_data' : 'data_visualization'}
            >
              <div className={`flex gap-2 p-1 rounded border mb-4 ${isDark ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-slate-100 border-slate-200'}`}>
                <button
                  onClick={() => document.getElementById('tab-expense')?.scrollIntoView({ behavior: 'smooth' })}
                  className={`flex-1 rounded-md px-4 py-2 font-mono text-xs font-semibold ${
                    isDark
                      ? 'bg-[hsl(var(--finance-negative))] text-black'
                      : 'bg-[hsl(var(--finance-negative))] text-white'
                  }`}
                >
                  {language === 'id' ? 'Pengeluaran' : 'Expense'}
                </button>
                <button
                  onClick={() => document.getElementById('tab-income')?.scrollIntoView({ behavior: 'smooth' })}
                  className={`flex-1 rounded-md px-4 py-2 font-mono text-xs font-semibold ${
                    isDark
                      ? 'bg-[hsl(var(--finance-positive))] text-black'
                      : 'bg-[hsl(var(--finance-positive))] text-white'
                  }`}
                >
                  {language === 'id' ? 'Pemasukan' : 'Income'}
                </button>
              </div>

              <div className="space-y-6">
                <div id="tab-expense">
                  <h4 className={`text-xs font-mono uppercase tracking-wider mb-3 ${isDark ? 'text-[#DC2626]/70' : 'text-blue-900/70'}`}>
                    {language === 'id' ? 'Distribusi Pengeluaran' : 'Expense Breakdown'}
                  </h4>
                  {expenseCategories.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie
                            data={expenseCategories}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="amount"
                            nameKey="name"
                            label={false}
                            labelLine={false}
                          >
                            {expenseCategories.map((_, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={expensePalette[index % expensePalette.length]} 
                                fillOpacity={isDark ? 0.85 : 0.9}
                                stroke={isDark ? tone('--background') : '#ffffff'}
                                strokeWidth={1.2}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                              border: isDark ? '1px solid #334155' : '1px solid #e2e8f0', 
                              borderRadius: '8px',
                              fontFamily: 'JetBrains Mono',
                              color: isDark ? '#e2e8f0' : '#0f172a'
                            }} 
                            formatter={(value: number) => formatCurrency(value)} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-3 space-y-2">
                        {expenseCategories.map((cat, index) => (
                          <div
                            key={cat.name}
                            className="flex items-center justify-between text-sm rounded border px-2 py-1"
                            style={{
                              backgroundColor: isDark ? 'rgba(15,23,42,0.35)' : 'rgba(255,255,255,0.92)',
                              borderColor: isDark ? toneA('--finance-negative', 0.25) : toneA('--finance-negative', 0.2),
                            }}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="h-3 w-3 rounded-full ring-1 ring-border shadow-[0_0_4px_currentColor]"
                                style={{ backgroundColor: expensePalette[index % expensePalette.length] }}
                              />
                              <span className={`font-mono text-xs truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{cat.name}</span>
                            </div>
                            <span className="font-mono text-xs font-semibold whitespace-nowrap" style={{ color: colors.red }}>
                              -{formatCurrency(cat.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className={`text-center py-8 font-mono text-sm ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>
                      {language === 'id' ? 'Tidak ada data pengeluaran' : 'No expense data'}
                    </div>
                  )}
                </div>

                <div id="tab-income">
                  <h4 className={`text-xs font-mono uppercase tracking-wider mb-3 ${isDark ? 'text-[#EAB308]/70' : 'text-yellow-600/70'}`}>
                    {language === 'id' ? 'Distribusi Pemasukan' : 'Income Breakdown'}
                  </h4>
                  {incomeCategories.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie
                            data={incomeCategories}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="amount"
                            nameKey="name"
                            label={false}
                            labelLine={false}
                          >
                            {incomeCategories.map((_, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={incomePalette[index % incomePalette.length]}
                                fillOpacity={isDark ? 0.85 : 0.9}
                                stroke={isDark ? tone('--background') : '#ffffff'}
                                strokeWidth={1.2}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                              border: isDark ? '1px solid #334155' : '1px solid #e2e8f0', 
                              borderRadius: '8px',
                              fontFamily: 'JetBrains Mono',
                              color: isDark ? '#e2e8f0' : '#0f172a'
                            }} 
                            formatter={(value: number) => formatCurrency(value)} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-3 space-y-2">
                        {incomeCategories.map((cat, index) => (
                          <div
                            key={cat.name}
                            className="flex items-center justify-between text-sm rounded border px-2 py-1"
                            style={{
                              backgroundColor: isDark ? 'rgba(15,23,42,0.35)' : 'rgba(255,255,255,0.92)',
                              borderColor: isDark ? toneA('--finance-positive', 0.25) : toneA('--finance-positive', 0.2),
                            }}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="h-3 w-3 rounded-full ring-1 ring-border shadow-[0_0_4px_currentColor]"
                                style={{ backgroundColor: incomePalette[index % incomePalette.length] }}
                              />
                              <span className={`font-mono text-xs truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{cat.name}</span>
                            </div>
                            <span className="font-mono text-xs font-semibold whitespace-nowrap" style={{ color: colors.green }}>
                              +{formatCurrency(cat.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className={`text-center py-8 font-mono text-sm ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>
                      [NULL] {language === 'id' ? 'Tidak ada data pemasukan' : 'No income data'}
                    </div>
                  )}
                </div>
              </div>
            </TerminalCard>

            <TerminalCard 
              title="category_detail" 
              subtitle={language === 'id' ? 'breakdown_berdasarkan_tipe' : 'breakdown_by_type'}
            >
              <div className={`flex gap-1 p-1 rounded border mb-4 ${isDark ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-slate-100 border-slate-200'}`}>
                <button
                  className="flex-1 px-4 py-2 rounded-md font-mono text-xs font-semibold shadow-sm transition-all"
                  style={{
                    backgroundColor: 'hsl(var(--finance-negative))',
                    color: isDark ? 'hsl(var(--background))' : '#ffffff',
                  }}
                >
                  {language === 'id' ? 'Pengeluaran' : 'Expense'}
                </button>
                <button
                  className="flex-1 px-4 py-2 rounded-md font-mono text-xs font-semibold shadow-sm transition-all"
                  style={{
                    backgroundColor: 'hsl(var(--finance-positive))',
                    color: isDark ? 'hsl(var(--background))' : '#ffffff',
                  }}
                >
                  {language === 'id' ? 'Pemasukan' : 'Income'}
                </button>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-auto">
                <div>
                  <h4 className={`text-xs font-mono uppercase tracking-wider mb-2 sticky top-0 py-1 ${isDark ? 'bg-[#111111]/80 text-[#ff4757]/70' : 'bg-white/80 text-red-500/70'}`}>
                    {language === 'id' ? 'Daftar Pengeluaran' : 'Expense List'}
                  </h4>
                  <div className="space-y-2">
                    {expenseCategories.length > 0 ? (
                      expenseCategories.map((cat, index) => (
                        <div
                          key={cat.name}
                          className="flex items-center justify-between p-3 rounded border transition-colors"
                          style={{
                            backgroundColor: isDark ? toneA('--finance-negative', 0.08) : toneA('--finance-negative', 0.12),
                            borderColor: toneA('--finance-negative', isDark ? 0.25 : 0.3),
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full shadow-[0_0_6px_currentColor]" style={{ backgroundColor: expensePalette[index % expensePalette.length], color: expensePalette[index % expensePalette.length] }} />
                            <span className={`font-mono text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{cat.name}</span>
                          </div>
                          <span className="font-mono font-semibold" style={{ color: colors.red }}>-{formatCurrency(cat.amount)}</span>
                        </div>
                      ))
                    ) : (
                      <div className={`text-center py-4 font-mono text-sm ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>{language === 'id' ? 'Tidak ada data' : 'No data'}</div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className={`text-xs font-mono uppercase tracking-wider mb-2 sticky top-0 py-1 ${isDark ? 'bg-[#111111]/80 text-[#00d084]/70' : 'bg-white/80 text-green-500/70'}`}>
                    {language === 'id' ? 'Daftar Pemasukan' : 'Income List'}
                  </h4>
                  <div className="space-y-2">
                    {incomeCategories.length > 0 ? (
                      incomeCategories.map((cat, index) => (
                        <div
                          key={cat.name}
                          className="flex items-center justify-between p-3 rounded border transition-colors"
                          style={{
                            backgroundColor: isDark ? toneA('--finance-positive', 0.08) : toneA('--finance-positive', 0.12),
                            borderColor: toneA('--finance-positive', isDark ? 0.25 : 0.3),
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full shadow-[0_0_6px_currentColor]" style={{ backgroundColor: incomePalette[index % incomePalette.length], color: incomePalette[index % incomePalette.length] }} />
                            <span className={`font-mono text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{cat.name}</span>
                          </div>
                          <span className="font-mono font-semibold" style={{ color: colors.green }}>+{formatCurrency(cat.amount)}</span>
                        </div>
                      ))
                    ) : (
                      <div className={`text-center py-4 font-mono text-sm ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>{language === 'id' ? 'Tidak ada data' : 'No data'}</div>
                    )}
                  </div>
                </div>
              </div>
            </TerminalCard>
          </div>
        ) : (
          <TerminalCard title="system_status">
            <div className="p-12 text-center">
              <Calendar className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-[#ffa502]/30' : 'text-blue-500/30'}`} />
              <h3 className={`text-lg font-mono font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{language === 'id' ? 'Data Tidak Ditemukan' : 'Data Not Found'}</h3>
              <p className={`font-mono text-sm ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>
                {language === 'id' ? 'Tidak ada transaksi untuk periode yang dipilih' : 'No transactions for selected period'}
              </p>
            </div>
          </TerminalCard>
        )}
      </div>
    </Layout>
  );
};

export default Reports;
