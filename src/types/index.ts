export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  type: 'airline' | 'hotel' | 'credit_card';
  logoUrl: string;
  baseValueCpp: number; // cents per point
  alliance?: 'oneworld' | 'skyteam' | 'star_alliance' | null;
  transferPartners: string[];
}

export interface PointBalance {
  id: string;
  programId: string;
  program?: LoyaltyProgram;
  balance: number;
  lastUpdated: string;
}

export interface FlightSearch {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
  passengers: number;
  isFlexible: boolean;
}

export interface AwardFlight {
  id: string;
  programId: string;
  program: LoyaltyProgram;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  airline: string;
  flightNumber: string;
  aircraft?: string;
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
  pointsRequired: number;
  taxesFees: number;
  seatsAvailable: number;
  duration: string;
  stops: number;
  valueCpp: number;
  source: string;
  bookingUrl?: string;
}

export interface SavedSearch {
  id: string;
  userId: string;
  origin: string;
  destination: string;
  departureDate?: string;
  returnDate?: string;
  cabinClass: string;
  passengers: number;
  isFlexible: boolean;
  alertEnabled: boolean;
  createdAt: string;
}

export interface SweetSpot {
  id: string;
  title: string;
  description: string;
  programId: string;
  program?: LoyaltyProgram;
  originRegion: string;
  destinationRegion: string;
  cabinClass: string;
  pointsRequired: number;
  typicalCashPrice: number;
  valueCpp: number;
  bookingTips?: string;
  imageUrl?: string;
}

export interface TransferBonus {
  id: string;
  fromProgram: string;
  toProgram: string;
  bonusPercentage: number;
  startDate: string;
  endDate: string;
  terms?: string;
  sourceUrl?: string;
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface AIRecommendation {
  title: string;
  description: string;
  savings?: number;
  transferPath?: TransferPath[];
  reasoning: string;
}

export interface TransferPath {
  from: string;
  to: string;
  ratio: string;
  bonus?: number;
}
