import { useState, useEffect } from 'react';

export interface Service {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  duration: number;
  icon?: string;
  organizationId: string;
}

export function useServicesAPI(organizationId?: string) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    const fetchServices = async () => {
      try {
        const response = await fetch(`/api/services?organizationId=${organizationId}`);
        if (!response.ok) throw new Error('Failed to fetch services');
        
        const data = await response.json();
        setServices(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [organizationId]);

  return { services, loading, error };
}