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

  const panelCard = isDark
    ? 'border-white/10 bg-[#0b0b0b] text-white'
    : 'border-white/70 bg-white/90 text-slate-950';

  return (
    <div
      className={cn(
        'relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8',
        isDark ? 'bg-[#050505]' : 'bg-[#eef3fb]',
      )}
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0',
          isDark
            ? 'bg-[radial-gradient(circle_at_top_left,rgba(255,165,2,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,165,2,0.12),transparent_26%)]'
            : 'bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.08),transparent_28%)]',
        )}
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center">
        <div
          className={cn(
            'grid w-full overflow-hidden rounded-[36px] border shadow-[0_30px_80px_rgba(15,23,42,0.10)] lg:grid-cols-[minmax(0,440px)_1fr]',
            panelCard,
          )}
        >
          <section className="relative flex flex-col p-6 sm:p-8 lg:p-10">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-2xl border',
                    isDark ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-white',
                  )}
                >
                  <img src="/logo.png" alt="Alpha Capital" className="h-9 w-9 object-contain" />
                </div>
                <div>
                  <p className={cn('text-xs font-semibold uppercase tracking-[0.24em]', isDark ? 'text-amber-300' : 'text-blue-700')}>
                    Alpha Capital
                  </p>
                  <p className={cn('mt-1 text-sm', isDark ? 'text-zinc-500' : 'text-slate-500')}>
                    v1.0.0
                  </p>
                </div>
              </div>
              {topAction}
            </div>

            <div className="mb-8">
              <span
                className={cn(
                  'inline-flex rounded-full border px-3 py-1 text-xs font-medium',
                  isDark
                    ? 'border-amber-500/25 bg-amber-500/10 text-amber-300'
                    : 'border-blue-200 bg-blue-50 text-blue-700',
                )}
              >
                {language === 'id' ? 'Akses aman ke dashboard finansial' : 'Secure access to your financial dashboard'}
              </span>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                {title}
              </h1>
              <p className={cn('mt-3 max-w-md text-sm sm:text-base', isDark ? 'text-zinc-400' : 'text-slate-600')}>
                {subtitle}
              </p>
            </div>

            <div className="flex-1">
              {children}
            </div>

            <div className="mt-8">
              {footer}
            </div>
          </section>

          <aside
            className={cn(
              'relative hidden min-h-full overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-6',
              isDark ? 'bg-[#080808]' : 'bg-[#f8fbff]',
            )}
          >
            <div
              className={cn(
                'absolute inset-0',
                isDark
                  ? 'bg-[radial-gradient(circle_at_top_right,rgba(255,165,2,0.18),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]'
                  : 'bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,251,255,0.8))]',
              )}
            />

            <div className="relative z-10 rounded-[30px] border border-white/10 bg-white/40 p-8 backdrop-blur-sm dark:bg-white/[0.03]">
              <span
                className={cn(
                  'inline-flex rounded-full border px-3 py-1 text-xs font-medium',
                  isDark
                    ? 'border-white/10 bg-white/[0.05] text-zinc-300'
                    : 'border-slate-200 bg-white text-slate-600',
                )}
              >
                {language === 'id' ? 'Ruang kerja keuangan' : 'Financial workspace'}
              </span>
              <h2 className="mt-6 max-w-lg text-4xl font-semibold leading-tight tracking-tight">
                {heroTitle}
              </h2>
              <p className={cn('mt-4 max-w-xl text-sm leading-6 sm:text-base', isDark ? 'text-zinc-400' : 'text-slate-600')}>
                {heroDescription}
              </p>

              <div className="mt-10 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                <div
                  className={cn(
                    'rounded-[28px] border p-5',
                    isDark ? 'border-white/10 bg-black/40' : 'border-white/80 bg-white/80',
                  )}
                >
                  <div className="mb-5 flex items-center justify-between">
                  <div>
                      <p className={cn('text-xs uppercase tracking-[0.24em]', isDark ? 'text-zinc-500' : 'text-slate-500')}>
                        Dashboard
                      </p>
                      <p className="mt-2 text-xl font-semibold">
                        {language === 'id' ? 'Ringkas, fokus, dan stabil' : 'Focused, tidy, and stable'}
                      </p>
                    </div>
                    <div
                      className={cn(
                        'rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em]',
                        isDark ? 'bg-amber-500/10 text-amber-300' : 'bg-blue-50 text-blue-700',
                      )}
                    >
                      {language === 'id' ? 'Keuangan' : 'Finance'}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className={cn('rounded-2xl border p-4', isDark ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-slate-50')}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={cn('text-xs uppercase tracking-[0.22em]', isDark ? 'text-zinc-500' : 'text-slate-500')}>
                            Cashflow
                          </p>
                          <p className="mt-2 text-2xl font-semibold">$81.89</p>
                        </div>
                        <div className={cn('h-11 w-11 rounded-2xl', isDark ? 'bg-amber-500/15' : 'bg-blue-100')} />
                      </div>
                    </div>
                    <div className={cn('rounded-2xl border p-4', isDark ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-white')}>
                      <div className="flex items-end gap-2">
                        {[44, 68, 52, 86, 73, 91, 58].map((height, index) => (
                          <div
                            key={index}
                            className={cn(
                              'flex-1 rounded-full',
                              isDark ? 'bg-gradient-to-t from-amber-500/30 to-amber-300/80' : 'bg-gradient-to-t from-blue-200 to-blue-600',
                            )}
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
                      className={cn(
                        'rounded-[24px] border p-5',
                        isDark ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-white/80',
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className={cn('mt-1 h-2.5 w-2.5 rounded-full', isDark ? 'bg-amber-400' : 'bg-blue-600')} />
                        <p className={cn('text-sm leading-6', isDark ? 'text-zinc-300' : 'text-slate-600')}>
                          {item}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative z-10 px-2 pt-6">
              <p className={cn('text-sm', isDark ? 'text-zinc-500' : 'text-slate-500')}>
                {language === 'id' ? 'Data Supabase tetap dipakai seperti sekarang.' : 'Supabase data stays untouched.'}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
