import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Github, Twitter, Terminal, Command, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext'; // TAMBAH INI
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PipesBackground } from '@/components/PipesBackground';

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
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
  const { theme, toggleTheme } = useTheme(); // TAMBAH INI
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

   return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <PipesBackground />
      
      {/* TOMBOL TOGGLE THEME - POJOK KANAN ATAS */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-2 rounded-lg border theme-border bg-card/80 backdrop-blur-sm hover:theme-bg transition-all duration-300 group"
        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5 theme-text group-hover:scale-110 transition-transform" />
        ) : (
          <Sun className="w-5 h-5 theme-text group-hover:scale-110 transition-transform" />
        )}
      </button>
      
      {showBoot && (
        <div className={`absolute inset-0 bg-background z-50 flex items-center justify-center p-8 transition-opacity duration-500 ${bootComplete ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="max-w-md w-full">
            <BootSequence onComplete={handleBootComplete} />
          </div>
        </div>
      )}

      <div className="w-full max-w-md relative z-10">
        <div className="terminal-window glow-theme">
          {/* Terminal Header */}
          <div className="terminal-header">
            <div className="flex items-center gap-1 theme-text font-mono text-sm font-bold">
              <span>{'>'}</span>
              <span className="animate-pulse">{'_'}</span>
            </div>
            <span className="ml-3 text-xs text-muted-foreground font-mono">alpha_capital_login - bash - 80x24</span>
          </div>

          <div className="p-6 space-y-6">
            {/* Logo Section - CLEAN */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 blur-2xl rounded-full scale-125 opacity-50" 
                     style={{ backgroundColor: 'hsl(var(--theme-primary))' }} />
                <img 
                  src="/logo.png" 
                  alt="Alpha Capital" 
                  className="relative h-24 w-auto object-contain drop-shadow-lg"
                />
              </div>

              <div className="text-center">
                <h1 className="font-mono text-xl theme-text text-glow tracking-[0.2em]">
                  ALPHA_CAPITAL
                </h1>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono mt-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>SYSTEM_ONLINE</span>
                  <span className="theme-text-secondary">|</span>
                  <span>v2.0.1</span>
                </div>
              </div>
            </div>

            {/* Command Prompt */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-secondary/50 border border-border/50">
                <Command className="w-3 h-3 theme-text" />
                <span className="font-mono text-sm theme-text">
                  $ ./login --secure
                </span>
              </div>
              <p className="text-muted-foreground text-xs font-mono mt-2">
                {language === 'id' ? 'Masukkan kredensial akses' : 'Enter access credentials'}
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-500/50 bg-red-500/10 font-mono text-sm">
                <AlertDescription className="flex items-center gap-2">
                  <span className="text-red-500">[ERROR]</span> {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 font-mono">
              {/* Email Input */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="theme-text">$</span> user_email
                </Label>
                <div className="relative group">
                  <div className="absolute inset-0 rounded-lg opacity-30 group-hover:opacity-50 transition-opacity" 
                       style={{ border: '1px solid hsl(var(--theme-primary))' }} />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 theme-text-secondary z-10" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={language === 'id' ? 'nama@email.com' : 'name@email.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="relative bg-transparent border-0 pl-10 font-mono placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="theme-text">$</span> user_password
                </Label>
                <div className="relative group">
                  <div className="absolute inset-0 rounded-lg opacity-30 group-hover:opacity-50 transition-opacity" 
                       style={{ border: '1px solid hsl(var(--theme-primary))' }} />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 theme-text-secondary z-10" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="relative bg-transparent border-0 pl-10 pr-10 font-mono placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-secondary hover:theme-text z-10"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setResetDialogOpen(true)}
                  className="text-[10px] font-mono theme-text-secondary hover:theme-text transition-colors"
                >
                  {language === 'id' ? '[LUPA_PASSWORD?]' : '[FORGOT_PASSWORD?]'}
                </button>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-11 font-mono text-sm tracking-wider
                           bg-transparent border theme-border hover:theme-bg 
                           theme-text transition-all duration-300 group
                           relative overflow-hidden"
                disabled={loading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Terminal className="w-4 h-4 animate-pulse" />
                      {language === 'id' ? 'Memuat...' : 'Loading...'}
                    </>
                  ) : (
                    <>
                      <span className="text-muted-foreground">$</span>
                      {language === 'id' ? 'masuk' : 'login'}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </Button>
            </form>

            {/* Footer */}
            <div className="text-center pt-2 border-t border-border/30">
              <span className="text-xs text-muted-foreground font-mono">
                {language === 'id' ? 'Belum punya akun?' : "Don't have an account?"}{' '}
              </span>
              <Link to="/register" className="text-xs font-mono theme-text hover:theme-text-secondary transition-colors">
                {language === 'id' ? './register' : './register'}
              </Link>
            </div>

            {/* Social Connect */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-px bg-border/30" />
                <span className="text-[10px] text-muted-foreground font-mono">
                  $ connect --social
                </span>
                <div className="flex-1 h-px bg-border/30" />
              </div>
              <div className="flex items-center justify-center gap-3">
                {[
                  { icon: Github, href: 'https://github.com/Rangger0', label: 'GitHub' },
                  { icon: Twitter, href: 'https://x.com/rinzx_', label: 'X' },
                  { icon: TikTokIcon, href: 'https://www.tiktok.com/@rinzzx0', label: 'TikTok' },
                  { icon: Mail, href: 'mailto:Allgazali011@gmail.com', label: 'Email' },
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-md border border-border/30 hover:theme-border hover:theme-text hover:theme-bg transition-all duration-200"
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div> {/* tutup p-6 space-y-6 */}
        </div> {/* tutup terminal-window */}

        {/* Footer Copyright - PINDAH KE SINI */}
        <p className="mt-4 text-center text-xs text-muted-foreground font-mono">
          <span className="theme-text">alpha_capital</span> © 2026 •
          <span className="theme-text-secondary"> powered_by_rose_alpha</span> •
          <span className="text-amber-500"> v2.0.1</span>
        </p>
      </div> {/* tutup max-w-md */}

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="terminal-window theme-border">
          <DialogHeader>
            <DialogTitle className="font-mono theme-text flex items-center gap-2">
              <span className="text-muted-foreground">$</span> reset_password
            </DialogTitle>
            <DialogDescription className="font-mono text-sm">
              {language === 'id' ? 'Masukkan email untuk menerima link reset.' : 'Enter email to receive reset link.'}
            </DialogDescription>
          </DialogHeader>

          {resetSent ? (
            <Alert className="mt-4 theme-border theme-bg font-mono">
              <AlertDescription className="theme-text">
                [OK] {language === 'id' ? 'Link reset telah dikirim.' : 'Reset link has been sent.'}
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4 mt-4 font-mono">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="theme-text text-xs">
                  <span className="text-muted-foreground">$</span> email_target
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder={language === 'id' ? 'nama@email.com' : 'name@email.com'}
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="bg-secondary/30 theme-border focus:theme-border font-mono"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setResetDialogOpen(false)} className="font-mono border-border/30">
                  {language === 'id' ? 'Batal' : 'Cancel'}
                </Button>
                <Button type="submit" className="theme-bg theme-text border theme-border hover:theme-bg-hover font-mono">
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