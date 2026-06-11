import { NextRequest, NextResponse } from 'next/server';
import { searchAwardFlights, transformApifyResults } from '@/lib/apify';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const startDate = searchParams.get('start_date') || searchParams.get('date');
  const endDate = searchParams.get('end_date');
  const cabin = searchParams.get('cabin');

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

  if (!process.env.APIFY_API_TOKEN) {
    console.error('[flights/search] APIFY_API_TOKEN is not configured');
    return NextResponse.json({
      flights: [],
      source: 'error',
      error: 'Search API is not configured. Please add APIFY_API_TOKEN to your environment variables.',
    });
  }

  try {
    console.log(`[flights/search] Searching ${origin} -> ${destination}, ${startDate} to ${endDate}, cabin: ${cabin}`);

    const results = await searchAwardFlights({
      origin,
      destination,
      startDate,
      endDate: endDate || undefined,
      cabin: cabin as 'economy' | 'premium_economy' | 'business' | 'first' | undefined,
    });

    console.log(`[flights/search] Got ${results.length} results from Apify`);

    const flights = transformApifyResults(results, cabin || undefined);

    console.log(`[flights/search] Transformed to ${flights.length} flights`);

    if (flights.length === 0) {
      return NextResponse.json({
        flights: [],
        source: 'apify',
        count: 0,
        message: 'No award availability found for this route and date range',
        lastUpdated: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      flights,
      source: 'apify',
      count: flights.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[flights/search] Error:', error);

    return NextResponse.json({
      flights: [],
      source: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to fetch award availability',
    });
  }
}
