import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/src/lib/stripe';
import { prisma } from '@/src/lib/prisma';
import { createClient } from '@/src/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please set up Stripe API keys.' },
        { status: 500 }
      );
    }

    const { organizationId } = await request.json();

    // Get the user from Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get organization
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization || !organization.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No billing account found' },
        { status: 404 }
      );
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: organization.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Portal session error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}