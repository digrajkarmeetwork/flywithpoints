'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Crown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { toast } from 'sonner';
import { Suspense } from 'react';

const FREE_FEATURES = [
  'Search award flights (3 results per query)',
  'Browse sweet spots database',
  'Explore airlines & routes',
  'View loyalty program details',
];

const PREMIUM_FEATURES = [
  'Unlimited search results',
  'Email alerts for award availability',
  'AI portfolio optimization',
  'Transfer bonus notifications',
  'Priority support',
  'Advanced filters & sorting',
];

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isPremium, isLoading, fetchSubscription, startCheckout } = useSubscriptionStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  useEffect(() => {
    if (searchParams.get('subscription') === 'cancelled') {
      toast.info('Checkout cancelled. You can upgrade anytime.');
    }
  }, [searchParams]);

  const handleUpgrade = async () => {
    setIsCheckingOut(true);
    try {
      await startCheckout();
    } catch {
      toast.error('Failed to start checkout. Please try again.');
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="container mx-auto max-w-5xl px-4 pt-28 pb-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
            Pricing
          </Badge>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Unlock the Full Power of FlyWithPoints
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Start free and upgrade when you&apos;re ready to maximize your points and miles.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full border-slate-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-slate-600" />
                  <CardTitle className="text-xl">Free</CardTitle>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">$0</span>
                  <span className="text-slate-500">/month</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  Get started exploring award flights
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {FREE_FEATURES.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full mt-8"
                  onClick={() => router.push('/search')}
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full border-blue-200 bg-gradient-to-b from-blue-50/50 to-white relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                Most Popular
              </div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-xl">Premium</CardTitle>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">$9.99</span>
                  <span className="text-slate-500">/month</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  Maximize every point in your wallet
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {PREMIUM_FEATURES.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isLoading ? (
                  <Button className="w-full mt-8" disabled>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </Button>
                ) : isPremium ? (
                  <Button className="w-full mt-8 bg-green-600 hover:bg-green-700" disabled>
                    <Check className="h-4 w-4 mr-2" />
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className="w-full mt-8 bg-blue-600 hover:bg-blue-700"
                    onClick={handleUpgrade}
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Redirecting to checkout...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Upgrade to Premium
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-slate-900 mb-1">Can I cancel anytime?</h3>
              <p className="text-sm text-slate-600">
                Yes, you can cancel your subscription at any time. You&apos;ll continue to have access until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-1">What payment methods do you accept?</h3>
              <p className="text-sm text-slate-600">
                We accept all major credit cards through our secure payment processor, Stripe.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-1">How does the free plan limit work?</h3>
              <p className="text-sm text-slate-600">
                Free users see up to 3 search results per query. Premium users get unlimited results with additional filters and AI recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
