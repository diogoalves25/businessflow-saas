'use client';

import { WhiteLabelProvider } from '@/src/lib/white-label/theme-provider';
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