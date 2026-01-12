'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, Loader2, Compass, ChevronDown, ChevronUp, Radio, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DestinationInput } from './destination-input';
import { AwardOpportunityCard } from './award-opportunity-card';
import { PositioningCard } from './positioning-card';
import { AwardOpportunity, PositioningOption, PointBalance, AwardFlight } from '@/types';
import { getAwardOpportunities, getPositioningOptions, getOpportunitySummary, getAccessiblePrograms } from '@/data/explore-opportunities';
import { AirportInput } from '@/components/search/airport-input';

interface LiveAvailabilityData {
  programId: string;
  flights: AwardFlight[];
  lastUpdated: string;
}

interface AvailabilityResponse {
  flights: AwardFlight[];
  source: string;
  lastUpdated?: string;
  error?: string;
}

interface ExploreOpportunitiesSectionProps {
  pointBalances: PointBalance[];
}

export function ExploreOpportunitiesSection({ pointBalances }: ExploreOpportunitiesSectionProps) {
  const [destination, setDestination] = useState('');
  const [homeAirport, setHomeAirport] = useState('');
  const [opportunities, setOpportunities] = useState<AwardOpportunity[]>([]);
  const [positioningOptions, setPositioningOptions] = useState<PositioningOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllOpportunities, setShowAllOpportunities] = useState(false);
  const [showPositioning, setShowPositioning] = useState(false);

  // Live availability state
  const [liveAvailability, setLiveAvailability] = useState<Map<string, LiveAvailabilityData>>(new Map());
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [liveDataSource, setLiveDataSource] = useState<'seats.aero' | 'unavailable' | null>(null);

  // Fetch live availability for a program
  const fetchLiveAvailability = useCallback(async (programId: string) => {
    try {
      const response = await fetch(`/api/flights/availability?program_id=${programId}`);
      const data: AvailabilityResponse = await response.json();

      if (data.source === 'seats.aero' && data.flights.length > 0) {
        setLiveAvailability(prev => {
          const newMap = new Map(prev);
          newMap.set(programId, {
            programId,
            flights: data.flights,
            lastUpdated: data.lastUpdated || new Date().toISOString(),
          });
          return newMap;
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to fetch live availability for ${programId}:`, error);
      return false;
    }
  }, []);

  // Fetch live availability for all accessible programs
  const fetchAllLiveAvailability = useCallback(async () => {
    if (pointBalances.length === 0) return;

    setIsLoadingLive(true);
    const accessiblePrograms = getAccessiblePrograms(pointBalances);

    // Only fetch for unique airline programs (not credit cards)
    const airlineProgramIds = [...new Set(
      accessiblePrograms
        .filter(p => p.program.type === 'airline')
        .map(p => p.programId)
    )];

    let hasLiveData = false;

    // Fetch in parallel but limit to 3 concurrent requests to be nice to the API
    for (let i = 0; i < airlineProgramIds.length; i += 3) {
      const batch = airlineProgramIds.slice(i, i + 3);
      const results = await Promise.all(batch.map(fetchLiveAvailability));
      if (results.some(r => r)) hasLiveData = true;
    }

    setLiveDataSource(hasLiveData ? 'seats.aero' : 'unavailable');
    setIsLoadingLive(false);
  }, [pointBalances, fetchLiveAvailability]);

  // Load opportunities when destination or points change
  useEffect(() => {
    if (pointBalances.length === 0) {
      setOpportunities([]);
      setPositioningOptions([]);
      return;
    }

    setIsLoading(true);

    // Simulate a brief loading state for better UX
    const timer = setTimeout(() => {
      const opps = getAwardOpportunities(pointBalances, destination || undefined);
      setOpportunities(opps);

      // Get positioning options if home airport is set and destination is filtered
      if (homeAirport && destination) {
        const posOptions = getPositioningOptions(homeAirport, opps, destination);
        setPositioningOptions(posOptions);
      } else {
        setPositioningOptions([]);
      }

      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pointBalances, destination, homeAirport]);

  // Fetch live availability when point balances change
  useEffect(() => {
    if (pointBalances.length > 0) {
      fetchAllLiveAvailability();
    }
  }, [pointBalances, fetchAllLiveAvailability]);

  // Get live flight count for a program
  const getLiveFlightCount = (programId: string): number => {
    const data = liveAvailability.get(programId);
    return data?.flights.length || 0;
  };

  // Check if we have any live data
  const hasLiveData = liveAvailability.size > 0;

  const summary = getOpportunitySummary(opportunities);
  const displayedOpportunities = showAllOpportunities ? opportunities : opportunities.slice(0, 4);
  const hasMoreOpportunities = opportunities.length > 4;

  // Don't show the section if user has no points
  if (pointBalances.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
        <CardContent className="py-8 text-center">
          <Compass className="h-12 w-12 text-blue-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Discover What You Can Book
          </h3>
          <p className="text-slate-600 mb-4 max-w-md mx-auto">
            Add your loyalty programs and point balances to see award flights you can book right now.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <CardTitle className="text-lg">What Can I Do With My Points?</CardTitle>
        </div>
        <CardDescription className="text-blue-100">
          Explore award flights you can book with your current points
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        {/* Filters */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <DestinationInput
            label="Where do you want to go?"
            placeholder="e.g., Japan, Europe, Asia..."
            value={destination}
            onChange={setDestination}
          />
          <AirportInput
            label="Your home airport (optional)"
            placeholder="For positioning flight suggestions"
            value={homeAirport}
            onChange={setHomeAirport}
            icon="departure"
          />
        </div>

        {/* Summary stats */}
        {!isLoading && opportunities.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Badge variant="outline" className="bg-white">
              {summary.total} opportunities found
            </Badge>
            {summary.affordable > 0 && (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                {summary.affordable} you can book now
              </Badge>
            )}
            {summary.almostAffordable > 0 && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                {summary.almostAffordable} almost there
              </Badge>
            )}
            {destination && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Filtered: {destination}
              </Badge>
            )}
            {/* Live data indicator */}
            {isLoadingLive ? (
              <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Checking live availability...
              </Badge>
            ) : hasLiveData ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                <Wifi className="h-3 w-3" />
                Live data from seats.aero
              </Badge>
            ) : liveDataSource === 'unavailable' ? (
              <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 gap-1">
                <WifiOff className="h-3 w-3" />
                Using cached data
              </Badge>
            ) : null}
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        )}

        {/* No results */}
        {!isLoading && opportunities.length === 0 && (
          <div className="text-center py-12">
            <Compass className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No matching opportunities
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              {destination
                ? `No award flights found for "${destination}" with your current points. Try a different destination or add more programs.`
                : 'Select a destination to see what award flights you can book.'}
            </p>
            {destination && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setDestination('')}
              >
                Clear destination filter
              </Button>
            )}
          </div>
        )}

        {/* Opportunities grid */}
        {!isLoading && opportunities.length > 0 && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {displayedOpportunities.map((opportunity, index) => (
                <AwardOpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  index={index}
                  homeAirport={homeAirport}
                  liveFlightCount={getLiveFlightCount(opportunity.program.id)}
                />
              ))}
            </div>

            {/* Show more/less toggle */}
            {hasMoreOpportunities && (
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => setShowAllOpportunities(!showAllOpportunities)}
                  className="gap-2"
                >
                  {showAllOpportunities ? (
                    <>
                      Show less
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show {opportunities.length - 4} more
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Positioning suggestions */}
        {!isLoading && positioningOptions.length > 0 && homeAirport && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900">
                  Can&apos;t find availability from {homeAirport}?
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPositioning(!showPositioning)}
              >
                {showPositioning ? 'Hide' : 'Show'} options
              </Button>
            </div>

            {showPositioning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid md:grid-cols-2 gap-4"
              >
                {positioningOptions.map((option, index) => (
                  <PositioningCard
                    key={option.id}
                    option={option}
                    homeAirport={homeAirport}
                    index={index}
                  />
                ))}
              </motion.div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
