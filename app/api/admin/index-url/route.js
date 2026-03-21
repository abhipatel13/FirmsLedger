import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/admin/index-url
 * Body: { url: string }
 *
 * Submits a URL to Google's Indexing API using a Google Service Account.
 * Also pings Bing and updates indexed_at in blog_posts.
 *
 * Setup required:
 * 1. Enable "Indexing API" in Google Cloud Console
 * 2. Create a Service Account → download JSON key
 * 3. Add service account email as owner in Google Search Console
 * 4. Set GOOGLE_SERVICE_ACCOUNT_JSON env var to the full JSON key content
 */

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

/**
 * Create a signed JWT for Google API authentication.
 * Uses the Web Crypto API (available in Next.js Edge/Node runtime).
 */
async function createGoogleJWT(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/indexing',
  };

  const header = { alg: 'RS256', typ: 'JWT' };
  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const signingInput = `${encode(header)}.${encode(payload)}`;

  // Import the RSA private key
  const privateKey = serviceAccount.private_key.replace(/\\n/g, '\n');
  const keyData = privateKey
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');

  const keyBuffer = Buffer.from(keyData, 'base64');
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    Buffer.from(signingInput)
  );

  return `${signingInput}.${Buffer.from(signature).toString('base64url')}`;
}

/** Exchange JWT for a Google OAuth2 access token */
async function getGoogleAccessToken(serviceAccount) {
  const jwt = await createGoogleJWT(serviceAccount);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

/** Submit URL to Google Indexing API */
async function submitToGoogle(url, accessToken) {
  const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, type: 'URL_UPDATED' }),
  });
  return { status: res.status, body: await res.json() };
}

/** Ping Bing's IndexNow endpoint */
async function pingBingIndexNow(url) {
  const key = process.env.BING_INDEXNOW_KEY;
  if (!key) return { skipped: true };
  const host = new URL(url).hostname;
  const res = await fetch('https://api.indexnow.org/IndexNow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, urlList: [url] }),
  });
  return { status: res.status };
}

export async function POST(request) {
  // Accept both admin cookie and cron secret
  const cronSecret = request.headers.get('x-cron-secret');
  const isValidCron = cronSecret && cronSecret === process.env.CRON_SECRET;

  if (!isValidCron) {
    const { getAdminFromCookie } = await import('@/lib/admin-auth');
    const adminEmail = await getAdminFromCookie();
    if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { url } = await request.json();
  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 });

  const results = { url, google: null, bing: null };

  // --- Google Indexing API ---
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      const accessToken = await getGoogleAccessToken(serviceAccount);
      results.google = await submitToGoogle(url, accessToken);
    } catch (err) {
      results.google = { error: err.message };
    }
  } else {
    // Fallback: ping sitemap (works without OAuth)
    const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com').replace(/\/$/, '');
    try {
      await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(`${BASE_URL}/sitemap.xml`)}`);
      results.google = { method: 'sitemap_ping' };
    } catch {
      results.google = { method: 'sitemap_ping', error: 'ping failed' };
    }
  }

  // --- Bing IndexNow ---
  results.bing = await pingBingIndexNow(url);

  // --- Update indexed_at in Supabase ---
  try {
    const slug = url.split('/blogs/')[1];
    if (slug) {
      const supabase = getServiceSupabase();
      await supabase
        .from('blog_posts')
        .update({ indexed_at: new Date().toISOString() })
        .eq('slug', slug);
    }
  } catch {
    // non-critical
  }

  return NextResponse.json({ success: true, results });
}
