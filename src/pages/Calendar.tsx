// src/pages/Calendar.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, TrendingUp, TrendingDown, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTransactions } from '@/lib/supabase';
import type { Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TerminalCard,
  TerminalButton,
  TerminalPrompt,
  TerminalText,
  TerminalBadge,
} from '@/components/ui/TerminalCard';
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
  const { theme } = useTheme();
  const { language, formatCurrency, formatDate: formatDateLang } = useLanguage();
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
  const weekDays = language === 'id' 
    ? ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const selectedDayData = selectedDate
    ? calendarDays.find((d) => d.date === selectedDate)
    : null;

  const monthTotalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthTotalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthNames = language === 'id'
    ? ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header - Terminal Style */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-border/50">
          <div>
            <TerminalPrompt 
              command={`calendar --month=${currentDate.getMonth() + 1} --year=${currentDate.getFullYear()}`} 
              className="mb-2"
            />
            <h1 className="text-3xl font-bold tracking-tight">
              <TerminalText 
                text={language === 'id' ? 'Kalender' : 'Calendar'} 
                typing 
                delay={100}
                className={theme === 'dark' ? 'text-green-400' : 'text-blue-500'}
              />
            </h1>
            <p className="text-muted-foreground mt-1 font-mono text-sm">
              {language === 'id' ? 'Lihat transaksi berdasarkan tanggal' : 'View transactions by date'}
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

        {/* Month Summary - Terminal Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TerminalCard title="month_income" delay={100}>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <TerminalText 
                  text={language === 'id' ? 'Total Pemasukan' : 'Total Income'} 
                  prefix="$ "
                  className={`text-xs uppercase tracking-wider ${theme === 'dark' ? 'text-green-400/70' : 'text-blue-500/70'}`}
                />
                <p className="text-2xl font-bold font-mono text-green-500">
                  {formatCurrency(monthTotalIncome)}
                </p>
              </div>
              <div className={`
                p-3 rounded-lg 
                ${theme === 'dark' 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                  : 'bg-green-500/10 text-green-600 border border-green-500/30'}
              `}>
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </TerminalCard>

          <TerminalCard title="month_expense" delay={200}>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <TerminalText 
                  text={language === 'id' ? 'Total Pengeluaran' : 'Total Expense'} 
                  prefix="$ "
                  className={`text-xs uppercase tracking-wider ${theme === 'dark' ? 'text-green-400/70' : 'text-blue-500/70'}`}
                />
                <p className="text-2xl font-bold font-mono text-red-500">
                  {formatCurrency(monthTotalExpense)}
                </p>
              </div>
              <div className={`
                p-3 rounded-lg 
                ${theme === 'dark' 
                  ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
                  : 'bg-red-500/10 text-red-600 border border-red-500/30'}
              `}>
                <TrendingDown className="h-5 w-5" />
              </div>
            </div>
          </TerminalCard>

          <TerminalCard title="month_balance" delay={300}>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <TerminalText 
                  text={language === 'id' ? 'Selisih' : 'Balance'} 
                  prefix="$ "
                  className={`text-xs uppercase tracking-wider ${theme === 'dark' ? 'text-green-400/70' : 'text-blue-500/70'}`}
                />
                <p className={`text-2xl font-bold font-mono ${monthTotalIncome - monthTotalExpense >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(monthTotalIncome - monthTotalExpense)}
                </p>
                <TerminalBadge variant={monthTotalIncome - monthTotalExpense >= 0 ? 'success' : 'danger'}>
                  {monthTotalIncome - monthTotalExpense >= 0 
                    ? (language === 'id' ? 'Surplus' : 'Surplus')
                    : (language === 'id' ? 'Defisit' : 'Deficit')}
                </TerminalBadge>
              </div>
              <div className={`
                p-3 rounded-lg 
                ${monthTotalIncome - monthTotalExpense >= 0
                  ? (theme === 'dark' 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                    : 'bg-green-500/10 text-green-600 border border-green-500/30')
                  : (theme === 'dark' 
                    ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
                    : 'bg-red-500/10 text-red-600 border border-red-500/30')
                }
              `}>
                {monthTotalIncome - monthTotalExpense >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              </div>
            </div>
          </TerminalCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar - Terminal Style */}
          <TerminalCard 
            title="calendar_grid" 
            subtitle={`${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
            delay={400}
            className="lg:col-span-2"
          >
            <div className="space-y-4">
              {/* Navigation */}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold font-mono">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <div className="flex gap-2">
                  <TerminalButton 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigateMonth('prev')}
                    glow={false}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </TerminalButton>
                  <TerminalButton 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigateMonth('next')}
                    glow={false}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </TerminalButton>
                </div>
              </div>

              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day) => (
                  <div key={day} className={`
                    text-center text-xs font-mono py-2 uppercase tracking-wider
                    ${theme === 'dark' ? 'text-green-400/70' : 'text-blue-500/70'}
                  `}>
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
                    className={`
                      aspect-square p-2 rounded-lg border transition-all font-mono text-sm
                      ${day.isCurrentMonth
                        ? (theme === 'dark' 
                          ? 'bg-slate-900/50 hover:bg-green-500/10 border-green-500/20' 
                          : 'bg-white hover:bg-blue-500/10 border-blue-500/20')
                        : 'bg-muted/30 text-muted-foreground border-transparent'
                      }
                      ${selectedDate === day.date 
                        ? (theme === 'dark' 
                          ? 'ring-2 ring-green-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                          : 'ring-2 ring-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]')
                        : ''
                      }
                      ${day.date === new Date().toISOString().split('T')[0]
                        ? (theme === 'dark' 
                          ? 'border-green-500/50 bg-green-500/5' 
                          : 'border-blue-500/50 bg-blue-500/5')
                        : ''
                      }
                    `}
                  >
                    <div className="h-full flex flex-col justify-between">
                      <span className={`${!day.isCurrentMonth && 'opacity-40'}`}>
                        {day.day}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        {day.income > 0 && (
                          <span className="text-[9px] text-green-500 font-medium truncate">
                            +{formatCurrency(day.income).replace(/[^0-9.,]/g, '').substring(0, 6)}
                          </span>
                        )}
                        {day.expense > 0 && (
                          <span className="text-[9px] text-red-500 font-medium truncate">
                            -{formatCurrency(day.expense).replace(/[^0-9.,]/g, '').substring(0, 6)}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 pt-4 border-t border-border text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">{language === 'id' ? 'Pemasukan' : 'Income'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-muted-foreground">{language === 'id' ? 'Pengeluaran' : 'Expense'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`
                    w-2 h-2 rounded-full border
                    ${theme === 'dark' ? 'border-green-500' : 'border-blue-500'}
                  `} />
                  <span className="text-muted-foreground">{language === 'id' ? 'Hari ini' : 'Today'}</span>
                </div>
              </div>
            </div>
          </TerminalCard>

          {/* Selected Day Transactions - Terminal Style */}
          <TerminalCard 
            title="selected_date" 
            subtitle={selectedDayData ? formatDateLang(selectedDayData.date) : (language === 'id' ? 'Pilih tanggal' : 'Select date')}
            delay={500}
          >
            <div className="min-h-[300px]">
              {!selectedDayData ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className={`
                    h-12 w-12 mx-auto mb-3 opacity-30
                    ${theme === 'dark' ? 'text-green-500' : 'text-blue-500'}
                  `} />
                  <p className="font-mono text-sm">{language === 'id' ? 'Klik tanggal pada kalender' : 'Click a date on the calendar'}</p>
                  <p className="font-mono text-xs opacity-70">{language === 'id' ? 'untuk melihat transaksi' : 'to view transactions'}</p>
                </div>
              ) : selectedDayData.transactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="font-mono text-sm mb-3">[EMPTY] {language === 'id' ? 'Tidak ada transaksi' : 'No transactions'}</p>
                  <TerminalButton
                    size="sm"
                    onClick={() => navigate('/transactions/new')}
                    glow={false}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {language === 'id' ? 'Tambah' : 'Add'}
                  </TerminalButton>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayData.transactions.map((transaction, idx) => (
                    <div
                      key={transaction.id}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all
                        ${transaction.type === 'income'
                          ? (theme === 'dark' 
                            ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40' 
                            : 'bg-green-500/5 border-green-500/20 hover:border-green-500/40')
                          : (theme === 'dark' 
                            ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40' 
                            : 'bg-red-500/5 border-red-500/20 hover:border-red-500/40')
                        }
                      `}
                      onClick={() => navigate(`/transactions/edit/${transaction.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`
                            p-1.5 rounded
                            ${transaction.type === 'income'
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-red-500/20 text-red-500'
                            }
                          `}>
                            {transaction.type === 'income' ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                          </div>
                          <span className="font-medium text-sm font-mono">{transaction.category}</span>
                        </div>
                        <span className={`font-semibold text-sm font-mono ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                      {transaction.description && (
                        <p className="text-xs text-muted-foreground mt-1 ml-7 font-mono opacity-70">
                          {transaction.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selectedDayData && selectedDayData.transactions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  {selectedDayData.income > 0 && (
                    <div className="flex justify-between text-sm font-mono">
                      <span className="text-muted-foreground">{language === 'id' ? 'Pemasukan' : 'Income'}</span>
                      <span className="text-green-500 font-medium">+{formatCurrency(selectedDayData.income)}</span>
                    </div>
                  )}
                  {selectedDayData.expense > 0 && (
                    <div className="flex justify-between text-sm font-mono">
                      <span className="text-muted-foreground">{language === 'id' ? 'Pengeluaran' : 'Expense'}</span>
                      <span className="text-red-500 font-medium">-{formatCurrency(selectedDayData.expense)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TerminalCard>
        </div>
      </div>
    </Layout>
  );
};

export default Calendar;