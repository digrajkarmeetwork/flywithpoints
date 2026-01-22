import { NextRequest, NextResponse } from 'next/server';
import {
  getAvailability,
  transformSearchResponse,
  CabinClass,
  SeatsAeroSearchResponse,
} from '@/lib/seats-aero';
import { getAirlineByCode } from '@/data/airlines';

export const dynamic = 'force-dynamic';

// Extended cache for airline searches (30 minutes) since bulk data doesn't change frequently
const airlineCache = new Map<string, { data: SeatsAeroSearchResponse; timestamp: number }>();
const AIRLINE_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

async function getCachedAvailability(source: string): Promise<SeatsAeroSearchResponse> {
  const cacheKey = `airline:${source}`;
  const cached = airlineCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < AIRLINE_CACHE_TTL) {
    console.log(`[flights/airline] Cache hit for ${source}`);
    return cached.data;
  }

  console.log(`[flights/airline] Fetching bulk availability for ${source}`);
  const data = await getAvailability(source);

  airlineCache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const airlineCode = searchParams.get('airline')?.toUpperCase();
  const cabin = searchParams.get('cabin') as CabinClass | null;
  const limit = parseInt(searchParams.get('limit') || '100');

  // Validate required parameters
  if (!airlineCode) {
    return NextResponse.json(
      { error: 'Airline code is required', flights: [] },
      { status: 400 }
    );
  }

  // Check if API key is configured
  if (!process.env.SEATS_AERO_API_KEY) {
    console.error('[flights/airline] SEATS_AERO_API_KEY is not configured');
    return NextResponse.json({
      flights: [],
      source: 'error',
      error: 'SEATS_AERO_API_KEY environment variable is not configured',
    });
  }

  // Get airline info
  const airline = getAirlineByCode(airlineCode);
  if (!airline) {
    return NextResponse.json(
      { error: `Unknown airline code: ${airlineCode}`, flights: [] },
      { status: 400 }
    );
  }

  try {
    console.log(`[flights/airline] Searching for ${airline.name} (${airlineCode}), cabin: ${cabin}`);

    // Fetch availability from all relevant programs for this airline
    const programPromises = airline.searchPrograms.map((program) =>
      getCachedAvailability(program).catch((err) => {
        console.error(`[flights/airline] Error fetching ${program}:`, err);
        return { data: [] } as SeatsAeroSearchResponse;
      })
    );

    const responses = await Promise.all(programPromises);

    // Combine all availability data
    const allAvailability = responses.flatMap((r) => r.data || []);

    console.log(`[flights/airline] Got ${allAvailability.length} total availability records`);

    // Filter by airline code - check all cabin airline fields
    const filteredAvailability = allAvailability.filter((avail) => {
      // Check if the airline operates any cabin on this route
      const airlinesFields = [
        avail.YAirlines,
        avail.WAirlines,
        avail.JAirlines,
        avail.FAirlines,
      ];

      return airlinesFields.some((airlines) => {
        if (!airlines) return false;
        const codes = airlines.split(',').map((c) => c.trim().toUpperCase());
        return codes.includes(airlineCode);
      });
    });

    console.log(`[flights/airline] Filtered to ${filteredAvailability.length} records for ${airlineCode}`);

    // Transform to our format, filtering by cabin if specified
    const flights = transformSearchResponse(
      { data: filteredAvailability },
      cabin || undefined
    );

    // Further filter to only include flights where the specified airline is operating
    // (in case a route has multiple airlines and we only want our target airline)
    const airlineFlights = flights.filter((flight) => {
      // The airline field is set from the first airline code in the list
      // This is a simplification - ideally we'd check if our airline is in the operating airlines
      return true; // Keep all for now since we already filtered above
    });

    // Sort by date, then by points
    const sortedFlights = airlineFlights.sort((a, b) => {
      const dateCompare = a.departureDate.localeCompare(b.departureDate);
      if (dateCompare !== 0) return dateCompare;
      return a.pointsRequired - b.pointsRequired;
    });

    // Apply limit
    const limitedFlights = sortedFlights.slice(0, limit);

    // Group by route for summary
    const routeSummary = new Map<string, { count: number; minPoints: number; maxPoints: number }>();
    for (const flight of sortedFlights) {
      const routeKey = `${flight.origin}-${flight.destination}`;
      const existing = routeSummary.get(routeKey);
      if (existing) {
        existing.count++;
        existing.minPoints = Math.min(existing.minPoints, flight.pointsRequired);
        existing.maxPoints = Math.max(existing.maxPoints, flight.pointsRequired);
      } else {
        routeSummary.set(routeKey, {
          count: 1,
          minPoints: flight.pointsRequired,
          maxPoints: flight.pointsRequired,
        });
      }
    }

    const routes = Array.from(routeSummary.entries()).map(([route, stats]) => ({
      route,
      origin: route.split('-')[0],
      destination: route.split('-')[1],
      ...stats,
    }));

    return NextResponse.json({
      flights: limitedFlights,
      totalFlights: sortedFlights.length,
      routes,
      airline: {
        code: airline.code,
        name: airline.name,
        alliance: airline.alliance,
        premiumProducts: airline.premiumProducts,
      },
      source: 'seats.aero',
      cabin: cabin || 'all',
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[flights/airline] Error:', error);

    return NextResponse.json({
      flights: [],
      source: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to fetch airline availability',
    });
  }
}
