'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { getQueryClient } from '@/lib/query/query-client';

/**
 * Global client-side providers. Add future context providers (theme, auth,
 * etc.) here so the root layout stays declarative.
 */
export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
