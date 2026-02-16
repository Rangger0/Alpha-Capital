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
import { getTransactions, deleteTransaction, getCategories } from '@/lib/supabase';
import type { Transaction, Category } from '@/types';
import { formatRupiah, formatDate } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
import Layout from '@/components/layout/Layout';

const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          transaction.category.toLowerCase().includes(query) ||
          transaction.description?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (filterType !== 'all' && transaction.type !== filterType) return false;

      // Category filter
      if (filterCategory !== 'all' && transaction.category !== filterCategory) return false;

      // Period filter
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Transaksi</h1>
            <p className="text-muted-foreground">Kelola semua transaksi Anda</p>
          </div>
          <Button onClick={() => navigate('/transactions/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Transaksi
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-border/50">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari transaksi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type Filter */}
              <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  <SelectItem value="income">Pemasukan</SelectItem>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Period Filter */}
              <Select value={filterPeriod} onValueChange={(v) => setFilterPeriod(v as any)}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Waktu</SelectItem>
                  <SelectItem value="today">Hari Ini</SelectItem>
                  <SelectItem value="week">7 Hari Terakhir</SelectItem>
                  <SelectItem value="month">Bulan Ini</SelectItem>
                  <SelectItem value="year">Tahun Ini</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasFilters && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Filter className="h-3 w-3" />
                  {filteredTransactions.length} hasil
                </Badge>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2">
                  <X className="h-3 w-3 mr-1" />
                  Hapus Filter
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transactions List */}
        <div className="space-y-3">
          {loading ? (
            // Loading skeletons
            [...Array(5)].map((_, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-4">
                  <div className="h-16 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))
          ) : filteredTransactions.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">Tidak ada transaksi</h3>
                <p className="text-muted-foreground mb-4">
                  {hasFilters
                    ? 'Coba ubah filter pencarian Anda'
                    : 'Mulai dengan menambahkan transaksi pertama Anda'}
                </p>
                {!hasFilters && (
                  <Button onClick={() => navigate('/transactions/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Transaksi
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredTransactions.map((transaction) => (
              <Card
                key={transaction.id}
                className="border-border/50 hover:border-primary/50 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-lg ${
                          transaction.type === 'income'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? (
                          <TrendingUp className="h-5 w-5" />
                        ) : (
                          <TrendingDown className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{transaction.category}</span>
                          <Badge
                            variant={transaction.type === 'income' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                        {transaction.description && (
                          <p className="text-sm text-muted-foreground mt-1">{transaction.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`text-lg font-bold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatRupiah(transaction.amount)}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/transactions/edit/${transaction.id}`)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
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
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Transaksi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Transactions;
