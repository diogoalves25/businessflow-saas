import { prisma } from '../prisma';
import { sendEmail } from '../email';
import { sendSMS } from '../sms';
import { renderTemplate } from './templates';
import { evaluateSegment, Segment } from './segmentation';
import { addDays } from 'date-fns';

export interface AutomationTrigger {
  id: string;
  name: string;
  type: 'event' | 'time' | 'segment';
  event?: 'booking_completed' | 'booking_cancelled' | 'customer_created' | 'review_submitted';
  timeDelay?: number; // in hours
  segment?: Segment;
  actions: AutomationAction[];
}

export interface AutomationAction {
  type: 'email' | 'sms' | 'tag' | 'wait';
  templateId?: string;
  tag?: string;
  waitDays?: number;
}

// Predefined automations
export const AUTOMATIONS: Record<string, AutomationTrigger> = {
  welcome_series: {
    id: 'welcome_series',
    name: 'Welcome Series',
    type: 'event',
    event: 'customer_created',
    actions: [
      { type: 'email', templateId: 'welcome_1' },
      { type: 'tag', tag: 'welcome_sent' },
      { type: 'wait', waitDays: 3 },
      { type: 'email', templateId: 'welcome_2' },
      { type: 'wait', waitDays: 4 },
      { type: 'email', templateId: 'welcome_3' },
      { type: 'sms', templateId: 'welcome_sms' },
    ],
  },
  
  review_request: {
    id: 'review_request',
    name: 'Review Request',
    type: 'event',
    event: 'booking_completed',
    timeDelay: 24, // 24 hours after booking
    actions: [
      { type: 'email', templateId: 'review_request_1' },
      { type: 'wait', waitDays: 3 },
      { type: 'sms', templateId: 'review_reminder' },
    ],
  },
  
  win_back: {
    id: 'win_back',
    name: 'Win-Back Campaign',
    type: 'segment',
    segment: {
      name: 'Lapsed Customers',
      rules: [
        { field: 'lastBooking', operator: 'less_than', value: addDays(new Date(), -60) },
        { field: 'lastBooking', operator: 'greater_than', value: addDays(new Date(), -180) },
      ],
      logic: 'AND',
    },
    actions: [
      { type: 'email', templateId: 'winback_1' },
      { type: 'tag', tag: 'winback_sent' },
    ],
  },
};

// Process automation triggers
export async function processAutomationTrigger(
  organizationId: string,
  triggerId: string,
  eventData?: any
) {
  const automation = AUTOMATIONS[triggerId];
  if (!automation) {
    console.error(`Automation trigger ${triggerId} not found`);
    return;
  }

  // Get organization details
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    console.error(`Organization ${organizationId} not found`);
    return;
  }

  // Get contacts based on trigger type
  let contacts: any[] = [];
  
  if (automation.type === 'event' && eventData?.contactId) {
    // Event-based trigger - single contact
    const contact = await prisma.marketingContact.findUnique({
      where: { id: eventData.contactId },
    });
    if (contact) contacts = [contact];
  } else if (automation.type === 'segment' && automation.segment) {
    // Segment-based trigger - multiple contacts
    contacts = await evaluateSegment(organizationId, automation.segment);
  }

  // Process actions for each contact
  for (const contact of contacts) {
    await processAutomationActions(
      organization,
      contact,
      automation.actions,
      automation.id
    );
  }
}

async function processAutomationActions(
  organization: any,
  contact: any,
  actions: AutomationAction[],
  automationId: string
) {
  for (const action of actions) {
    switch (action.type) {
      case 'email':
        if (contact.emailOptIn && action.templateId) {
          await sendMarketingEmail(organization, contact, action.templateId);
        }
        break;
        
      case 'sms':
        if (contact.smsOptIn && contact.phone && action.templateId) {
          await sendMarketingSMS(organization, contact, action.templateId);
        }
        break;
        
      case 'tag':
        if (action.tag) {
          await addTagToContact(contact.id, action.tag);
        }
        break;
        
      case 'wait':
        // In a real implementation, this would schedule the next actions
        // For now, we'll skip the wait
        break;
    }
    
    // Log the activity
    await logAutomationActivity(contact.id, automationId, action);
  }
}

async function sendMarketingEmail(
  organization: any,
  contact: any,
  templateId: string
) {
  try {
    // Get template from templates library
    const templates = await import('./templates');
    const businessTemplates = templates.getTemplatesForBusiness(organization.businessType);
    const template = businessTemplates.email[templateId];
    
    if (!template) {
      console.error(`Email template ${templateId} not found`);
      return;
    }

    // Prepare variables
    const variables = {
      businessName: organization.businessName,
      firstName: contact.firstName || 'there',
      lastName: contact.lastName || '',
      email: contact.email,
      bookingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/book`,
      unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=${contact.id}`,
    };

    // Render template
    const renderedContent = JSON.parse(renderTemplate(template, variables));

    // Send email
    await sendEmail({
      to: contact.email,
      subject: renderedContent.subject,
      html: renderedContent.body,
    });

    // Log activity
    await prisma.campaignActivity.create({
      data: {
        campaignId: `automation_${templateId}`,
        contactId: contact.id,
        type: 'sent',
        metadata: { channel: 'email', templateId },
      },
    });
  } catch (error) {
    console.error('Failed to send marketing email:', error);
  }
}

async function sendMarketingSMS(
  organization: any,
  contact: any,
  templateId: string
) {
  try {
    // Get template from templates library
    const templates = await import('./templates');
    const businessTemplates = templates.getTemplatesForBusiness(organization.businessType);
    const template = businessTemplates.sms[templateId];
    
    if (!template) {
      console.error(`SMS template ${templateId} not found`);
      return;
    }

    // Prepare variables
    const variables = {
      businessName: organization.businessName,
      firstName: contact.firstName || 'there',
      bookingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/book`,
    };

    // Render template
    const message = renderTemplate(template, variables);

    // Send SMS
    await sendSMS(contact.phone, message);

    // Log activity
    await prisma.campaignActivity.create({
      data: {
        campaignId: `automation_${templateId}`,
        contactId: contact.id,
        type: 'sent',
        metadata: { channel: 'sms', templateId },
      },
    });
  } catch (error) {
    console.error('Failed to send marketing SMS:', error);
  }
}

async function addTagToContact(contactId: string, tag: string) {
  const contact = await prisma.marketingContact.findUnique({
    where: { id: contactId },
  });
  
  if (contact && !contact.tags.includes(tag)) {
    await prisma.marketingContact.update({
      where: { id: contactId },
      data: {
        tags: {
          push: tag,
        },
      },
    });
  }
}

async function logAutomationActivity(
  contactId: string,
  automationId: string,
  action: AutomationAction
) {
  await prisma.campaignActivity.create({
    data: {
      campaignId: `automation_${automationId}`,
      contactId,
      type: 'automation_action',
      metadata: action,
    },
  });
}

// Check and run scheduled automations
export async function runScheduledAutomations() {
  // This would be called by a cron job or background worker
  // For now, it's a placeholder
  
  // 1. Check for scheduled campaigns that need to be sent
  const campaignsToSend = await prisma.marketingCampaign.findMany({
    where: {
      status: 'scheduled',
      scheduledFor: {
        lte: new Date(),
      },
    },
  });

  for (const campaign of campaignsToSend) {
    await sendCampaign(campaign);
  }

  // 2. Check for segment-based automations
  // This would evaluate segments and trigger automations
}

async function sendCampaign(campaign: any) {
  // Get target contacts based on campaign audience
  const contacts = await evaluateSegment(
    campaign.organizationId,
    campaign.targetAudience
  );

  // Update campaign status
  await prisma.marketingCampaign.update({
    where: { id: campaign.id },
    data: {
      status: 'active',
      sentAt: new Date(),
    },
  });

  // Send to each contact
  for (const contact of contacts) {
    if (campaign.type === 'email' || campaign.type === 'both') {
      if (contact.emailOptIn && campaign.content.email) {
        // Send email
        await sendEmail({
          to: contact.email,
          subject: campaign.content.email.subject,
          html: campaign.content.email.body,
        });

        // Log activity
        await prisma.campaignActivity.create({
          data: {
            campaignId: campaign.id,
            contactId: contact.id,
            type: 'sent',
            metadata: { channel: 'email' },
          },
        });
      }
    }

    if (campaign.type === 'sms' || campaign.type === 'both') {
      if (contact.smsOptIn && contact.phone && campaign.content.sms) {
        // Send SMS
        await sendSMS(contact.phone, campaign.content.sms.message);

        // Log activity
        await prisma.campaignActivity.create({
          data: {
            campaignId: campaign.id,
            contactId: contact.id,
            type: 'sent',
            metadata: { channel: 'sms' },
          },
        });
      }
    }
  }

  // Update campaign status to completed
  await prisma.marketingCampaign.update({
    where: { id: campaign.id },
    data: { status: 'completed' },
  });
}