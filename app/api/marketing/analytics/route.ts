import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { canAccessFeature } from '@/lib/feature-gating';
import {
  getCampaignMetrics,
  getContactMetrics,
  getEngagementTimeline,
  getSegmentPerformance,
  getTopCampaigns,
} from '@/lib/marketing/analytics';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: { organization: true }
    });

    if (!dbUser?.organization) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    // Check Premium access
    if (!canAccessFeature(dbUser.organization.stripePriceId, 'hasMarketing')) {
      return NextResponse.json({ error: 'Marketing features require Premium plan' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const campaignId = searchParams.get('campaignId');
    const days = parseInt(searchParams.get('days') || '30');

    switch (type) {
      case 'campaign':
        if (!campaignId) {
          return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 });
        }
        
        // Verify campaign belongs to organization
        const campaign = await prisma.marketingCampaign.findFirst({
          where: {
            id: campaignId,
            organizationId: dbUser.organization.id,
          },
        });
        
        if (!campaign) {
          return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }
        
        const campaignMetrics = await getCampaignMetrics(campaignId);
        return NextResponse.json({ metrics: campaignMetrics });

      case 'contacts':
        const contactMetrics = await getContactMetrics(dbUser.organization.id);
        return NextResponse.json({ metrics: contactMetrics });

      case 'timeline':
        const timeline = await getEngagementTimeline(dbUser.organization.id, days);
        return NextResponse.json({ timeline });

      case 'segments':
        const segmentPerformance = await getSegmentPerformance(dbUser.organization.id);
        return NextResponse.json({ segments: segmentPerformance });

      case 'top-campaigns':
        const metric = searchParams.get('metric') as 'opens' | 'clicks' | 'revenue' || 'revenue';
        const limit = parseInt(searchParams.get('limit') || '5');
        const topCampaigns = await getTopCampaigns(dbUser.organization.id, metric, limit);
        return NextResponse.json({ campaigns: topCampaigns });

      default:
        // Return overview analytics
        const [contactsOverview, timelineOverview, segmentsOverview, campaignsOverview] = await Promise.all([
          getContactMetrics(dbUser.organization.id),
          getEngagementTimeline(dbUser.organization.id, 7),
          getSegmentPerformance(dbUser.organization.id),
          getTopCampaigns(dbUser.organization.id, 'revenue', 3),
        ]);

        return NextResponse.json({
          contacts: contactsOverview,
          timeline: timelineOverview,
          segments: segmentsOverview,
          topCampaigns: campaignsOverview,
        });
    }
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}