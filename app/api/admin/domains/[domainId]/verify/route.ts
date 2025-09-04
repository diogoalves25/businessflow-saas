import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyDomain } from '@/lib/domains/dns-verification';
import { sslManager } from '@/lib/domains/ssl-manager';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ domainId: string }> }
) {
  const resolvedParams = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the domain from settings
    const settings = await prisma.whiteLabelSettings.findFirst({
      where: {
        id: resolvedParams.domainId,
        organizationId: session.user.organizationId,
      },
    });

    if (!settings || !settings.customDomain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    // Verify domain DNS records
    const verificationResult = await verifyDomain(
      settings.customDomain,
      session.user.organizationId
    );

    if (verificationResult.verified) {
      // Domain is verified, check SSL certificate
      const sslStatus = await sslManager.getCertificateStatus(settings.customDomain);
      
      // If SSL is not active, request a new certificate
      if (!sslStatus || sslStatus.status !== 'active') {
        await sslManager.requestCertificate(settings.customDomain);
      }
    }

    return NextResponse.json(verificationResult);
  } catch (error) {
    console.error('Error verifying domain:', error);
    return NextResponse.json(
      { error: 'Failed to verify domain' },
      { status: 500 }
    );
  }
}