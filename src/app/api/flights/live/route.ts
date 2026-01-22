import { NextRequest, NextResponse } from 'next/server';
import {
  liveSearch,
  transformLiveSearchResults,
  CabinClass,
  PROGRAM_ID_TO_SOURCE,
} from '@/lib/seats-aero';

export const dynamic = 'force-dynamic';

// Live search can take 5-15 seconds
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { origin, destination, date, source, programId, cabin, seatCount, disableFilters } = body;

    // Validate required parameters
    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required', flights: [], success: false },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required (YYYY-MM-DD format)', flights: [], success: false },
        { status: 400 }
      );
    }

    // Get source from either direct source parameter or programId mapping
    let searchSource = source;
    if (!searchSource && programId) {
      searchSource = PROGRAM_ID_TO_SOURCE[programId];
    }

    if (!searchSource) {
      return NextResponse.json(
        {
          error: 'Source or programId is required. Source should be a mileage program like "united", "qantas", etc.',
          flights: [],
          success: false,
        },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.SEATS_AERO_API_KEY) {
      console.error('[flights/live] SEATS_AERO_API_KEY is not configured');
      return NextResponse.json({
        flights: [],
        bookingLinks: [],
        success: false,
        error: 'SEATS_AERO_API_KEY environment variable is not configured',
      });
    }

    console.log(`[flights/live] Live search: ${origin} -> ${destination} on ${date} via ${searchSource}`);

    // Perform live search
    const response = await liveSearch(
      origin,
      destination,
      date,
      searchSource,
      {
        disableFilters: disableFilters || false,
        seatCount: seatCount || 1,
      }
    );

    if (!response.success) {
      console.error(`[flights/live] Live search failed: ${response.error}`);
      return NextResponse.json({
        flights: [],
        bookingLinks: [],
        success: false,
        error: response.error || 'Live search failed',
        message: 'The live search could not be completed. This may be due to the airline being unavailable or rate limiting.',
      });
    }

    console.log(`[flights/live] Got ${response.results?.length || 0} live results`);

    // Transform to our AwardFlight format
    const flights = transformLiveSearchResults(response, cabin as CabinClass | undefined);

    console.log(`[flights/live] Transformed to ${flights.length} flights`);

    return NextResponse.json({
      flights,
      bookingLinks: response.bookingLinks || [],
      success: true,
      count: flights.length,
      source: 'seats.aero-live',
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[flights/live] Error:', error);

    return NextResponse.json({
      flights: [],
      bookingLinks: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to perform live search',
    });
  }
}

// Also support GET for simpler testing
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const date = searchParams.get('date');
  const source = searchParams.get('source');
  const programId = searchParams.get('program_id');
  const cabin = searchParams.get('cabin');

  // Convert to POST body format
  const body = {
    origin,
    destination,
    date,
    source,
    programId,
    cabin,
  };

  // Create a mock request with the body
  const mockRequest = new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return POST(mockRequest);
}
