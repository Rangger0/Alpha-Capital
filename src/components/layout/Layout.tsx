import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import {
  ArrowLeftRight,
  BarChart3,
  CalendarDays,
  DollarSign,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Plus,
  Sun,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, currency, setCurrency } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const isDark = theme === 'dark';
  const isNative = Capacitor.isNativePlatform();
  const showQuickAdd = !location.pathname.startsWith('/transactions/new') && !location.pathname.startsWith('/transactions/edit');

  const navItems = [
    { path: '/dashboard', label: language === 'id' ? 'Dashboard' : 'Dashboard', icon: LayoutDashboard },
    { path: '/transactions', label: language === 'id' ? 'Transaksi' : 'Transactions', icon: ArrowLeftRight },
    { path: '/calendar', label: language === 'id' ? 'Kalender' : 'Calendar', icon: CalendarDays },
    { path: '/reports', label: language === 'id' ? 'Laporan' : 'Reports', icon: BarChart3 },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const surfaceCard = isDark
    ? 'border-white/10 bg-[#101010] text-white'
    : 'border-slate-200 bg-white text-slate-950 shadow-[0_12px_28px_rgba(148,163,184,0.12)]';
  const sidebarShell = isDark
    ? 'border-white/10 bg-[#050505] text-white shadow-[22px_0_60px_rgba(0,0,0,0.45)]'
    : 'border-slate-200 bg-[#f6f8fc] text-slate-950 shadow-[22px_0_60px_rgba(148,163,184,0.18)]';
  const topbarShell = isDark
    ? 'border-white/10 bg-[#050505] shadow-[0_16px_36px_rgba(0,0,0,0.42)]'
    : 'border-slate-200 bg-[#eef3fb] shadow-[0_12px_30px_rgba(148,163,184,0.18)]';
  const sidebarSection = isDark
    ? 'border-white/10 bg-[#111111]'
    : 'border-slate-200 bg-white shadow-[0_16px_40px_rgba(148,163,184,0.12)]';
  const mobileContentOffset = isNative
    ? 'calc(4rem + env(safe-area-inset-top) + 0.75rem)'
    : undefined;

  const sidebarBody = (
    <div
      className="flex min-h-full flex-col px-4 pb-6 pt-4 sm:px-5"
      style={{
        paddingTop: isNative ? 'max(1rem, env(safe-area-inset-top))' : undefined,
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
      }}
    >
      <button
        type="button"
        onClick={() => {
          navigate('/dashboard');
          setSidebarOpen(false);
        }}
        className={cn(
          'flex items-center gap-2.5 rounded-[24px] border px-4 py-3.5 text-left transition-colors',
          surfaceCard,
        )}
      >
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-[18px] border',
            isDark ? 'border-white/10 bg-[#181818]' : 'border-slate-200 bg-slate-50',
          )}
        >
          <img src="/logo.png" alt="Alpha Capital" className="h-8 w-8 object-contain" />
        </div>
        <div className="min-w-0">
          <p className={cn('text-[11px] font-semibold uppercase tracking-[0.24em]', isDark ? 'text-amber-300' : 'text-blue-700')}>
            Alpha Capital
          </p>
          <p className={cn('mt-1 text-sm', isDark ? 'text-zinc-400' : 'text-slate-500')}>v1.0.0</p>
        </div>
      </button>

      <div className={cn('mt-5 rounded-[24px] border p-2.5', sidebarSection)}>
        <div className="mb-2.5 px-2">
          <p className={cn('text-xs font-semibold uppercase tracking-[0.24em]', isDark ? 'text-zinc-500' : 'text-slate-500')}>
            {language === 'id' ? 'Navigasi' : 'Navigation'}
          </p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-[20px] px-2.5 py-2.5 text-left transition-colors',
                  active
                    ? (isDark
                        ? 'bg-amber-500/18 text-amber-300'
                        : 'bg-blue-50 text-blue-700')
                    : (isDark
                        ? 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'),
                )}
              >
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-[16px] border',
                    active
                      ? (isDark ? 'border-amber-500/20 bg-amber-500/10' : 'border-blue-200 bg-white')
                      : (isDark ? 'border-white/10 bg-[#181818]' : 'border-slate-200 bg-slate-50'),
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{item.label}</p>
                </div>
                <span
                  className={cn(
                    'h-2.5 w-2.5 rounded-full transition-opacity',
                    active
                      ? (isDark ? 'bg-amber-400 opacity-100' : 'bg-blue-600 opacity-100')
                      : 'opacity-0',
                  )}
                />
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6">
        <section className={cn('rounded-[28px] border p-4', surfaceCard)}>
          <div className="mb-4 flex items-center gap-2">
            <Globe className={cn('h-4 w-4', isDark ? 'text-amber-300' : 'text-blue-700')} />
            <p className={cn('text-xs font-semibold uppercase tracking-[0.24em]', isDark ? 'text-zinc-500' : 'text-slate-500')}>
              {language === 'id' ? 'Preferensi' : 'Preferences'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe className={cn('h-3.5 w-3.5', isDark ? 'text-zinc-400' : 'text-slate-500')} />
                <p className={cn('text-[11px] font-semibold uppercase tracking-[0.22em]', isDark ? 'text-zinc-500' : 'text-slate-500')}>
                  {language === 'id' ? 'Bahasa' : 'Language'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage('id')}
                  className={cn(
                    'rounded-2xl px-3 py-3 text-sm font-medium transition-colors',
                    language === 'id'
                      ? (isDark ? 'bg-amber-500/15 text-amber-300' : 'bg-blue-50 text-blue-700')
                      : (isDark ? 'bg-white/[0.04] text-zinc-300 hover:bg-white/[0.07]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'),
                  )}
                >
                  🇮🇩 ID
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={cn(
                    'rounded-2xl px-3 py-3 text-sm font-medium transition-colors',
                    language === 'en'
                      ? (isDark ? 'bg-amber-500/15 text-amber-300' : 'bg-blue-50 text-blue-700')
                      : (isDark ? 'bg-white/[0.04] text-zinc-300 hover:bg-white/[0.07]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'),
                  )}
                >
                  🇺🇸 EN
                </button>
              </div>
            </div>

            <div className={cn('h-px', isDark ? 'bg-white/10' : 'bg-slate-200')} />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className={cn('h-3.5 w-3.5', isDark ? 'text-zinc-400' : 'text-slate-500')} />
                <p className={cn('text-[11px] font-semibold uppercase tracking-[0.22em]', isDark ? 'text-zinc-500' : 'text-slate-500')}>
                  {language === 'id' ? 'Mata Uang' : 'Currency'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCurrency('IDR')}
                  className={cn(
                    'rounded-2xl px-3 py-3 text-sm font-medium transition-colors',
                    currency === 'IDR'
                      ? (isDark ? 'bg-amber-500/15 text-amber-300' : 'bg-blue-50 text-blue-700')
                      : (isDark ? 'bg-white/[0.04] text-zinc-300 hover:bg-white/[0.07]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'),
                  )}
                >
                  🇮🇩 IDR
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={cn(
                    'rounded-2xl px-3 py-3 text-sm font-medium transition-colors',
                    currency === 'USD'
                      ? (isDark ? 'bg-amber-500/15 text-amber-300' : 'bg-blue-50 text-blue-700')
                      : (isDark ? 'bg-white/[0.04] text-zinc-300 hover:bg-white/[0.07]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'),
                  )}
                >
                  🇺🇸 USD
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-6 space-y-3 border-t border-black/5 pt-6 dark:border-white/10 lg:mt-auto">
        <button
          type="button"
          onClick={toggleTheme}
          className={cn(
            'flex w-full items-center justify-between rounded-[20px] border px-4 py-3 text-left transition-colors',
            surfaceCard,
          )}
        >
          <div>
            <p className={cn('text-xs font-semibold uppercase tracking-[0.24em]', isDark ? 'text-zinc-500' : 'text-slate-500')}>
              {language === 'id' ? 'Tema' : 'Theme'}
            </p>
            <p className="mt-1 text-sm font-medium">
              {isDark ? (language === 'id' ? 'Mode Gelap' : 'Dark Mode') : (language === 'id' ? 'Mode Terang' : 'Light Mode')}
            </p>
          </div>
          <div
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-2xl border',
              isDark ? 'border-amber-500/20 bg-amber-500/10 text-amber-300' : 'border-blue-200 bg-blue-50 text-blue-700',
            )}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setLogoutDialogOpen(true)}
          className={cn(
            'flex w-full items-center justify-between rounded-[20px] border px-4 py-3 text-left transition-colors',
            isDark
              ? 'border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/15'
              : 'border-rose-200 bg-rose-50/95 text-rose-700 shadow-[0_12px_30px_rgba(251,113,133,0.14)] hover:bg-rose-100',
          )}
        >
          <div>
            <p className={cn('text-xs font-semibold uppercase tracking-[0.24em]', isDark ? 'text-rose-200/80' : 'text-rose-500')}>
              {language === 'id' ? 'Sesi' : 'Session'}
            </p>
            <p className="mt-1 text-sm font-medium">
              {language === 'id' ? 'Keluar dari akun' : 'Sign out of account'}
            </p>
          </div>
          <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', isDark ? 'bg-black/30' : 'bg-white')}>
            <LogOut className="h-5 w-5" />
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={cn('relative min-h-screen overflow-hidden', isDark ? 'bg-[#050505] text-white' : 'bg-[#eef3fb] text-slate-950')}
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0px)' }}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0',
          isDark
            ? 'bg-[radial-gradient(circle_at_top_left,rgba(255,165,2,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,165,2,0.08),transparent_24%)]'
            : 'bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.10),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.08),transparent_26%)]',
        )}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-[min(86vw,320px)] transform overflow-y-auto overscroll-contain border-r transition-transform duration-200 ease-out lg:w-[280px] lg:translate-x-0',
          sidebarShell,
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {sidebarBody}
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/45 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      <div
        className="relative flex min-h-screen flex-col pt-20 lg:pl-[280px] lg:pt-0"
        style={{ paddingTop: mobileContentOffset }}
      >
        <header
          className={cn(
            'fixed inset-x-0 top-0 z-20 border-b px-4 sm:px-6 lg:hidden',
            topbarShell,
          )}
          style={{ paddingTop: isNative ? 'max(0.75rem, env(safe-area-inset-top))' : undefined }}
        >
          <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setSidebarOpen((prev) => !prev)}
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors lg:hidden',
                  surfaceCard,
                )}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              {showQuickAdd && (
                <button
                  type="button"
                  onClick={() => navigate('/transactions/new')}
                  className={cn(
                    'inline-flex h-11 items-center gap-2 rounded-[20px] border px-4 text-sm font-semibold tracking-[0.08em] transition-colors',
                    isDark
                      ? 'border-amber-200/15 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-black shadow-[0_14px_34px_rgba(245,158,11,0.28)] hover:brightness-105'
                      : 'border-blue-500/10 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 text-white shadow-[0_14px_34px_rgba(37,99,235,0.22)] hover:brightness-105',
                  )}
                >
                  <Plus className="h-4 w-4" />
                  <span>{language === 'id' ? 'Tambah' : 'Add'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors lg:hidden',
                  surfaceCard,
                )}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </header>

        <main className="relative flex-1 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1440px]">
            {children}
          </div>
        </main>

        <footer className={cn('border-t px-4 py-4 text-sm sm:px-6 lg:px-8', isDark ? 'border-white/10' : 'border-white/70')}>
          <div className="mx-auto flex max-w-[1440px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className={cn(isDark ? 'text-zinc-500' : 'text-slate-500')}>
              Alpha Capital
            </p>
            <p className={cn(isDark ? 'text-zinc-500' : 'text-slate-500')}>
              {language === 'id' ? 'Powered by Rose Alpha' : 'Powered by Rose Alpha'}
            </p>
          </div>
        </footer>
      </div>

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent className={cn('rounded-[28px] border', surfaceCard)}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              {language === 'id' ? 'Konfirmasi keluar' : 'Confirm sign out'}
            </AlertDialogTitle>
            <AlertDialogDescription className={cn(isDark ? 'text-zinc-400' : 'text-slate-600')}>
              {language === 'id'
                ? 'Anda akan keluar dari akun aktif. Lanjutkan?'
                : 'You will be signed out from the current account. Continue?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={cn('rounded-2xl', isDark ? 'border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/[0.08]' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50')}>
              {language === 'id' ? 'Batal' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOut}
              className="rounded-2xl bg-rose-500 text-white hover:bg-rose-600"
            >
              {language === 'id' ? 'Keluar' : 'Logout'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Layout;
