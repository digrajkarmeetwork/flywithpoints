'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Plane,
  Loader2,
  AlertCircle,
  MapPin,
  Calendar,
  ArrowRight,
  Filter,
  SlidersHorizontal,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AirlineSearchForm } from '@/components/search/airline-search-form';
import { FlightCard } from '@/components/search/flight-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AwardFlight } from '@/types';
import { cn } from '@/lib/utils';

interface RouteInfo {
  route: string;
  origin: string;
  destination: string;
  count: number;
  minPoints: number;
  maxPoints: number;
}

interface AirlineInfo {
  code: string;
  name: string;
  alliance?: string;
  premiumProducts?: {
    business?: string;
    first?: string;
  };
}

interface AirlineSearchResponse {
  flights: AwardFlight[];
  totalFlights: number;
  routes: RouteInfo[];
  airline: AirlineInfo;
  source: string;
  cabin: string;
  lastUpdated: string;
  error?: string;
}

function ExploreAirlinesContent() {
  const searchParams = useSearchParams();
  const airlineCode = searchParams.get('airline');
  const cabinParam = searchParams.get('cabin');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AirlineSearchResponse | null>(null);
  const [displayedFlights, setDisplayedFlights] = useState<AwardFlight[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'points' | 'value'>('date');
  const [showLimit, setShowLimit] = useState(20);

  useEffect(() => {
    if (!airlineCode) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          airline: airlineCode,
          limit: '500', // Fetch more results for filtering
        });

        if (cabinParam && cabinParam !== 'all') {
          params.set('cabin', cabinParam);
        }

        const response = await fetch(`/api/flights/airline?${params.toString()}`);
        const result: AirlineSearchResponse = await response.json();

        if (result.error) {
          setError(result.error);
        } else {
          setData(result);
          setDisplayedFlights(result.flights);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [airlineCode, cabinParam]);

  // Filter and sort flights
  useEffect(() => {
    if (!data) return;

    let filtered = [...data.flights];

    // Filter by route
    if (selectedRoute !== 'all') {
      const [origin, destination] = selectedRoute.split('-');
      filtered = filtered.filter(
        (f) => f.origin === origin && f.destination === destination
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return a.departureDate.localeCompare(b.departureDate);
        case 'points':
          return a.pointsRequired - b.pointsRequired;
        case 'value':
          return b.valueCpp - a.valueCpp;
        default:
          return 0;
      }
    });

    setDisplayedFlights(filtered);
  }, [data, selectedRoute, sortBy]);

  const visibleFlights = displayedFlights.slice(0, showLimit);
  const hasMore = displayedFlights.length > showLimit;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto max-w-6xl px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Explore by Airline
            </h1>
            <p className="text-lg text-slate-600">
              Find all available award flights on your favorite airline, regardless of route or date.
            </p>
          </div>

          {/* Search Form */}
          <div className="mb-8">
            <AirlineSearchForm />
          </div>

          {/* Results Section */}
          {airlineCode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Airline Header */}
              {data?.airline && (
                <Card className="mb-6 border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                        <Plane className="h-8 w-8" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{data.airline.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-white/20 text-white border-white/30">
                            {data.airline.code}
                          </Badge>
                          {data.airline.alliance && (
                            <Badge className="bg-white/20 text-white border-white/30 capitalize">
                              {data.airline.alliance}
                            </Badge>
                          )}
                          {cabinParam && cabinParam !== 'all' && (
                            <Badge className="bg-white/20 text-white border-white/30 capitalize">
                              {cabinParam.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {data.airline.premiumProducts && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {data.airline.premiumProducts.business && (
                          <Badge className="bg-purple-500/30 text-white border-purple-400/50">
                            Business: {data.airline.premiumProducts.business}
                          </Badge>
                        )}
                        {data.airline.premiumProducts.first && (
                          <Badge className="bg-amber-500/30 text-white border-amber-400/50">
                            First: {data.airline.premiumProducts.first}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 bg-white">
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">
                          {data.routes.length} routes available
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">
                          {data.totalFlights} total flights found
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                  <p className="text-slate-600">
                    Searching for {airlineCode} award availability...
                  </p>
                  <p className="text-sm text-slate-400 mt-2">
                    This may take a moment as we search across multiple programs.
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                      <div>
                        <p className="font-medium text-red-900">Error</p>
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Results */}
              {!loading && !error && data && (
                <>
                  {/* Routes Overview */}
                  {data.routes.length > 0 && (
                    <Card className="mb-6 border-slate-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-blue-600" />
                          Available Routes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant={selectedRoute === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedRoute('all')}
                            className={cn(
                              selectedRoute === 'all' && 'bg-blue-600 hover:bg-blue-700'
                            )}
                          >
                            All Routes ({data.totalFlights})
                          </Button>
                          {data.routes
                            .sort((a, b) => b.count - a.count)
                            .slice(0, 20)
                            .map((route) => (
                              <Button
                                key={route.route}
                                variant={selectedRoute === route.route ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedRoute(route.route)}
                                className={cn(
                                  'flex items-center gap-1',
                                  selectedRoute === route.route && 'bg-blue-600 hover:bg-blue-700'
                                )}
                              >
                                {route.origin}
                                <ArrowRight className="h-3 w-3" />
                                {route.destination}
                                <span className="ml-1 text-xs opacity-70">({route.count})</span>
                              </Button>
                            ))}
                          {data.routes.length > 20 && (
                            <Badge variant="outline" className="px-3 py-1">
                              +{data.routes.length - 20} more routes
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Filters */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-slate-600">
                      Showing {Math.min(showLimit, displayedFlights.length)} of{' '}
                      {displayedFlights.length} flights
                    </p>
                    <div className="flex items-center gap-3">
                      <SlidersHorizontal className="h-4 w-4 text-slate-400" />
                      <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">Sort by Date</SelectItem>
                          <SelectItem value="points">Sort by Points</SelectItem>
                          <SelectItem value="value">Sort by Value</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Flight Cards */}
                  {visibleFlights.length > 0 ? (
                    <div className="space-y-4">
                      {visibleFlights.map((flight, index) => (
                        <FlightCard key={flight.id} flight={flight} index={index} />
                      ))}

                      {/* Load More */}
                      {hasMore && (
                        <div className="text-center pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setShowLimit((prev) => prev + 20)}
                          >
                            Load More ({displayedFlights.length - showLimit} remaining)
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Card className="border-slate-200">
                      <CardContent className="p-12 text-center">
                        <Plane className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600">
                          No flights found for this route and cabin combination.
                        </p>
                        <p className="text-sm text-slate-400 mt-2">
                          Try selecting a different route or cabin class.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {/* No airline selected yet */}
              {!data && !loading && !error && (
                <Card className="border-slate-200">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plane className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Select an Airline to Explore
                    </h3>
                    <p className="text-slate-600 max-w-md mx-auto">
                      Choose an airline from the dropdown above to see all available
                      award flights, regardless of departure city or date.
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* No search yet */}
          {!airlineCode && (
            <Card className="border-slate-200">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plane className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Explore Award Flights by Airline
                </h3>
                <p className="text-slate-600 max-w-md mx-auto mb-6">
                  Want to fly Qatar Airways Qsuites? Singapore Suites? Emirates First?
                  Select an airline above to see all available award flights on that
                  carrier, regardless of route or date.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['QR', 'SQ', 'EK', 'CX', 'JL', 'NH'].map((code) => (
                    <Badge key={code} variant="outline" className="text-sm">
                      {code}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ExploreAirlinesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <ExploreAirlinesContent />
    </Suspense>
  );
}
