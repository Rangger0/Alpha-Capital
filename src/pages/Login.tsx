import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Github, Twitter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// TikTok Icon Component
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Social Links Component
const SocialLinks = () => (
  <div className="mt-8 pt-6 border-t border-border/30">
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs text-muted-foreground">Ikuti Kami</p>
      <div className="flex items-center justify-center gap-3">
        <a 
          href="https://github.com/Rangger0" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
          aria-label="GitHub"
        >
          <Github className="w-4 h-4" />
        </a>
        <a 
          href="https://x.com/rinzx_" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
          aria-label="X (Twitter)"
        >
          <Twitter className="w-4 h-4" />
        </a>
        <a 
          href="https://www.tiktok.com/@rinzzx0" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
          aria-label="TikTok"
        >
          <TikTokIcon />
        </a>
        <a 
          href="mailto:Allgazali011@gmail.com"
          className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
          aria-label="Email"
        >
          <Mail className="w-4 h-4" />
        </a>
      </div>
    </div>
  </div>
);

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError('Email atau password salah');
      } else {
        navigate('/dashboard');
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    const { error } = await resetPassword(resetEmail);
    if (!error) {
      setResetSent(true);
    }
  };

  return (

  <div className="min-h-screen flex items-center justify-center p-4 bg-background">
    <div className="w-full max-w-md">
      <div className="flex justify-center mb-8">
        <img src="/logo.png" alt="Alpha Capital" className="h-16 w-auto" />
      </div>  

      <Card className="border-border/50 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Masuk</CardTitle>
          <CardDescription className="text-center">
            Masukkan email dan password Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
             
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
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

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setResetDialogOpen(true)}
                className="text-sm text-primary hover:underline"
              >
                Lupa password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                'Memuat...'
              ) : (
                <>
                  Masuk
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Belum punya akun?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Daftar sekarang
            </Link>
          </div>

          {/* Social Links - TAMBAHAN */}
          <SocialLinks />
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Alpha Capital © 2026 • Powered by Rose Alpha
      </p>

      {/* Dialog dipindahkan ke dalam wrapper utama */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Masukkan email Anda untuk menerima link reset password.
            </DialogDescription>
          </DialogHeader>

          {resetSent ? (
            <Alert className="mt-4">
              <AlertDescription>
                Link reset password telah dikirim ke email Anda.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="nama@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setResetDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">Kirim Link</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </div>  // ← Penutup wrapper utama
  );  // ← Penutup return
};  // ← Penutup komponen Login

export default Login;