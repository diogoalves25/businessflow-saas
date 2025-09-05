import { Resend } from 'resend';
import twilio from 'twilio';
import { render } from '@react-email/render';
import { BookingConfirmationEmail } from './email-templates/booking-confirmation';
import { BookingReminderEmail } from './email-templates/booking-reminder';
import { WelcomeEmail } from './email-templates/welcome';
import { prisma } from './prisma';
import { canAccessFeature, getPlanFromPriceId } from './feature-gating';

// Initialize services
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

interface NotificationOptions {
  organizationId: string;
  to: {
    email?: string;
    phone?: string;
  };
}

interface BookingDetails {
  id: string;
  serviceName: string;
  customerName: string;
  scheduledDate: Date;
  address?: string;
  technicianName?: string;
  notes?: string;
  price?: number;
}

export class NotificationService {
  static async sendBookingConfirmation(
    options: NotificationOptions,
    booking: BookingDetails
  ) {
    const organization = await prisma.organization.findUnique({
      where: { id: options.organizationId }
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    const plan = getPlanFromPriceId(organization.stripePriceId);
    const preferences = (organization.notificationPreferences as any) || {};

    // Send email confirmation (all tiers)
    if (options.to.email && resend && preferences.emailReminders !== false) {
      try {
        const emailHtml = await render(
          BookingConfirmationEmail({
            businessName: organization.businessName,
            customerName: booking.customerName,
            serviceName: booking.serviceName,
            scheduledDate: booking.scheduledDate,
            address: booking.address,
            technicianName: booking.technicianName,
            notes: booking.notes,
            price: booking.price,
          })
        );

        await resend.emails.send({
          from: `${organization.businessName} <notifications@businessflow.com>`,
          to: options.to.email,
          subject: `Booking Confirmed - ${booking.serviceName}`,
          html: emailHtml,
        });
      } catch (error) {
        console.error('Failed to send booking confirmation email:', error);
      }
    }

    // Send SMS confirmation (Growth+ only)
    if (
      options.to.phone && 
      twilioClient && 
      preferences.smsReminders !== false &&
      canAccessFeature(plan, 'hasMarketingTools')
    ) {
      try {
        const scheduledTime = new Date(booking.scheduledDate).toLocaleString('en-US', {
          dateStyle: 'short',
          timeStyle: 'short'
        });

        await twilioClient.messages.create({
          body: `${organization.businessName}: Your ${booking.serviceName} is confirmed for ${scheduledTime}. Reply STOP to unsubscribe.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: options.to.phone
        });
      } catch (error) {
        console.error('Failed to send booking confirmation SMS:', error);
      }
    }

    // Mark confirmation as sent
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        confirmationSentAt: new Date(),
      }
    });
  }

  static async sendBookingReminder(
    options: NotificationOptions,
    booking: BookingDetails
  ) {
    const organization = await prisma.organization.findUnique({
      where: { id: options.organizationId }
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    const plan = getPlanFromPriceId(organization.stripePriceId);
    const preferences = (organization.notificationPreferences as any) || {};

    // Send email reminder
    if (options.to.email && resend && preferences.emailReminders !== false) {
      try {
        const emailHtml = await render(
          BookingReminderEmail({
            businessName: organization.businessName,
            customerName: booking.customerName,
            serviceName: booking.serviceName,
            scheduledDate: booking.scheduledDate,
            address: booking.address,
            technicianName: booking.technicianName,
          })
        );

        await resend.emails.send({
          from: `${organization.businessName} <notifications@businessflow.com>`,
          to: options.to.email,
          subject: `Reminder: ${booking.serviceName} Tomorrow`,
          html: emailHtml,
        });
      } catch (error) {
        console.error('Failed to send booking reminder email:', error);
      }
    }

    // Send SMS reminder (Growth+ only)
    if (
      options.to.phone && 
      twilioClient && 
      preferences.smsReminders !== false &&
      canAccessFeature(plan, 'hasMarketingTools')
    ) {
      try {
        const scheduledTime = new Date(booking.scheduledDate).toLocaleString('en-US', {
          timeStyle: 'short'
        });

        await twilioClient.messages.create({
          body: `Reminder: Your ${booking.serviceName} is scheduled for tomorrow at ${scheduledTime}. ${booking.technicianName ? `${booking.technicianName} will be your technician.` : ''}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: options.to.phone
        });
      } catch (error) {
        console.error('Failed to send booking reminder SMS:', error);
      }
    }

    // Mark reminder as sent
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        reminderSentAt: new Date(),
      }
    });
  }

  static async sendBookingCancellation(
    options: NotificationOptions,
    booking: BookingDetails
  ) {
    const organization = await prisma.organization.findUnique({
      where: { id: options.organizationId }
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    const preferences = (organization.notificationPreferences as any) || {};

    // Send cancellation email
    if (options.to.email && resend && preferences.emailReminders !== false) {
      try {
        await resend.emails.send({
          from: `${organization.businessName} <notifications@businessflow.com>`,
          to: options.to.email,
          subject: `Booking Cancelled - ${booking.serviceName}`,
          html: `
            <h2>Booking Cancelled</h2>
            <p>Dear ${booking.customerName},</p>
            <p>Your ${booking.serviceName} scheduled for ${new Date(booking.scheduledDate).toLocaleString()} has been cancelled.</p>
            <p>If you'd like to reschedule, please contact us.</p>
            <p>Best regards,<br>${organization.businessName}</p>
          `,
        });
      } catch (error) {
        console.error('Failed to send cancellation email:', error);
      }
    }
  }

  static async sendWelcomeEmail(
    email: string,
    organization: {
      id: string;
      businessName: string;
      ownerName: string;
      plan?: string;
    }
  ) {
    if (!resend) return;

    try {
      const emailHtml = await render(
        WelcomeEmail({
          businessName: organization.businessName,
          ownerName: organization.ownerName,
          plan: organization.plan || 'trial',
        })
      );

      await resend.emails.send({
        from: 'BusinessFlow <welcome@businessflow.com>',
        to: email,
        subject: `Welcome to BusinessFlow, ${organization.businessName}!`,
        html: emailHtml,
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  }

  static async updateNotificationPreferences(
    organizationId: string,
    preferences: {
      emailReminders?: boolean;
      smsReminders?: boolean;
      marketingEmails?: boolean;
    }
  ) {
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        notificationPreferences: preferences,
      }
    });
  }
}