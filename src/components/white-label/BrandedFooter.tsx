'use client';

import { useWhiteLabel } from '@/lib/white-label/theme-provider';

export function BrandedFooter() {
  const { settings } = useWhiteLabel();

  if (settings?.removeBusinessFlowBranding) {
    return (
      <footer className="bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            © {new Date().getFullYear()} {settings.brandName}. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-50 py-8">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-600">
          © {new Date().getFullYear()} {settings?.brandName || 'BusinessFlow'}. All rights reserved.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Powered by BusinessFlow
        </p>
      </div>
    </footer>
  );
}