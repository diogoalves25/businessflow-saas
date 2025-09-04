// Email sending module
// This can be configured to use different providers: SendGrid, AWS SES, Resend, etc.

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: EmailAttachment[];
}

interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private provider: string;
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'console'; // console, sendgrid, ses, resend
    this.apiKey = process.env.EMAIL_API_KEY || '';
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@businessflow.app';
    this.fromName = process.env.EMAIL_FROM_NAME || 'BusinessFlow';
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    try {
      // Set default from address if not provided
      const from = options.from || `${this.fromName} <${this.fromEmail}>`;
      
      switch (this.provider) {
        case 'sendgrid':
          return this.sendWithSendGrid({ ...options, from });
        case 'ses':
          return this.sendWithSES({ ...options, from });
        case 'resend':
          return this.sendWithResend({ ...options, from });
        default:
          return this.sendToConsole({ ...options, from });
      }
    } catch (error) {
      console.error('Email send error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  private async sendToConsole(options: EmailOptions): Promise<EmailResult> {
    console.log('📧 Email (console mode):');
    console.log('From:', options.from);
    console.log('To:', Array.isArray(options.to) ? options.to.join(', ') : options.to);
    console.log('Subject:', options.subject);
    console.log('---');
    console.log(options.text || options.html || '(no content)');
    console.log('---');
    
    return {
      success: true,
      messageId: `console-${Date.now()}`,
    };
  }

  private async sendWithSendGrid(options: EmailOptions): Promise<EmailResult> {
    // In production, use @sendgrid/mail
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(this.apiKey);
    // const result = await sgMail.send({
    //   to: options.to,
    //   from: options.from,
    //   subject: options.subject,
    //   text: options.text,
    //   html: options.html,
    // });
    
    return {
      success: true,
      messageId: `sendgrid-${Date.now()}`,
    };
  }

  private async sendWithSES(options: EmailOptions): Promise<EmailResult> {
    // In production, use AWS SDK
    // const AWS = require('aws-sdk');
    // const ses = new AWS.SES({ region: process.env.AWS_REGION });
    
    return {
      success: true,
      messageId: `ses-${Date.now()}`,
    };
  }

  private async sendWithResend(options: EmailOptions): Promise<EmailResult> {
    // In production, use Resend SDK
    // const { Resend } = require('resend');
    // const resend = new Resend(this.apiKey);
    
    return {
      success: true,
      messageId: `resend-${Date.now()}`,
    };
  }

  // Template-based email sending
  async sendTemplate(
    templateId: string,
    to: string | string[],
    data: Record<string, any>,
    options?: Partial<EmailOptions>
  ): Promise<EmailResult> {
    const template = await this.getTemplate(templateId);
    
    if (!template) {
      return {
        success: false,
        error: `Template ${templateId} not found`,
      };
    }

    const html = this.renderTemplate(template.html, data);
    const text = template.text ? this.renderTemplate(template.text, data) : undefined;
    const subject = this.renderTemplate(template.subject, data);

    return this.send({
      to,
      subject,
      html,
      text,
      ...options,
    });
  }

  private async getTemplate(templateId: string): Promise<any> {
    // In production, fetch from database or template service
    const templates: Record<string, any> = {
      'booking-confirmation': {
        subject: 'Booking Confirmation - {{serviceName}}',
        html: `
          <h2>Booking Confirmed!</h2>
          <p>Hi {{customerName}},</p>
          <p>Your booking for {{serviceName}} has been confirmed.</p>
          <p><strong>Date:</strong> {{date}}<br>
          <strong>Time:</strong> {{time}}<br>
          <strong>Location:</strong> {{location}}</p>
          <p>We look forward to seeing you!</p>
        `,
        text: `Booking Confirmed!\n\nHi {{customerName}},\n\nYour booking for {{serviceName}} has been confirmed.\n\nDate: {{date}}\nTime: {{time}}\nLocation: {{location}}\n\nWe look forward to seeing you!`,
      },
      'welcome': {
        subject: 'Welcome to BusinessFlow!',
        html: `
          <h2>Welcome to BusinessFlow!</h2>
          <p>Hi {{name}},</p>
          <p>Thank you for joining BusinessFlow. We're excited to help you manage your business more efficiently.</p>
          <p>Get started by exploring your dashboard and setting up your first workflow.</p>
          <p>If you have any questions, don't hesitate to reach out!</p>
        `,
      },
    };

    return templates[templateId];
  }

  private renderTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Convenience functions
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  return emailService.send(options);
}

export async function sendEmailTemplate(
  templateId: string,
  to: string | string[],
  data: Record<string, any>,
  options?: Partial<EmailOptions>
): Promise<EmailResult> {
  return emailService.sendTemplate(templateId, to, data, options);
}

// Specific email functions
export async function sendBookingConfirmation(
  to: string,
  bookingDetails: {
    customerName: string;
    serviceName: string;
    date: string;
    time: string;
    location: string;
  }
): Promise<EmailResult> {
  return sendEmailTemplate('booking-confirmation', to, bookingDetails);
}