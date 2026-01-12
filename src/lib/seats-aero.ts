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
  'aerlingus': 'avios', // Aer Lingus uses Avios
  'qantas': 'avios', // Qantas partners
  'lifemiles': 'lifemiles',
  'smiles': 'smiles',
  'velocity': 'velocity',
  'eurobonus': 'eurobonus',
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
  'EY': 'Etihad Airways',
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

    // Skip if not available or no mileage cost
    if (!available || mileageCost <= 0) continue;

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
