'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { useToast } from '@/src/components/ui/use-toast';
import { ArrowLeft, Facebook, Calendar } from 'lucide-react';

interface AdAccount {
  id: string;
  platform: string;
  accountName: string;
  accountId: string;
}

interface CampaignFormData {
  name: string;
  adAccountId: string;
  objective: string;
  budget: string;
  budgetType: 'daily' | 'lifetime';
  startDate: string;
  endDate: string;
  targetAudience: {
    ageMin: string;
    ageMax: string;
    gender: string;
    locations: string;
    interests: string;
  };
  adCreative: {
    headline: string;
    description: string;
    callToAction: string;
  };
}

export default function NewCampaignPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    adAccountId: '',
    objective: 'traffic',
    budget: '',
    budgetType: 'daily',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    targetAudience: {
      ageMin: '18',
      ageMax: '65',
      gender: 'all',
      locations: '',
      interests: '',
    },
    adCreative: {
      headline: '',
      description: '',
      callToAction: 'learn_more',
    },
  });

  useEffect(() => {
    fetchAdAccounts();
  }, []);

  async function fetchAdAccounts() {
    try {
      const response = await fetch('/api/ads/accounts');
      if (!response.ok) throw new Error('Failed to fetch ad accounts');
      
      const data = await response.json();
      setAdAccounts(data.accounts || []);
      
      // Auto-select first account
      if (data.accounts && data.accounts.length > 0) {
        setFormData(prev => ({ ...prev, adAccountId: data.accounts[0].id }));
      }
    } catch (error) {
      console.error('Error fetching ad accounts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load ad accounts',
        variant: 'destructive',
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.name || !formData.adAccountId || !formData.budget) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const selectedAccount = adAccounts.find(a => a.id === formData.adAccountId);
      const campaignData = {
        name: formData.name,
        adAccountId: formData.adAccountId,
        budget: parseFloat(formData.budget),
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        platform: selectedAccount?.platform,
        // In production, you would also send targeting and creative data
      };

      const response = await fetch('/api/ads/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) throw new Error('Failed to create campaign');

      toast({
        title: 'Success',
        description: 'Campaign created successfully',
      });

      router.push('/admin/ads');
    } catch (error) {
      console.error('Create campaign error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create campaign',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const selectedPlatform = adAccounts.find(a => a.id === formData.adAccountId)?.platform;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Create New Campaign</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campaign Basics */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Basics</CardTitle>
            <CardDescription>
              Set up your campaign name and account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Summer Sale Campaign"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account">Ad Account *</Label>
              <Select
                value={formData.adAccountId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, adAccountId: value }))}
              >
                <SelectTrigger id="account">
                  <SelectValue placeholder="Select an ad account" />
                </SelectTrigger>
                <SelectContent>
                  {adAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2">
                        {account.platform === 'facebook' ? (
                          <Facebook className="h-4 w-4" />
                        ) : (
                          <img src="/google-ads-icon.svg" alt="Google" className="h-4 w-4" />
                        )}
                        {account.accountName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="objective">Campaign Objective</Label>
              <Select
                value={formData.objective}
                onValueChange={(value) => setFormData(prev => ({ ...prev, objective: value }))}
              >
                <SelectTrigger id="objective">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="awareness">Brand Awareness</SelectItem>
                  <SelectItem value="traffic">Traffic</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="leads">Lead Generation</SelectItem>
                  <SelectItem value="conversions">Conversions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Budget & Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Budget & Schedule</CardTitle>
            <CardDescription>
              Set your campaign budget and schedule
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="100.00"
                    className="pl-7"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgetType">Budget Type</Label>
                <Select
                  value={formData.budgetType}
                  onValueChange={(value: 'daily' | 'lifetime') => setFormData(prev => ({ ...prev, budgetType: value }))}
                >
                  <SelectTrigger id="budgetType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily Budget</SelectItem>
                    <SelectItem value="lifetime">Lifetime Budget</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  min={formData.startDate}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Target Audience */}
        <Card>
          <CardHeader>
            <CardTitle>Target Audience</CardTitle>
            <CardDescription>
              Define who should see your ads
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="ageMin">Min Age</Label>
                <Input
                  id="ageMin"
                  type="number"
                  value={formData.targetAudience.ageMin}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    targetAudience: { ...prev.targetAudience, ageMin: e.target.value }
                  }))}
                  min="13"
                  max="65"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ageMax">Max Age</Label>
                <Input
                  id="ageMax"
                  type="number"
                  value={formData.targetAudience.ageMax}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    targetAudience: { ...prev.targetAudience, ageMax: e.target.value }
                  }))}
                  min="13"
                  max="65"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.targetAudience.gender}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    targetAudience: { ...prev.targetAudience, gender: value }
                  }))}
                >
                  <SelectTrigger id="gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="locations">Locations</Label>
              <Input
                id="locations"
                value={formData.targetAudience.locations}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  targetAudience: { ...prev.targetAudience, locations: e.target.value }
                }))}
                placeholder="United States, Canada"
              />
              <p className="text-sm text-muted-foreground">
                Enter countries, states, or cities separated by commas
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Interests</Label>
              <Textarea
                id="interests"
                value={formData.targetAudience.interests}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  targetAudience: { ...prev.targetAudience, interests: e.target.value }
                }))}
                placeholder="Beauty, Fashion, Online Shopping"
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                Enter interests separated by commas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ad Creative */}
        <Card>
          <CardHeader>
            <CardTitle>Ad Creative</CardTitle>
            <CardDescription>
              Create your ad content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                value={formData.adCreative.headline}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  adCreative: { ...prev.adCreative, headline: e.target.value }
                }))}
                placeholder="Get 20% Off Your First Service"
                maxLength={selectedPlatform === 'facebook' ? 40 : 30}
              />
              <p className="text-sm text-muted-foreground">
                {formData.adCreative.headline.length}/{selectedPlatform === 'facebook' ? 40 : 30} characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.adCreative.description}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  adCreative: { ...prev.adCreative, description: e.target.value }
                }))}
                placeholder="Professional service at your doorstep. Book now and save!"
                rows={3}
                maxLength={selectedPlatform === 'facebook' ? 125 : 90}
              />
              <p className="text-sm text-muted-foreground">
                {formData.adCreative.description.length}/{selectedPlatform === 'facebook' ? 125 : 90} characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta">Call to Action</Label>
              <Select
                value={formData.adCreative.callToAction}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  adCreative: { ...prev.adCreative, callToAction: value }
                }))}
              >
                <SelectTrigger id="cta">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="learn_more">Learn More</SelectItem>
                  <SelectItem value="book_now">Book Now</SelectItem>
                  <SelectItem value="sign_up">Sign Up</SelectItem>
                  <SelectItem value="get_offer">Get Offer</SelectItem>
                  <SelectItem value="contact_us">Contact Us</SelectItem>
                  <SelectItem value="shop_now">Shop Now</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || adAccounts.length === 0}>
            {loading ? 'Creating...' : 'Create Campaign'}
          </Button>
        </div>
      </form>
    </div>
  );
}