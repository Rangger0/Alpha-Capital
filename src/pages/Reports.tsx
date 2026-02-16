import React, { useEffect, useState } from 'react';
import { Download, FileText, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getTransactions } from '@/lib/supabase';
import type { Transaction } from '@/types';
import { formatRupiah, formatDate, getMonthName } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Layout from '@/components/layout/Layout';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ReportSummary {
  income: number;
  expense: number;
  balance: number;
  categoryBreakdown: { name: string; amount: number; type: 'income' | 'expense' }[];
}

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    loadTransactions();
  }, [user]);

  useEffect(() => {
    // Set default period when report type changes
    const now = new Date();
    if (reportType === 'daily') {
      setSelectedPeriod(now.toISOString().split('T')[0]);
    } else if (reportType === 'monthly') {
      setSelectedPeriod(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    } else {
      setSelectedPeriod(now.getFullYear().toString());
    }
  }, [reportType]);

  const loadTransactions = async () => {
    if (!user) return;

    try {
      const { data } = await getTransactions(user.id);
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const getFilteredTransactions = () => {
    if (!selectedPeriod) return [];

    return transactions.filter((t) => {
      if (reportType === 'daily') {
        return t.date === selectedPeriod;
      } else if (reportType === 'monthly') {
        const [year, month] = selectedPeriod.split('-');
        const tDate = new Date(t.date);
        return tDate.getFullYear() === parseInt(year) && tDate.getMonth() === parseInt(month) - 1;
      } else {
        const tDate = new Date(t.date);
        return tDate.getFullYear() === parseInt(selectedPeriod);
      }
    });
  };

  const getReportSummary = (): ReportSummary => {
    const filtered = getFilteredTransactions();
    const income = filtered.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = filtered
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryMap = new Map<string, { amount: number; type: 'income' | 'expense' }>();
    filtered.forEach((t) => {
      const existing = categoryMap.get(t.category);
      if (existing) {
        existing.amount += t.amount;
      } else {
        categoryMap.set(t.category, { amount: t.amount, type: t.type });
      }
    });

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount);

    return { income, expense, balance: income - expense, categoryBreakdown };
  };

  const exportToCSV = () => {
    const filtered = getFilteredTransactions();
    if (filtered.length === 0) return;

    const headers = ['Tanggal', 'Jenis', 'Kategori', 'Nominal', 'Deskripsi'];
    const rows = filtered.map((t) => [
      t.date,
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      t.category,
      t.amount,
      t.description || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laporan-${reportType}-${selectedPeriod}.csv`;
    link.click();
  };

  const summary = getReportSummary();
  const filteredTransactions = getFilteredTransactions();

  const incomeCategories = summary.categoryBreakdown.filter((c) => c.type === 'income');
  const expenseCategories = summary.categoryBreakdown.filter((c) => c.type === 'expense');

  const COLORS = ['#A67C52', '#C6A75E', '#22c55e', '#ef4444', '#3b82f6', '#8b5cf6', '#f59e0b'];

  const getPeriodOptions = () => {
    const options: { value: string; label: string }[] = [];
    const now = new Date();

    if (reportType === 'daily') {
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        const value = date.toISOString().split('T')[0];
        options.push({
          value,
          label: formatDate(value),
        });
      }
    } else if (reportType === 'monthly') {
      for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        options.push({
          value,
          label: `${getMonthName(date.getMonth())} ${date.getFullYear()}`,
        });
      }
    } else {
      for (let i = 0; i < 5; i++) {
        const year = now.getFullYear() - i;
        options.push({
          value: year.toString(),
          label: year.toString(),
        });
      }
    }

    return options;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Laporan</h1>
            <p className="text-muted-foreground">Analisis dan export data keuangan</p>
          </div>
          <Button
            onClick={exportToCSV}
            disabled={filteredTransactions.length === 0}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={reportType} onValueChange={(v) => setReportType(v as any)}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Jenis Laporan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Harian</SelectItem>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                  <SelectItem value="yearly">Tahunan</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue placeholder="Pilih Periode" />
                </SelectTrigger>
                <SelectContent>
                  {getPeriodOptions().map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-100 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Pemasukan</p>
                  <p className="text-xl font-bold text-green-600">{formatRupiah(summary.income)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-red-100 text-red-600">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
                  <p className="text-xl font-bold text-red-600">{formatRupiah(summary.expense)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-lg ${
                    summary.balance >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}
                >
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Selisih</p>
                  <p
                    className={`text-xl font-bold ${
                      summary.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatRupiah(summary.balance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        {filteredTransactions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Berdasarkan Kategori</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="expense">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
                    <TabsTrigger value="income">Pemasukan</TabsTrigger>
                  </TabsList>
                  <TabsContent value="expense" className="pt-4">
                    {expenseCategories.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={expenseCategories}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="amount"
                            nameKey="name"
                          >
                            {expenseCategories.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatRupiah(value)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Tidak ada data pengeluaran
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="income" className="pt-4">
                    {incomeCategories.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={incomeCategories}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="amount"
                            nameKey="name"
                          >
                            {incomeCategories.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatRupiah(value)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Tidak ada data pemasukan
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Category List */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Detail Kategori</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="expense">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
                    <TabsTrigger value="income">Pemasukan</TabsTrigger>
                  </TabsList>
                  <TabsContent value="expense" className="pt-4">
                    <div className="space-y-2 max-h-[250px] overflow-auto">
                      {expenseCategories.length > 0 ? (
                        expenseCategories.map((cat, index) => (
                          <div
                            key={cat.name}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="text-sm">{cat.name}</span>
                            </div>
                            <span className="font-medium text-red-600">{formatRupiah(cat.amount)}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          Tidak ada data
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="income" className="pt-4">
                    <div className="space-y-2 max-h-[250px] overflow-auto">
                      {incomeCategories.length > 0 ? (
                        incomeCategories.map((cat, index) => (
                          <div
                            key={cat.name}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="text-sm">{cat.name}</span>
                            </div>
                            <span className="font-medium text-green-600">
                              {formatRupiah(cat.amount)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          Tidak ada data
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Tidak ada data</h3>
              <p className="text-muted-foreground">
                Tidak ada transaksi untuk periode yang dipilih
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Reports;
