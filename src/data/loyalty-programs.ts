import { LoyaltyProgram } from '@/types';

export const loyaltyPrograms: LoyaltyProgram[] = [
  // Airlines
  {
    id: 'united-mileageplus',
    name: 'United MileagePlus',
    type: 'airline',
    logoUrl: '/logos/united.svg',
    baseValueCpp: 1.2,
    alliance: 'star_alliance',
    transferPartners: ['chase-ur', 'bilt'],
  },
  {
    id: 'american-aadvantage',
    name: 'American AAdvantage',
    type: 'airline',
    logoUrl: '/logos/american.svg',
    baseValueCpp: 1.4,
    alliance: 'oneworld',
    transferPartners: ['citi-typ', 'bilt'],
  },
  {
    id: 'delta-skymiles',
    name: 'Delta SkyMiles',
    type: 'airline',
    logoUrl: '/logos/delta.svg',
    baseValueCpp: 1.1,
    alliance: 'skyteam',
    transferPartners: ['amex-mr'],
  },
  {
    id: 'southwest-rr',
    name: 'Southwest Rapid Rewards',
    type: 'airline',
    logoUrl: '/logos/southwest.svg',
    baseValueCpp: 1.4,
    alliance: null,
    transferPartners: ['chase-ur'],
  },
  {
    id: 'alaska-mileageplan',
    name: 'Alaska Mileage Plan',
    type: 'airline',
    logoUrl: '/logos/alaska.svg',
    baseValueCpp: 1.8,
    alliance: 'oneworld',
    transferPartners: ['bilt'],
  },
  {
    id: 'jetblue-trueblue',
    name: 'JetBlue TrueBlue',
    type: 'airline',
    logoUrl: '/logos/jetblue.svg',
    baseValueCpp: 1.3,
    alliance: null,
    transferPartners: ['chase-ur', 'citi-typ', 'bilt'],
  },
  {
    id: 'aeroplan',
    name: 'Air Canada Aeroplan',
    type: 'airline',
    logoUrl: '/logos/aeroplan.svg',
    baseValueCpp: 1.5,
    alliance: 'star_alliance',
    transferPartners: ['chase-ur', 'amex-mr', 'capital-one', 'bilt'],
  },
  {
    id: 'avios',
    name: 'British Airways Avios',
    type: 'airline',
    logoUrl: '/logos/ba.svg',
    baseValueCpp: 1.5,
    alliance: 'oneworld',
    transferPartners: ['chase-ur', 'amex-mr', 'capital-one', 'bilt'],
  },
  {
    id: 'flying-blue',
    name: 'Air France/KLM Flying Blue',
    type: 'airline',
    logoUrl: '/logos/flyingblue.svg',
    baseValueCpp: 1.4,
    alliance: 'skyteam',
    transferPartners: ['chase-ur', 'amex-mr', 'citi-typ', 'capital-one', 'bilt'],
  },
  {
    id: 'krisflyer',
    name: 'Singapore KrisFlyer',
    type: 'airline',
    logoUrl: '/logos/singapore.svg',
    baseValueCpp: 1.6,
    alliance: 'star_alliance',
    transferPartners: ['chase-ur', 'amex-mr', 'citi-typ', 'capital-one', 'bilt'],
  },
  {
    id: 'virginatlantic',
    name: 'Virgin Atlantic Flying Club',
    type: 'airline',
    logoUrl: '/logos/virgin.svg',
    baseValueCpp: 1.5,
    alliance: null,
    transferPartners: ['chase-ur', 'amex-mr', 'citi-typ', 'capital-one', 'bilt'],
  },
  {
    id: 'emirates-skywards',
    name: 'Emirates Skywards',
    type: 'airline',
    logoUrl: '/logos/emirates.svg',
    baseValueCpp: 1.0,
    alliance: null,
    transferPartners: ['amex-mr', 'capital-one', 'citi-typ', 'bilt'],
  },

  // Credit Card Programs
  {
    id: 'chase-ur',
    name: 'Chase Ultimate Rewards',
    type: 'credit_card',
    logoUrl: '/logos/chase.svg',
    baseValueCpp: 1.5,
    alliance: null,
    transferPartners: [
      'united-mileageplus', 'southwest-rr', 'jetblue-trueblue',
      'aeroplan', 'avios', 'flying-blue', 'krisflyer', 'virginatlantic'
    ],
  },
  {
    id: 'amex-mr',
    name: 'Amex Membership Rewards',
    type: 'credit_card',
    logoUrl: '/logos/amex.svg',
    baseValueCpp: 1.6,
    alliance: null,
    transferPartners: [
      'delta-skymiles', 'aeroplan', 'avios', 'flying-blue',
      'krisflyer', 'virginatlantic', 'emirates-skywards'
    ],
  },
  {
    id: 'citi-typ',
    name: 'Citi ThankYou Points',
    type: 'credit_card',
    logoUrl: '/logos/citi.svg',
    baseValueCpp: 1.4,
    alliance: null,
    transferPartners: [
      'american-aadvantage', 'jetblue-trueblue', 'flying-blue',
      'krisflyer', 'virginatlantic', 'emirates-skywards'
    ],
  },
  {
    id: 'capital-one',
    name: 'Capital One Miles',
    type: 'credit_card',
    logoUrl: '/logos/capitalone.svg',
    baseValueCpp: 1.4,
    alliance: null,
    transferPartners: [
      'aeroplan', 'avios', 'flying-blue', 'krisflyer',
      'virginatlantic', 'emirates-skywards'
    ],
  },
  {
    id: 'bilt',
    name: 'Bilt Rewards',
    type: 'credit_card',
    logoUrl: '/logos/bilt.svg',
    baseValueCpp: 1.6,
    alliance: null,
    transferPartners: [
      'united-mileageplus', 'american-aadvantage', 'alaska-mileageplan',
      'jetblue-trueblue', 'aeroplan', 'avios', 'flying-blue',
      'krisflyer', 'virginatlantic', 'emirates-skywards'
    ],
  },
];

export const getProgramById = (id: string): LoyaltyProgram | undefined => {
  return loyaltyPrograms.find(p => p.id === id);
};

export const getAirlinePrograms = (): LoyaltyProgram[] => {
  return loyaltyPrograms.filter(p => p.type === 'airline');
};

export const getCreditCardPrograms = (): LoyaltyProgram[] => {
  return loyaltyPrograms.filter(p => p.type === 'credit_card');
};

export const getTransferPartners = (programId: string): LoyaltyProgram[] => {
  const program = getProgramById(programId);
  if (!program) return [];
  return program.transferPartners
    .map(id => getProgramById(id))
    .filter((p): p is LoyaltyProgram => p !== undefined);
};
