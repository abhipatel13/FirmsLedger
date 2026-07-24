'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import NavigationTracker from '@/lib/NavigationTracker';
import AuthHashHandler from '@/components/AuthHashHandler';
import Layout from '@/Layout';
import { Toaster } from '@/components/ui/toaster';

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <NavigationTracker />
      <AuthHashHandler />
      <Layout>{children}</Layout>
      <Toaster />
    </QueryClientProvider>
  );
}
