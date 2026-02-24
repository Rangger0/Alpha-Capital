import React, { memo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useLanguage } from '@/contexts/LanguageContext';

// ==========================================
// Terminal Card Component
// ==========================================
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

export const TerminalCard: React.FC<TerminalCardProps> = memo(({
  children,
  title,
  subtitle,
  className = '',

  showHeader = true,
  glow = true,
  animate = true,
}) => {
  const { theme } = useTheme();
  const { currency } = useLanguage();
  const isDark = theme === 'dark';
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.01 });

  const getStatusDotColor = () => {
    if (isDark) {
      return currency === 'IDR' ? '#EAB308' : '#3B82F6';
    }
    return currency === 'IDR' ? '#000000' : '#3B82F6';
  };

  return (
    <div
      ref={animate ? ref : undefined}
      className={`
        relative overflow-hidden rounded-lg border backdrop-blur-sm
        transition-[opacity,transform] duration-300 ease-out transform-gpu will-change-transform
        ${isDark 
          ? 'border-[#333333] bg-[#111111]' 
          : 'border-gray-200 bg-white shadow-sm'}
        ${glow && isDark ? 'shadow-[0_0_30px_rgba(255,165,2,0.1)]' : ''}
        ${glow && !isDark ? 'shadow-[0_0_30px_rgba(59,130,246,0.1)]' : ''}
        ${animate ? (isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4') : ''}
        ${className}
      `}
    >
      {showHeader && (
        <div className={`
          flex items-center gap-3 px-4 py-3 border-b
          ${isDark 
            ? 'border-[#333333] bg-[#1a1a1a]' 
            : 'border-gray-200 bg-gray-50'}
        `}>
          <div className={`
            flex items-center justify-center w-10 h-6 rounded font-mono text-xs font-bold border
            ${isDark 
              ? 'bg-[#ffa502]/20 text-[#ffa502] border-[#ffa502]/30' 
              : 'bg-blue-100 text-blue-600 border-blue-200'}
          `}>
            &gt;_
          </div>

          {title && (
            <div className="flex items-center gap-2">
              <span className={`
                text-xs font-mono uppercase tracking-wider
                ${isDark ? 'text-[#ffa502]' : 'text-blue-600'}
              `}>
                {title}
              </span>
              {subtitle && (
                <span className={`text-xs ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>
                  — {subtitle}
                </span>
              )}
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getStatusDotColor() }}
            />
            <span className={`text-[10px] font-mono font-bold ${isDark ? 'text-[#666666]' : 'text-gray-400'}`}>
              {currency}
            </span>
          </div>
        </div>
      )}

      <div className="p-4">
        {children}
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.01]">
        <div className="w-full h-full bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]" />
      </div>
    </div>
  );
});

TerminalCard.displayName = 'TerminalCard';

// ==========================================
// Terminal Text Component
// ==========================================
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
    <span className={`font-mono ${className}`}>
      {prefix && (
        <span className={isDark ? 'text-[#ffa502]' : 'text-blue-500'}>
          {prefix}
        </span>
      )}
      {text}
    </span>
  );
};

// ==========================================
// Terminal Prompt Component
// ==========================================
interface TerminalPromptProps {
  command: string;
  path?: string;
  className?: string;
}

export const TerminalPrompt: React.FC<TerminalPromptProps> = ({
  command,
  path = '',
  className = '',
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`font-mono text-sm ${className}`}>
      <span className={isDark ? 'text-[#666666]' : 'text-gray-400'}>➜</span>{' '}
      <span className={isDark ? 'text-[#ffa502]' : 'text-blue-500'}>
        {path}
      </span>{' '}
      <span className={isDark ? 'text-[#666666]' : 'text-gray-400'}>git:(</span>
      <span className={isDark ? 'text-[#ff4757]' : 'text-red-500'}>main</span>
      <span className={isDark ? 'text-[#666666]' : 'text-gray-400'}>)</span>{' '}
      <span className={isDark ? 'text-white' : 'text-gray-900'}>{command}</span>
    </div>
  );
};

// ==========================================
// Terminal Stat Component
// ==========================================
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
        <div className={`h-4 w-24 rounded animate-pulse ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-200'}`} />
        <div className={`h-8 w-32 rounded animate-pulse ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-200'}`} />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className={`text-xs font-mono uppercase tracking-wider ${isDark ? 'text-[#a0a0a0]' : 'text-gray-500'}`}>
          {getCurrencySymbol()} {label}
        </span>
        {trend && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
            trendUp 
              ? (isDark ? 'text-[#EAB308] bg-[#EAB308]/10' : 'text-yellow-600 bg-yellow-100') 
              : (isDark ? 'text-[#DC2626] bg-[#DC2626]/10' : 'text-blue-800 bg-blue-100')
          }`}>
            {trendUp ? '▲' : '▼'} {trend}
          </span>
        )}
      </div>
      <p className={`text-2xl font-bold font-mono tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );
};

// ==========================================
// Terminal Badge Component
// ==========================================
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
      ? 'bg-[#1a1a1a] text-[#ffa502] border-[#333333]' 
      : 'bg-gray-100 text-blue-600 border-gray-200',
    success: isDark 
      ? 'bg-[#EAB308]/10 text-[#EAB308] border-[#EAB308]/30'
      : 'bg-yellow-100 text-yellow-700 border-yellow-200',
    warning: isDark 
      ? 'bg-[#ffa502]/10 text-[#ffa502] border-[#ffa502]/30' 
      : 'bg-yellow-100 text-yellow-600 border-yellow-200',
    danger: isDark 
      ? 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/30'
      : 'bg-blue-900 text-white border-blue-800',
    info: isDark 
      ? 'bg-[#3742fa]/10 text-[#3742fa] border-[#3742fa]/30' 
      : 'bg-blue-100 text-blue-600 border-blue-200',
    income: isDark 
      ? 'bg-[#EAB308]/10 text-[#EAB308] border-[#EAB308]/30'
      : 'bg-yellow-100 text-yellow-700 border-yellow-200',
    expense: isDark 
      ? 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/30'
      : 'bg-blue-900 text-white border-blue-800',
  };

  return (
    <span className={`
      inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border
      ${variants[variant]}
      ${className}
    `}>
      {children}
    </span>
  );
};

// ==========================================
// Terminal Button Component
// ==========================================
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
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variants = {
    primary: isDark
      ? 'bg-[#ffa502] text-black hover:bg-[#ffb52e]'
      : 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: isDark
      ? 'bg-[#1a1a1a] text-white border border-[#333333] hover:bg-[#252525]'
      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200',
    ghost: isDark
      ? 'text-[#a0a0a0] hover:text-white hover:bg-[#1a1a1a]'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
  };

  const glowStyles = {
    primary: isDark 
      ? 'shadow-[0_0_20px_rgba(255,165,2,0.3)] hover:shadow-[0_0_30px_rgba(255,165,2,0.5)]'
      : 'shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]',
    secondary: '',
    ghost: '',
  };

  return (
    <button
      className={`
        font-mono font-medium rounded transition-all duration-200
        ${sizes[size]}
        ${variants[variant]}
        ${glow ? glowStyles[variant] : ''}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

// Default export
export default TerminalCard;