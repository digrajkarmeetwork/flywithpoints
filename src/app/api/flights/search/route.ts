import { NextRequest, NextResponse } from 'next/server';
import {
  startAwardSearch,
  getAwardSearchResults,
  transformApifyResults,
  awardSearchCacheKey,
} from '@/lib/apify';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * Award flight search — async start-and-poll.
 *
 * The Apify scrape can take several minutes (each issuer x day is a separate
 * scrape), far beyond serverless function limits. So:
 *   1. First request (no run_id) starts the actor run and returns { status:
 *      "running", runId } immediately (or full results on a cache hit).
 *   2. The client polls with run_id until { status: "done", flights } arrives.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const startDate = searchParams.get('start_date') || searchParams.get('date');
  const endDate = searchParams.get('end_date');
  const cabin = searchParams.get('cabin');
  const runId = searchParams.get('run_id');

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

  const params = {
    origin,
    destination,
    startDate,
    endDate: endDate || undefined,
    cabin: cabin as 'economy' | 'premium_economy' | 'business' | 'first' | undefined,
  };

  try {
    // Poll mode: check on an in-progress run.
    if (runId) {
      const poll = await getAwardSearchResults(runId, awardSearchCacheKey(params));

      if (poll.status === 'running') {
        return NextResponse.json({ status: 'running', runId, flights: [] });
      }

      if (poll.status === 'error') {
        return NextResponse.json({
          status: 'error',
          flights: [],
          source: 'error',
          error: poll.error || 'Search failed',
        });
      }

      const flights = transformApifyResults(poll.results || [], cabin || undefined);
      console.log(`[flights/search] Run ${runId} done: ${poll.results?.length ?? 0} items -> ${flights.length} flights`);

      return NextResponse.json({
        status: 'done',
        flights,
        source: 'apify',
        count: flights.length,
        message: flights.length === 0 ? 'No award availability found for this route and date range' : undefined,
        lastUpdated: new Date().toISOString(),
      });
    }

    // Start mode: kick off a new run (or serve from cache).
    console.log(`[flights/search] Starting ${origin} -> ${destination}, ${startDate} to ${endDate}, cabin: ${cabin}`);
    const start = await startAwardSearch(params);

    // Cache hit: results are already available.
    if (start.results) {
      const flights = transformApifyResults(start.results, cabin || undefined);
      return NextResponse.json({
        status: 'done',
        flights,
        source: 'apify',
        count: flights.length,
        message: flights.length === 0 ? 'No award availability found for this route and date range' : undefined,
        lastUpdated: new Date().toISOString(),
      });
    }

    return NextResponse.json({ status: 'running', runId: start.runId, flights: [] });
  } catch (error) {
    console.error('[flights/search] Error:', error);

    return NextResponse.json({
      status: 'error',
      flights: [],
      source: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to fetch award availability',
    });
  }
}
