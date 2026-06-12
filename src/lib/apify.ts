const APIFY_BASE_URL = 'https://api.apify.com/v2';
// Apify REST API expects the actor id as `username~actorName` (tilde, not slash).
const ACTOR_ID = 'igolaizola~flight-award-scraper';

interface ApifySearchParams {
  origin: string;
  destination: string;
  startDate: string;
  endDate?: string;
  cabin?: 'economy' | 'premium_economy' | 'business' | 'first';
  programs?: string[];
}

// ---- Actual shape returned by igolaizola/flight-award-scraper ----
interface ApifyAirline {
  code: string;
  name: string;
}

interface ApifyCabin {
  name: string; // economy | premium | business | first
  available: boolean;
  mileage: number;
  taxes: number; // minor currency units (cents)
  airlines?: ApifyAirline[];
  direct?: boolean;
}

interface ApifySegment {
  flightNumber: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  duration?: number;
  fareClass?: string;
  aircraftName?: string;
  cabin?: string;
}

interface ApifyItinerary {
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  totalDuration?: number;
  stops?: number;
  airlines?: ApifyAirline[];
  aircrafts?: string[];
  flightNumbers?: string[];
  segments?: ApifySegment[];
}

interface ApifyAwardResult {
  origin: string;
  originName?: string;
  destination: string;
  destinationName?: string;
  date: string;
  issuer: string;
  issuerName?: string;
  link?: string;
  cabins?: ApifyCabin[];
  itineraries?: ApifyItinerary[];
}

// Map the app's loyalty-program ids to the scraper's issuer codes.
const PROGRAM_MAP: Record<string, string> = {
  'united-mileageplus': 'united',
  'american-aadvantage': 'american',
  'delta-skymiles': 'delta',
  'alaska-mileageplan': 'alaska',
  'jetblue-trueblue': 'jetblue',
  'aeroplan': 'aeroplan',
  'flying-blue': 'flyingblue',
  'krisflyer': 'singapore',
  'virginatlantic': 'virginatlantic',
  'emirates-skywards': 'emirates',
  'smiles': 'smiles',
  'velocity': 'velocity',
  'eurobonus': 'eurobonus',
  'qantas': 'qantas',
  'etihad': 'etihad',
};

const REVERSE_PROGRAM_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(PROGRAM_MAP).map(([k, v]) => [v, k])
);

// Issuer codes the actor accepts (from its input schema).
const VALID_ISSUERS = new Set([
  'aeromexico', 'aeroplan', 'alaska', 'american', 'azul', 'copa', 'delta',
  'emirates', 'ethiopian', 'etihad', 'eurobonus', 'finnair', 'flyingblue',
  'jetblue', 'lufthansa', 'qantas', 'qatar', 'saudia', 'singapore', 'smiles',
  'turkish', 'united', 'velocity', 'virginatlantic',
]);

// app cabin -> actor cabin
const CABIN_MAP: Record<string, string> = {
  'economy': 'economy',
  'premium_economy': 'premium',
  'business': 'business',
  'first': 'first',
};

// actor cabin -> app cabin
const REVERSE_CABIN_MAP: Record<string, 'economy' | 'premium_economy' | 'business' | 'first'> = {
  'economy': 'economy',
  'premium': 'premium_economy',
  'business': 'business',
  'first': 'first',
};

// Simple in-memory cache (15 min) keyed by search params.
const cache = new Map<string, { data: ApifyAwardResult[]; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000;

function getCacheKey(params: ApifySearchParams): string {
  return JSON.stringify([
    params.origin,
    params.destination,
    params.startDate,
    params.endDate || params.startDate,
    params.cabin || '',
    (params.programs || []).slice().sort(),
  ]);
}

export async function searchAwardFlights(params: ApifySearchParams): Promise<ApifyAwardResult[]> {
  const apiKey = process.env.APIFY_API_TOKEN;
  if (!apiKey) {
    throw new Error('APIFY_API_TOKEN not configured');
  }

  const cacheKey = getCacheKey(params);
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const input: Record<string, unknown> = {
    origins: [params.origin],
    destinations: [params.destination],
    startDate: params.startDate,
    endDate: params.endDate || params.startDate,
    maxItems: 100,
  };

  if (params.cabin) {
    input.cabin = CABIN_MAP[params.cabin] || '';
  }

  if (params.programs && params.programs.length > 0) {
    const issuers = params.programs
      .map((p) => PROGRAM_MAP[p] || p)
      .filter((v) => VALID_ISSUERS.has(v));
    if (issuers.length > 0) {
      input.issuers = issuers;
    }
  }

  // Run the actor synchronously and get the dataset items in one call.
  const response = await fetch(
    `${APIFY_BASE_URL}/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Apify run failed: ${response.status} ${errorText}`);
  }

  const results: ApifyAwardResult[] = await response.json();
  cache.set(cacheKey, { data: results, timestamp: Date.now() });
  return results;
}

function extractTime(iso?: string): string {
  if (!iso) return '';
  const t = iso.indexOf('T');
  if (t === -1) return '';
  return iso.slice(t + 1, t + 6); // "HH:MM"
}

function formatDuration(minutes?: number): string {
  if (!minutes || minutes <= 0) return '';
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
}

// Pick the most appealing itinerary (fewest stops, then shortest).
function pickItinerary(itineraries?: ApifyItinerary[]): ApifyItinerary | undefined {
  if (!itineraries || itineraries.length === 0) return undefined;
  return [...itineraries].sort((a, b) => {
    const stopsDiff = (a.stops ?? 99) - (b.stops ?? 99);
    if (stopsDiff !== 0) return stopsDiff;
    return (a.totalDuration ?? Infinity) - (b.totalDuration ?? Infinity);
  })[0];
}

const CASH_ESTIMATES: Record<string, number> = {
  economy: 600,
  premium_economy: 1500,
  business: 5000,
  first: 12000,
};

export function transformApifyResults(
  results: ApifyAwardResult[],
  filterCabin?: string
): import('@/types').AwardFlight[] {
  const { loyaltyPrograms } = require('@/data/loyalty-programs');
  const flights: import('@/types').AwardFlight[] = [];

  results.forEach((item, itemIndex) => {
    const itinerary = pickItinerary(item.itineraries);
    const programId = REVERSE_PROGRAM_MAP[item.issuer] || item.issuer;
    const program =
      loyaltyPrograms.find((p: { id: string }) => p.id === programId) || {
        id: programId,
        name: item.issuerName || item.issuer,
        type: 'airline' as const,
        logoUrl: '',
        baseValueCpp: 1.0,
        transferPartners: [],
      };

    (item.cabins || []).forEach((cabin, cabinIndex) => {
      if (!cabin.available || !cabin.mileage || cabin.mileage <= 0) return;

      const cabinClass = REVERSE_CABIN_MAP[cabin.name?.toLowerCase()] || 'economy';
      if (filterCabin && cabinClass !== filterCabin) return;

      const cashEstimate = CASH_ESTIMATES[cabinClass] || 600;
      const valueCpp = cabin.mileage > 0 ? (cashEstimate / cabin.mileage) * 100 : 0;
      const airlineName =
        cabin.airlines?.[0]?.name || itinerary?.airlines?.[0]?.name || program.name;

      const segments = itinerary?.segments?.map((s) => ({
        flightNumber: s.flightNumber,
        origin: s.origin,
        destination: s.destination,
        departureTime: extractTime(s.departure),
        arrivalTime: extractTime(s.arrival),
        aircraft: s.aircraftName,
        fareClass: s.fareClass,
      }));

      const stops =
        itinerary?.stops ?? (segments ? Math.max(0, segments.length - 1) : 0);

      flights.push({
        id: `apify-${item.issuer}-${item.origin}-${item.destination}-${item.date}-${cabin.name}-${itemIndex}-${cabinIndex}`,
        programId,
        program,
        origin: item.origin,
        destination: item.destination,
        departureDate: item.date,
        departureTime: extractTime(itinerary?.departure),
        arrivalTime: extractTime(itinerary?.arrival),
        airline: airlineName,
        flightNumber: itinerary?.flightNumbers?.[0] || '',
        aircraft: itinerary?.aircrafts?.[0],
        cabinClass,
        pointsRequired: cabin.mileage,
        taxesFees: Math.round((cabin.taxes || 0) / 100),
        seatsAvailable: 1,
        duration: formatDuration(itinerary?.totalDuration),
        stops,
        valueCpp: Math.round(valueCpp * 10) / 10,
        source: 'apify',
        bookingUrl: item.link,
        segments,
        isLiveData: true,
      });
    });
  });

  return flights.sort((a, b) => a.pointsRequired - b.pointsRequired);
}

export function getApifySupportedPrograms(): string[] {
  return Object.keys(PROGRAM_MAP);
}
