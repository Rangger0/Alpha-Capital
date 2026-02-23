import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, DollarSign } from 'lucide-react';
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
  TerminalPrompt,
} from '@/components/ui/TerminalCard';
import Layout from '@/components/layout/Layout';

const TransactionForm: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user } = useAuth();
  const { theme } = useTheme();
  const { language, formatCurrency } = useLanguage();
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

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className={`flex items-center gap-4 pb-4 border-b ${isDark ? 'border-[#333333]' : 'border-gray-200'}`}>
          <TerminalButton 
            variant="ghost" 
            onClick={() => navigate('/transactions')}
            glow={false}
            className={isDark ? 'text-[#a0a0a0] hover:text-white' : 'text-gray-600 hover:text-gray-900'}
          >
            <ArrowLeft className="h-5 w-5" />
          </TerminalButton>
          <div>
            <TerminalPrompt 
              command={isEdit ? `transactions --edit --id=${id}` : 'transactions --new'} 
              className={`mb-2 ${isDark ? 'text-[#a0a0a0]' : 'text-gray-500'}`}
            />
            <h1 className={`text-3xl font-bold tracking-tight font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isEdit ? (language === 'id' ? 'Edit Transaksi' : 'Edit Transaction') : (language === 'id' ? 'Tambah Transaksi' : 'Add Transaction')}
            </h1>
            <p className={`mt-1 font-mono text-sm ${isDark ? 'text-[#a0a0a0]' : 'text-gray-600'}`}>
              {isEdit ? (language === 'id' ? 'Perbarui detail transaksi' : 'Update transaction details') : (language === 'id' ? 'Catat transaksi baru' : 'Record new transaction')}
            </p>
          </div>
        </div>

        <TerminalCard 
          title="transaction_form" 
          subtitle={language === 'id' ? 'isi_detail_transaksi' : 'fill_transaction_details'}
        >
          <div className="p-6">
            {error && (
              <Alert variant="destructive" className={`mb-6 ${isDark ? 'border-[#ff4757]/50 bg-[#ff4757]/10' : 'border-red-200 bg-red-50'}`}>
                <AlertDescription className={`font-mono ${isDark ? 'text-[#ff4757]' : 'text-red-600'}`}>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection */}
              <div className="space-y-2">
                <Label className={`font-mono text-sm ${isDark ? 'text-[#a0a0a0]' : 'text-gray-600'}`}>
                  {language === 'id' ? 'Jenis Transaksi' : 'Transaction Type'}
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`
                      p-4 rounded border-2 transition-all flex flex-col items-center gap-2
                      ${type === 'income'
                        ? (isDark 
                            ? 'border-[#00d084] bg-[#00d084]/10 text-[#00d084]' 
                            : 'border-green-500 bg-green-50 text-green-600')
                        : (isDark 
                            ? 'border-[#333333] hover:border-[#00d084]/50 text-[#a0a0a0]' 
                            : 'border-gray-200 hover:border-green-300 text-gray-500')
                      }
                    `}
                  >
                    <div className={`p-2 rounded-full ${type === 'income' 
                      ? (isDark ? 'bg-[#00d084] text-black' : 'bg-green-500 text-white')
                      : (isDark ? 'bg-[#1a1a1a]' : 'bg-gray-100')
                    }`}>
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <span className="font-medium font-mono">{language === 'id' ? 'Pemasukan' : 'Income'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`
                      p-4 rounded border-2 transition-all flex flex-col items-center gap-2
                      ${type === 'expense'
                        ? (isDark 
                            ? 'border-[#ff4757] bg-[#ff4757]/10 text-[#ff4757]' 
                            : 'border-red-500 bg-red-50 text-red-600')
                        : (isDark 
                            ? 'border-[#333333] hover:border-[#ff4757]/50 text-[#a0a0a0]' 
                            : 'border-gray-200 hover:border-red-300 text-gray-500')
                      }
                    `}
                  >
                    <div className={`p-2 rounded-full ${type === 'expense' 
                      ? (isDark ? 'bg-[#ff4757] text-white' : 'bg-red-500 text-white')
                      : (isDark ? 'bg-[#1a1a1a]' : 'bg-gray-100')
                    }`}>
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <span className="font-medium font-mono">{language === 'id' ? 'Pengeluaran' : 'Expense'}</span>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className={`font-mono text-sm ${isDark ? 'text-[#a0a0a0]' : 'text-gray-600'}`}>
                  {language === 'id' ? 'Nominal' : 'Amount'}
                </Label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold ${isDark ? 'text-[#ffa502]' : 'text-blue-600'}`}>
                    {currencySymbol}
                  </span>
                  <Input
                    id="amount"
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={amount}
                    onChange={handleAmountChange}
                    className={`pl-10 text-lg font-mono ${
                      isDark 
                        ? 'bg-[#0a0a0a] border-[#333333] text-white focus:border-[#ffa502] focus:ring-[#ffa502]' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className={`font-mono text-sm ${isDark ? 'text-[#a0a0a0]' : 'text-gray-600'}`}>
                  {language === 'id' ? 'Kategori' : 'Category'}
                </Label>
                <div className="flex gap-2">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className={`flex-1 font-mono ${
                      isDark 
                        ? 'bg-[#0a0a0a] border-[#333333] text-white focus:border-[#ffa502]' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    }`}>
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
                    className={`font-mono ${
                      isDark 
                        ? 'bg-[#1a1a1a] border-[#333333] text-white hover:bg-[#252525] hover:border-[#ffa502]' 
                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-blue-500'
                    }`}
                  >
                    + {language === 'id' ? 'Baru' : 'New'}
                  </Button>
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date" className={`font-mono text-sm ${isDark ? 'text-[#a0a0a0]' : 'text-gray-600'}`}>
                  {language === 'id' ? 'Tanggal' : 'Date'}
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`text-lg font-mono ${
                    isDark 
                      ? 'bg-[#0a0a0a] border-[#333333] text-white focus:border-[#ffa502] focus:ring-[#ffa502]' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className={`font-mono text-sm ${isDark ? 'text-[#a0a0a0]' : 'text-gray-600'}`}>
                  {language === 'id' ? 'Deskripsi (Opsional)' : 'Description (Optional)'}
                </Label>
                <div className="relative">
                  <FileText className={`absolute left-3 top-3 h-4 w-4 ${isDark ? 'text-[#666666]' : 'text-gray-400'}`} />
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={language === 'id' ? 'Tambahkan keterangan...' : 'Add notes...'}
                    className={`w-full min-h-[100px] px-10 py-2 rounded-md border text-sm font-mono outline-none resize-none ${
                      isDark 
                        ? 'bg-[#0a0a0a] text-white border-[#333333] focus:border-[#ffa502] focus:ring-[#ffa502] placeholder:text-[#666666]' 
                        : 'bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-gray-400'
                    }`}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className={`flex-1 font-mono ${
                    isDark 
                      ? 'bg-[#1a1a1a] border-[#333333] text-white hover:bg-[#252525]' 
                      : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => navigate('/transactions')}
                >
                  {language === 'id' ? 'Batal' : 'Cancel'}
                </Button>
                <TerminalButton 
                  type="submit" 
                  className="flex-1"
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