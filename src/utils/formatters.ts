export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('id-ID').format(num);
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
};

export const formatShortDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(d);
};

export const formatMonthYear = (date: Date): string => {
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export const getMonthName = (monthIndex: number): string => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[monthIndex];
};

export const parseRupiahInput = (value: string): number => {
  const cleanValue = value.replace(/[^\d]/g, '');
  return parseInt(cleanValue, 10) || 0;
};

export const formatRupiahInput = (value: string): string => {
  const num = parseRupiahInput(value);
  if (num === 0) return '';
  return new Intl.NumberFormat('id-ID').format(num);
};
