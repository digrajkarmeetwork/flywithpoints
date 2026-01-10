'use client';

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
      'Search award availability across multiple programs simultaneously with live data.',
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
  { value: '15+', label: 'Airline Programs' },
  { value: '5', label: 'Credit Card Partners' },
  { value: '50+', label: 'Sweet Spots' },
  { value: '100%', label: 'Free to Use' },
];

export default function HomePage() {
  const { user } = useUserStore();
  const topSweetSpots = getTopSweetSpots(3);
  const creditCardPrograms = getCreditCardPrograms();
  const airlinePrograms = getAirlinePrograms().slice(0, 8);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-50 -z-10" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-blue-100/50 to-transparent -z-10" />

        {/* Floating Elements */}
        <motion.div
          className="absolute top-40 left-10 text-blue-200"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Plane className="h-12 w-12 transform -rotate-45" />
        </motion.div>
        <motion.div
          className="absolute top-60 right-20 text-orange-200"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          <Star className="h-8 w-8" />
        </motion.div>
        <motion.div
          className="absolute bottom-40 left-1/4 text-emerald-200"
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
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
              <Zap className="h-3 w-3 mr-1" />
              AI-Powered Award Search
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
              Find the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Best Award Flights
              </span>
              <br />
              in Real Time
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
              Maximize your travel rewards with AI-powered recommendations for optimal points transfers and the highest-value redemptions.
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <SearchForm variant="hero" />
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
                <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Maximize Points
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
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
                  <Card className="h-full border-slate-200 hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-slate-600 text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sweet Spots Preview */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                Top Sweet Spots
              </h2>
              <p className="text-lg text-slate-600">
                Curated high-value redemption opportunities
              </p>
            </div>
            <Link href="/sweet-spots">
              <Button variant="outline" className="hidden md:flex">
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
                <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 border-slate-200">
                  <div className="h-40 bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                    <Plane className="h-16 w-16 text-white/30" />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200"
                      >
                        {spot.valueCpp.toFixed(1)} cpp
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {spot.cabinClass}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {spot.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {spot.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-slate-900">
                        {spot.pointsRequired.toLocaleString()}
                      </span>
                      <span className="text-sm text-slate-500">points</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 md:hidden text-center">
            <Link href="/sweet-spots">
              <Button variant="outline">
                View All Sweet Spots
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Supported Programs
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Search across major airline loyalty programs and transfer partners
            </p>
          </div>

          <div className="mb-12">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Credit Card Transfer Partners
            </h3>
            <div className="flex flex-wrap gap-4">
              {creditCardPrograms.map((program) => (
                <div
                  key={program.id}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200"
                >
                  <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-slate-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {program.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Plane className="h-5 w-5 text-blue-600" />
              Airline Programs
            </h3>
            <div className="flex flex-wrap gap-4">
              {airlinePrograms.map((program) => (
                <div
                  key={program.id}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200"
                >
                  <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                    <Plane className="h-4 w-4 text-slate-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {program.name}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-blue-700">+ More</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Only show for non-logged-in users */}
      {!user && (
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="bg-gradient-to-r from-blue-600 to-cyan-500 border-0 text-white overflow-hidden relative">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10">
                  <Plane className="h-32 w-32 transform -rotate-45" />
                </div>
                <div className="absolute bottom-10 right-10">
                  <Star className="h-24 w-24" />
                </div>
              </div>
              <CardContent className="p-12 text-center relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Start Maximizing Your Points Today
                </h2>
                <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                  Create a free account to track your points, set up alerts, and get personalized AI recommendations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="bg-white text-blue-600 hover:bg-blue-50 w-full sm:w-auto"
                    >
                      Create Free Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/search">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white text-white hover:bg-white/10 w-full sm:w-auto"
                    >
                      Search Flights
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
