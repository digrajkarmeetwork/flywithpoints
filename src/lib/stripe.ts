import Stripe from 'stripe';

// Lazily instantiate the Stripe client. Constructing it at module load would
// require STRIPE_SECRET_KEY at build time (during Next.js page-data collection),
// which crashes the build when the secret is only present at runtime. The Proxy
// defers construction until the first property access inside a request handler.
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    stripeInstance = new Stripe(apiKey);
  }
  return stripeInstance;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    const instance = getStripe();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

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
