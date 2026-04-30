'use client';

import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export function useSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data?.session || null);
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (mounted) setSession(s);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  return { session, user: session?.user || null, loading };
}

export async function signUpWithPassword({ email, password, fullName }) {
  if (!supabase) throw new Error('Auth unavailable');
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName || '' } },
  });
  if (error) throw error;
  return data;
}

export async function signInWithPassword({ email, password }) {
  if (!supabase) throw new Error('Auth unavailable');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}
