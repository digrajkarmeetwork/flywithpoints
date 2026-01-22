import { create } from 'zustand';

interface AccessState {
  isUnlocked: boolean;
  isChecking: boolean;
  error: string | null;
  checkAccess: () => void;
  verifyPassword: (password: string) => Promise<boolean>;
  logout: () => void;
}

const ACCESS_KEY = 'fwp_access_granted';

export const useAccessStore = create<AccessState>((set) => ({
  isUnlocked: false,
  isChecking: true,
  error: null,

  checkAccess: () => {
    // Check localStorage for existing access
    if (typeof window !== 'undefined') {
      const hasAccess = localStorage.getItem(ACCESS_KEY) === 'true';
      set({ isUnlocked: hasAccess, isChecking: false });
    } else {
      set({ isChecking: false });
    }
  },

  verifyPassword: async (password: string) => {
    set({ isChecking: true, error: null });

    try {
      const response = await fetch('/api/auth/verify-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem(ACCESS_KEY, 'true');
        set({ isUnlocked: true, isChecking: false, error: null });
        return true;
      } else {
        set({ isUnlocked: false, isChecking: false, error: 'Invalid password' });
        return false;
      }
    } catch (error) {
      set({ isUnlocked: false, isChecking: false, error: 'Failed to verify password' });
      return false;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_KEY);
    }
    set({ isUnlocked: false, error: null });
  },
}));
