import { createClient } from '@supabase/supabase-js';
import type { Transaction, Category } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabaseUrl.length > 0 && supabaseAnonKey.length > 0;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth functions
export const signUp = async (email: string, password: string) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase belum dikonfigurasi. Silakan atur VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.') };
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase belum dikonfigurasi. Silakan atur VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.') };
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  if (!isSupabaseConfigured()) {
    return { error: new Error('Supabase belum dikonfigurasi.') };
  }
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const resetPassword = async (email: string) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase belum dikonfigurasi.') };
  }
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { data, error };
};

export const getCurrentUser = async () => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Transaction functions
export const getTransactions = async (userId: string, filters?: {
  startDate?: string;
  endDate?: string;
  type?: 'income' | 'expense';
  category?: string;
}) => {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null };
  }
  
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (filters?.startDate) {
    query = query.gte('date', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('date', filters.endDate);
  }
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  const { data, error } = await query;
  return { data: data as Transaction[] | null, error };
};

export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at'>) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase belum dikonfigurasi.') };
  }
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select()
    .single();
  return { data: data as Transaction | null, error };
};

export const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase belum dikonfigurasi.') };
  }
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data: data as Transaction | null, error };
};

export const deleteTransaction = async (id: string) => {
  if (!isSupabaseConfigured()) {
    return { error: new Error('Supabase belum dikonfigurasi.') };
  }
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);
  return { error };
};

// Category functions
export const getCategories = async (userId: string, type?: 'income' | 'expense') => {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null };
  }
  
  let query = supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId);

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query.order('name');
  return { data: data as Category[] | null, error };
};

export const addCategory = async (category: Omit<Category, 'id' | 'created_at'>) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase belum dikonfigurasi.') };
  }
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()
    .single();
  return { data: data as Category | null, error };
};

export const updateCategory = async (id: string, updates: Partial<Category>) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase belum dikonfigurasi.') };
  }
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data: data as Category | null, error };
};

export const deleteCategory = async (id: string) => {
  if (!isSupabaseConfigured()) {
    return { error: new Error('Supabase belum dikonfigurasi.') };
  }
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  return { error };
};

// Dashboard stats
export const getDashboardStats = async (userId: string) => {
  if (!isSupabaseConfigured()) {
    return { monthlyTransactions: [], allTransactions: [], weeklyTransactions: [] };
  }
  
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  // Get all transactions for current month
  const { data: monthlyTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', firstDayOfMonth)
    .lte('date', lastDayOfMonth);

  // Get all transactions for balance calculation
  const { data: allTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId);

  // Get last 7 days data
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { data: weeklyTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', sevenDaysAgo.toISOString().split('T')[0]);

  return {
    monthlyTransactions: monthlyTransactions as Transaction[] | null,
    allTransactions: allTransactions as Transaction[] | null,
    weeklyTransactions: weeklyTransactions as Transaction[] | null,
  };
};
