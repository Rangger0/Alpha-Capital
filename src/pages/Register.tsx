import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Terminal, Command, CheckCircle2, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext'; // TAMBAH INI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PipesBackground } from '@/components/PipesBackground';

const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { language } = useLanguage();
  const { theme, toggleTheme } = useTheme(); // TAMBAH INI
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(language === 'id' ? 'Password tidak cocok' : 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError(language === 'id' ? 'Password minimal 6 karakter' : 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await signUp(email, password);
      if (signUpError) {
        setError(signUpError.message || (language === 'id' ? 'Gagal mendaftar. Silakan coba lagi.' : 'Registration failed. Please try again.'));
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch {
      setError(language === 'id' ? 'Terjadi kesalahan. Silakan coba lagi.' : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
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

      <div className="w-full max-w-md relative z-10">
        <div className="terminal-window glow-theme">
          {/* Terminal Header */}
          <div className="terminal-header">
            <div className="flex items-center gap-1 theme-text font-mono text-sm font-bold">
              <span>{'>'}</span>
              <span className="animate-pulse">{'_'}</span>
            </div>
            <span className="ml-3 text-xs text-muted-foreground font-mono">
              alpha_capital_register
            </span>
          </div>

                {/* Terminal Content */}
          <div className="p-6 space-y-6">
            {/* Logo Section - CLEAN NO BORDER */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                {/* Glow effect belakang logo */}
                <div className="absolute inset-0 blur-2xl rounded-full scale-125 opacity-50" 
                     style={{ backgroundColor: 'hsl(var(--theme-primary))' }} />
                
                {/* Logo tanpa kotak/border */}
                <img 
                  src="/logo.png" 
                  alt="Alpha Capital" 
                  className="relative h-24 w-auto object-contain drop-shadow-lg"
                />
              </div>

              <div className="text-center">
                <h1 className="font-mono text-xl theme-text text-glow tracking-[0.2em]">
                  {language === 'id' ? 'DAFTAR_AKUN' : 'REGISTER_ACCOUNT'}
                </h1>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono mt-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>SYSTEM_READY</span>
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
                  $ ./register --new-user
                </span>
              </div>
              <p className="text-muted-foreground text-xs font-mono mt-2">
                {language === 'id' ? 'Buat akun baru untuk mengelola keuangan' : 'Create a new account to manage finances'}
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-500/50 bg-red-500/10 font-mono text-sm">
                <AlertDescription className="flex items-center gap-2">
                  <span className="text-red-500">[ERROR]</span> {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="theme-border theme-bg font-mono text-sm">
                <AlertDescription className="flex items-center gap-2 theme-text">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    [OK] {language === 'id' 
                      ? 'Pendaftaran berhasil! Mengalihkan...' 
                      : 'Registration successful! Redirecting...'}
                  </span>
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
                  {/* Border terminal effect */}
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
                    disabled={success}
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
                    minLength={6}
                    disabled={success}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-secondary hover:theme-text z-10"
                    disabled={success}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground font-mono pl-2">
                  <span className="text-amber-500">⚠</span> {language === 'id' ? 'Minimal 6 karakter' : 'Minimum 6 characters'}
                </p>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="theme-text">$</span> confirm_password
                </Label>
                <div className="relative group">
                  <div className="absolute inset-0 rounded-lg opacity-30 group-hover:opacity-50 transition-opacity" 
                       style={{ border: '1px solid hsl(var(--theme-primary))' }} />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 theme-text-secondary z-10" />
                  <Input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="relative bg-transparent border-0 pl-10 font-mono placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                    required
                    disabled={success}
                  />
                </div>
              </div>

              {/* Register Button */}
              <Button
                type="submit"
                className="w-full h-11 mt-2 font-mono text-sm tracking-wider
                           bg-transparent border theme-border hover:theme-bg 
                           theme-text transition-all duration-300 group
                           relative overflow-hidden"
                disabled={loading || success}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Terminal className="w-4 h-4 animate-pulse" />
                      {language === 'id' ? 'Memuat...' : 'Loading...'}
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      {language === 'id' ? 'Berhasil!' : 'Success!'}
                    </>
                  ) : (
                    <>
                      <span className="text-muted-foreground">$</span>
                      {language === 'id' ? 'daftar' : 'register'}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </Button>
            </form>

            {/* Footer Link */}
            <div className="text-center pt-2 border-t border-border/30">
              <span className="text-xs text-muted-foreground font-mono">
                {language === 'id' ? 'Sudah punya akun?' : 'Already have an account?'}{' '}
              </span>
              <Link to="/login" className="text-xs font-mono theme-text hover:theme-text-secondary transition-colors">
                {language === 'id' ? './login' : './login'}
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground font-mono">
          <span className="theme-text">alpha_capital</span> © 2026 • 
          <span className="theme-text-secondary"> powered_by_rose_alpha</span> • 
          <span className="text-amber-500"> v2.0.1</span>
        </p>
      </div>
    </div>
  );
};

export default Register;