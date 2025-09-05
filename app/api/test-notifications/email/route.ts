import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { BookingConfirmationEmail } from '@/src/lib/email-templates/booking-confirmation';
import { prisma } from '@/src/lib/prisma';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    if (!resend) {
      return NextResponse.json(
        { error: 'Email service not configured. Please add RESEND_API_KEY to environment variables.' },
        { status: 500 }
      );
    }

    // Get user's organization
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { organization: true }
    });

    if (!dbUser?.organization) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 404 }
      );
    }

    // Send test email
    const emailHtml = await render(
      BookingConfirmationEmail({
        businessName: dbUser.organization.businessName,
        customerName: 'Test Customer',
        serviceName: 'Test Service',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        address: '123 Test Street, Test City, TS 12345',
        technicianName: 'Test Technician',
        notes: 'This is a test booking confirmation email',
        price: 99.99,
      })
    );

    const result = await resend.emails.send({
      from: `${dbUser.organization.businessName} <notifications@businessflow.com>`,
      to: email,
      subject: `Test Email - Booking Confirmation`,
      html: emailHtml,
    });

    return NextResponse.json({ 
      success: true, 
      messageId: result.data?.id || 'unknown',
      message: 'Test email sent successfully'
    });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send test email' },
      { status: 500 }
    );
  }
}