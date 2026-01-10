import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, PointBalance, SavedSearch } from '@/types';

interface UserState {
  user: User | null;
  pointBalances: PointBalance[];
  savedSearches: SavedSearch[];
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setPointBalances: (balances: PointBalance[]) => void;
  addPointBalance: (balance: PointBalance) => void;
  updatePointBalance: (programId: string, balance: number) => void;
  removePointBalance: (programId: string) => void;
  setSavedSearches: (searches: SavedSearch[]) => void;
  addSavedSearch: (search: SavedSearch) => void;
  removeSavedSearch: (id: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  pointBalances: [],
  savedSearches: [],
  isLoading: false,
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) => set({ user }),

      setPointBalances: (pointBalances) => set({ pointBalances }),

      addPointBalance: (balance) =>
        set((state) => ({
          pointBalances: [...state.pointBalances, balance],
        })),

      updatePointBalance: (programId, balance) =>
        set((state) => ({
          pointBalances: state.pointBalances.map((pb) =>
            pb.programId === programId
              ? { ...pb, balance, lastUpdated: new Date().toISOString() }
              : pb
          ),
        })),

      removePointBalance: (programId) =>
        set((state) => ({
          pointBalances: state.pointBalances.filter(
            (pb) => pb.programId !== programId
          ),
        })),

      setSavedSearches: (savedSearches) => set({ savedSearches }),

      addSavedSearch: (search) =>
        set((state) => ({
          savedSearches: [...state.savedSearches, search],
        })),

      removeSavedSearch: (id) =>
        set((state) => ({
          savedSearches: state.savedSearches.filter((s) => s.id !== id),
        })),

      setLoading: (isLoading) => set({ isLoading }),

      reset: () => set(initialState),
    }),
    {
      name: 'flywithpoints-user',
      partialize: (state) => ({
        pointBalances: state.pointBalances,
        savedSearches: state.savedSearches,
      }),
    }
  )
);
