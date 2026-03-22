/**
 * FirmsLedger — Google Places Company Importer
 * Fetches top 3 companies per category+city and saves to Supabase.
 *
 * Usage:
 *   node scripts/import-places.cjs
 *
 * Env required:
 *   GOOGLE_PLACES_API_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

require('dotenv').config({ path: '.env' });
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// ─── CONFIGURE YOUR TARGETS HERE ────────────────────────────────────────────
// Add as many category + city combinations as you want.
// categorySlug must match a slug in your Supabase categories table.

const TARGETS = [
  // ── INDIA ──────────────────────────────────────────────────────────────────
  // Gujarat
  { categorySlug: 'logistics-supply-chain', city: 'Ahmedabad',   state: 'Gujarat',      country: 'India', region: 'IN' },
  { categorySlug: 'logistics-supply-chain', city: 'Surat',        state: 'Gujarat',      country: 'India', region: 'IN' },
  { categorySlug: 'logistics-supply-chain', city: 'Vadodara',     state: 'Gujarat',      country: 'India', region: 'IN' },
  { categorySlug: 'logistics-supply-chain', city: 'Rajkot',       state: 'Gujarat',      country: 'India', region: 'IN' },
  { categorySlug: 'it-staffing',            city: 'Ahmedabad',    state: 'Gujarat',      country: 'India', region: 'IN' },
  { categorySlug: 'it-staffing',            city: 'Surat',        state: 'Gujarat',      country: 'India', region: 'IN' },
  { categorySlug: 'software-development',   city: 'Ahmedabad',    state: 'Gujarat',      country: 'India', region: 'IN' },
  { categorySlug: 'software-development',   city: 'Surat',        state: 'Gujarat',      country: 'India', region: 'IN' },
  { categorySlug: 'solar-panels',           city: 'Ahmedabad',    state: 'Gujarat',      country: 'India', region: 'IN' },
  { categorySlug: 'solar-panels',           city: 'Surat',        state: 'Gujarat',      country: 'India', region: 'IN' },
  { categorySlug: 'solar-panels',           city: 'Rajkot',       state: 'Gujarat',      country: 'India', region: 'IN' },
  // Maharashtra
  { categorySlug: 'it-staffing',            city: 'Mumbai',       state: 'Maharashtra',  country: 'India', region: 'IN' },
  { categorySlug: 'it-staffing',            city: 'Pune',         state: 'Maharashtra',  country: 'India', region: 'IN' },
  { categorySlug: 'logistics-supply-chain', city: 'Mumbai',       state: 'Maharashtra',  country: 'India', region: 'IN' },
  { categorySlug: 'software-development',   city: 'Pune',         state: 'Maharashtra',  country: 'India', region: 'IN' },
  // Karnataka
  { categorySlug: 'it-staffing',            city: 'Bangalore',    state: 'Karnataka',    country: 'India', region: 'IN' },
  { categorySlug: 'software-development',   city: 'Bangalore',    state: 'Karnataka',    country: 'India', region: 'IN' },
  // Delhi
  { categorySlug: 'logistics-supply-chain', city: 'New Delhi',    state: 'Delhi',        country: 'India', region: 'IN' },
  { categorySlug: 'it-staffing',            city: 'New Delhi',    state: 'Delhi',        country: 'India', region: 'IN' },

  // ── ADD MORE BELOW ──────────────────────────────────────────────────────────
  // { categorySlug: 'your-category-slug', city: 'City', state: 'State', country: 'Country', region: 'US' },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// Google Places Text Search
async function searchPlaces(query, region) {
  const q = encodeURIComponent(query);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${q}&region=${region}&key=${GOOGLE_KEY}`;
  const res = await httpsGet(url);
  return res.results || [];
}

// Google Places Details (for website + phone)
async function getPlaceDetails(placeId) {
  const fields = 'website,formatted_phone_number,url';
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_KEY}`;
  const res = await httpsGet(url);
  return res.result || {};
}

// Get category id from slug
async function getCategoryId(slug) {
  const { data } = await supabase
    .from('categories')
    .select('id, name')
    .eq('slug', slug)
    .maybeSingle();
  return data;
}

// Check if agency already exists
async function agencyExists(name, city) {
  const { data } = await supabase
    .from('agencies')
    .select('id')
    .ilike('name', name)
    .ilike('hq_city', city)
    .maybeSingle();
  return !!data;
}

// Generate unique slug
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

// Generate a description
function makeDescription(companyName, categoryName, city, country) {
  return `${companyName} is a leading ${categoryName} company based in ${city}, ${country}. They provide professional ${categoryName.toLowerCase()} services to businesses and clients across the region.`;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function importTarget({ categorySlug, city, state, country, region }) {
  console.log(`\n🔍 Searching: "${categorySlug}" in ${city}, ${state}`);

  const category = await getCategoryId(categorySlug);
  if (!category) {
    console.log(`   ⚠️  Category not found in DB: ${categorySlug}`);
    return;
  }

  const query = `${category.name} company in ${city} ${country}`;
  const places = await searchPlaces(query, region);

  if (!places.length) {
    console.log(`   ⚠️  No results from Google Places`);
    return;
  }

  const top3 = places.slice(0, 3);
  let imported = 0;

  for (const place of top3) {
    const name = place.name;

    // Skip if already exists
    const exists = await agencyExists(name, city);
    if (exists) {
      console.log(`   ⏭️  Already exists: ${name}`);
      continue;
    }

    // Get website from Place Details
    await sleep(200);
    const details = await getPlaceDetails(place.place_id);

    const slug = await generateSlug(name);
    const description = makeDescription(name, category.name, city, country);

    // Insert agency
    const { data: agency, error } = await supabase
      .from('agencies')
      .insert({
        name,
        slug,
        description,
        website: details.website || null,
        hq_city: city,
        hq_state: state,
        hq_country: country,
        avg_rating: place.rating || 0,
        review_count: place.user_ratings_total || 0,
        approved: true,
        verified: false,
        featured: false,
      })
      .select('id')
      .single();

    if (error) {
      console.log(`   ❌ Insert failed for ${name}: ${error.message}`);
      continue;
    }

    // Link to category
    await supabase
      .from('agency_categories')
      .insert({ agency_id: agency.id, category_id: category.id })
      .select();

    console.log(`   ✅ Imported: ${name} (rating: ${place.rating || 'N/A'})`);
    imported++;
  }

  console.log(`   📦 Done: ${imported} new companies added for ${categorySlug} in ${city}`);
}

async function main() {
  if (!GOOGLE_KEY) {
    console.error('❌ GOOGLE_PLACES_API_KEY not set in .env');
    process.exit(1);
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Supabase env vars not set');
    process.exit(1);
  }

  console.log(`🚀 Starting import — ${TARGETS.length} targets`);

  for (const target of TARGETS) {
    await importTarget(target);
    await sleep(1000); // Respect Google rate limits
  }

  console.log('\n✅ All done!');
}

main().catch(console.error);
