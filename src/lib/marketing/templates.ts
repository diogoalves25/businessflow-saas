import { BusinessType } from '@prisma/client';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  preheader?: string;
  body: string;
  category: 'welcome' | 'winback' | 'promotion' | 'review' | 'referral' | 'reminder' | 'seasonal';
  variables: string[];
}

export interface SmsTemplate {
  id: string;
  name: string;
  message: string;
  category: 'welcome' | 'winback' | 'promotion' | 'review' | 'referral' | 'reminder' | 'appointment';
  variables: string[];
}

export interface CampaignSeries {
  id: string;
  name: string;
  description: string;
  templates: {
    email?: EmailTemplate;
    sms?: SmsTemplate;
    delayDays: number;
  }[];
}

// Get templates by business type
export function getTemplatesForBusiness(businessType: BusinessType) {
  const baseTemplates = getBaseTemplates();
  const customTemplates = BUSINESS_SPECIFIC_TEMPLATES[businessType] || {};
  
  return {
    email: { ...baseTemplates.email, ...customTemplates.email },
    sms: { ...baseTemplates.sms, ...customTemplates.sms },
    series: { ...baseTemplates.series, ...customTemplates.series },
  };
}

// Base templates for all businesses
function getBaseTemplates() {
  return {
    email: {
      welcome_1: {
        id: 'welcome_1',
        name: 'Welcome Email',
        subject: 'Welcome to {{businessName}}!',
        preheader: 'Thank you for choosing us',
        body: `
          <h1>Welcome to {{businessName}}!</h1>
          <p>Hi {{firstName}},</p>
          <p>We're thrilled to have you as our newest customer. At {{businessName}}, we're committed to providing you with exceptional service.</p>
          <p>Here's what you can expect:</p>
          <ul>
            <li>Professional, reliable service</li>
            <li>Easy online booking</li>
            <li>Transparent pricing</li>
            <li>100% satisfaction guarantee</li>
          </ul>
          <p>Ready to book your first service?</p>
          <a href="{{bookingUrl}}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Book Now</a>
          <p>If you have any questions, don't hesitate to reach out!</p>
          <p>Best regards,<br>The {{businessName}} Team</p>
        `,
        category: 'welcome' as const,
        variables: ['businessName', 'firstName', 'bookingUrl'],
      },
      winback_1: {
        id: 'winback_1',
        name: 'Win-Back Campaign',
        subject: 'We miss you, {{firstName}}!',
        preheader: 'Here\'s a special offer just for you',
        body: `
          <h1>We Miss You!</h1>
          <p>Hi {{firstName}},</p>
          <p>It's been a while since your last visit, and we wanted to check in. We hope everything is going well!</p>
          <p>To welcome you back, we're offering you an exclusive <strong>{{discountPercent}}% discount</strong> on your next service.</p>
          <p>Use code: <strong>{{discountCode}}</strong></p>
          <a href="{{bookingUrl}}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Book Now & Save</a>
          <p>This offer expires on {{expiryDate}}, so don't wait too long!</p>
          <p>Looking forward to seeing you soon,<br>The {{businessName}} Team</p>
        `,
        category: 'winback' as const,
        variables: ['businessName', 'firstName', 'discountPercent', 'discountCode', 'expiryDate', 'bookingUrl'],
      },
      review_request_1: {
        id: 'review_request_1',
        name: 'Review Request',
        subject: 'How was your experience with {{businessName}}?',
        preheader: 'Your feedback helps us improve',
        body: `
          <h1>Thank You for Choosing {{businessName}}!</h1>
          <p>Hi {{firstName}},</p>
          <p>We hope you had a great experience with your recent {{serviceName}} on {{serviceDate}}.</p>
          <p>Your feedback is incredibly valuable to us and helps other customers make informed decisions.</p>
          <p>Would you mind taking a moment to share your experience?</p>
          <a href="{{reviewUrl}}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Leave a Review</a>
          <p>It only takes a minute, and we truly appreciate your time!</p>
          <p>Thank you,<br>The {{businessName}} Team</p>
        `,
        category: 'review' as const,
        variables: ['businessName', 'firstName', 'serviceName', 'serviceDate', 'reviewUrl'],
      },
    },
    sms: {
      appointment_reminder: {
        id: 'appointment_reminder',
        name: 'Appointment Reminder',
        message: 'Hi {{firstName}}, this is a reminder about your {{serviceName}} appointment tomorrow at {{time}}. Reply CONFIRM to confirm or RESCHEDULE to change. - {{businessName}}',
        category: 'appointment' as const,
        variables: ['firstName', 'serviceName', 'time', 'businessName'],
      },
      welcome_sms: {
        id: 'welcome_sms',
        name: 'Welcome SMS',
        message: 'Welcome to {{businessName}}! Save this number for easy booking. Text BOOK to schedule your first appointment. Reply STOP to opt out.',
        category: 'welcome' as const,
        variables: ['businessName'],
      },
      promotion_sms: {
        id: 'promotion_sms',
        name: 'Promotion SMS',
        message: '{{businessName}}: {{promotionText}} Use code {{code}} by {{expiryDate}}. Book now: {{bookingUrl}} Reply STOP to opt out.',
        category: 'promotion' as const,
        variables: ['businessName', 'promotionText', 'code', 'expiryDate', 'bookingUrl'],
      },
    },
    series: {
      welcome_series: {
        id: 'welcome_series',
        name: 'Welcome Series',
        description: 'A 3-email series to onboard new customers',
        templates: [
          {
            email: {
              id: 'welcome_series_1',
              name: 'Welcome Email',
              subject: 'Welcome to {{businessName}}!',
              body: 'Welcome email content...',
              category: 'welcome' as const,
              variables: ['businessName', 'firstName'],
            },
            delayDays: 0,
          },
          {
            email: {
              id: 'welcome_series_2',
              name: 'Get to Know Us',
              subject: 'Get to know the {{businessName}} team',
              body: 'Team introduction content...',
              category: 'welcome' as const,
              variables: ['businessName'],
            },
            delayDays: 3,
          },
          {
            email: {
              id: 'welcome_series_3',
              name: 'First Booking Incentive',
              subject: 'Ready for your first appointment? Here\'s 15% off!',
              body: 'Booking incentive content...',
              category: 'promotion' as const,
              variables: ['businessName', 'discountCode'],
            },
            sms: {
              id: 'welcome_series_sms_3',
              name: 'First Booking SMS',
              message: '{{businessName}}: Ready to book? Use code FIRST15 for 15% off your first service! Book: {{bookingUrl}}',
              category: 'promotion' as const,
              variables: ['businessName', 'bookingUrl'],
            },
            delayDays: 7,
          },
        ],
      },
    },
  };
}

// Business-specific templates
const BUSINESS_SPECIFIC_TEMPLATES: Record<string, any> = {
  'nail-salon': {
    email: {
      seasonal_summer: {
        id: 'nail_summer',
        name: 'Summer Nail Trends',
        subject: '☀️ Summer nail trends are here!',
        preheader: 'Get ready for summer with these hot styles',
        body: `
          <h1>Summer Nail Trends at {{businessName}}</h1>
          <p>Hi {{firstName}},</p>
          <p>Summer is here, and it's time to show off those beautiful nails! Check out this season's hottest trends:</p>
          <ul>
            <li>🌺 Bright coral and sunset orange</li>
            <li>🌊 Ocean-inspired blues and teals</li>
            <li>✨ Glitter accents and chrome finishes</li>
            <li>🌴 Tropical nail art designs</li>
          </ul>
          <p>Book your summer mani-pedi combo and save {{discountPercent}}%!</p>
          <a href="{{bookingUrl}}" style="background-color: #EC4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Book Summer Special</a>
        `,
        category: 'seasonal' as const,
        variables: ['businessName', 'firstName', 'discountPercent', 'bookingUrl'],
      },
    },
  },
  'barbershop': {
    email: {
      beard_maintenance: {
        id: 'beard_maintenance',
        name: 'Beard Maintenance Tips',
        subject: 'Keep your beard looking sharp',
        body: `
          <h1>Beard Care Tips from {{businessName}}</h1>
          <p>Hey {{firstName}},</p>
          <p>A great beard requires great care. Here are our pro tips:</p>
          <ul>
            <li>Use beard oil daily to keep it soft</li>
            <li>Trim every 2-3 weeks for optimal shape</li>
            <li>Don't forget to maintain the neckline</li>
          </ul>
          <p>Due for a trim? Book your appointment today!</p>
          <a href="{{bookingUrl}}" style="background-color: #1F2937; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Book Now</a>
        `,
        category: 'reminder' as const,
        variables: ['businessName', 'firstName', 'bookingUrl'],
      },
    },
    sms: {
      beard_reminder: {
        id: 'beard_reminder',
        name: 'Beard Trim Reminder',
        message: 'Hey {{firstName}}, your beard is due for a trim! Book now at {{businessName}}: {{bookingUrl}}',
        category: 'reminder' as const,
        variables: ['firstName', 'businessName', 'bookingUrl'],
      },
    },
  },
  'hair-salon': {
    email: {
      color_maintenance: {
        id: 'color_maintenance',
        name: 'Color Touch-Up Reminder',
        subject: 'Time for your color touch-up!',
        body: `
          <h1>Keep Your Color Fresh</h1>
          <p>Hi {{firstName}},</p>
          <p>It's been {{weeksSinceService}} weeks since your last color service. To keep your color looking vibrant, we recommend scheduling a touch-up.</p>
          <p>Book this week and receive a complimentary deep conditioning treatment!</p>
          <a href="{{bookingUrl}}" style="background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Schedule Touch-Up</a>
        `,
        category: 'reminder' as const,
        variables: ['businessName', 'firstName', 'weeksSinceService', 'bookingUrl'],
      },
    },
  },
  'house-cleaning': {
    email: {
      spring_cleaning: {
        id: 'spring_cleaning',
        name: 'Spring Cleaning Special',
        subject: '🌸 Spring cleaning time!',
        body: `
          <h1>Spring Cleaning Special</h1>
          <p>Hi {{firstName}},</p>
          <p>Spring is the perfect time for a deep clean! Our spring cleaning service includes:</p>
          <ul>
            <li>Window cleaning (inside)</li>
            <li>Baseboard deep clean</li>
            <li>Appliance detailing</li>
            <li>And more!</li>
          </ul>
          <p>Book by {{expiryDate}} and save {{discountPercent}}%!</p>
          <a href="{{bookingUrl}}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Book Spring Cleaning</a>
        `,
        category: 'seasonal' as const,
        variables: ['businessName', 'firstName', 'expiryDate', 'discountPercent', 'bookingUrl'],
      },
    },
  },
};

// Replace variables in template
export function renderTemplate(
  template: EmailTemplate | SmsTemplate,
  variables: Record<string, string>
): string {
  let content = 'body' in template ? template.body : template.message;
  let subject = 'subject' in template ? template.subject : '';

  // Replace all variables
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    content = content.replace(regex, value);
    if (subject) {
      subject = subject.replace(regex, value);
    }
  });

  return 'body' in template 
    ? JSON.stringify({ subject, body: content })
    : content;
}

// Validate that all required variables are provided
export function validateTemplateVariables(
  template: EmailTemplate | SmsTemplate,
  variables: Record<string, string>
): { valid: boolean; missing: string[] } {
  const missing = template.variables.filter(v => !variables[v]);
  return {
    valid: missing.length === 0,
    missing,
  };
}