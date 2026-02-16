import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, TrendingUp, TrendingDown, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getTransactions } from '@/lib/supabase';
import type { Transaction } from '@/types';
import { formatRupiah, formatDate, getMonthName } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';

interface DayData {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  income: number;
  expense: number;
  transactions: Transaction[];
}

const Calendar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadTransactions();
  }, [user, currentDate]);

  const loadTransactions = async () => {
    if (!user) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
    const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];

    try {
      const { data } = await getTransactions(user.id, {
        startDate: firstDay,
        endDate: lastDay,
      });
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const getCalendarDays = (): DayData[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const days: DayData[] = [];

    // Previous month days
    const prevMonth = new Date(year, month, 0);
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i;
      days.push({
        date: new Date(year, month - 1, day).toISOString().split('T')[0],
        day,
        isCurrentMonth: false,
        income: 0,
        expense: 0,
        transactions: [],
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(year, month, day).toISOString().split('T')[0];
      const dayTransactions = transactions.filter((t) => t.date === dateStr);
      const income = dayTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = dayTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      days.push({
        date: dateStr,
        day,
        isCurrentMonth: true,
        income,
        expense,
        transactions: dayTransactions,
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day).toISOString().split('T')[0],
        day,
        isCurrentMonth: false,
        income: 0,
        expense: 0,
        transactions: [],
      });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const calendarDays = getCalendarDays();
  const weekDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  const selectedDayData = selectedDate
    ? calendarDays.find((d) => d.date === selectedDate)
    : null;

  const monthTotalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthTotalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Kalender</h1>
            <p className="text-muted-foreground">Lihat transaksi berdasarkan tanggal</p>
          </div>
          <Button onClick={() => navigate('/transactions/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Transaksi
          </Button>
        </div>

        {/* Month Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Pemasukan</p>
              <p className="text-xl font-bold text-green-600">{formatRupiah(monthTotalIncome)}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
              <p className="text-xl font-bold text-red-600">{formatRupiah(monthTotalExpense)}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Selisih</p>
              <p
                className={`text-xl font-bold ${
                  monthTotalIncome - monthTotalExpense >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatRupiah(monthTotalIncome - monthTotalExpense)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="border-border/50 lg:col-span-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>
                  {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day.date)}
                    className={`aspect-square p-2 rounded-lg border transition-all ${
                      day.isCurrentMonth
                        ? 'bg-card hover:bg-muted'
                        : 'bg-muted/50 text-muted-foreground'
                    } ${selectedDate === day.date ? 'ring-2 ring-primary' : ''} ${
                      day.date === new Date().toISOString().split('T')[0]
                        ? 'border-primary'
                        : 'border-transparent'
                    }`}
                  >
                    <div className="h-full flex flex-col justify-between">
                      <span className={`text-sm ${!day.isCurrentMonth && 'opacity-50'}`}>{day.day}</span>
                      <div className="flex flex-col gap-0.5">
                        {day.income > 0 && (
                          <span className="text-[10px] text-green-600 font-medium truncate">
                            +{formatRupiah(day.income).replace('Rp', '').trim()}
                          </span>
                        )}
                        {day.expense > 0 && (
                          <span className="text-[10px] text-red-600 font-medium truncate">
                            -{formatRupiah(day.expense).replace('Rp', '').trim()}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-muted-foreground">Pemasukan</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm text-muted-foreground">Pengeluaran</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border border-primary" />
                  <span className="text-sm text-muted-foreground">Hari ini</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Day Transactions */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDayData ? formatDate(selectedDayData.date) : 'Pilih Tanggal'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedDayData ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Klik tanggal pada kalender</p>
                  <p className="text-sm">untuk melihat transaksi</p>
                </div>
              ) : selectedDayData.transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Tidak ada transaksi</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => navigate('/transactions/new')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayData.transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => navigate(`/transactions/edit/${transaction.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded ${
                              transaction.type === 'income'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {transaction.type === 'income' ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                          </div>
                          <span className="font-medium text-sm">{transaction.category}</span>
                        </div>
                        <span
                          className={`font-semibold text-sm ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatRupiah(transaction.amount)}
                        </span>
                      </div>
                      {transaction.description && (
                        <p className="text-xs text-muted-foreground mt-1 ml-7">
                          {transaction.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selectedDayData && selectedDayData.transactions.length > 0 && (
                <div className="mt-4 pt-4 border-t space-y-2">
                  {selectedDayData.income > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pemasukan</span>
                      <span className="text-green-600 font-medium">
                        +{formatRupiah(selectedDayData.income)}
                      </span>
                    </div>
                  )}
                  {selectedDayData.expense > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pengeluaran</span>
                      <span className="text-red-600 font-medium">
                        -{formatRupiah(selectedDayData.expense)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Calendar;
