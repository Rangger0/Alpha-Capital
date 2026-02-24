import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, CheckCircle2, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PipesBackground } from '@/components/PipesBackground';

const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
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
              {language === 'id' ? 'Daftar' : 'Register'}
            </h1>
          </div>

          {/* Error/Success Message */}
          {error && (
            <Alert variant="destructive" className="text-sm">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="text-sm border-green-500/50 bg-green-500/10">
              <AlertDescription className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                {language === 'id' ? 'Pendaftaran berhasil! Mengalihkan...' : 'Registration successful! Redirecting...'}
              </AlertDescription>
            </Alert>
          )}

          {/* Register Form */}
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
                disabled={success}
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
                  disabled={success}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {language === 'id' ? 'Minimal 6 karakter' : 'Minimum 6 characters'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium">
                {language === 'id' ? 'Konfirmasi Password' : 'Confirm Password'}
              </Label>
              <Input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 rounded-full px-4"
                required
                disabled={success}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-full bg-foreground text-background hover:bg-foreground/90 font-medium"
              disabled={loading || success}
            >
              {loading ? (
                <span className="animate-pulse">{language === 'id' ? 'Memuat...' : 'Loading...'}</span>
              ) : success ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                language === 'id' ? 'DAFTAR' : 'SIGN UP'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-sm text-muted-foreground">
            {language === 'id' ? 'Sudah punya akun?' : 'Already have an account?'}{' '}
            <Link to="/login" className="font-medium text-foreground hover:underline">
              {language === 'id' ? 'Masuk' : 'Login'}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;