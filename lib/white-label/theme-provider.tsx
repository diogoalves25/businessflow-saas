'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface Theme {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  faviconUrl?: string;
  customCss?: string;
}

interface ThemeContextValue {
  theme: Theme;
  updateTheme: (updates: Partial<Theme>) => void;
  resetTheme: () => void;
}

const defaultTheme: Theme = {
  primaryColor: '#3b82f6',
  secondaryColor: '#10b981',
  logoUrl: undefined,
  faviconUrl: undefined,
  customCss: undefined,
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    // Load theme from API or localStorage
    const savedTheme = localStorage.getItem('organizationTheme');
    if (savedTheme) {
      try {
        setTheme(JSON.parse(savedTheme));
      } catch (e) {
        console.error('Failed to parse saved theme:', e);
      }
    }
  }, []);

  const updateTheme = (updates: Partial<Theme>) => {
    const newTheme = { ...theme, ...updates };
    setTheme(newTheme);
    localStorage.setItem('organizationTheme', JSON.stringify(newTheme));
    
    // Apply theme to CSS variables
    if (updates.primaryColor) {
      document.documentElement.style.setProperty('--primary', updates.primaryColor);
    }
    if (updates.secondaryColor) {
      document.documentElement.style.setProperty('--secondary', updates.secondaryColor);
    }
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
    localStorage.removeItem('organizationTheme');
    document.documentElement.style.removeProperty('--primary');
    document.documentElement.style.removeProperty('--secondary');
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}