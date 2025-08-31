import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';
import { prisma } from '@/src/lib/prisma';
import { canAccessFeature } from '@/src/lib/feature-gating';
import { startOfMonth, endOfMonth, subDays, startOfDay, endOfDay } from 'date-fns';

export async function GET(request: NextRequest) {
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
    const membership = await prisma.userOrganization.findFirst({
      where: { 
        userId: user.id,
        user: { role: 'admin' }
      },
      include: { organization: true }
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'No organization found or not an admin' },
        { status: 404 }
      );
    }

    // Check if user has Premium plan
    if (!canAccessFeature(membership.organization.stripePriceId, 'hasAds')) {
      return NextResponse.json(
        { error: 'Ads management requires Premium plan' },
        { status: 403 }
      );
    }

    // Get date range from query params
    const searchParams = request.nextUrl.searchParams;
    const dateRange = searchParams.get('dateRange') || 'last_30_days';
    
    let startDate: Date;
    let endDate: Date = endOfDay(new Date());
    
    switch (dateRange) {
      case 'last_7_days':
        startDate = startOfDay(subDays(new Date(), 7));
        break;
      case 'last_30_days':
        startDate = startOfDay(subDays(new Date(), 30));
        break;
      case 'last_90_days':
        startDate = startOfDay(subDays(new Date(), 90));
        break;
      case 'this_month':
        startDate = startOfMonth(new Date());
        break;
      case 'last_month':
        startDate = startOfMonth(subDays(new Date(), 30));
        endDate = endOfMonth(subDays(new Date(), 30));
        break;
      default:
        startDate = startOfDay(subDays(new Date(), 30));
    }

    // Get all campaigns for the organization with ad account info
    const campaigns = await prisma.adCampaign.findMany({
      where: {
        adAccount: {
          organizationId: membership.organization.id,
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        adAccount: {
          select: {
            platform: true,
            accountName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate metrics
    const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
    const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);

    // Get previous period for comparison
    const periodLength = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodLength);
    const prevEndDate = new Date(endDate.getTime() - periodLength);

    const prevCampaigns = await prisma.adCampaign.findMany({
      where: {
        adAccount: {
          organizationId: membership.organization.id,
        },
        createdAt: {
          gte: prevStartDate,
          lte: prevEndDate,
        },
      },
    });

    const prevTotalSpent = prevCampaigns.reduce((sum, c) => sum + c.spent, 0);
    const prevTotalImpressions = prevCampaigns.reduce((sum, c) => sum + c.impressions, 0);
    const prevTotalClicks = prevCampaigns.reduce((sum, c) => sum + c.clicks, 0);
    const prevTotalConversions = prevCampaigns.reduce((sum, c) => sum + c.conversions, 0);

    // Calculate changes
    const spentChange = prevTotalSpent > 0 ? ((totalSpent - prevTotalSpent) / prevTotalSpent) * 100 : 0;
    const impressionsChange = prevTotalImpressions > 0 ? ((totalImpressions - prevTotalImpressions) / prevTotalImpressions) * 100 : 0;
    const clicksChange = prevTotalClicks > 0 ? ((totalClicks - prevTotalClicks) / prevTotalClicks) * 100 : 0;
    const conversionsChange = prevTotalConversions > 0 ? ((totalConversions - prevTotalConversions) / prevTotalConversions) * 100 : 0;

    // Calculate averages
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgCpc = totalClicks > 0 ? totalSpent / totalClicks : 0;
    const avgRoas = totalSpent > 0 ? (totalConversions * 50) / totalSpent : 0; // Assuming $50 avg order value

    // Transform campaigns data
    const transformedCampaigns = campaigns.map(campaign => ({
      id: campaign.id,
      platformId: campaign.platformId,
      name: campaign.name,
      status: campaign.status,
      budget: campaign.budget,
      spent: campaign.spent,
      impressions: campaign.impressions,
      clicks: campaign.clicks,
      conversions: campaign.conversions,
      ctr: campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0,
      cpc: campaign.clicks > 0 ? campaign.spent / campaign.clicks : 0,
      roas: campaign.spent > 0 ? (campaign.conversions * 50) / campaign.spent : 0,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      platform: campaign.adAccount.platform,
    }));

    return NextResponse.json({
      campaigns: transformedCampaigns,
      metrics: {
        totalSpent,
        totalImpressions,
        totalClicks,
        totalConversions,
        avgCtr,
        avgCpc,
        avgRoas,
        spentChange,
        impressionsChange,
        clicksChange,
        conversionsChange,
      },
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

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
    const membership = await prisma.userOrganization.findFirst({
      where: { 
        userId: user.id,
        user: { role: 'admin' }
      },
      include: { organization: true }
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'No organization found or not an admin' },
        { status: 404 }
      );
    }

    // Check if user has Premium plan
    if (!canAccessFeature(membership.organization.stripePriceId, 'hasAds')) {
      return NextResponse.json(
        { error: 'Ads management requires Premium plan' },
        { status: 403 }
      );
    }

    const { adAccountId, name, budget, startDate, endDate, platform } = await request.json();

    if (!adAccountId || !name || !budget || !startDate || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify ad account belongs to organization
    const adAccount = await prisma.adAccount.findFirst({
      where: {
        id: adAccountId,
        organizationId: membership.organization.id,
        isActive: true,
      },
    });

    if (!adAccount) {
      return NextResponse.json(
        { error: 'Ad account not found' },
        { status: 404 }
      );
    }

    // In production, this would create the campaign on the platform
    // For now, we'll create a placeholder
    const campaign = await prisma.adCampaign.create({
      data: {
        adAccountId,
        platformId: `${platform}_${Date.now()}`, // Placeholder ID
        name,
        status: 'active',
        budget,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Create campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}