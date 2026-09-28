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

// Load env files
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const BASE_URL  = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com').replace(/\/$/, '');
const INDEXNOW_KEY = 'd37e97116b054d6bbe3275ef4a0f5db1';
const BATCH_SIZE = 10000;

async function getAllUrls() {
  const { neon } = require('@neondatabase/serverless');
  const dbUrl = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ Missing DATABASE_URL or NEXT_PUBLIC_DATABASE_URL in environment');
    process.exit(1);
  }
  const sql = neon(dbUrl);

  console.log('🔌 Connecting to database...');
  // Fetch categories and states from DB
  const [categoriesRows, statesRows] = await Promise.all([
    sql`SELECT slug FROM categories`,
    sql`SELECT slug FROM states`,
  ]);

  const categorySlugs = categoriesRows.map(c => c.slug).filter(Boolean);
  const stateSlugs  = statesRows.map(s => s.slug).filter(Boolean);

  const urls = new Set();

  // Static pages
  [
    '/', '/search', '/browse', '/list-your-company', '/claim-listing', '/contact', '/terms', '/privacy'
  ].forEach(p => urls.add(`${BASE_URL}${p}`));

  // Category hub pages: /{category}
  categorySlugs.forEach(slug => urls.add(`${BASE_URL}/${slug}`));

  // State hub pages: /states/{state}
  stateSlugs.forEach(stateSlug => urls.add(`${BASE_URL}/states/${stateSlug}`));

  // Category + state pages: /{category}/{state}
  for (const slug of categorySlugs) {
    for (const stateSlug of stateSlugs) {
      urls.add(`${BASE_URL}/${slug}/${stateSlug}`);
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
  console.log('🔍 Fetching all URLs from Neon Database...');
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
