import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { domainId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the domain belongs to the user's organization
    const settings = await prisma.whiteLabelSettings.findFirst({
      where: {
        id: params.domainId,
        organizationId: session.user.organizationId,
      },
    });

    if (!settings) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    // Remove custom domain from settings
    await prisma.whiteLabelSettings.update({
      where: { id: settings.id },
      data: { customDomain: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting domain:', error);
    return NextResponse.json(
      { error: 'Failed to delete domain' },
      { status: 500 }
    );
  }
}