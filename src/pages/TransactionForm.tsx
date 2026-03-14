import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, CalendarDays, FileText, Sparkles, Tags } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
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
import { useTheme } from '@/contexts/ThemeContext';

const TransactionForm: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user } = useAuth();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isEdit = Boolean(id);
  const isDark = theme === 'dark';

  type RepeatInterval = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [repeatInterval, setRepeatInterval] = useState<RepeatInterval>('once');
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

  const stripFrequencyTag = (text: string) => {
    const freqMap: Record<string, RepeatInterval> = {
      harian: 'daily',
      daily: 'daily',
      mingguan: 'weekly',
      weekly: 'weekly',
      bulanan: 'monthly',
      monthly: 'monthly',
      tahunan: 'yearly',
      yearly: 'yearly',
    };
    const match = text.match(/\[(harian|mingguan|bulanan|tahunan|daily|weekly|monthly|yearly)\]/i);
    if (!match) return { clean: text, freq: 'once' as RepeatInterval };
    const freq = freqMap[match[1].toLowerCase()];
    const clean = text.replace(match[0], '').trim();
    return { clean, freq };
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
        const { clean, freq } = stripFrequencyTag(transaction.description || '');
        setDescription(clean);
        setRepeatInterval(freq);
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
      const freqLabel = {
        once: '',
        daily: language === 'id' ? '[Harian]' : '[Daily]',
        weekly: language === 'id' ? '[Mingguan]' : '[Weekly]',
        monthly: language === 'id' ? '[Bulanan]' : '[Monthly]',
        yearly: language === 'id' ? '[Tahunan]' : '[Yearly]',
      }[repeatInterval];

      const descriptionWithFreq = `${description || ''} ${freqLabel}`.trim();

      const transactionData = {
        user_id: user.id,
        type,
        category,
        amount: amountValue,
        description: descriptionWithFreq,
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
  const panelTone = 'border-border bg-card/90';
  const fieldTone = 'border-border bg-card';
  const inputTone = 'border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20';
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

  const repeatLabels: Record<RepeatInterval, string> = {
    once: language === 'id' ? 'Sekali' : 'One-time',
    daily: language === 'id' ? 'Harian' : 'Daily',
    weekly: language === 'id' ? 'Mingguan' : 'Weekly',
    monthly: language === 'id' ? 'Bulanan' : 'Monthly',
    yearly: language === 'id' ? 'Tahunan' : 'Yearly',
  };

  return (
    <Layout>
      <div className="mx-auto max-w-xl space-y-3 px-3 sm:max-w-2xl sm:space-y-4 sm:px-0">
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
          <div className="space-y-3 p-1 sm:p-3">
            {error && (
              <Alert variant="destructive" className="border-border bg-[hsl(var(--finance-negative))/0.1] text-foreground">
                <AlertDescription className="font-mono text-[hsl(var(--finance-negative))]">{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2 md:grid-cols-3 text-foreground">
              {[{
                icon: <Sparkles className="h-3.5 w-3.5 text-primary" />,
                title: language === 'id' ? 'Mode Aktif' : 'Active Mode',
                main: typeLabel,
                desc: typeDescription,
              }, {
                icon: <ArrowUpRight className="h-3.5 w-3.5 text-primary" />,
                title: language === 'id' ? 'Preview Nominal' : 'Amount Preview',
                main: `${type === 'income' ? '+' : '-'}${amountPreview}`,
                desc: language === 'id' ? 'Nilai siap dicatat.' : 'Ready to be recorded.',
              }, {
                icon: <CalendarDays className="h-3.5 w-3.5 text-primary" />,
                title: language === 'id' ? 'Tanggal' : 'Date',
                main: formattedDate,
                desc: language === 'id' ? 'Gunakan tanggal yang paling akurat.' : 'Use the most accurate transaction date.',
              }].map((card, idx) => (
                <div key={idx} className={cn('rounded-[14px] border p-3 sm:p-4', panelTone)}>
                  <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                    {card.icon}
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em]">{card.title}</p>
                  </div>
                  <p className="text-base font-semibold">{card.main}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{card.desc}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Type Selection */}
              <div className="space-y-2">
                <Label className={`font-mono text-sm ${isDark ? 'text-[#a0a0a0]' : 'text-gray-600'}`}>
                  {language === 'id' ? 'Jenis Transaksi' : 'Transaction Type'}
                </Label>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={cn(
                      'rounded-[14px] border p-3 text-left transition-all',
                      type === 'income'
                        ? 'border-[hsl(var(--finance-positive))/0.45] bg-[hsl(var(--finance-positive))/0.12] text-[hsl(var(--finance-positive))] shadow-[0_14px_28px_rgba(0,0,0,0.12)]'
                        : 'border-border bg-card text-muted-foreground hover:border-[hsl(var(--finance-positive))/0.35] hover:text-foreground'
                      ,
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex w-14 flex-col items-center gap-1">
                        <div className={cn(
                          'flex h-10 w-10 items-center justify-center',
                          type === 'income'
                            ? 'text-[hsl(var(--finance-positive))]'
                            : 'text-muted-foreground'
                        )}>
                          <ArrowDownLeft className="h-4 w-4 stroke-[2.6]" />
                        </div>
                        <span className={cn(
                          'text-[10px] font-semibold uppercase tracking-[0.12em]',
                          type === 'income'
                            ? 'text-[hsl(var(--finance-positive))]'
                            : 'text-muted-foreground'
                        )}>
                          {language === 'id' ? 'Masuk' : 'Income'}
                        </span>
                      </div>
                      {type === 'income' && (
                        <span className="rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] border-[hsl(var(--finance-positive))/0.35] bg-[hsl(var(--finance-positive))/0.10] text-[hsl(var(--finance-positive))]">
                          {language === 'id' ? 'Aktif' : 'Active'}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="font-mono text-sm font-semibold">{language === 'id' ? 'Pemasukan' : 'Income'}</p>
                      <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                        {language === 'id' ? 'Dana masuk ke saldo utama.' : 'Funds flowing into your balance.'}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={cn(
                      'rounded-[14px] border p-3 text-left transition-all',
                      type === 'expense'
                        ? 'border-[hsl(var(--finance-negative))/0.45] bg-[hsl(var(--finance-negative))/0.12] text-[hsl(var(--finance-negative))] shadow-[0_14px_28px_rgba(0,0,0,0.12)]'
                        : 'border-border bg-card text-muted-foreground hover:border-[hsl(var(--finance-negative))/0.35] hover:text-foreground'
                      ,
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex w-14 flex-col items-center gap-1">
                        <div className={cn(
                          'flex h-10 w-10 items-center justify-center',
                          type === 'expense'
                            ? 'text-[hsl(var(--finance-negative))]'
                            : 'text-muted-foreground'
                        )}>
                          <ArrowUpRight className="h-4 w-4 stroke-[2.6]" />
                        </div>
                        <span className={cn(
                          'text-[10px] font-semibold uppercase tracking-[0.12em]',
                          type === 'expense'
                            ? 'text-[hsl(var(--finance-negative))]'
                            : 'text-muted-foreground'
                        )}>
                          {language === 'id' ? 'Keluar' : 'Expense'}
                        </span>
                      </div>
                      {type === 'expense' && (
                        <span className="rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] border-[hsl(var(--finance-negative))/0.35] bg-[hsl(var(--finance-negative))/0.10] text-[hsl(var(--finance-negative))]">
                          {language === 'id' ? 'Aktif' : 'Active'}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="font-mono text-sm font-semibold">{language === 'id' ? 'Pengeluaran' : 'Expense'}</p>
                      <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                        {language === 'id' ? 'Dana keluar dari saldo utama.' : 'Funds flowing out of your balance.'}
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <section className={cn('rounded-[16px] border p-3 sm:p-4', fieldTone)}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                      {language === 'id' ? 'Nominal Utama' : 'Primary Amount'}
                    </p>
                    <p className={`mt-1 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {language === 'id' ? 'Masukkan nilai tanpa simbol tambahan.' : 'Enter the numeric value without extra symbols.'}
                    </p>
                  </div>
                  <span className={`rounded-full border px-3 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] ${
                    type === 'income'
                      ? 'border-[hsl(var(--finance-positive))/0.35] bg-[hsl(var(--finance-positive))/0.10] text-[hsl(var(--finance-positive))]'
                      : 'border-[hsl(var(--finance-negative))/0.35] bg-[hsl(var(--finance-negative))/0.10] text-[hsl(var(--finance-negative))]'
                  }`}>
                    {typeLabel}
                  </span>
                </div>
                <div className={cn('mt-3 rounded-[14px] border px-3 py-3 sm:px-4', isDark ? 'border-white/10 bg-black' : 'border-slate-200 bg-slate-50')}>
                  <div className="flex items-center gap-3">
                    <span className={`text-xl font-semibold ${isDark ? 'text-amber-300' : 'text-blue-600'}`}>{currencySymbol}</span>
                    <Input
                      id="amount"
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={amount}
                      onChange={handleAmountChange}
                      className={cn(
                        'h-auto border-0 bg-transparent p-0 text-2xl font-semibold tracking-tight shadow-none focus-visible:ring-0',
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

              <div className="grid gap-3 md:grid-cols-[1.35fr_0.85fr]">
                <section className={cn('rounded-[16px] border p-3 sm:p-4', fieldTone)}>
                  <div className="flex items-center gap-2">
                    <Tags className={`h-3.5 w-3.5 ${isDark ? 'text-amber-300' : 'text-blue-600'}`} />
                    <Label className={`font-mono text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                      {language === 'id' ? 'Kategori' : 'Category'}
                    </Label>
                  </div>
                  <div className="mt-2.5 flex gap-2">
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className={cn('h-10 flex-1 rounded-[14px] font-mono text-sm', inputTone)}>
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
                        'h-10 rounded-[14px] px-3 font-mono text-sm',
                        isDark ? 'border-white/10 bg-[#141414] text-white hover:bg-[#1d1d1d] hover:border-amber-500/30' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white hover:border-blue-300',
                      )}
                    >
                      + {language === 'id' ? 'Baru' : 'New'}
                    </Button>
                  </div>
                </section>

                <section className={cn('rounded-[16px] border p-3 sm:p-4', fieldTone)}>
                  <div className="flex items-center gap-2">
                    <CalendarDays className={`h-3.5 w-3.5 ${isDark ? 'text-amber-300' : 'text-blue-600'}`} />
                    <Label htmlFor="date" className={`font-mono text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                      {language === 'id' ? 'Tanggal' : 'Date'}
                    </Label>
                  </div>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={cn('mt-2.5 h-10 rounded-[14px] font-mono text-sm', inputTone)}
                    required
                  />
                </section>

                <section className={cn('rounded-[16px] border p-3 sm:p-4', fieldTone)}>
                  <div className="flex items-center gap-2">
                    <CalendarDays className={`h-3.5 w-3.5 ${isDark ? 'text-amber-300' : 'text-blue-600'}`} />
                    <Label className={`font-mono text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                      {language === 'id' ? 'Frekuensi' : 'Frequency'}
                    </Label>
                  </div>
                  <Select value={repeatInterval} onValueChange={(v) => setRepeatInterval(v as RepeatInterval)}>
                    <SelectTrigger className={cn('mt-2.5 h-10 rounded-[14px] font-mono text-sm', inputTone)}>
                      <SelectValue placeholder={repeatLabels.once} />
                    </SelectTrigger>
                    <SelectContent className={isDark ? 'bg-[#111111] border-[#333333]' : 'bg-white border-gray-200'}>
                      {(Object.keys(repeatLabels) as RepeatInterval[]).map((key) => (
                        <SelectItem key={key} value={key} className="font-mono">
                          {repeatLabels[key]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </section>
              </div>

              {/* Description */}
              <section className={cn('rounded-[16px] border p-3 sm:p-4', fieldTone)}>
                <div className="flex items-center gap-2">
                  <FileText className={`h-3.5 w-3.5 ${isDark ? 'text-amber-300' : 'text-blue-600'}`} />
                  <Label htmlFor="description" className={`font-mono text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                    {language === 'id' ? 'Deskripsi (Opsional)' : 'Description (Optional)'}
                  </Label>
                </div>
                <div className="relative mt-2.5">
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={language === 'id' ? 'Tambahkan keterangan...' : 'Add notes...'}
                    className={cn(
                      'min-h-[110px] w-full resize-none rounded-[14px] border px-3 py-2.5 text-sm font-mono outline-none',
                      inputTone,
                    )}
                  />
                </div>
              </section>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-2.5 pt-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    'h-10 flex-1 rounded-[14px] font-mono text-sm',
                    isDark ? 'border-white/10 bg-[#141414] text-white hover:bg-[#1d1d1d]' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white',
                  )}
                  onClick={() => navigate('/transactions')}
                >
                  {language === 'id' ? 'Batal' : 'Cancel'}
                </Button>
                <TerminalButton 
                  type="submit" 
                  className={cn(
                    'h-10 flex-1 rounded-[14px] text-sm font-semibold tracking-[0.08em]',
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
