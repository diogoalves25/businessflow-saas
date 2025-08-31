'use client';

import { WhiteLabelProvider } from '@/lib/white-label/theme-provider';
import { BusinessProvider } from '@/src/contexts/BusinessContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BusinessProvider>
      <WhiteLabelProvider>
        {children}
      </WhiteLabelProvider>
    </BusinessProvider>
  );
}