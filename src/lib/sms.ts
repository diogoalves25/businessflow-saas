import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function sendSMS(to: string, body: string): Promise<boolean> {
  if (!client || !fromNumber) {
    console.warn('Twilio not configured - skipping SMS');
    return false;
  }

  try {
    await client.messages.create({
      body,
      from: fromNumber,
      to,
    });
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}

export async function sendBulkSMS(
  recipients: Array<{ phone: string; message: string }>
): Promise<{ sent: number; failed: number }> {
  if (!client || !fromNumber) {
    console.warn('Twilio not configured - skipping bulk SMS');
    return { sent: 0, failed: recipients.length };
  }

  let sent = 0;
  let failed = 0;

  await Promise.all(
    recipients.map(async ({ phone, message }) => {
      try {
        await client.messages.create({
          body: message,
          from: fromNumber,
          to: phone,
        });
        sent++;
      } catch (error) {
        console.error(`Failed to send SMS to ${phone}:`, error);
        failed++;
      }
    })
  );

  return { sent, failed };
}

export function validatePhoneNumber(phone: string): boolean {
  // Basic phone number validation
  const phoneRegex = /^\+?1?\d{10,14}$/;
  return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Add +1 if not present and looks like a US number
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits[0] === '1') {
    return `+${digits}`;
  }
  
  return `+${digits}`;
}