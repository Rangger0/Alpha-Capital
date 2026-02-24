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
  formatCompactNumber: (amount: number) => string;
  formatDate: (date: Date | string) => string;
  convertAmount: (amount: number) => number;
  getCurrencySymbol: () => string;
}

// ============================================
// EXCHANGE RATE CONFIGURATION
// ============================================

// 1 USD = 15,800 IDR (update sesuai rate real-time)
const USD_TO_IDR_RATE = 16800;

// Base currency aplikasi (data database tersimpan dalam IDR)
export const BASE_CURRENCY: Currency = 'IDR';

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

  
  const convertAmount = useCallback((amount: number): number => {
    if (currency === 'USD') {
      // IDR → USD (bagi dengan rate)
      return amount / USD_TO_IDR_RATE;
    }
    // Return IDR as-is
    return amount;
  }, [currency]);

  /**
   * Get currency symbol
   */
  const getCurrencySymbol = useCallback((): string => {
    return currency === 'IDR' ? 'Rp' : '$';
  }, [currency]);

  /**
   * Format currency with proper symbol and decimals
   */
  const formatCurrency = useCallback((amount: number): string => {
    const convertedAmount = convertAmount(amount);
    
    if (currency === 'IDR') {
      // Format IDR: Rp 1.234.567 (tanpa desimal)
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(convertedAmount);
    }
    
    // Format USD: $1,234.56 (dengan 2 desimal)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(convertedAmount);
  }, [currency, convertAmount]);

  /**
   * Format compact number (untuk chart/ringkasan)
   * Contoh: 1.2M, 60K, 1.5B
   */
  const formatCompactNumber = useCallback((amount: number): string => {
    const convertedAmount = convertAmount(amount);
    
    if (currency === 'IDR') {
      // Untuk IDR, format dalam ribuan/miliaran
      const absAmount = Math.abs(convertedAmount);
      
      if (absAmount >= 1_000_000_000) {
        return (convertedAmount / 1_000_000_000).toFixed(1) + 'B';
      }
      if (absAmount >= 1_000_000) {
        return (convertedAmount / 1_000_000).toFixed(1) + 'M';
      }
      if (absAmount >= 1_000) {
        return (convertedAmount / 1_000).toFixed(1) + 'K';
      }
      return convertedAmount.toString();
    }
    
    // Untuk USD, format dalam ribuan/miliaran
    const absAmount = Math.abs(convertedAmount);
    
    if (absAmount >= 1_000_000_000) {
      return '$' + (convertedAmount / 1_000_000_000).toFixed(1) + 'B';
    }
    if (absAmount >= 1_000_000) {
      return '$' + (convertedAmount / 1_000_000).toFixed(1) + 'M';
    }
    if (absAmount >= 1_000) {
      return '$' + (convertedAmount / 1_000).toFixed(1) + 'K';
    }
    return '$' + convertedAmount.toFixed(2);
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
      formatCompactNumber,
      formatDate,
      convertAmount,
      getCurrencySymbol,
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