import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type Language = 'id' | 'en';
type Currency = 'IDR' | 'USD';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string) => string;
  convertAmount: (amount: number) => number;
}

// Exchange rate (1 IDR to USD)
const EXCHANGE_RATE = 0.000068;

const translations = {
  id: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.transactions': 'Transaksi',
    'nav.calendar': 'Kalender',
    'nav.reports': 'Laporan',
    'nav.settings': 'Pengaturan',
    'nav.logout': 'Keluar',
    'nav.lightMode': 'Mode Terang',
    'nav.darkMode': 'Mode Gelap',
    'nav.cancel': 'Batal',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Financial Command Center',
    'dashboard.totalBalance': 'Total Saldo',
    'dashboard.totalIncome': 'Total Pemasukan',
    'dashboard.totalExpense': 'Total Pengeluaran',
    'dashboard.netProfit': 'Laba/Rugi Bersih',
    'dashboard.burnRate': 'Tingkat Pembakaran',
    'dashboard.savingsRatio': 'Rasio Tabungan',
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
    'dashboard.topCategories': 'Kategori Teratas',
    'dashboard.expenseDistribution': 'Distribusi pengeluaran',
    'dashboard.last7Days': '7 hari terakhir',
    'dashboard.last5Weeks': '5 minggu terakhir',
    'dashboard.last12Months': '12 bulan terakhir',
    'dashboard.top5Expenses': '5 Pengeluaran Tertinggi',
    'dashboard.highestExpenseCategories': 'Kategori pengeluaran tertinggi',
    'dashboard.recentTransactions': 'Transaksi Terbaru',
    'dashboard.last5Transactions': '5 transaksi terakhir',
    'dashboard.viewAll': 'Lihat Semua',
    'dashboard.addTransaction': 'Tambah Transaksi',

    // Time
    'time.7days': '7 Hari',
    'time.30days': '30 Hari',
    'time.year': 'Tahunan',

    // Actions
    'action.add_transaction': 'Tambah Transaksi',
    'action.edit': 'Edit',
    'action.delete': 'Hapus',
    'action.save': 'Simpan',
    'action.cancel': 'Batal',
    'action.search': 'Cari',
    'action.filter': 'Filter',
    'action.export': 'Export',

    // Status
    'status.loading': 'Memuat...',
    'status.error': 'Terjadi kesalahan',
    'status.success': 'Berhasil',
    'status.no_data': 'Tidak ada data',

    // Time
    'time.today': 'Hari ini',
    'time.yesterday': 'Kemarin',
    'time.this_week': 'Minggu ini',
    'time.this_month': 'Bulan ini',
    'time.last_month': 'Bulan lalu',

    // Footer
    'footer.contact': 'Hubungi Kami',
    'footer.version': 'v2.0.1',
    'footer.systemOnline': 'SYSTEM_ONLINE',
    'footer.systemReady': 'SYSTEM_READY',
    'footer.poweredBy': 'powered_by_rose_alpha',

    // Terminal
    'terminal.bash': 'bash',
    'terminal.user': 'alpha_capital',
    'terminal.prompt': '$',
    'terminal.login': './login --secure',
    'terminal.register': './register --new-user',
    'terminal.dashboard': './dashboard --overview',
    'terminal.transactions': './transactions --list',
    'terminal.calendar': './calendar --view',
    'terminal.reports': './reports --generate',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.transactions': 'Transactions',
    'nav.calendar': 'Calendar',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    'nav.lightMode': 'Light Mode',
    'nav.darkMode': 'Dark Mode',
    'nav.cancel': 'Cancel',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Financial Command Center',
    'dashboard.totalBalance': 'Total Balance',
    'dashboard.totalIncome': 'Total Income',
    'dashboard.totalExpense': 'Total Expense',
    'dashboard.netProfit': 'Net Profit/Loss',
    'dashboard.burnRate': 'Burn Rate',
    'dashboard.savingsRatio': 'Savings Ratio',
    'dashboard.allPeriod': 'All time',
    'dashboard.periodPrefix': 'Period',
    'dashboard.days7': '7 days',
    'dashboard.days30': '30 days',
    'dashboard.year': '1 year',
    'dashboard.profit': 'Profit',
    'dashboard.loss': 'Loss',
    'dashboard.estMonthly': 'Monthly estimate',
    'dashboard.healthy': 'Healthy',
    'dashboard.normal': 'Normal',
    'dashboard.risk': 'Risk',
    'dashboard.cashflowAnalysis': 'Cash Flow Analysis',
    'dashboard.topCategories': 'Top Categories',
    'dashboard.expenseDistribution': 'Expense distribution',
    'dashboard.last7Days': 'Last 7 days',
    'dashboard.last5Weeks': 'Last 5 weeks',
    'dashboard.last12Months': 'Last 12 months',
    'dashboard.top5Expenses': 'Top 5 Expenses',
    'dashboard.highestExpenseCategories': 'Highest expense categories',
    'dashboard.recentTransactions': 'Recent Transactions',
    'dashboard.last5Transactions': 'Last 5 transactions',
    'dashboard.viewAll': 'View All',
    'dashboard.addTransaction': 'Add Transaction',

    // Time
    'time.7days': '7 Days',
    'time.30days': '30 Days',
    'time.year': 'Yearly',

    // Actions
    'action.add_transaction': 'Add Transaction',
    'action.edit': 'Edit',
    'action.delete': 'Delete',
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.search': 'Search',
    'action.filter': 'Filter',
    'action.export': 'Export',

    // Status
    'status.loading': 'Loading...',
    'status.error': 'An error occurred',
    'status.success': 'Success',
    'status.no_data': 'No data available',

    // Time
    'time.today': 'Today',
    'time.yesterday': 'Yesterday',
    'time.this_week': 'This week',
    'time.this_month': 'This month',
    'time.last_month': 'Last month',

    // Footer
    'footer.contact': 'Contact Us',
    'footer.version': 'v2.0.1',
    'footer.systemOnline': 'SYSTEM_ONLINE',
    'footer.systemReady': 'SYSTEM_READY',
    'footer.poweredBy': 'powered_by_rose_alpha',

    // Terminal
    'terminal.bash': 'bash',
    'terminal.user': 'alpha_capital',
    'terminal.prompt': '$',
    'terminal.login': './login --secure',
    'terminal.register': './register --new-user',
    'terminal.dashboard': './dashboard --overview',
    'terminal.transactions': './transactions --list',
    'terminal.calendar': './calendar --view',
    'terminal.reports': './reports --generate',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('alpha_language');
    return (saved as Language) || 'id';
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('alpha_currency');
    return (saved as Currency) || 'IDR';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('alpha_language', lang);
    document.documentElement.lang = lang;
  }, []);

  const setCurrency = useCallback((curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem('alpha_currency', curr);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[language][key as keyof typeof translations.id] || key;
  }, [language]);

  // Convert amount based on currency
  const convertAmount = useCallback((amount: number): number => {
    if (currency === 'USD') {
      return amount * EXCHANGE_RATE;
    }
    return amount;
  }, [currency]);

  // Format currency
// Format currency - YANG BENAR
const formatCurrency = useCallback((amount: number): string => {
  // Convert dulu kalau USD
  const convertedAmount = convertAmount(amount);
  
  if (currency === 'IDR') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(convertedAmount);
  }
  
  // USD - 2 decimal untuk cents
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(convertedAmount);
}, [currency, convertAmount]);

  // Format date
  const formatDate = useCallback((date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (language === 'id') {
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d);
    }

    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  }, [language]);

  // Sync document language
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      currency,
      setCurrency,
      t, 
      formatCurrency, 
      formatDate,
      convertAmount
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};