'use client';

import { useWhiteLabel } from '@/lib/white-label/theme-provider';
import Image from 'next/image';

interface BrandedLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function BrandedLogo({ className = '', width = 150, height = 40 }: BrandedLogoProps) {
  const { theme } = useWhiteLabel();

  if (theme?.logoUrl) {
    return (
      <Image
        src={theme.logoUrl}
        alt={theme.brandName}
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
      {theme?.brandName || 'BusinessFlow'}
    </div>
  );
}