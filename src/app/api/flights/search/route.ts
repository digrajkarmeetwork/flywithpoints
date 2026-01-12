import { NextRequest, NextResponse } from 'next/server';
import {
  searchFlights,
  transformSearchResponse,
  CabinClass,
} from '@/lib/seats-aero';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const startDate = searchParams.get('start_date') || searchParams.get('date');
  const endDate = searchParams.get('end_date');
  const cabin = searchParams.get('cabin') as CabinClass | null;

  // Validate required parameters
  if (!origin || !destination) {
    return NextResponse.json(
      { error: 'Origin and destination are required', flights: [] },
      { status: 400 }
    );
  }

  if (!startDate) {
    return NextResponse.json(
      { error: 'Start date is required', flights: [] },
      { status: 400 }
    );
  }

  // Check if API key is configured
  if (!process.env.SEATS_AERO_API_KEY) {
    console.error('[flights/search] SEATS_AERO_API_KEY is not configured');
    return NextResponse.json({
      flights: [],
      source: 'error',
      error: 'SEATS_AERO_API_KEY environment variable is not configured',
      message: 'Please add SEATS_AERO_API_KEY to your environment variables',
    });
  }

  try {
    console.log(`[flights/search] Searching ${origin} -> ${destination}, ${startDate} to ${endDate}, cabin: ${cabin}`);

    // Search seats.aero API
    const response = await searchFlights(
      origin,
      destination,
      startDate,
      endDate || undefined,
      cabin || undefined
    );

    console.log(`[flights/search] Got ${response.data?.length || 0} availability records from seats.aero`);

    // Transform to our AwardFlight format
    const flights = transformSearchResponse(response, cabin || undefined);

    console.log(`[flights/search] Transformed to ${flights.length} flights`);

    if (flights.length === 0) {
      return NextResponse.json({
        flights: [],
        source: 'seats.aero',
        count: 0,
        message: 'No award availability found for this route and date range',
        lastUpdated: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      flights,
      source: 'seats.aero',
      count: flights.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[flights/search] Error:', error);

    return NextResponse.json({
      flights: [],
      source: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to fetch from seats.aero API',
    });
  }
}
