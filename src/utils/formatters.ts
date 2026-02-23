// src/utils/formatters.ts

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatUSD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format berdasarkan currency yang dipilih
export const formatCurrency = (amount: number, currency: 'IDR' | 'USD' = 'IDR'): string => {
  if (currency === 'USD') {
    return formatUSD(amount);
  }
  return formatRupiah(amount);
};

// Konversi IDR ke USD (rate bisa diupdate)
const IDR_TO_USD_RATE = 0.000061; // 1 IDR = 0.000061 USD (approx)

export const convertToUSD = (amountIDR: number): number => {
  return amountIDR * IDR_TO_USD_RATE;
};

export const convertToIDR = (amountUSD: number): number => {
  return amountUSD / IDR_TO_USD_RATE;
};

export const formatCompactNumber = (value: number): string => {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export const formatDateEN = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

// Input formatters - TAMBAH INI
export const formatCurrencyInput = (value: string, currency: 'IDR' | 'USD' = 'IDR'): string => {
  const number = value.replace(/[^\d]/g, '');
  if (!number) return '';
  
  if (currency === 'USD') {
    // Format dengan decimal untuk USD (cents)
    const num = parseInt(number);
    return (num / 100).toFixed(2);
  }
  
  // Format IDR tanpa decimal
  return new Intl.NumberFormat('id-ID').format(parseInt(number));
};

export const parseCurrencyInput = (value: string, currency: 'IDR' | 'USD' = 'IDR'): number => {
  if (currency === 'USD') {
    // Parse decimal untuk USD
    return parseFloat(value.replace(/[^\d.]/g, '')) || 0;
  }
  // Parse integer untuk IDR
  return parseInt(value.replace(/[^\d]/g, '')) || 0;
};

// Keep backward compatibility
export const formatRupiahInput = (value: string): string => {
  return formatCurrencyInput(value, 'IDR');
};

export const parseRupiahInput = (value: string): number => {
  return parseCurrencyInput(value, 'IDR');
};

export const getMonthName = (month: number): string => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[month];
};

export const getMonthNameEN = (month: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
};