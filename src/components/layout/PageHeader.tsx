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
        'rounded-[32px] border px-5 py-5 sm:px-6 sm:py-6',
        isDark
          ? 'border-white/10 bg-white/[0.02] text-white'
          : 'border-slate-200 bg-white text-slate-950',
        className,
      )}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          {leading && (
            <div className="pt-1">
              {leading}
            </div>
          )}
          <div className="space-y-2">
            {eyebrow && (
              <div className="flex items-center gap-2">
                <span className={cn('h-2.5 w-2.5 rounded-full', isDark ? 'bg-amber-400' : 'bg-blue-600')} />
                <p className={cn('text-xs font-semibold uppercase tracking-[0.24em]', isDark ? 'text-amber-300' : 'text-blue-700')}>
                  {eyebrow}
                </p>
              </div>
            )}
            <div>
              <h1 className={cn('text-2xl font-semibold tracking-tight sm:text-3xl', isDark ? 'text-white' : 'text-slate-950')}>
                {title}
              </h1>
              {subtitle && (
                <p className={cn('mt-1.5 max-w-2xl text-sm sm:text-base', isDark ? 'text-zinc-400' : 'text-slate-600')}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {action && (
          <div className="flex flex-wrap items-center gap-3">
            {action}
          </div>
        )}
      </div>
    </section>
  );
};

export default PageHeader;
