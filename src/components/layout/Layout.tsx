// Layout.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { 
  LayoutDashboard, 
  Receipt, 
  Calendar, 
  FileText, 
  LogOut, 
  Moon, 
  Sun, 
  Globe, 
  DollarSign,
  Menu,
  X,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
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

// Social links data
const socialLinks = [
  { name: 'Telegram', icon: 'telegram', url: 'https://t.me/+MGzRobr9cp4yMTk1', color: 'bg-blue-500' },
  { name: 'X', icon: 'x', url: 'https://x.com/rinzx_', color: 'bg-slate-800' },
  { name: 'TikTok', icon: 'tiktok', url: 'https://www.tiktok.com/@rinzzx0', color: 'bg-pink-500' },
  { name: 'GitHub', icon: 'github', url: 'https://github.com/Rangger0', color: 'bg-slate-700' },
  { name: 'Email', icon: 'email', url: 'mailto:Allgazali011@gmail.com', color: 'bg-red-500' },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, currency, setCurrency } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: language === 'id' ? 'Dashboard' : 'Dashboard', icon: LayoutDashboard },
    { path: '/transactions', label: language === 'id' ? 'Transaksi' : 'Transactions', icon: Receipt },
    { path: '/calendar', label: language === 'id' ? 'Kalender' : 'Calendar', icon: Calendar },
    { path: '/reports', label: language === 'id' ? 'Laporan' : 'Reports', icon: FileText },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Simple SVG icons for social media
  const SocialIcon = ({ name }: { name: string }) => {
    switch (name) {
      case 'telegram':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
        );
      case 'x':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        );
      case 'tiktok':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
          </svg>
        );
      case 'github':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        );
      case 'email':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        );
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
       
      <header className={`
        sticky top-0 z-50 border-b backdrop-blur-lg
        ${theme === 'dark' 
          ? 'bg-black/80 border-slate-800' 
          : 'bg-white/80 border-slate-200'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Left: Logo & Title */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
              {/* Logo dengan background transparan */}
              <div className="relative w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-transparent">
                <img 
                  src="/logo.png" 
                  alt="Alpha Capital" 
                  className="w-8 h-8 object-contain relative z-10"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🚀</text></svg>';
                  }}
                />
              </div>
              <div className="hidden sm:block">
                <h1 className={`
                  font-bold text-lg leading-tight font-mono
                  ${theme === 'dark' ? 'text-amber-400' : 'text-amber-400'}
                `}>
                  Alpha Capital
                </h1>
                <p className={`text-xs font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>v1.0.0</p>
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className={`gap-2 font-mono ${theme === 'dark' ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-700'}`}>
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">{language === 'id' ? 'ID' : 'EN'}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={theme === 'dark' ? 'bg-slate-800 border-slate-800' : 'bg-white border-slate-200'}>
                <DropdownMenuItem onClick={() => setLanguage('id')} className={`font-mono ${theme === 'dark' ? 'text-amber-500 focus:bg-slate-800' : 'text-amber-600 focus:bg-slate-100'}`}>
                  🇮🇩 Indonesia
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')} className={`font-mono ${theme === 'dark' ? 'text-amber-500 focus:bg-slate-800' : 'text-amber-600 focus:bg-slate-100'}`}>
                  🇺🇸 English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Currency Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className={`gap-2 font-mono ${theme === 'dark' ? 'text-amber-400 hover:text-amber-400' : 'text-amber-600 hover:text-amber-500'}`}>
                  <DollarSign className="h-4 w-4" />
                  <span className="hidden sm:inline">{currency}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}>
                <DropdownMenuItem onClick={() => setCurrency('IDR')} className={`font-mono ${theme === 'dark' ? 'text-amber-400 focus:bg-slate-800' : 'text-amber-500 focus:bg-slate-100'}`}>
                  🇮🇩 IDR (Rp)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrency('USD')} className={`font-mono ${theme === 'dark' ? 'text-amber-400 focus:bg-slate-800' : 'text-amber-500 focus:bg-slate-100'}`}>
                  🇺🇸 USD ($)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className={theme === 'dark' ? 'text-amber-400 hover:text-amber-300' : 'text-amber-400 hover:text-amber-500'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Logout */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLogoutDialogOpen(true)}
              className={`gap-2 font-mono ${theme === 'dark' ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' : 'text-red-500 hover:text-red-600 hover:bg-red-50'}`}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">
                {language === 'id' ? 'Keluar' : 'Logout'}
              </span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Navigation Only */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 border-r transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${theme === 'dark' 
            ? 'bg-black border-slate-800' 
            : 'bg-white border-slate-200'}
        `}>
          {/* Mobile: Add padding top for header */}
          <div className="lg:hidden h-16" />
          
          <nav className="p-4 space-y-1">
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
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-sm transition-all
                    ${active
                      ? (theme === 'dark' 
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                        : 'bg-amber-500/10 text-amber-500 border border-amber-400/10')
                      : (theme === 'dark' 
                        ? 'text-slate-400 hover:bg-slate-900 hover:text-amber-400' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-amber-600')
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${active ? 'animate-pulse' : ''}`} />
                  {item.label}
                  {active && (
                    <div className={`
                      ml-auto w-2 h-2 rounded-full
                      ${theme === 'dark' ? 'bg-amber-400' : 'bg-amber-500'}
                    `} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile: Close button at bottom */}
          <div className="lg:hidden absolute bottom-4 left-4 right-4">
            <Button 
              variant="outline" 
              className={`w-full font-mono ${theme === 'dark' ? 'border-slate-700 text-amber-400 hover:bg-slate-900' : 'border-slate-200 text-amber-600 hover:bg-slate-100'}`}
              onClick={() => setSidebarOpen(false)}
            >
              {language === 'id' ? 'Tutup Menu' : 'Close Menu'}
            </Button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className={`
        border-t py-4 px-4 lg:px-6
        ${theme === 'dark' 
          ? 'bg-black border-slate-800' 
          : 'bg-white border-slate-200'}
      `}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-transparent">
              <span className={`
                font-mono font-bold text-lg
                ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}
              `}>
                &gt;_
              </span>
            </div>
            <span className={`font-bold text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Alpha Capital</span>
          </div>

          {/* Center: Powered by */}
          <div className={`text-xs font-mono text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            {language === 'id' ? 'Ditenagai oleh' : 'Powered by'}{' '}
            <span className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}>
              Rose Alpha
            </span>
          </div>

          {/* Right: Social Links */}
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  w-8 h-8 rounded-lg flex items-center justify-center transition-all
                  ${theme === 'dark' 
                    ? 'bg-slate-900 text-slate-400 hover:bg-amber-500/20 hover:text-amber-400' 
                    : 'bg-slate-100 text-slate-600 hover:bg-amber-500/10 hover:text-amber-600'}
                `}
                title={social.name}
              >
                <SocialIcon name={social.icon} />
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* Logout Dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent className={`
          ${theme === 'dark' 
            ? 'bg-black border-slate-800' 
            : 'bg-white border-slate-200'}
        `}>
          <AlertDialogHeader>
            <AlertDialogTitle className={`font-mono ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>
              {language === 'id' ? 'Konfirmasi Keluar' : 'Confirm Logout'}
            </AlertDialogTitle>
            <AlertDialogDescription className={`font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              {language === 'id' 
                ? 'Apakah Anda yakin ingin keluar dari aplikasi?' 
                : 'Are you sure you want to logout?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={`font-mono ${theme === 'dark' ? 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}`}>
              {language === 'id' ? 'Batal' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSignOut}
              className="bg-red-500 hover:bg-red-600 font-mono text-white"
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