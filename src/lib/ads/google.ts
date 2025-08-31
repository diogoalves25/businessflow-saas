import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../prisma';
import { encrypt, decrypt } from '../encryption';

// Initialize Google OAuth2 client
export function getGoogleOAuth2Client(): OAuth2Client {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/ads/google/callback`
  );
}

// Get Google OAuth URL
export function getGoogleOAuthUrl(organizationId: string): string {
  const oauth2Client = getGoogleOAuth2Client();
  const state = Buffer.from(JSON.stringify({ organizationId })).toString('base64');
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/adwords',
      'https://www.googleapis.com/auth/analytics.readonly',
    ],
    state,
    prompt: 'consent', // Force consent to get refresh token
  });
  
  return authUrl;
}

// Exchange code for tokens
export async function exchangeGoogleCode(code: string) {
  const oauth2Client = getGoogleOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// Get Google Ads accounts
export async function getGoogleAdAccounts(accessToken: string, refreshToken?: string) {
  const oauth2Client = getGoogleOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  
  try {
    // In a real implementation, you would use the Google Ads API
    // For now, we'll simulate the response
    // const googleAds = google.ads({ version: 'v14', auth: oauth2Client });
    
    // Simulated response
    return [
      {
        id: 'google-ads-account-1',
        name: 'Main Google Ads Account',
        currency: 'USD',
        status: 'ENABLED',
      },
    ];
  } catch (error) {
    console.error('Error fetching Google Ads accounts:', error);
    throw error;
  }
}

// Save Google ad account
export async function saveGoogleAdAccount(
  organizationId: string,
  accountData: {
    accountId: string;
    accountName: string;
    accessToken: string;
    refreshToken: string;
  }
) {
  const encryptedAccessToken = encrypt(accountData.accessToken);
  const encryptedRefreshToken = encrypt(accountData.refreshToken);
  
  return prisma.adAccount.create({
    data: {
      organizationId,
      platform: 'google',
      accountId: accountData.accountId,
      accountName: accountData.accountName,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
    },
  });
}

// Get Google campaigns
export async function getGoogleCampaigns(adAccountId: string) {
  const adAccount = await prisma.adAccount.findUnique({
    where: { id: adAccountId },
  });
  
  if (!adAccount || adAccount.platform !== 'google') {
    throw new Error('Invalid Google ad account');
  }
  
  const accessToken = decrypt(adAccount.accessToken);
  const refreshToken = adAccount.refreshToken ? decrypt(adAccount.refreshToken) : undefined;
  
  const oauth2Client = getGoogleOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  
  try {
    // In a real implementation, you would use the Google Ads API
    // For now, we'll return simulated data
    return [
      {
        platformId: 'google-campaign-1',
        name: 'Search Campaign - Services',
        status: 'active',
        budget: 50.00,
        spent: 423.50,
        impressions: 12500,
        clicks: 350,
        conversions: 15,
        startDate: new Date('2024-01-01'),
        endDate: null,
      },
      {
        platformId: 'google-campaign-2',
        name: 'Display Campaign - Remarketing',
        status: 'paused',
        budget: 30.00,
        spent: 156.25,
        impressions: 45000,
        clicks: 125,
        conversions: 5,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-03-31'),
      },
    ];
  } catch (error) {
    console.error('Error fetching Google campaigns:', error);
    throw error;
  }
}

// Create Google campaign
export async function createGoogleCampaign(
  adAccountId: string,
  campaignData: {
    name: string;
    type: string; // SEARCH, DISPLAY, VIDEO, SHOPPING
    budget: number;
    biddingStrategy: string;
    startDate: Date;
    endDate?: Date;
  }
) {
  const adAccount = await prisma.adAccount.findUnique({
    where: { id: adAccountId },
  });
  
  if (!adAccount || adAccount.platform !== 'google') {
    throw new Error('Invalid Google ad account');
  }
  
  const accessToken = decrypt(adAccount.accessToken);
  const refreshToken = adAccount.refreshToken ? decrypt(adAccount.refreshToken) : undefined;
  
  const oauth2Client = getGoogleOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  
  try {
    // In a real implementation, you would create the campaign via Google Ads API
    // For now, we'll simulate the creation
    const campaignId = `google-campaign-${Date.now()}`;
    
    // Save to database
    const campaign = await prisma.adCampaign.create({
      data: {
        adAccountId,
        platformId: campaignId,
        name: campaignData.name,
        status: 'paused',
        budget: campaignData.budget,
        startDate: campaignData.startDate,
        endDate: campaignData.endDate,
      },
    });
    
    return campaign;
  } catch (error) {
    console.error('Error creating Google campaign:', error);
    throw error;
  }
}

// Update campaign status
export async function updateGoogleCampaignStatus(
  campaignId: string,
  status: 'active' | 'paused'
) {
  const campaign = await prisma.adCampaign.findUnique({
    where: { id: campaignId },
    include: { adAccount: true },
  });
  
  if (!campaign || campaign.adAccount.platform !== 'google') {
    throw new Error('Invalid Google campaign');
  }
  
  const accessToken = decrypt(campaign.adAccount.accessToken);
  const refreshToken = campaign.adAccount.refreshToken 
    ? decrypt(campaign.adAccount.refreshToken) 
    : undefined;
  
  const oauth2Client = getGoogleOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  
  try {
    // In a real implementation, you would update via Google Ads API
    // For now, we'll just update the database
    await prisma.adCampaign.update({
      where: { id: campaignId },
      data: { status },
    });
    
    return true;
  } catch (error) {
    console.error('Error updating Google campaign status:', error);
    throw error;
  }
}

// Sync campaigns from Google
export async function syncGoogleCampaigns(adAccountId: string) {
  const campaigns = await getGoogleCampaigns(adAccountId);
  
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

// Get Google Analytics tracking code
export function getGoogleAnalyticsCode(measurementId: string): string {
  return `
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${measurementId}');
</script>
<!-- End Google Analytics -->
  `;
}

// Get Google Ads conversion tracking code
export function getGoogleAdsConversionCode(
  conversionId: string,
  conversionLabel: string
): string {
  return `
<!-- Google Ads Conversion Tracking -->
<script>
  gtag('event', 'conversion', {
    'send_to': '${conversionId}/${conversionLabel}',
    'value': 1.0,
    'currency': 'USD'
  });
</script>
<!-- End Google Ads Conversion Tracking -->
  `;
}

// Track conversion
export function trackGoogleConversion(
  conversionId: string,
  conversionLabel: string,
  value?: number,
  currency?: string
) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'conversion', {
      'send_to': `${conversionId}/${conversionLabel}`,
      'value': value || 1.0,
      'currency': currency || 'USD',
    });
  }
}

// Get campaign performance data from Google Analytics
export async function getGoogleAnalyticsData(
  propertyId: string,
  startDate: string,
  endDate: string,
  dimensions: string[],
  metrics: string[]
) {
  // This would integrate with Google Analytics Data API
  // For now, return simulated data
  return {
    dimensions,
    metrics,
    rows: [
      {
        dimensionValues: ['google / cpc'],
        metricValues: ['1250', '45', '3.5%', '2.50'],
      },
    ],
  };
}