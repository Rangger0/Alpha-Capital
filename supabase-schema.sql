-- Alpha Capital Database Schema for Supabase

-- Enable Row Level Security
alter table if exists public.users enable row level security;

-- Users table (managed by Supabase Auth, but we can add custom fields)
-- Note: Supabase Auth already handles user management

-- Transactions table
create table if not exists public.transactions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    type text not null check (type in ('income', 'expense')),
    category text not null,
    amount numeric not null check (amount > 0),
    description text,
    date date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on transactions
alter table public.transactions enable row level security;

-- Create policy for transactions
create policy "Users can only access their own transactions"
    on public.transactions
    for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Categories table
create table if not exists public.categories (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    type text not null check (type in ('income', 'expense')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, name, type)
);

-- Enable RLS on categories
alter table public.categories enable row level security;

-- Create policy for categories
create policy "Users can only access their own categories"
    on public.categories
    for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_date on public.transactions(date);
create index if not exists idx_transactions_type on public.transactions(type);
create index if not exists idx_categories_user_id on public.categories(user_id);

-- Function to get monthly summary
CREATE OR REPLACE FUNCTION get_monthly_summary(p_user_id uuid, p_year integer, p_month integer)
RETURNS TABLE (
    total_income numeric,
    total_expense numeric,
    balance numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as balance
    FROM public.transactions
    WHERE user_id = p_user_id
    AND EXTRACT(YEAR FROM date) = p_year
    AND EXTRACT(MONTH FROM date) = p_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
