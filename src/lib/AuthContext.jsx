'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      try {
        await base44.auth.me();
        if (mounted) setIsAuthenticated(true);
      } catch (err) {
        if (mounted) {
          setIsAuthenticated(false);
          const msg = err?.message || String(err);
          if (msg.includes('not registered') || msg?.toLowerCase().includes('user_not_registered')) {
            setAuthError({ type: 'user_not_registered' });
          } else if (msg.includes('auth') || msg.includes('login') || err?.status === 401) {
            setAuthError({ type: 'auth_required' });
          }
        }
      } finally {
        if (mounted) {
          setIsLoadingAuth(false);
          setIsLoadingPublicSettings(false);
        }
      }
    };
    checkAuth();
    return () => { mounted = false; };
  }, []);

  const navigateToLogin = useCallback(() => {
    if (typeof window !== 'undefined') {
      base44.auth.redirectToLogin(window.location.pathname);
    }
  }, []);

  const value = {
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    navigateToLogin,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
