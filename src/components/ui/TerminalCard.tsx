// src/components/ui/TerminalCard.tsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

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
}

export const TerminalCard: React.FC<TerminalCardProps> = ({
  children,
  title,
  subtitle,
  className = '',
  delay = 0,
  showHeader = true,
  glow = true,
}) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg border
        ${theme === 'dark' ? 'border-green-500/30' : 'border-blue-500/30'}
        ${glow ? (theme === 'dark' ? 'shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'shadow-[0_0_30px_rgba(59,130,246,0.1)]') : ''}
        bg-card/80 backdrop-blur-sm
        transition-all duration-500 ease-out
        ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${className}
      `}
    >
      {showHeader && (
        <div className={`
          flex items-center gap-3 px-4 py-3 border-b
          ${theme === 'dark' ? 'border-green-500/20 bg-green-500/5' : 'border-blue-500/20 bg-blue-500/5'}
        `}>
          {/* 🔥 NEW: Terminal Logo >_ */}
          <TerminalLogo delay={delay} />
          
          {/* Title */}
          {title && (
            <div className="flex items-center gap-2">
              <span className={`
                text-xs font-mono uppercase tracking-wider
                ${theme === 'dark' ? 'text-green-400' : 'text-blue-500'}
              `}>
                {title}
              </span>
              {subtitle && (
                <span className="text-xs text-muted-foreground">— {subtitle}</span>
              )}
            </div>
          )}
          
          {/* Status */}
          <div className="ml-auto flex items-center gap-2">
            <div className={`
              w-2 h-2 rounded-full animate-pulse
              ${theme === 'dark' ? 'bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]'}
            `} />
            <span className="text-[10px] text-muted-foreground font-mono">80×24</span>
          </div>
        </div>
      )}
      
      <div className="p-4">
        {children}
      </div>
      
      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.02]">
        <div className="w-full h-full bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]" />
      </div>
    </div>
  );
};

// 🔥 NEW: Terminal Logo Component
interface TerminalLogoProps {
  delay?: number;
}

const TerminalLogo: React.FC<TerminalLogoProps> = ({ delay = 0 }) => {
  const { theme } = useTheme();
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const fullText = '>_';

  useEffect(() => {
    const timer = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        if (i <= fullText.length) {
          setTypedText(fullText.slice(0, i));
          i++;
        } else {
          clearInterval(interval);
          setShowCursor(true);
        }
      }, 120);
      return () => clearInterval(interval);
    }, delay + 300);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`
      flex items-center justify-center w-10 h-6 rounded font-mono text-xs font-bold
      ${theme === 'dark' 
        ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
        : 'bg-blue-500/20 text-blue-500 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
      }
    `}>
      <span>{typedText}</span>
      {showCursor && (
        <span className={`
          inline-block w-1.5 h-3.5 ml-0.5 animate-terminal-blink
          ${theme === 'dark' ? 'bg-green-400' : 'bg-blue-500'}
        `} />
      )}
    </div>
  );
};

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
  typing = false,
  delay = 0,
  prefix = '',
  showCursor = false,
}) => {
  const [displayText, setDisplayText] = useState(typing ? '' : text);
  const [showBlinkCursor, setShowBlinkCursor] = useState(showCursor);
  const { theme } = useTheme();

  useEffect(() => {
    if (!typing) {
      setDisplayText(text);
      return;
    }

    let currentIndex = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
          setShowBlinkCursor(true);
        }
      }, 30);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [text, typing, delay]);

  return (
    <span className={`font-mono ${className}`}>
      {prefix && (
        <span className={theme === 'dark' ? 'text-green-500' : 'text-blue-500'}>
          {prefix}
        </span>
      )}
      {displayText}
      {showBlinkCursor && (
        <span className={`
          inline-block w-2 h-4 ml-0.5 align-middle animate-pulse
          ${theme === 'dark' ? 'bg-green-500' : 'bg-blue-500'}
        `} />
      )}
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
  path = 'alpha_capital',
  className = '',
}) => {
  const { theme } = useTheme();

  return (
    <div className={`font-mono text-sm ${className}`}>
      <span className="text-muted-foreground">➜</span>{' '}
      <span className={theme === 'dark' ? 'text-green-400' : 'text-blue-400'}>
        {path}
      </span>{' '}
      <span className="text-muted-foreground">git:(</span>
      <span className={theme === 'dark' ? 'text-red-400' : 'text-orange-400'}>main</span>
      <span className="text-muted-foreground">)</span>{' '}
      <span className="text-foreground">{command}</span>
    </div>
  );
};

// ==========================================
// Terminal Stat Component
// ==========================================
interface TerminalStatProps {
  label: string;
  value: string;
  prefix?: string;
  trend?: string;
  trendUp?: boolean;
  loading?: boolean;
  delay?: number;
}

export const TerminalStat: React.FC<TerminalStatProps> = ({
  label,
  value,
  prefix = '$',
  trend,
  trendUp,
  loading = false,
  delay = 0,
}) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`space-y-1 transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex items-center gap-2">
        <span className={`
          text-xs font-mono uppercase tracking-wider
          ${theme === 'dark' ? 'text-green-400/70' : 'text-blue-500/70'}
        `}>
          {prefix} {label}
        </span>
        {trend && (
          <span className={`
            text-[10px] px-1.5 py-0.5 rounded font-mono
            ${trendUp 
              ? (theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-500/20 text-green-600')
              : (theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-500/20 text-red-600')
            }
          `}>
            {trendUp ? '▲' : '▼'} {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold font-mono tracking-tight text-foreground">
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
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export const TerminalBadge: React.FC<TerminalBadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const { theme } = useTheme();

  const variants = {
    default: theme === 'dark' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    success: theme === 'dark' ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'bg-green-500/20 text-green-600 border-green-500/40',
    warning: theme === 'dark' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' : 'bg-yellow-500/20 text-yellow-600 border-yellow-500/40',
    danger: theme === 'dark' ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-red-500/20 text-red-600 border-red-500/40',
    info: theme === 'dark' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'bg-cyan-500/20 text-cyan-600 border-cyan-500/40',
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

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variants = {
    primary: theme === 'dark'
      ? 'bg-green-500 text-black hover:bg-green-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
      : 'bg-blue-500 text-white hover:bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    secondary: theme === 'dark'
      ? 'bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20'
      : 'bg-blue-500/10 text-blue-600 border border-blue-500/30 hover:bg-blue-500/20',
    ghost: theme === 'dark'
      ? 'text-green-400 hover:bg-green-500/10'
      : 'text-blue-600 hover:bg-blue-500/10',
  };

  return (
    <button
      className={`
        font-mono font-medium rounded transition-all duration-200
        ${sizes[size]}
        ${variants[variant]}
        ${glow && variant === 'primary' ? (theme === 'dark' ? 'hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]' : 'hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]') : ''}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};