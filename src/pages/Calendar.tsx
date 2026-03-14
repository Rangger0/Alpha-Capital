import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, TrendingUp, TrendingDown, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTransactions } from '@/lib/supabase';
import type { Transaction } from '@/types';
import {
  TerminalCard,
  TerminalButton,
  TerminalBadge,
} from '@/components/ui/TerminalCard';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const { language, formatCurrency, formatDate: formatDateLang } = useLanguage();
  const isMobile = useIsMobile();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const tone = (cssVar: string) => `hsl(var(${cssVar}))`;
  const toneA = (cssVar: string, alpha = 0.14) => `hsl(var(${cssVar}) / ${alpha})`;
  const palette = {
    income: tone('--finance-positive'),
    expense: tone('--finance-negative'),
    warning: tone('--finance-warning'),
    accent: tone('--primary'),
    muted: tone('--muted-foreground'),
  };

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

  const selectedDayData = selectedDate ? calendarDays.find((d) => d.date === selectedDate) : null;

  const monthTotalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthTotalExpense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const monthBalance = monthTotalIncome - monthTotalExpense;

  const monthNames = language === 'id'
    ? ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          eyebrow={`${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
          title={language === 'id' ? 'Kalender' : 'Calendar'}
          subtitle={language === 'id' ? 'Lihat transaksi berdasarkan tanggal dengan tampilan yang lebih rapi di desktop dan mobile.' : 'Review transactions by date with a cleaner layout on desktop and mobile.'}
          action={!isMobile ? (
            <TerminalButton onClick={() => navigate('/transactions/new')}>
              <Plus className="mr-2 h-4 w-4" />
              {language === 'id' ? 'Tambah Transaksi' : 'Add Transaction'}
            </TerminalButton>
          ) : undefined}
        />

        {/* Month Summary */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <TerminalCard title="month_income">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-wider font-mono text-muted-foreground">
                  {language === 'id' ? 'Total Pemasukan' : 'Total Income'}
                </span>
                <p className="text-xl font-bold font-mono text-income">
                  {formatCurrency(monthTotalIncome)}
                </p>
              </div>
              <div
                className="rounded-lg border p-2.5"
                style={{ backgroundColor: toneA('--finance-positive'), borderColor: toneA('--finance-positive', 0.4), color: palette.income }}
              >
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
          </TerminalCard>

          <TerminalCard title="month_expense">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-wider font-mono text-muted-foreground">
                  {language === 'id' ? 'Total Pengeluaran' : 'Total Expense'}
                </span>
                <p className="text-xl font-bold font-mono text-expense">
                  {formatCurrency(monthTotalExpense)}
                </p>
              </div>
              <div
                className="rounded-lg border p-2.5"
                style={{ backgroundColor: toneA('--finance-negative'), borderColor: toneA('--finance-negative', 0.4), color: palette.expense }}
              >
                <TrendingDown className="h-4 w-4" />
              </div>
            </div>
          </TerminalCard>

          <TerminalCard title="month_balance">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-wider font-mono text-muted-foreground">
                  {language === 'id' ? 'Selisih' : 'Balance'}
                </span>
                <p
                  className={`text-xl font-bold font-mono ${monthBalance >= 0 ? 'text-income' : 'text-expense'}`}
                >
                  {formatCurrency(monthBalance)}
                </p>
                <TerminalBadge variant={monthTotalIncome - monthTotalExpense >= 0 ? 'success' : 'danger'}>
                  {monthTotalIncome - monthTotalExpense >= 0 ? (language === 'id' ? 'Surplus' : 'Surplus') : (language === 'id' ? 'Defisit' : 'Deficit')}
                </TerminalBadge>
              </div>
              <div
                className="rounded-lg border p-2.5"
                style={{ 
                  backgroundColor: monthBalance >= 0 ? toneA('--finance-positive') : toneA('--finance-negative'),
                  borderColor: monthBalance >= 0 ? toneA('--finance-positive', 0.4) : toneA('--finance-negative', 0.4),
                  color: monthBalance >= 0 ? palette.income : palette.expense,
                }}
              >
                {monthBalance >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              </div>
            </div>
          </TerminalCard>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Calendar */}
          <TerminalCard 
            title="calendar_grid" 
            subtitle={`${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
            className="xl:col-span-2 max-w-[960px] mx-auto"
          >
            <div className="space-y-4">
              {/* Navigation */}
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold font-mono text-foreground sm:text-lg">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <div className="flex gap-2">
                  <TerminalButton variant="ghost" size="sm" onClick={() => navigateMonth('prev')} glow={false} className="text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="h-4 w-4" />
                  </TerminalButton>
                  <TerminalButton variant="ghost" size="sm" onClick={() => navigateMonth('next')} glow={false} className="text-muted-foreground hover:text-foreground">
                    <ChevronRight className="h-4 w-4" />
                  </TerminalButton>
                </div>
              </div>

              {/* Week Days Header */}
              <div className="overflow-x-auto">
                <div className="min-w-[320px]">
                  <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                    {weekDays.map((day) => (
                      <div key={day} className="py-1.5 text-center text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                    {calendarDays.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(day.date)}
                        className={`
                          min-h-[66px] rounded-[12px] border p-2 text-left transition-all sm:min-h-[82px] sm:p-2.5 sm:aspect-square
                          ${day.isCurrentMonth
                            ? 'bg-card text-foreground hover:bg-muted/70 border-border' 
                            : 'bg-muted/50 text-muted-foreground border-border'
                          }
                          ${selectedDate === day.date ? 'ring-2 ring-primary shadow-glow' : ''}
                          ${day.date === new Date().toISOString().split('T')[0] ? 'border-primary/50 bg-primary/5' : ''}
                        `}
                      >
                        <div className="flex h-full flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-xs font-semibold ${!day.isCurrentMonth ? 'opacity-40' : ''}`}>{day.day}</span>
                            <div className="flex items-center gap-1 sm:hidden">
                              {day.income > 0 && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: palette.income }} />}
                              {day.expense > 0 && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: palette.expense }} />}
                            </div>
                          </div>

                          <div className="hidden flex-col gap-1 sm:flex">
                            {day.income > 0 && (
                              <span className="text-[9px] font-medium truncate" style={{ color: palette.income }}>
                                +{formatCurrency(day.income).replace(/[^0-9.,]/g, '').substring(0, 7)}
                              </span>
                            )}
                            {day.expense > 0 && (
                              <span className="text-[9px] font-medium truncate" style={{ color: palette.expense }}>
                                -{formatCurrency(day.expense).replace(/[^0-9.,]/g, '').substring(0, 7)}
                              </span>
                            )}
                          </div>

                          <div className="pt-2 sm:hidden">
                            <p className="truncate text-[9px] text-muted-foreground">
                              {day.transactions.length > 0
                                ? `${day.transactions.length} ${language === 'id' ? 'transaksi' : 'items'}`
                                : '\u00A0'}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: palette.income }} />
                  <span className="text-muted-foreground">{language === 'id' ? 'Pemasukan' : 'Income'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: palette.expense }} />
                  <span className="text-muted-foreground">{language === 'id' ? 'Pengeluaran' : 'Expense'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full border border-primary" />
                  <span className="text-muted-foreground">{language === 'id' ? 'Hari ini' : 'Today'}</span>
                </div>
              </div>
            </div>
          </TerminalCard>

          {/* Selected Day Transactions */}
          <TerminalCard 
            title="selected_date" 
            subtitle={selectedDayData ? formatDateLang(selectedDayData.date) : (language === 'id' ? 'Pilih tanggal' : 'Select date')}
          >
            <div className="min-h-[300px]">
              {!selectedDayData ? (
                <div className="text-center py-12">
                  <CalendarIcon className="mx-auto mb-3 h-12 w-12 text-primary opacity-30" />
                  <p className="mb-1 font-mono text-sm text-muted-foreground">{language === 'id' ? 'Klik tanggal pada kalender' : 'Click a date on the calendar'}</p>
                  <p className="font-mono text-xs text-muted-foreground/70">{language === 'id' ? 'untuk melihat transaksi' : 'to view transactions'}</p>
                </div>
              ) : selectedDayData.transactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="mb-3 font-mono text-sm text-muted-foreground">{language === 'id' ? 'Tidak ada transaksi' : 'No transactions'}</p>
                  <TerminalButton size="sm" onClick={() => navigate('/transactions/new')} glow={false} className="text-primary">
                    <Plus className="h-3 w-3 mr-1" />
                    {language === 'id' ? 'Tambah' : 'Add'}
                  </TerminalButton>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayData.transactions.map((transaction) => {
                    const isIncomeTx = transaction.type === 'income';
                    const accentColor = isIncomeTx ? palette.income : palette.expense;
                    return (
                      <div
                        key={transaction.id}
                        className="cursor-pointer rounded border p-3 transition-all"
                        style={{
                          backgroundColor: isIncomeTx ? toneA('--finance-positive', 0.12) : toneA('--finance-negative', 0.12),
                          borderColor: isIncomeTx ? toneA('--finance-positive', 0.35) : toneA('--finance-negative', 0.35),
                        }}
                        onClick={() => navigate(`/transactions/edit/${transaction.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="rounded p-1.5"
                              style={{
                                backgroundColor: isIncomeTx ? toneA('--finance-positive', 0.2) : toneA('--finance-negative', 0.2),
                                color: accentColor,
                              }}
                            >
                              {isIncomeTx ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            </div>
                            <span className="font-mono text-sm font-medium text-foreground">{transaction.category}</span>
                          </div>
                          <span className="font-mono text-sm font-semibold" style={{ color: accentColor }}>
                            {isIncomeTx ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                        </div>
                        {transaction.description && (
                          <p className="ml-7 mt-1 font-mono text-xs text-muted-foreground">{transaction.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedDayData && selectedDayData.transactions.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-border pt-4">
                  {selectedDayData.income > 0 && (
                    <div className="flex justify-between text-sm font-mono">
                      <span className="text-muted-foreground">{language === 'id' ? 'Pemasukan' : 'Income'}</span>
                      <span className="font-medium" style={{ color: palette.income }}>+{formatCurrency(selectedDayData.income)}</span>
                    </div>
                  )}
                  {selectedDayData.expense > 0 && (
                    <div className="flex justify-between text-sm font-mono">
                      <span className="text-muted-foreground">{language === 'id' ? 'Pengeluaran' : 'Expense'}</span>
                      <span className="font-medium" style={{ color: palette.expense }}>-{formatCurrency(selectedDayData.expense)}</span>
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
