import { PointBalance, AccessibleProgram, AwardOpportunity, PositioningOption, LoyaltyProgram } from '@/types';
import { sweetSpots } from './sweet-spots';
import { loyaltyPrograms, getProgramById, getTransferPartners } from './loyalty-programs';
import { destinationRegions, hubAirports, getPositioningCost, getBestHubsForRegion } from './regions';

/**
 * Get all programs a user has access to (direct balances + transfer partners)
 */
export function getAccessiblePrograms(pointBalances: PointBalance[]): AccessibleProgram[] {
  const accessible: AccessibleProgram[] = [];
  const seenProgramIds = new Set<string>();

  pointBalances.forEach((balance) => {
    const program = getProgramById(balance.programId);
    if (!program) return;

    // Direct access to the program
    if (program.type === 'airline' && !seenProgramIds.has(program.id)) {
      accessible.push({
        programId: program.id,
        program,
        balance: balance.balance,
        source: 'direct',
      });
      seenProgramIds.add(program.id);
    }

    // If credit card, can transfer to partners
    if (program.type === 'credit_card') {
      const partners = getTransferPartners(program.id);
      partners.forEach((partner) => {
        // Check if we already have this program with more points
        const existingIndex = accessible.findIndex(a => a.programId === partner.id);

        if (existingIndex === -1) {
          // New program access via transfer
          accessible.push({
            programId: partner.id,
            program: partner,
            balance: balance.balance,
            source: 'transfer',
            transferFrom: {
              programId: program.id,
              programName: program.name,
              balance: balance.balance,
            },
          });
          seenProgramIds.add(partner.id);
        } else if (accessible[existingIndex].balance < balance.balance) {
          // Update if this transfer gives more points
          accessible[existingIndex] = {
            programId: partner.id,
            program: partner,
            balance: balance.balance,
            source: 'transfer',
            transferFrom: {
              programId: program.id,
              programName: program.name,
              balance: balance.balance,
            },
          };
        }
      });
    }
  });

  return accessible;
}

/**
 * Get award opportunities based on user's point balances
 */
export function getAwardOpportunities(
  pointBalances: PointBalance[],
  destinationFilter?: string
): AwardOpportunity[] {
  const accessiblePrograms = getAccessiblePrograms(pointBalances);
  const opportunities: AwardOpportunity[] = [];

  sweetSpots.forEach((sweetSpot) => {
    // Filter by destination if specified
    if (destinationFilter) {
      const lowerFilter = destinationFilter.toLowerCase();
      const matchesRegion = sweetSpot.destinationRegion.toLowerCase().includes(lowerFilter);

      // Check if destination filter matches any region's countries
      const matchesCountry = destinationRegions.some(region =>
        region.countries.some(country =>
          country.toLowerCase().includes(lowerFilter)
        ) && (
          sweetSpot.destinationRegion.toLowerCase() === region.name.toLowerCase() ||
          sweetSpot.destinationRegion === 'Various'
        )
      );

      if (!matchesRegion && !matchesCountry && sweetSpot.destinationRegion !== 'Various') {
        return;
      }
    }

    // Find if user has access to this program
    const accessibleProgram = accessiblePrograms.find(
      ap => ap.programId === sweetSpot.programId
    );

    if (!accessibleProgram) return;

    const userBalance = accessibleProgram.balance;
    const pointsRequired = sweetSpot.pointsRequired;
    const canAfford = userBalance >= pointsRequired;
    const pointsShortfall = canAfford ? 0 : pointsRequired - userBalance;
    const percentageOwned = Math.min(100, Math.round((userBalance / pointsRequired) * 100));

    opportunities.push({
      id: `opp-${sweetSpot.id}`,
      sweetSpot,
      program: accessibleProgram.program,
      userBalance,
      pointsRequired,
      canAfford,
      pointsShortfall,
      percentageOwned,
      transferSource: accessibleProgram.source === 'transfer' ? accessibleProgram.transferFrom : undefined,
      estimatedValue: sweetSpot.typicalCashPrice,
    });
  });

  // Sort: affordable first, then by value (cpp), then by percentage owned
  return opportunities.sort((a, b) => {
    if (a.canAfford !== b.canAfford) {
      return a.canAfford ? -1 : 1;
    }
    if (a.canAfford && b.canAfford) {
      return b.sweetSpot.valueCpp - a.sweetSpot.valueCpp;
    }
    // For unaffordable, sort by closest to affording
    return b.percentageOwned - a.percentageOwned;
  });
}

/**
 * Get positioning flight options for opportunities
 */
export function getPositioningOptions(
  homeAirport: string,
  opportunities: AwardOpportunity[],
  destinationFilter?: string
): PositioningOption[] {
  const options: PositioningOption[] = [];

  // Get the destination region ID
  const targetRegion = destinationFilter
    ? destinationRegions.find(r =>
        r.name.toLowerCase().includes(destinationFilter.toLowerCase()) ||
        r.countries.some(c => c.toLowerCase().includes(destinationFilter.toLowerCase()))
      )
    : null;

  if (!targetRegion) return options;

  // Get best hubs for this region
  const bestHubs = getBestHubsForRegion(targetRegion.id);

  // If home airport is already a good hub, don't suggest positioning
  if (bestHubs.includes(homeAirport)) {
    return options;
  }

  // For each affordable opportunity, suggest positioning from best hubs
  opportunities
    .filter(opp => opp.canAfford)
    .slice(0, 3) // Top 3 affordable opportunities
    .forEach(opportunity => {
      bestHubs.slice(0, 2).forEach(hubCode => {
        const hub = hubAirports.find(h => h.code === hubCode);
        if (!hub) return;

        const positioningCost = getPositioningCost(homeAirport, hubCode);
        const totalValue = opportunity.estimatedValue - positioningCost;

        options.push({
          id: `pos-${opportunity.id}-${hubCode}`,
          alternateOrigin: hubCode,
          alternateOriginCity: hub.city,
          awardOpportunity: opportunity,
          estimatedPositioningCost: positioningCost,
          totalValue,
          reasoning: `${hub.city} has better award availability for ${opportunity.sweetSpot.destinationRegion}. Fly there for ~$${positioningCost}, then use your points for the main flight.`,
        });
      });
    });

  // Sort by total value (descending)
  return options.sort((a, b) => b.totalValue - a.totalValue).slice(0, 4);
}

/**
 * Get summary stats for user's opportunities
 */
export function getOpportunitySummary(opportunities: AwardOpportunity[]) {
  const affordable = opportunities.filter(o => o.canAfford);
  const almostAffordable = opportunities.filter(o => !o.canAfford && o.percentageOwned >= 75);
  const totalPotentialValue = affordable.reduce((sum, o) => sum + o.estimatedValue, 0);

  // Find best value opportunity
  const bestValue = affordable.length > 0
    ? affordable.reduce((best, o) =>
        o.sweetSpot.valueCpp > best.sweetSpot.valueCpp ? o : best
      )
    : null;

  // Find closest to affording
  const closestToAffording = opportunities
    .filter(o => !o.canAfford)
    .sort((a, b) => b.percentageOwned - a.percentageOwned)[0] || null;

  return {
    total: opportunities.length,
    affordable: affordable.length,
    almostAffordable: almostAffordable.length,
    totalPotentialValue,
    bestValue,
    closestToAffording,
  };
}

/**
 * Get unique destination regions from opportunities
 */
export function getAvailableDestinations(pointBalances: PointBalance[]): string[] {
  const accessiblePrograms = getAccessiblePrograms(pointBalances);
  const accessibleProgramIds = new Set(accessiblePrograms.map(ap => ap.programId));

  const destinations = new Set<string>();
  sweetSpots.forEach(spot => {
    if (accessibleProgramIds.has(spot.programId)) {
      if (spot.destinationRegion !== 'Various') {
        destinations.add(spot.destinationRegion);
      }
    }
  });

  return Array.from(destinations).sort();
}

/**
 * Get all destination options for dropdown
 */
export function getAllDestinationOptions(): { value: string; label: string; type: 'region' | 'country' }[] {
  const options: { value: string; label: string; type: 'region' | 'country' }[] = [];

  destinationRegions.forEach(region => {
    // Add region
    options.push({
      value: region.name,
      label: region.name,
      type: 'region',
    });

    // Add popular countries
    region.countries.slice(0, 5).forEach(country => {
      options.push({
        value: country,
        label: `${country} (${region.name})`,
        type: 'country',
      });
    });
  });

  return options;
}
