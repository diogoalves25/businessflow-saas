'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, MessageSquare, Users, TrendingUp, Plus, Filter, Download, Send, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useOrganization } from '@/hooks/useOrganization';
import { canAccessFeature } from '@/src/lib/feature-gating';

export default function MarketingDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { organization } = useOrganization();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [campaigns, setCampaigns] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalContacts: 0,
    emailSubscribers: 0,
    smsSubscribers: 0,
    campaignRevenue: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && organization) {
      if (!canAccessFeature(organization.stripePriceId || null, 'hasMarketingTools')) {
        router.push('/admin?upgrade=marketing');
      } else {
        loadMarketingData();
      }
    }
  }, [user, authLoading, organization, router]);

  const loadMarketingData = async () => {
    try {
      // Load campaigns
      const campaignsRes = await fetch('/api/marketing/campaigns');
      const campaignsData = await campaignsRes.json();
      setCampaigns(campaignsData.campaigns || []);

      // Load contacts
      const contactsRes = await fetch('/api/marketing/contacts');
      const contactsData = await contactsRes.json();
      setContacts(contactsData.contacts || []);

      // Load segments
      const segmentsRes = await fetch('/api/marketing/segments');
      const segmentsData = await segmentsRes.json();
      setSegments(segmentsData.segments || []);

      // Calculate stats
      const totalContacts = contactsData.contacts?.length || 0;
      const emailSubscribers = contactsData.contacts?.filter((c: any) => c.emailOptIn).length || 0;
      const smsSubscribers = contactsData.contacts?.filter((c: any) => c.smsOptIn).length || 0;
      const campaignRevenue = campaignsData.campaigns?.reduce((sum: number, c: any) => 
        sum + (c.stats?.revenue || 0), 0) || 0;

      setStats({
        totalContacts,
        emailSubscribers,
        smsSubscribers,
        campaignRevenue,
      });

      setLoading(false);
    } catch (error) {
      console.error('Failed to load marketing data:', error);
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Marketing Automation</h1>
        <p className="text-gray-600 mt-2">Create campaigns, manage contacts, and track performance</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContacts}</div>
            <p className="text-xs text-muted-foreground">Active subscribers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Subscribers</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emailSubscribers}</div>
            <p className="text-xs text-muted-foreground">Opted in for emails</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Subscribers</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.smsSubscribers}</div>
            <p className="text-xs text-muted-foreground">Opted in for SMS</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaign Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.campaignRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From marketing campaigns</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Campaigns</h2>
            <Button onClick={() => router.push('/admin/marketing/campaigns/new')}>
              <Plus className="mr-2 h-4 w-4" /> Create Campaign
            </Button>
          </div>

          <div className="space-y-4">
            {campaigns.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No campaigns created yet</p>
                  <Button onClick={() => router.push('/admin/marketing/campaigns/new')}>
                    Create Your First Campaign
                  </Button>
                </CardContent>
              </Card>
            ) : (
              campaigns.map((campaign: any) => (
                <Card key={campaign.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => router.push(`/admin/marketing/campaigns/${campaign.id}`)}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          {campaign.type === 'email' && <Mail className="h-4 w-4" />}
                          {campaign.type === 'sms' && <MessageSquare className="h-4 w-4" />}
                          {campaign.type === 'both' && (
                            <>
                              <Mail className="h-4 w-4" />
                              <MessageSquare className="h-4 w-4" />
                            </>
                          )}
                          <span>{campaign.type.toUpperCase()} Campaign</span>
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={campaign.status === 'active' ? 'default' : 
                                campaign.status === 'completed' ? 'secondary' : 
                                campaign.status === 'scheduled' ? 'outline' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Sent</p>
                        <p className="font-semibold">{campaign.stats?.sent || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Opens</p>
                        <p className="font-semibold">{campaign.stats?.opens || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Clicks</p>
                        <p className="font-semibold">{campaign.stats?.clicks || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Revenue</p>
                        <p className="font-semibold">${campaign.stats?.revenue || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Contacts</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/admin/marketing/contacts/import')}>
                <Download className="mr-2 h-4 w-4" /> Import
              </Button>
              <Button onClick={() => router.push('/admin/marketing/contacts/new')}>
                <Plus className="mr-2 h-4 w-4" /> Add Contact
              </Button>
            </div>
          </div>

          <div className="mb-4 flex gap-4">
            <Input placeholder="Search contacts..." className="max-w-sm" />
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Contacts</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
                <SelectItem value="lead">Leads</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4">Contact</th>
                      <th className="text-left p-4">Email</th>
                      <th className="text-left p-4">Phone</th>
                      <th className="text-left p-4">Last Booking</th>
                      <th className="text-left p-4">Total Spent</th>
                      <th className="text-left p-4">Subscriptions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact: any) => (
                      <tr key={contact.id} className="border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => router.push(`/admin/marketing/contacts/${contact.id}`)}>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                            <p className="text-sm text-muted-foreground">{contact.tags.join(', ')}</p>
                          </div>
                        </td>
                        <td className="p-4">{contact.email}</td>
                        <td className="p-4">{contact.phone || '-'}</td>
                        <td className="p-4">
                          {contact.lastBooking ? format(new Date(contact.lastBooking), 'MMM d, yyyy') : '-'}
                        </td>
                        <td className="p-4">${contact.totalSpent.toFixed(2)}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {contact.emailOptIn && <Badge variant="outline">Email</Badge>}
                            {contact.smsOptIn && <Badge variant="outline">SMS</Badge>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Segments</h2>
            <Button onClick={() => router.push('/admin/marketing/segments/new')}>
              <Plus className="mr-2 h-4 w-4" /> Create Segment
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {segments.map((segment: any) => (
              <Card key={segment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{segment.name}</CardTitle>
                  <CardDescription>{segment.size} contacts</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{segment.description}</p>
                  <Button className="w-full" variant="outline"
                          onClick={() => router.push(`/admin/marketing/campaigns/new?segment=${segment.id}`)}>
                    <Send className="mr-2 h-4 w-4" /> Create Campaign
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Automations Tab */}
        <TabsContent value="automations" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Automations</h2>
            <Button onClick={() => router.push('/admin/marketing/automations/new')}>
              <Plus className="mr-2 h-4 w-4" /> Create Automation
            </Button>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">Welcome Series</CardTitle>
                    <CardDescription>3-email series for new customers</CardDescription>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>1,234 enrolled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Last triggered 2 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">Win-Back Campaign</CardTitle>
                    <CardDescription>Re-engage customers after 60 days</CardDescription>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>456 enrolled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Last triggered yesterday</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">Review Request</CardTitle>
                    <CardDescription>Request reviews 24 hours after service</CardDescription>
                  </div>
                  <Badge variant="secondary">Paused</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>789 enrolled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Paused 3 days ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Templates</h2>
            <Button onClick={() => router.push('/admin/marketing/templates/new')}>
              <Plus className="mr-2 h-4 w-4" /> Create Template
            </Button>
          </div>

          <Tabs defaultValue="email">
            <TabsList>
              <TabsTrigger value="email">Email Templates</TabsTrigger>
              <TabsTrigger value="sms">SMS Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">Welcome Email</CardTitle>
                    <CardDescription>For new customers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Welcome to {'{{businessName}}'}! We're thrilled to have you...
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">Win-Back Email</CardTitle>
                    <CardDescription>Re-engage lapsed customers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      We miss you! Here's 20% off your next service...
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">Review Request</CardTitle>
                    <CardDescription>Post-service feedback</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      How was your experience? We'd love your feedback...
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sms" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">Appointment Reminder</CardTitle>
                    <CardDescription>24-hour reminder</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Hi {'{{firstName}}'}, reminder about your appointment tomorrow at {'{{time}}'}...
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">Promotion SMS</CardTitle>
                    <CardDescription>Special offers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {'{{businessName}}'}: Limited time! Get {'{{discount}}'}% off...
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">Welcome SMS</CardTitle>
                    <CardDescription>New customer greeting</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Welcome to {'{{businessName}}'}! Save this number for easy booking...
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}