'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Plane,
  Sparkles,
  TrendingUp,
  Bell,
  Shield,
  ArrowRight,
  Star,
  Zap,
  Globe,
  CreditCard,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { SearchForm } from '@/components/search/search-form';
import { getTopSweetSpots } from '@/data/sweet-spots';
import { getCreditCardPrograms, getAirlinePrograms } from '@/data/loyalty-programs';
import { useUserStore } from '@/stores/user-store';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Recommendations',
    description:
      'Get personalized suggestions for the best redemption options based on your points portfolio.',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Availability',
    description:
      'Search award availability across 23+ programs simultaneously with live data.',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description:
      'Set up notifications for price drops, availability changes, and transfer bonuses.',
  },
  {
    icon: Shield,
    title: 'Points Valuation',
    description:
      'Know exactly what your points are worth with our cents-per-point calculations.',
  },
];

const stats = [
  { value: '23+', label: 'Loyalty Programs' },
  { value: '5', label: 'Credit Card Partners' },
  { value: '50+', label: 'Sweet Spots' },
  { value: '$9.99', label: 'Premium /month' },
];

export default function HomePage() {
  const { user } = useUserStore();
  const topSweetSpots = getTopSweetSpots(3);
  const creditCardPrograms = getCreditCardPrograms();
  const airlinePrograms = getAirlinePrograms().slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-chart-2/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        {/* Floating Elements — hidden on mobile to prevent overflow */}
        <motion.div
          className="hidden md:block absolute top-40 left-10 text-primary/20"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Plane className="h-12 w-12 transform -rotate-45" />
        </motion.div>
        <motion.div
          className="hidden md:block absolute top-60 right-20 text-chart-5/20"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          <Star className="h-8 w-8" />
        </motion.div>
        <motion.div
          className="hidden md:block absolute bottom-40 left-1/4 text-chart-2/20"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 3.5, repeat: Infinity }}
        >
          <Globe className="h-10 w-10" />
        </motion.div>

        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-primary/15 text-primary border-primary/30 hover:bg-primary/20">
              <Zap className="h-3 w-3 mr-1" />
              AI-Powered Award Search
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Find the{' '}
              <span className="gradient-text">
                Best Award Flights
              </span>
              <br />
              in Real Time
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Maximize your travel rewards with AI-powered recommendations for optimal points transfers and the highest-value redemptions.
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Suspense fallback={<div className="h-32 rounded-2xl bg-card/50 animate-pulse" />}>
              <SearchForm variant="hero" />
            </Suspense>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-8 mt-16"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Maximize Points
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful tools and insights to help you get the most value from your travel rewards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 hover:glow-blue transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg bg-primary/15 flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sweet Spots Preview */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Top Sweet Spots
              </h2>
              <p className="text-lg text-muted-foreground">
                Curated high-value redemption opportunities
              </p>
            </div>
            <Link href="/sweet-spots">
              <Button variant="outline" className="hidden md:flex border-border hover:border-primary/50">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {topSweetSpots.map((spot, index) => (
              <motion.div
                key={spot.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full overflow-hidden border-border/50 bg-card/50 hover:border-primary/30 transition-all duration-300">
                  <div className="h-40 bg-gradient-to-br from-primary/30 to-chart-2/20 flex items-center justify-center">
                    <Plane className="h-16 w-16 text-primary/20" />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className="bg-chart-2/10 text-chart-2 border-chart-2/30"
                      >
                        {spot.valueCpp.toFixed(1)} cpp
                      </Badge>
                      <Badge variant="outline" className="capitalize border-border/50">
                        {spot.cabinClass}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {spot.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {spot.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-foreground">
                        {spot.pointsRequired.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">points</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 md:hidden text-center">
            <Link href="/sweet-spots">
              <Button variant="outline" className="border-border">
                View All Sweet Spots
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Supported Programs
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Search across major airline loyalty programs and transfer partners
            </p>
          </div>

          <div className="mb-12">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Credit Card Transfer Partners
            </h3>
            <div className="flex flex-wrap gap-4">
              {creditCardPrograms.map((program) => (
                <div
                  key={program.id}
                  className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border/50"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {program.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Plane className="h-5 w-5 text-primary" />
              Airline Programs
            </h3>
            <div className="flex flex-wrap gap-4">
              {airlinePrograms.map((program) => (
                <div
                  key={program.id}
                  className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border/50"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                    <Plane className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {program.name}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/30">
                <span className="text-sm font-medium text-primary">+ More</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 px-4 border-t border-border/50">
          <div className="container mx-auto max-w-4xl">
            <Card className="bg-gradient-to-r from-primary/20 to-chart-2/10 border-primary/30 overflow-hidden relative glow-blue">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10">
                  <Plane className="h-32 w-32 transform -rotate-45" />
                </div>
                <div className="absolute bottom-10 right-10">
                  <Star className="h-24 w-24" />
                </div>
              </div>
              <CardContent className="p-12 text-center relative z-10">
                <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Start Maximizing Your Points Today
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Create a free account to track your points, set up alerts, and get personalized AI recommendations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto glow-blue"
                    >
                      Create Free Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-border hover:border-primary/50 w-full sm:w-auto"
                    >
                      View Pricing
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
