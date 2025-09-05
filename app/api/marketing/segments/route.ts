import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { canAccessFeature } from '@/src/lib/feature-gating';
import { PREDEFINED_SEGMENTS, getSegmentSize } from '@/lib/marketing/segmentation';

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

    const organization = dbUser.organization;

    // Check Premium access
    if (!canAccessFeature(organization.stripePriceId || null, 'hasMarketingTools')) {
      return NextResponse.json({ error: 'Marketing features require Premium plan' }, { status: 403 });
    }

    // Get predefined segments with sizes
    const segments = await Promise.all(
      Object.entries(PREDEFINED_SEGMENTS).map(async ([id, segment]) => {
        const size = await getSegmentSize(organization.id, segment);
        return {
          id,
          name: segment.name,
          description: getSegmentDescription(id),
          size,
          isPredefined: true,
        };
      })
    );

    // TODO: Add custom segments from database

    return NextResponse.json({ segments });
  } catch (error) {
    console.error('Get segments error:', error);
    return NextResponse.json({ error: 'Failed to fetch segments' }, { status: 500 });
  }
}

function getSegmentDescription(segmentId: string): string {
  const descriptions: Record<string, string> = {
    active_customers: 'Customers who have booked in the last 30 days',
    lapsed_customers: 'Customers who haven\'t booked in 60-180 days',
    new_customers: 'Customers who joined in the last 7 days',
    high_value: 'Customers who have spent over $500',
    email_only: 'Customers who prefer email communication',
    sms_only: 'Customers who prefer SMS communication',
  };
  
  return descriptions[segmentId] || 'Custom segment';
}