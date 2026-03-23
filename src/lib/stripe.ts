import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    searchResultsLimit: 3,
    features: [
      'Search award flights (3 results per query)',
      'Browse sweet spots',
      'Explore airlines',
    ],
  },
  premium: {
    name: 'Premium',
    price: 999, // $9.99 in cents
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    features: [
      'Unlimited search results',
      'Email alerts for availability',
      'AI portfolio optimization',
      'Transfer bonus notifications',
      'Priority support',
    ],
  },
} as const;
