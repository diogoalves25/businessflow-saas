import { prisma } from '@/lib/prisma';

export interface CampaignMetrics {
  opens: number;
  clicks: number;
  conversions: number;
  revenue: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

export interface ContactMetrics {
  total: number;
  active: number;
  subscribed: number;
  unsubscribed: number;
  growth: number;
  growthPercentage: number;
}

export interface EngagementData {
  date: string;
  opens: number;
  clicks: number;
  conversions: number;
}

export interface SegmentPerformance {
  id: string;
  name: string;
  size: number;
  engagementRate: number;
  conversionRate: number;
  revenue: number;
}

export async function getCampaignMetrics(campaignId: string): Promise<CampaignMetrics> {
  // In production, fetch from database
  // For now, return mock data
  return {
    opens: 1250,
    clicks: 380,
    conversions: 45,
    revenue: 12500,
    openRate: 0.42,
    clickRate: 0.304,
    conversionRate: 0.118,
  };
}

export async function getContactMetrics(organizationId: string): Promise<ContactMetrics> {
  // In production, fetch from database
  // For now, return mock data
  return {
    total: 2980,
    active: 2150,
    subscribed: 2800,
    unsubscribed: 180,
    growth: 245,
    growthPercentage: 8.9,
  };
}

export async function getEngagementTimeline(
  organizationId: string,
  days: number
): Promise<EngagementData[]> {
  // In production, fetch from database
  // For now, return mock data
  const timeline: EngagementData[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    timeline.push({
      date: date.toISOString().split('T')[0],
      opens: Math.floor(Math.random() * 200) + 100,
      clicks: Math.floor(Math.random() * 60) + 20,
      conversions: Math.floor(Math.random() * 10) + 2,
    });
  }
  
  return timeline;
}

export async function getSegmentPerformance(organizationId: string): Promise<SegmentPerformance[]> {
  // In production, fetch from database
  // For now, return mock data
  return [
    {
      id: '1',
      name: 'VIP Customers',
      size: 450,
      engagementRate: 0.68,
      conversionRate: 0.23,
      revenue: 45000,
    },
    {
      id: '2',
      name: 'New Subscribers',
      size: 820,
      engagementRate: 0.45,
      conversionRate: 0.12,
      revenue: 15000,
    },
    {
      id: '3',
      name: 'Inactive Users',
      size: 310,
      engagementRate: 0.15,
      conversionRate: 0.05,
      revenue: 2000,
    },
  ];
}

export async function getTopCampaigns(
  organizationId: string,
  metric: 'opens' | 'clicks' | 'revenue',
  limit: number = 5
): Promise<any[]> {
  // In production, fetch from database
  // For now, return mock data
  const campaigns = [
    {
      id: '1',
      name: 'Summer Sale 2024',
      opens: 3200,
      clicks: 850,
      revenue: 28000,
      status: 'completed',
    },
    {
      id: '2',
      name: 'Product Launch',
      opens: 2800,
      clicks: 920,
      revenue: 35000,
      status: 'active',
    },
    {
      id: '3',
      name: 'Holiday Special',
      opens: 2100,
      clicks: 580,
      revenue: 18500,
      status: 'completed',
    },
  ];
  
  // Sort by metric
  campaigns.sort((a, b) => b[metric] - a[metric]);
  
  return campaigns.slice(0, limit);
}