import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    const settings = await prisma.whiteLabelSettings.findUnique({
      where: {
        organizationId,
      },
      select: {
        brandName: true,
        logoUrl: true,
        primaryColor: true,
        secondaryColor: true,
      },
    });

    // Return default settings if none exist
    if (!settings) {
      return NextResponse.json({
        brandName: 'BusinessFlow',
        primaryColor: '#0066FF',
        secondaryColor: '#F3F4F6',
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching white label settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}