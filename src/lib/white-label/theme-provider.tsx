'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { useBusiness } from '@/src/contexts/BusinessContext';

interface WhiteLabelSettings {
  id: string;
  organizationId: string;
  customDomain?: string | null;
  brandName: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  primaryColor: string;
  secondaryColor: string;
  customCSS?: string | null;
  emailFromName?: string | null;
  emailFromAddress?: string | null;
  removeBusinessFlowBranding: boolean;
}

interface ThemeContextType {
  settings: WhiteLabelSettings | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const defaultSettings: WhiteLabelSettings = {
  id: 'default',
  organizationId: 'default',
  brandName: 'BusinessFlow',
  primaryColor: '#0066FF',
  secondaryColor: '#F3F4F6',
  removeBusinessFlowBranding: false,
};

const ThemeContext = createContext<ThemeContextType>({
  settings: defaultSettings,
  loading: false,
  refresh: async () => {},
});

export function useWhiteLabel() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useWhiteLabel must be used within a WhiteLabelProvider');
  }
  return context;
}

export function WhiteLabelProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<WhiteLabelSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Get user's organization from database
        const { data: dbUser } = await supabase
          .from('users')
          .select('organizationId')
          .eq('id', user.id)
          .single();
        
        setOrganizationId(dbUser?.organizationId || null);
      }
    };
    getUser();
  }, [supabase]);

  const fetchSettings = async () => {
    if (!organizationId) {
      setSettings(defaultSettings);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/white-label/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data || defaultSettings);
      } else {
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error fetching white label settings:', error);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [organizationId]);

  // Apply theme CSS variables
  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;
    
    // Convert hex to RGB for CSS variables
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const primaryRgb = hexToRgb(settings.primaryColor);
    const secondaryRgb = hexToRgb(settings.secondaryColor);

    if (primaryRgb) {
      root.style.setProperty('--primary', `${primaryRgb.r} ${primaryRgb.g} ${primaryRgb.b}`);
    }
    if (secondaryRgb) {
      root.style.setProperty('--secondary', `${secondaryRgb.r} ${secondaryRgb.g} ${secondaryRgb.b}`);
    }

    // Update favicon
    if (settings.faviconUrl) {
      const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (favicon) {
        favicon.href = settings.faviconUrl;
      } else {
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'icon';
        newFavicon.href = settings.faviconUrl;
        document.head.appendChild(newFavicon);
      }
    }

    // Apply custom CSS
    if (settings.customCSS) {
      const customStyleId = 'white-label-custom-css';
      let customStyle = document.getElementById(customStyleId);
      
      if (!customStyle) {
        customStyle = document.createElement('style');
        customStyle.id = customStyleId;
        document.head.appendChild(customStyle);
      }
      
      customStyle.textContent = settings.customCSS;
    }

    // Update page title
    if (settings.brandName !== 'BusinessFlow') {
      document.title = document.title.replace('BusinessFlow', settings.brandName);
    }

    return () => {
      // Cleanup custom CSS on unmount
      const customStyle = document.getElementById('white-label-custom-css');
      if (customStyle) {
        customStyle.remove();
      }
    };
  }, [settings]);

  const refresh = async () => {
    await fetchSettings();
  };

  return (
    <ThemeContext.Provider value={{ settings, loading, refresh }}>
      {children}
    </ThemeContext.Provider>
  );
}