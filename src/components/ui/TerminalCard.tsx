import React, { memo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface TerminalCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  delay?: number;
  showHeader?: boolean;
  glow?: boolean;
  animate?: boolean;
}

const formatCardTitle = (value?: string) => {
  if (!value) return '';

  const normalized = value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const TerminalCard: React.FC<TerminalCardProps> = memo(({
  children,
  title,
  subtitle,
  className = '',
  showHeader = true,
  glow = true,
}) => {
  const { theme } = useTheme();
  const { currency } = useLanguage();
  const isDark = theme === 'dark';

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-[28px] border transition-colors duration-200',
        isDark
          ? 'border-white/10 bg-[#0d0d0d] text-white'
          : 'border-slate-200 bg-white text-slate-950',
        glow && isDark && 'shadow-[0_18px_45px_rgba(255,165,2,0.08)]',
        glow && !isDark && 'shadow-[0_18px_45px_rgba(37,99,235,0.08)]',
        className,
      )}
    >
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-px',
          isDark
            ? 'bg-gradient-to-r from-transparent via-amber-400/40 to-transparent'
            : 'bg-gradient-to-r from-transparent via-blue-500/30 to-transparent',
        )}
      />

      {showHeader && (
        <div
          className={cn(
            'flex items-center gap-3 border-b px-4 py-3 sm:px-5',
            isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50/90',
          )}
        >
          {(title || subtitle) && (
            <div className="min-w-0 flex-1">
              {title && (
                <p
                  className={cn(
                    'truncate text-xs font-semibold uppercase tracking-[0.24em]',
                    isDark ? 'text-amber-300' : 'text-blue-700',
                  )}
                >
                  {formatCardTitle(title)}
                </p>
              )}
              {subtitle && (
                <p className={cn('truncate text-[11px]', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                  {subtitle}
                </p>
              )}
            </div>
          )}

          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.24em]',
              isDark
                ? 'border-white/10 bg-white/[0.03] text-zinc-300'
                : 'border-slate-200 bg-white text-slate-500',
            )}
          >
            {currency}
          </span>
        </div>
      )}

      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
});

TerminalCard.displayName = 'TerminalCard';

interface TerminalTextProps {
  text: string;
  className?: string;
  typing?: boolean;
  delay?: number;
  prefix?: string;
  showCursor?: boolean;
}

export const TerminalText: React.FC<TerminalTextProps> = ({
  text,
  className = '',
  prefix = '',
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <span className={cn('font-mono', className)}>
      {prefix && (
        <span className={isDark ? 'text-amber-300' : 'text-blue-600'}>
          {prefix}
        </span>
      )}
      {text}
    </span>
  );
};

interface TerminalPromptProps {
  command: string;
  path?: string;
  className?: string;
}

export const TerminalPrompt: React.FC<TerminalPromptProps> = () => {
  return null;
};

interface TerminalStatProps {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  loading?: boolean;
}

export const TerminalStat: React.FC<TerminalStatProps> = ({
  label,
  value,
  trend,
  trendUp,
  loading = false,
}) => {
  const { theme } = useTheme();
  const { getCurrencySymbol } = useLanguage();
  const isDark = theme === 'dark';

  if (loading) {
    return (
      <div className="space-y-2">
        <div className={cn('h-4 w-24 rounded-full animate-pulse', isDark ? 'bg-white/10' : 'bg-slate-200')} />
        <div className={cn('h-8 w-32 rounded-2xl animate-pulse', isDark ? 'bg-white/10' : 'bg-slate-200')} />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className={cn('text-xs uppercase tracking-[0.18em]', isDark ? 'text-zinc-400' : 'text-slate-500')}>
          {getCurrencySymbol()} {label}
        </span>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
              trendUp
                ? (isDark ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-600')
                : (isDark ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' : 'border-rose-200 bg-rose-50 text-rose-600'),
            )}
          >
            {trendUp ? '▲' : '▼'} {trend}
          </span>
        )}
      </div>
      <p className={cn('text-2xl font-semibold tracking-tight', isDark ? 'text-white' : 'text-slate-950')}>
        {value}
      </p>
    </div>
  );
};

interface TerminalBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'income' | 'expense';
  className?: string;
}

export const TerminalBadge: React.FC<TerminalBadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const variants = {
    default: isDark
      ? 'border-white/10 bg-white/[0.04] text-zinc-300'
      : 'border-slate-200 bg-slate-100 text-slate-700',
    success: isDark
      ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: isDark
      ? 'border-amber-500/25 bg-amber-500/10 text-amber-300'
      : 'border-amber-200 bg-amber-50 text-amber-700',
    danger: isDark
      ? 'border-rose-500/25 bg-rose-500/10 text-rose-300'
      : 'border-rose-200 bg-rose-50 text-rose-700',
    info: isDark
      ? 'border-blue-500/25 bg-blue-500/10 text-blue-300'
      : 'border-blue-200 bg-blue-50 text-blue-700',
    income: isDark
      ? 'border-yellow-500/25 bg-yellow-500/10 text-yellow-300'
      : 'border-yellow-200 bg-yellow-50 text-yellow-700',
    expense: isDark
      ? 'border-rose-500/25 bg-rose-500/10 text-rose-300'
      : 'border-blue-200 bg-blue-50 text-blue-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
};

interface TerminalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export const TerminalButton: React.FC<TerminalButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  glow = true,
  className = '',
  ...props
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const sizes = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  const variants = {
    primary: isDark
      ? 'bg-[#ffa502] text-black hover:bg-[#ffb52e]'
      : 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: isDark
      ? 'border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]'
      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    ghost: isDark
      ? 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
  };

  const glowStyles = {
    primary: isDark
      ? 'shadow-[0_10px_30px_rgba(255,165,2,0.22)]'
      : 'shadow-[0_10px_30px_rgba(37,99,235,0.18)]',
    secondary: '',
    ghost: '',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-2xl font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50',
        sizes[size],
        variants[variant],
        glow ? glowStyles[variant] : '',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default TerminalCard;
