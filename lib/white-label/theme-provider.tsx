'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface WhiteLabelTheme {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  businessName: string;
  customFont: string | null;
  customCss: string | null;
}

interface WhiteLabelContextValue {
  theme: WhiteLabelTheme | null;
  loading: boolean;
  error: Error | null;
  updateTheme: (theme: Partial<WhiteLabelTheme>) => Promise<void>;
}

const WhiteLabelContext = createContext<WhiteLabelContextValue | undefined>(undefined);

const defaultTheme: WhiteLabelTheme = {
  primaryColor: '#3b82f6',
  secondaryColor: '#1e293b',
  logoUrl: null,
  faviconUrl: null,
  businessName: 'BusinessFlow',
  customFont: null,
  customCss: null,
};

export function WhiteLabelProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<WhiteLabelTheme | null>(defaultTheme);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Load theme from API or localStorage
    const loadTheme = async () => {
      try {
        // In production, fetch from API
        const savedTheme = localStorage.getItem('whiteLabel');
        if (savedTheme) {
          setTheme(JSON.parse(savedTheme));
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTheme();
  }, []);

  const updateTheme = async (updates: Partial<WhiteLabelTheme>) => {
    try {
      const newTheme = { ...theme!, ...updates };
      setTheme(newTheme);
      localStorage.setItem('whiteLabel', JSON.stringify(newTheme));
      
      // Apply CSS variables
      if (newTheme.primaryColor) {
        document.documentElement.style.setProperty('--primary-color', newTheme.primaryColor);
      }
      if (newTheme.secondaryColor) {
        document.documentElement.style.setProperty('--secondary-color', newTheme.secondaryColor);
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return (
    <WhiteLabelContext.Provider value={{ theme, loading, error, updateTheme }}>
      {children}
    </WhiteLabelContext.Provider>
  );
}

export function useWhiteLabel() {
  const context = useContext(WhiteLabelContext);
  if (!context) {
    // Return a default implementation if no provider
    return {
      theme: defaultTheme,
      loading: false,
      error: null,
      updateTheme: async () => {},
    };
  }
  return context;
}