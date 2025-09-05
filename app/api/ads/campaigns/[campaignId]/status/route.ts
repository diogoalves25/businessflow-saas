import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';
import { prisma } from '@/src/lib/prisma';
import { canAccessFeature } from '@/src/lib/feature-gating';
import { updateFacebookCampaignStatus } from '@/src/lib/ads/facebook';
import { updateGoogleCampaignStatus } from '@/src/lib/ads/google';
import { decrypt } from '@/src/lib/encryption';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const resolvedParams = await params;
  try {
    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's organization and check Premium access
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { organization: true }
    });

    if (!dbUser?.organization || dbUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'No organization found or not an admin' },
        { status: 404 }
      );
    }

    // Check if user has Premium plan
    if (!canAccessFeature(dbUser.organization.stripePriceId, 'hasAds')) {
      return NextResponse.json(
        { error: 'Ads management requires Premium plan' },
        { status: 403 }
      );
    }

    const { status } = await request.json();

    if (!status || !['active', 'paused'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Get campaign with ad account
    const campaign = await prisma.adCampaign.findFirst({
      where: {
        id: resolvedParams.campaignId,
        adAccount: {
          organizationId: dbUser.organization.id,
        },
      },
      include: {
        adAccount: true,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    if (campaign.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot update completed campaign' },
        { status: 400 }
      );
    }

    // Update on platform
    try {
      if (campaign.adAccount.platform === 'facebook') {
        await updateFacebookCampaignStatus(resolvedParams.campaignId, status);
      } else if (campaign.adAccount.platform === 'google') {
        await updateGoogleCampaignStatus(resolvedParams.campaignId, status);
      }
    } catch (platformError) {
      console.error('Platform update error:', platformError);
      // Continue to update local status even if platform update fails
    }

    // Update local status
    await prisma.adCampaign.update({
      where: { id: resolvedParams.campaignId },
      data: { status },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update campaign status error:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign status' },
      { status: 500 }
    );
  }
}