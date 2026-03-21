/**
 * urlSubmitter.ts
 *
 * Module 3 — Auto URL Submission
 * Submits URLs to Google Indexing API, Bing Webmaster Tools,
 * and free ping services. Logs all attempts to Supabase.
 */

import { getServiceSupabase } from './supabaseClient';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SubmissionResult {
  platform: string;
  status: 'success' | 'failed' | 'skipped';
  response: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Google Indexing API (manual JWT — no googleapis npm required)
// ---------------------------------------------------------------------------

/**
 * Creates a signed RS256 JWT for the Google Indexing API.
 * Uses the Web Crypto API available in Next.js Node runtime.
 */
async function createGoogleJwt(serviceAccount: {
  client_email: string;
  private_key: string;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/indexing',
  };

  const encode = (obj: unknown): string =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  const signingInput = `${encode(header)}.${encode(payload)}`;
  const privateKey = serviceAccount.private_key.replace(/\\n/g, '\n');

  const keyData = Buffer.from(
    privateKey
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\s/g, ''),
    'base64'
  );

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
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

/**
 * Exchanges a signed JWT for a Google OAuth2 access token.
 */
async function getGoogleAccessToken(serviceAccount: {
  client_email: string;
  private_key: string;
}): Promise<string> {
  const jwt = await createGoogleJwt(serviceAccount);
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
  return data.access_token as string;
}

/**
 * Submits a URL to the Google Indexing API as URL_UPDATED.
 *
 * Prerequisites:
 * 1. Enable "Indexing API" in Google Cloud Console
 * 2. Create a Service Account → download JSON key
 * 3. Add service account email as Delegated owner in Google Search Console
 * 4. Set GOOGLE_SERVICE_ACCOUNT env var to the stringified JSON
 */
export async function submitToGoogle(pageUrl: string): Promise<SubmissionResult> {
  const jsonStr = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!jsonStr) {
    return { platform: 'google', status: 'skipped', response: { reason: 'GOOGLE_SERVICE_ACCOUNT not set' } };
  }

  try {
    const serviceAccount = JSON.parse(jsonStr);
    const accessToken = await getGoogleAccessToken(serviceAccount);

    const res = await fetch(
      'https://indexing.googleapis.com/v3/urlNotifications:publish',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: pageUrl, type: 'URL_UPDATED' }),
      }
    );

    const body = await res.json();
    return {
      platform: 'google',
      status: res.ok ? 'success' : 'failed',
      response: { httpStatus: res.status, ...body },
    };
  } catch (err) {
    return {
      platform: 'google',
      status: 'failed',
      response: { error: err instanceof Error ? err.message : String(err) },
    };
  }
}

// ---------------------------------------------------------------------------
// Bing Webmaster Tools API
// ---------------------------------------------------------------------------

/**
 * Submits a URL to Bing Webmaster Tools using the SubmitUrl API.
 *
 * Requires BING_WEBMASTER_KEY env var (from Bing Webmaster Tools dashboard).
 */
export async function submitToBing(pageUrl: string): Promise<SubmissionResult> {
  const apiKey = process.env.BING_WEBMASTER_KEY;
  if (!apiKey) {
    return { platform: 'bing', status: 'skipped', response: { reason: 'BING_WEBMASTER_KEY not set' } };
  }

  try {
    const siteUrl = (
      process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com'
    ).replace(/\/$/, '');

    const res = await fetch(
      `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrl?apikey=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ siteUrl, url: pageUrl }),
      }
    );

    const text = await res.text();
    let body: Record<string, unknown> = {};
    try { body = JSON.parse(text); } catch { body = { raw: text }; }

    return {
      platform: 'bing',
      status: res.ok ? 'success' : 'failed',
      response: { httpStatus: res.status, ...body },
    };
  } catch (err) {
    return {
      platform: 'bing',
      status: 'failed',
      response: { error: err instanceof Error ? err.message : String(err) },
    };
  }
}

// ---------------------------------------------------------------------------
// Free ping services
// ---------------------------------------------------------------------------

/**
 * Sends a basic ping to a single service endpoint.
 * Failures are non-critical and never throw.
 */
async function ping(
  platform: string,
  url: string,
  options: RequestInit = {}
): Promise<SubmissionResult> {
  try {
    const res = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(8000),
    });
    return {
      platform,
      status: res.ok ? 'success' : 'failed',
      response: { httpStatus: res.status },
    };
  } catch (err) {
    return {
      platform,
      status: 'failed',
      response: { error: err instanceof Error ? err.message : String(err) },
    };
  }
}

/**
 * Pings Yandex, PingOMatic, and PingMyUrl with the new page URL.
 */
export async function pingFreeServices(pageUrl: string): Promise<SubmissionResult[]> {
  const encoded = encodeURIComponent(pageUrl);
  const BASE_URL = (
    process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com'
  ).replace(/\/$/, '');
  const sitemapUrl = encodeURIComponent(`${BASE_URL}/sitemap.xml`);

  return Promise.all([
    // Yandex Blog Search ping (XML-RPC)
    ping('yandex', `http://ping.blogs.yandex.ru/RPC2`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: `<?xml version="1.0"?><methodCall><methodName>weblogUpdates.ping</methodName><params><param><value>${BASE_URL}</value></param><param><value>${pageUrl}</value></param></params></methodCall>`,
    }),

    // PingOMatic (sitemap ping)
    ping('pingomatic', `http://rpc.pingomatic.com/`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: `<?xml version="1.0"?><methodCall><methodName>weblogUpdates.ping</methodName><params><param><value>FirmsLedger</value></param><param><value>${pageUrl}</value></param></params></methodCall>`,
    }),

    // Google sitemap ping (fallback)
    ping('google_sitemap', `https://www.google.com/ping?sitemap=${sitemapUrl}`),

    // PingMyUrl (POST)
    ping('pingmyurl', `http://www.pingmyurl.com/api/ping.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `url=${encoded}`,
    }),
  ]);
}

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

/**
 * Persists a list of submission results to Supabase `submission_logs`.
 */
async function logResults(
  pageUrl: string,
  results: SubmissionResult[]
): Promise<void> {
  const supabase = getServiceSupabase();
  const rows = results.map((r) => ({
    url: pageUrl,
    platform: r.platform,
    status: r.status,
    response: r.response,
    submitted_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from('submission_logs').insert(rows);
  if (error) console.error('Failed to log submission results:', error.message);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Submits a single URL to all configured platforms (Google, Bing, ping services)
 * and logs every attempt to Supabase.
 *
 * @param pageUrl  Absolute URL to submit (e.g. https://firmsledger.com/blogs/slug)
 * @returns        Array of per-platform results
 */
export async function submitUrl(pageUrl: string): Promise<SubmissionResult[]> {
  const [google, bing, pingResults] = await Promise.all([
    submitToGoogle(pageUrl),
    submitToBing(pageUrl),
    pingFreeServices(pageUrl),
  ]);

  const all: SubmissionResult[] = [google, bing, ...pingResults];

  await logResults(pageUrl, all);
  return all;
}

/**
 * Batch-submits an array of URLs, one at a time with a short delay
 * to avoid rate-limiting on external services.
 */
export async function submitUrls(
  urls: string[]
): Promise<{ url: string; results: SubmissionResult[] }[]> {
  const summary: { url: string; results: SubmissionResult[] }[] = [];

  for (const url of urls) {
    try {
      const results = await submitUrl(url);
      summary.push({ url, results });
      // Polite delay between submissions
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.error(`submitUrl failed for ${url}:`, err);
    }
  }

  return summary;
}
