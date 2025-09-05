'use client';

import { createContext, useContext, ReactNode } from 'react';
import { BusinessTemplate, getBusinessTemplate } from '@/src/lib/business-templates';

// Simplified BusinessContext that doesn't fetch data
interface BusinessContextType {
  businessType: string;
  businessName: string;
  organizationId: string | null;
  template: BusinessTemplate;
  loading: boolean;
  error: string | null;
  refreshOrganization: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

function SimpleBusinessProvider({ children }: { children: ReactNode }) {
  const template = getBusinessTemplate('CLEANING');
  
  return (
    <BusinessContext.Provider 
      value={{
        businessType: 'CLEANING',
        businessName: 'BusinessFlow',
        organizationId: null,
        template,
        loading: false,
        error: null,
        refreshOrganization: async () => {},
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

// Simplified WhiteLabelProvider that doesn't fetch data
interface WhiteLabelSettings {
  id: string;
  organizationId: string;
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  removeBusinessFlowBranding: boolean;
}

interface ThemeContextType {
  settings: WhiteLabelSettings | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  settings: null,
  loading: false,
  refresh: async () => {},
});

function SimpleWhiteLabelProvider({ children }: { children: ReactNode }) {
  const defaultSettings: WhiteLabelSettings = {
    id: 'default',
    organizationId: 'default',
    brandName: 'BusinessFlow',
    primaryColor: '#0066FF',
    secondaryColor: '#F3F4F6',
    removeBusinessFlowBranding: false,
  };

  return (
    <ThemeContext.Provider value={{ settings: defaultSettings, loading: false, refresh: async () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SimpleBusinessProvider>
      <SimpleWhiteLabelProvider>
        {children}
      </SimpleWhiteLabelProvider>
    </SimpleBusinessProvider>
  );
}

// Export hooks to maintain compatibility
export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}

export function useWhiteLabel() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useWhiteLabel must be used within a WhiteLabelProvider');
  }
  return context;
}