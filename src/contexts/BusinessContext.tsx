'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { BusinessTemplate, getBusinessTemplate } from '@/src/lib/business-templates';

interface BusinessContextType {
  businessType: string;
  businessName: string;
  template: BusinessTemplate;
  setBusinessType: (type: string) => void;
  setBusinessName: (name: string) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [businessType, setBusinessType] = useState<string>('CLEANING');
  const [businessName, setBusinessName] = useState<string>('My Business');

  useEffect(() => {
    // Load from localStorage on mount
    const savedType = localStorage.getItem('businessType');
    const savedName = localStorage.getItem('businessName');
    
    if (savedType) setBusinessType(savedType);
    if (savedName) setBusinessName(savedName);
  }, []);

  const template = getBusinessTemplate(businessType);

  const updateBusinessType = (type: string) => {
    setBusinessType(type);
    localStorage.setItem('businessType', type);
  };

  const updateBusinessName = (name: string) => {
    setBusinessName(name);
    localStorage.setItem('businessName', name);
  };

  return (
    <BusinessContext.Provider 
      value={{
        businessType,
        businessName,
        template,
        setBusinessType: updateBusinessType,
        setBusinessName: updateBusinessName,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}