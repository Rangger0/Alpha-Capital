import { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved || (systemDark ? 'dark' : 'light');
    setThemeState(initial);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const css = document.createElement('style');
    css.textContent = `* { transition: none !important; }`;
    document.head.appendChild(css);
    
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
    
    setTimeout(() => {
      document.head.removeChild(css);
    }, 10);
  }, []);

  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    const css = document.createElement('style');
    css.textContent = `* { transition: none !important; }`;
    document.head.appendChild(css);
    
    setThemeState(newTheme);
    
    setTimeout(() => {
      document.head.removeChild(css);
    }, 10);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};