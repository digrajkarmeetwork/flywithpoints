/**
 * Seats.aero API Client
 *
 * Provides access to real award flight availability data from seats.aero
 * Includes built-in caching to minimize API calls (1000/day limit)
 */

import { AwardFlight } from '@/types';
import { getProgramById } from '@/data/loyalty-programs';

// =============================================================================
// Types
// =============================================================================

export interface SeatsAeroRoute {
  ID: string;
  OriginAirport: string;
  DestinationAirport: string;
  OriginRegion: string;
  DestinationRegion: string;
  NumDaysOut: number;
  Distance: number;
  Source: string;
}

export interface SeatsAeroAvailability {
  ID: string;
  RouteID: string;
  Route: SeatsAeroRoute;
  Date: string;
  ParsedDate: string;

  // Availability by cabin class (Y=economy, W=premium, J=business, F=first)
  YAvailable: boolean;
  WAvailable: boolean;
  JAvailable: boolean;
  FAvailable: boolean;

  // Mileage costs (string format from API)
  YMileageCost: string;
  WMileageCost: string;
  JMileageCost: string;
  FMileageCost: string;

  // Taxes in cents
  TaxesCurrency: string;
  YTotalTaxes: number;
  WTotalTaxes: number;
  JTotalTaxes: number;
  FTotalTaxes: number;

  // Remaining seats
  YRemainingSeats: number;
  WRemainingSeats: number;
  JRemainingSeats: number;
  FRemainingSeats: number;

  // Airlines operating (comma-separated codes)
  YAirlines: string;
  WAirlines: string;
  JAirlines: string;
  FAirlines: string;

  // Direct flight availability
  YDirect: boolean;
  WDirect: boolean;
  JDirect: boolean;
  FDirect: boolean;

  Source: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface SeatsAeroSearchResponse {
  data: SeatsAeroAvailability[];
}

export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

// =============================================================================
// Live Search Types
// =============================================================================

export interface LiveSearchRequest {
  origin_airport: string;
  destination_airport: string;
  departure_date: string; // YYYY-MM-DD
  source: string; // e.g., "united", "qantas"
  disable_filters?: boolean;
  show_dynamic_pricing?: boolean;
  seat_count?: number; // 1-9, default 1
}

export interface LiveSearchSegment {
  ID: string;
  FlightNumber: string;
  Distance: number;
  FareClass: string;
  AircraftName: string;
  AircraftCode: string;
  OriginAirport: string;
  DestinationAirport: string;
  DepartsAt: string; // ISO timestamp
  ArrivesAt: string;
  Source: string;
  Cabin: string;
}

export interface LiveSearchResult {
  ID: string;
  AvailabilitySegments: LiveSearchSegment[];
  TotalDuration: number; // minutes
  Stops: number;
  Carriers: string;
  RemainingSeats: number;
  MileageCost: number;
  TotalTaxes: number; // in minor units (cents)
  TaxesCurrency: string;
  TaxesCurrencySymbol: string;
  FlightNumbers: string;
  DepartsAt: string; // ISO timestamp
  ArrivesAt: string;
  Cabin: string; // "economy", "business", etc.
  Source: string;
  Filtered: boolean;
}

export interface LiveSearchBookingLink {
  label: string;
  link: string;
  primary: boolean;
}

export interface LiveSearchResponse {
  success: boolean;
  results: LiveSearchResult[];
  bookingLinks: LiveSearchBookingLink[];
  error?: string;
}

// =============================================================================
// Constants
// =============================================================================

const API_BASE_URL = 'https://seats.aero/partnerapi';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Map seats.aero source codes to our program IDs
export const SOURCE_TO_PROGRAM_ID: Record<string, string> = {
  'united': 'united-mileageplus',
  'american': 'american-aadvantage',
  'delta': 'delta-skymiles',
  'alaska': 'alaska-mileageplan',
  'jetblue': 'jetblue-trueblue',
  'aeroplan': 'aeroplan',
  'virginatlantic': 'virginatlantic',
  'emirates': 'emirates-skywards',
  'aerlingus': 'aerlingus',
  'qantas': 'qantas',
  'lifemiles': 'lifemiles',
  'smiles': 'smiles',
  'velocity': 'velocity',
  'eurobonus': 'eurobonus',
  'etihad': 'etihad',
};

// Map our program IDs to seats.aero sources
export const PROGRAM_ID_TO_SOURCE: Record<string, string> = {
  'united-mileageplus': 'united',
  'american-aadvantage': 'american',
  'delta-skymiles': 'delta',
  'alaska-mileageplan': 'alaska',
  'jetblue-trueblue': 'jetblue',
  'aeroplan': 'aeroplan',
  'virginatlantic': 'virginatlantic',
  'emirates-skywards': 'emirates',
};

// Map cabin codes to our cabin class names
const CABIN_CODE_TO_CLASS: Record<string, CabinClass> = {
  'Y': 'economy',
  'W': 'premium_economy',
  'J': 'business',
  'F': 'first',
};

// Airline code to full name mapping
const AIRLINE_CODES: Record<string, string> = {
  'AA': 'American Airlines',
  'UA': 'United Airlines',
  'DL': 'Delta Air Lines',
  'AS': 'Alaska Airlines',
  'B6': 'JetBlue Airways',
  'WN': 'Southwest Airlines',
  'BA': 'British Airways',
  'LH': 'Lufthansa',
  'AF': 'Air France',
  'KL': 'KLM',
  'AC': 'Air Canada',
  'EK': 'Emirates',
  'SQ': 'Singapore Airlines',
  'CX': 'Cathay Pacific',
  'QF': 'Qantas',
  'NH': 'ANA',
  'JL': 'Japan Airlines',
  'VS': 'Virgin Atlantic',
  'IB': 'Iberia',
  'AY': 'Finnair',
  'TK': 'Turkish Airlines',
  'EI': 'Aer Lingus',
  'FI': 'Icelandair',
  'TP': 'TAP Portugal',
  'LO': 'LOT Polish',
  'OS': 'Austrian',
  'LX': 'Swiss',
  'SK': 'SAS',
  'ET': 'Ethiopian Airlines',
  'QR': 'Qatar Airways',
  'AI': 'Air India',
  'BR': 'EVA Air',
  'CI': 'China Airlines',
  'OZ': 'Asiana Airlines',
  'KE': 'Korean Air',
  'MH': 'Malaysia Airlines',
  'TG': 'Thai Airways',
  'GA': 'Garuda Indonesia',
  'PR': 'Philippine Airlines',
  'VN': 'Vietnam Airlines',
  'MU': 'China Eastern',
  'CA': 'Air China',
  'CZ': 'China Southern',
  'HU': 'Hainan Airlines',
  'NZ': 'Air New Zealand',
  'VA': 'Virgin Australia',
  'LA': 'LATAM Airlines',
  'AV': 'Avianca',
  'CM': 'Copa Airlines',
  'AM': 'Aeromexico',
  'SA': 'South African Airways',
  'MS': 'EgyptAir',
  'RJ': 'Royal Jordanian',
  'GF': 'Gulf Air',
  'WY': 'Oman Air',
  'SV': 'Saudia',
  'UL': 'SriLankan Airlines',
  'PK': 'Pakistan International',
  'BG': 'Biman Bangladesh',
  'EY': 'Etihad Airways',
  'EH': 'ANA Wings',
};

// Typical cash prices by route distance and cabin (for CPP calculation)
const TYPICAL_CASH_PRICES: Record<CabinClass, { short: number; medium: number; long: number }> = {
  'economy': { short: 300, medium: 600, long: 1000 },
  'premium_economy': { short: 500, medium: 1200, long: 2000 },
  'business': { short: 1500, medium: 4000, long: 7000 },
  'first': { short: 3000, medium: 8000, long: 15000 },
};

// =============================================================================
// Cache Implementation
// =============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCacheKey(endpoint: string, params: Record<string, string>): string {
  const sortedParams = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
  return `${endpoint}?${sortedParams}`;
}

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Make an authenticated request to the seats.aero API
 */
async function apiRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = process.env.SEATS_AERO_API_KEY;

  if (!apiKey) {
    throw new Error('SEATS_AERO_API_KEY is not configured');
  }

  const cacheKey = getCacheKey(endpoint, params);
  const cached = getFromCache<T>(cacheKey);
  if (cached) {
    console.log(`[seats.aero] Cache hit for ${endpoint}`);
    return cached;
  }

  const queryString = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;

  console.log(`[seats.aero] Fetching ${url}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Partner-Authorization': apiKey,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`seats.aero API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json() as T;
  setCache(cacheKey, data);

  return data;
}

/**
 * Search for award availability between two airports
 */
export async function searchFlights(
  origin: string,
  destination: string,
  startDate: string,
  endDate?: string,
  cabin?: CabinClass
): Promise<SeatsAeroSearchResponse> {
  const params: Record<string, string> = {
    origin_airport: origin.toUpperCase(),
    destination_airport: destination.toUpperCase(),
    start_date: startDate,
  };

  if (endDate) {
    params.end_date = endDate;
  }

  // Note: seats.aero doesn't filter by cabin in the API, we filter in transform

  return apiRequest<SeatsAeroSearchResponse>('/search', params);
}

/**
 * Get bulk availability for a specific mileage program
 */
export async function getAvailability(source: string): Promise<SeatsAeroSearchResponse> {
  return apiRequest<SeatsAeroSearchResponse>('/availability', { source });
}

/**
 * Perform a live search for award availability
 * This endpoint provides richer data including specific flight times, segments, and booking links
 * Note: Takes 5-15 seconds to respond as it queries the airline directly
 */
export async function liveSearch(
  origin: string,
  destination: string,
  date: string,
  source: string,
  options?: {
    disableFilters?: boolean;
    showDynamicPricing?: boolean;
    seatCount?: number;
  }
): Promise<LiveSearchResponse> {
  const apiKey = process.env.SEATS_AERO_API_KEY;

  if (!apiKey) {
    throw new Error('SEATS_AERO_API_KEY is not configured');
  }

  const requestBody: LiveSearchRequest = {
    origin_airport: origin.toUpperCase(),
    destination_airport: destination.toUpperCase(),
    departure_date: date,
    source: source.toLowerCase(),
  };

  if (options?.disableFilters) {
    requestBody.disable_filters = true;
  }
  if (options?.showDynamicPricing) {
    requestBody.show_dynamic_pricing = true;
  }
  if (options?.seatCount && options.seatCount >= 1 && options.seatCount <= 9) {
    requestBody.seat_count = options.seatCount;
  }

  // Check cache first
  const cacheKey = `live:${origin}:${destination}:${date}:${source}`;
  const cached = getFromCache<LiveSearchResponse>(cacheKey);
  if (cached) {
    console.log(`[seats.aero] Live search cache hit for ${cacheKey}`);
    return cached;
  }

  console.log(`[seats.aero] Live search: ${origin} -> ${destination} on ${date} via ${source}`);

  const response = await fetch(`${API_BASE_URL}/live`, {
    method: 'POST',
    headers: {
      'Partner-Authorization': apiKey,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[seats.aero] Live search error: ${response.status} - ${errorText}`);
    return {
      success: false,
      results: [],
      bookingLinks: [],
      error: `API error: ${response.status} - ${errorText}`,
    };
  }

  const data = await response.json() as LiveSearchResponse;

  // Cache successful responses
  if (data.success) {
    setCache(cacheKey, data);
  }

  return data;
}

// =============================================================================
// Transform Functions
// =============================================================================

/**
 * Get the first airline from a comma-separated list of codes
 */
function getAirlineName(airlineCodes: string): string {
  if (!airlineCodes) return 'Unknown Airline';
  const firstCode = airlineCodes.split(',')[0].trim();
  return AIRLINE_CODES[firstCode] || firstCode;
}

/**
 * Estimate typical cash price based on distance and cabin
 */
function estimateCashPrice(distance: number, cabin: CabinClass): number {
  const prices = TYPICAL_CASH_PRICES[cabin];

  if (distance < 1500) return prices.short;
  if (distance < 4000) return prices.medium;
  return prices.long;
}

/**
 * Calculate cents per point value
 */
function calculateCpp(cashPrice: number, points: number): number {
  if (points <= 0) return 0;
  return Number(((cashPrice / points) * 100).toFixed(1));
}

/**
 * Transform a seats.aero availability record into AwardFlight objects
 * One availability record can produce multiple flights (one per cabin class)
 */
export function transformToAwardFlights(
  availability: SeatsAeroAvailability,
  filterCabin?: CabinClass
): AwardFlight[] {
  const flights: AwardFlight[] = [];
  const route = availability.Route;
  const programId = SOURCE_TO_PROGRAM_ID[availability.Source] || availability.Source;
  const program = getProgramById(programId);

  if (!program) {
    console.warn(`Unknown program for source: ${availability.Source}`);
    return flights;
  }

  const cabins: Array<{ code: 'Y' | 'W' | 'J' | 'F'; class: CabinClass }> = [
    { code: 'Y', class: 'economy' },
    { code: 'W', class: 'premium_economy' },
    { code: 'J', class: 'business' },
    { code: 'F', class: 'first' },
  ];

  for (const cabin of cabins) {
    // Skip if filtering for a specific cabin
    if (filterCabin && cabin.class !== filterCabin) continue;

    const available = availability[`${cabin.code}Available` as keyof SeatsAeroAvailability] as boolean;
    const mileageCost = parseInt(availability[`${cabin.code}MileageCost` as keyof SeatsAeroAvailability] as string) || 0;
    const taxes = (availability[`${cabin.code}TotalTaxes` as keyof SeatsAeroAvailability] as number) || 0;
    const seats = (availability[`${cabin.code}RemainingSeats` as keyof SeatsAeroAvailability] as number) || 0;
    const airlines = availability[`${cabin.code}Airlines` as keyof SeatsAeroAvailability] as string;
    const isDirect = availability[`${cabin.code}Direct` as keyof SeatsAeroAvailability] as boolean;

    // Skip if not available, no mileage cost, or no seats
    if (!available || mileageCost <= 0 || seats <= 0) continue;

    const cashPrice = estimateCashPrice(route.Distance, cabin.class);
    const valueCpp = calculateCpp(cashPrice, mileageCost);

    flights.push({
      id: `${availability.ID}-${cabin.code}`,
      programId,
      program,
      origin: route.OriginAirport,
      destination: route.DestinationAirport,
      departureDate: availability.Date,
      departureTime: '', // seats.aero doesn't provide specific times
      arrivalTime: '',
      airline: getAirlineName(airlines),
      flightNumber: '', // Not provided by seats.aero
      cabinClass: cabin.class,
      pointsRequired: mileageCost,
      taxesFees: Math.round(taxes / 100), // Convert from cents to dollars
      seatsAvailable: seats,
      duration: '', // Would need to calculate from distance
      stops: isDirect ? 0 : 1, // Simplified - could be more stops
      valueCpp,
      source: 'seats.aero',
      bookingUrl: undefined, // Will be generated by existing booking URL system
    });
  }

  return flights;
}

/**
 * Transform a full search response into AwardFlight objects
 */
export function transformSearchResponse(
  response: SeatsAeroSearchResponse,
  filterCabin?: CabinClass
): AwardFlight[] {
  const allFlights: AwardFlight[] = [];

  for (const availability of response.data) {
    const flights = transformToAwardFlights(availability, filterCabin);
    allFlights.push(...flights);
  }

  // Sort by value (cpp) descending, then by points ascending
  return allFlights.sort((a, b) => {
    if (b.valueCpp !== a.valueCpp) return b.valueCpp - a.valueCpp;
    return a.pointsRequired - b.pointsRequired;
  });
}

/**
 * Convert minutes to duration string (e.g., "5h 30m")
 */
function formatDuration(minutes: number): string {
  if (minutes <= 0) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Extract time string from ISO timestamp (e.g., "2025-05-20T10:00:00Z" -> "10:00")
 */
function extractTime(isoTimestamp: string): string {
  if (!isoTimestamp) return '';
  try {
    const date = new Date(isoTimestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return '';
  }
}

/**
 * Extract date string from ISO timestamp (e.g., "2025-05-20T10:00:00Z" -> "2025-05-20")
 */
function extractDate(isoTimestamp: string): string {
  if (!isoTimestamp) return '';
  try {
    const date = new Date(isoTimestamp);
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

/**
 * Map live search cabin string to our CabinClass type
 */
function mapLiveCabinClass(cabin: string): CabinClass {
  const cabinLower = cabin.toLowerCase();
  if (cabinLower === 'economy' || cabinLower === 'coach') return 'economy';
  if (cabinLower === 'premium' || cabinLower === 'premium_economy' || cabinLower === 'premium economy') return 'premium_economy';
  if (cabinLower === 'business') return 'business';
  if (cabinLower === 'first') return 'first';
  return 'economy'; // default
}

/**
 * Transform live search results into AwardFlight objects
 */
export function transformLiveSearchResults(
  response: LiveSearchResponse,
  filterCabin?: CabinClass
): AwardFlight[] {
  if (!response.success || !response.results) {
    return [];
  }

  const flights: AwardFlight[] = [];

  for (const result of response.results) {
    const cabinClass = mapLiveCabinClass(result.Cabin);

    // Skip if filtering for a specific cabin
    if (filterCabin && cabinClass !== filterCabin) continue;

    // Skip filtered results (dynamic pricing filtered)
    if (result.Filtered) continue;

    const programId = SOURCE_TO_PROGRAM_ID[result.Source] || result.Source;
    const program = getProgramById(programId);

    if (!program) {
      console.warn(`[seats.aero] Unknown program for live search source: ${result.Source}`);
      continue;
    }

    // Get origin/destination from segments or infer from first/last segment
    let origin = '';
    let destination = '';
    if (result.AvailabilitySegments && result.AvailabilitySegments.length > 0) {
      origin = result.AvailabilitySegments[0].OriginAirport;
      destination = result.AvailabilitySegments[result.AvailabilitySegments.length - 1].DestinationAirport;
    }

    // Calculate total distance from segments for CPP estimation
    const totalDistance = result.AvailabilitySegments?.reduce((sum, seg) => sum + (seg.Distance || 0), 0) || 2000;
    const cashPrice = estimateCashPrice(totalDistance, cabinClass);
    const valueCpp = calculateCpp(cashPrice, result.MileageCost);

    // Transform segments
    const segments = result.AvailabilitySegments?.map(seg => ({
      flightNumber: seg.FlightNumber,
      origin: seg.OriginAirport,
      destination: seg.DestinationAirport,
      departureTime: extractTime(seg.DepartsAt),
      arrivalTime: extractTime(seg.ArrivesAt),
      aircraft: seg.AircraftName || seg.AircraftCode || undefined,
      fareClass: seg.FareClass || undefined,
    }));

    // Transform booking links
    const bookingLinks = response.bookingLinks?.map(bl => ({
      label: bl.label,
      url: bl.link,
      isPrimary: bl.primary,
    }));

    // Get primary booking link
    const primaryBookingLink = response.bookingLinks?.find(bl => bl.primary)?.link;

    flights.push({
      id: result.ID,
      programId,
      program,
      origin,
      destination,
      departureDate: extractDate(result.DepartsAt),
      departureTime: extractTime(result.DepartsAt),
      arrivalTime: extractTime(result.ArrivesAt),
      airline: getAirlineName(result.Carriers),
      flightNumber: result.FlightNumbers || '',
      cabinClass,
      pointsRequired: result.MileageCost,
      taxesFees: Math.round(result.TotalTaxes / 100), // Convert from cents to dollars
      seatsAvailable: result.RemainingSeats || 0,
      duration: formatDuration(result.TotalDuration),
      stops: result.Stops,
      valueCpp,
      source: 'seats.aero',
      bookingUrl: primaryBookingLink,
      // Enhanced fields from live search
      segments,
      taxCurrency: result.TaxesCurrency,
      bookingLinks,
      isLiveData: true,
    });
  }

  // Sort by departure time, then by value
  return flights.sort((a, b) => {
    // First sort by departure time if available
    if (a.departureTime && b.departureTime) {
      const timeCompare = a.departureTime.localeCompare(b.departureTime);
      if (timeCompare !== 0) return timeCompare;
    }
    // Then by value (cpp) descending
    if (b.valueCpp !== a.valueCpp) return b.valueCpp - a.valueCpp;
    // Finally by points ascending
    return a.pointsRequired - b.pointsRequired;
  });
}

/**
 * Get all supported sources/programs from seats.aero
 */
export function getSupportedSources(): string[] {
  return Object.keys(SOURCE_TO_PROGRAM_ID);
}

/**
 * Check if a program is supported by seats.aero
 */
export function isProgramSupported(programId: string): boolean {
  return programId in PROGRAM_ID_TO_SOURCE;
}

/**
 * Clear the cache (useful for testing or manual refresh)
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}
