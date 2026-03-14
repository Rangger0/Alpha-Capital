import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface AuthShellProps {
  title: string;
  subtitle: string;
  heroTitle: string;
  heroDescription: string;
  topAction?: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}

const AuthShell: React.FC<AuthShellProps> = ({
  title,
  subtitle,
  heroTitle,
  heroDescription,
  topAction,
  children,
  footer,
}) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === 'dark';

  const panelCard = 'border-border bg-card text-foreground';

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-background px-3 py-5 sm:px-5 lg:px-7"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0',
          'bg-[radial-gradient(circle_at_top_left,hsla(var(--primary)/0.18),transparent_32%),radial-gradient(circle_at_bottom_right,hsla(var(--primary)/0.12),transparent_28%)]',
        )}
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-6xl items-center">
        <div
          className={cn(
            'grid w-full overflow-hidden rounded-[28px] border shadow-[0_24px_60px_rgba(15,23,42,0.10)] lg:grid-cols-[minmax(0,420px)_1fr]',
            panelCard,
          )}
        >
          <section className="relative flex flex-col p-5 sm:p-7 lg:p-8">
            <div className="mb-6 flex items-start justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card">
                  <img src="/logo.png" alt="Alpha Capital" className="h-7 w-7 object-contain" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                    Alpha Capital
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    v1.0.0
                  </p>
                </div>
              </div>
              {topAction}
            </div>

            <div className="mb-6">
              <span
                className={cn(
                  'inline-flex rounded-full border px-3 py-1 text-[11px] font-medium',
                  'border-primary/30 bg-primary/10 text-primary',
              )}
              >
                {language === 'id' ? 'Akses aman ke dashboard finansial' : 'Secure access to your financial dashboard'}
              </span>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                {title}
              </h1>
              <p className={cn('mt-3 max-w-md text-sm sm:text-base', isDark ? 'text-zinc-400' : 'text-slate-600')}>
                {subtitle}
              </p>
            </div>

            <div className="flex-1">
              {children}
            </div>

            <div className="mt-6">
              {footer}
            </div>
          </section>

          <aside className="relative hidden min-h-full overflow-hidden bg-background/70 lg:flex lg:flex-col lg:justify-between lg:p-5">
            <div
              className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsla(var(--primary)/0.18),transparent_24%),linear-gradient(180deg,hsla(var(--card-foreground)/0.04),transparent)]"
            />

            <div className="relative z-10 rounded-[26px] border border-border bg-card/70 p-6 backdrop-blur-sm">
              <span
              className={cn(
                'inline-flex rounded-full border px-3 py-1 text-[11px] font-medium',
                'border-muted-foreground/20 bg-muted/60 text-muted-foreground',
              )}
              >
                {language === 'id' ? 'Ruang kerja keuangan' : 'Financial workspace'}
              </span>
              <h2 className="mt-5 max-w-lg text-3xl font-semibold leading-tight tracking-tight">
                {heroTitle}
              </h2>
              <p className={cn('mt-3 max-w-xl text-sm leading-6 sm:text-base', isDark ? 'text-zinc-400' : 'text-slate-600')}>
                {heroDescription}
              </p>

              <div className="mt-10 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-[20px] border border-border bg-card/80 p-4">
                  <div className="mb-4 flex items-center justify-between">
                  <div>
                      <p className={cn('text-xs uppercase tracking-[0.24em]', isDark ? 'text-zinc-500' : 'text-slate-500')}>
                        Dashboard
                      </p>
                      <p className="mt-2 text-lg font-semibold">
                        {language === 'id' ? 'Ringkas, fokus, dan stabil' : 'Focused, tidy, and stable'}
                      </p>
                    </div>
                    <div
                      className={cn(
                        'rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em]',
                        'bg-primary/10 text-primary',
                      )}
                    >
                      {language === 'id' ? 'Keuangan' : 'Finance'}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-border bg-card/80 p-3.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={cn('text-xs uppercase tracking-[0.22em]', isDark ? 'text-zinc-500' : 'text-slate-500')}>
                            Cashflow
                          </p>
                          <p className="mt-2 text-xl font-semibold">$81.89</p>
                        </div>
                        <div className="h-11 w-11 rounded-2xl bg-primary/15" />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card/80 p-3.5">
                      <div className="flex items-end gap-2">
                        {[44, 68, 52, 86, 73, 91, 58].map((height, index) => (
                          <div
                            key={index}
                            className="flex-1 rounded-full bg-gradient-to-t from-primary/25 to-primary"
                            style={{ height }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    language === 'id' ? 'Ringkasan arus kas membantu melihat arah pemasukan dan pengeluaran.' : 'Cash flow summaries help track income and expense direction.',
                    language === 'id' ? 'Monitoring tabungan dan rasio belanja tetap konsisten di tiap perangkat.' : 'Savings and spending ratios stay consistent across devices.',
                    language === 'id' ? 'Pusat keuangan tetap terhubung tanpa mengubah data utama Anda.' : 'Your finance hub stays connected without changing core data.',
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-[18px] border border-border bg-card/80 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                        <p className="text-sm leading-6 text-foreground">
                          {item}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
