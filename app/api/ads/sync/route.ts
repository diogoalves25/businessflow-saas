import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';
import { prisma } from '@/src/lib/prisma';
import { canAccessFeature } from '@/src/lib/feature-gating';
import { syncFacebookCampaigns } from '@/src/lib/ads/facebook';
import { syncGoogleCampaigns } from '@/src/lib/ads/google';

export async function POST(request: NextRequest) {
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

    // Get all active ad accounts
    const adAccounts = await prisma.adAccount.findMany({
      where: {
        organizationId: dbUser.organization.id,
        isActive: true,
      },
    });

    const syncResults = {
      facebook: { success: 0, failed: 0 },
      google: { success: 0, failed: 0 },
    };

    // Sync campaigns for each account
    for (const account of adAccounts) {
      try {
        if (account.platform === 'facebook') {
          await syncFacebookCampaigns(account.id);
          syncResults.facebook.success++;
        } else if (account.platform === 'google') {
          await syncGoogleCampaigns(account.id);
          syncResults.google.success++;
        }
      } catch (error) {
        console.error(`Sync failed for account ${account.id}:`, error);
        if (account.platform === 'facebook') {
          syncResults.facebook.failed++;
        } else {
          syncResults.google.failed++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      results: syncResults,
    });
  } catch (error) {
    console.error('Sync campaigns error:', error);
    return NextResponse.json(
      { error: 'Failed to sync campaigns' },
      { status: 500 }
    );
  }
}