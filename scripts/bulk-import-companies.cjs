/**
 * FirmsLedger — Bulk Company Importer
 *
 * Automatically imports 10 companies per category using Google Places API.
 * Fetches all categories from Supabase, finds which ones have < 10 companies,
 * searches Google Places in major global cities, and inserts results.
 *
 * Usage:
 *   node scripts/bulk-import-companies.cjs                                   # process up to 50 categories
 *   node scripts/bulk-import-companies.cjs --limit 100                       # process up to 100 categories
 *   node scripts/bulk-import-companies.cjs --dry-run                         # preview without inserting
 *   node scripts/bulk-import-companies.cjs --category food-beverage          # one category only
 *   node scripts/bulk-import-companies.cjs --category a,b,c                  # multiple categories
 *   node scripts/bulk-import-companies.cjs --category X --all-us-states      # all 50 US states + DC
 *   node scripts/bulk-import-companies.cjs --category X --country-preset india    # all major Indian states/cities
 *   node scripts/bulk-import-companies.cjs --category X --country-preset uk       # UK presets
 *   node scripts/bulk-import-companies.cjs --category X --country-preset canada   # Canada presets
 *   node scripts/bulk-import-companies.cjs --category X --country-preset australia
 *   node scripts/bulk-import-companies.cjs --category X --country-preset uae
 *   node scripts/bulk-import-companies.cjs --category X --state Utah --city "Salt Lake City,Provo"
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
  { city: 'Doha',      country: 'Qatar',          region: 'QA', state: '' },
];

const RESULTS_PER_CITY = 2; // how many companies to take per city search

// All 50 US states + DC with their largest 2 cities — used by --all-us-states flag.
// Lets you seed a category across the entire US in a single run.
const US_STATE_CITIES = [
  { state: 'Alabama',        cities: ['Birmingham', 'Huntsville'] },
  { state: 'Alaska',         cities: ['Anchorage', 'Fairbanks'] },
  { state: 'Arizona',        cities: ['Phoenix', 'Tucson'] },
  { state: 'Arkansas',       cities: ['Little Rock', 'Fayetteville'] },
  { state: 'California',     cities: ['Los Angeles', 'San Francisco'] },
  { state: 'Colorado',       cities: ['Denver', 'Colorado Springs'] },
  { state: 'Connecticut',    cities: ['Hartford', 'Bridgeport'] },
  { state: 'Delaware',       cities: ['Wilmington', 'Dover'] },
  { state: 'Florida',        cities: ['Miami', 'Orlando'] },
  { state: 'Georgia',        cities: ['Atlanta', 'Savannah'] },
  { state: 'Hawaii',         cities: ['Honolulu', 'Hilo'] },
  { state: 'Idaho',          cities: ['Boise', 'Idaho Falls'] },
  { state: 'Illinois',       cities: ['Chicago', 'Springfield'] },
  { state: 'Indiana',        cities: ['Indianapolis', 'Fort Wayne'] },
  { state: 'Iowa',           cities: ['Des Moines', 'Cedar Rapids'] },
  { state: 'Kansas',         cities: ['Wichita', 'Kansas City'] },
  { state: 'Kentucky',       cities: ['Louisville', 'Lexington'] },
  { state: 'Louisiana',      cities: ['New Orleans', 'Baton Rouge'] },
  { state: 'Maine',          cities: ['Portland', 'Bangor'] },
  { state: 'Maryland',       cities: ['Baltimore', 'Annapolis'] },
  { state: 'Massachusetts',  cities: ['Boston', 'Worcester'] },
  { state: 'Michigan',       cities: ['Detroit', 'Grand Rapids'] },
  { state: 'Minnesota',      cities: ['Minneapolis', 'Saint Paul'] },
  { state: 'Mississippi',    cities: ['Jackson', 'Gulfport'] },
  { state: 'Missouri',       cities: ['Kansas City', 'St. Louis'] },
  { state: 'Montana',        cities: ['Billings', 'Missoula'] },
  { state: 'Nebraska',       cities: ['Omaha', 'Lincoln'] },
  { state: 'Nevada',         cities: ['Las Vegas', 'Reno'] },
  { state: 'New Hampshire',  cities: ['Manchester', 'Concord'] },
  { state: 'New Jersey',     cities: ['Newark', 'Jersey City'] },
  { state: 'New Mexico',     cities: ['Albuquerque', 'Santa Fe'] },
  { state: 'New York',       cities: ['New York City', 'Buffalo'] },
  { state: 'North Carolina', cities: ['Charlotte', 'Raleigh'] },
  { state: 'North Dakota',   cities: ['Fargo', 'Bismarck'] },
  { state: 'Ohio',           cities: ['Columbus', 'Cleveland'] },
  { state: 'Oklahoma',       cities: ['Oklahoma City', 'Tulsa'] },
  { state: 'Oregon',         cities: ['Portland', 'Eugene'] },
  { state: 'Pennsylvania',   cities: ['Philadelphia', 'Pittsburgh'] },
  { state: 'Rhode Island',   cities: ['Providence', 'Warwick'] },
  { state: 'South Carolina', cities: ['Charleston', 'Columbia'] },
  { state: 'South Dakota',   cities: ['Sioux Falls', 'Rapid City'] },
  { state: 'Tennessee',      cities: ['Nashville', 'Memphis'] },
  { state: 'Texas',          cities: ['Houston', 'Dallas'] },
  { state: 'Utah',           cities: ['Salt Lake City', 'Provo'] },
  { state: 'Vermont',        cities: ['Burlington', 'Montpelier'] },
  { state: 'Virginia',       cities: ['Virginia Beach', 'Richmond'] },
  { state: 'Washington',     cities: ['Seattle', 'Spokane'] },
  { state: 'West Virginia',  cities: ['Charleston', 'Huntington'] },
  { state: 'Wisconsin',      cities: ['Milwaukee', 'Madison'] },
  { state: 'Wyoming',        cities: ['Cheyenne', 'Casper'] },
  { state: 'District of Columbia', cities: ['Washington'] },
];

// Country presets — pick with --country-preset <name>. Each entry mirrors the
// US shape: { state/region/province, cities[] } so the rest of the pipeline
// (hq_state, hq_city, hq_country) just works.
const COUNTRY_PRESETS = {
  india: {
    country: 'India',
    region:  'IN',
    states: [
      { state: 'Maharashtra',     cities: ['Mumbai', 'Pune'] },
      { state: 'Karnataka',       cities: ['Bengaluru', 'Mysuru'] },
      { state: 'Tamil Nadu',      cities: ['Chennai', 'Coimbatore'] },
      { state: 'Delhi',           cities: ['New Delhi'] },
      { state: 'Telangana',       cities: ['Hyderabad'] },
      { state: 'West Bengal',     cities: ['Kolkata'] },
      { state: 'Gujarat',         cities: ['Ahmedabad', 'Surat'] },
      { state: 'Rajasthan',       cities: ['Jaipur', 'Jodhpur'] },
      { state: 'Uttar Pradesh',   cities: ['Lucknow', 'Noida'] },
      { state: 'Kerala',          cities: ['Kochi', 'Thiruvananthapuram'] },
      { state: 'Punjab',          cities: ['Chandigarh', 'Ludhiana'] },
      { state: 'Haryana',         cities: ['Gurugram', 'Faridabad'] },
      { state: 'Madhya Pradesh',  cities: ['Bhopal', 'Indore'] },
      { state: 'Andhra Pradesh',  cities: ['Visakhapatnam', 'Vijayawada'] },
      { state: 'Odisha',          cities: ['Bhubaneswar'] },
      { state: 'Bihar',           cities: ['Patna'] },
      { state: 'Assam',           cities: ['Guwahati'] },
      { state: 'Goa',             cities: ['Panaji'] },
      { state: 'Chhattisgarh',    cities: ['Raipur'] },
      { state: 'Jharkhand',       cities: ['Ranchi'] },
    ],
  },
  uk: {
    country: 'United Kingdom',
    region:  'GB',
    states: [
      { state: 'England',          cities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol'] },
      { state: 'Scotland',         cities: ['Edinburgh', 'Glasgow'] },
      { state: 'Wales',            cities: ['Cardiff', 'Swansea'] },
      { state: 'Northern Ireland', cities: ['Belfast'] },
    ],
  },
  canada: {
    country: 'Canada',
    region:  'CA',
    states: [
      { state: 'Ontario',                   cities: ['Toronto', 'Ottawa', 'Mississauga'] },
      { state: 'Quebec',                    cities: ['Montreal', 'Quebec City'] },
      { state: 'British Columbia',          cities: ['Vancouver', 'Victoria'] },
      { state: 'Alberta',                   cities: ['Calgary', 'Edmonton'] },
      { state: 'Manitoba',                  cities: ['Winnipeg'] },
      { state: 'Saskatchewan',              cities: ['Saskatoon', 'Regina'] },
      { state: 'Nova Scotia',               cities: ['Halifax'] },
      { state: 'New Brunswick',             cities: ['Fredericton'] },
      { state: 'Newfoundland and Labrador', cities: ["St. John's"] },
      { state: 'Prince Edward Island',      cities: ['Charlottetown'] },
    ],
  },
  australia: {
    country: 'Australia',
    region:  'AU',
    states: [
      { state: 'New South Wales',              cities: ['Sydney', 'Newcastle'] },
      { state: 'Victoria',                     cities: ['Melbourne', 'Geelong'] },
      { state: 'Queensland',                   cities: ['Brisbane', 'Gold Coast'] },
      { state: 'Western Australia',            cities: ['Perth'] },
      { state: 'South Australia',              cities: ['Adelaide'] },
      { state: 'Tasmania',                     cities: ['Hobart'] },
      { state: 'Australian Capital Territory', cities: ['Canberra'] },
      { state: 'Northern Territory',           cities: ['Darwin'] },
    ],
  },
  uae: {
    country: 'United Arab Emirates',
    region:  'AE',
    states: [
      { state: 'Dubai',           cities: ['Dubai'] },
      { state: 'Abu Dhabi',       cities: ['Abu Dhabi', 'Al Ain'] },
      { state: 'Sharjah',         cities: ['Sharjah'] },
      { state: 'Ajman',           cities: ['Ajman'] },
      { state: 'Ras Al Khaimah',  cities: ['Ras Al Khaimah'] },
      { state: 'Fujairah',        cities: ['Fujairah'] },
      { state: 'Umm Al Quwain',   cities: ['Umm Al Quwain'] },
    ],
  },
};

// ─── ARGS ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const DRY_RUN      = args.includes('--dry-run');
const LIMIT        = parseInt(args[args.indexOf('--limit') + 1] || '50', 10);
const ONLY_SLUG    = args.includes('--category') ? args[args.indexOf('--category') + 1] : null;
const POPULAR_FIRST = args.includes('--popular');

// Optional location override — when --state/--city is set, search only that location.
// Use with --category to seed a specific category in a specific place.
//   node bulk-import-companies.cjs --category defense-aerospace --state Alabama --city Huntsville
const ARG_STATE   = args.includes('--state')   ? args[args.indexOf('--state') + 1]   : null;
const ARG_CITY    = args.includes('--city')    ? args[args.indexOf('--city') + 1]    : null;
const ARG_COUNTRY = args.includes('--country') ? args[args.indexOf('--country') + 1] : 'United States';
const ARG_REGION  = args.includes('--region')  ? args[args.indexOf('--region') + 1]  : 'US';

// Location strategy (priority order):
//   --country-preset <name>  → all states+cities for that country (india|uk|canada|australia|uae)
//   --all-us-states          → all 50 US states + DC
//   --state / --city         → one state, one or many cities
const ARG_PRESET = args.includes('--country-preset') ? args[args.indexOf('--country-preset') + 1] : null;
const ALL_US_STATES = args.includes('--all-us-states');
let CUSTOM_LOCATIONS = null;
if (ARG_PRESET) {
  const preset = COUNTRY_PRESETS[ARG_PRESET.toLowerCase()];
  if (!preset) {
    console.error(`❌ Unknown --country-preset "${ARG_PRESET}". Available: ${Object.keys(COUNTRY_PRESETS).join(', ')}`);
    process.exit(1);
  }
  CUSTOM_LOCATIONS = preset.states.flatMap(({ state, cities }) =>
    cities.map((city) => ({ city, country: preset.country, region: preset.region, state })),
  );
} else if (ALL_US_STATES) {
  CUSTOM_LOCATIONS = US_STATE_CITIES.flatMap(({ state, cities }) =>
    cities.map((city) => ({ city, country: 'United States', region: 'US', state })),
  );
} else if (ARG_STATE || ARG_CITY) {
  const cities = (ARG_CITY || ARG_STATE).split(',').map((c) => c.trim()).filter(Boolean);
  CUSTOM_LOCATIONS = cities.map((city) => ({
    city,
    country: ARG_COUNTRY,
    region:  ARG_REGION,
    state:   ARG_STATE || '',
  }));
}

// Hand-picked high-demand category slugs — processed before anything else when --popular is set
const POPULAR_SLUGS = [
  // Business operations
  'accounting-services', 'accounting-firm', 'bookkeeping-services', 'online-bookkeeping',
  'audit-services', 'hr-consulting', 'global-payroll',
  'management-consulting', 'executive-search',

  // Legal & immigration
  'corporate-law', 'contract-law', 'immigration-attorney',
  'corporate-immigration', 'asylum-law',

  // Staffing
  'it-staffing', 'healthcare-staffing', 'accounting-staffing',
  'contract-it-staffing', 'nonprofit-staffing',

  // Real estate & property
  'commercial-real-estate', 'commercial-property-management', 'property-management',
  'commercial-interior-design', 'architecture-design',

  // Health & wellness
  'telemedicine', 'dental-clinics', 'veterinary-clinics',

  // Local high-intent
  'plumbing', 'landscaping-services', 'commercial-moving', 'emergency-plumbing',
  'freight-forwarding', 'photography-videography', 'corporate-event-planning',
];

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

// Places API (New) — text search with all needed fields in one call (no Details round-trip)
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
    'places.types',
  ].join(',');

  const res = await httpsPostJson(
    'https://places.googleapis.com/v1/places:searchText',
    { textQuery: query, regionCode: region, maxResultCount: 20 },
    {
      'X-Goog-Api-Key': GOOGLE_KEY,
      'X-Goog-FieldMask': FIELD_MASK,
    },
  );

  if (res.error) {
    throw new Error(`Places API: ${res.error.status || ''} ${res.error.message || ''}`);
  }

  // Remap to legacy field names the rest of the script expects
  return (res.places || []).map((p) => ({
    place_id: p.id,
    name: p.displayName?.text || '',
    rating: p.rating || 0,
    user_ratings_total: p.userRatingCount || 0,
    website: p.websiteUri || null,
    formatted_phone_number: p.nationalPhoneNumber || p.internationalPhoneNumber || null,
    formatted_address: p.formattedAddress || '',
    types: p.types || [],
  }));
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

async function findExistingAgency(name, city) {
  const { data } = await supabase
    .from('agencies').select('id')
    .ilike('name', name).ilike('hq_city', city)
    .maybeSingle();
  return data || null;
}

async function linkAgencyToCategory(agencyId, categoryId) {
  // onConflict handles the UNIQUE(agency_id, category_id) constraint — no-op on re-insert
  const { error } = await supabase
    .from('agency_categories')
    .upsert({ agency_id: agencyId, category_id: categoryId }, { onConflict: 'agency_id,category_id' });
  return !error;
}

function makeDescription(name, categoryName, city, country) {
  return `${name} is a leading ${categoryName} company based in ${city}, ${country}. They provide professional ${categoryName.toLowerCase()} services to businesses and clients across the region.`;
}

// Pick a logo URL for a company. Skip favicon services (Google's returns a
// generic globe for any unknown domain, which is impossible to detect via
// onError on the client). Always fall back to a clean ui-avatars initials
// avatar so cards render consistently — curators can replace with real logos
// later via the admin / DB.
function pickLogoUrl(name, _website) {
  const initials = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${initials}&background=1A2E4A&color=fff&size=128&bold=true`;
}

// ─── FETCH CATEGORIES THAT NEED MORE COMPANIES ────────────────────────────────

async function fetchAllPaged(table, select, order) {
  const pageSize = 1000;
  let all = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from(table).select(select)
      .order(order).range(from, from + pageSize - 1);
    if (error) throw new Error(`Failed to fetch ${table}: ${error.message}`);
    if (!data?.length) break;
    all = all.concat(data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

async function getCategoriesNeedingCompanies() {
  const categories = await fetchAllPaged('categories', 'id, name, slug', 'name');
  const counts = await fetchAllPaged('agency_categories', 'category_id', 'category_id');

  const countMap = {};
  for (const row of counts) {
    countMap[row.category_id] = (countMap[row.category_id] || 0) + 1;
  }

  const needing = categories.filter((c) => (countMap[c.id] || 0) < TARGET_PER_CATEGORY);

  return { categories, countMap, needing };
}

// ─── QUERY BUILDER ────────────────────────────────────────────────────────────
// Picks a business-noun suffix based on category name pattern, then returns
// up to 4 query variants to try (stops after the first that returns results).

function buildQueryVariants(categoryName, city, country) {
  const raw  = categoryName.trim();
  const name = raw.toLowerCase();

  // Detect category type by keyword signal → pick suffix
  let suffix;
  if (/\b(agency|agencies|marketing|advertising|pr|branding|creative|design|seo|sem)\b/.test(name)) {
    suffix = 'agency';
  } else if (/\b(law|legal|attorney|lawyer|notary|paralegal)\b/.test(name)) {
    suffix = 'law firm';
  } else if (/\b(accounting|audit|tax|bookkeeping|cpa|payroll)\b/.test(name)) {
    suffix = 'firm';
  } else if (/\b(staffing|recruit|recruiting|recruitment|headhunt|employment)\b/.test(name)) {
    suffix = 'agency';
  } else if (/\b(consulting|consultancy|advisor|advisory)\b/.test(name)) {
    suffix = 'consultants';
  } else if (/\b(manufactur|fabricat|assembly|production|plant|foundry|refinery|mill)\b/.test(name)) {
    suffix = 'manufacturer';
  } else if (/\b(supplier|wholesale|distribut|trader|merchant)\b/.test(name)) {
    suffix = 'supplier';
  } else if (/\b(contractor|builder|construction|plumb|electric|roofing|hvac|carpen|masonry|paving)\b/.test(name)) {
    suffix = 'contractor';
  } else if (/\b(hospital|clinic|medical|dental|pharma|healthcare|health care|therapy|veterinary|diagnostic)\b/.test(name)) {
    suffix = 'clinic';
  } else if (/\b(restaurant|cafe|bakery|catering|food|beverage|bar|brewery|winery)\b/.test(name)) {
    suffix = '';
  } else if (/\b(retail|store|shop|boutique|outlet|showroom)\b/.test(name)) {
    suffix = 'store';
  } else if (/\b(software|saas|platform|app|ai |machine learning|cloud|devops|cyber)\b/.test(name)) {
    suffix = 'company';
  } else if (/\b(logistics|shipping|freight|transport|warehous|courier|trucking)\b/.test(name)) {
    suffix = 'company';
  } else if (/\b(school|institute|academy|training|tutor|university|education)\b/.test(name)) {
    suffix = '';
  } else {
    // Default: treat as a product/service sold by a dealer/company
    suffix = 'company';
  }

  // Build variants: most specific first, loosest last
  const loc = `${city} ${country}`;
  const base = suffix ? `${raw} ${suffix}` : raw;

  const variants = [
    `${base} in ${loc}`,
    `best ${base} in ${loc}`,
    `${raw} services in ${loc}`,
    `top ${raw} in ${loc}`,
  ];

  // Dedupe in case default suffix created duplicates
  return [...new Set(variants)];
}

// ─── IMPORT ONE CATEGORY ──────────────────────────────────────────────────────

async function importCategory(category, currentCount) {
  const searchLocations = CUSTOM_LOCATIONS || SEARCH_CITIES;
  // When targeting custom locations, fetch RESULTS_PER_CITY per location instead
  // of capping at TARGET_PER_CATEGORY — otherwise --all-us-states stops at 10.
  const needed = CUSTOM_LOCATIONS
    ? searchLocations.length * RESULTS_PER_CITY
    : TARGET_PER_CATEGORY - currentCount;
  console.log(`\n📦 [${category.slug}] has ${currentCount} companies — importing up to ${needed} more across ${searchLocations.length} location(s)`);

  let totalImported = 0;

  for (const { city, country, state, region } of searchLocations) {
    if (totalImported >= needed) break;

    const variants = buildQueryVariants(category.name, city, country);
    let places = [];
    let used = null;

    for (const q of variants) {
      try {
        places = await searchPlaces(q, region);
        await sleep(300);
      } catch (err) {
        console.log(`   ⚠️  "${q}" failed: ${err.message}`);
        continue;
      }
      if (places.length) { used = q; break; }
    }

    console.log(`   🔍 ${used ? `Matched: "${used}"` : `No match across ${variants.length} variants`}`);

    if (!places.length) continue;

    const candidates = places.slice(0, RESULTS_PER_CITY);

    for (const place of candidates) {
      if (totalImported >= needed) break;

      const name = place.name;

      if (DRY_RUN) {
        console.log(`   [DRY RUN] Would import: ${name} (${city}, ${country})`);
        totalImported++;
        continue;
      }

      // If agency already exists, just add a category link (upsert is idempotent)
      const existing = await findExistingAgency(name, city);
      if (existing) {
        const linked = await linkAgencyToCategory(existing.id, category.id);
        console.log(`   🔗 Linked existing: ${name} → ${category.slug}${linked ? '' : ' (link failed)'}`);
        totalImported++;
        continue;
      }

      const slug = await generateSlug(name);

      const { data: agency, error: insertErr } = await supabase
        .from('agencies')
        .insert({
          name,
          slug,
          description: makeDescription(name, category.name, city, country),
          website: place.website || null,
          logo_url: pickLogoUrl(name, place.website),
          phone: place.formatted_phone_number || null,
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

      await linkAgencyToCategory(agency.id, category.id);

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

  // If --category flag is set, only process those (comma-separated allowed)
  let toProcess;
  if (ONLY_SLUG) {
    // When targeting a specific location, bypass the global "needs more" filter —
    // a category may already have 10+ globally but 0 in the requested state/city.
    const pool = CUSTOM_LOCATIONS ? categories : needing;
    const slugs = ONLY_SLUG.split(',').map((s) => s.trim()).filter(Boolean);
    toProcess = pool.filter((c) => slugs.includes(c.slug));
  } else if (POPULAR_FIRST) {
    // Sort: curated popular slugs first (in list order), then everything else alphabetically
    const prioritySet = new Map(POPULAR_SLUGS.map((s, i) => [s, i]));
    const sorted = [...needing].sort((a, b) => {
      const ai = prioritySet.has(a.slug) ? prioritySet.get(a.slug) : Infinity;
      const bi = prioritySet.has(b.slug) ? prioritySet.get(b.slug) : Infinity;
      if (ai !== bi) return ai - bi;
      return a.name.localeCompare(b.name);
    });
    toProcess = sorted.slice(0, LIMIT);
    const prioritized = toProcess.filter((c) => prioritySet.has(c.slug)).length;
    console.log(`⭐ --popular mode: ${prioritized} curated popular categories queued first`);
  } else {
    toProcess = needing.slice(0, LIMIT);
  }

  if (ONLY_SLUG && !toProcess.length) {
    const slugs = ONLY_SLUG.split(',').map((s) => s.trim()).filter(Boolean);
    for (const slug of slugs) {
      const found = categories.find((c) => c.slug === slug);
      if (found) {
        console.log(`✅ Category "${slug}" already has ${countMap[found.id] || 0} companies (>= ${TARGET_PER_CATEGORY})`);
      } else {
        console.log(`❌ Category "${slug}" not found in database`);
      }
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
