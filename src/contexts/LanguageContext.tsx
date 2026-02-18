import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'id' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  id: {
    'nav.dashboard': 'Dashboard',
    'nav.transactions': 'Transaksi',
    'nav.calendar': 'Kalender',
    'nav.reports': 'Laporan',
    'nav.darkMode': 'Mode Gelap',
    'nav.lightMode': 'Mode Terang',
    'nav.logout': 'Keluar',
    'nav.cancel': 'Batal',
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Financial Command Center',
    'dashboard.totalBalance': 'Total Saldo',
    'dashboard.totalIncome': 'Total Pemasukan',
    'dashboard.totalExpense': 'Total Pengeluaran',
    'dashboard.netProfit': 'Laba/Rugi Bersih',
    'dashboard.burnRate': 'Tingkat Pembakaran',
    'dashboard.savingRatio': 'Rasio Tabungan',
    'dashboard.allPeriod': 'Seluruh periode',
    'dashboard.periodPrefix': 'Periode',
    'dashboard.days7': '7 hari',
    'dashboard.days30': '30 hari',
    'dashboard.year': '1 tahun',
    'dashboard.profit': 'Laba',
    'dashboard.loss': 'Rugi',
    'dashboard.estMonthly': 'Estimasi per bulan',
    'dashboard.healthy': 'Sehat',
    'dashboard.normal': 'Normal',
    'dashboard.risk': 'Risiko',
    'dashboard.cashflowAnalysis': 'Analisis Arus Kas',
    'dashboard.last7Days': '7 Hari Terakhir',
    'dashboard.last5Weeks': '5 Minggu Terakhir',
    'dashboard.last12Months': '12 Bulan Terakhir',
    'dashboard.topCategories': 'Kategori Teratas',
    'dashboard.expenseDistribution': 'Distribusi pengeluaran',
    'dashboard.top5Expenses': 'Top 5 Pengeluaran',
    'dashboard.highestExpenseCategories': 'Kategori dengan pengeluaran tertinggi',
    'dashboard.recentTransactions': 'Transaksi Terbaru',
    'dashboard.last5Transactions': '5 transaksi terakhir',
    'dashboard.viewAll': 'Lihat Semua',
    'dashboard.addTransaction': 'Tambah Transaksi',
    'time.7days': '7 Hari',
    'time.30days': '30 Hari',
    'time.year': 'Tahunan',
    'footer.contact': 'Hubungi Kami',
  },
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.transactions': 'Transactions',
    'nav.calendar': 'Calendar',
    'nav.reports': 'Reports',
    'nav.darkMode': 'Dark Mode',
    'nav.lightMode': 'Light Mode',
    'nav.logout': 'Logout',
    'nav.cancel': 'Cancel',
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Financial Command Center',
    'dashboard.totalBalance': 'Total Balance',
    'dashboard.totalIncome': 'Total Income',
    'dashboard.totalExpense': 'Total Expense',
    'dashboard.netProfit': 'Net Profit/Loss',
    'dashboard.burnRate': 'Monthly Burn Rate',
    'dashboard.savingRatio': 'Saving Ratio',
    'dashboard.allPeriod': 'All time',
    'dashboard.periodPrefix': 'Period',
    'dashboard.days7': '7 days',
    'dashboard.days30': '30 days',
    'dashboard.year': '1 year',
    'dashboard.profit': 'Profit',
    'dashboard.loss': 'Loss',
    'dashboard.estMonthly': 'Est. per month',
    'dashboard.healthy': 'Healthy',
    'dashboard.normal': 'Normal',
    'dashboard.risk': 'Risk',
    'dashboard.cashflowAnalysis': 'Cashflow Analysis',
    'dashboard.last7Days': 'Last 7 Days',
    'dashboard.last5Weeks': 'Last 5 Weeks',
    'dashboard.last12Months': 'Last 12 Months',
    'dashboard.topCategories': 'Top Categories',
    'dashboard.expenseDistribution': 'Expense distribution',
    'dashboard.top5Expenses': 'Top 5 Expenses',
    'dashboard.highestExpenseCategories': 'Highest spending categories',
    'dashboard.recentTransactions': 'Recent Transactions',
    'dashboard.last5Transactions': 'Last 5 transactions',
    'dashboard.viewAll': 'View All',
    'dashboard.addTransaction': 'Add Transaction',
    'time.7days': '7 Days',
    'time.30days': '30 Days',
    'time.year': 'Yearly',
    'footer.contact': 'Contact Us',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('id');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && (saved === 'id' || saved === 'en')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.id] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};