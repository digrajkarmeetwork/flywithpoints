import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Use service role client for webhook (no user context)
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getSubscriptionPeriod(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0];
  return {
    start: item?.current_period_start
      ? new Date(item.current_period_start * 1000).toISOString()
      : null,
    end: item?.current_period_end
      ? new Date(item.current_period_end * 1000).toISOString()
      : null,
  };
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = getAdminClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      const subscriptionId = session.subscription as string;

      if (userId && subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const period = getSubscriptionPeriod(subscription);

        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscriptionId,
          status: subscription.status,
          plan: 'premium',
          current_period_start: period.start,
          current_period_end: period.end,
        }, {
          onConflict: 'user_id',
        });
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const period = getSubscriptionPeriod(subscription);

      // Find user by customer ID
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (sub) {
        await supabase.from('subscriptions').update({
          status: subscription.status,
          current_period_start: period.start,
          current_period_end: period.end,
        }).eq('user_id', sub.user_id);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await supabase.from('subscriptions').update({
        status: 'canceled',
      }).eq('stripe_customer_id', customerId);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      await supabase.from('subscriptions').update({
        status: 'past_due',
      }).eq('stripe_customer_id', customerId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
