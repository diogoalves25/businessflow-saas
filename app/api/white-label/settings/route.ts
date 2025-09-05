import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { uploadToS3 } from '@/lib/s3';
import { canAccessFeature } from '@/src/lib/feature-gating';

// GET /api/white-label/settings
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { organization: true }
    });

    if (!dbUser?.organization) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    const settings = await prisma.whiteLabelSettings.findUnique({
      where: {
        organizationId: dbUser.organization.id,
      },
    });

    // Return default settings if none exist
    if (!settings) {
      return NextResponse.json({
        id: 'default',
        organizationId: dbUser.organization.id,
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { organization: true }
    });

    if (!dbUser?.organization) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    // Check if user has Premium access
    if (!canAccessFeature(dbUser.organization.stripePriceId || null, 'hasWhiteLabel')) {
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
      const key = `white-label/${dbUser.organization.id}/logo-${Date.now()}.${logoFile.name.split('.').pop()}`;
      const result = await uploadToS3(key, buffer, logoFile.type);
      logoUrl = result.url;
    }

    const faviconFile = formData.get('favicon') as File;
    if (faviconFile && faviconFile.size > 0) {
      const buffer = Buffer.from(await faviconFile.arrayBuffer());
      const key = `white-label/${dbUser.organization.id}/favicon-${Date.now()}.${faviconFile.name.split('.').pop()}`;
      const result = await uploadToS3(key, buffer, faviconFile.type);
      faviconUrl = result.url;
    }

    // Check if settings already exist
    const existingSettings = await prisma.whiteLabelSettings.findUnique({
      where: {
        organizationId: dbUser.organization.id,
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
          organizationId: dbUser.organization.id,
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