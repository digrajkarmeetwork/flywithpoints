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
import { mockSearchFlights } from '@/data/mock-flights';
import { getAirlinePrograms } from '@/data/loyalty-programs';
import { getAirportByCode } from '@/data/airports';
import { cn } from '@/lib/utils';

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
  const filteredResults = useFilteredResults();
  const [showFilters, setShowFilters] = useState(false);

  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const date = searchParams.get('date');
  const cabin = searchParams.get('cabin') || 'economy';

  const originAirport = origin ? getAirportByCode(origin) : null;
  const destAirport = destination ? getAirportByCode(destination) : null;

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
        try {
          const results = await mockSearchFlights(origin, destination, date, cabin);
          setResults(results);
        } finally {
          setSearching(false);
        }
      };

      fetchResults();
    }
  }, [origin, destination, date, cabin, setSearchParams, setResults, setSearching]);

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

                {/* AI Recommendation Card */}
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-slate-900">AI Tip</span>
                    </div>
                    <p className="text-sm text-slate-600">
                      For this route, consider booking through Virgin Atlantic for the best value on partner flights.
                    </p>
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
                      <Badge variant="outline" className="bg-white">
                        {filteredResults.length} flights found
                      </Badge>
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
