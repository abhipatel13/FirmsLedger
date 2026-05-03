'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const ERROR_MESSAGES = {
  otp_expired: 'Email link has expired. Sign in again to receive a new one.',
  access_denied: 'Email link is invalid or expired. Sign in again to receive a new one.',
};

export default function AuthHashHandler() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;

    const params = new URLSearchParams(hash.slice(1));
    const error = params.get('error');
    const errorCode = params.get('error_code');
    const errorDesc = params.get('error_description');

    if (!error && !errorCode) return;

    const msg =
      ERROR_MESSAGES[errorCode] ||
      ERROR_MESSAGES[error] ||
      (errorDesc ? errorDesc.replace(/\+/g, ' ') : 'Authentication link is invalid or expired.');

    toast.error(msg);

    history.replaceState(null, '', window.location.pathname + window.location.search);

    router.replace('/auth?mode=signin');
  }, [router]);

  return null;
}
