'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DatabaseError } from '@/lib/supabase';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: (failureCount, error) => {
              // Don't retry on known database validation errors
              if (error instanceof DatabaseError && error.code && error.code.startsWith('23')) {
                return false;
              }
              return failureCount < 3;
            },
          },
          mutations: {
            onError: (error) => {
              // Global generic error handler for mutations (can integrate with toast notifications)
              console.error('[Global Mutation Error]:', error.message);
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
