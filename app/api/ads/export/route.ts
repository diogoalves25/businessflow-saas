import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';
import { prisma } from '@/src/lib/prisma';
import { canAccessFeature } from '@/src/lib/feature-gating';
import { startOfMonth, endOfMonth, subDays, startOfDay, endOfDay } from 'date-fns';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

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

    const { dateRange, platform } = await request.json();

    // Calculate date range
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

    // Build where clause
    const where: any = {
      adAccount: {
        organizationId: dbUser.organization.id,
      },
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (platform && platform !== 'all') {
      where.adAccount.platform = platform;
    }

    // Get campaigns
    const campaigns = await prisma.adCampaign.findMany({
      where,
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

    // Prepare CSV data
    const csvData = campaigns.map(campaign => ({
      'Campaign Name': campaign.name,
      'Platform': campaign.adAccount.platform === 'facebook' ? 'Facebook' : 'Google',
      'Account': campaign.adAccount.accountName,
      'Status': campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1),
      'Budget': `$${campaign.budget.toFixed(2)}`,
      'Spent': `$${campaign.spent.toFixed(2)}`,
      'Impressions': campaign.impressions.toLocaleString(),
      'Clicks': campaign.clicks.toLocaleString(),
      'CTR': `${campaign.impressions > 0 ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) : '0.00'}%`,
      'CPC': `$${campaign.clicks > 0 ? (campaign.spent / campaign.clicks).toFixed(2) : '0.00'}`,
      'Conversions': campaign.conversions.toLocaleString(),
      'Conversion Rate': `${campaign.clicks > 0 ? ((campaign.conversions / campaign.clicks) * 100).toFixed(2) : '0.00'}%`,
      'ROAS': `${campaign.spent > 0 ? ((campaign.conversions * 50) / campaign.spent).toFixed(2) : '0.00'}x`,
      'Start Date': campaign.startDate.toLocaleDateString(),
      'End Date': campaign.endDate ? campaign.endDate.toLocaleDateString() : 'Ongoing',
    }));

    // Convert to CSV
    const csv = stringify(csvData, {
      header: true,
    });

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="ads-report-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export report error:', error);
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    );
  }
}