import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json({ error: 'Domain required' }, { status: 400 });
    }

    // Find organization by custom domain
    const settings = await prisma.whiteLabelSettings.findFirst({
      where: {
        customDomain: domain,
      },
      include: {
        organization: true,
      },
    });

    if (!settings) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({
      organizationId: settings.organizationId,
      organizationName: settings.organization.name,
    });
  } catch (error) {
    console.error('Error fetching organization by domain:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}