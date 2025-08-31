'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { useToast } from '@/src/components/ui/use-toast';
import { 
  ArrowLeft, 
  Facebook, 
  DollarSign,
  MousePointerClick,
  Eye,
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  BarChart,
  LineChart,
  PieChart,
  Download,
  PauseCircle,
  PlayCircle,
  Settings
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '@/src/lib/utils';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface Campaign {
  id: string;
  platformId: string;
  name: string;
  status: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  startDate: string;
  endDate: string | null;
  adAccount: {
    platform: string;
    accountName: string;
  };
}

interface DailyMetrics {
  date: string;
  impressions: number;
  clicks: number;
  spent: number;
  conversions: number;
}

interface AudienceData {
  age: { group: string; percentage: number }[];
  gender: { type: string; percentage: number }[];
  location: { name: string; percentage: number }[];
}

export default function CampaignDetailPage({ params }: { params: { campaignId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics[]>([]);
  const [audienceData, setAudienceData] = useState<AudienceData | null>(null);

  useEffect(() => {
    fetchCampaignData();
  }, [params.campaignId]);

  async function fetchCampaignData() {
    try {
      setLoading(true);
      
      // In production, this would fetch real campaign data
      // For demo, we'll create mock data
      const mockCampaign: Campaign = {
        id: params.campaignId,
        platformId: 'fb_123456',
        name: 'Summer Sale Campaign',
        status: 'active',
        budget: 5000,
        spent: 2347.89,
        impressions: 125000,
        clicks: 3500,
        conversions: 87,
        startDate: subDays(new Date(), 14).toISOString(),
        endDate: null,
        adAccount: {
          platform: 'facebook',
          accountName: 'Main Business Account',
        },
      };

      // Mock daily metrics
      const mockDailyMetrics: DailyMetrics[] = Array.from({ length: 14 }, (_, i) => {
        const date = subDays(new Date(), 13 - i);
        return {
          date: date.toISOString(),
          impressions: Math.floor(Math.random() * 15000) + 5000,
          clicks: Math.floor(Math.random() * 400) + 100,
          spent: Math.random() * 200 + 50,
          conversions: Math.floor(Math.random() * 10) + 1,
        };
      });

      // Mock audience data
      const mockAudienceData: AudienceData = {
        age: [
          { group: '18-24', percentage: 15 },
          { group: '25-34', percentage: 35 },
          { group: '35-44', percentage: 25 },
          { group: '45-54', percentage: 15 },
          { group: '55+', percentage: 10 },
        ],
        gender: [
          { type: 'Female', percentage: 58 },
          { type: 'Male', percentage: 40 },
          { type: 'Other', percentage: 2 },
        ],
        location: [
          { name: 'United States', percentage: 65 },
          { name: 'Canada', percentage: 20 },
          { name: 'United Kingdom', percentage: 10 },
          { name: 'Other', percentage: 5 },
        ],
      };

      setCampaign(mockCampaign);
      setDailyMetrics(mockDailyMetrics);
      setAudienceData(mockAudienceData);
    } catch (error) {
      console.error('Error fetching campaign data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load campaign data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function toggleCampaignStatus() {
    if (!campaign) return;

    try {
      const newStatus = campaign.status === 'active' ? 'paused' : 'active';
      const response = await fetch(`/api/ads/campaigns/${campaign.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update campaign status');

      setCampaign({ ...campaign, status: newStatus });
      toast({
        title: 'Success',
        description: `Campaign ${newStatus}`,
      });
    } catch (error) {
      console.error('Status update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update campaign status',
        variant: 'destructive',
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto p-6">
        <p>Campaign not found</p>
      </div>
    );
  }

  const ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0;
  const cpc = campaign.clicks > 0 ? campaign.spent / campaign.clicks : 0;
  const conversionRate = campaign.clicks > 0 ? (campaign.conversions / campaign.clicks) * 100 : 0;
  const roas = campaign.spent > 0 ? (campaign.conversions * 50) / campaign.spent : 0;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {campaign.name}
              {campaign.adAccount.platform === 'facebook' ? (
                <Facebook className="h-6 w-6" />
              ) : (
                <img src="/google-ads-icon.svg" alt="Google" className="h-6 w-6" />
              )}
            </h1>
            <p className="text-muted-foreground">
              {campaign.adAccount.accountName} • ID: {campaign.platformId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              campaign.status === 'active' ? 'default' :
              campaign.status === 'paused' ? 'secondary' :
              'outline'
            }
          >
            {campaign.status}
          </Badge>
          <Button
            variant="outline"
            onClick={toggleCampaignStatus}
            disabled={campaign.status === 'completed'}
          >
            {campaign.status === 'active' ? (
              <>
                <PauseCircle className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-4 w-4" />
                Resume
              </>
            )}
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${campaign.spent.toFixed(2)}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                />
              </div>
              {((campaign.spent / campaign.budget) * 100).toFixed(0)}% of ${campaign.budget}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.impressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${cpc.toFixed(2)} CPM
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.clicks.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {ctr.toFixed(2)}% CTR
              {ctr > 2 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.conversions}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {roas.toFixed(2)}x ROAS
              {roas > 1 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>
                Daily metrics over the last 14 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => format(new Date(value), 'MMM d')}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                      formatter={(value: number) => 
                        typeof value === 'number' ? value.toLocaleString() : value
                      }
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="impressions"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      name="Impressions"
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="clicks"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.3}
                      name="Clicks"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="spent"
                      stroke="#EF4444"
                      name="Spent ($)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cost Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cost per Click (CPC)</span>
                  <span className="font-medium">${cpc.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cost per Conversion</span>
                  <span className="font-medium">
                    ${campaign.conversions > 0 ? (campaign.spent / campaign.conversions).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cost per 1000 Impressions (CPM)</span>
                  <span className="font-medium">
                    ${campaign.impressions > 0 ? ((campaign.spent / campaign.impressions) * 1000).toFixed(2) : '0.00'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Click-Through Rate (CTR)</span>
                  <span className="font-medium">{ctr.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Conversion Rate</span>
                  <span className="font-medium">{conversionRate.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Average Order Value</span>
                  <span className="font-medium">$50.00</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          {audienceData && (
            <>
              {/* Age Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Age Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={audienceData.age}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="group" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Bar dataKey="percentage" fill="#3B82F6" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Gender Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Gender Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={audienceData.gender}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.type}: ${entry.percentage}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="percentage"
                          >
                            {audienceData.gender.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Location Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Locations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {audienceData.location.map((location, index) => (
                        <div key={location.name} className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">{location.name}</span>
                              <span className="text-sm text-muted-foreground">{location.percentage}%</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div
                                className="h-2 rounded-full"
                                style={{ 
                                  width: `${location.percentage}%`,
                                  backgroundColor: COLORS[index % COLORS.length]
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="conversions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>
                Track how users move through your conversion funnel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Impressions</span>
                      <span className="text-sm">{campaign.impressions.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-4">
                      <div className="bg-primary h-4 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Clicks</span>
                      <span className="text-sm">{campaign.clicks.toLocaleString()} ({ctr.toFixed(2)}%)</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-4">
                      <div 
                        className="bg-blue-500 h-4 rounded-full" 
                        style={{ width: `${(campaign.clicks / campaign.impressions) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Conversions</span>
                      <span className="text-sm">{campaign.conversions} ({conversionRate.toFixed(2)}%)</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-4">
                      <div 
                        className="bg-green-500 h-4 rounded-full" 
                        style={{ width: `${(campaign.conversions / campaign.clicks) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversion Tracking</CardTitle>
              <CardDescription>
                Ensure your conversion tracking is properly set up
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Target className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Facebook Pixel</p>
                    <p className="text-sm text-muted-foreground">Tracking purchases and add to cart events</p>
                  </div>
                </div>
                <Badge variant="default">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <BarChart className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Google Analytics</p>
                    <p className="text-sm text-muted-foreground">Enhanced ecommerce tracking enabled</p>
                  </div>
                </div>
                <Badge variant="default">Active</Badge>
              </div>

              <Button variant="outline" className="w-full">
                View Conversion Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}