'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import NavigationTracker from '@/lib/NavigationTracker';
import UserNotRegisteredError from '@/components/UserNotRegistedError';
import Layout from '@/Layout';
import { Toaster } from '@/components/ui/toaster';

function AuthGate({ children }) {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return <Layout>{children}</Layout>;
}

export function Providers({ children }) {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <NavigationTracker />
        <AuthGate>{children}</AuthGate>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}
