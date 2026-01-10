import { DestinationRegion } from '@/types';

export const destinationRegions: DestinationRegion[] = [
  {
    id: 'asia',
    name: 'Asia',
    countries: ['Japan', 'South Korea', 'China', 'Thailand', 'Singapore', 'Hong Kong', 'Taiwan', 'India', 'Vietnam', 'Indonesia', 'Malaysia', 'Philippines'],
    airports: ['NRT', 'HND', 'ICN', 'PVG', 'PEK', 'BKK', 'SIN', 'HKG', 'TPE', 'DEL', 'BOM', 'SGN', 'CGK', 'KUL', 'MNL'],
  },
  {
    id: 'europe',
    name: 'Europe',
    countries: ['United Kingdom', 'France', 'Germany', 'Italy', 'Spain', 'Netherlands', 'Switzerland', 'Portugal', 'Greece', 'Ireland', 'Austria', 'Belgium'],
    airports: ['LHR', 'LGW', 'CDG', 'FRA', 'MUC', 'FCO', 'MXP', 'MAD', 'BCN', 'AMS', 'ZRH', 'LIS', 'ATH', 'DUB', 'VIE', 'BRU'],
  },
  {
    id: 'middle-east',
    name: 'Middle East',
    countries: ['UAE', 'Qatar', 'Israel', 'Jordan', 'Saudi Arabia', 'Oman', 'Bahrain', 'Kuwait'],
    airports: ['DXB', 'AUH', 'DOH', 'TLV', 'AMM', 'RUH', 'JED', 'MCT', 'BAH', 'KWI'],
  },
  {
    id: 'oceania',
    name: 'Oceania',
    countries: ['Australia', 'New Zealand', 'Fiji', 'French Polynesia'],
    airports: ['SYD', 'MEL', 'BNE', 'PER', 'AKL', 'CHC', 'NAN', 'PPT'],
  },
  {
    id: 'south-america',
    name: 'South America',
    countries: ['Brazil', 'Argentina', 'Chile', 'Peru', 'Colombia', 'Ecuador'],
    airports: ['GRU', 'GIG', 'EZE', 'SCL', 'LIM', 'BOG', 'UIO'],
  },
  {
    id: 'central-america-caribbean',
    name: 'Central America & Caribbean',
    countries: ['Mexico', 'Costa Rica', 'Panama', 'Jamaica', 'Dominican Republic', 'Bahamas', 'Cuba', 'Puerto Rico'],
    airports: ['MEX', 'CUN', 'SJO', 'PTY', 'MBJ', 'PUJ', 'NAS', 'HAV', 'SJU'],
  },
  {
    id: 'africa',
    name: 'Africa',
    countries: ['South Africa', 'Morocco', 'Egypt', 'Kenya', 'Tanzania', 'Ethiopia'],
    airports: ['JNB', 'CPT', 'CMN', 'CAI', 'NBO', 'DAR', 'ADD'],
  },
  {
    id: 'canada',
    name: 'Canada',
    countries: ['Canada'],
    airports: ['YYZ', 'YVR', 'YUL', 'YYC', 'YOW'],
  },
  {
    id: 'north-america',
    name: 'North America',
    countries: ['United States', 'Canada', 'Mexico'],
    airports: ['JFK', 'LAX', 'ORD', 'DFW', 'DEN', 'SFO', 'SEA', 'ATL', 'BOS', 'MIA', 'IAD', 'IAH', 'PHX', 'LAS', 'MSP', 'DTW', 'PHL', 'CLT', 'YYZ', 'YVR', 'YUL', 'MEX', 'CUN'],
  },
];

// Hub airports for positioning flights (US major hubs with good international connections)
export const hubAirports = [
  { code: 'JFK', city: 'New York', region: 'Northeast' },
  { code: 'EWR', city: 'Newark', region: 'Northeast' },
  { code: 'LAX', city: 'Los Angeles', region: 'West Coast' },
  { code: 'SFO', city: 'San Francisco', region: 'West Coast' },
  { code: 'ORD', city: 'Chicago', region: 'Midwest' },
  { code: 'DFW', city: 'Dallas', region: 'South' },
  { code: 'MIA', city: 'Miami', region: 'Southeast' },
  { code: 'ATL', city: 'Atlanta', region: 'Southeast' },
  { code: 'IAD', city: 'Washington DC', region: 'Northeast' },
  { code: 'SEA', city: 'Seattle', region: 'West Coast' },
  { code: 'BOS', city: 'Boston', region: 'Northeast' },
  { code: 'IAH', city: 'Houston', region: 'South' },
];

// Estimated positioning flight costs based on distance
export const positioningCosts: Record<string, Record<string, number>> = {
  // From Northeast
  'JFK': { 'LAX': 300, 'SFO': 350, 'ORD': 200, 'MIA': 200, 'DFW': 250, 'SEA': 350 },
  'BOS': { 'LAX': 350, 'SFO': 350, 'ORD': 200, 'MIA': 200, 'JFK': 100, 'DFW': 250 },
  'IAD': { 'LAX': 300, 'SFO': 350, 'ORD': 180, 'MIA': 180, 'JFK': 150, 'DFW': 220 },
  // From West Coast
  'LAX': { 'JFK': 300, 'SFO': 100, 'ORD': 250, 'MIA': 300, 'DFW': 200, 'SEA': 150 },
  'SFO': { 'JFK': 350, 'LAX': 100, 'ORD': 280, 'MIA': 350, 'DFW': 250, 'SEA': 150 },
  'SEA': { 'JFK': 350, 'LAX': 150, 'SFO': 150, 'ORD': 280, 'DFW': 280 },
  // From Midwest
  'ORD': { 'JFK': 200, 'LAX': 250, 'SFO': 280, 'MIA': 200, 'DFW': 180 },
  // From South
  'DFW': { 'JFK': 250, 'LAX': 200, 'SFO': 250, 'ORD': 180, 'MIA': 200 },
  'MIA': { 'JFK': 200, 'LAX': 300, 'ORD': 200, 'DFW': 200 },
  'ATL': { 'JFK': 200, 'LAX': 280, 'ORD': 180, 'MIA': 150, 'DFW': 180 },
  'IAH': { 'JFK': 280, 'LAX': 220, 'ORD': 200, 'MIA': 200, 'DFW': 150 },
};

// Get region by ID
export function getRegionById(id: string): DestinationRegion | undefined {
  return destinationRegions.find(r => r.id === id);
}

// Get region by name (case-insensitive)
export function getRegionByName(name: string): DestinationRegion | undefined {
  return destinationRegions.find(r => r.name.toLowerCase() === name.toLowerCase());
}

// Search regions and countries
export function searchDestinations(query: string): { type: 'region' | 'country'; value: string; region: DestinationRegion }[] {
  const lowerQuery = query.toLowerCase();
  const results: { type: 'region' | 'country'; value: string; region: DestinationRegion }[] = [];

  destinationRegions.forEach(region => {
    // Match region name
    if (region.name.toLowerCase().includes(lowerQuery)) {
      results.push({ type: 'region', value: region.name, region });
    }

    // Match countries
    region.countries.forEach(country => {
      if (country.toLowerCase().includes(lowerQuery)) {
        results.push({ type: 'country', value: country, region });
      }
    });
  });

  return results;
}

// Get regions that have sweet spots available
export function getRegionsWithSweetSpots(destinationRegions: string[]): DestinationRegion[] {
  const uniqueRegionNames = [...new Set(destinationRegions)];
  return destinationRegions
    .map(name => getRegionByName(name))
    .filter((r): r is DestinationRegion => r !== undefined);
}

// Get estimated positioning cost between two airports
export function getPositioningCost(from: string, to: string): number {
  // Check direct cost
  if (positioningCosts[from]?.[to]) {
    return positioningCosts[from][to];
  }
  // Check reverse (costs are roughly symmetric)
  if (positioningCosts[to]?.[from]) {
    return positioningCosts[to][from];
  }
  // Default estimate based on typical domestic flight costs
  return 250;
}

// Get best hub airports for a given destination region
export function getBestHubsForRegion(regionId: string): string[] {
  switch (regionId) {
    case 'asia':
      return ['LAX', 'SFO', 'SEA', 'JFK']; // West coast best for Asia
    case 'europe':
      return ['JFK', 'BOS', 'IAD', 'ORD']; // East coast/Midwest best for Europe
    case 'middle-east':
      return ['JFK', 'IAD', 'ORD']; // East coast for Middle East
    case 'oceania':
      return ['LAX', 'SFO', 'DFW']; // West/South for Oceania
    case 'south-america':
      return ['MIA', 'IAH', 'DFW', 'ATL']; // South hubs for South America
    case 'central-america-caribbean':
      return ['MIA', 'IAH', 'DFW', 'ATL']; // South hubs
    case 'africa':
      return ['JFK', 'IAD', 'ATL']; // East coast for Africa
    case 'canada':
      return ['SEA', 'ORD', 'BOS', 'JFK']; // Northern cities
    case 'north-america':
      return ['ORD', 'DFW', 'ATL', 'DEN']; // Central US hubs for domestic
    default:
      return ['JFK', 'LAX', 'ORD']; // Major hubs as default
  }
}
