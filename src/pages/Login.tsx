import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Terminal, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PipesBackground } from '@/components/PipesBackground';

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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <PipesBackground />
      
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border hover:bg-card transition-all duration-300"
        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5 text-foreground" />
        ) : (
          <Sun className="w-5 h-5 text-foreground" />
        )}
      </button>
      
      {showBoot && (
        <div className={`absolute inset-0 bg-background z-50 flex items-center justify-center p-8 transition-opacity duration-500 ${bootComplete ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="max-w-md w-full">
            <BootSequence onComplete={handleBootComplete} />
          </div>
        </div>
      )}

      {/* Main Content - Simple Centered Card */}
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
                className="h-11 rounded-full px-4"
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
                  className="h-11 rounded-full px-4 pr-10"
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
              className="w-full h-11 rounded-full bg-foreground text-background hover:bg-foreground/90 font-medium"
              disabled={loading}
            >
              {loading ? (
                <Terminal className="w-4 h-4 animate-pulse" />
              ) : (
                language === 'id' ? 'MASUK' : 'LOGIN'
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="space-y-4 text-sm">
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