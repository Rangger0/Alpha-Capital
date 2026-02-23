// src/pages/Transactions.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Edit2,
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
import { Badge } from '@/components/ui/badge';
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
  TerminalPrompt,
  TerminalText,
  TerminalBadge,
} from '@/components/ui/TerminalCard';
import Layout from '@/components/layout/Layout';

const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { language, formatCurrency, formatDate: formatDateLang } = useLanguage();
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
        const matchesSearch =
          transaction.category.toLowerCase().includes(query) ||
          transaction.description?.toLowerCase().includes(query);
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
            if (
              transactionDate.getMonth() !== now.getMonth() ||
              transactionDate.getFullYear() !== now.getFullYear()
            )
              return false;
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

  // Translations
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
        {/* Header - Terminal Style */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-border/50">
          <div>
            <TerminalPrompt 
              command="transactions --list --all" 
              className="mb-2"
            />
            <h1 className="text-3xl font-bold tracking-tight">
              <TerminalText 
                text={language === 'id' ? 'Transaksi' : 'Transactions'} 
                typing 
                delay={100}
                className={theme === 'dark' ? 'text-green-400' : 'text-blue-500'}
              />
            </h1>
            <p className="text-muted-foreground mt-1 font-mono text-sm">
              {language === 'id' ? 'Kelola semua transaksi Anda' : 'Manage all your transactions'}
            </p>
          </div>
          
          <TerminalButton 
            onClick={() => navigate('/transactions/new')}
            glow
          >
            <Plus className="h-4 w-4 mr-2" />
            {language === 'id' ? 'Tambah Transaksi' : 'Add Transaction'}
          </TerminalButton>
        </div>

        {/* Filters - Terminal Style */}
        <TerminalCard 
          title="filter_config" 
          subtitle={language === 'id' ? 'konfigurasi_parameter' : 'parameter_config'}
          delay={100}
          glow={false}
        >
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={language === 'id' ? 'Cari transaksi...' : 'Search transactions...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`
                    pl-10 font-mono bg-muted/50 border
                    ${theme === 'dark' 
                      ? 'border-green-500/30 focus:border-green-500' 
                      : 'border-blue-500/30 focus:border-blue-500'}
                  `}
                />
              </div>

              {/* Type Filter */}
              <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                <SelectTrigger className={`
                  w-full lg:w-40 font-mono bg-muted/50 border
                  ${theme === 'dark' 
                    ? 'border-green-500/30 focus:border-green-500' 
                    : 'border-blue-500/30 focus:border-blue-500'}
                `}>
                  <SelectValue placeholder={typeLabels.all} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-mono">{typeLabels.all}</SelectItem>
                  <SelectItem value="income" className="font-mono text-green-500">{typeLabels.income}</SelectItem>
                  <SelectItem value="expense" className="font-mono text-red-500">{typeLabels.expense}</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className={`
                  w-full lg:w-48 font-mono bg-muted/50 border
                  ${theme === 'dark' 
                    ? 'border-green-500/30 focus:border-green-500' 
                    : 'border-blue-500/30 focus:border-blue-500'}
                `}>
                  <SelectValue placeholder={language === 'id' ? 'Semua Kategori' : 'All Categories'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-mono">{language === 'id' ? 'Semua Kategori' : 'All Categories'}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name} className="font-mono">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Period Filter */}
              <Select value={filterPeriod} onValueChange={(v) => setFilterPeriod(v as any)}>
                <SelectTrigger className={`
                  w-full lg:w-40 font-mono bg-muted/50 border
                  ${theme === 'dark' 
                    ? 'border-green-500/30 focus:border-green-500' 
                    : 'border-blue-500/30 focus:border-blue-500'}
                `}>
                  <SelectValue placeholder={periodLabels.all} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(periodLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="font-mono">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasFilters && (
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <TerminalBadge variant="default">
                  <Filter className="h-3 w-3 mr-1" />
                  {filteredTransactions.length} {language === 'id' ? 'hasil' : 'results'}
                </TerminalBadge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters} 
                  className="h-6 px-2 font-mono text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  {language === 'id' ? 'Hapus Filter' : 'Clear Filters'}
                </Button>
              </div>
            )}
          </div>
        </TerminalCard>

        {/* Transactions List - Terminal Style */}
        <div className="space-y-3">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <TerminalCard key={i} title={`loading_${i}`} delay={i * 50}>
                <div className="h-16 bg-muted/50 rounded animate-pulse" />
              </TerminalCard>
            ))
          ) : filteredTransactions.length === 0 ? (
            <TerminalCard title="empty_state" delay={200}>
              <div className="p-12 text-center">
                <div className={`
                  mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4
                  ${theme === 'dark' ? 'bg-green-500/10' : 'bg-blue-500/10'}
                `}>
                  <Search className={`
                    h-8 w-8 
                    ${theme === 'dark' ? 'text-green-500/50' : 'text-blue-500/50'}
                  `} />
                </div>
                <h3 className="text-lg font-mono font-medium mb-1">
                  [404] {language === 'id' ? 'Tidak ada transaksi' : 'No transactions found'}
                </h3>
                <p className="text-muted-foreground font-mono text-sm mb-4">
                  {hasFilters
                    ? (language === 'id' ? 'Coba ubah filter pencarian Anda' : 'Try changing your search filters')
                    : (language === 'id' ? 'Mulai dengan menambahkan transaksi pertama Anda' : 'Start by adding your first transaction')}
                </p>
                {!hasFilters && (
                  <TerminalButton onClick={() => navigate('/transactions/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    {language === 'id' ? 'Tambah Transaksi' : 'Add Transaction'}
                  </TerminalButton>
                )}
              </div>
            </TerminalCard>
          ) : (
            filteredTransactions.map((transaction, index) => (
              <div
                key={transaction.id}
                onClick={() => navigate(`/transactions/edit/${transaction.id}`)}
                className="cursor-pointer"
              >
                <TerminalCard
                  title={`${transaction.type}_${index}`}
                  delay={index * 50}
                  className="hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-4">
                      <div className={`
                        p-3 rounded-lg 
                        ${transaction.type === 'income'
                          ? (theme === 'dark' 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                            : 'bg-green-500/10 text-green-600 border border-green-500/30')
                          : (theme === 'dark' 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
                            : 'bg-red-500/10 text-red-600 border border-red-500/30')
                        }
                      `}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="h-5 w-5" />
                        ) : (
                          <TrendingDown className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold font-mono">{transaction.category}</span>
                          <Badge
                            variant={transaction.type === 'income' ? 'default' : 'destructive'}
                            className={`
                              text-xs font-mono
                              ${transaction.type === 'income' 
                                ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' 
                                : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}
                            `}
                          >
                            {transaction.type === 'income' 
                              ? (language === 'id' ? 'Pemasukan' : 'Income') 
                              : (language === 'id' ? 'Pengeluaran' : 'Expense')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">
                          {formatDateLang(transaction.date)}
                        </p>
                        {transaction.description && (
                          <p className="text-sm text-muted-foreground mt-1 font-mono opacity-70">
                            {transaction.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`
                        text-lg font-bold font-mono
                        ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}
                      `}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </span>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/transactions/edit/${transaction.id}`)}
                          className={`
                            ${theme === 'dark' 
                              ? 'hover:bg-green-500/10 hover:text-green-400' 
                              : 'hover:bg-blue-500/10 hover:text-blue-500'}
                          `}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          onClick={() => {
                            setTransactionToDelete(transaction);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TerminalCard>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className={`
          border
          ${theme === 'dark' 
            ? 'border-red-500/30 bg-slate-900' 
            : 'border-red-500/30'}
        `}>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono">
              {language === 'id' ? 'Hapus Transaksi' : 'Delete Transaction'}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono">
              {language === 'id' 
                ? 'Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.'
                : 'Are you sure you want to delete this transaction? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-mono">
              {language === 'id' ? 'Batal' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-500 hover:bg-red-600 font-mono"
            >
              {language === 'id' ? 'Hapus' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Transactions;