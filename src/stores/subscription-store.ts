import { create } from 'zustand';

interface SubscriptionState {
  plan: 'free' | 'premium';
  isPremium: boolean;
  isLoading: boolean;
  currentPeriodEnd: string | null;
  fetchSubscription: () => Promise<void>;
  startCheckout: () => Promise<void>;
  openPortal: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  plan: 'free',
  isPremium: false,
  isLoading: true,
  currentPeriodEnd: null,

  fetchSubscription: async () => {
    try {
      const response = await fetch('/api/stripe/subscription');
      const data = await response.json();
      set({
        plan: data.plan,
        isPremium: data.isPremium,
        currentPeriodEnd: data.currentPeriodEnd || null,
        isLoading: false,
      });
    } catch {
      set({ plan: 'free', isPremium: false, isLoading: false });
    }
  },

  startCheckout: async () => {
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  },

  openPortal: async () => {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
      throw error;
    }
  },
}));
