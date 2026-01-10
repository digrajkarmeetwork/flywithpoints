import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ExploreState {
  // User preferences (persisted)
  homeAirport: string;
  lastDestination: string;

  // Actions
  setHomeAirport: (airport: string) => void;
  setLastDestination: (destination: string) => void;
  reset: () => void;
}

const initialState = {
  homeAirport: '',
  lastDestination: '',
};

export const useExploreStore = create<ExploreState>()(
  persist(
    (set) => ({
      ...initialState,

      setHomeAirport: (homeAirport) => set({ homeAirport }),

      setLastDestination: (lastDestination) => set({ lastDestination }),

      reset: () => set(initialState),
    }),
    {
      name: 'flywithpoints-explore',
      partialize: (state) => ({
        homeAirport: state.homeAirport,
        lastDestination: state.lastDestination,
      }),
    }
  )
);
