import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/src/lib/stripe';
import { prisma } from '@/src/lib/prisma';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await prisma.organization.update({
          where: { stripeCustomerId: subscription.customer as string },
          data: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            subscriptionStatus: subscription.status,
            subscriptionEndsAt: (subscription as any).current_period_end 
              ? new Date((subscription as any).current_period_end * 1000)
              : null,
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await prisma.organization.update({
          where: { stripeCustomerId: subscription.customer as string },
          data: {
            subscriptionStatus: 'canceled',
            subscriptionEndsAt: new Date((subscription as any).current_period_end * 1000),
          },
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if ((invoice as any).subscription) {
          await prisma.organization.update({
            where: { stripeCustomerId: invoice.customer as string },
            data: {
              subscriptionStatus: 'past_due',
            },
          });
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription' && session.subscription) {
          // Update organization with subscription details
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          await prisma.organization.update({
            where: { id: session.metadata?.organizationId },
            data: {
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0].price.id,
              subscriptionStatus: subscription.status,
              trialEndsAt: (subscription as any).trial_end 
                ? new Date((subscription as any).trial_end * 1000)
                : null,
              subscriptionEndsAt: new Date((subscription as any).current_period_end * 1000),
            },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Stripe webhooks need the raw body
export const config = {
  api: {
    bodyParser: false,
  },
};