export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  created_at: string;
}

export interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  weeklyData: {
    date: string;
    income: number;
    expense: number;
  }[];
}

export interface CalendarDay {
  date: string;
  hasIncome: boolean;
  hasExpense: boolean;
  incomeTotal: number;
  expenseTotal: number;
}

export interface ReportData {
  period: string;
  income: number;
  expense: number;
  balance: number;
  transactions: Transaction[];
}
