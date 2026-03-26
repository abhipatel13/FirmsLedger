/**
 * FirmsLedger — JustDial Scraper
 * Scrapes top 3 companies per category+city from JustDial and saves to Supabase.
 *
 * Setup:
 *   sudo chown -R $(whoami) node_modules
 *   npm install puppeteer --save-dev
 *
 * Usage:
 *   node scripts/scrape-justdial.cjs
 */

// Load .env manually (no dotenv dependency needed)
const fs = require('fs');
const path = require('path');
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

// ─── TARGETS ──────────────────────────────────────────────────────────────────
// jdQuery = what to search on JustDial
// categorySlug = must match your Supabase categories table

const TARGETS = [
  // ── Gujarat ──
  { categorySlug: 'logistics-supply-chain',      jdQuery: 'Logistics Companies',              city: 'Ahmedabad',   state: 'Gujarat',      country: 'India' },
  { categorySlug: 'logistics-supply-chain',      jdQuery: 'Logistics Companies',              city: 'Surat',       state: 'Gujarat',      country: 'India' },
  { categorySlug: 'logistics-supply-chain',      jdQuery: 'Logistics Companies',              city: 'Vadodara',    state: 'Gujarat',      country: 'India' },
  { categorySlug: 'logistics-supply-chain',      jdQuery: 'Logistics Companies',              city: 'Rajkot',      state: 'Gujarat',      country: 'India' },
  { categorySlug: 'it-staffing',                 jdQuery: 'IT Staffing Companies',            city: 'Ahmedabad',   state: 'Gujarat',      country: 'India' },
  { categorySlug: 'it-staffing',                 jdQuery: 'IT Staffing Companies',            city: 'Surat',       state: 'Gujarat',      country: 'India' },
  { categorySlug: 'web-development',             jdQuery: 'Web Development Companies',        city: 'Ahmedabad',   state: 'Gujarat',      country: 'India' },
  { categorySlug: 'web-development',             jdQuery: 'Web Development Companies',        city: 'Surat',       state: 'Gujarat',      country: 'India' },
  { categorySlug: 'solar-panels',                jdQuery: 'Solar Panel Dealers',              city: 'Ahmedabad',   state: 'Gujarat',      country: 'India' },
  { categorySlug: 'solar-panels',                jdQuery: 'Solar Panel Dealers',              city: 'Surat',       state: 'Gujarat',      country: 'India' },
  { categorySlug: 'solar-panels',                jdQuery: 'Solar Panel Dealers',              city: 'Rajkot',      state: 'Gujarat',      country: 'India' },
  { categorySlug: 'freight-forwarding',          jdQuery: 'Freight Forwarding Agents',        city: 'Ahmedabad',   state: 'Gujarat',      country: 'India' },
  { categorySlug: 'accounting-services',         jdQuery: 'Chartered Accountants',            city: 'Ahmedabad',   state: 'Gujarat',      country: 'India' },
  { categorySlug: 'it-staffing',                 jdQuery: 'IT Staffing Companies',            city: 'Gandhinagar', state: 'Gujarat',      country: 'India' },
  { categorySlug: 'mobile-app-development',      jdQuery: 'Mobile App Development Companies', city: 'Ahmedabad',  state: 'Gujarat',      country: 'India' },
  { categorySlug: 'digital-advertising',         jdQuery: 'Digital Marketing Companies',      city: 'Ahmedabad',   state: 'Gujarat',      country: 'India' },
  { categorySlug: 'seo-services',                jdQuery: 'SEO Companies',                    city: 'Ahmedabad',   state: 'Gujarat',      country: 'India' },
  { categorySlug: 'interior-design-services',    jdQuery: 'Interior Designers',               city: 'Ahmedabad',   state: 'Gujarat',      country: 'India' },
  { categorySlug: 'packers-and-movers',          jdQuery: 'Packers and Movers',               city: 'Ahmedabad',   state: 'Gujarat',      country: 'India' },
  { categorySlug: 'packers-and-movers',          jdQuery: 'Packers and Movers',               city: 'Surat',       state: 'Gujarat',      country: 'India' },
  // ── Maharashtra ──
  { categorySlug: 'logistics-supply-chain',      jdQuery: 'Logistics Companies',              city: 'Mumbai',      state: 'Maharashtra',  country: 'India' },
  { categorySlug: 'it-staffing',                 jdQuery: 'IT Staffing Companies',            city: 'Mumbai',      state: 'Maharashtra',  country: 'India' },
  { categorySlug: 'web-development',             jdQuery: 'Web Development Companies',        city: 'Pune',        state: 'Maharashtra',  country: 'India' },
  { categorySlug: 'logistics-supply-chain',      jdQuery: 'Logistics Companies',              city: 'Pune',        state: 'Maharashtra',  country: 'India' },
  { categorySlug: 'digital-advertising',         jdQuery: 'Digital Marketing Companies',      city: 'Mumbai',      state: 'Maharashtra',  country: 'India' },
  // ── Karnataka ──
  { categorySlug: 'it-staffing',                 jdQuery: 'IT Staffing Companies',            city: 'Bangalore',   state: 'Karnataka',    country: 'India' },
  { categorySlug: 'web-development',             jdQuery: 'Web Development Companies',        city: 'Bangalore',   state: 'Karnataka',    country: 'India' },
  { categorySlug: 'digital-advertising',         jdQuery: 'Digital Marketing Companies',      city: 'Bangalore',   state: 'Karnataka',    country: 'India' },
  // ── Delhi ──
  { categorySlug: 'logistics-supply-chain',      jdQuery: 'Logistics Companies',              city: 'Delhi',       state: 'Delhi',        country: 'India' },
  { categorySlug: 'it-staffing',                 jdQuery: 'IT Staffing Companies',            city: 'Delhi',       state: 'Delhi',        country: 'India' },
  { categorySlug: 'packers-and-movers',          jdQuery: 'Packers and Movers',               city: 'Delhi',       state: 'Delhi',        country: 'India' },
  // ── Tamil Nadu ──
  { categorySlug: 'it-staffing',                 jdQuery: 'IT Staffing Companies',            city: 'Chennai',     state: 'Tamil Nadu',   country: 'India' },
  { categorySlug: 'web-development',             jdQuery: 'Web Development Companies',        city: 'Chennai',     state: 'Tamil Nadu',   country: 'India' },
  // ── Telangana ──
  { categorySlug: 'it-staffing',                 jdQuery: 'IT Staffing Companies',            city: 'Hyderabad',   state: 'Telangana',    country: 'India' },
  { categorySlug: 'web-development',             jdQuery: 'Web Development Companies',        city: 'Hyderabad',   state: 'Telangana',    country: 'India' },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

function makeDescription(name, categoryName, city, state, country) {
  return `${name} is a trusted ${categoryName} company based in ${city}, ${state}, ${country}. They offer professional ${categoryName.toLowerCase()} products & services to businesses across the region.`;
}

async function getCategoryId(slug) {
  const { data } = await supabase.from('categories').select('id, name').eq('slug', slug).maybeSingle();
  return data;
}

async function agencyExists(name, city) {
  const { data } = await supabase.from('agencies').select('id').ilike('name', name).ilike('hq_city', city).maybeSingle();
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

async function saveCompany({ name, website, phone, address, rating, reviewCount, categoryId, city, state, country, categoryName }) {
  const exists = await agencyExists(name, city);
  if (exists) { console.log(`   ⏭️  Already exists: ${name}`); return false; }

  const slug = await generateSlug(name);
  const { data: agency, error } = await supabase.from('agencies').insert({
    name,
    slug,
    description: makeDescription(name, categoryName, city, state, country),
    website: website || null,
    contact_email: null,
    hq_city: city,
    hq_state: state,
    hq_country: country,
    avg_rating: rating || 0,
    review_count: reviewCount || 0,
    approved: true,
    verified: false,
    featured: false,
  }).select('id').single();

  if (error) { console.log(`   ❌ Failed: ${name} — ${error.message}`); return false; }

  await supabase.from('agency_categories').insert({ agency_id: agency.id, category_id: categoryId });
  console.log(`   ✅ Saved: ${name} (${rating || 'no rating'}⭐)`);
  return true;
}

// ─── JUSTDIAL SCRAPER ─────────────────────────────────────────────────────────

async function scrapeJustDial(jdQuery, city, maxResults = 3) {
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (e) {
    console.error('❌ Puppeteer not installed. Run: npm install puppeteer --save-dev');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
  });

  const page = await browser.newPage();

  // Mimic real browser
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-IN,en;q=0.9' });

  const url = `https://www.justdial.com/${city}/${jdQuery.replace(/\s+/g, '-')}/`;
  console.log(`   🌐 URL: ${url}`);

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(3000); // Let JS render

    // Extract company data
    const companies = await page.evaluate(() => {
      const results = [];

      // JustDial listing selectors (try multiple)
      const listingSelectors = [
        '.resultbox_info',
        '.jd-listing-resultset li',
        '[data-jd-id]',
        '.rslctn-item',
        '.jsx-contentbox',
      ];

      let items = [];
      for (const sel of listingSelectors) {
        items = document.querySelectorAll(sel);
        if (items.length > 0) break;
      }

      // Scrape ALL results first, then sort by rating
      items = Array.from(items).slice(0, 20);

      for (const item of items) {
        // Name
        const nameEl = item.querySelector(
          '.jd_listing_title a, .resultbox_title_anchor, h2 a, .companyname a, [class*="title"] a, h2, h3'
        );
        const name = nameEl?.textContent?.trim();
        if (!name || name.length < 2) continue;

        // Rating
        const ratingEl = item.querySelector(
          '.green-box, .rating, [class*="rating"], .jd_listing_rating span'
        );
        const ratingText = ratingEl?.textContent?.trim();
        const rating = ratingText ? parseFloat(ratingText) : 0;

        // Reviews count
        const reviewEl = item.querySelector('[class*="review"], [class*="rating_count"]');
        const reviewText = reviewEl?.textContent?.replace(/[^0-9]/g, '');
        const reviewCount = reviewText ? parseInt(reviewText) : 0;

        // Address
        const addressEl = item.querySelector(
          '.jd_listing_address, [class*="address"], .contactinfo'
        );
        const address = addressEl?.textContent?.trim() || '';

        // Website
        const websiteEl = item.querySelector('a[href*="http"]:not([href*="justdial"])');
        const website = websiteEl?.href || null;

        // Phone
        const phoneEl = item.querySelector('[class*="phone"], [class*="number"], .mobilesv');
        const phone = phoneEl?.textContent?.trim() || null;

        results.push({ name, rating, reviewCount, address, website, phone });
      }

      return results;
    });

    // Sort by review count DESC first, then rating DESC
    companies.sort((a, b) => {
      if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
      return b.rating - a.rating;
    });

    // Take top N — no strict filter, just best available
    const top = companies.slice(0, maxResults);

    console.log(`   📊 Found ${companies.length} total → keeping top ${top.length} by reviews`);
    top.forEach(c => console.log(`      ${c.reviewCount} reviews, ${c.rating || 'N/A'}⭐ — ${c.name}`));

    await browser.close();
    return top;

  } catch (err) {
    await browser.close();
    console.log(`   ⚠️  Page error: ${err.message}`);
    return [];
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function processTarget({ categorySlug, jdQuery, city, state, country }) {
  console.log(`\n🔍 ${categorySlug} → ${city}, ${state}`);

  const category = await getCategoryId(categorySlug);
  if (!category) {
    console.log(`   ⚠️  Category not in DB: ${categorySlug}`);
    return;
  }

  const companies = await scrapeJustDial(jdQuery, city, 3);

  if (!companies.length) {
    console.log(`   ⚠️  No results found`);
    return;
  }

  let saved = 0;
  for (const c of companies) {
    const ok = await saveCompany({
      name: c.name,
      website: c.website,
      phone: c.phone,
      address: c.address,
      rating: c.rating,
      reviewCount: c.reviewCount,
      categoryId: category.id,
      categoryName: category.name,
      city, state, country,
    });
    if (ok) saved++;
    await sleep(500);
  }

  console.log(`   📦 ${saved} companies saved for ${categorySlug} in ${city}`);
}

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Supabase env vars missing in .env');
    process.exit(1);
  }

  console.log(`🚀 JustDial Scraper — ${TARGETS.length} targets\n`);

  for (const target of TARGETS) {
    await processTarget(target);
    // Wait 5-8 seconds between requests to avoid being blocked
    const delay = 5000 + Math.random() * 3000;
    console.log(`   ⏳ Waiting ${(delay / 1000).toFixed(1)}s...`);
    await sleep(delay);
  }

  console.log('\n✅ All done!');
}

main().catch(console.error);
