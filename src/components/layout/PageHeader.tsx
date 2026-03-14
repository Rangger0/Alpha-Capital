import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  leading?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  eyebrow,
  action,
  leading,
  className,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section
      className={cn(
        'rounded-[12px] border px-3 py-2.5 sm:rounded-[18px] sm:px-4 sm:py-3.5',
        isDark
          ? 'border-white/10 bg-[#0d0d0d] text-white'
          : 'border-slate-200 bg-white text-slate-950',
        className,
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3 sm:gap-4">
          {leading && (
            <div className="pt-0.5">
              {leading}
            </div>
          )}
          <div className="space-y-1.5">
            {eyebrow && (
              <div className="flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full', isDark ? 'bg-amber-400' : 'bg-blue-600')} />
                <p className={cn('text-xs font-semibold uppercase tracking-[0.24em]', isDark ? 'text-amber-300' : 'text-blue-700')}>
                  {eyebrow}
                </p>
              </div>
            )}
            <div>
              <h1 className={cn('text-lg font-semibold tracking-tight sm:text-xl', isDark ? 'text-white' : 'text-slate-950')}>
                {title}
              </h1>
              {subtitle && (
                <p className={cn('mt-1 max-w-2xl text-sm leading-relaxed sm:text-base', isDark ? 'text-zinc-400' : 'text-slate-600')}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {action && (
          <div className="flex flex-wrap items-center gap-2.5">
            {action}
          </div>
        )}
      </div>
    </section>
  );
};

export default PageHeader;
