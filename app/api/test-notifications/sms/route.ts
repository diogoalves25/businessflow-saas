import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';
import twilio from 'twilio';
import { prisma } from '@/src/lib/prisma';
import { canAccessFeature, getPlanFromPriceId } from '@/src/lib/feature-gating';

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

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

    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
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

    // Check if plan includes SMS
    const plan = getPlanFromPriceId(dbUser.organization.stripePriceId);
    if (!canAccessFeature(plan, 'hasMarketingTools')) {
      return NextResponse.json(
        { error: 'SMS notifications require Growth plan or higher' },
        { status: 403 }
      );
    }

    if (!twilioClient) {
      return NextResponse.json(
        { error: 'SMS service not configured. Please add Twilio credentials to environment variables.' },
        { status: 500 }
      );
    }

    // Send test SMS
    const message = await twilioClient.messages.create({
      body: `${dbUser.organization.businessName}: This is a test SMS notification. Your booking reminders will look similar to this. Reply STOP to unsubscribe.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });

    return NextResponse.json({ 
      success: true, 
      messageId: message.sid,
      message: 'Test SMS sent successfully'
    });
  } catch (error) {
    console.error('Test SMS error:', error);
    
    // Handle Twilio-specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      const twilioError = error as any;
      if (twilioError.code === 21211) {
        return NextResponse.json(
          { error: 'Invalid phone number format. Please include country code (e.g., +1 for US).' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send test SMS' },
      { status: 500 }
    );
  }
}