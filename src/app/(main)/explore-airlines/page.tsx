'use client';

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Plane,
  Loader2,
  AlertCircle,
  MapPin,
  Calendar,
  ArrowRight,
  SlidersHorizontal,
  PlaneTakeoff,
  PlaneLanding,
  Navigation,
  X,
  Info,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AirlineSearchForm } from '@/components/search/airline-search-form';
import { FlightCard } from '@/components/search/flight-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AwardFlight } from '@/types';
import { cn } from '@/lib/utils';
import { getAirportByCode } from '@/data/airports';

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
  const [sortBy, setSortBy] = useState<'date' | 'points' | 'value'>('date');
  const [showLimit, setShowLimit] = useState(20);

  // Advanced filtering
  const [originFilter, setOriginFilter] = useState<string>('');
  const [destinationFilter, setDestinationFilter] = useState<string>('');
  const [homeAirport, setHomeAirport] = useState<string>('');

  useEffect(() => {
    if (!airlineCode) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          airline: airlineCode,
          limit: '500',
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

  // Get unique origins and destinations for filter dropdowns
  const { uniqueOrigins, uniqueDestinations } = useMemo(() => {
    if (!data) return { uniqueOrigins: [], uniqueDestinations: [] };

    const origins = new Set<string>();
    const destinations = new Set<string>();

    data.routes.forEach((route) => {
      origins.add(route.origin);
      destinations.add(route.destination);
    });

    return {
      uniqueOrigins: Array.from(origins).sort(),
      uniqueDestinations: Array.from(destinations).sort(),
    };
  }, [data]);

  // Filter and sort flights
  useEffect(() => {
    if (!data) return;

    let filtered = [...data.flights];

    // Filter by origin
    if (originFilter) {
      filtered = filtered.filter((f) => f.origin === originFilter);
    }

    // Filter by destination
    if (destinationFilter) {
      filtered = filtered.filter((f) => f.destination === destinationFilter);
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
    setShowLimit(20); // Reset pagination when filters change
  }, [data, originFilter, destinationFilter, sortBy]);

  // Group routes by destination (for positioning suggestions)
  const routesByDestination = useMemo(() => {
    if (!data) return new Map<string, RouteInfo[]>();

    const grouped = new Map<string, RouteInfo[]>();
    data.routes.forEach((route) => {
      const existing = grouped.get(route.destination) || [];
      existing.push(route);
      grouped.set(route.destination, existing);
    });

    // Sort each group by count (most availability first)
    grouped.forEach((routes, dest) => {
      routes.sort((a, b) => b.count - a.count);
    });

    return grouped;
  }, [data]);

  // Get positioning suggestions when user sets home airport and destination
  const positioningSuggestions = useMemo(() => {
    if (!homeAirport || !destinationFilter || !data) return [];

    // Check if there's direct availability from home airport
    const directRoute = data.routes.find(
      (r) => r.origin === homeAirport && r.destination === destinationFilter
    );

    // Get all routes to the destination
    const routesToDest = routesByDestination.get(destinationFilter) || [];

    // Find alternative origins (not home airport)
    const alternatives = routesToDest
      .filter((r) => r.origin !== homeAirport)
      .map((route) => {
        const originAirport = getAirportByCode(route.origin);
        return {
          ...route,
          originCity: originAirport?.city || route.origin,
          originCountry: originAirport?.country || '',
        };
      });

    return {
      hasDirectAvailability: !!directRoute,
      directRoute,
      alternatives: alternatives.slice(0, 10), // Top 10 alternatives
    };
  }, [homeAirport, destinationFilter, data, routesByDestination]);

  const visibleFlights = displayedFlights.slice(0, showLimit);
  const hasMore = displayedFlights.length > showLimit;

  const clearFilters = () => {
    setOriginFilter('');
    setDestinationFilter('');
    setHomeAirport('');
  };

  const hasActiveFilters = originFilter || destinationFilter;

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
              Find all available award flights on your favorite airline, then filter by origin or destination.
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
                  {/* Route Filters */}
                  <Card className="mb-6 border-slate-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <SlidersHorizontal className="h-5 w-5 text-blue-600" />
                        Filter Routes
                        {hasActiveFilters && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="ml-auto text-slate-500 hover:text-slate-700"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Clear filters
                          </Button>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Origin and Destination Filters */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                            <PlaneTakeoff className="h-4 w-4 text-slate-400" />
                            Filter by Origin
                          </Label>
                          <Select
                            value={originFilter}
                            onValueChange={setOriginFilter}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Any origin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Any origin</SelectItem>
                              {uniqueOrigins.map((origin) => {
                                const airport = getAirportByCode(origin);
                                const routeCount = data.routes.filter(
                                  (r) => r.origin === origin
                                ).length;
                                return (
                                  <SelectItem key={origin} value={origin}>
                                    {origin} - {airport?.city || origin} ({routeCount} routes)
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                            <PlaneLanding className="h-4 w-4 text-slate-400" />
                            Filter by Destination
                          </Label>
                          <Select
                            value={destinationFilter}
                            onValueChange={setDestinationFilter}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Any destination" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Any destination</SelectItem>
                              {uniqueDestinations.map((dest) => {
                                const airport = getAirportByCode(dest);
                                const routeCount = data.routes.filter(
                                  (r) => r.destination === dest
                                ).length;
                                return (
                                  <SelectItem key={dest} value={dest}>
                                    {dest} - {airport?.city || dest} ({routeCount} routes)
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Positioning Helper */}
                      {destinationFilter && (
                        <div className="pt-4 border-t border-slate-200">
                          <Label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                            <Navigation className="h-4 w-4 text-slate-400" />
                            Your Home Airport (for positioning suggestions)
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="e.g., YYZ, JFK, LAX"
                              value={homeAirport}
                              onChange={(e) => setHomeAirport(e.target.value.toUpperCase())}
                              className="max-w-[200px] uppercase"
                              maxLength={3}
                            />
                            {homeAirport && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setHomeAirport('')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          {/* Positioning Suggestions */}
                          {homeAirport && positioningSuggestions && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                              <div className="flex items-start gap-2 mb-3">
                                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                  <p className="font-medium text-blue-900">
                                    Positioning to {destinationFilter} from {homeAirport}
                                  </p>
                                  {positioningSuggestions.hasDirectAvailability ? (
                                    <p className="text-sm text-blue-700 mt-1">
                                      Direct award availability exists from {homeAirport}!
                                      ({positioningSuggestions.directRoute?.count} flights,{' '}
                                      {positioningSuggestions.directRoute?.minPoints.toLocaleString()}-
                                      {positioningSuggestions.directRoute?.maxPoints.toLocaleString()} points)
                                    </p>
                                  ) : (
                                    <p className="text-sm text-blue-700 mt-1">
                                      No direct availability from {homeAirport}. Consider positioning to one of these cities:
                                    </p>
                                  )}
                                </div>
                              </div>

                              {!positioningSuggestions.hasDirectAvailability &&
                                positioningSuggestions.alternatives &&
                                positioningSuggestions.alternatives.length > 0 && (
                                  <div className="space-y-2">
                                    {positioningSuggestions.alternatives.map((alt) => (
                                      <button
                                        key={alt.origin}
                                        onClick={() => setOriginFilter(alt.origin)}
                                        className={cn(
                                          'w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors',
                                          originFilter === alt.origin
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white hover:bg-blue-100'
                                        )}
                                      >
                                        <div>
                                          <span className="font-medium">
                                            {alt.origin} - {alt.originCity}
                                          </span>
                                          {alt.originCountry && (
                                            <span className={cn(
                                              'text-sm ml-2',
                                              originFilter === alt.origin ? 'text-blue-100' : 'text-slate-500'
                                            )}>
                                              ({alt.originCountry})
                                            </span>
                                          )}
                                        </div>
                                        <div className={cn(
                                          'text-sm',
                                          originFilter === alt.origin ? 'text-blue-100' : 'text-slate-600'
                                        )}>
                                          {alt.count} flights
                                          <span className="mx-1">|</span>
                                          {alt.minPoints.toLocaleString()}+ pts
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                )}

                              {positioningSuggestions.hasDirectAvailability && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setOriginFilter(homeAirport)}
                                  className="mt-2 bg-white"
                                >
                                  Show flights from {homeAirport}
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Quick Route Buttons */}
                      {!originFilter && !destinationFilter && data.routes.length > 0 && (
                        <div className="pt-4 border-t border-slate-200">
                          <p className="text-sm text-slate-500 mb-3">Popular routes:</p>
                          <div className="flex flex-wrap gap-2">
                            {data.routes
                              .sort((a, b) => b.count - a.count)
                              .slice(0, 12)
                              .map((route) => (
                                <Button
                                  key={route.route}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setOriginFilter(route.origin);
                                    setDestinationFilter(route.destination);
                                  }}
                                  className="flex items-center gap-1"
                                >
                                  {route.origin}
                                  <ArrowRight className="h-3 w-3" />
                                  {route.destination}
                                  <span className="ml-1 text-xs opacity-70">({route.count})</span>
                                </Button>
                              ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Results Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-slate-600">
                        Showing {Math.min(showLimit, displayedFlights.length)} of{' '}
                        {displayedFlights.length} flights
                        {hasActiveFilters && (
                          <span className="text-blue-600 ml-1">
                            (filtered from {data.totalFlights})
                          </span>
                        )}
                      </p>
                      {originFilter || destinationFilter ? (
                        <p className="text-xs text-slate-400 mt-1">
                          {originFilter && `From: ${originFilter}`}
                          {originFilter && destinationFilter && ' | '}
                          {destinationFilter && `To: ${destinationFilter}`}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-3">
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
                          No flights found for this filter combination.
                        </p>
                        <p className="text-sm text-slate-400 mt-2">
                          Try adjusting your origin or destination filters.
                        </p>
                        <Button
                          variant="outline"
                          onClick={clearFilters}
                          className="mt-4"
                        >
                          Clear all filters
                        </Button>
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
                <p className="text-slate-600 max-w-md mx-auto mb-4">
                  Want to fly Qatar Airways Qsuites? Singapore Suites? Emirates First?
                  Select an airline above to see all available award flights.
                </p>
                <div className="bg-slate-50 rounded-lg p-4 max-w-lg mx-auto text-left">
                  <p className="text-sm font-medium text-slate-700 mb-2">How it works:</p>
                  <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
                    <li>Select an airline and cabin class</li>
                    <li>See all available routes on that airline</li>
                    <li>Filter by destination to find where you want to go</li>
                    <li>Enter your home airport to see positioning options</li>
                  </ol>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-6">
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
