import { Resend } from 'resend';
import twilio from 'twilio';
import { prisma } from '../prisma';
import { trackEmailOpen, trackLinkClick, handleUnsubscribe } from './analytics';

// Initialize services
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  campaignId?: string;
  contactId?: string;
  fromName?: string;
  replyTo?: string;
}

export interface SMSOptions {
  to: string;
  message: string;
  campaignId?: string;
  contactId?: string;
}

// Send marketing email with tracking
export async function sendMarketingEmail(options: EmailOptions): Promise<boolean> {
  if (!resend) {
    console.error('Resend API not configured');
    return false;
  }

  try {
    // Add tracking pixel and link tracking if campaign tracking is enabled
    let html = options.html;
    
    if (options.campaignId && options.contactId) {
      // Add tracking pixel
      const trackingPixel = `<img src="${process.env.NEXT_PUBLIC_APP_URL}/api/marketing/track/open?campaign=${options.campaignId}&contact=${options.contactId}" width="1" height="1" style="display:none;" />`;
      html = html.replace('</body>', `${trackingPixel}</body>`);
      
      // Replace links with tracking links
      html = html.replace(
        /href="(https?:\/\/[^"]+)"/g,
        (match, url) => {
          const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/marketing/track/click?campaign=${options.campaignId}&contact=${options.contactId}&url=${encodeURIComponent(url)}`;
          return `href="${trackingUrl}"`;
        }
      );
      
      // Add unsubscribe link if not present
      if (!html.includes('unsubscribe')) {
        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/marketing/unsubscribe?contact=${options.contactId}&token=${generateUnsubscribeToken(options.contactId)}`;
        const unsubscribeLink = `<p style="text-align: center; font-size: 12px; color: #666; margin-top: 20px;">
          <a href="${unsubscribeUrl}" style="color: #666;">Unsubscribe</a> | 
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/preferences?contact=${options.contactId}" style="color: #666;">Update Preferences</a>
        </p>`;
        html = html.replace('</body>', `${unsubscribeLink}</body>`);
      }
    }

    const result = await resend.emails.send({
      from: `${options.fromName || 'BusinessFlow'} <marketing@businessflow.com>`,
      to: options.to,
      subject: options.subject,
      html,
      reply_to: options.replyTo,
      headers: {
        'List-Unsubscribe': options.contactId 
          ? `<${process.env.NEXT_PUBLIC_APP_URL}/api/marketing/unsubscribe?contact=${options.contactId}>`
          : undefined,
      },
    });

    // Log activity
    if (options.campaignId && options.contactId) {
      await prisma.campaignActivity.create({
        data: {
          campaignId: options.campaignId,
          contactId: options.contactId,
          type: 'sent',
          metadata: { 
            channel: 'email',
            messageId: result.id,
            timestamp: new Date().toISOString(),
          },
        },
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to send marketing email:', error);
    return false;
  }
}

// Send marketing SMS
export async function sendMarketingSMS(options: SMSOptions): Promise<boolean> {
  if (!twilioClient) {
    console.error('Twilio not configured');
    return false;
  }

  try {
    // Ensure message includes opt-out instructions
    let message = options.message;
    if (!message.toLowerCase().includes('stop')) {
      message += ' Reply STOP to opt out.';
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: options.to,
    });

    // Log activity
    if (options.campaignId && options.contactId) {
      await prisma.campaignActivity.create({
        data: {
          campaignId: options.campaignId,
          contactId: options.contactId,
          type: 'sent',
          metadata: { 
            channel: 'sms',
            messageId: result.sid,
            timestamp: new Date().toISOString(),
          },
        },
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to send marketing SMS:', error);
    return false;
  }
}

// Generate secure unsubscribe token
function generateUnsubscribeToken(contactId: string): string {
  // In production, use a proper signing method
  const crypto = require('crypto');
  const secret = process.env.UNSUBSCRIBE_SECRET || 'default-secret';
  return crypto.createHmac('sha256', secret)
    .update(contactId)
    .digest('hex')
    .substring(0, 16);
}

// Verify unsubscribe token
export function verifyUnsubscribeToken(contactId: string, token: string): boolean {
  return generateUnsubscribeToken(contactId) === token;
}

// Handle SMS opt-out keywords
export async function handleSMSOptOut(phoneNumber: string, message: string) {
  const optOutKeywords = ['stop', 'unsubscribe', 'cancel', 'end', 'quit'];
  const normalizedMessage = message.toLowerCase().trim();
  
  if (optOutKeywords.includes(normalizedMessage)) {
    // Find contact by phone number
    const contact = await prisma.marketingContact.findFirst({
      where: { phone: phoneNumber },
    });

    if (contact) {
      await handleUnsubscribe(contact.id, 'sms');
      
      // Send confirmation
      if (twilioClient) {
        await twilioClient.messages.create({
          body: 'You have been unsubscribed from SMS messages. Reply START to re-subscribe.',
          from: process.env.TWILIO_PHONE_NUMBER!,
          to: phoneNumber,
        });
      }
    }
  } else if (normalizedMessage === 'start') {
    // Re-subscribe
    const contact = await prisma.marketingContact.findFirst({
      where: { phone: phoneNumber },
    });

    if (contact) {
      await prisma.marketingContact.update({
        where: { id: contact.id },
        data: { smsOptIn: true, subscribed: true },
      });

      // Send confirmation
      if (twilioClient) {
        await twilioClient.messages.create({
          body: 'Welcome back! You have been re-subscribed to SMS messages.',
          from: process.env.TWILIO_PHONE_NUMBER!,
          to: phoneNumber,
        });
      }
    }
  }
}

// Send bulk emails with rate limiting
export async function sendBulkEmails(
  emails: EmailOptions[],
  rateLimit: number = 10 // emails per second
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < emails.length; i += rateLimit) {
    const batch = emails.slice(i, i + rateLimit);
    
    const results = await Promise.all(
      batch.map(email => sendMarketingEmail(email))
    );

    sent += results.filter(r => r).length;
    failed += results.filter(r => !r).length;

    // Wait 1 second before next batch
    if (i + rateLimit < emails.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return { sent, failed };
}

// Send bulk SMS with rate limiting
export async function sendBulkSMS(
  messages: SMSOptions[],
  rateLimit: number = 1 // SMS per second (Twilio default)
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const message of messages) {
    const result = await sendMarketingSMS(message);
    
    if (result) {
      sent++;
    } else {
      failed++;
    }

    // Wait to respect rate limit
    await new Promise(resolve => setTimeout(resolve, 1000 / rateLimit));
  }

  return { sent, failed };
}

// Preview email template
export async function previewEmailTemplate(
  template: string,
  sampleData: Record<string, any>
): Promise<string> {
  // Replace template variables
  let preview = template;
  
  Object.entries(sampleData).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    preview = preview.replace(regex, value);
  });

  // Replace any remaining variables with placeholders
  preview = preview.replace(/{{(\w+)}}/g, '[[$1]]');

  return preview;
}

// Test email/SMS delivery
export async function testDelivery(
  type: 'email' | 'sms',
  to: string,
  organizationId: string
): Promise<{ success: boolean; error?: string }> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    return { success: false, error: 'Organization not found' };
  }

  try {
    if (type === 'email') {
      const success = await sendMarketingEmail({
        to,
        subject: 'Test Email from BusinessFlow',
        html: `
          <h2>Test Email</h2>
          <p>This is a test email from ${organization.businessName}.</p>
          <p>If you received this, your email integration is working correctly!</p>
        `,
        fromName: organization.businessName,
      });

      return { success };
    } else {
      const success = await sendMarketingSMS({
        to,
        message: `Test SMS from ${organization.businessName}. Your SMS integration is working!`,
      });

      return { success };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}