'use client';

import { SessionProvider } from 'next-auth/react';
import { WhiteLabelProvider } from '@/lib/white-label/theme-provider';
import { BusinessProvider } from '@/src/contexts/BusinessContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <BusinessProvider>
        <WhiteLabelProvider>
          {children}
        </WhiteLabelProvider>
      </BusinessProvider>
    </SessionProvider>
  );
}