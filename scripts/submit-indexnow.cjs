/**
 * FirmsLedger — IndexNow Mass Submission
 *
 * Submits all sitemap URLs to IndexNow (Bing, Yandex, etc.)
 * Pages appear in Bing within minutes.
 *
 * Usage:
 *   node scripts/submit-indexnow.cjs
 */

const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val.length) process.env[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}

const BASE_URL  = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com').replace(/\/$/, '');
const INDEXNOW_KEY = 'd1fe4870b90d8562cb551a1e68124f4d';
const BATCH_SIZE = 10000; // IndexNow allows up to 10,000 URLs per request

async function getAllUrls() {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );

  // Fetch categories and companies from DB
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
    { country: 'india', state: 'gujarat' },
    { country: 'india', state: 'maharashtra' },
    { country: 'india', state: 'karnataka' },
    { country: 'india', state: 'tamil-nadu' },
    { country: 'india', state: 'delhi' },
    { country: 'india', state: 'uttar-pradesh' },
    { country: 'india', state: 'rajasthan' },
    { country: 'india', state: 'telangana' },
    { country: 'india', state: 'andhra-pradesh' },
    { country: 'india', state: 'kerala' },
    { country: 'india', state: 'west-bengal' },
    { country: 'india', state: 'punjab' },
    { country: 'united-states', state: 'california' },
    { country: 'united-states', state: 'texas' },
    { country: 'united-states', state: 'new-york' },
    { country: 'united-states', state: 'florida' },
    { country: 'united-states', state: 'illinois' },
    { country: 'united-kingdom', state: 'england' },
    { country: 'united-kingdom', state: 'scotland' },
    { country: 'united-kingdom', state: 'wales' },
    { country: 'australia', state: 'new-south-wales' },
    { country: 'australia', state: 'victoria' },
    { country: 'australia', state: 'queensland' },
    { country: 'australia', state: 'western-australia' },
    { country: 'canada', state: 'ontario' },
    { country: 'canada', state: 'british-columbia' },
    { country: 'canada', state: 'quebec' },
    { country: 'germany', state: 'bavaria' },
    { country: 'germany', state: 'north-rhine-westphalia' },
  ];

  const KEY_CITIES = [
    { country: 'india', state: 'gujarat',         city: 'ahmedabad' },
    { country: 'india', state: 'gujarat',         city: 'surat' },
    { country: 'india', state: 'gujarat',         city: 'vadodara' },
    { country: 'india', state: 'gujarat',         city: 'rajkot' },
    { country: 'india', state: 'maharashtra',     city: 'mumbai' },
    { country: 'india', state: 'maharashtra',     city: 'pune' },
    { country: 'india', state: 'karnataka',       city: 'bangalore' },
    { country: 'india', state: 'tamil-nadu',      city: 'chennai' },
    { country: 'india', state: 'telangana',       city: 'hyderabad' },
    { country: 'india', state: 'delhi',           city: 'new-delhi' },
    { country: 'india', state: 'uttar-pradesh',   city: 'lucknow' },
    { country: 'india', state: 'uttar-pradesh',   city: 'noida' },
    { country: 'india', state: 'west-bengal',     city: 'kolkata' },
    { country: 'india', state: 'rajasthan',       city: 'jaipur' },
    { country: 'india', state: 'kerala',          city: 'kochi' },
    { country: 'united-states', state: 'california',  city: 'los-angeles' },
    { country: 'united-states', state: 'california',  city: 'san-francisco' },
    { country: 'united-states', state: 'texas',       city: 'houston' },
    { country: 'united-states', state: 'texas',       city: 'dallas' },
    { country: 'united-states', state: 'new-york',    city: 'new-york-city' },
    { country: 'united-states', state: 'florida',     city: 'miami' },
    { country: 'united-states', state: 'illinois',    city: 'chicago' },
    { country: 'united-kingdom', state: 'england',    city: 'london' },
    { country: 'united-kingdom', state: 'england',    city: 'manchester' },
    { country: 'united-kingdom', state: 'england',    city: 'birmingham' },
    { country: 'australia', state: 'new-south-wales', city: 'sydney' },
    { country: 'australia', state: 'victoria',        city: 'melbourne' },
    { country: 'australia', state: 'queensland',      city: 'brisbane' },
    { country: 'canada', state: 'ontario',            city: 'toronto' },
    { country: 'canada', state: 'british-columbia',   city: 'vancouver' },
    { country: 'uae', state: 'dubai',                 city: 'dubai' },
  ];

  const urls = new Set();

  // Static pages
  [
    '/', '/directory', '/directory/staffing', '/blogs',
    '/contact', '/ListYourCompany', '/Categories',
  ].forEach(p => urls.add(`${BASE_URL}${p}`));

  // Company profiles
  companySlugs.forEach(slug => urls.add(`${BASE_URL}/companies/${slug}`));

  // Blog posts
  blogSlugs.forEach(slug => urls.add(`${BASE_URL}/blogs/${slug}`));

  // Category directory pages
  categorySlugs.forEach(slug => urls.add(`${BASE_URL}/directory/${slug}`));

  // Search/country pages — all categories × all countries
  for (const slug of categorySlugs) {
    for (const country of TARGET_COUNTRIES) {
      urls.add(`${BASE_URL}/search/${slug}/${country}`);
    }
  }

  // Search/state pages
  for (const slug of categorySlugs.slice(0, 200)) {
    for (const { country, state } of KEY_STATES) {
      urls.add(`${BASE_URL}/search/${slug}/${country}/${state}`);
    }
  }

  // Search/city pages
  for (const slug of categorySlugs.slice(0, 100)) {
    for (const { country, state, city } of KEY_CITIES) {
      urls.add(`${BASE_URL}/search/${slug}/${country}/${state}/${city}`);
    }
  }

  return Array.from(urls);
}

function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

async function submitBatch(urls, batchNum, total) {
  const body = {
    host: 'www.firmsledger.com',
    key: INDEXNOW_KEY,
    keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });

  if (res.ok || res.status === 202) {
    console.log(`  ✅ Batch ${batchNum}/${total} submitted (${urls.length} URLs) — HTTP ${res.status}`);
  } else {
    const text = await res.text();
    console.log(`  ❌ Batch ${batchNum}/${total} failed — HTTP ${res.status}: ${text}`);
  }
}

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL in .env');
    process.exit(1);
  }

  console.log('🔍 Fetching all URLs...');
  const urls = await getAllUrls();
  console.log(`📋 Total URLs: ${urls.length.toLocaleString()}\n`);

  const batches = chunk(urls, BATCH_SIZE);
  console.log(`📦 Submitting in ${batches.length} batch(es) of up to ${BATCH_SIZE} URLs each\n`);

  for (let i = 0; i < batches.length; i++) {
    await submitBatch(batches[i], i + 1, batches.length);
    if (i < batches.length - 1) await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n✅ IndexNow submission complete!');
  console.log('   Bing will crawl these pages within minutes.');
  console.log('   Check: https://www.bing.com/webmasters\n');
}

main().catch(console.error);
