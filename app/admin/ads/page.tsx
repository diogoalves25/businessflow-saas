'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Badge } from '@/src/components/ui/badge';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { useToast } from '@/src/components/ui/use-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  Facebook, 
  DollarSign,
  MousePointerClick,
  Eye,
  Target,
  PauseCircle,
  PlayCircle,
  Plus,
  ExternalLink,
  RefreshCw,
  Download,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/src/lib/utils';

interface AdAccount {
  id: string;
  platform: string;
  accountName: string;
  accountId: string;
  isActive: boolean;
  createdAt: string;
}

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
  ctr: number;
  cpc: number;
  roas: number;
  startDate: string;
  endDate: string | null;
  platform: string;
}

interface Metrics {
  totalSpent: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  avgCtr: number;
  avgCpc: number;
  avgRoas: number;
  spentChange: number;
  impressionsChange: number;
  clicksChange: number;
  conversionsChange: number;
}

export default function AdsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'facebook' | 'google'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'paused' | 'completed'>('all');
  const [dateRange, setDateRange] = useState('last_30_days');

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  async function fetchData() {
    try {
      setLoading(true);
      
      // Fetch ad accounts
      const accountsRes = await fetch('/api/ads/accounts');
      if (!accountsRes.ok) throw new Error('Failed to fetch ad accounts');
      const accountsData = await accountsRes.json();
      setAdAccounts(accountsData.accounts || []);

      // Fetch campaigns
      const campaignsRes = await fetch(`/api/ads/campaigns?dateRange=${dateRange}`);
      if (!campaignsRes.ok) throw new Error('Failed to fetch campaigns');
      const campaignsData = await campaignsRes.json();
      setCampaigns(campaignsData.campaigns || []);
      setMetrics(campaignsData.metrics || null);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load advertising data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function syncCampaigns() {
    try {
      setSyncing(true);
      const response = await fetch('/api/ads/sync', { method: 'POST' });
      
      if (!response.ok) throw new Error('Failed to sync campaigns');
      
      toast({
        title: 'Success',
        description: 'Campaigns synced successfully',
      });
      
      await fetchData();
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: 'Error',
        description: 'Failed to sync campaigns',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  }

  async function toggleCampaignStatus(campaignId: string, currentStatus: string) {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      const response = await fetch(`/api/ads/campaigns/${campaignId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update campaign status');

      toast({
        title: 'Success',
        description: `Campaign ${newStatus}`,
      });

      await fetchData();
    } catch (error) {
      console.error('Status update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update campaign status',
        variant: 'destructive',
      });
    }
  }

  function connectPlatform(platform: 'facebook' | 'google') {
    window.location.href = `/api/ads/${platform}/auth`;
  }

  async function exportReport() {
    try {
      const response = await fetch('/api/ads/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateRange, platform: selectedPlatform }),
      });

      if (!response.ok) throw new Error('Failed to export report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ads-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'Report exported successfully',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Error',
        description: 'Failed to export report',
        variant: 'destructive',
      });
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    if (selectedPlatform !== 'all' && campaign.platform !== selectedPlatform) return false;
    if (selectedStatus !== 'all' && campaign.status !== selectedStatus) return false;
    return true;
  });

  const platformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      case 'google':
        return <img src="/google-ads-icon.svg" alt="Google Ads" className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Advertising Dashboard</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportReport}
            disabled={campaigns.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button
            variant="outline"
            onClick={syncCampaigns}
            disabled={syncing || adAccounts.length === 0}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", syncing && "animate-spin")} />
            Sync Campaigns
          </Button>
          <Button onClick={() => router.push('/admin/ads/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.spentChange >= 0 ? '+' : ''}{metrics.spentChange.toFixed(1)}% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impressions</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalImpressions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.impressionsChange >= 0 ? '+' : ''}{metrics.impressionsChange.toFixed(1)}% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clicks</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalClicks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.avgCtr.toFixed(2)}% CTR
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalConversions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.avgRoas.toFixed(2)}x ROAS
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="accounts">Ad Accounts</TabsTrigger>
          <TabsTrigger value="conversions">Conversion Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <Select value={selectedPlatform} onValueChange={(value: any) => setSelectedPlatform(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="google">Google</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={(value: any) => setSelectedStatus(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campaigns Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4">Campaign</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-right p-4">Budget</th>
                      <th className="text-right p-4">Spent</th>
                      <th className="text-right p-4">Impressions</th>
                      <th className="text-right p-4">Clicks</th>
                      <th className="text-right p-4">CTR</th>
                      <th className="text-right p-4">CPC</th>
                      <th className="text-right p-4">Conversions</th>
                      <th className="text-right p-4">ROAS</th>
                      <th className="text-right p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCampaigns.map((campaign) => (
                      <tr key={campaign.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {platformIcon(campaign.platform)}
                            <div>
                              <div className="font-medium">{campaign.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(campaign.startDate), 'MMM d')}
                                {campaign.endDate && ` - ${format(new Date(campaign.endDate), 'MMM d')}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              campaign.status === 'active' ? 'default' :
                              campaign.status === 'paused' ? 'secondary' :
                              'outline'
                            }
                          >
                            {campaign.status}
                          </Badge>
                        </td>
                        <td className="text-right p-4">${campaign.budget.toFixed(2)}</td>
                        <td className="text-right p-4">
                          <div className="flex items-center justify-end gap-1">
                            ${campaign.spent.toFixed(2)}
                            <div className="text-xs text-muted-foreground">
                              ({((campaign.spent / campaign.budget) * 100).toFixed(0)}%)
                            </div>
                          </div>
                        </td>
                        <td className="text-right p-4">{campaign.impressions.toLocaleString()}</td>
                        <td className="text-right p-4">{campaign.clicks.toLocaleString()}</td>
                        <td className="text-right p-4">{campaign.ctr.toFixed(2)}%</td>
                        <td className="text-right p-4">${campaign.cpc.toFixed(2)}</td>
                        <td className="text-right p-4">{campaign.conversions}</td>
                        <td className="text-right p-4">
                          <div className="flex items-center justify-end gap-1">
                            {campaign.roas.toFixed(2)}x
                            {campaign.roas > 1 ? (
                              <TrendingUp className="h-3 w-3 text-green-500" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleCampaignStatus(campaign.id, campaign.status)}
                              disabled={campaign.status === 'completed'}
                            >
                              {campaign.status === 'active' ? (
                                <PauseCircle className="h-4 w-4" />
                              ) : (
                                <PlayCircle className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => router.push(`/admin/ads/campaigns/${campaign.id}`)}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredCampaigns.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No campaigns found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Facebook Connect Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Facebook className="h-5 w-5" />
                  Facebook Ads
                </CardTitle>
                <CardDescription>
                  Connect your Facebook Ad accounts to manage campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {adAccounts.filter(a => a.platform === 'facebook').length > 0 ? (
                  <div className="space-y-2">
                    {adAccounts.filter(a => a.platform === 'facebook').map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium">{account.accountName}</div>
                          <div className="text-sm text-muted-foreground">ID: {account.accountId}</div>
                        </div>
                        <Badge variant={account.isActive ? 'default' : 'secondary'}>
                          {account.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => connectPlatform('facebook')}
                    >
                      Add Another Account
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => connectPlatform('facebook')}
                  >
                    Connect Facebook Ads
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Google Connect Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <img src="/google-ads-icon.svg" alt="Google Ads" className="h-5 w-5" />
                  Google Ads
                </CardTitle>
                <CardDescription>
                  Connect your Google Ad accounts to manage campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {adAccounts.filter(a => a.platform === 'google').length > 0 ? (
                  <div className="space-y-2">
                    {adAccounts.filter(a => a.platform === 'google').map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium">{account.accountName}</div>
                          <div className="text-sm text-muted-foreground">ID: {account.accountId}</div>
                        </div>
                        <Badge variant={account.isActive ? 'default' : 'secondary'}>
                          {account.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => connectPlatform('google')}
                    >
                      Add Another Account
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => connectPlatform('google')}
                  >
                    Connect Google Ads
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Tracking Setup</CardTitle>
              <CardDescription>
                Install tracking codes to measure campaign effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Facebook Pixel */}
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <Facebook className="h-4 w-4" />
                  Facebook Pixel
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="facebook-pixel">Pixel ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="facebook-pixel"
                      placeholder="Enter your Facebook Pixel ID"
                      className="font-mono"
                    />
                    <Button variant="outline">Save</Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add this code to your website header to track conversions
                  </p>
                </div>
              </div>

              {/* Google Analytics */}
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <img src="/google-ads-icon.svg" alt="Google" className="h-4 w-4" />
                  Google Analytics
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="ga-measurement">Measurement ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="ga-measurement"
                      placeholder="G-XXXXXXXXXX"
                      className="font-mono"
                    />
                    <Button variant="outline">Save</Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your Google Analytics measurement ID for tracking
                  </p>
                </div>
              </div>

              {/* Google Ads Conversion */}
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <img src="/google-ads-icon.svg" alt="Google" className="h-4 w-4" />
                  Google Ads Conversion
                </h3>
                <div className="grid gap-2">
                  <div>
                    <Label htmlFor="conversion-id">Conversion ID</Label>
                    <Input
                      id="conversion-id"
                      placeholder="AW-XXXXXXXXX"
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="conversion-label">Conversion Label</Label>
                    <Input
                      id="conversion-label"
                      placeholder="XXXXXXXXXXXX"
                      className="font-mono"
                    />
                  </div>
                  <Button variant="outline" className="w-fit">Save</Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Track specific conversion actions from Google Ads
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}