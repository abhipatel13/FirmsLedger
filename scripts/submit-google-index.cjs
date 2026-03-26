/**
 * FirmsLedger — Google Indexing API Mass Submission
 *
 * Notifies Google to crawl/index all pages immediately.
 * Pages typically appear in Google within hours (not weeks).
 *
 * SETUP (one-time):
 *   1. Go to https://console.cloud.google.com
 *   2. Create a project → Enable "Web Search Indexing API"
 *   3. Create a Service Account → Download JSON key
 *   4. Save the JSON key as: scripts/google-service-account.json
 *   5. Go to Google Search Console → Settings → Users and permissions
 *      → Add the service account email as an OWNER
 *   6. Run: node scripts/submit-google-index.cjs
 *
 * Usage:
 *   node scripts/submit-google-index.cjs
 *   node scripts/submit-google-index.cjs --limit 200   (submit first 200 URLs only)
 */

const fs   = require('fs');
const path = require('path');
const https = require('https');

// Load .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val.length) process.env[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}

const SA_PATH  = path.join(__dirname, 'google-service-account.json');
const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com').replace(/\/$/, '');
const LIMIT    = (() => {
  const i = process.argv.indexOf('--limit');
  return i !== -1 ? parseInt(process.argv[i + 1], 10) : Infinity;
})();

// ─── Minimal Google OAuth2 JWT (no googleapis dependency needed) ─────────────

function base64url(buf) {
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function getAccessToken(sa) {
  const crypto = require('crypto');
  const now = Math.floor(Date.now() / 1000);

  const header  = base64url(Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const payload = base64url(Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })));

  const signingInput = `${header}.${payload}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signingInput);
  const sig = base64url(sign.sign(sa.private_key));
  const jwt = `${signingInput}.${sig}`;

  const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        const json = JSON.parse(data);
        if (json.access_token) resolve(json.access_token);
        else reject(new Error(`Token error: ${data}`));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Google Indexing API call ────────────────────────────────────────────────

function notifyGoogle(url, token) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ url, type: 'URL_UPDATED' });
    const req = https.request({
      hostname: 'indexing.googleapis.com',
      path: '/v3/urlNotifications:publish',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', e => resolve({ status: 0, body: e.message }));
    req.write(body);
    req.end();
  });
}

// ─── Build URL list ──────────────────────────────────────────────────────────

async function getAllUrls() {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );

  const [{ data: categories }, { data: companies }, { data: blogs }] = await Promise.all([
    supabase.from('categories').select('slug').order('slug'),
    supabase.from('agencies').select('slug').eq('approved', true),
    supabase.from('blog_posts').select('slug').eq('published', true),
  ]);

  const categorySlugs = (categories || []).map(c => c.slug).filter(Boolean);
  const companySlugs  = (companies  || []).map(c => c.slug).filter(Boolean);
  const blogSlugs     = (blogs      || []).map(b => b.slug).filter(Boolean);

  const TARGET_COUNTRIES = [
    'india','united-states','united-kingdom','australia','canada',
    'germany','france','uae','singapore','south-africa',
    'netherlands','brazil','mexico','japan','new-zealand',
    'italy','spain','china','south-korea','malaysia',
    'indonesia','thailand','vietnam','philippines','nigeria',
    'kenya','egypt','saudi-arabia','qatar','turkey',
    'poland','sweden','switzerland','argentina','colombia',
    'pakistan','bangladesh','israel','norway','denmark',
  ];

  const KEY_STATES = [
    { country: 'india', state: 'gujarat' }, { country: 'india', state: 'maharashtra' },
    { country: 'india', state: 'karnataka' }, { country: 'india', state: 'tamil-nadu' },
    { country: 'india', state: 'delhi' }, { country: 'india', state: 'uttar-pradesh' },
    { country: 'india', state: 'rajasthan' }, { country: 'india', state: 'telangana' },
    { country: 'united-states', state: 'california' }, { country: 'united-states', state: 'texas' },
    { country: 'united-states', state: 'new-york' }, { country: 'united-kingdom', state: 'england' },
    { country: 'australia', state: 'new-south-wales' }, { country: 'australia', state: 'victoria' },
    { country: 'canada', state: 'ontario' }, { country: 'canada', state: 'british-columbia' },
  ];

  const KEY_CITIES = [
    { country: 'india', state: 'gujarat',         city: 'ahmedabad' },
    { country: 'india', state: 'gujarat',         city: 'surat' },
    { country: 'india', state: 'maharashtra',     city: 'mumbai' },
    { country: 'india', state: 'maharashtra',     city: 'pune' },
    { country: 'india', state: 'karnataka',       city: 'bangalore' },
    { country: 'india', state: 'tamil-nadu',      city: 'chennai' },
    { country: 'india', state: 'telangana',       city: 'hyderabad' },
    { country: 'india', state: 'delhi',           city: 'new-delhi' },
    { country: 'united-states', state: 'california',  city: 'los-angeles' },
    { country: 'united-states', state: 'texas',       city: 'houston' },
    { country: 'united-kingdom', state: 'england',    city: 'london' },
    { country: 'australia', state: 'new-south-wales', city: 'sydney' },
    { country: 'canada', state: 'ontario',            city: 'toronto' },
  ];

  const urls = [];

  // High priority first
  urls.push(
    `${BASE_URL}/`,
    `${BASE_URL}/directory`,
    `${BASE_URL}/blogs`,
    `${BASE_URL}/Categories`,
    `${BASE_URL}/ListYourCompany`,
    `${BASE_URL}/contact`,
    `${BASE_URL}/directory/staffing`,
  );

  companySlugs.forEach(slug => urls.push(`${BASE_URL}/companies/${slug}`));
  blogSlugs.forEach(slug => urls.push(`${BASE_URL}/blogs/${slug}`));
  categorySlugs.forEach(slug => urls.push(`${BASE_URL}/directory/${slug}`));

  for (const slug of categorySlugs) {
    for (const country of TARGET_COUNTRIES) {
      urls.push(`${BASE_URL}/search/${slug}/${country}`);
    }
  }

  for (const slug of categorySlugs.slice(0, 200)) {
    for (const { country, state } of KEY_STATES) {
      urls.push(`${BASE_URL}/search/${slug}/${country}/${state}`);
    }
  }

  for (const slug of categorySlugs.slice(0, 100)) {
    for (const { country, state, city } of KEY_CITIES) {
      urls.push(`${BASE_URL}/search/${slug}/${country}/${state}/${city}`);
    }
  }

  return [...new Set(urls)];
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(SA_PATH)) {
    console.error(`
❌ Service account file not found: ${SA_PATH}

Setup steps:
  1. Go to https://console.cloud.google.com
  2. Create project → APIs & Services → Enable "Web Search Indexing API"
  3. IAM & Admin → Service Accounts → Create → Download JSON key
  4. Save as: scripts/google-service-account.json
  5. Google Search Console → Settings → Users → Add service account email as OWNER
  6. Re-run this script
`);
    process.exit(1);
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL in .env');
    process.exit(1);
  }

  const sa = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
  console.log(`🔑 Service account: ${sa.client_email}`);

  console.log('\n🔍 Fetching URLs from Supabase...');
  let urls = await getAllUrls();
  if (isFinite(LIMIT)) {
    urls = urls.slice(0, LIMIT);
    console.log(`⚠️  Limiting to first ${LIMIT} URLs (--limit flag)`);
  }
  console.log(`📋 Total URLs to submit: ${urls.length.toLocaleString()}\n`);

  console.log('🔑 Getting Google access token...');
  const token = await getAccessToken(sa);
  console.log('✅ Token obtained\n');

  let success = 0, failed = 0;
  const DELAY_MS = 50; // ~20 requests/second — well within quota

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const { status } = await notifyGoogle(url, token);

    if (status === 200) {
      success++;
      if (i % 50 === 0) console.log(`  [${i + 1}/${urls.length}] ✅ ${url}`);
    } else if (status === 429) {
      // Rate limited — wait and retry
      console.log(`  ⏳ Rate limited at ${i + 1}/${urls.length} — waiting 60s...`);
      await new Promise(r => setTimeout(r, 60000));
      const retry = await notifyGoogle(url, token);
      if (retry.status === 200) { success++; } else { failed++; console.log(`  ❌ ${url} (${retry.status})`); }
    } else {
      failed++;
      if (i % 50 === 0 || failed <= 5) console.log(`  ❌ [${status}] ${url}`);
    }

    await new Promise(r => setTimeout(r, DELAY_MS));
  }

  console.log(`\n✅ Done! ${success} submitted, ${failed} failed`);
  console.log('   Google will crawl submitted pages within hours.');
  console.log('   Track progress: https://search.google.com/search-console\n');
}

main().catch(console.error);
