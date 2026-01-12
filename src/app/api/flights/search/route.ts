import { NextRequest, NextResponse } from 'next/server';
import {
  searchFlights,
  transformSearchResponse,
  CabinClass,
} from '@/lib/seats-aero';
import { generateMockFlights } from '@/data/mock-flights';

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
      { error: 'Origin and destination are required' },
      { status: 400 }
    );
  }

  if (!startDate) {
    return NextResponse.json(
      { error: 'Start date is required' },
      { status: 400 }
    );
  }

  try {
    // Check if API key is configured
    if (!process.env.SEATS_AERO_API_KEY) {
      console.log('[flights/search] No API key configured, using mock data');
      const mockFlights = generateMockFlights(
        origin,
        destination,
        startDate,
        cabin || 'economy'
      );
      return NextResponse.json({
        flights: mockFlights,
        source: 'mock',
        message: 'Using mock data - configure SEATS_AERO_API_KEY for real data',
      });
    }

    // Search seats.aero API
    const response = await searchFlights(
      origin,
      destination,
      startDate,
      endDate || undefined,
      cabin || undefined
    );

    // Transform to our AwardFlight format
    const flights = transformSearchResponse(response, cabin || undefined);

    // If no results from API, fall back to mock data
    if (flights.length === 0) {
      console.log('[flights/search] No results from API, using mock data');
      const mockFlights = generateMockFlights(
        origin,
        destination,
        startDate,
        cabin || 'economy'
      );
      return NextResponse.json({
        flights: mockFlights,
        source: 'mock',
        message: 'No award availability found - showing example data',
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

    // Fall back to mock data on error
    const mockFlights = generateMockFlights(
      origin,
      destination,
      startDate,
      cabin || 'economy'
    );

    return NextResponse.json({
      flights: mockFlights,
      source: 'mock',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'API error - showing example data',
    });
  }
}
