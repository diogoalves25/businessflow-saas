import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { verifyDomain, checkDomainAvailability, generateDnsInstructions } from '@/lib/domains/dns-verification';
import { sslManager } from '@/lib/domains/ssl-manager';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has premium subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (user?.subscription?.plan !== 'premium') {
      return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 });
    }

    // Get white label settings with custom domains
    const settings = await prisma.whiteLabelSettings.findUnique({
      where: { organizationId: session.user.organizationId },
    });

    if (!settings?.customDomain) {
      return NextResponse.json([]);
    }

    // In a production app, you'd store domains in a separate table
    // For now, we'll return the single custom domain from settings
    const domain = {
      id: settings.id,
      domain: settings.customDomain,
      status: 'active', // Simplified for demo
      verifiedAt: settings.updatedAt.toISOString(),
      sslStatus: 'active',
      cnameVerified: true,
      txtVerified: true,
    };

    return NextResponse.json([domain]);
  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json(
      { error: 'Failed to fetch domains' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check premium subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (user?.subscription?.plan !== 'premium') {
      return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 });
    }

    const { domain } = await request.json();

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Validate domain format
    const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i;
    if (!domainRegex.test(domain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
    }

    // Check if domain is available
    const isAvailable = await checkDomainAvailability(domain);
    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Domain is already in use' },
        { status: 400 }
      );
    }

    // Update white label settings with custom domain
    const settings = await prisma.whiteLabelSettings.upsert({
      where: { organizationId: session.user.organizationId },
      update: { customDomain: domain },
      create: {
        organizationId: session.user.organizationId,
        brandName: 'My Business',
        customDomain: domain,
      },
    });

    // Request SSL certificate
    await sslManager.requestCertificate(domain);

    // Generate DNS instructions
    const dnsInstructions = generateDnsInstructions(domain, session.user.organizationId);

    return NextResponse.json({
      id: settings.id,
      domain,
      status: 'pending',
      cnameVerified: false,
      txtVerified: false,
      sslStatus: 'pending',
      dnsInstructions,
    });
  } catch (error) {
    console.error('Error adding domain:', error);
    return NextResponse.json(
      { error: 'Failed to add domain' },
      { status: 500 }
    );
  }
}