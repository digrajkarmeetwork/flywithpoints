import { create } from 'zustand';
import { FlightSearch, AwardFlight } from '@/types';

interface SearchState {
  // Search form state
  searchParams: FlightSearch;

  // Results state
  results: AwardFlight[];
  isSearching: boolean;
  error: string | null;

  // Filters
  filters: {
    programs: string[];
    airlines: string[];
    maxPoints: number | null;
    maxStops: number | null;
    sortBy: 'points' | 'value' | 'departure' | 'duration';
    sortOrder: 'asc' | 'desc';
  };

  // Actions
  setSearchParams: (params: Partial<FlightSearch>) => void;
  setResults: (results: AwardFlight[]) => void;
  setSearching: (isSearching: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<SearchState['filters']>) => void;
  resetFilters: () => void;
  reset: () => void;
}

const defaultSearchParams: FlightSearch = {
  origin: '',
  destination: '',
  departureDate: '',
  returnDate: undefined,
  cabinClass: 'economy',
  passengers: 1,
  isFlexible: false,
};

const defaultFilters: SearchState['filters'] = {
  programs: [],
  airlines: [],
  maxPoints: null,
  maxStops: null,
  sortBy: 'points',
  sortOrder: 'asc',
};

export const useSearchStore = create<SearchState>((set) => ({
  searchParams: defaultSearchParams,
  results: [],
  isSearching: false,
  error: null,
  filters: defaultFilters,

  setSearchParams: (params) =>
    set((state) => ({
      searchParams: { ...state.searchParams, ...params },
    })),

  setResults: (results) => set({ results }),

  setSearching: (isSearching) => set({ isSearching }),

  setError: (error) => set({ error }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  resetFilters: () => set({ filters: defaultFilters }),

  reset: () =>
    set({
      searchParams: defaultSearchParams,
      results: [],
      isSearching: false,
      error: null,
      filters: defaultFilters,
    }),
}));

// Selector for filtered and sorted results
export const useFilteredResults = () => {
  const results = useSearchStore((state) => state.results);
  const filters = useSearchStore((state) => state.filters);

  let filtered = [...results];

  // Filter by programs
  if (filters.programs.length > 0) {
    filtered = filtered.filter((f) => filters.programs.includes(f.programId));
  }

  // Filter by airlines
  if (filters.airlines.length > 0) {
    filtered = filtered.filter((f) => filters.airlines.includes(f.airline));
  }

  // Filter by max points
  if (filters.maxPoints !== null) {
    filtered = filtered.filter((f) => f.pointsRequired <= filters.maxPoints!);
  }

  // Filter by max stops
  if (filters.maxStops !== null) {
    filtered = filtered.filter((f) => f.stops <= filters.maxStops!);
  }

  // Sort results
  filtered.sort((a, b) => {
    let comparison = 0;
    switch (filters.sortBy) {
      case 'points':
        comparison = a.pointsRequired - b.pointsRequired;
        break;
      case 'value':
        // Higher cpp = better value, so sort descending naturally
        comparison = a.valueCpp - b.valueCpp;
        break;
      case 'departure':
        comparison = a.departureTime.localeCompare(b.departureTime);
        break;
      case 'duration':
        // Parse duration strings like "5h 30m" to minutes for proper numeric sorting
        const parseDuration = (d: string): number => {
          if (!d) return 999999; // Put unknown durations last
          const hours = d.match(/(\d+)h/)?.[1] || '0';
          const mins = d.match(/(\d+)m/)?.[1] || '0';
          return parseInt(hours) * 60 + parseInt(mins);
        };
        comparison = parseDuration(a.duration) - parseDuration(b.duration);
        break;
    }
    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });

  return filtered;
};
