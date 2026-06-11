const APIFY_BASE_URL = 'https://api.apify.com/v2';
const ACTOR_ID = 'igolaizola/flight-award-scraper';

interface ApifySearchParams {
  origin: string;
  destination: string;
  startDate: string;
  endDate?: string;
  cabin?: 'economy' | 'premium_economy' | 'business' | 'first';
  programs?: string[];
}

interface ApifyAwardResult {
  program: string;
  origin: string;
  destination: string;
  date: string;
  cabin: string;
  miles: number;
  taxes: number;
  taxCurrency: string;
  seats: number;
  flights: ApifyFlightSegment[];
  bookingUrl?: string;
}

interface ApifyFlightSegment {
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  aircraft?: string;
  duration?: number;
}

interface ApifyRunResponse {
  data: {
    id: string;
    status: string;
    defaultDatasetId: string;
  };
}

const PROGRAM_MAP: Record<string, string> = {
  'united-mileageplus': 'united',
  'american-aadvantage': 'american',
  'delta-skymiles': 'delta',
  'alaska-mileageplan': 'alaska',
  'jetblue-trueblue': 'jetblue',
  'aeroplan': 'aeroplan',
  'avios': 'avios',
  'flying-blue': 'flyingblue',
  'krisflyer': 'krisflyer',
  'virginatlantic': 'virgin-atlantic',
  'emirates-skywards': 'emirates',
  'southwest-rr': 'southwest',
};

const CABIN_MAP: Record<string, string> = {
  'economy': 'economy',
  'premium_economy': 'premium',
  'business': 'business',
  'first': 'first',
};

const REVERSE_PROGRAM_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(PROGRAM_MAP).map(([k, v]) => [v, k])
);

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000;

function getCacheKey(params: ApifySearchParams): string {
  return `${params.origin}:${params.destination}:${params.startDate}:${params.endDate || ''}:${params.cabin || ''}`;
}

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function searchAwardFlights(params: ApifySearchParams): Promise<ApifyAwardResult[]> {
  const apiKey = process.env.APIFY_API_TOKEN;
  if (!apiKey) {
    throw new Error('APIFY_API_TOKEN not configured');
  }

  const cacheKey = getCacheKey(params);
  const cached = getFromCache<ApifyAwardResult[]>(cacheKey);
  if (cached) return cached;

  const input: Record<string, unknown> = {
    origins: [params.origin],
    destinations: [params.destination],
    startDate: params.startDate,
    endDate: params.endDate || params.startDate,
  };

  if (params.cabin) {
    input.cabinClass = CABIN_MAP[params.cabin] || 'economy';
  }

  if (params.programs && params.programs.length > 0) {
    input.programs = params.programs
      .map(p => PROGRAM_MAP[p] || p)
      .filter(Boolean);
  }

  // Start the actor run
  const runResponse = await fetch(
    `${APIFY_BASE_URL}/acts/${ACTOR_ID}/runs?token=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }
  );

  if (!runResponse.ok) {
    const errorText = await runResponse.text();
    throw new Error(`Apify run failed: ${runResponse.status} ${errorText}`);
  }

  const runData: ApifyRunResponse = await runResponse.json();
  const runId = runData.data.id;

  // Poll for completion (max 60 seconds)
  const maxWait = 60_000;
  const pollInterval = 3_000;
  const startTime = Date.now();

  while (Date.now() - startTime < maxWait) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));

    const statusResponse = await fetch(
      `${APIFY_BASE_URL}/actor-runs/${runId}?token=${apiKey}`
    );
    const statusData = await statusResponse.json();

    if (statusData.data.status === 'SUCCEEDED') {
      break;
    }
    if (statusData.data.status === 'FAILED' || statusData.data.status === 'ABORTED') {
      throw new Error(`Apify run ${statusData.data.status}`);
    }
  }

  // Fetch results from the dataset
  const datasetResponse = await fetch(
    `${APIFY_BASE_URL}/actor-runs/${runId}/dataset/items?token=${apiKey}&format=json`
  );

  if (!datasetResponse.ok) {
    throw new Error('Failed to fetch Apify results');
  }

  const results: ApifyAwardResult[] = await datasetResponse.json();
  setCache(cacheKey, results);

  return results;
}

export function transformApifyResults(
  results: ApifyAwardResult[],
  filterCabin?: string
): import('@/types').AwardFlight[] {
  const { loyaltyPrograms } = require('@/data/loyalty-programs');

  return results
    .filter(r => !filterCabin || r.cabin.toLowerCase() === filterCabin)
    .filter(r => r.miles > 0 && r.seats > 0)
    .map((r, index) => {
      const programId = REVERSE_PROGRAM_MAP[r.program] || r.program;
      const program = loyaltyPrograms.find((p: { id: string }) => p.id === programId);

      const cabinMap: Record<string, 'economy' | 'premium_economy' | 'business' | 'first'> = {
        'economy': 'economy',
        'premium': 'premium_economy',
        'business': 'business',
        'first': 'first',
      };

      const cabin = cabinMap[r.cabin.toLowerCase()] || 'economy';
      const cashEstimate = estimateCashPrice(cabin);
      const valueCpp = r.miles > 0 ? (cashEstimate / r.miles) * 100 : 0;

      const firstFlight = r.flights?.[0];
      const lastFlight = r.flights?.[r.flights.length - 1];

      return {
        id: `apify-${index}-${r.origin}-${r.destination}-${r.date}`,
        programId,
        program: program || {
          id: programId,
          name: r.program,
          type: 'airline' as const,
          logoUrl: '',
          baseValueCpp: 1.0,
          transferPartners: [],
        },
        origin: r.origin,
        destination: r.destination,
        departureDate: r.date,
        departureTime: firstFlight?.departure || '',
        arrivalTime: lastFlight?.arrival || '',
        airline: firstFlight?.airline || r.program,
        flightNumber: firstFlight?.flightNumber || '',
        aircraft: firstFlight?.aircraft,
        cabinClass: cabin,
        pointsRequired: r.miles,
        taxesFees: r.taxes || 0,
        seatsAvailable: r.seats,
        duration: calculateDuration(r.flights),
        stops: Math.max(0, (r.flights?.length || 1) - 1),
        valueCpp: Math.round(valueCpp * 10) / 10,
        source: 'apify',
        bookingUrl: r.bookingUrl,
        segments: r.flights?.map(f => ({
          flightNumber: f.flightNumber,
          origin: f.origin,
          destination: f.destination,
          departureTime: f.departure,
          arrivalTime: f.arrival,
          aircraft: f.aircraft,
        })),
        isLiveData: true,
      };
    })
    .sort((a, b) => a.pointsRequired - b.pointsRequired);
}

function estimateCashPrice(cabin: string): number {
  const prices: Record<string, number> = {
    economy: 600,
    premium_economy: 1500,
    business: 5000,
    first: 12000,
  };
  return prices[cabin] || 600;
}

function calculateDuration(flights?: ApifyFlightSegment[]): string {
  if (!flights || flights.length === 0) return '';

  let totalMinutes = 0;
  for (const f of flights) {
    if (f.duration) {
      totalMinutes += f.duration;
    } else if (f.departure && f.arrival) {
      const dep = new Date(f.departure).getTime();
      const arr = new Date(f.arrival).getTime();
      if (!isNaN(dep) && !isNaN(arr)) {
        totalMinutes += (arr - dep) / 60000;
      }
    }
  }

  if (totalMinutes <= 0) return '';
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  return `${hours}h ${mins}m`;
}

export function getApifySupportedPrograms(): string[] {
  return Object.keys(PROGRAM_MAP);
}
