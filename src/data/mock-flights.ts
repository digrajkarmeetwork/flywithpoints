import { AwardFlight } from '@/types';
import { loyaltyPrograms } from './loyalty-programs';

// Mock data for development - will be replaced with real API calls
export const generateMockFlights = (
  origin: string,
  destination: string,
  departureDate: string,
  cabinClass: string
): AwardFlight[] => {
  const programs = loyaltyPrograms.filter(p => p.type === 'airline');
  const baseFlights: Partial<AwardFlight>[] = [
    {
      airline: 'United Airlines',
      flightNumber: 'UA 123',
      departureTime: '08:30',
      arrivalTime: '16:45',
      duration: '8h 15m',
      stops: 0,
      aircraft: 'Boeing 777-300ER',
    },
    {
      airline: 'American Airlines',
      flightNumber: 'AA 456',
      departureTime: '10:15',
      arrivalTime: '19:30',
      duration: '9h 15m',
      stops: 1,
      aircraft: 'Boeing 787-9',
    },
    {
      airline: 'Delta Air Lines',
      flightNumber: 'DL 789',
      departureTime: '14:00',
      arrivalTime: '22:15',
      duration: '8h 15m',
      stops: 0,
      aircraft: 'Airbus A350-900',
    },
    {
      airline: 'British Airways',
      flightNumber: 'BA 178',
      departureTime: '19:00',
      arrivalTime: '07:15+1',
      duration: '7h 15m',
      stops: 0,
      aircraft: 'Boeing 777-200',
    },
    {
      airline: 'Air France',
      flightNumber: 'AF 012',
      departureTime: '21:30',
      arrivalTime: '10:45+1',
      duration: '8h 15m',
      stops: 1,
      aircraft: 'Airbus A380',
    },
  ];

  const pointsMultiplier: Record<string, number> = {
    economy: 1,
    premium_economy: 1.5,
    business: 2.5,
    first: 4,
  };

  const cashPriceMultiplier: Record<string, number> = {
    economy: 1,
    premium_economy: 2,
    business: 5,
    first: 12,
  };

  const basePrices: Record<string, number> = {
    economy: 35000,
    premium_economy: 55000,
    business: 90000,
    first: 150000,
  };

  const baseCashPrice = 600;

  return baseFlights.map((flight, index) => {
    const program = programs[index % programs.length];
    const pointsRequired = Math.round(
      basePrices[cabinClass] * (0.8 + Math.random() * 0.4) * pointsMultiplier[cabinClass]
    );
    const typicalCash = Math.round(baseCashPrice * cashPriceMultiplier[cabinClass]);
    const taxesFees = Math.round(50 + Math.random() * 200);
    const valueCpp = Number(((typicalCash / pointsRequired) * 100).toFixed(1));

    return {
      id: `${index}-${Date.now()}`,
      programId: program.id,
      program,
      origin,
      destination,
      departureDate,
      departureTime: flight.departureTime!,
      arrivalTime: flight.arrivalTime!,
      airline: flight.airline!,
      flightNumber: flight.flightNumber!,
      aircraft: flight.aircraft,
      cabinClass: cabinClass as AwardFlight['cabinClass'],
      pointsRequired,
      taxesFees,
      seatsAvailable: Math.floor(Math.random() * 5) + 1,
      duration: flight.duration!,
      stops: flight.stops!,
      valueCpp,
      source: 'mock',
      bookingUrl: `https://example.com/book/${flight.flightNumber}`,
    };
  });
};

export const mockSearchFlights = async (
  origin: string,
  destination: string,
  departureDate: string,
  cabinClass: string
): Promise<AwardFlight[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  return generateMockFlights(origin, destination, departureDate, cabinClass);
};
