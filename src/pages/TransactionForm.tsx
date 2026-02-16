import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { addTransaction, updateTransaction, getTransactions, getCategories, addCategory } from '@/lib/supabase';
import { formatRupiahInput, parseRupiahInput } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
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
import Layout from '@/components/layout/Layout';

const TransactionForm: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user } = useAuth();
  const isEdit = Boolean(id);

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
    const formatted = formatRupiahInput(e.target.value);
    setAmount(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('Anda harus login terlebih dahulu');
      return;
    }

    if (!category) {
      setError('Pilih atau buat kategori terlebih dahulu');
      return;
    }

    const amountValue = parseRupiahInput(amount);
    if (amountValue <= 0) {
      setError('Nominal harus lebih dari 0');
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
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
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

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/transactions')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isEdit ? 'Edit Transaksi' : 'Tambah Transaksi'}</h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Perbarui detail transaksi' : 'Catat transaksi baru'}
            </p>
          </div>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

                        <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection */}
              <div className="space-y-2">
                <Label>Jenis Transaksi</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      type === 'income'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-border hover:border-green-200'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full ${
                        type === 'income' ? 'bg-green-500 text-white' : 'bg-muted'
                      }`}
                    >
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <span className="font-medium">Pemasukan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      type === 'expense'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-border hover:border-red-200'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full ${
                        type === 'expense' ? 'bg-red-500 text-white' : 'bg-muted'
                      }`}
                    >
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <span className="font-medium">Pengeluaran</span>
                  </button>
                </div>
              </div>

              {/* Amount - NOMINAL */}
              <div className="space-y-2">
                <Label htmlFor="amount">Nominal</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    Rp
                  </span>
                  <Input
                    id="amount"
                    type="text"
                    placeholder="0"
                    value={amount}
                    onChange={handleAmountChange}
                    className="pl-10 text-lg"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Kategori</Label>
                <div className="flex gap-2">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length === 0 ? (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                          Belum ada kategori
                        </div>
                      ) : (
                        categories
                          .filter((cat) => cat && typeof cat === 'string' && cat.trim() !== '')
                          .map((cat, index) => (
                            <SelectItem key={`${cat}-${index}`} value={cat}>
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
                  >
                    + Baru
                  </Button>
                </div>
              </div>

              {/* Date - Simple Input */}
              <div className="space-y-2">
                <Label htmlFor="date">Tanggal</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="text-lg"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi (Opsional)</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tambahkan keterangan..."
                    className="w-full min-h-[100px] px-10 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/transactions')}
                >
                  Batal
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Transaksi'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* New Category Dialog */}
      <Dialog open={newCategoryDialogOpen} onOpenChange={setNewCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Kategori Baru</DialogTitle>
            <DialogDescription>Buat kategori baru untuk transaksi Anda.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-category">Nama Kategori</Label>
              <Input
                id="new-category"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Contoh: Makanan, Transport, Gaji"
              />
            </div>
            <div className="space-y-2">
              <Label>Jenis</Label>
              <Select
                value={newCategoryType}
                onValueChange={(v) => setNewCategoryType(v as 'income' | 'expense')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Pemasukan</SelectItem>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewCategoryDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
              Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default TransactionForm;
