'use client';

import { useEffect, useState } from 'react';

export function useSession() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (mounted) {
          setUser(data?.user || null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { session: user, user, loading };
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong. Please try again.');
  }
  return data;
}

export async function signUpWithPassword({ email, password, fullName }) {
  const data = await postJson('/api/auth/signup', { email, password, fullName });
  return { user: data.user, session: data.user };
}

export async function signInWithPassword({ email, password }) {
  const data = await postJson('/api/auth/login', { email, password });
  return { user: data.user, session: data.user };
}

export async function signOut() {
  await fetch('/api/auth/logout', { method: 'POST' });
}
