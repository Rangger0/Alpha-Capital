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
  const { currency } = useLanguage();

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-[12px] border border-border bg-card text-foreground transition-colors duration-200 sm:rounded-[18px]',
        glow && 'shadow-[0_10px_26px_rgba(0,0,0,0.12)]',
        className,
      )}
    >
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-px',
          'bg-gradient-to-r from-transparent via-primary/50 to-transparent',
        )}
      />

      {showHeader && (
        <div
          className={cn(
            'flex items-center gap-2 border-b border-border bg-card/60 px-2.5 py-2 sm:px-3.5 sm:py-2.5 backdrop-blur',
          )}
        >
          {(title || subtitle) && (
            <div className="min-w-0 flex-1">
              {title && (
                <p
                  className={cn(
                    'truncate text-[11px] font-semibold uppercase tracking-[0.22em]',
                    'text-primary',
                  )}
                >
                  {formatCardTitle(title)}
                </p>
              )}
              {subtitle && (
                <p className="truncate text-[11px] text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
          )}

            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold tracking-[0.22em]',
                'border-border bg-card text-muted-foreground',
              )}
            >
            {currency}
          </span>
        </div>
      )}

      <div className="p-2 sm:p-3">{children}</div>
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
      <p className={cn('text-sm font-semibold tracking-tight sm:text-base', isDark ? 'text-white' : 'text-slate-950')}>
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
  const variants = {
    default: 'border-border bg-card/70 text-foreground',
    success: 'border-transparent bg-[hsl(var(--finance-positive))/0.12] text-[hsl(var(--finance-positive))]',
    warning: 'border-transparent bg-[hsl(var(--finance-warning))/0.14] text-[hsl(var(--finance-warning))]',
    danger: 'border-transparent bg-[hsl(var(--finance-negative))/0.14] text-[hsl(var(--finance-negative))]',
    info: 'border-transparent bg-[hsl(var(--accent))/0.14] text-[hsl(var(--accent))]',
    income: 'border-transparent bg-[hsl(var(--finance-positive))/0.12] text-[hsl(var(--finance-positive))]',
    expense: 'border-transparent bg-[hsl(var(--finance-negative))/0.14] text-[hsl(var(--finance-negative))]',
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
  const sizes = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
  };

  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'border border-border bg-card text-foreground hover:bg-muted',
    ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
  };

  const glowStyles = {
    primary: 'shadow-[0_10px_30px_rgba(0,0,0,0.18)]',
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
