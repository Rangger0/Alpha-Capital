import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthShell from '@/components/auth/AuthShell';
import { cn } from '@/lib/utils';

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const { signIn, resetPassword } = useAuth();
  const { language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const socialLinks = [
    { icon: XIcon, href: 'https://x.com/rinzx_', label: 'X (Twitter)' },
    { icon: TelegramIcon, href: 'https://t.me/+MGzRobr9cp4yMTk1', label: 'Telegram' },
    { icon: TikTokIcon, href: 'https://www.tiktok.com/@rinzzx0', label: 'TikTok' },
    { icon: GitHubIcon, href: 'https://github.com/Rangger0', label: 'GitHub' },
    { icon: Mail, href: 'mailto:email@example.com', label: 'Email' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(language === 'id' ? 'Email atau password salah' : 'Invalid email or password');
      } else {
        navigate('/dashboard');
      }
    } catch {
      setError(language === 'id' ? 'Terjadi kesalahan. Silakan coba lagi.' : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    const { error: resetError } = await resetPassword(resetEmail);
    if (!resetError) setResetSent(true);
  };

  return (
    <AuthShell
      title={language === 'id' ? 'Masuk ke akun Anda' : 'Sign in to your account'}
      subtitle={language === 'id' ? 'Lanjutkan ke dashboard Alpha Capital dengan tampilan baru yang lebih ringan.' : 'Continue to your Alpha Capital dashboard with the lighter refreshed interface.'}
      heroTitle={language === 'id' ? 'Pusat kendali keuangan untuk memantau arus kas harian' : 'A finance hub to monitor your daily cash flow'}
      heroDescription={language === 'id' ? 'Masuk untuk melihat pemasukan, pengeluaran, laporan, dan kalender transaksi dalam satu ruang kerja yang konsisten.' : 'Sign in to review income, expenses, reports, and transaction calendars from one consistent workspace.'}
      topAction={(
        <button
          type="button"
          onClick={toggleTheme}
          className={cn(
            'flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition-colors',
            isDark
              ? 'border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/[0.08]'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
          )}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span>{isDark ? (language === 'id' ? 'Siang' : 'Light') : (language === 'id' ? 'Malam' : 'Dark')}</span>
        </button>
      )}
      footer={(
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors',
                  isDark
                    ? 'border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] hover:text-white'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900',
                )}
                aria-label={social.label}
              >
                <social.icon />
              </a>
            ))}
          </div>

          <div className="text-sm">
            <span className={isDark ? 'text-zinc-400' : 'text-slate-600'}>
              {language === 'id' ? 'Belum punya akun?' : "Don't have an account?"}
            </span>{' '}
            <Link to="/register" className={cn('font-semibold', isDark ? 'text-amber-300 hover:text-amber-200' : 'text-blue-700 hover:text-blue-600')}>
              {language === 'id' ? 'Daftar sekarang' : 'Create one now'}
            </Link>
          </div>

          <p className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-slate-500')}>
            {language === 'id' ? 'Powered by Rose Alpha' : 'Powered by Rose Alpha'}
          </p>
        </div>
      )}
    >
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive" className="rounded-2xl">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className={cn('text-sm font-medium', isDark ? 'text-zinc-200' : 'text-slate-700')}>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={language === 'id' ? 'nama@email.com' : 'name@email.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                'h-12 rounded-2xl px-4',
                isDark ? 'border-white/10 bg-white/[0.04] text-white placeholder:text-zinc-500' : 'border-slate-200 bg-white text-slate-950 placeholder:text-slate-400',
              )}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className={cn('text-sm font-medium', isDark ? 'text-zinc-200' : 'text-slate-700')}>
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  'h-12 rounded-2xl px-4 pr-11',
                  isDark ? 'border-white/10 bg-white/[0.04] text-white placeholder:text-zinc-500' : 'border-slate-200 bg-white text-slate-950 placeholder:text-slate-400',
                )}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2 transition-colors',
                  isDark ? 'text-zinc-500 hover:text-white' : 'text-slate-400 hover:text-slate-900',
                )}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className={cn(
              'h-12 w-full rounded-2xl text-sm font-semibold',
              isDark ? 'bg-[#ffa502] text-black hover:bg-[#ffb52e]' : 'bg-blue-600 text-white hover:bg-blue-700',
            )}
            disabled={loading}
          >
            {loading ? (language === 'id' ? 'Memproses...' : 'Signing in...') : (language === 'id' ? 'Masuk' : 'Sign In')}
          </Button>
        </form>

        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => setResetDialogOpen(true)}
            className={cn('text-left transition-colors', isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-950')}
          >
            {language === 'id' ? 'Lupa password?' : 'Forgot password?'}
          </button>
        </div>
      </div>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className={cn('sm:max-w-md rounded-[28px]', isDark ? 'border-white/10 bg-[#0b0b0b] text-white' : 'border-slate-200 bg-white text-slate-950')}>
          <DialogHeader>
            <DialogTitle>{language === 'id' ? 'Reset Password' : 'Reset Password'}</DialogTitle>
            <DialogDescription className={isDark ? 'text-zinc-400' : 'text-slate-600'}>
              {language === 'id' ? 'Masukkan email untuk menerima link reset.' : 'Enter your email to receive a reset link.'}
            </DialogDescription>
          </DialogHeader>

          {resetSent ? (
            <Alert className="mt-4 rounded-2xl">
              <AlertDescription>
                {language === 'id' ? 'Link reset telah dikirim.' : 'Reset link has been sent.'}
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder={language === 'id' ? 'nama@email.com' : 'name@email.com'}
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className={cn('h-12 rounded-2xl px-4', isDark ? 'border-white/10 bg-white/[0.04] text-white placeholder:text-zinc-500' : 'border-slate-200 bg-white text-slate-950')}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" className="rounded-2xl" onClick={() => setResetDialogOpen(false)}>
                  {language === 'id' ? 'Batal' : 'Cancel'}
                </Button>
                <Button type="submit" className="rounded-2xl">
                  {language === 'id' ? 'Kirim' : 'Send'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AuthShell>
  );
};

export default Login;
