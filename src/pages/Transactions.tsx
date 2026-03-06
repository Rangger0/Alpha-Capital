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
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-[#666666]' : 'text-gray-400'}`} />
                <Input
                  placeholder={language === 'id' ? 'Cari transaksi...' : 'Search transactions...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 font-mono ${
                    isDark 
                      ? 'bg-[#0a0a0a] border-[#333333] text-white focus:border-[#ffa502]' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  }`}
                />
              </div>

              <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                <SelectTrigger className={`w-full lg:w-40 font-mono ${
                  isDark 
                    ? 'bg-[#0a0a0a] border-[#333333] text-white focus:border-[#ffa502]' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                }`}>
                  <SelectValue placeholder={typeLabels.all} />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-[#111111] border-[#333333]' : 'bg-white border-gray-200'}>
                  <SelectItem value="all" className={`font-mono ${isDark ? 'text-white hover:bg-[#1a1a1a]' : 'text-gray-900 hover:bg-gray-100'}`}>{typeLabels.all}</SelectItem>
                  <SelectItem value="income" className={`font-mono ${isDark ? 'text-[#00d084] hover:bg-[#1a1a1a]' : 'text-green-600 hover:bg-green-50'}`}>{typeLabels.income}</SelectItem>
                  <SelectItem value="expense" className={`font-mono ${isDark ? 'text-[#ff4757] hover:bg-[#1a1a1a]' : 'text-red-600 hover:bg-red-50'}`}>{typeLabels.expense}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className={`w-full lg:w-48 font-mono ${
                  isDark 
                    ? 'bg-[#0a0a0a] border-[#333333] text-white focus:border-[#ffa502]' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                }`}>
                  <SelectValue placeholder={language === 'id' ? 'Semua Kategori' : 'All Categories'} />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-[#111111] border-[#333333]' : 'bg-white border-gray-200'}>
                  <SelectItem value="all" className={`font-mono ${isDark ? 'text-white hover:bg-[#1a1a1a]' : 'text-gray-900 hover:bg-gray-100'}`}>{language === 'id' ? 'Semua Kategori' : 'All Categories'}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name} className={`font-mono ${isDark ? 'text-white hover:bg-[#1a1a1a]' : 'text-gray-900 hover:bg-gray-100'}`}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterPeriod} onValueChange={(v) => setFilterPeriod(v as any)}>
                <SelectTrigger className={`w-full lg:w-40 font-mono ${
                  isDark 
                    ? 'bg-[#0a0a0a] border-[#333333] text-white focus:border-[#ffa502]' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                }`}>
                  <SelectValue placeholder={periodLabels.all} />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-[#111111] border-[#333333]' : 'bg-white border-gray-200'}>
                  {Object.entries(periodLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key} className={`font-mono ${isDark ? 'text-white hover:bg-[#1a1a1a]' : 'text-gray-900 hover:bg-gray-100'}`}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasFilters && (
              <div className={`flex items-center gap-2 pt-2 border-t ${isDark ? 'border-[#333333]' : 'border-gray-200'}`}>
                <TerminalBadge variant="default" className={isDark ? 'bg-[#1a1a1a] text-[#ffa502] border-[#333333]' : 'bg-gray-100 text-blue-600 border-gray-200'}>
                  <Filter className="h-3 w-3 mr-1" />
                  {filteredTransactions.length} {language === 'id' ? 'hasil' : 'results'}
                </TerminalBadge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters} 
                  className={`h-6 px-2 font-mono text-xs ${isDark ? 'text-[#a0a0a0] hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <X className="h-3 w-3 mr-1" />
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
            <div className={`divide-y ${isDark ? 'divide-white/10' : 'divide-slate-200'}`}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-4">
                  <div className={`h-12 w-12 rounded-[18px] animate-pulse ${isDark ? 'bg-[#181818]' : 'bg-slate-100'}`} />
                  <div className="flex-1 space-y-2">
                    <div className={`h-4 w-32 rounded-full animate-pulse ${isDark ? 'bg-[#181818]' : 'bg-slate-100'}`} />
                    <div className={`h-3 w-44 rounded-full animate-pulse ${isDark ? 'bg-[#181818]' : 'bg-slate-100'}`} />
                  </div>
                  <div className={`h-4 w-20 rounded-full animate-pulse ${isDark ? 'bg-[#181818]' : 'bg-slate-100'}`} />
                </div>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${isDark ? 'bg-[#181818]' : 'bg-slate-100'}`}>
                <Search className={`h-8 w-8 ${isDark ? 'text-[#ffa502]/50' : 'text-blue-500/50'}`} />
              </div>
              <h3 className={`mb-1 text-lg font-mono font-medium ${isDark ? 'text-white' : 'text-slate-950'}`}>
                {language === 'id' ? 'Tidak ada transaksi' : 'No transactions found'}
              </h3>
              <p className={`mb-4 font-mono text-sm ${isDark ? 'text-[#666666]' : 'text-slate-500'}`}>
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
            <div className={`divide-y ${isDark ? 'divide-white/10' : 'divide-slate-200'}`}>
              {filteredTransactions.map((transaction) => {
                const isIncome = transaction.type === 'income';

                return (
                  <div key={transaction.id} className="flex items-center gap-3 py-4 first:pt-1 last:pb-1">
                    <button
                      type="button"
                      onClick={() => navigate(`/transactions/edit/${transaction.id}`)}
                      className="group flex min-w-0 flex-1 items-center gap-3 rounded-[24px] px-1 py-1 text-left transition-colors"
                    >
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border ${
                          isIncome
                            ? (isDark ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-600')
                            : (isDark ? 'border-rose-500/20 bg-rose-500/10 text-rose-300' : 'border-rose-200 bg-rose-50 text-rose-600')
                        }`}
                      >
                        {isIncome ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`truncate text-sm font-semibold sm:text-base ${isDark ? 'text-white' : 'text-slate-950'}`}>
                            {transaction.category}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] ${
                              isIncome
                                ? (isDark ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700')
                                : (isDark ? 'border-rose-500/20 bg-rose-500/10 text-rose-300' : 'border-rose-200 bg-rose-50 text-rose-700')
                            }`}
                          >
                            {isIncome ? (language === 'id' ? 'Masuk' : 'In') : (language === 'id' ? 'Keluar' : 'Out')}
                          </span>
                        </div>
                        <p className={`mt-1 truncate font-mono text-xs sm:text-sm ${isDark ? 'text-[#666666]' : 'text-slate-500'}`}>
                          {formatDateLang(transaction.date)}
                          {transaction.description ? ` • ${transaction.description}` : ''}
                        </p>
                      </div>

                      <div className="ml-3 shrink-0 text-right">
                        <p className={`font-mono text-base font-semibold sm:text-lg ${isIncome ? (isDark ? 'text-emerald-300' : 'text-emerald-600') : (isDark ? 'text-rose-300' : 'text-rose-600')}`}>
                          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                        <p className={`mt-1 text-[11px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                          {language === 'id' ? 'Ketuk untuk edit' : 'Tap to edit'}
                        </p>
                      </div>
                    </button>

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className={isDark ? 'text-[#ff4757] hover:text-[#ff6b6b] hover:bg-[#ff4757]/10' : 'text-rose-500 hover:text-rose-600 hover:bg-rose-50'}
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
        <AlertDialogContent className={isDark ? 'border-[#333333] bg-[#111111]' : 'border-gray-200 bg-white'}>
          <AlertDialogHeader>
            <AlertDialogTitle className={`font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {language === 'id' ? 'Hapus Transaksi' : 'Delete Transaction'}
            </AlertDialogTitle>
            <AlertDialogDescription className={`font-mono ${isDark ? 'text-[#a0a0a0]' : 'text-gray-600'}`}>
              {language === 'id' ? 'Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.' : 'Are you sure you want to delete this transaction? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={`font-mono ${isDark ? 'bg-[#1a1a1a] border-[#333333] text-white hover:bg-[#252525]' : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'}`}>
              {language === 'id' ? 'Batal' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-[#ff4757] hover:bg-[#ff6b6b] font-mono text-white">
              {language === 'id' ? 'Hapus' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Transactions;                                                                                                                                                                                                                
