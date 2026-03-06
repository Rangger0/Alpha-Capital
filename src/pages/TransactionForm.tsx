import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, CalendarDays, FileText, Sparkles, Tags } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { addTransaction, updateTransaction, getTransactions, getCategories, addCategory } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  TerminalCard,
  TerminalButton,
} from '@/components/ui/TerminalCard';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';

const TransactionForm: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isEdit = Boolean(id);
  const isDark = theme === 'dark';

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newCategoryDialogOpen, setNewCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'income' | 'expense'>('expense');

  useEffect(() => {
    if (!user) return;
    loadCategories();
    if (isEdit) {
      loadTransaction();
    }
  }, [user, id]);

  const loadCategories = async () => {
    if (!user) return;
    try {
      const { data } = await getCategories(user.id);
      if (data) {
        const uniqueCategories = [...new Set(data.map((c) => c.name))];
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadTransaction = async () => {
    if (!user || !id) return;
    try {
      const { data } = await getTransactions(user.id);
      const transaction = data?.find((t) => t.id === id);
      if (transaction) {
        setType(transaction.type);
        setAmount(transaction.amount.toString());
        setCategory(transaction.category);
        setDescription(transaction.description || '');
        setDate(transaction.date);
      }
    } catch (err) {
      console.error('Error loading transaction:', err);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAmount(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError(language === 'id' ? 'Anda harus login terlebih dahulu' : 'You must be logged in');
      return;
    }

    if (!category) {
      setError(language === 'id' ? 'Pilih atau buat kategori terlebih dahulu' : 'Please select or create a category');
      return;
    }

    const amountValue = parseInt(amount) || 0;
    if (amountValue <= 0) {
      setError(language === 'id' ? 'Nominal harus lebih dari 0' : 'Amount must be greater than 0');
      return;
    }

    setLoading(true);

    try {
      const transactionData = {
        user_id: user.id,
        type,
        category,
        amount: amountValue,
        description,
        date: date,
      };

      if (isEdit && id) {
        const { error } = await updateTransaction(id, transactionData);
        if (error) throw error;
      } else {
        const { error } = await addTransaction(transactionData);
        if (error) throw error;
      }

      navigate('/transactions');
    } catch (err: any) {
      setError(err.message || (language === 'id' ? 'Terjadi kesalahan. Silakan coba lagi.' : 'An error occurred. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!user || !newCategoryName.trim()) return;

    try {
      const { error } = await addCategory({
        user_id: user.id,
        name: newCategoryName.trim(),
        type: newCategoryType,
      });

      if (error) throw error;

      setCategories((prev) => [...new Set([...prev, newCategoryName.trim()])]);
      setCategory(newCategoryName.trim());
      setNewCategoryName('');
      setNewCategoryDialogOpen(false);
    } catch (err: any) {
      console.error('Error adding category:', err);
    }
  };

  const currencySymbol = language === 'id' ? 'Rp' : '$';
  const panelTone = isDark ? 'border-white/10 bg-[#111111]' : 'border-slate-200 bg-slate-50/90';
  const fieldTone = isDark ? 'border-white/10 bg-[#090909]' : 'border-slate-200 bg-white';
  const inputTone = isDark
    ? 'border-white/10 bg-[#0c0c0c] text-white placeholder:text-zinc-500 focus-visible:border-amber-400 focus-visible:ring-amber-400/20'
    : 'border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20';
  const typeLabel = type === 'income'
    ? (language === 'id' ? 'Pemasukan' : 'Income')
    : (language === 'id' ? 'Pengeluaran' : 'Expense');
  const typeDescription = type === 'income'
    ? (language === 'id' ? 'Dana masuk ke saldo utama.' : 'Funds flowing into your balance.')
    : (language === 'id' ? 'Dana keluar dari saldo utama.' : 'Funds flowing out of your balance.');
  const amountPreview = amount
    ? `${currencySymbol} ${Number(amount).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}`
    : `${currencySymbol} 0`;
  const formattedDate = new Intl.DateTimeFormat(language === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <PageHeader
          eyebrow={language === 'id' ? 'Formulir Transaksi' : 'Transaction Form'}
          title={isEdit ? (language === 'id' ? 'Edit Transaksi' : 'Edit Transaction') : (language === 'id' ? 'Tambah Transaksi' : 'Add Transaction')}
          subtitle={isEdit ? (language === 'id' ? 'Perbarui detail transaksi yang sudah ada.' : 'Update an existing transaction.') : (language === 'id' ? 'Catat transaksi baru tanpa mengubah data lainnya.' : 'Record a new transaction without changing other data.')}
          leading={(
            <TerminalButton 
              variant="ghost" 
              onClick={() => navigate('/transactions')}
              glow={false}
              className={cn(
                'h-11 w-11 rounded-[18px] border p-0',
                isDark ? 'border-white/10 bg-[#141414] text-zinc-300 hover:bg-white/[0.04] hover:text-white' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white hover:text-slate-950',
              )}
            >
              <ArrowLeft className="h-5 w-5" />
            </TerminalButton>
          )}
        />

        <TerminalCard 
          title="transaction_designer" 
          subtitle={language === 'id' ? 'alur_transaksi_yang_lebih_halus' : 'smoother_transaction_flow'}
        >
          <div className="space-y-6 p-1 sm:p-2">
            {error && (
              <Alert variant="destructive" className={cn(isDark ? 'border-[#ff4757]/50 bg-[#ff4757]/10' : 'border-red-200 bg-red-50')}>
                <AlertDescription className={`font-mono ${isDark ? 'text-[#ff4757]' : 'text-red-600'}`}>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-3 md:grid-cols-3">
              <div className={cn('rounded-[24px] border p-4', panelTone)}>
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className={`h-4 w-4 ${isDark ? 'text-amber-300' : 'text-blue-600'}`} />
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                    {language === 'id' ? 'Mode Aktif' : 'Active Mode'}
                  </p>
                </div>
                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-950'}`}>{typeLabel}</p>
                <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>{typeDescription}</p>
              </div>

              <div className={cn('rounded-[24px] border p-4', panelTone)}>
                <div className="mb-3 flex items-center gap-2">
                  <ArrowUpRight className={`h-4 w-4 ${isDark ? 'text-amber-300' : 'text-blue-600'}`} />
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                    {language === 'id' ? 'Preview Nominal' : 'Amount Preview'}
                  </p>
                </div>
                <p className={`text-lg font-semibold ${type === 'income' ? (isDark ? 'text-emerald-300' : 'text-emerald-600') : (isDark ? 'text-rose-300' : 'text-rose-600')}`}>
                  {type === 'income' ? '+' : '-'}{amountPreview}
                </p>
                <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  {language === 'id' ? 'Nilai siap dicatat.' : 'Ready to be recorded.'}
                </p>
              </div>

              <div className={cn('rounded-[24px] border p-4', panelTone)}>
                <div className="mb-3 flex items-center gap-2">
                  <CalendarDays className={`h-4 w-4 ${isDark ? 'text-amber-300' : 'text-blue-600'}`} />
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                    {language === 'id' ? 'Tanggal' : 'Date'}
                  </p>
                </div>
                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-950'}`}>{formattedDate}</p>
                <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  {language === 'id' ? 'Gunakan tanggal yang paling akurat.' : 'Use the most accurate transaction date.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection */}
              <div className="space-y-2">
                <Label className={`font-mono text-sm ${isDark ? 'text-[#a0a0a0]' : 'text-gray-600'}`}>
                  {language === 'id' ? 'Jenis Transaksi' : 'Transaction Type'}
                </Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={cn(
                      'rounded-[24px] border p-4 text-left transition-all',
                      type === 'income'
                        ? (isDark 
                            ? 'border-emerald-500/30 bg-emerald-500/12 text-emerald-300 shadow-[0_16px_34px_rgba(16,185,129,0.18)]' 
                            : 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-[0_16px_34px_rgba(16,185,129,0.12)]')
                        : (isDark 
                            ? 'border-white/10 bg-[#111111] text-zinc-300 hover:border-emerald-500/30 hover:text-white' 
                            : 'border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:text-slate-950')
                      ,
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-[18px] border ${type === 'income' 
                        ? (isDark ? 'border-emerald-500/20 bg-emerald-500 text-black' : 'border-emerald-200 bg-emerald-500 text-white')
                        : (isDark ? 'border-white/10 bg-[#181818]' : 'border-slate-200 bg-slate-100')
                      }`}>
                        <ArrowDownLeft className="h-5 w-5" />
                      </div>
                      {type === 'income' && (
                        <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${isDark ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300' : 'border-emerald-200 bg-white text-emerald-600'}`}>
                          {language === 'id' ? 'Aktif' : 'Active'}
                        </span>
                      )}
                    </div>
                    <div className="mt-4 space-y-1">
                      <p className="font-mono text-base font-semibold">{language === 'id' ? 'Pemasukan' : 'Income'}</p>
                      <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                        {language === 'id' ? 'Dana masuk ke saldo utama.' : 'Funds flowing into your balance.'}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={cn(
                      'rounded-[24px] border p-4 text-left transition-all',
                      type === 'expense'
                        ? (isDark 
                            ? 'border-rose-500/30 bg-rose-500/12 text-rose-300 shadow-[0_16px_34px_rgba(244,63,94,0.18)]' 
                            : 'border-rose-300 bg-rose-50 text-rose-700 shadow-[0_16px_34px_rgba(244,63,94,0.12)]')
                        : (isDark 
                            ? 'border-white/10 bg-[#111111] text-zinc-300 hover:border-rose-500/30 hover:text-white' 
                            : 'border-slate-200 bg-white text-slate-500 hover:border-rose-200 hover:text-slate-950')
                      ,
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-[18px] border ${type === 'expense' 
                        ? (isDark ? 'border-rose-500/20 bg-rose-500 text-white' : 'border-rose-200 bg-rose-500 text-white')
                        : (isDark ? 'border-white/10 bg-[#181818]' : 'border-slate-200 bg-slate-100')
                      }`}>
                        <ArrowUpRight className="h-5 w-5" />
                      </div>
                      {type === 'expense' && (
                        <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${isDark ? 'border-rose-500/25 bg-rose-500/10 text-rose-300' : 'border-rose-200 bg-white text-rose-600'}`}>
                          {language === 'id' ? 'Aktif' : 'Active'}
                        </span>
                      )}
                    </div>
                    <div className="mt-4 space-y-1">
                      <p className="font-mono text-base font-semibold">{language === 'id' ? 'Pengeluaran' : 'Expense'}</p>
                      <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                        {language === 'id' ? 'Dana keluar dari saldo utama.' : 'Funds flowing out of your balance.'}
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <section className={cn('rounded-[28px] border p-4 sm:p-5', fieldTone)}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                      {language === 'id' ? 'Nominal Utama' : 'Primary Amount'}
                    </p>
                    <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {language === 'id' ? 'Masukkan nilai tanpa simbol tambahan.' : 'Enter the numeric value without extra symbols.'}
                    </p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${type === 'income' ? (isDark ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700') : (isDark ? 'border-rose-500/25 bg-rose-500/10 text-rose-300' : 'border-rose-200 bg-rose-50 text-rose-700')}`}>
                    {typeLabel}
                  </span>
                </div>
                <div className={cn('mt-4 rounded-[24px] border px-4 py-3 sm:px-5', isDark ? 'border-white/10 bg-black' : 'border-slate-200 bg-slate-50')}>
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl font-semibold ${isDark ? 'text-amber-300' : 'text-blue-600'}`}>{currencySymbol}</span>
                    <Input
                      id="amount"
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={amount}
                      onChange={handleAmountChange}
                      className={cn(
                        'h-auto border-0 bg-transparent p-0 text-3xl font-semibold tracking-tight shadow-none focus-visible:ring-0',
                        isDark ? 'text-white placeholder:text-zinc-600' : 'text-slate-950 placeholder:text-slate-300',
                      )}
                      required
                    />
                  </div>
                  <p className={`mt-3 text-xs ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                    {language === 'id' ? `Akan disimpan sebagai ${type === 'income' ? 'pemasukan' : 'pengeluaran'} utama.` : `Will be stored as your ${type === 'income' ? 'income' : 'expense'} amount.`}
                  </p>
                </div>
              </section>

              <div className="grid gap-4 md:grid-cols-[1.35fr_0.85fr]">
                <section className={cn('rounded-[28px] border p-4', fieldTone)}>
                  <div className="flex items-center gap-2">
                    <Tags className={`h-4 w-4 ${isDark ? 'text-amber-300' : 'text-blue-600'}`} />
                    <Label className={`font-mono text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                      {language === 'id' ? 'Kategori' : 'Category'}
                    </Label>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className={cn('h-12 flex-1 rounded-[18px] font-mono', inputTone)}>
                        <SelectValue placeholder={language === 'id' ? 'Pilih kategori' : 'Select category'} />
                      </SelectTrigger>
                      <SelectContent className={isDark ? 'bg-[#111111] border-[#333333]' : 'bg-white border-gray-200'}>
                        {categories.length === 0 ? (
                          <div className={`px-2 py-4 text-sm text-center font-mono ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>
                            {language === 'id' ? 'Belum ada kategori' : 'No categories yet'}
                          </div>
                        ) : (
                          categories.filter((cat) => cat && typeof cat === 'string' && cat.trim() !== '').map((cat, index) => (
                            <SelectItem key={`${cat}-${index}`} value={cat} className={`font-mono ${
                              isDark
                                ? 'text-white hover:bg-[#1a1a1a]'
                                : 'text-gray-900 hover:bg-gray-100'
                            }`}>
                              {cat}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setNewCategoryType(type);
                        setNewCategoryDialogOpen(true);
                      }}
                      className={cn(
                        'h-12 rounded-[18px] px-4 font-mono',
                        isDark ? 'border-white/10 bg-[#141414] text-white hover:bg-[#1d1d1d] hover:border-amber-500/30' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white hover:border-blue-300',
                      )}
                    >
                      + {language === 'id' ? 'Baru' : 'New'}
                    </Button>
                  </div>
                </section>

                <section className={cn('rounded-[28px] border p-4', fieldTone)}>
                  <div className="flex items-center gap-2">
                    <CalendarDays className={`h-4 w-4 ${isDark ? 'text-amber-300' : 'text-blue-600'}`} />
                    <Label htmlFor="date" className={`font-mono text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                      {language === 'id' ? 'Tanggal' : 'Date'}
                    </Label>
                  </div>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={cn('mt-3 h-12 rounded-[18px] font-mono', inputTone)}
                    required
                  />
                </section>
              </div>

              {/* Description */}
              <section className={cn('rounded-[28px] border p-4', fieldTone)}>
                <div className="flex items-center gap-2">
                  <FileText className={`h-4 w-4 ${isDark ? 'text-amber-300' : 'text-blue-600'}`} />
                  <Label htmlFor="description" className={`font-mono text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                    {language === 'id' ? 'Deskripsi (Opsional)' : 'Description (Optional)'}
                  </Label>
                </div>
                <div className="relative mt-3">
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={language === 'id' ? 'Tambahkan keterangan...' : 'Add notes...'}
                    className={cn(
                      'min-h-[120px] w-full resize-none rounded-[20px] border px-4 py-3 text-sm font-mono outline-none',
                      inputTone,
                    )}
                  />
                </div>
              </section>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    'h-12 flex-1 rounded-[18px] font-mono',
                    isDark ? 'border-white/10 bg-[#141414] text-white hover:bg-[#1d1d1d]' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white',
                  )}
                  onClick={() => navigate('/transactions')}
                >
                  {language === 'id' ? 'Batal' : 'Cancel'}
                </Button>
                <TerminalButton 
                  type="submit" 
                  className={cn(
                    'h-12 flex-1 rounded-[18px] text-sm font-semibold tracking-[0.08em]',
                    isDark ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-black hover:brightness-105' : 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 text-white hover:brightness-105',
                  )}
                  disabled={loading}
                  glow
                >
                  {loading ? (language === 'id' ? 'Menyimpan...' : 'Saving...') : isEdit ? (language === 'id' ? 'Simpan Perubahan' : 'Save Changes') : (language === 'id' ? 'Simpan Transaksi' : 'Save Transaction')}
                </TerminalButton>
              </div>
            </form>
          </div>
        </TerminalCard>
      </div>

      {/* New Category Dialog */}
      <Dialog open={newCategoryDialogOpen} onOpenChange={setNewCategoryDialogOpen}>
        <DialogContent className={isDark ? 'border-[#333333] bg-[#111111]' : 'border-gray-200 bg-white'}>
          <DialogHeader>
            <DialogTitle className={`font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {language === 'id' ? 'Tambah Kategori Baru' : 'Add New Category'}
            </DialogTitle>
            <DialogDescription className={`font-mono ${isDark ? 'text-[#a0a0a0]' : 'text-gray-600'}`}>
              {language === 'id' ? 'Buat kategori baru untuk transaksi Anda.' : 'Create a new category for your transactions.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-category" className={`font-mono ${isDark ? 'text-[#a0a0a0]' : 'text-gray-600'}`}>
                {language === 'id' ? 'Nama Kategori' : 'Category Name'}
              </Label>
              <Input
                id="new-category"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder={language === 'id' ? 'Contoh: Makanan, Transport, Gaji' : 'e.g., Food, Transport, Salary'}
                className={`font-mono ${
                  isDark 
                    ? 'bg-[#0a0a0a] border-[#333333] text-white focus:border-[#ffa502]' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                }`}
              />
            </div>
            <div className="space-y-2">
              <Label className={`font-mono ${isDark ? 'text-[#a0a0a0]' : 'text-gray-600'}`}>
                {language === 'id' ? 'Jenis' : 'Type'}
              </Label>
              <Select value={newCategoryType} onValueChange={(v) => setNewCategoryType(v as 'income' | 'expense')}>
                <SelectTrigger className={`font-mono ${
                  isDark 
                    ? 'bg-[#0a0a0a] border-[#333333] text-white focus:border-[#ffa502]' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                }`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-[#111111] border-[#333333]' : 'bg-white border-gray-200'}>
                  <SelectItem value="income" className={`font-mono ${isDark ? 'text-[#00d084] hover:bg-[#1a1a1a]' : 'text-green-600 hover:bg-green-50'}`}>
                    {language === 'id' ? 'Pemasukan' : 'Income'}
                  </SelectItem>
                  <SelectItem value="expense" className={`font-mono ${isDark ? 'text-[#ff4757] hover:bg-[#1a1a1a]' : 'text-red-600 hover:bg-red-50'}`}>
                    {language === 'id' ? 'Pengeluaran' : 'Expense'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNewCategoryDialogOpen(false)}
              className={`font-mono ${
                isDark 
                  ? 'bg-[#1a1a1a] border-[#333333] text-white hover:bg-[#252525]' 
                  : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {language === 'id' ? 'Batal' : 'Cancel'}
            </Button>
            <TerminalButton 
              onClick={handleAddCategory} 
              disabled={!newCategoryName.trim()}
              glow
            >
              {language === 'id' ? 'Tambah' : 'Add'}
            </TerminalButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default TransactionForm;
