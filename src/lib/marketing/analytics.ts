import { prisma } from '../prisma';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  opens: number;
  clicks: number;
  unsubscribes: number;
  conversions: number;
  revenue: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

export interface ContactMetrics {
  totalContacts: number;
  activeContacts: number;
  emailOptIns: number;
  smsOptIns: number;
  growthRate: number;
  churnRate: number;
  averageLifetimeValue: number;
}

// Get campaign performance metrics
export async function getCampaignMetrics(campaignId: string): Promise<CampaignMetrics> {
  const activities = await prisma.campaignActivity.findMany({
    where: { campaignId },
  });

  const sent = activities.filter(a => a.type === 'sent').length;
  const delivered = activities.filter(a => a.type === 'delivered').length;
  const opens = activities.filter(a => a.type === 'opened').length;
  const clicks = activities.filter(a => a.type === 'clicked').length;
  const unsubscribes = activities.filter(a => a.type === 'unsubscribed').length;
  const conversions = activities.filter(a => a.type === 'converted').length;
  
  // Calculate revenue from conversions
  const revenue = activities
    .filter(a => a.type === 'converted' && a.metadata?.value)
    .reduce((sum, a) => sum + (a.metadata?.value || 0), 0);

  return {
    sent,
    delivered: delivered || sent, // Fallback to sent if no delivery tracking
    opens,
    clicks,
    unsubscribes,
    conversions,
    revenue,
    openRate: sent > 0 ? (opens / sent) * 100 : 0,
    clickRate: opens > 0 ? (clicks / opens) * 100 : 0,
    conversionRate: sent > 0 ? (conversions / sent) * 100 : 0,
  };
}

// Get overall contact metrics
export async function getContactMetrics(organizationId: string): Promise<ContactMetrics> {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);

  // Total contacts
  const totalContacts = await prisma.marketingContact.count({
    where: { organizationId },
  });

  // Active contacts (engaged in last 30 days)
  const activeContacts = await prisma.marketingContact.count({
    where: {
      organizationId,
      OR: [
        { lastBooking: { gte: thirtyDaysAgo } },
        {
          activities: {
            some: {
              createdAt: { gte: thirtyDaysAgo },
              type: { in: ['opened', 'clicked'] },
            },
          },
        },
      ],
    },
  });

  // Opt-in counts
  const emailOptIns = await prisma.marketingContact.count({
    where: { organizationId, emailOptIn: true },
  });

  const smsOptIns = await prisma.marketingContact.count({
    where: { organizationId, smsOptIn: true },
  });

  // Growth rate (new contacts in last 30 days)
  const newContacts = await prisma.marketingContact.count({
    where: {
      organizationId,
      createdAt: { gte: thirtyDaysAgo },
    },
  });

  const growthRate = totalContacts > 0 ? (newContacts / totalContacts) * 100 : 0;

  // Churn rate (unsubscribed in last 30 days)
  const unsubscribed = await prisma.marketingContact.count({
    where: {
      organizationId,
      subscribed: false,
      updatedAt: { gte: thirtyDaysAgo },
    },
  });

  const churnRate = totalContacts > 0 ? (unsubscribed / totalContacts) * 100 : 0;

  // Average lifetime value
  const contactsWithSpend = await prisma.marketingContact.findMany({
    where: { organizationId, totalSpent: { gt: 0 } },
    select: { totalSpent: true },
  });

  const averageLifetimeValue = contactsWithSpend.length > 0
    ? contactsWithSpend.reduce((sum, c) => sum + c.totalSpent, 0) / contactsWithSpend.length
    : 0;

  return {
    totalContacts,
    activeContacts,
    emailOptIns,
    smsOptIns,
    growthRate,
    churnRate,
    averageLifetimeValue,
  };
}

// Get engagement timeline
export async function getEngagementTimeline(
  organizationId: string,
  days: number = 30
): Promise<Array<{ date: string; emails: number; sms: number; opens: number; clicks: number }>> {
  const timeline = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(now, i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    // Get activities for this day
    const activities = await prisma.campaignActivity.findMany({
      where: {
        campaign: { organizationId },
        createdAt: { gte: dayStart, lte: dayEnd },
      },
      include: { campaign: true },
    });

    const emails = activities.filter(
      a => a.type === 'sent' && a.metadata?.channel === 'email'
    ).length;

    const sms = activities.filter(
      a => a.type === 'sent' && a.metadata?.channel === 'sms'
    ).length;

    const opens = activities.filter(a => a.type === 'opened').length;
    const clicks = activities.filter(a => a.type === 'clicked').length;

    timeline.push({
      date: format(date, 'yyyy-MM-dd'),
      emails,
      sms,
      opens,
      clicks,
    });
  }

  return timeline;
}

// Get segment performance
export async function getSegmentPerformance(organizationId: string) {
  const segments = [
    { id: 'active_customers', name: 'Active Customers' },
    { id: 'lapsed_customers', name: 'Lapsed Customers' },
    { id: 'new_customers', name: 'New Customers' },
    { id: 'high_value', name: 'High Value Customers' },
  ];

  const performance = await Promise.all(
    segments.map(async segment => {
      // Get campaigns targeted at this segment
      const campaigns = await prisma.marketingCampaign.findMany({
        where: {
          organizationId,
          targetAudience: {
            path: ['segmentId'],
            equals: segment.id,
          },
        },
      });

      // Calculate aggregate metrics
      let totalSent = 0;
      let totalOpens = 0;
      let totalClicks = 0;
      let totalRevenue = 0;

      for (const campaign of campaigns) {
        const metrics = await getCampaignMetrics(campaign.id);
        totalSent += metrics.sent;
        totalOpens += metrics.opens;
        totalClicks += metrics.clicks;
        totalRevenue += metrics.revenue;
      }

      return {
        segment: segment.name,
        campaigns: campaigns.length,
        sent: totalSent,
        openRate: totalSent > 0 ? (totalOpens / totalSent) * 100 : 0,
        clickRate: totalSent > 0 ? (totalClicks / totalSent) * 100 : 0,
        revenue: totalRevenue,
      };
    })
  );

  return performance;
}

// Get top performing campaigns
export async function getTopCampaigns(
  organizationId: string,
  metric: 'opens' | 'clicks' | 'revenue' = 'revenue',
  limit: number = 5
) {
  const campaigns = await prisma.marketingCampaign.findMany({
    where: { organizationId },
  });

  const campaignsWithMetrics = await Promise.all(
    campaigns.map(async campaign => {
      const metrics = await getCampaignMetrics(campaign.id);
      return {
        ...campaign,
        metrics,
      };
    })
  );

  // Sort by specified metric
  campaignsWithMetrics.sort((a, b) => {
    if (metric === 'opens') return b.metrics.opens - a.metrics.opens;
    if (metric === 'clicks') return b.metrics.clicks - a.metrics.clicks;
    return b.metrics.revenue - a.metrics.revenue;
  });

  return campaignsWithMetrics.slice(0, limit);
}

// Track email open
export async function trackEmailOpen(campaignId: string, contactId: string) {
  // Check if already tracked
  const existing = await prisma.campaignActivity.findFirst({
    where: {
      campaignId,
      contactId,
      type: 'opened',
    },
  });

  if (!existing) {
    await prisma.campaignActivity.create({
      data: {
        campaignId,
        contactId,
        type: 'opened',
        metadata: { timestamp: new Date().toISOString() },
      },
    });
  }
}

// Track link click
export async function trackLinkClick(
  campaignId: string,
  contactId: string,
  link: string
) {
  await prisma.campaignActivity.create({
    data: {
      campaignId,
      contactId,
      type: 'clicked',
      metadata: { link, timestamp: new Date().toISOString() },
    },
  });

  // Also track as opened if not already
  await trackEmailOpen(campaignId, contactId);
}

// Track conversion
export async function trackConversion(
  campaignId: string,
  contactId: string,
  value: number,
  metadata?: any
) {
  await prisma.campaignActivity.create({
    data: {
      campaignId,
      contactId,
      type: 'converted',
      metadata: { value, ...metadata, timestamp: new Date().toISOString() },
    },
  });

  // Update campaign stats
  const campaign = await prisma.marketingCampaign.findUnique({
    where: { id: campaignId },
  });

  if (campaign) {
    const currentStats = campaign.stats || {};
    const updatedStats = {
      ...currentStats,
      conversions: (currentStats.conversions || 0) + 1,
      revenue: (currentStats.revenue || 0) + value,
    };

    await prisma.marketingCampaign.update({
      where: { id: campaignId },
      data: { stats: updatedStats },
    });
  }
}

// Handle unsubscribe
export async function handleUnsubscribe(
  contactId: string,
  channel: 'email' | 'sms' | 'all'
) {
  const updates: any = { subscribed: false };

  if (channel === 'email' || channel === 'all') {
    updates.emailOptIn = false;
  }

  if (channel === 'sms' || channel === 'all') {
    updates.smsOptIn = false;
  }

  await prisma.marketingContact.update({
    where: { id: contactId },
    data: updates,
  });

  // Log the unsubscribe activity
  const contact = await prisma.marketingContact.findUnique({
    where: { id: contactId },
    include: { activities: { take: 1, orderBy: { createdAt: 'desc' } } },
  });

  if (contact && contact.activities.length > 0) {
    await prisma.campaignActivity.create({
      data: {
        campaignId: contact.activities[0].campaignId,
        contactId,
        type: 'unsubscribed',
        metadata: { channel, timestamp: new Date().toISOString() },
      },
    });
  }
}