// Generate direct booking URLs for airline award searches
// These URLs take users directly to the airline's award search page with pre-filled parameters

import { format, addDays } from 'date-fns';

interface BookingUrlParams {
  origin?: string;
  destination?: string;
  departDate?: Date;
  returnDate?: Date;
  cabin?: 'economy' | 'premium_economy' | 'business' | 'first';
  passengers?: number;
}

// Map program IDs to their booking URL generators
export const bookingUrlGenerators: Record<string, (params: BookingUrlParams) => string> = {
  // British Airways / Avios
  'avios': (params) => {
    const { origin = '', destination = '', departDate, cabin = 'business' } = params;
    const date = departDate || addDays(new Date(), 30);
    const cabinMap: Record<string, string> = {
      'economy': 'M',
      'premium_economy': 'W',
      'business': 'C',
      'first': 'F'
    };
    // BA.com redemption search
    return `https://www.britishairways.com/travel/redeem/execclub/_gf/en_us?eId=111049&tab_selected=redeem&redemession_origin=${origin}&redemption_destination=${destination}&redemption_departureDate=${format(date, 'yyyy-MM-dd')}&CabinCode=${cabinMap[cabin] || 'C'}&NumberOfAdults=1`;
  },

  // Virgin Atlantic
  'virginatlantic': (params) => {
    const { origin = '', destination = '', departDate } = params;
    const date = departDate || addDays(new Date(), 30);
    return `https://www.virginatlantic.com/flight-search/book-a-flight?bookingType=REDEEM&origin=${origin}&destination=${destination}&departureDate=${format(date, 'yyyy-MM-dd')}&adults=1`;
  },

  // Alaska Airlines Mileage Plan
  'alaska-mileageplan': (params) => {
    const { origin = '', destination = '', departDate } = params;
    const date = departDate || addDays(new Date(), 30);
    return `https://www.alaskaair.com/search/results?A=1&O=${origin}&D=${destination}&OD=${format(date, 'yyyy-MM-dd')}&RT=false&UL=true`;
  },

  // American Airlines AAdvantage
  'american-aadvantage': (params) => {
    const { origin = '', destination = '', departDate } = params;
    const date = departDate || addDays(new Date(), 30);
    return `https://www.aa.com/booking/find-flights?locale=en_US&pax=1&type=OneWay&searchType=Award&origin=${origin}&destination=${destination}&departDate=${format(date, 'yyyy-MM-dd')}`;
  },

  // United MileagePlus
  'united-mileageplus': (params) => {
    const { origin = '', destination = '', departDate } = params;
    const date = departDate || addDays(new Date(), 30);
    return `https://www.united.com/en/us/fsr/choose-flights?f=${origin}&t=${destination}&d=${format(date, 'yyyy-MM-dd')}&tt=1&at=1&sc=7&px=1&taxng=1&newHP=True&clm=7&st=bestmatches`;
  },

  // Air Canada Aeroplan
  'aeroplan': (params) => {
    const { origin = '', destination = '', departDate, cabin = 'business' } = params;
    const date = departDate || addDays(new Date(), 30);
    const cabinMap: Record<string, string> = {
      'economy': 'economy',
      'premium_economy': 'premiumEconomy',
      'business': 'business',
      'first': 'first'
    };
    return `https://www.aircanada.com/aeroplan/redeem/availability/outbound?org0=${origin}&dest0=${destination}&departureDate0=${format(date, 'yyyy-MM-dd')}&ADT=1&YTH=0&CHD=0&INF=0&INS=0&lang=en-CA&tripType=O&marketCode=INT&cabin=${cabinMap[cabin] || 'business'}`;
  },

  // Singapore KrisFlyer
  'krisflyer': (params) => {
    const { origin = '', destination = '', departDate, cabin = 'business' } = params;
    const date = departDate || addDays(new Date(), 30);
    return `https://www.singaporeair.com/en_UK/ppsclub-krisflyer/redeem/flights/?selectedDest=${destination}&selectedOrg=${origin}&departureMonth=${format(date, 'yyyy-MM')}&cabinClass=${cabin === 'first' ? 'J' : cabin === 'business' ? 'C' : 'Y'}`;
  },

  // Delta SkyMiles
  'delta-skymiles': (params) => {
    const { origin = '', destination = '', departDate } = params;
    const date = departDate || addDays(new Date(), 30);
    return `https://www.delta.com/flight-search/book-a-flight?cacheKeySuffix=be87fa46-bc71-40cd-9ae6-6e0f3d9d0939&action=findFlights&tripType=ONE_WAY&priceSchedule=MILES&originCity=${origin}&destinationCity=${destination}&departureDate=${format(date, 'yyyy-MM-dd')}&paxCount=1`;
  },

  // Air France/KLM Flying Blue
  'flying-blue': (params) => {
    const { origin = '', destination = '', departDate, cabin = 'business' } = params;
    const date = departDate || addDays(new Date(), 30);
    const cabinMap: Record<string, string> = {
      'economy': 'ECONOMY',
      'premium_economy': 'PREMIUM',
      'business': 'BUSINESS',
      'first': 'FIRST'
    };
    return `https://www.airfrance.us/search/offers?pax=1:0:0:0:0:0:0:0&cabinClass=${cabinMap[cabin] || 'BUSINESS'}&activeConnection=0:0&connections=${origin}:${destination}:${format(date, 'yyyy-MM-dd')}&bookingFlow=REWARD`;
  },
};

// Get suggested airports for a region
export const regionAirports: Record<string, { primary: string; name: string; all: string[] }> = {
  'Asia': { primary: 'NRT', name: 'Tokyo Narita', all: ['NRT', 'HND', 'ICN', 'HKG', 'SIN', 'BKK', 'TPE'] },
  'Europe': { primary: 'LHR', name: 'London Heathrow', all: ['LHR', 'CDG', 'FRA', 'AMS', 'MAD', 'FCO', 'ZRH'] },
  'Middle East': { primary: 'DXB', name: 'Dubai', all: ['DXB', 'DOH', 'AUH', 'TLV'] },
  'Oceania': { primary: 'SYD', name: 'Sydney', all: ['SYD', 'MEL', 'AKL', 'BNE'] },
  'South America': { primary: 'GRU', name: 'Sao Paulo', all: ['GRU', 'EZE', 'SCL', 'LIM', 'BOG'] },
  'North America': { primary: 'LAX', name: 'Los Angeles', all: ['LAX', 'JFK', 'ORD', 'SFO', 'DFW', 'MIA'] },
  'Central America & Caribbean': { primary: 'CUN', name: 'Cancun', all: ['CUN', 'SJU', 'MBJ', 'PTY'] },
  'Africa': { primary: 'JNB', name: 'Johannesburg', all: ['JNB', 'CPT', 'CAI', 'CMN'] },
  'Canada': { primary: 'YYZ', name: 'Toronto', all: ['YYZ', 'YVR', 'YUL'] },
};

// Get US hub airports as common origins
export const usHubAirports = [
  { code: 'JFK', name: 'New York JFK' },
  { code: 'LAX', name: 'Los Angeles' },
  { code: 'SFO', name: 'San Francisco' },
  { code: 'ORD', name: 'Chicago' },
  { code: 'DFW', name: 'Dallas' },
  { code: 'MIA', name: 'Miami' },
  { code: 'SEA', name: 'Seattle' },
  { code: 'ATL', name: 'Atlanta' },
  { code: 'BOS', name: 'Boston' },
  { code: 'IAD', name: 'Washington DC' },
  { code: 'IAH', name: 'Houston' },
  { code: 'DEN', name: 'Denver' },
];

// Generate booking URL for a sweet spot
export function getBookingUrl(
  programId: string,
  originRegion: string,
  destinationRegion: string,
  cabin: string,
  departDate?: Date,
  originAirport?: string
): string | null {
  const generator = bookingUrlGenerators[programId];
  if (!generator) return null;

  // Get destination airport for the region
  const destInfo = regionAirports[destinationRegion];
  const destination = destInfo?.primary || '';

  // Use provided origin or default to a major US hub
  const origin = originAirport || 'JFK';

  return generator({
    origin,
    destination,
    departDate: departDate || addDays(new Date(), 30),
    cabin: cabin as 'economy' | 'premium_economy' | 'business' | 'first',
  });
}

// Get multiple search URLs for different origin airports
export function getMultipleBookingUrls(
  programId: string,
  destinationRegion: string,
  cabin: string,
  departDate?: Date
): { airport: string; name: string; url: string }[] {
  const generator = bookingUrlGenerators[programId];
  if (!generator) return [];

  const destInfo = regionAirports[destinationRegion];
  const destination = destInfo?.primary || '';

  // Top 4 most common US origins for international flights
  const topOrigins = ['JFK', 'LAX', 'SFO', 'ORD'];

  return topOrigins.map(origin => {
    const hub = usHubAirports.find(h => h.code === origin);
    return {
      airport: origin,
      name: hub?.name || origin,
      url: generator({
        origin,
        destination,
        departDate: departDate || addDays(new Date(), 30),
        cabin: cabin as 'economy' | 'premium_economy' | 'business' | 'first',
      }),
    };
  });
}
