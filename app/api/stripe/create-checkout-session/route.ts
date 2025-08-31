import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/src/lib/stripe';
import { prisma } from '@/src/lib/prisma';
import { createClient } from '@/src/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { priceId, organizationId } = await request.json();

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

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Create or retrieve Stripe customer
    let customerId = organization.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: organization.email,
        name: organization.businessName,
        metadata: {
          organizationId: organization.id,
        },
      });

      // Save the Stripe customer ID
      await prisma.organization.update({
        where: { id: organization.id },
        data: { stripeCustomerId: customer.id },
      });

      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing`,
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          organizationId: organization.id,
        },
      },
      metadata: {
        organizationId: organization.id,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}