import { NextRequest, NextResponse } from 'next/server';
import {
  getAvailability,
  transformSearchResponse,
  PROGRAM_ID_TO_SOURCE,
  isProgramSupported,
} from '@/lib/seats-aero';

export const dynamic = 'force-dynamic';

/**
 * Get bulk availability for a mileage program
 * Used by the "What Can I Do With My Points?" feature to check real availability
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const programId = searchParams.get('program_id');
  const source = searchParams.get('source');
  const destinationRegion = searchParams.get('destination_region');
  const originAirport = searchParams.get('origin_airport');

  // Need either programId or source
  if (!programId && !source) {
    return NextResponse.json(
      { error: 'Either program_id or source is required' },
      { status: 400 }
    );
  }

  // Determine the source to query
  let querySource = source;
  if (programId && !source) {
    if (!isProgramSupported(programId)) {
      return NextResponse.json({
        flights: [],
        source: 'unsupported',
        message: `Program ${programId} is not supported by seats.aero`,
      });
    }
    querySource = PROGRAM_ID_TO_SOURCE[programId];
  }

  if (!querySource) {
    return NextResponse.json({
      flights: [],
      source: 'unsupported',
      message: 'Could not determine source for program',
    });
  }

  try {
    // Check if API key is configured
    if (!process.env.SEATS_AERO_API_KEY) {
      return NextResponse.json({
        flights: [],
        source: 'unconfigured',
        message: 'SEATS_AERO_API_KEY not configured',
      });
    }

    // Fetch bulk availability
    const response = await getAvailability(querySource);

    // Transform to our format
    let flights = transformSearchResponse(response);

    // Filter by destination region if specified
    if (destinationRegion) {
      const lowerRegion = destinationRegion.toLowerCase();
      flights = flights.filter((f) => {
        // We need to check the route's destination region
        // The flight object doesn't have region, so we'd need to look it up
        // For now, we'll keep all flights and let the client filter
        return true;
      });
    }

    // Filter by origin airport if specified
    if (originAirport) {
      const upperOrigin = originAirport.toUpperCase();
      flights = flights.filter((f) => f.origin === upperOrigin);
    }

    // Return summary data to reduce payload size
    const summary = {
      totalFlights: flights.length,
      byDestination: {} as Record<string, number>,
      byCabin: {
        economy: 0,
        premium_economy: 0,
        business: 0,
        first: 0,
      },
      bestValue: flights[0] || null, // Already sorted by value
      cheapest: flights.length > 0
        ? flights.reduce((min, f) => f.pointsRequired < min.pointsRequired ? f : min, flights[0])
        : null,
    };

    // Count by destination
    flights.forEach((f) => {
      summary.byDestination[f.destination] = (summary.byDestination[f.destination] || 0) + 1;
      summary.byCabin[f.cabinClass]++;
    });

    return NextResponse.json({
      flights: flights.slice(0, 50), // Limit to first 50 to reduce payload
      summary,
      source: 'seats.aero',
      count: flights.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[flights/availability] Error:', error);

    return NextResponse.json({
      flights: [],
      source: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to fetch availability',
    });
  }
}
