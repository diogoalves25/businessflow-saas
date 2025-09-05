'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  subscriptionTier: 'free' | 'basic' | 'professional' | 'enterprise';
  stripePriceId?: string | null;
  features: string[];
  settings?: Record<string, any>;
}

interface OrganizationState {
  organization: Organization | null;
  loading: boolean;
  error: Error | null;
}

export function useOrganization() {
  const { user } = useAuth();
  const [orgState, setOrgState] = useState<OrganizationState>({
    organization: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchOrganization = async () => {
      if (!user?.organizationId) {
        setOrgState({
          organization: null,
          loading: false,
          error: null,
        });
        return;
      }

      try {
        const response = await fetch(`/api/organizations/${user.organizationId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch organization');
        }

        const data = await response.json();
        setOrgState({
          organization: data,
          loading: false,
          error: null,
        });
      } catch (error) {
        setOrgState({
          organization: null,
          loading: false,
          error: error as Error,
        });
      }
    };

    fetchOrganization();
  }, [user?.organizationId]);

  const updateOrganization = async (updates: Partial<Organization>) => {
    if (!orgState.organization) return;

    try {
      const response = await fetch(`/api/organizations/${orgState.organization.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update organization');
      }

      const updatedOrg = await response.json();
      setOrgState({
        organization: updatedOrg,
        loading: false,
        error: null,
      });

      return updatedOrg;
    } catch (error) {
      setOrgState(prev => ({
        ...prev,
        error: error as Error,
      }));
      throw error;
    }
  };

  return {
    organization: orgState.organization,
    loading: orgState.loading,
    error: orgState.error,
    updateOrganization,
    isEnterprise: orgState.organization?.subscriptionTier === 'enterprise',
    isProfessional: orgState.organization?.subscriptionTier === 'professional' ||
                    orgState.organization?.subscriptionTier === 'enterprise',
  };
}