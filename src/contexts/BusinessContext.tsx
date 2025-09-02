'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { BusinessTemplate, getBusinessTemplate } from '@/src/lib/business-templates';
import { createClient } from '@/src/lib/supabase/client';

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

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [businessType, setBusinessType] = useState<string>('');
  const [businessName, setBusinessName] = useState<string>('');
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setBusinessType('');
        setBusinessName('');
        setOrganizationId(null);
        return;
      }

      // Fetch user's organization
      const response = await fetch(`/api/users/${user.id}/organization`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // User has no organization yet
          setBusinessType('');
          setBusinessName('');
          setOrganizationId(null);
        } else {
          throw new Error('Failed to fetch organization');
        }
        return;
      }

      const org = await response.json();
      setBusinessType(org.businessType || '');
      setBusinessName(org.name || '');
      setOrganizationId(org.id);
      
    } catch (err) {
      console.error('Error fetching organization:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setBusinessType('');
      setBusinessName('');
      setOrganizationId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganization();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchOrganization();
      } else if (event === 'SIGNED_OUT') {
        setBusinessType('');
        setBusinessName('');
        setOrganizationId(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const template = getBusinessTemplate(businessType || 'CLEANING');

  return (
    <BusinessContext.Provider 
      value={{
        businessType,
        businessName,
        organizationId,
        template,
        loading,
        error,
        refreshOrganization: fetchOrganization,
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