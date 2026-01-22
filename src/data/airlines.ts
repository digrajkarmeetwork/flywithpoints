/**
 * Airlines data for the "Explore by Airline" feature
 *
 * This file contains information about airlines that can be searched
 * through the seats.aero API, including their alliance memberships
 * which helps determine which mileage programs to query.
 */

export interface Airline {
  code: string;           // IATA 2-letter code
  name: string;           // Full airline name
  alliance?: 'star' | 'oneworld' | 'skyteam';
  country: string;
  // Programs that typically show this airline's availability
  searchPrograms: string[];
  // Notable premium products
  premiumProducts?: {
    business?: string;    // e.g., "Qsuites"
    first?: string;       // e.g., "The Residence"
  };
}

// Airlines with good award availability through seats.aero
export const AIRLINES: Airline[] = [
  // Star Alliance
  {
    code: 'SQ',
    name: 'Singapore Airlines',
    alliance: 'star',
    country: 'Singapore',
    searchPrograms: ['united', 'aeroplan', 'lifemiles'],
    premiumProducts: {
      business: 'Business Class',
      first: 'Suites / First Class',
    },
  },
  {
    code: 'NH',
    name: 'ANA (All Nippon Airways)',
    alliance: 'star',
    country: 'Japan',
    searchPrograms: ['united', 'aeroplan', 'lifemiles'],
    premiumProducts: {
      business: 'Business Class (The Room)',
      first: 'First Class (The Suite)',
    },
  },
  {
    code: 'LH',
    name: 'Lufthansa',
    alliance: 'star',
    country: 'Germany',
    searchPrograms: ['united', 'aeroplan', 'lifemiles'],
    premiumProducts: {
      business: 'Business Class',
      first: 'First Class',
    },
  },
  {
    code: 'UA',
    name: 'United Airlines',
    alliance: 'star',
    country: 'United States',
    searchPrograms: ['united', 'aeroplan'],
    premiumProducts: {
      business: 'Polaris Business Class',
    },
  },
  {
    code: 'AC',
    name: 'Air Canada',
    alliance: 'star',
    country: 'Canada',
    searchPrograms: ['aeroplan', 'united'],
    premiumProducts: {
      business: 'Signature Class',
    },
  },
  {
    code: 'TK',
    name: 'Turkish Airlines',
    alliance: 'star',
    country: 'Turkey',
    searchPrograms: ['united', 'aeroplan', 'lifemiles'],
    premiumProducts: {
      business: 'Business Class',
    },
  },
  {
    code: 'LX',
    name: 'Swiss International Air Lines',
    alliance: 'star',
    country: 'Switzerland',
    searchPrograms: ['united', 'aeroplan', 'lifemiles'],
    premiumProducts: {
      business: 'Business Class',
      first: 'First Class',
    },
  },
  {
    code: 'OS',
    name: 'Austrian Airlines',
    alliance: 'star',
    country: 'Austria',
    searchPrograms: ['united', 'aeroplan', 'lifemiles'],
    premiumProducts: {
      business: 'Business Class',
    },
  },
  {
    code: 'SK',
    name: 'SAS Scandinavian Airlines',
    alliance: 'star',
    country: 'Scandinavia',
    searchPrograms: ['united', 'aeroplan', 'eurobonus'],
    premiumProducts: {
      business: 'SAS Business',
    },
  },
  {
    code: 'BR',
    name: 'EVA Air',
    alliance: 'star',
    country: 'Taiwan',
    searchPrograms: ['united', 'aeroplan', 'lifemiles'],
    premiumProducts: {
      business: 'Royal Laurel Class',
    },
  },
  {
    code: 'OZ',
    name: 'Asiana Airlines',
    alliance: 'star',
    country: 'South Korea',
    searchPrograms: ['united', 'aeroplan', 'lifemiles'],
    premiumProducts: {
      business: 'Business Smartium',
      first: 'First Class',
    },
  },
  {
    code: 'ET',
    name: 'Ethiopian Airlines',
    alliance: 'star',
    country: 'Ethiopia',
    searchPrograms: ['united', 'aeroplan', 'lifemiles'],
    premiumProducts: {
      business: 'Cloud Nine Business',
    },
  },
  {
    code: 'TP',
    name: 'TAP Air Portugal',
    alliance: 'star',
    country: 'Portugal',
    searchPrograms: ['united', 'aeroplan', 'lifemiles'],
    premiumProducts: {
      business: 'TAP Business',
    },
  },
  {
    code: 'AY',
    name: 'Finnair',
    alliance: 'oneworld',
    country: 'Finland',
    searchPrograms: ['american', 'qantas', 'alaska'],
    premiumProducts: {
      business: 'Business Class',
    },
  },

  // Oneworld
  {
    code: 'QR',
    name: 'Qatar Airways',
    alliance: 'oneworld',
    country: 'Qatar',
    searchPrograms: ['american', 'qantas', 'alaska'],
    premiumProducts: {
      business: 'Qsuites',
      first: 'First Class',
    },
  },
  {
    code: 'CX',
    name: 'Cathay Pacific',
    alliance: 'oneworld',
    country: 'Hong Kong',
    searchPrograms: ['american', 'qantas', 'alaska'],
    premiumProducts: {
      business: 'Business Class',
      first: 'First Class',
    },
  },
  {
    code: 'JL',
    name: 'Japan Airlines',
    alliance: 'oneworld',
    country: 'Japan',
    searchPrograms: ['american', 'qantas', 'alaska'],
    premiumProducts: {
      business: 'Business Class (Sky Suite)',
      first: 'First Class',
    },
  },
  {
    code: 'BA',
    name: 'British Airways',
    alliance: 'oneworld',
    country: 'United Kingdom',
    searchPrograms: ['american', 'qantas', 'alaska'],
    premiumProducts: {
      business: 'Club World',
      first: 'First',
    },
  },
  {
    code: 'AA',
    name: 'American Airlines',
    alliance: 'oneworld',
    country: 'United States',
    searchPrograms: ['american'],
    premiumProducts: {
      business: 'Flagship Business',
      first: 'Flagship First',
    },
  },
  {
    code: 'QF',
    name: 'Qantas',
    alliance: 'oneworld',
    country: 'Australia',
    searchPrograms: ['qantas', 'american', 'alaska'],
    premiumProducts: {
      business: 'Business Class',
      first: 'First Class',
    },
  },
  {
    code: 'IB',
    name: 'Iberia',
    alliance: 'oneworld',
    country: 'Spain',
    searchPrograms: ['american', 'qantas', 'alaska'],
    premiumProducts: {
      business: 'Business Class',
    },
  },
  {
    code: 'MH',
    name: 'Malaysia Airlines',
    alliance: 'oneworld',
    country: 'Malaysia',
    searchPrograms: ['american', 'qantas', 'alaska'],
    premiumProducts: {
      business: 'Business Class',
      first: 'First Class',
    },
  },
  {
    code: 'RJ',
    name: 'Royal Jordanian',
    alliance: 'oneworld',
    country: 'Jordan',
    searchPrograms: ['american', 'qantas', 'alaska'],
    premiumProducts: {
      business: 'Business Class',
    },
  },
  {
    code: 'UL',
    name: 'SriLankan Airlines',
    alliance: 'oneworld',
    country: 'Sri Lanka',
    searchPrograms: ['american', 'qantas', 'alaska'],
    premiumProducts: {
      business: 'Business Class',
    },
  },
  {
    code: 'FI',
    name: 'Icelandair',
    alliance: undefined,
    country: 'Iceland',
    searchPrograms: ['alaska'],
    premiumProducts: {
      business: 'Saga Class',
    },
  },

  // SkyTeam
  {
    code: 'AF',
    name: 'Air France',
    alliance: 'skyteam',
    country: 'France',
    searchPrograms: ['delta', 'virginatlantic'],
    premiumProducts: {
      business: 'Business Class',
      first: 'La Premiere',
    },
  },
  {
    code: 'KL',
    name: 'KLM Royal Dutch Airlines',
    alliance: 'skyteam',
    country: 'Netherlands',
    searchPrograms: ['delta', 'virginatlantic'],
    premiumProducts: {
      business: 'World Business Class',
    },
  },
  {
    code: 'DL',
    name: 'Delta Air Lines',
    alliance: 'skyteam',
    country: 'United States',
    searchPrograms: ['delta', 'virginatlantic'],
    premiumProducts: {
      business: 'Delta One',
    },
  },
  {
    code: 'KE',
    name: 'Korean Air',
    alliance: 'skyteam',
    country: 'South Korea',
    searchPrograms: ['delta', 'virginatlantic'],
    premiumProducts: {
      business: 'Prestige Class',
      first: 'First Class',
    },
  },

  // Non-Alliance (but bookable through partners)
  {
    code: 'EK',
    name: 'Emirates',
    alliance: undefined,
    country: 'United Arab Emirates',
    searchPrograms: ['emirates', 'qantas', 'alaska'],
    premiumProducts: {
      business: 'Business Class',
      first: 'First Class / Private Suites',
    },
  },
  {
    code: 'EY',
    name: 'Etihad Airways',
    alliance: undefined,
    country: 'United Arab Emirates',
    searchPrograms: ['american', 'etihad'],
    premiumProducts: {
      business: 'Business Studio',
      first: 'First Apartment',
    },
  },
  {
    code: 'VS',
    name: 'Virgin Atlantic',
    alliance: undefined,
    country: 'United Kingdom',
    searchPrograms: ['virginatlantic', 'delta'],
    premiumProducts: {
      business: 'Upper Class',
    },
  },
  {
    code: 'AS',
    name: 'Alaska Airlines',
    alliance: undefined,
    country: 'United States',
    searchPrograms: ['alaska'],
    premiumProducts: {
      business: 'First Class',
    },
  },
  {
    code: 'B6',
    name: 'JetBlue Airways',
    alliance: undefined,
    country: 'United States',
    searchPrograms: ['jetblue'],
    premiumProducts: {
      business: 'Mint',
    },
  },
  {
    code: 'HA',
    name: 'Hawaiian Airlines',
    alliance: undefined,
    country: 'United States',
    searchPrograms: ['alaska', 'american'],
    premiumProducts: {
      business: 'First Class',
    },
  },
];

// Get airline by code
export function getAirlineByCode(code: string): Airline | undefined {
  return AIRLINES.find((a) => a.code === code);
}

// Get airlines by alliance
export function getAirlinesByAlliance(alliance: 'star' | 'oneworld' | 'skyteam'): Airline[] {
  return AIRLINES.filter((a) => a.alliance === alliance);
}

// Get all airlines sorted by name
export function getAllAirlinesSorted(): Airline[] {
  return [...AIRLINES].sort((a, b) => a.name.localeCompare(b.name));
}

// Get airlines grouped by alliance
export function getAirlinesGroupedByAlliance(): {
  star: Airline[];
  oneworld: Airline[];
  skyteam: Airline[];
  other: Airline[];
} {
  return {
    star: AIRLINES.filter((a) => a.alliance === 'star').sort((a, b) => a.name.localeCompare(b.name)),
    oneworld: AIRLINES.filter((a) => a.alliance === 'oneworld').sort((a, b) => a.name.localeCompare(b.name)),
    skyteam: AIRLINES.filter((a) => a.alliance === 'skyteam').sort((a, b) => a.name.localeCompare(b.name)),
    other: AIRLINES.filter((a) => !a.alliance).sort((a, b) => a.name.localeCompare(b.name)),
  };
}

// Popular airlines for quick selection (airlines with notable premium products)
export function getPopularAirlines(): Airline[] {
  const popularCodes = ['QR', 'SQ', 'EK', 'CX', 'JL', 'NH', 'EY', 'LH', 'AF', 'VS', 'BA', 'AA'];
  return AIRLINES.filter((a) => popularCodes.includes(a.code));
}
