import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Terminal, Sun, Moon, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PipesBackground } from '@/components/PipesBackground';

// Social Media Icons as SVG components
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
  const [lines, setLines] = useState<string[]>([]);
  
  const bootTexts = [
    '> SYSTEM_INIT...',
    '> LOADING_KERNEL...',
    '> MOUNTING_FILESYSTEM...',
    '> INITIALIZING_SECURITY_PROTOCOLS...',
    '> ESTABLISHING_SECURE_CONNECTION...',
    '> LOADING_MODULES: auth, crypto, ui...',
    '> CHECKING_SYSTEM_INTEGRITY...',
    '> SYSTEM_READY',
    '> WELCOME_TO_ALPHA CAPITAL',
  ];
  
  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < bootTexts.length) {
        setLines((prev) => [...prev, bootTexts[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 500);
      }
    }, 150);
    return () => clearInterval(interval);
  }, [onComplete]);
  
  return (
    <div className="font-mono text-sm space-y-1 theme-text-secondary">
      {lines.map((line, index) => (
        <div key={index} className="boot-line" style={{ animationDelay: `${index * 0.1}s` }}>
          {line}
          {index === lines.length - 1 && <span className="cursor-blink" />}
        </div>
      ))}
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const { signIn, resetPassword } = useAuth();
  const { language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [showBoot, setShowBoot] = useState(true);
  const [bootComplete, setBootComplete] = useState(false);

  useEffect(() => {
    const hasSeenBoot = sessionStorage.getItem('alpha_boot_seen');
    if (hasSeenBoot) {
      setShowBoot(false);
      setBootComplete(true);
    }
  }, []);

  const handleBootComplete = () => {
    setBootComplete(true);
    sessionStorage.setItem('alpha_boot_seen', 'true');
    setTimeout(() => setShowBoot(false), 300);
  };

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

  const socialLinks = [
    { icon: XIcon, href: 'https://x.com/rinzx_', label: 'X (Twitter)' },
    { icon: TelegramIcon, href: 'https://t.me/+MGzRobr9cp4yMTk1', label: 'Telegram' },
    { icon: TikTokIcon, href: 'https://www.tiktok.com/@rinzzx0', label: 'TikTok' },
    { icon: GitHubIcon, href: 'https://github.com/Rangger0', label: 'GitHub' },
    { icon: Mail, href: 'mailto:email@example.com', label: 'Email' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <PipesBackground />
      
      {showBoot && (
        <div className={`absolute inset-0 bg-background z-50 flex items-center justify-center p-8 transition-opacity duration-500 ${bootComplete ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="max-w-md w-full">
            <BootSequence onComplete={handleBootComplete} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="w-full max-w-md relative z-10">
        <div className="text-center space-y-6">
          
          {/* Logo */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl rounded-full opacity-30 bg-primary" />
              <img 
                src="/logo.png" 
                alt="Alpha Capital" 
                className="relative h-20 w-auto object-contain"
              />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {language === 'id' ? 'Masuk' : 'Login'}
            </h1>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="text-sm">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={language === 'id' ? 'nama@email.com' : 'name@email.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-full px-4 bg-card border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-full px-4 pr-10 bg-card border-border"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              disabled={loading}
            >
              {loading ? (
                <Terminal className="w-4 h-4 animate-pulse" />
              ) : (
                language === 'id' ? 'MASUK' : 'LOGIN'
              )}
            </Button>
          </form>

          {/* Theme Toggle - Moved below form */}
          <div className="flex justify-center pt-2">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border hover:bg-accent transition-all duration-300"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4" />
                  <span className="text-sm">{language === 'id' ? 'Mode Malam' : 'Dark Mode'}</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4" />
                  <span className="text-sm">{language === 'id' ? 'Mode Siang' : 'Light Mode'}</span>
                </>
              )}
            </button>
          </div>

          {/* Footer Links */}
          <div className="space-y-3 text-sm">
            <button
              type="button"
              onClick={() => setResetDialogOpen(true)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {language === 'id' ? 'Lupa password?' : 'Forgot password?'}
            </button>

            <div className="text-muted-foreground">
              {language === 'id' ? 'Belum punya akun?' : "Don't have an account?"}{' '}
              <Link to="/register" className="font-medium text-foreground hover:underline">
                {language === 'id' ? 'Daftar sekarang' : 'Sign up now'}
              </Link>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="pt-4 border-t border-border">
            <div className="flex justify-center items-center gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-card border border-border hover:bg-accent hover:scale-110 transition-all duration-300 text-muted-foreground hover:text-foreground"
                  aria-label={social.label}
                >
                  <social.icon />
                </a>
              ))}
            </div>
          </div>

          {/* Brand Name */}
          <div className="pt-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Alpha Capital
            </h2>
          </div>

          {/* Powered By */}
          <div className="pt-2 text-xs text-muted-foreground">
            <span>⚡ powered by Rose-Alpha</span>
          </div>

        </div>
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{language === 'id' ? 'Reset Password' : 'Reset Password'}</DialogTitle>
            <DialogDescription>
              {language === 'id' ? 'Masukkan email untuk menerima link reset.' : 'Enter email to receive reset link.'}
            </DialogDescription>
          </DialogHeader>

          {resetSent ? (
            <Alert className="mt-4">
              <AlertDescription>
                {language === 'id' ? 'Link reset telah dikirim.' : 'Reset link has been sent.'}
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder={language === 'id' ? 'nama@email.com' : 'name@email.com'}
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="h-11 rounded-full px-4"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setResetDialogOpen(false)}>
                  {language === 'id' ? 'Batal' : 'Cancel'}
                </Button>
                <Button type="submit">
                  {language === 'id' ? 'Kirim' : 'Send'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;