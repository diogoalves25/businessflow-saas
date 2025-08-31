import { FacebookAdsApi, AdAccount, Campaign, AdSet, Ad } from 'facebook-nodejs-business-sdk';
import { prisma } from '../prisma';
import { encrypt, decrypt } from '../encryption';

// Initialize Facebook Ads API
export function initFacebookAdsApi(accessToken: string) {
  const api = FacebookAdsApi.init(accessToken);
  
  if (process.env.NODE_ENV === 'development') {
    api.setDebug(true);
  }
  
  return api;
}

// Get Facebook OAuth URL
export function getFacebookOAuthUrl(organizationId: string): string {
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/ads/facebook/callback`;
  const state = Buffer.from(JSON.stringify({ organizationId })).toString('base64');
  
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID!,
    redirect_uri: redirectUri,
    state,
    scope: 'ads_management,ads_read,business_management',
    response_type: 'code',
  });
  
  return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
}

// Exchange code for access token
export async function exchangeFacebookCode(code: string): Promise<string> {
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/ads/facebook/callback`;
  
  const response = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
    `client_id=${process.env.FACEBOOK_APP_ID}` +
    `&client_secret=${process.env.FACEBOOK_APP_SECRET}` +
    `&code=${code}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to exchange Facebook code for token');
  }
  
  const data = await response.json();
  return data.access_token;
}

// Get Facebook ad accounts
export async function getFacebookAdAccounts(accessToken: string) {
  const api = initFacebookAdsApi(accessToken);
  
  try {
    // Get user's business accounts
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/adaccounts?` +
      `fields=id,name,account_status,currency,business_name` +
      `&access_token=${accessToken}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch Facebook ad accounts');
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching Facebook ad accounts:', error);
    throw error;
  }
}

// Save Facebook ad account
export async function saveFacebookAdAccount(
  organizationId: string,
  accountData: {
    accountId: string;
    accountName: string;
    accessToken: string;
  }
) {
  const encryptedToken = encrypt(accountData.accessToken);
  
  return prisma.adAccount.create({
    data: {
      organizationId,
      platform: 'facebook',
      accountId: accountData.accountId,
      accountName: accountData.accountName,
      accessToken: encryptedToken,
    },
  });
}

// Get Facebook campaigns
export async function getFacebookCampaigns(adAccountId: string) {
  const adAccount = await prisma.adAccount.findUnique({
    where: { id: adAccountId },
  });
  
  if (!adAccount || adAccount.platform !== 'facebook') {
    throw new Error('Invalid Facebook ad account');
  }
  
  const accessToken = decrypt(adAccount.accessToken);
  const api = initFacebookAdsApi(accessToken);
  
  try {
    const account = new AdAccount(adAccount.accountId);
    const campaigns = await account.getCampaigns(
      [
        'id',
        'name',
        'status',
        'objective',
        'daily_budget',
        'lifetime_budget',
        'spend_cap',
        'created_time',
        'start_time',
        'stop_time',
      ],
      { limit: 100 }
    );
    
    // Get insights for each campaign
    const campaignsWithInsights = await Promise.all(
      campaigns.map(async (campaign: any) => {
        try {
          const insights = await campaign.getInsights(
            ['impressions', 'clicks', 'spend', 'conversions'],
            { date_preset: 'lifetime' }
          );
          
          return {
            platformId: campaign.id,
            name: campaign.name,
            status: campaign.status.toLowerCase(),
            budget: parseFloat(campaign.daily_budget || campaign.lifetime_budget || '0') / 100,
            spent: parseFloat(insights[0]?.spend || '0'),
            impressions: parseInt(insights[0]?.impressions || '0'),
            clicks: parseInt(insights[0]?.clicks || '0'),
            conversions: parseInt(insights[0]?.conversions || '0'),
            startDate: new Date(campaign.start_time || campaign.created_time),
            endDate: campaign.stop_time ? new Date(campaign.stop_time) : null,
          };
        } catch (error) {
          console.error(`Error fetching insights for campaign ${campaign.id}:`, error);
          return {
            platformId: campaign.id,
            name: campaign.name,
            status: campaign.status.toLowerCase(),
            budget: parseFloat(campaign.daily_budget || campaign.lifetime_budget || '0') / 100,
            spent: 0,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            startDate: new Date(campaign.start_time || campaign.created_time),
            endDate: campaign.stop_time ? new Date(campaign.stop_time) : null,
          };
        }
      })
    );
    
    return campaignsWithInsights;
  } catch (error) {
    console.error('Error fetching Facebook campaigns:', error);
    throw error;
  }
}

// Create Facebook campaign
export async function createFacebookCampaign(
  adAccountId: string,
  campaignData: {
    name: string;
    objective: string;
    budget: number;
    startDate: Date;
    endDate?: Date;
  }
) {
  const adAccount = await prisma.adAccount.findUnique({
    where: { id: adAccountId },
  });
  
  if (!adAccount || adAccount.platform !== 'facebook') {
    throw new Error('Invalid Facebook ad account');
  }
  
  const accessToken = decrypt(adAccount.accessToken);
  const api = initFacebookAdsApi(accessToken);
  
  try {
    const account = new AdAccount(adAccount.accountId);
    
    const campaign = await account.createCampaign(
      [],
      {
        name: campaignData.name,
        objective: campaignData.objective,
        status: 'PAUSED', // Start paused for safety
        special_ad_categories: [], // Update based on business type
        daily_budget: Math.round(campaignData.budget * 100), // Convert to cents
        start_time: campaignData.startDate.toISOString(),
        end_time: campaignData.endDate?.toISOString(),
      }
    );
    
    // Save to database
    await prisma.adCampaign.create({
      data: {
        adAccountId,
        platformId: campaign.id,
        name: campaignData.name,
        status: 'paused',
        budget: campaignData.budget,
        startDate: campaignData.startDate,
        endDate: campaignData.endDate,
      },
    });
    
    return campaign;
  } catch (error) {
    console.error('Error creating Facebook campaign:', error);
    throw error;
  }
}

// Update campaign status
export async function updateFacebookCampaignStatus(
  campaignId: string,
  status: 'active' | 'paused'
) {
  const campaign = await prisma.adCampaign.findUnique({
    where: { id: campaignId },
    include: { adAccount: true },
  });
  
  if (!campaign || campaign.adAccount.platform !== 'facebook') {
    throw new Error('Invalid Facebook campaign');
  }
  
  const accessToken = decrypt(campaign.adAccount.accessToken);
  const api = initFacebookAdsApi(accessToken);
  
  try {
    const fbCampaign = new Campaign(campaign.platformId);
    await fbCampaign.update({
      status: status === 'active' ? 'ACTIVE' : 'PAUSED',
    });
    
    // Update database
    await prisma.adCampaign.update({
      where: { id: campaignId },
      data: { status },
    });
    
    return true;
  } catch (error) {
    console.error('Error updating Facebook campaign status:', error);
    throw error;
  }
}

// Sync campaigns from Facebook
export async function syncFacebookCampaigns(adAccountId: string) {
  const campaigns = await getFacebookCampaigns(adAccountId);
  
  // Sync with database
  for (const campaignData of campaigns) {
    const existing = await prisma.adCampaign.findFirst({
      where: {
        adAccountId,
        platformId: campaignData.platformId,
      },
    });
    
    if (existing) {
      await prisma.adCampaign.update({
        where: { id: existing.id },
        data: {
          name: campaignData.name,
          status: campaignData.status,
          budget: campaignData.budget,
          spent: campaignData.spent,
          impressions: campaignData.impressions,
          clicks: campaignData.clicks,
          conversions: campaignData.conversions,
        },
      });
    } else {
      await prisma.adCampaign.create({
        data: {
          adAccountId,
          ...campaignData,
        },
      });
    }
  }
  
  return campaigns;
}

// Get Facebook Pixel code
export function getFacebookPixelCode(pixelId: string): string {
  return `
<!-- Facebook Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${pixelId}');
  fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"
/></noscript>
<!-- End Facebook Pixel Code -->
  `;
}

// Track conversion
export function trackFacebookConversion(
  pixelId: string,
  eventName: string,
  value?: number,
  currency?: string
) {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    const params: any = {};
    if (value) params.value = value;
    if (currency) params.currency = currency;
    
    (window as any).fbq('track', eventName, params);
  }
}