import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export const getStripeJs = () => {
  if (typeof window === 'undefined') {
    throw new Error('Stripe.js can only be loaded on the client side');
  }
  // This will be loaded dynamically on the client
  return import('@stripe/stripe-js').then(({ loadStripe }) => 
    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  );
};