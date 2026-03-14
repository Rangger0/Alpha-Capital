import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTransactions, deleteTransaction, getCategories } from '@/lib/supabase';
import type { Transaction, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TerminalCard,
  TerminalButton,
  TerminalBadge,
} from '@/components/ui/TerminalCard';
import { useIsMobile } from '@/hooks/use-mobile';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';

const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { language, formatCurrency, formatDate: formatDateLang } = useLanguage();
  const isDark = theme === 'dark';
  const isMobile = useIsMobile();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [{ data: transactionsData }, { data: categoriesData }] = await Promise.all([
        getTransactions(user.id),
        getCategories(user.id),
      ]);

      setTransactions(transactionsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!transactionToDelete) return;

    const { error } = await deleteTransaction(transactionToDelete.id);
    if (!error) {
      setTransactions((prev) => prev.filter((t) => t.id !== transactionToDelete.id));
    }
    setDeleteDialogOpen(false);
    setTransactionToDelete(null);
  };

  const getFilteredTransactions = () => {
    return transactions.filter((transaction) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = transaction.category.toLowerCase().includes(query) || transaction.description?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (filterType !== 'all' && transaction.type !== filterType) return false;
      if (filterCategory !== 'all' && transaction.category !== filterCategory) return false;

      if (filterPeriod !== 'all') {
        const transactionDate = new Date(transaction.date);
        const now = new Date();

        switch (filterPeriod) {
          case 'today':
            if (transactionDate.toDateString() !== now.toDateString()) return false;
            break;
          case 'week':
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            if (transactionDate < weekAgo) return false;
            break;
          case 'month':
            if (transactionDate.getMonth() !== now.getMonth() || transactionDate.getFullYear() !== now.getFullYear()) return false;
            break;
          case 'year':
            if (transactionDate.getFullYear() !== now.getFullYear()) return false;
            break;
        }
      }

      return true;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterCategory('all');
    setFilterPeriod('all');
  };

  const hasFilters = searchQuery || filterType !== 'all' || filterCategory !== 'all' || filterPeriod !== 'all';

  const typeLabels = {
    all: language === 'id' ? 'Semua Jenis' : 'All Types',
    income: language === 'id' ? 'Pemasukan' : 'Income',
    expense: language === 'id' ? 'Pengeluaran' : 'Expense',
  };

  const periodLabels = {
    all: language === 'id' ? 'Semua Waktu' : 'All Time',
    today: language === 'id' ? 'Hari Ini' : 'Today',
    week: language === 'id' ? '7 Hari Terakhir' : 'Last 7 Days',
    month: language === 'id' ? 'Bulan Ini' : 'This Month',
    year: language === 'id' ? 'Tahun Ini' : 'This Year',
  };

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          eyebrow={language === 'id' ? 'Histori Keuangan' : 'Transaction History'}
          title={language === 'id' ? 'Transaksi' : 'Transactions'}
          subtitle={language === 'id' ? 'Kelola pemasukan dan pengeluaran dalam satu tampilan yang lebih rapi.' : 'Manage income and expenses in a cleaner single view.'}
          action={!isMobile ? (
            <TerminalButton onClick={() => navigate('/transactions/new')}>
              <Plus className="mr-2 h-4 w-4" />
              {language === 'id' ? 'Tambah Transaksi' : 'Add Transaction'}
            </TerminalButton>
          ) : undefined}
        />

        {/* Filters */}
        <TerminalCard 
          title="filter_config" 
          subtitle={language === 'id' ? 'konfigurasi_parameter' : 'parameter_config'}
          glow={false}
        >
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={language === 'id' ? 'Cari transaksi...' : 'Search transactions...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 font-mono bg-card text-foreground border-border focus:border-primary"
                />
              </div>

              <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                <SelectTrigger className="w-full lg:w-40 font-mono bg-card text-foreground border-border focus:border-primary">
                  <SelectValue placeholder={typeLabels.all} />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  <SelectItem value="all" className="font-mono text-foreground hover:bg-muted">{typeLabels.all}</SelectItem>
                  <SelectItem value="income" className="font-mono text-[hsl(var(--finance-positive))] hover:bg-muted">{typeLabels.income}</SelectItem>
                  <SelectItem value="expense" className="font-mono text-[hsl(var(--finance-negative))] hover:bg-muted">{typeLabels.expense}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full lg:w-48 font-mono bg-card text-foreground border-border focus:border-primary">
                  <SelectValue placeholder={language === 'id' ? 'Semua Kategori' : 'All Categories'} />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  <SelectItem value="all" className="font-mono text-foreground hover:bg-muted">{language === 'id' ? 'Semua Kategori' : 'All Categories'}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name} className="font-mono text-foreground hover:bg-muted">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterPeriod} onValueChange={(v) => setFilterPeriod(v as any)}>
                <SelectTrigger className="w-full lg:w-44 font-mono bg-card text-foreground border-border focus:border-primary">
                  <SelectValue placeholder={periodLabels.all} />
                </SelectTrigger>
                <SelectContent className="border-border bg-card">
                  {Object.entries(periodLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="font-mono text-foreground hover:bg-muted">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasFilters && (
              <div className="flex items-center gap-2 border-t border-border pt-2">
                <TerminalBadge variant="default" className="border-border bg-card/70 text-primary">
                  <Filter className="mr-1 h-3 w-3" />
                  {filteredTransactions.length} {language === 'id' ? 'hasil' : 'results'}
                </TerminalBadge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters} 
                  className="h-6 px-2 font-mono text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="mr-1 h-3 w-3" />
                  {language === 'id' ? 'Hapus Filter' : 'Clear Filters'}
                </Button>
              </div>
            )}
          </div>
        </TerminalCard>

        {/* Transactions List */}
        <TerminalCard
          title={language === 'id' ? 'riwayat_transaksi' : 'transaction_history'}
          subtitle={loading
            ? (language === 'id' ? 'menyiapkan daftar transaksi' : 'preparing transaction list')
            : `${filteredTransactions.length} ${language === 'id' ? 'transaksi siap dibuka' : 'transactions ready to open'}`}
        >
          {loading ? (
            <div className="divide-y divide-border/60">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-4">
                  <div className="h-12 w-12 rounded-[18px] animate-pulse bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded-full animate-pulse bg-muted" />
                    <div className="h-3 w-44 rounded-full animate-pulse bg-muted" />
                  </div>
                  <div className="h-4 w-20 rounded-full animate-pulse bg-muted" />
                </div>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Search className="h-8 w-8 text-primary/60" />
              </div>
              <h3 className="mb-1 text-lg font-mono font-medium text-foreground">
                {language === 'id' ? 'Tidak ada transaksi' : 'No transactions found'}
              </h3>
              <p className="mb-4 font-mono text-sm text-muted-foreground">
                {hasFilters ? (language === 'id' ? 'Coba ubah filter pencarian Anda' : 'Try changing your search filters') : (language === 'id' ? 'Mulai dengan menambahkan transaksi pertama Anda' : 'Start by adding your first transaction')}
              </p>
              {!hasFilters && (
                <TerminalButton onClick={() => navigate('/transactions/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  {language === 'id' ? 'Tambah Transaksi' : 'Add Transaction'}
                </TerminalButton>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/70">
              {filteredTransactions.map((transaction) => {
                const isIncome = transaction.type === 'income';
                const typeLabelLong = isIncome ? (language === 'id' ? 'Pemasukan' : 'Income') : (language === 'id' ? 'Pengeluaran' : 'Expense');
                const freqMatch = transaction.description?.match(/\[(harian|mingguan|bulanan|tahunan|daily|weekly|monthly|yearly)\]/i);
                const freqLabel = (() => {
                  if (!freqMatch) return null;
                  const key = freqMatch[1].toLowerCase();
                  if (['harian', 'daily'].includes(key)) return language === 'id' ? 'Harian' : 'Daily';
                  if (['mingguan', 'weekly'].includes(key)) return language === 'id' ? 'Mingguan' : 'Weekly';
                  if (['bulanan', 'monthly'].includes(key)) return language === 'id' ? 'Bulanan' : 'Monthly';
                  if (['tahunan', 'yearly'].includes(key)) return language === 'id' ? 'Tahunan' : 'Yearly';
                  return null;
                })();
                const cleanDescription = transaction.description?.replace(/\s*\[(harian|mingguan|bulanan|tahunan|daily|weekly|monthly|yearly)\]\s*/i, '').trim();

                return (
                  <div key={transaction.id} className="flex items-center gap-3 py-3 sm:py-4 first:pt-1 last:pb-1">
                    <button
                      type="button"
                      onClick={() => navigate(`/transactions/edit/${transaction.id}`)}
                      className="group flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3 rounded-[20px] sm:rounded-[24px] px-1 py-1 text-left transition-colors"
                    >
                      <div className="flex w-10 sm:w-12 flex-col items-center">
                        <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center">
                          {isIncome
                            ? <ArrowDownLeft className="relative h-[18px] w-[18px] sm:h-5 sm:w-5 stroke-[2.6] text-[hsl(var(--finance-positive))]" />
                            : <ArrowUpRight className="relative h-[18px] w-[18px] sm:h-5 sm:w-5 stroke-[2.6] text-[hsl(var(--finance-negative))]" />
                          }
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <span className={`block truncate text-[13px] font-semibold sm:text-base ${isDark ? 'text-white' : 'text-slate-950'}`}>
                          {transaction.category}
                        </span>
                        <span
                          className={`block text-[11px] font-semibold uppercase tracking-[0.18em] ${
                            isIncome
                              ? 'text-[hsl(var(--finance-positive))]'
                              : 'text-[hsl(var(--finance-negative))]'
                          }`}
                        >
                          {typeLabelLong}
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-mono text-xs sm:text-sm text-muted-foreground">
                            {formatDateLang(transaction.date)}
                            {cleanDescription ? ` • ${cleanDescription}` : ''}
                          </p>
                          {freqLabel && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/80">
                              {freqLabel}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="ml-3 shrink-0 text-right">
                        <p className={`font-mono text-sm sm:text-base font-semibold sm:text-lg ${isIncome ? 'text-[hsl(var(--finance-positive))]' : 'text-[hsl(var(--finance-negative))]'}`}>
                          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                        <p className={`mt-1 text-[10px] sm:text-[11px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                          {language === 'id' ? 'Ketuk untuk edit' : 'Tap to edit'}
                        </p>
                      </div>
                    </button>

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-[hsl(var(--finance-negative))] hover:bg-[hsl(var(--finance-negative))/0.12]"
                      onClick={() => {
                        setTransactionToDelete(transaction);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </TerminalCard>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono text-foreground">
              {language === 'id' ? 'Hapus Transaksi' : 'Delete Transaction'}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-muted-foreground">
              {language === 'id' ? 'Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.' : 'Are you sure you want to delete this transaction? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-mono border-border bg-muted text-foreground hover:bg-muted/80">
              {language === 'id' ? 'Batal' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="font-mono bg-[hsl(var(--finance-negative))] text-primary-foreground hover:bg-[hsl(var(--finance-negative))/0.9]">
              {language === 'id' ? 'Hapus' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Transactions;                                                                                                                                                                                                                
