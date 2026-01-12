'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Filter, SlidersHorizontal, Loader2, Plane, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { SearchForm } from '@/components/search/search-form';
import { FlightCard } from '@/components/search/flight-card';
import { useSearchStore, useFilteredResults } from '@/stores/search-store';
import { useUserStore } from '@/stores/user-store';
import { getAirlinePrograms, getProgramById } from '@/data/loyalty-programs';
import { getAirportByCode } from '@/data/airports';
import { cn } from '@/lib/utils';
import { AwardFlight } from '@/types';

interface AIRecommendation {
  title: string;
  description: string;
  reasoning?: string;
  savings?: number;
}

interface FlightSearchResponse {
  flights: AwardFlight[];
  source: 'seats.aero' | 'mock';
  count?: number;
  lastUpdated?: string;
  message?: string;
  error?: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const {
    setSearchParams,
    setResults,
    setSearching,
    isSearching,
    filters,
    setFilters,
  } = useSearchStore();
  const { pointBalances } = useUserStore();
  const filteredResults = useFilteredResults();
  const [showFilters, setShowFilters] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [dataSource, setDataSource] = useState<'seats.aero' | 'mock' | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const date = searchParams.get('date');
  const cabin = searchParams.get('cabin') || 'economy';

  const originAirport = origin ? getAirportByCode(origin) : null;
  const destAirport = destination ? getAirportByCode(destination) : null;

  // Fetch AI recommendations
  const fetchAIRecommendations = async () => {
    if (!origin || !destination) return;

    setIsLoadingAI(true);
    try {
      // Include user's point balances with program names for better AI context
      const userBalances = pointBalances.map((pb) => {
        const program = getProgramById(pb.programId);
        return {
          programId: pb.programId,
          programName: program?.name || pb.programId,
          balance: pb.balance,
        };
      });

      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pointBalances: userBalances,
          searchParams: { origin, destination, cabinClass: cabin },
          flightResults: filteredResults.slice(0, 5).map((f) => ({
            programId: f.programId,
            pointsRequired: f.pointsRequired,
            valueCpp: f.valueCpp,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Failed to fetch AI recommendations:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  useEffect(() => {
    if (origin && destination && date) {
      setSearchParams({
        origin,
        destination,
        departureDate: date,
        cabinClass: cabin as 'economy' | 'premium_economy' | 'business' | 'first',
      });

      const fetchResults = async () => {
        setSearching(true);
        setDataSource(null);
        setLastUpdated(null);

        try {
          // Calculate end date (7 days from start for flexible searching)
          const startDate = new Date(date);
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 7);

          const params = new URLSearchParams({
            origin,
            destination,
            start_date: date,
            end_date: endDate.toISOString().split('T')[0],
            cabin,
          });

          const response = await fetch(`/api/flights/search?${params}`);
          const data: FlightSearchResponse = await response.json();

          setResults(data.flights);
          setDataSource(data.source);
          if (data.lastUpdated) {
            setLastUpdated(data.lastUpdated);
          }
        } catch (error) {
          console.error('Failed to fetch flights:', error);
          setResults([]);
        } finally {
          setSearching(false);
        }
      };

      fetchResults();
    }
  }, [origin, destination, date, cabin, setSearchParams, setResults, setSearching]);

  // Fetch AI recommendations when results are loaded
  useEffect(() => {
    if (filteredResults.length > 0 && !isSearching) {
      fetchAIRecommendations();
    }
  }, [filteredResults.length, isSearching, origin, destination]);

  const airlinePrograms = getAirlinePrograms();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Search Header */}
      <div className="bg-white border-b border-slate-200 pt-20">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <SearchForm variant="compact" />
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {origin && destination && date ? (
          <>
            {/* Route Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {originAirport?.city || origin} to {destAirport?.city || destination}
                </h1>
                <p className="text-slate-500">
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {' · '}
                  {cabin.replace('_', ' ').charAt(0).toUpperCase() +
                    cabin.replace('_', ' ').slice(1)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>

                <Select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onValueChange={(value) => {
                    const [sortBy, sortOrder] = value.split('-') as [
                      typeof filters.sortBy,
                      typeof filters.sortOrder
                    ];
                    setFilters({ sortBy, sortOrder });
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="points-asc">Points: Low to High</SelectItem>
                    <SelectItem value="points-desc">Points: High to Low</SelectItem>
                    <SelectItem value="value-desc">Best Value</SelectItem>
                    <SelectItem value="departure-asc">Departure Time</SelectItem>
                    <SelectItem value="duration-asc">Shortest Duration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-6">
              {/* Filters Sidebar */}
              <aside
                className={cn(
                  'w-64 flex-shrink-0 space-y-4',
                  showFilters ? 'block' : 'hidden md:block'
                )}
              >
                {/* Programs Filter */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Programs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {airlinePrograms.slice(0, 6).map((program) => (
                      <label
                        key={program.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.programs.includes(program.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({
                                programs: [...filters.programs, program.id],
                              });
                            } else {
                              setFilters({
                                programs: filters.programs.filter(
                                  (id) => id !== program.id
                                ),
                              });
                            }
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700">{program.name}</span>
                      </label>
                    ))}
                  </CardContent>
                </Card>

                {/* Stops Filter */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Stops</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { value: 0, label: 'Nonstop only' },
                      { value: 1, label: '1 stop or fewer' },
                      { value: 2, label: '2 stops or fewer' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="stops"
                          checked={filters.maxStops === option.value}
                          onChange={() => setFilters({ maxStops: option.value })}
                          className="border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700">{option.label}</span>
                      </label>
                    ))}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="stops"
                        checked={filters.maxStops === null}
                        onChange={() => setFilters({ maxStops: null })}
                        className="border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">Any number of stops</span>
                    </label>
                  </CardContent>
                </Card>

                {/* AI Recommendations Card */}
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-slate-900">AI Recommendations</span>
                    </div>
                    {isLoadingAI ? (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing routes...
                      </div>
                    ) : aiRecommendations.length > 0 ? (
                      <div className="space-y-3">
                        {aiRecommendations.map((rec, index) => (
                          <div key={index} className="border-b border-blue-100 last:border-0 pb-2 last:pb-0">
                            <p className="text-sm font-medium text-slate-800">{rec.title}</p>
                            <p className="text-xs text-slate-600 mt-1">{rec.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600">
                        Search for flights to get personalized AI recommendations.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </aside>

              {/* Results */}
              <div className="flex-1 space-y-4">
                {isSearching ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
                    <p className="text-slate-500">Searching for award availability...</p>
                  </div>
                ) : filteredResults.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-white">
                          {filteredResults.length} flights found
                        </Badge>
                        {dataSource === 'seats.aero' && (
                          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                            Live Data
                          </Badge>
                        )}
                        {dataSource === 'mock' && (
                          <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                            Sample Data
                          </Badge>
                        )}
                      </div>
                      {lastUpdated && (
                        <span className="text-xs text-slate-400">
                          Updated {new Date(lastUpdated).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    {filteredResults.map((flight, index) => (
                      <FlightCard key={flight.id} flight={flight} index={index} />
                    ))}
                  </>
                ) : (
                  <Card className="p-12 text-center">
                    <Plane className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">
                      No flights found
                    </h3>
                    <p className="text-slate-500 mb-4">
                      Try adjusting your search or filters to find available flights.
                    </p>
                    <Button variant="outline" onClick={() => setFilters({ programs: [], maxStops: null })}>
                      Clear Filters
                    </Button>
                  </Card>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <Plane className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Search for Award Flights
            </h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Enter your origin, destination, and travel dates to find the best award availability across multiple programs.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
