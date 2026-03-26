/**
 * FirmsLedger — Bulk OSM Importer (FREE, GLOBAL)
 *
 * Uses OpenStreetMap Overpass API — completely free, worldwide coverage.
 * Maps FirmsLedger category slugs to OSM tags, then queries major cities
 * across the globe to find matching businesses.
 *
 * No API key needed. No cost. Works for any country.
 *
 * Usage:
 *   node scripts/bulk-import-osm.cjs                  # process 30 categories
 *   node scripts/bulk-import-osm.cjs --limit 100      # process 100 categories
 *   node scripts/bulk-import-osm.cjs --category it-staffing
 *   node scripts/bulk-import-osm.cjs --dry-run
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

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// ─── ARGS ─────────────────────────────────────────────────────────────────────

const args     = process.argv.slice(2);
const DRY_RUN  = args.includes('--dry-run');
const _limitIdx = args.indexOf('--limit');
const LIMIT    = _limitIdx !== -1 ? parseInt(args[_limitIdx + 1], 10) : 30;
const _catIdx  = args.indexOf('--category');
const ONLY_CAT = _catIdx !== -1 ? args[_catIdx + 1] : null;

const TARGET_PER_CATEGORY = 10;
const RESULTS_PER_CITY    = 3;

// ─── GLOBAL CITIES ────────────────────────────────────────────────────────────
// Spread across continents for global coverage

const CITIES = [
  // North America
  { city: 'New York City', state: 'New York',         country: 'United States', bbox: '40.477399,-74.25909,40.916178,-73.700272' },
  { city: 'Los Angeles',   state: 'California',       country: 'United States', bbox: '33.703652,-118.668823,34.337306,-118.155289' },
  { city: 'Toronto',       state: 'Ontario',          country: 'Canada',        bbox: '43.581024,-79.639219,43.855457,-79.115517' },
  // Europe
  { city: 'London',        state: 'England',          country: 'United Kingdom', bbox: '51.2867602,-0.510375,51.6918741,0.334015' },
  { city: 'Berlin',        state: 'Berlin',           country: 'Germany',       bbox: '52.338090,13.088330,52.675454,13.761118' },
  { city: 'Paris',         state: 'Île-de-France',    country: 'France',        bbox: '48.815573,2.224199,48.902145,2.469920' },
  // Asia-Pacific
  { city: 'Mumbai',        state: 'Maharashtra',      country: 'India',         bbox: '18.894070,72.776650,19.268790,72.985886' },
  { city: 'Singapore',     state: '',                 country: 'Singapore',     bbox: '1.166000,103.594000,1.481000,104.100000' },
  { city: 'Sydney',        state: 'New South Wales',  country: 'Australia',     bbox: '-34.118347,150.520929,-33.578141,151.343);' },
  { city: 'Tokyo',         state: 'Tokyo',            country: 'Japan',         bbox: '35.528924,139.390000,35.817732,139.920000' },
  // Middle East & Africa
  { city: 'Dubai',         state: 'Dubai',            country: 'UAE',           bbox: '24.792760,54.890000,25.357844,55.565000' },
  { city: 'Johannesburg',  state: 'Gauteng',          country: 'South Africa',  bbox: '-26.352580,27.892680,-25.993750,28.234490' },
  // Latin America
  { city: 'São Paulo',     state: 'São Paulo',        country: 'Brazil',        bbox: '-23.650490,-46.826100,-23.356110,-46.364510' },
];

// ─── CATEGORY → OSM TAG MAPPING ───────────────────────────────────────────────
// Maps FirmsLedger category slugs to OSM amenity/office/shop tags.
// Overpass searches for nodes/ways with these tags within a bounding box.

const OSM_TAG_MAP = {
  // Staffing & HR
  'it-staffing':             'office=employment_agency',
  'executive-search':        'office=employment_agency',
  'healthcare-staffing':     'office=employment_agency',
  'temporary-staffing':      'office=employment_agency',
  'permanent-staffing':      'office=employment_agency',
  'remote-staffing':         'office=employment_agency',
  'contract-staffing':       'office=employment_agency',
  'hr-recruitment-services': 'office=employment_agency',
  'technical-staffing':      'office=employment_agency',
  'industrial-staffing':     'office=employment_agency',
  // Finance & Legal
  'accounting':              'office=accountant',
  'legal-services':          'office=lawyer',
  'financial-services':      'office=financial',
  'insurance':               'office=insurance',
  'investment-banking':      'office=financial',
  'tax-consulting':          'office=tax_advisor',
  'auditing':                'office=accountant',
  'bookkeeping':             'office=accountant',
  // IT & Tech
  'software-development':    'office=it',
  'web-development':         'office=it',
  'mobile-app-development':  'office=it',
  'cloud-computing':         'office=it',
  'cybersecurity':           'office=it',
  'data-analytics':          'office=it',
  'artificial-intelligence': 'office=it',
  'erp-solutions':           'office=it',
  // Marketing
  'digital-marketing':       'office=company',
  'advertising':             'office=company',
  'seo-services':            'office=it',
  'pr-services':             'office=company',
  // Real Estate
  'real-estate':             'office=estate_agent',
  'property-management':     'office=estate_agent',
  // Healthcare
  'healthcare':              'amenity=hospital',
  'medical-equipment':       'shop=medical_supply',
  'pharmaceuticals':         'amenity=pharmacy',
  // Education
  'education':               'amenity=school',
  'corporate-training':      'amenity=college',
  // Logistics
  'logistics':               'office=logistics',
  'freight':                 'office=logistics',
  'supply-chain':            'office=logistics',
  'warehousing':             'office=logistics',
  // Manufacturing
  'manufacturing':           'industrial=factory',
  'food-beverage':           'shop=supermarket',
  'textiles':                'shop=fabric',
  'chemicals':               'office=company',
  // Construction
  'construction':            'office=construction_company',
  'architecture':            'office=architect',
  'engineering':             'office=engineer',
  // Default fallback
  '_default':                'office=company',
};

function getOsmTag(categorySlug) {
  return OSM_TAG_MAP[categorySlug] || OSM_TAG_MAP['_default'];
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'FirmsLedger/1.0 (directory@firmsledger.com)' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error: ${data.slice(0, 200)}`)); }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Request timeout')); });
  });
}

function makeDescription(name, categoryName, city, state, country) {
  const loc = [city, state, country].filter(Boolean).join(', ');
  return `${name} is a trusted ${categoryName} company based in ${loc}. They offer professional ${categoryName.toLowerCase()} services to businesses across the region.`;
}

// ─── OVERPASS API ─────────────────────────────────────────────────────────────

async function queryOverpass(osmTag, bbox, limit = 10) {
  const [tagKey, tagVal] = osmTag.split('=');

  // Overpass QL query: find nodes and ways with this tag in this bbox
  const query = `
[out:json][timeout:25];
(
  node["${tagKey}"="${tagVal}"](${bbox});
  way["${tagKey}"="${tagVal}"](${bbox});
);
out body center ${limit};
  `.trim();

  const encoded = encodeURIComponent(query);
  const url = `https://overpass-api.de/api/interpreter?data=${encoded}`;

  try {
    const result = await httpsGet(url);
    return result.elements || [];
  } catch (err) {
    // Try the alternative Overpass instance on failure
    try {
      const url2 = `https://overpass.kumi.systems/api/interpreter?data=${encoded}`;
      const result2 = await httpsGet(url2);
      return result2.elements || [];
    } catch {
      return [];
    }
  }
}

function extractFromOsmElement(el) {
  const tags = el.tags || {};
  const name = tags.name || tags['name:en'] || null;
  if (!name || name.length < 2) return null;

  const website = tags.website || tags['contact:website'] || tags.url || null;
  const phone   = tags.phone   || tags['contact:phone']   || tags['contact:mobile'] || null;
  const email   = tags.email   || tags['contact:email']   || null;

  // Skip unnamed or generic entries
  if (/^(office|company|business|building)$/i.test(name)) return null;

  return { name, website, phone, email };
}

// ─── SUPABASE HELPERS ─────────────────────────────────────────────────────────

async function agencyExists(name, city) {
  const { data } = await supabase.from('agencies').select('id')
    .ilike('name', name).ilike('hq_city', city).maybeSingle();
  return !!data;
}

async function generateSlug(name) {
  let base = toSlug(name), slug = base, i = 2;
  while (true) {
    const { data } = await supabase.from('agencies').select('id').eq('slug', slug).maybeSingle();
    if (!data) return slug;
    slug = `${base}-${i++}`;
  }
}

async function saveCompany({ name, website, phone, categoryId, categoryName, city, state, country }) {
  if (await agencyExists(name, city)) {
    console.log(`      ⏭️  Already exists: ${name}`);
    return false;
  }
  const slug = await generateSlug(name);
  const { data: agency, error } = await supabase.from('agencies').insert({
    name, slug,
    description: makeDescription(name, categoryName, city, state, country),
    website: website || null,
    phone:   phone   || null,
    hq_city:    city,
    hq_state:   state   || null,
    hq_country: country || null,
    avg_rating:   0,
    review_count: 0,
    approved: true,
    verified: false,
    featured: false,
  }).select('id').single();

  if (error) { console.log(`      ❌ Failed: ${name} — ${error.message}`); return false; }

  await supabase.from('agency_categories').insert({ agency_id: agency.id, category_id: categoryId });
  console.log(`      ✅ Saved: ${name} (${city}, ${country})`);
  return true;
}

// ─── DB HELPERS ───────────────────────────────────────────────────────────────

async function getCategoriesNeedingCompanies() {
  const { data: categories, error } = await supabase
    .from('categories').select('id, name, slug').order('name');
  if (error) throw new Error(`DB error: ${error.message}`);

  const { data: links } = await supabase
    .from('agency_categories').select('category_id');

  const countMap = {};
  for (const row of links || []) {
    countMap[row.category_id] = (countMap[row.category_id] || 0) + 1;
  }

  const needing = categories.filter(c => (countMap[c.id] || 0) < TARGET_PER_CATEGORY);
  return { categories, countMap, needing };
}

// ─── PROCESS ONE CATEGORY ─────────────────────────────────────────────────────

async function importCategory(category, currentCount) {
  const needed  = TARGET_PER_CATEGORY - currentCount;
  const osmTag  = getOsmTag(category.slug);
  console.log(`\n📦 [${category.slug}] — ${currentCount} companies, need ${needed} more`);
  console.log(`   OSM tag: ${osmTag}`);

  let totalSaved = 0;

  for (const { city, state, country, bbox } of CITIES) {
    if (totalSaved >= needed) break;

    console.log(`   🌐 Querying OSM: ${city}, ${country}...`);

    if (DRY_RUN) {
      console.log(`   [DRY RUN] Would query OSM "${osmTag}" in ${city}`);
      totalSaved += RESULTS_PER_CITY;
      continue;
    }

    // Skip bad bbox entries (typos)
    if (bbox.includes(');')) {
      console.log(`   ⚠️  Skipping ${city} — malformed bbox`);
      continue;
    }

    const elements = await queryOverpass(osmTag, bbox, RESULTS_PER_CITY * 5);
    await sleep(1500); // be polite to Overpass (1 req/sec recommended)

    if (!elements.length) {
      console.log(`   — No OSM results in ${city}`);
      continue;
    }

    const companies = elements
      .map(extractFromOsmElement)
      .filter(Boolean)
      .slice(0, RESULTS_PER_CITY);

    for (const c of companies) {
      if (totalSaved >= needed) break;
      const saved = await saveCompany({
        name:         c.name,
        website:      c.website,
        phone:        c.phone,
        categoryId:   category.id,
        categoryName: category.name,
        city, state, country,
      });
      if (saved) totalSaved++;
      await sleep(300);
    }
  }

  console.log(`   → Added ${totalSaved} companies for [${category.slug}]`);
  return totalSaved;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Supabase env vars missing in .env'); process.exit(1);
  }

  console.log('🚀 Bulk OSM Importer (FREE, GLOBAL)');
  console.log('   Source: OpenStreetMap Overpass API');
  if (DRY_RUN) console.log('   MODE: DRY RUN — nothing will be saved');

  const { categories, countMap, needing } = await getCategoriesNeedingCompanies();
  console.log(`📊 Total categories    : ${categories.length}`);
  console.log(`📊 Need more companies : ${needing.length}`);

  let toProcess = ONLY_CAT
    ? needing.filter(c => c.slug === ONLY_CAT)
    : needing.slice(0, LIMIT);

  if (ONLY_CAT && !toProcess.length) {
    const found = categories.find(c => c.slug === ONLY_CAT);
    if (found) console.log(`✅ "${ONLY_CAT}" already has ${countMap[found.id] || 0} companies`);
    else        console.log(`❌ Category "${ONLY_CAT}" not found`);
    return;
  }

  console.log(`⚙️  Processing ${toProcess.length} categories\n`);

  let totalImported = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const cat   = toProcess[i];
    const added = await importCategory(cat, countMap[cat.id] || 0);
    totalImported += added;
    console.log(`   Progress: ${i + 1}/${toProcess.length} done`);
    await sleep(2000); // gap between categories
  }

  console.log(`\n✅ Done!`);
  console.log(`   Companies imported : ${totalImported}`);
  if (needing.length > LIMIT && !ONLY_CAT) {
    console.log(`   Still remaining   : ${needing.length - LIMIT} categories — run again to continue`);
  }
}

main().catch(console.error);
