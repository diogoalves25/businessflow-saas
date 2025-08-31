'use client';

import { useWhiteLabel } from '@/lib/white-label/theme-provider';
import Image from 'next/image';

interface BrandedLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function BrandedLogo({ className = '', width = 150, height = 40 }: BrandedLogoProps) {
  const { settings } = useWhiteLabel();

  if (settings?.logoUrl) {
    return (
      <Image
        src={settings.logoUrl}
        alt={settings.brandName}
        width={width}
        height={height}
        className={className}
        style={{ objectFit: 'contain' }}
      />
    );
  }

  // Default BusinessFlow logo
  return (
    <div className={`text-2xl font-bold text-primary ${className}`}>
      {settings?.brandName || 'BusinessFlow'}
    </div>
  );
}