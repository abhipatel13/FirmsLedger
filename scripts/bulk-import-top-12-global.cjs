/**
 * FirmsLedger — Top-12 Global Bulk Import
 *
 * For each of 12 target categories, imports up to 10 real companies in every
 * TARGET_COUNTRY (50 countries from programmaticSeo.js). Uses Google Places API.
 * Resumable: skips (category, country) pairs that already have >= 10 companies.
 *
 * Usage:
 *   node scripts/bulk-import-top-12-global.cjs                       # full run
 *   node scripts/bulk-import-top-12-global.cjs --dry-run              # preview, no inserts
 *   node scripts/bulk-import-top-12-global.cjs --category commercial-banking
 *   node scripts/bulk-import-top-12-global.cjs --country qatar
 *   node scripts/bulk-import-top-12-global.cjs --limit 10             # stop after N country-category pairs
 *
 * Cost: ~1-2 Places text searches per (category, country) = 600-1200 searches
 *   × $0.032 ≈ $20-$40 for a full run. Free tier: 1,000 req/day.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const GOOGLE_KEY   = process.env.GOOGLE_PLACES_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TARGET_PER_COUNTRY = 10;

const TARGET_CATEGORY_SLUGS = [
  'ai-invoice-processing',
  'recycling',
  'aircraft-engines',
  'cargo-ships',
  'home-buying',
  'home-selling',
  'office-leasing',
  'gym-equipment',
  'printing-paper',
  'packaging',
  'nuclear-reactors',
  'commercial-banking',
];

// country slug → { name, iso2, searchCity }
// iso2 is Google Places regionCode; searchCity biases the text search toward a real hub
const COUNTRIES = {
  'india':          { name: 'India',                iso2: 'IN', searchCity: 'Mumbai' },
  'united-states':  { name: 'United States',        iso2: 'US', searchCity: 'New York' },
  'united-kingdom': { name: 'United Kingdom',       iso2: 'GB', searchCity: 'London' },
  'australia':      { name: 'Australia',            iso2: 'AU', searchCity: 'Sydney' },
  'canada':         { name: 'Canada',               iso2: 'CA', searchCity: 'Toronto' },
  'germany':        { name: 'Germany',              iso2: 'DE', searchCity: 'Berlin' },
  'france':         { name: 'France',               iso2: 'FR', searchCity: 'Paris' },
  'uae':            { name: 'United Arab Emirates', iso2: 'AE', searchCity: 'Dubai' },
  'singapore':      { name: 'Singapore',            iso2: 'SG', searchCity: 'Singapore' },
  'south-africa':   { name: 'South Africa',         iso2: 'ZA', searchCity: 'Johannesburg' },
  'netherlands':    { name: 'Netherlands',          iso2: 'NL', searchCity: 'Amsterdam' },
  'brazil':         { name: 'Brazil',               iso2: 'BR', searchCity: 'São Paulo' },
  'mexico':         { name: 'Mexico',               iso2: 'MX', searchCity: 'Mexico City' },
  'japan':          { name: 'Japan',                iso2: 'JP', searchCity: 'Tokyo' },
  'new-zealand':    { name: 'New Zealand',          iso2: 'NZ', searchCity: 'Auckland' },
  'italy':          { name: 'Italy',                iso2: 'IT', searchCity: 'Milan' },
  'spain':          { name: 'Spain',                iso2: 'ES', searchCity: 'Madrid' },
  'russia':         { name: 'Russia',               iso2: 'RU', searchCity: 'Moscow' },
  'china':          { name: 'China',                iso2: 'CN', searchCity: 'Shanghai' },
  'south-korea':    { name: 'South Korea',          iso2: 'KR', searchCity: 'Seoul' },
  'malaysia':       { name: 'Malaysia',             iso2: 'MY', searchCity: 'Kuala Lumpur' },
  'indonesia':      { name: 'Indonesia',            iso2: 'ID', searchCity: 'Jakarta' },
  'thailand':       { name: 'Thailand',             iso2: 'TH', searchCity: 'Bangkok' },
  'vietnam':        { name: 'Vietnam',              iso2: 'VN', searchCity: 'Ho Chi Minh City' },
  'philippines':    { name: 'Philippines',          iso2: 'PH', searchCity: 'Manila' },
  'nigeria':        { name: 'Nigeria',              iso2: 'NG', searchCity: 'Lagos' },
  'kenya':          { name: 'Kenya',                iso2: 'KE', searchCity: 'Nairobi' },
  'egypt':          { name: 'Egypt',                iso2: 'EG', searchCity: 'Cairo' },
  'saudi-arabia':   { name: 'Saudi Arabia',         iso2: 'SA', searchCity: 'Riyadh' },
  'qatar':          { name: 'Qatar',                iso2: 'QA', searchCity: 'Doha' },
  'sweden':         { name: 'Sweden',               iso2: 'SE', searchCity: 'Stockholm' },
  'norway':         { name: 'Norway',               iso2: 'NO', searchCity: 'Oslo' },
  'denmark':        { name: 'Denmark',              iso2: 'DK', searchCity: 'Copenhagen' },
  'finland':        { name: 'Finland',              iso2: 'FI', searchCity: 'Helsinki' },
  'switzerland':    { name: 'Switzerland',          iso2: 'CH', searchCity: 'Zurich' },
  'austria':        { name: 'Austria',              iso2: 'AT', searchCity: 'Vienna' },
  'belgium':        { name: 'Belgium',              iso2: 'BE', searchCity: 'Brussels' },
  'poland':         { name: 'Poland',               iso2: 'PL', searchCity: 'Warsaw' },
  'turkey':         { name: 'Turkey',               iso2: 'TR', searchCity: 'Istanbul' },
  'israel':         { name: 'Israel',               iso2: 'IL', searchCity: 'Tel Aviv' },
  'argentina':      { name: 'Argentina',            iso2: 'AR', searchCity: 'Buenos Aires' },
  'chile':          { name: 'Chile',                iso2: 'CL', searchCity: 'Santiago' },
  'colombia':       { name: 'Colombia',             iso2: 'CO', searchCity: 'Bogotá' },
  'peru':           { name: 'Peru',                 iso2: 'PE', searchCity: 'Lima' },
  'bangladesh':     { name: 'Bangladesh',           iso2: 'BD', searchCity: 'Dhaka' },
  'pakistan':       { name: 'Pakistan',             iso2: 'PK', searchCity: 'Karachi' },
  'sri-lanka':      { name: 'Sri Lanka',            iso2: 'LK', searchCity: 'Colombo' },
  'myanmar':        { name: 'Myanmar',              iso2: 'MM', searchCity: 'Yangon' },
  'cambodia':       { name: 'Cambodia',             iso2: 'KH', searchCity: 'Phnom Penh' },
  'ghana':          { name: 'Ghana',                iso2: 'GH', searchCity: 'Accra' },
};

// ─── ARGS ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const DRY_RUN     = args.includes('--dry-run');
const ONLY_CAT    = args.includes('--category') ? args[args.indexOf('--category') + 1] : null;
const ONLY_CTRY   = args.includes('--country')  ? args[args.indexOf('--country')  + 1] : null;
const PAIR_LIMIT  = args.includes('--limit')    ? parseInt(args[args.indexOf('--limit') + 1], 10) : Infinity;

// ─── SUPABASE ─────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

function httpsPostJson(url, body, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const payload = JSON.stringify(body);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...headers,
      },
    }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function searchPlaces(query, region) {
  const FIELD_MASK = [
    'places.id',
    'places.displayName',
    'places.rating',
    'places.userRatingCount',
    'places.websiteUri',
    'places.nationalPhoneNumber',
    'places.internationalPhoneNumber',
    'places.formattedAddress',
    'places.addressComponents',
    'places.types',
  ].join(',');

  const res = await httpsPostJson(
    'https://places.googleapis.com/v1/places:searchText',
    { textQuery: query, regionCode: region, maxResultCount: 20 },
    { 'X-Goog-Api-Key': GOOGLE_KEY, 'X-Goog-FieldMask': FIELD_MASK },
  );

  if (res.error) throw new Error(`Places API: ${res.error.status || ''} ${res.error.message || ''}`);

  return (res.places || []).map((p) => ({
    place_id: p.id,
    name: p.displayName?.text || '',
    rating: p.rating || 0,
    user_ratings_total: p.userRatingCount || 0,
    website: p.websiteUri || null,
    phone: p.nationalPhoneNumber || p.internationalPhoneNumber || null,
    address: p.formattedAddress || '',
    components: p.addressComponents || [],
    types: p.types || [],
  }));
}

function extractCity(place, fallbackCity) {
  // addressComponents may contain locality, administrative_area_level_1 (state)
  const comps = place.components || [];
  const locality = comps.find((c) => (c.types || []).includes('locality'));
  const postalTown = comps.find((c) => (c.types || []).includes('postal_town'));
  const subloc = comps.find((c) => (c.types || []).includes('sublocality'));
  return (locality || postalTown || subloc)?.longText || fallbackCity;
}

function extractState(place) {
  const comps = place.components || [];
  const admin1 = comps.find((c) => (c.types || []).includes('administrative_area_level_1'));
  return admin1?.longText || null;
}

async function generateSlug(name) {
  let base = toSlug(name);
  if (!base) base = 'company';
  let slug = base;
  let i = 2;
  while (true) {
    const { data } = await supabase.from('agencies').select('id').eq('slug', slug).maybeSingle();
    if (!data) return slug;
    slug = `${base}-${i++}`;
  }
}

async function findExistingAgency(name, country) {
  const { data } = await supabase
    .from('agencies').select('id')
    .ilike('name', name).ilike('hq_country', country)
    .maybeSingle();
  return data || null;
}

async function linkAgencyToCategory(agencyId, categoryId) {
  const { error } = await supabase
    .from('agency_categories')
    .upsert({ agency_id: agencyId, category_id: categoryId }, { onConflict: 'agency_id,category_id' });
  return !error;
}

function makeDescription(name, categoryName, city, country) {
  return `${name} is a leading ${categoryName} company based in ${city}, ${country}. They provide professional ${categoryName.toLowerCase()} services to businesses and clients across the region.`;
}

async function countAgenciesForCategoryCountry(categoryId, countryName) {
  const { count, error } = await supabase
    .from('agency_categories')
    .select('agency_id, agencies!inner(hq_country)', { count: 'exact', head: true })
    .eq('category_id', categoryId)
    .eq('agencies.hq_country', countryName);
  if (error) {
    console.log(`   ⚠️  count query failed: ${error.message}`);
    return 0;
  }
  return count || 0;
}

function buildQueries(categoryName, countryName, searchCity) {
  const n = categoryName.toLowerCase();
  // Light noun hints so niche slugs still match Places' business taxonomy
  let suffix = 'companies';
  if (/bank/.test(n)) suffix = 'banks';
  else if (/reactor/.test(n)) suffix = 'nuclear reactor companies';
  else if (/aircraft engine/.test(n)) suffix = 'aerospace engine manufacturers';
  else if (/cargo ship/.test(n)) suffix = 'shipping and cargo vessel operators';
  else if (/recycling/.test(n)) suffix = 'recycling companies';
  else if (/packaging/.test(n)) suffix = 'packaging manufacturers';
  else if (/printing paper/.test(n)) suffix = 'paper manufacturers and suppliers';
  else if (/gym equipment/.test(n)) suffix = 'gym equipment suppliers';
  else if (/office leasing/.test(n)) suffix = 'commercial office leasing firms';
  else if (/home buying|home selling/.test(n)) suffix = 'real estate firms';
  else if (/invoice processing/.test(n)) suffix = 'AP automation and invoice processing companies';

  return [
    `top ${categoryName} ${suffix} in ${countryName}`,
    `${categoryName} ${suffix} in ${searchCity} ${countryName}`,
    `best ${categoryName} ${suffix} in ${countryName}`,
    `${categoryName} companies in ${countryName}`,
  ];
}

// ─── IMPORT ONE (CATEGORY × COUNTRY) ──────────────────────────────────────────

async function importCategoryCountry(category, countrySlug, countryMeta) {
  const countryName = countryMeta.name;
  const region = countryMeta.iso2;
  const searchCity = countryMeta.searchCity;

  const existing = await countAgenciesForCategoryCountry(category.id, countryName);
  const needed = TARGET_PER_COUNTRY - existing;
  if (needed <= 0) {
    console.log(`   ⏭  [${category.slug} × ${countryName}] already has ${existing} — skip`);
    return 0;
  }

  console.log(`\n📦 [${category.slug} × ${countryName}] has ${existing} — importing up to ${needed}`);

  let imported = 0;
  const queries = buildQueries(category.name, countryName, searchCity);
  const seenPlaceIds = new Set();

  for (const q of queries) {
    if (imported >= needed) break;
    let places = [];
    try {
      places = await searchPlaces(q, region);
      await sleep(300);
    } catch (err) {
      console.log(`   ⚠️  "${q}" failed: ${err.message}`);
      continue;
    }
    if (!places.length) {
      console.log(`   🔍 "${q}" — 0 results`);
      continue;
    }
    console.log(`   🔍 "${q}" — ${places.length} results`);

    for (const place of places) {
      if (imported >= needed) break;
      if (!place.name) continue;
      if (seenPlaceIds.has(place.place_id)) continue;
      seenPlaceIds.add(place.place_id);

      const city = extractCity(place, searchCity);
      const state = extractState(place);

      if (DRY_RUN) {
        console.log(`   [DRY] ${place.name} — ${city}, ${state || '—'}, ${countryName}`);
        imported++;
        continue;
      }

      const existingAgency = await findExistingAgency(place.name, countryName);
      if (existingAgency) {
        const linked = await linkAgencyToCategory(existingAgency.id, category.id);
        console.log(`   🔗 linked existing: ${place.name}${linked ? '' : ' (link failed)'}`);
        imported++;
        continue;
      }

      const slug = await generateSlug(place.name);
      const { data: agency, error: insertErr } = await supabase
        .from('agencies')
        .insert({
          name: place.name,
          slug,
          description: makeDescription(place.name, category.name, city, countryName),
          website: place.website,
          hq_city: city,
          hq_state: state,
          hq_country: countryName,
          avg_rating: place.rating || 0,
          review_count: place.user_ratings_total || 0,
          approved: true,
          verified: false,
          featured: false,
        })
        .select('id')
        .single();

      if (insertErr) {
        console.log(`   ❌ insert failed for ${place.name}: ${insertErr.message}`);
        continue;
      }
      await linkAgencyToCategory(agency.id, category.id);
      console.log(`   ✅ ${place.name} ⭐ ${place.rating || '?'} (${city})`);
      imported++;
    }
    await sleep(400);
  }

  if (imported < needed) {
    console.log(`   ⚠️  only found ${imported}/${needed} for [${category.slug} × ${countryName}]`);
  }
  return imported;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!GOOGLE_KEY)   { console.error('❌ GOOGLE_PLACES_API_KEY not set in .env'); process.exit(1); }
  if (!SUPABASE_URL) { console.error('❌ NEXT_PUBLIC_SUPABASE_URL not set in .env'); process.exit(1); }
  if (!SERVICE_KEY)  { console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set in .env'); process.exit(1); }

  console.log('🚀 Top-12 Global Bulk Importer');
  if (DRY_RUN) console.log('   MODE: DRY RUN — nothing will be inserted');

  // Fetch the 12 target categories from DB
  const slugs = ONLY_CAT ? [ONLY_CAT] : TARGET_CATEGORY_SLUGS;
  const { data: cats, error: catErr } = await supabase
    .from('categories').select('id, name, slug').in('slug', slugs);
  if (catErr) { console.error('❌ category lookup failed:', catErr.message); process.exit(1); }
  const byslug = Object.fromEntries(cats.map((c) => [c.slug, c]));
  const missing = slugs.filter((s) => !byslug[s]);
  if (missing.length) {
    console.log(`⚠️  categories not in DB (will skip): ${missing.join(', ')}`);
  }
  const categories = slugs.map((s) => byslug[s]).filter(Boolean);

  const countryEntries = ONLY_CTRY
    ? [[ONLY_CTRY, COUNTRIES[ONLY_CTRY]]].filter(([, v]) => v)
    : Object.entries(COUNTRIES);

  const totalPairs = categories.length * countryEntries.length;
  console.log(`📊 categories: ${categories.length} | countries: ${countryEntries.length} | pairs: ${totalPairs}`);
  console.log(`💰 est. cost (best case, 1 search/pair): $${(totalPairs * 0.032).toFixed(2)}\n`);

  let totalImported = 0;
  let pairsDone = 0;

  for (const cat of categories) {
    for (const [cslug, cmeta] of countryEntries) {
      if (pairsDone >= PAIR_LIMIT) break;
      const added = await importCategoryCountry(cat, cslug, cmeta);
      totalImported += added;
      pairsDone++;
      console.log(`   progress: ${pairsDone}/${Math.min(totalPairs, PAIR_LIMIT)} pairs`);
      await sleep(500);
    }
    if (pairsDone >= PAIR_LIMIT) break;
  }

  console.log(`\n✅ Done!`);
  console.log(`   pairs processed  : ${pairsDone}`);
  console.log(`   companies added  : ${totalImported}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
