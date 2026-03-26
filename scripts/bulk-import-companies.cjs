/**
 * FirmsLedger — Bulk Company Importer
 *
 * Automatically imports 10 companies per category using Google Places API.
 * Fetches all categories from Supabase, finds which ones have < 10 companies,
 * searches Google Places in major global cities, and inserts results.
 *
 * Usage:
 *   node scripts/bulk-import-companies.cjs               # process up to 50 categories
 *   node scripts/bulk-import-companies.cjs --limit 100   # process up to 100 categories
 *   node scripts/bulk-import-companies.cjs --dry-run     # preview without inserting
 *   node scripts/bulk-import-companies.cjs --category food-beverage  # one category only
 *
 * Cost estimate (Google Places API):
 *   Each category needs ~5 searches × $0.032 = ~$0.16 per category
 *   50 categories/run ≈ $8   |  500 categories ≈ $80  |  All 10k ≈ $1,600
 *   Free tier: 1,000 requests/day — run with --limit 200 daily for free
 *
 * Run daily via cron until all categories have 10+ companies.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const GOOGLE_KEY   = process.env.GOOGLE_PLACES_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TARGET_PER_CATEGORY = 10; // stop importing once a category has this many

// Cities to search per category (gives global coverage, 2 results each = ~10 total)
const SEARCH_CITIES = [
  { city: 'New York',  country: 'United States', region: 'US', state: 'New York' },
  { city: 'London',    country: 'United Kingdom', region: 'GB', state: 'England' },
  { city: 'Mumbai',    country: 'India',          region: 'IN', state: 'Maharashtra' },
  { city: 'Sydney',    country: 'Australia',      region: 'AU', state: 'New South Wales' },
  { city: 'Singapore', country: 'Singapore',      region: 'SG', state: '' },
];

const RESULTS_PER_CITY = 2; // how many companies to take per city search

// ─── ARGS ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const DRY_RUN      = args.includes('--dry-run');
const LIMIT        = parseInt(args[args.indexOf('--limit') + 1] || '50', 10);
const ONLY_SLUG    = args.includes('--category') ? args[args.indexOf('--category') + 1] : null;

// ─── SUPABASE ─────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

async function searchPlaces(query, region) {
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&region=${region}&key=${GOOGLE_KEY}`;
  const res = await httpsGet(url);
  return res.results || [];
}

async function getPlaceDetails(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=website,formatted_phone_number&key=${GOOGLE_KEY}`;
  const res = await httpsGet(url);
  return res.result || {};
}

async function generateSlug(name) {
  let base = toSlug(name);
  let slug = base;
  let i = 2;
  while (true) {
    const { data } = await supabase.from('agencies').select('id').eq('slug', slug).maybeSingle();
    if (!data) return slug;
    slug = `${base}-${i++}`;
  }
}

async function agencyExists(name, city) {
  const { data } = await supabase
    .from('agencies').select('id')
    .ilike('name', name).ilike('hq_city', city)
    .maybeSingle();
  return !!data;
}

function makeDescription(name, categoryName, city, country) {
  return `${name} is a leading ${categoryName} company based in ${city}, ${country}. They provide professional ${categoryName.toLowerCase()} services to businesses and clients across the region.`;
}

// ─── FETCH CATEGORIES THAT NEED MORE COMPANIES ────────────────────────────────

async function getCategoriesNeedingCompanies() {
  // Get all categories
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name');

  if (error) throw new Error(`Failed to fetch categories: ${error.message}`);

  // Get company counts per category
  const { data: counts } = await supabase
    .from('agency_categories')
    .select('category_id');

  const countMap = {};
  for (const row of counts || []) {
    countMap[row.category_id] = (countMap[row.category_id] || 0) + 1;
  }

  // Filter to categories with < TARGET_PER_CATEGORY companies
  const needing = categories.filter((c) => (countMap[c.id] || 0) < TARGET_PER_CATEGORY);

  return { categories, countMap, needing };
}

// ─── IMPORT ONE CATEGORY ──────────────────────────────────────────────────────

async function importCategory(category, currentCount) {
  const needed = TARGET_PER_CATEGORY - currentCount;
  console.log(`\n📦 [${category.slug}] has ${currentCount} companies — importing up to ${needed} more`);

  let totalImported = 0;

  for (const { city, country, state, region } of SEARCH_CITIES) {
    if (totalImported >= needed) break;

    const query = `${category.name} company in ${city} ${country}`;
    console.log(`   🔍 Searching: "${query}"`);

    let places = [];
    try {
      places = await searchPlaces(query, region);
      await sleep(300); // avoid rate limit
    } catch (err) {
      console.log(`   ⚠️  Search failed: ${err.message}`);
      continue;
    }

    if (!places.length) {
      console.log(`   — No results`);
      continue;
    }

    const candidates = places.slice(0, RESULTS_PER_CITY);

    for (const place of candidates) {
      if (totalImported >= needed) break;

      const name = place.name;

      // Skip duplicates
      if (!DRY_RUN) {
        const exists = await agencyExists(name, city);
        if (exists) {
          console.log(`   ⏭️  Already exists: ${name}`);
          continue;
        }
      }

      if (DRY_RUN) {
        console.log(`   [DRY RUN] Would import: ${name} (${city}, ${country})`);
        totalImported++;
        continue;
      }

      // Fetch website
      let details = {};
      try {
        details = await getPlaceDetails(place.place_id);
        await sleep(200);
      } catch { /* ignore */ }

      const slug = await generateSlug(name);

      const { data: agency, error: insertErr } = await supabase
        .from('agencies')
        .insert({
          name,
          slug,
          description: makeDescription(name, category.name, city, country),
          website: details.website || null,
          phone: details.formatted_phone_number || null,
          hq_city: city,
          hq_state: state || null,
          hq_country: country,
          avg_rating: place.rating || 0,
          review_count: place.user_ratings_total || 0,
          approved: true,
          verified: false,
          featured: false,
        })
        .select('id')
        .single();

      if (insertErr) {
        console.log(`   ❌ Failed to insert ${name}: ${insertErr.message}`);
        continue;
      }

      // Link to category
      await supabase
        .from('agency_categories')
        .insert({ agency_id: agency.id, category_id: category.id });

      console.log(`   ✅ Imported: ${name} ⭐ ${place.rating || '?'} (${city})`);
      totalImported++;
    }

    await sleep(800); // rate limit between cities
  }

  console.log(`   → Added ${totalImported} companies for [${category.slug}]`);
  return totalImported;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!GOOGLE_KEY)   { console.error('❌ GOOGLE_PLACES_API_KEY not set in .env'); process.exit(1); }
  if (!SUPABASE_URL) { console.error('❌ NEXT_PUBLIC_SUPABASE_URL not set in .env'); process.exit(1); }
  if (!SERVICE_KEY)  { console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set in .env'); process.exit(1); }

  console.log('🚀 Bulk Company Importer');
  if (DRY_RUN) console.log('   MODE: DRY RUN — nothing will be inserted');

  const { categories, countMap, needing } = await getCategoriesNeedingCompanies();
  console.log(`📊 Total categories: ${categories.length}`);
  console.log(`📊 Categories with < ${TARGET_PER_CATEGORY} companies: ${needing.length}`);

  // If --category flag is set, only process that one
  let toProcess = ONLY_SLUG
    ? needing.filter((c) => c.slug === ONLY_SLUG)
    : needing.slice(0, LIMIT);

  if (ONLY_SLUG && !toProcess.length) {
    const found = categories.find((c) => c.slug === ONLY_SLUG);
    if (found) {
      console.log(`✅ Category "${ONLY_SLUG}" already has ${countMap[found.id] || 0} companies (>= ${TARGET_PER_CATEGORY})`);
    } else {
      console.log(`❌ Category "${ONLY_SLUG}" not found in database`);
    }
    return;
  }

  console.log(`⚙️  Processing ${toProcess.length} categories (limit: ${LIMIT})`);
  console.log(`💰 Estimated API cost: ~$${(toProcess.length * SEARCH_CITIES.length * 0.032).toFixed(2)}\n`);

  let totalImported = 0;
  let categoriesDone = 0;

  for (const cat of toProcess) {
    const currentCount = countMap[cat.id] || 0;
    const added = await importCategory(cat, currentCount);
    totalImported += added;
    categoriesDone++;
    console.log(`   Progress: ${categoriesDone}/${toProcess.length} categories done`);
    await sleep(1000);
  }

  console.log(`\n✅ Done!`);
  console.log(`   Categories processed : ${categoriesDone}`);
  console.log(`   Companies imported   : ${totalImported}`);
  if (needing.length > LIMIT && !ONLY_SLUG) {
    console.log(`   Remaining categories : ${needing.length - LIMIT} — run again to continue`);
  }
}

main().catch(console.error);
