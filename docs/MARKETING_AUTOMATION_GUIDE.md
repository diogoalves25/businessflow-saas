# Marketing Automation Guide

## Overview

The Marketing Automation feature is a Premium tier ($99.99/mo) feature that provides comprehensive email and SMS marketing capabilities for BusinessFlow SaaS users.

## Features Implemented

### 1. Database Schema
- **MarketingCampaign**: Stores campaign information with JSON fields for flexible content
- **MarketingContact**: Customer database with opt-in tracking and segmentation tags
- **CampaignActivity**: Tracks all interactions (sent, opened, clicked, converted)
- **ContactPreference**: Granular communication preferences per contact

### 2. Marketing Dashboard (`/admin/marketing`)
- **Campaigns Tab**: Create and manage email/SMS campaigns
- **Contacts Tab**: Manage customer database with import/export
- **Segments Tab**: Pre-defined and custom audience segments
- **Automations Tab**: Automated campaign triggers
- **Templates Tab**: Email and SMS template library

### 3. Segmentation Engine
Pre-defined segments:
- Active Customers (booked in last 30 days)
- Lapsed Customers (60-180 days inactive)
- New Customers (joined in last 7 days)
- High Value Customers ($500+ spent)
- Email/SMS Only preferences

Features:
- Dynamic segment evaluation
- Contact syncing from bookings
- Tag-based organization
- Custom field support

### 4. Campaign Templates
Business-specific templates for:
- Welcome series (3-email onboarding)
- Win-back campaigns
- Review requests
- Seasonal promotions
- Appointment reminders

Variable substitution:
- `{{businessName}}`, `{{firstName}}`, `{{serviceName}}`
- `{{bookingUrl}}`, `{{discountCode}}`, `{{expiryDate}}`

### 5. Automation Triggers
Event-based automations:
- **Customer Created**: Triggers welcome series
- **Booking Completed**: Sends review request after 24 hours
- **Booking Cancelled**: Tags for win-back campaigns
- **Review Submitted**: Tags based on rating

Time-based automations:
- Scheduled campaigns
- Delayed follow-ups
- Recurring campaigns

### 6. Analytics & Reporting
Metrics tracked:
- Email opens (via tracking pixel)
- Link clicks (via redirect tracking)
- Conversions with revenue attribution
- Unsubscribes and bounces

Reports available:
- Campaign performance
- Contact engagement timeline
- Segment performance comparison
- Top performing campaigns

### 7. Integration with Existing Systems

#### Email (Resend)
- Marketing-specific sender with tracking
- Bulk email sending with rate limiting
- HTML email rendering with personalization
- Bounce and complaint handling

#### SMS (Twilio)
- Marketing SMS with opt-out compliance
- Bulk SMS sending with rate limiting
- Two-way messaging for STOP/START
- Delivery status tracking

### 8. Compliance Features

#### GDPR/CAN-SPAM Compliance
- Double opt-in support
- Granular consent tracking (email vs SMS)
- One-click unsubscribe links
- Preference center for subscribers
- Right to be forgotten support

#### Features:
- Automatic unsubscribe headers
- Opt-out keyword handling (STOP, UNSUBSCRIBE)
- Preference management page
- Audit trail for consent changes

## API Endpoints

### Campaign Management
- `GET/POST /api/marketing/campaigns` - List and create campaigns
- `GET /api/marketing/campaigns/[id]` - Get campaign details
- `POST /api/marketing/campaigns/[id]/send` - Send campaign

### Contact Management
- `GET/POST /api/marketing/contacts` - List and create contacts
- `POST /api/marketing/contacts/sync` - Sync from bookings
- `PUT /api/marketing/contacts/[id]` - Update contact
- `DELETE /api/marketing/contacts/[id]` - Delete contact

### Segmentation
- `GET /api/marketing/segments` - List available segments
- `POST /api/marketing/segments/evaluate` - Get contacts in segment

### Analytics
- `GET /api/marketing/analytics` - Overview analytics
- `GET /api/marketing/analytics?type=campaign&campaignId=[id]` - Campaign metrics
- `GET /api/marketing/analytics?type=timeline&days=30` - Engagement timeline

### Tracking
- `GET /api/marketing/track/open` - Email open tracking
- `GET /api/marketing/track/click` - Link click tracking
- `GET/POST /api/marketing/unsubscribe` - Handle unsubscribes

### Webhooks
- `POST /api/webhooks/marketing` - Handle marketing events

## Usage Examples

### Creating a Campaign
```typescript
const campaign = await fetch('/api/marketing/campaigns', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Summer Sale',
    type: 'both', // email and SMS
    targetAudience: {
      segmentId: 'active_customers',
      rules: [
        { field: 'totalSpent', operator: 'greater_than', value: 100 }
      ]
    },
    content: {
      email: {
        subject: 'Summer Sale - 20% Off!',
        body: '<h1>Summer Sale</h1>...',
      },
      sms: {
        message: 'Summer Sale! Get 20% off with code SUMMER20...',
      }
    },
    scheduledFor: '2024-06-01T10:00:00Z',
  })
});
```

### Tracking Conversions
```typescript
// When a customer makes a purchase from a campaign
await fetch('/api/marketing/track/conversion', {
  method: 'POST',
  body: JSON.stringify({
    campaignId: 'campaign_123',
    contactId: 'contact_456',
    value: 150.00,
    orderId: 'order_789',
  })
});
```

## Testing

### Email Testing
1. Navigate to `/admin/marketing`
2. Go to Templates tab
3. Click "Send Test" on any template
4. Enter your email address
5. Check for tracking pixel and unsubscribe links

### SMS Testing
1. Ensure Twilio credentials are configured
2. Create a test contact with your phone number
3. Send a test SMS campaign
4. Reply STOP to test opt-out
5. Reply START to test opt-in

### Automation Testing
1. Create a test customer account
2. Complete a test booking
3. Check for review request email after 24 hours
4. Verify automation activity logs

## Best Practices

1. **Segmentation**: Use specific segments rather than sending to all contacts
2. **Frequency**: Limit campaigns to avoid fatigue (1-2 per week max)
3. **Testing**: Always send test emails before launching campaigns
4. **Compliance**: Include unsubscribe links in every email
5. **Personalization**: Use merge tags for better engagement
6. **Analytics**: Track and optimize based on performance data

## Troubleshooting

### Emails Not Sending
- Check Resend API key configuration
- Verify contact has email opt-in
- Check campaign status (must be 'active')

### SMS Not Sending
- Verify Twilio credentials
- Check phone number format (+1 prefix for US)
- Ensure contact has SMS opt-in

### Tracking Not Working
- Verify NEXT_PUBLIC_APP_URL is set correctly
- Check that tracking pixels are not blocked
- Ensure campaign and contact IDs are valid

### Unsubscribe Issues
- Verify unsubscribe token generation secret
- Check that contact exists in database
- Ensure proper redirect URLs are configured