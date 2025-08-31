import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';
import { prisma } from '@/src/lib/prisma';
import { canAccessFeature } from '@/src/lib/feature-gating';

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

    const campaigns = await prisma.marketingCampaign.findMany({
      where: { organizationId: dbUser.organization.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { activities: true }
        }
      }
    });

    // Format campaigns with stats
    const formattedCampaigns = campaigns.map(campaign => ({
      ...campaign,
      stats: campaign.stats || {
        sent: campaign._count.activities,
        opens: 0,
        clicks: 0,
        revenue: 0
      }
    }));

    return NextResponse.json({ campaigns: formattedCampaigns });
  } catch (error) {
    console.error('Get campaigns error:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, type, targetAudience, content, scheduledFor } = body;

    if (!name || !type || !targetAudience || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const campaign = await prisma.marketingCampaign.create({
      data: {
        organizationId: dbUser.organization.id,
        name,
        type,
        status: scheduledFor ? 'scheduled' : 'draft',
        targetAudience,
        content,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      }
    });

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Create campaign error:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}