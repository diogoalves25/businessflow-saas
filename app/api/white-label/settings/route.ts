import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadToS3 } from '@/lib/s3';
import { canAccessFeature } from '@/lib/feature-gating';

// GET /api/white-label/settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.whiteLabelSettings.findUnique({
      where: {
        organizationId: session.user.organizationId,
      },
    });

    // Return default settings if none exist
    if (!settings) {
      return NextResponse.json({
        id: 'default',
        organizationId: session.user.organizationId,
        brandName: 'BusinessFlow',
        primaryColor: '#0066FF',
        secondaryColor: '#F3F4F6',
        removeBusinessFlowBranding: false,
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

// POST /api/white-label/settings
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has Premium access
    const organization = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { stripePriceId: true }
    });

    if (!canAccessFeature(organization?.stripePriceId || null, 'hasWhiteLabel')) {
      return NextResponse.json(
        { error: 'This feature requires a Premium subscription' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    
    // Extract form fields
    const brandName = formData.get('brandName') as string;
    const primaryColor = formData.get('primaryColor') as string;
    const secondaryColor = formData.get('secondaryColor') as string;
    const customDomain = formData.get('customDomain') as string;
    const emailFromName = formData.get('emailFromName') as string;
    const emailFromAddress = formData.get('emailFromAddress') as string;
    const customCSS = formData.get('customCSS') as string;
    const removeBusinessFlowBranding = formData.get('removeBusinessFlowBranding') === 'true';

    // Handle file uploads
    let logoUrl: string | undefined;
    let faviconUrl: string | undefined;

    const logoFile = formData.get('logo') as File;
    if (logoFile && logoFile.size > 0) {
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const key = `white-label/${session.user.organizationId}/logo-${Date.now()}.${logoFile.name.split('.').pop()}`;
      logoUrl = await uploadToS3(buffer, key, logoFile.type);
    }

    const faviconFile = formData.get('favicon') as File;
    if (faviconFile && faviconFile.size > 0) {
      const buffer = Buffer.from(await faviconFile.arrayBuffer());
      const key = `white-label/${session.user.organizationId}/favicon-${Date.now()}.${faviconFile.name.split('.').pop()}`;
      faviconUrl = await uploadToS3(buffer, key, faviconFile.type);
    }

    // Check if settings already exist
    const existingSettings = await prisma.whiteLabelSettings.findUnique({
      where: {
        organizationId: session.user.organizationId,
      },
    });

    const data = {
      brandName,
      primaryColor,
      secondaryColor,
      customDomain: customDomain || null,
      emailFromName: emailFromName || null,
      emailFromAddress: emailFromAddress || null,
      customCSS: customCSS || null,
      removeBusinessFlowBranding,
      ...(logoUrl && { logoUrl }),
      ...(faviconUrl && { faviconUrl }),
    };

    let settings;
    if (existingSettings) {
      // Update existing settings
      settings = await prisma.whiteLabelSettings.update({
        where: {
          id: existingSettings.id,
        },
        data,
      });
    } else {
      // Create new settings
      settings = await prisma.whiteLabelSettings.create({
        data: {
          ...data,
          organizationId: session.user.organizationId,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error saving white label settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}