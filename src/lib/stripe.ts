import Stripe from 'stripe';

// Initialize Stripe only if the secret key is available
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
      typescript: true,
    })
  : null;

export const getStripeJs = () => {
  if (typeof window === 'undefined') {
    throw new Error('Stripe.js can only be loaded on the client side');
  }
  
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error('Stripe publishable key is not configured');
  }
  
  // This will be loaded dynamically on the client
  return import('@stripe/stripe-js').then(({ loadStripe }) => 
    loadStripe(publishableKey)
  );
};