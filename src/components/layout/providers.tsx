'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { useSubscriptionStore } from '@/stores/subscription-store';

function SubscriptionLoader({ children }: { children: React.ReactNode }) {
  const { fetchSubscription } = useSubscriptionStore();

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SubscriptionLoader>
        {children}
      </SubscriptionLoader>
      <Toaster position="bottom-right" richColors />
    </QueryClientProvider>
  );
}
