import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface WhiteLabelSettings {
  brandName: string;
  logoUrl?: string | null;
  primaryColor: string;
  emailFromName?: string | null;
  emailFromAddress?: string | null;
  removeBusinessFlowBranding: boolean;
}

interface Booking {
  id: string;
  date: Date;
  time: string;
  service: {
    name: string;
    duration: number;
  };
  customer: {
    email: string;
    firstName: string;
    lastName: string;
  };
  address: string;
  city: string;
  state: string;
  zipCode: string;
  finalPrice: number;
}

export async function sendBookingConfirmation(
  booking: Booking,
  whiteLabelSettings?: WhiteLabelSettings | null
) {
  const brandName = whiteLabelSettings?.brandName || 'BusinessFlow';
  const fromName = whiteLabelSettings?.emailFromName || brandName;
  const fromAddress = whiteLabelSettings?.emailFromAddress || 'noreply@businessflow.com';
  const primaryColor = whiteLabelSettings?.primaryColor || '#0066FF';
  const logoUrl = whiteLabelSettings?.logoUrl || null;
  const showPoweredBy = !whiteLabelSettings?.removeBusinessFlowBranding;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background-color: ${primaryColor};
          color: white;
          padding: 30px;
          text-align: center;
        }
        .logo {
          max-width: 200px;
          max-height: 60px;
          margin-bottom: 20px;
        }
        .content {
          padding: 40px 30px;
        }
        .booking-details {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: ${primaryColor};
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          ${logoUrl ? `<img src="${logoUrl}" alt="${brandName}" class="logo">` : `<h1>${brandName}</h1>`}
          <h2>Booking Confirmed!</h2>
        </div>
        
        <div class="content">
          <p>Dear ${booking.customer.firstName},</p>
          
          <p>Thank you for choosing ${brandName}! Your booking has been confirmed.</p>
          
          <div class="booking-details">
            <h3>Booking Details</h3>
            <div class="detail-row">
              <strong>Service:</strong>
              <span>${booking.service.name}</span>
            </div>
            <div class="detail-row">
              <strong>Date:</strong>
              <span>${new Date(booking.date).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <strong>Time:</strong>
              <span>${booking.time}</span>
            </div>
            <div class="detail-row">
              <strong>Duration:</strong>
              <span>${booking.service.duration} minutes</span>
            </div>
            <div class="detail-row">
              <strong>Location:</strong>
              <span>${booking.address}, ${booking.city}, ${booking.state} ${booking.zipCode}</span>
            </div>
            <div class="detail-row">
              <strong>Total:</strong>
              <span>$${booking.finalPrice}</span>
            </div>
          </div>
          
          <p>We'll send you a reminder 24 hours before your appointment.</p>
          
          <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
          
          <p>Best regards,<br>${brandName} Team</p>
        </div>
        
        <div class="footer">
          <p>Booking ID: ${booking.id}</p>
          ${showPoweredBy ? '<p>Powered by BusinessFlow</p>' : ''}
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: `${fromName} <${fromAddress}>`,
      to: booking.customer.email,
      subject: `Booking Confirmation - ${brandName}`,
      html,
    });
  } catch (error) {
    console.error('Failed to send booking confirmation email:', error);
    throw error;
  }
}

export async function sendBookingReminder(
  booking: Booking,
  whiteLabelSettings?: WhiteLabelSettings | null
) {
  const brandName = whiteLabelSettings?.brandName || 'BusinessFlow';
  const fromName = whiteLabelSettings?.emailFromName || brandName;
  const fromAddress = whiteLabelSettings?.emailFromAddress || 'noreply@businessflow.com';
  const primaryColor = whiteLabelSettings?.primaryColor || '#0066FF';
  const logoUrl = whiteLabelSettings?.logoUrl || null;
  const showPoweredBy = !whiteLabelSettings?.removeBusinessFlowBranding;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Reminder</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background-color: ${primaryColor};
          color: white;
          padding: 30px;
          text-align: center;
        }
        .logo {
          max-width: 200px;
          max-height: 60px;
          margin-bottom: 20px;
        }
        .content {
          padding: 40px 30px;
        }
        .reminder-box {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
        }
        .booking-details {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          ${logoUrl ? `<img src="${logoUrl}" alt="${brandName}" class="logo">` : `<h1>${brandName}</h1>`}
          <h2>Appointment Reminder</h2>
        </div>
        
        <div class="content">
          <p>Hi ${booking.customer.firstName},</p>
          
          <div class="reminder-box">
            <h3>⏰ Reminder: Your appointment is tomorrow!</h3>
          </div>
          
          <div class="booking-details">
            <h3>Appointment Details</h3>
            <div class="detail-row">
              <strong>Service:</strong>
              <span>${booking.service.name}</span>
            </div>
            <div class="detail-row">
              <strong>Date:</strong>
              <span>${new Date(booking.date).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <strong>Time:</strong>
              <span>${booking.time}</span>
            </div>
            <div class="detail-row">
              <strong>Location:</strong>
              <span>${booking.address}, ${booking.city}, ${booking.state} ${booking.zipCode}</span>
            </div>
          </div>
          
          <p>We look forward to seeing you!</p>
          
          <p>If you need to reschedule or cancel, please let us know as soon as possible.</p>
          
          <p>See you tomorrow!<br>${brandName} Team</p>
        </div>
        
        <div class="footer">
          ${showPoweredBy ? '<p>Powered by BusinessFlow</p>' : ''}
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: `${fromName} <${fromAddress}>`,
      to: booking.customer.email,
      subject: `Reminder: Your ${brandName} appointment is tomorrow`,
      html,
    });
  } catch (error) {
    console.error('Failed to send booking reminder email:', error);
    throw error;
  }
}