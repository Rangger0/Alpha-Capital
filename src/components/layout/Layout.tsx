import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  CalendarDays,
  FileText,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface LayoutProps {
  children: React.ReactNode;
}
// Animated Logo Component - Versi Simpel
const AnimatedLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };
  
  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl'
  };

  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      {/* Logo dengan animasi simpel */}
      <div className="relative">
        {/* Glow halus saat hover */}
        <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Logo PNG */}
        <img 
          src="/logo.png" 
          alt="Alpha Capital" 
          className={`${sizeClasses[size]} relative z-10 transform group-hover:scale-105 transition-transform duration-300 drop-shadow-lg`}
        />
      </div>
      
      {/* Text */}
      <div className="flex flex-col">
        <span className={`font-bold ${textSizes[size]} group-hover:text-amber-500 transition-colors duration-300`}>
          Alpha Capital
        </span>
      </div>
    </div>
  );
};
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/transactions', label: 'Transaksi', icon: Wallet },
    { path: '/calendar', label: 'Kalender', icon: CalendarDays },
    { path: '/reports', label: 'Laporan', icon: FileText },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo dengan Animasi */}
          <div className="p-6 border-b border-border">
            <div onClick={() => navigate('/dashboard')}>
              <AnimatedLogo size="md" />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    active
                      ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md shadow-primary/20'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                    active ? 'bg-white/20' : 'bg-muted group-hover:bg-background'
                  }`}>
                    <Icon className={`h-4 w-4 ${active ? 'animate-pulse' : ''}`} />
                  </div>
                  <span className="font-medium">{item.label}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-all duration-200 text-muted-foreground hover:text-foreground group"
            >
              <div className="p-1.5 rounded-lg bg-muted group-hover:bg-background transition-colors">
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </div>
              <span>{theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}</span>
            </button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-muted transition-all duration-200 group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20 group-hover:border-primary/40 transition-colors">
                      <span className="text-sm font-bold text-primary">
                        {user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm truncate text-muted-foreground group-hover:text-foreground transition-colors">{user?.email}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setLogoutDialogOpen(true)} className="text-red-500 focus:text-red-500 focus:bg-red-50">
                  <LogOut className="h-4 w-4 mr-2" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-30">
          <AnimatedLogo size="sm" />
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="hover:bg-muted">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Logout Dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent className="border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Keluar</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin keluar dari aplikasi?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-red-500 hover:bg-red-600">
              Keluar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Layout;