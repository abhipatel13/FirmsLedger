/**
 * Reusable manufacturer importer from Thomasnet.
 *
 * Usage (from JSON file — recommended):
 *   node scripts/import-manufacturers.cjs --industry=switchgear --state=california --input-file=scripts/data/switchgear-california.json
 *
 * Usage (live Thomasnet scrape — requires unblocked network):
 *   node scripts/import-manufacturers.cjs --industry=switchgear --state=california
 *
 * JSON input file format (array of company objects):
 *   [
 *     {
 *       "name": "Acme Switchgear",
 *       "website": "https://acmeswitchgear.com",
 *       "city": "Los Angeles",
 *       "phone": "213-555-0100",
 *       "description": "...",
 *       "source_url": "https://www.thomasnet.com/..."
 *     },
 *     ...
 *   ]
 *
 * All args:
 *   --industry    Category slug (required) e.g. switchgear, solar-panels, cnc-machining
 *   --state       US state slug, e.g. "california" (required)
 *   --input-file  Path to JSON file with pre-collected company data
 *   --source      Data source label (default: "thomasnet")
 *   --limit       Max companies to import per run (default: unlimited)
 *   --dry-run     Print data without inserting
 */
'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const https = require('https');
const http  = require('http');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

// ── Arg parsing ───────────────────────────────────────────────────────────────

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    const [key, val] = arg.replace(/^--/, '').split('=');
    args[key] = val ?? true;
  });
  return args;
}

// ── Slug helpers ──────────────────────────────────────────────────────────────

function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function uniqueSlug(base, existing) {
  let slug = base;
  let i = 2;
  while (existing.has(slug)) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

// ── HTTP fetch (no external deps) ─────────────────────────────────────────────

function fetchUrl(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const maxRedirects = opts.maxRedirects ?? 5;
    let redirectCount = 0;

    function request(currentUrl) {
      const lib = currentUrl.startsWith('https') ? https : http;
      const req = lib.get(
        currentUrl,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (compatible; FirmsLedger/1.0; +https://firmsledger.com)',
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          timeout: opts.timeout ?? 15000,
        },
        (res) => {
          // Follow redirects
          if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
            if (redirectCount++ >= maxRedirects) {
              return reject(new Error(`Too many redirects for ${url}`));
            }
            const next = new URL(res.headers.location, currentUrl).href;
            res.resume();
            return request(next);
          }

          if (res.statusCode !== 200) {
            res.resume();
            return reject(new Error(`HTTP ${res.statusCode} for ${currentUrl}`));
          }

          const chunks = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
          res.on('error', reject);
        }
      );
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Timeout fetching ${currentUrl}`));
      });
    }

    request(url);
  });
}

// ── Thomasnet scraper ─────────────────────────────────────────────────────────

/**
 * Maps our state slugs to Thomasnet region/state URL segments.
 * Thomasnet uses multi-word names like "northern-california", "southern-california",
 * or just the state name. We use their /suppliers/{state}/{all-cities}/{product} pattern.
 */
const STATE_TO_THOMASNET = {
  california:     ['northern-california', 'southern-california'],
  texas:          ['texas'],
  'new-york':     ['new-york'],
  florida:        ['florida'],
  illinois:       ['illinois'],
  ohio:           ['ohio'],
  pennsylvania:   ['pennsylvania'],
  michigan:       ['michigan'],
  georgia:        ['georgia'],
  washington:     ['washington'],
  massachusetts:  ['massachusetts'],
  arizona:        ['arizona'],
  indiana:        ['indiana'],
  tennessee:      ['tennessee'],
  'north-carolina': ['north-carolina'],
  wisconsin:      ['wisconsin'],
  colorado:       ['colorado'],
  minnesota:      ['minnesota'],
  oregon:         ['oregon'],
  'new-jersey':   ['new-jersey'],
  connecticut:    ['connecticut'],
};

/**
 * Maps our industry/category slugs to Thomasnet product search keywords.
 */
const INDUSTRY_TO_THOMASNET_KEYWORD = {
  'switchgear':              'switchgear',
  'solar-panels':            'solar-panels',
  'electrical-wire-cable':   'electrical-wire',
  'semiconductor-chips':     'semiconductors',
  'cnc-machining':           'cnc-machining',
};

/**
 * Scrape a single Thomasnet suppliers listing page.
 * Returns array of raw company objects.
 */
async function scrapeThomasnetPage(url) {
  let html;
  try {
    html = await fetchUrl(url);
  } catch (err) {
    console.warn(`  [warn] Could not fetch ${url}: ${err.message}`);
    return [];
  }

  const companies = [];

  // Thomasnet embeds supplier data in JSON-LD or structured HTML.
  // We extract from the supplier card HTML blocks.
  // Pattern: <div class="profile-card ... " ...> contains name, location, URL

  // Extract JSON-LD blocks (most reliable)
  const jsonLdMatches = html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of jsonLdMatches) {
    try {
      const data = JSON.parse(match[1]);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item['@type'] === 'LocalBusiness' || item['@type'] === 'Organization') {
          const co = {
            name:        item.name || '',
            website:     item.url || item.sameAs || '',
            phone:       item.telephone || '',
            address:     extractAddress(item.address),
            city:        item.address?.addressLocality || '',
            description: item.description || '',
            source_url:  url,
          };
          if (co.name) companies.push(co);
        }
      }
    } catch (_) {
      // skip malformed JSON-LD
    }
  }

  // Fallback: extract from supplier card HTML
  if (companies.length === 0) {
    const cardPattern = /class="[^"]*profile-card[^"]*"[\s\S]*?(?=class="[^"]*profile-card[^"]*"|$)/gi;
    const cards = [...html.matchAll(cardPattern)];

    for (const card of cards) {
      const cardHtml = card[0];

      const name    = extractHtmlText(cardHtml, /<h2[^>]*>(.*?)<\/h2>/i) ||
                      extractHtmlText(cardHtml, /class="[^"]*company-name[^"]*"[^>]*>(.*?)<\//i);
      const website = extractAttr(cardHtml, /href="(https?:\/\/[^"]+)"/i);
      const phone   = extractHtmlText(cardHtml, /class="[^"]*phone[^"]*"[^>]*>(.*?)<\//i);
      const city    = extractHtmlText(cardHtml, /class="[^"]*city[^"]*"[^>]*>(.*?)<\//i) ||
                      extractHtmlText(cardHtml, /class="[^"]*location[^"]*"[^>]*>(.*?)<\//i);
      const desc    = extractHtmlText(cardHtml, /class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\//i);

      if (name) {
        companies.push({ name: cleanText(name), website: website || '', phone: cleanText(phone), city: cleanText(city), description: cleanText(desc), source_url: url });
      }
    }
  }

  // Also try extracting from Next.js __NEXT_DATA__ (Thomasnet uses Next.js)
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (nextDataMatch && companies.length === 0) {
    try {
      const nextData = JSON.parse(nextDataMatch[1]);
      const suppliers = deepFind(nextData, 'suppliers') || deepFind(nextData, 'results') || [];
      for (const s of suppliers) {
        const co = {
          name:        s.name || s.companyName || s.title || '',
          website:     s.website || s.url || s.homepageUrl || '',
          phone:       s.phone || s.phoneNumber || '',
          city:        s.city || s.location?.city || '',
          address:     s.address || s.location?.address || '',
          description: s.description || s.summary || '',
          employee_count: s.employeeCount || s.employees || s.employeeRange || '',
          source_url:  url,
        };
        if (co.name) companies.push(co);
      }
    } catch (_) {
      // skip
    }
  }

  return companies;
}

function extractAddress(addr) {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  const parts = [
    addr.streetAddress,
    addr.addressLocality,
    addr.addressRegion,
    addr.postalCode,
  ].filter(Boolean);
  return parts.join(', ');
}

function extractHtmlText(html, pattern) {
  const m = html.match(pattern);
  return m ? cleanText(m[1]) : '';
}

function extractAttr(html, pattern) {
  const m = html.match(pattern);
  return m ? m[1] : '';
}

function cleanText(str) {
  if (!str) return '';
  return str.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function deepFind(obj, key) {
  if (!obj || typeof obj !== 'object') return null;
  if (key in obj) return obj[key];
  for (const v of Object.values(obj)) {
    const result = deepFind(v, key);
    if (result) return result;
  }
  return null;
}

// ── Official website enrichment ───────────────────────────────────────────────

/**
 * Visit a company's official website and extract enrichment data.
 * Returns an enrichment object merged over the thomasnet data.
 */
async function enrichFromWebsite(company) {
  if (!company.website) return {};

  let html;
  try {
    html = await fetchUrl(company.website, { timeout: 12000 });
  } catch (err) {
    console.warn(`    [enrich] Could not fetch ${company.website}: ${err.message}`);
    return {};
  }

  const enriched = {};

  // Founded year — look for "Founded in YYYY" or "Est. YYYY" or "Since YYYY"
  const foundedMatch =
    html.match(/(?:founded|established|est\.?|since)[^\d]*(\d{4})/i);
  if (foundedMatch) {
    const year = parseInt(foundedMatch[1], 10);
    if (year >= 1800 && year <= new Date().getFullYear()) {
      enriched.founded_year = year;
    }
  }

  // Employee count — look for "XX employees" or "XX-XX employees"
  const empMatch = html.match(/(\d[\d,]*(?:\s*[-–]\s*\d[\d,]*)?)\s*(?:employees|team members|professionals)/i);
  if (empMatch) enriched.employee_count = empMatch[1].replace(/,/g, '').trim();

  // Description — prefer meta description over page content
  const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{20,500})["']/i) ||
                   html.match(/<meta[^>]+content=["']([^"']{20,500})["'][^>]+name=["']description["']/i);
  if (metaDesc) enriched.description = metaDesc[1].trim();

  // Certifications — scan for known cert patterns
  const certPatterns = [
    /ISO\s*9001/gi, /ISO\s*14001/gi, /ISO\s*45001/gi, /ISO\s*13485/gi,
    /AS9100/gi, /IATF\s*16949/gi, /UL\s*Listed/gi, /UL\s*Certified/gi,
    /CE\s*(?:Marked|Certified|Listed)/gi, /ROHS/gi, /REACH/gi,
    /NADCAP/gi, /NEMA/gi, /IEEE/gi, /ANSI/gi, /MIL-SPEC/gi,
    /FDA\s*(?:Approved|Registered)/gi, /CSA\s*(?:Certified|Listed)/gi,
  ];
  const certs = new Set();
  for (const pattern of certPatterns) {
    const matches = html.match(pattern);
    if (matches) matches.forEach((m) => certs.add(m.replace(/\s+/g, ' ').trim()));
  }
  if (certs.size > 0) enriched.certifications = [...certs];

  // Products — extract from page title + h1/h2 headings
  const headings = [...html.matchAll(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi)]
    .map((m) => cleanText(m[1]))
    .filter((h) => h.length > 3 && h.length < 120 && !/menu|nav|header|footer|contact/i.test(h));
  if (headings.length > 0) enriched.products = headings.slice(0, 10);

  // Capabilities — look for known manufacturing process keywords
  const capKeywords = [
    'CNC Machining', 'CNC Milling', 'CNC Turning', 'CNC Grinding',
    'Sheet Metal Fabrication', 'Laser Cutting', 'Plasma Cutting', 'Waterjet Cutting',
    'Injection Molding', 'Die Casting', 'Sand Casting', 'Investment Casting',
    'Powder Coating', 'Anodizing', 'Electroplating', 'Heat Treatment',
    'Welding', 'Assembly', 'PCB Assembly', 'Wire Harness Assembly',
    'Switchgear Assembly', 'Panel Building', 'Electrical Assembly',
    'Solar Panel Manufacturing', 'Semiconductor Fabrication',
    'Precision Machining', 'Grinding', 'EDM', 'Turning', 'Milling',
    'Stamping', 'Forging', 'Extrusion', 'Rolling', 'Drawing',
  ];
  const caps = [];
  for (const kw of capKeywords) {
    if (new RegExp(kw, 'i').test(html)) caps.push(kw);
  }
  if (caps.length > 0) enriched.capabilities = caps;

  // Industries served
  const industryKeywords = [
    'Aerospace', 'Defense', 'Automotive', 'Medical', 'Healthcare',
    'Oil & Gas', 'Energy', 'Renewable Energy', 'Solar', 'Wind',
    'Data Centers', 'Telecommunications', 'Semiconductor', 'Electronics',
    'Marine', 'Railway', 'Mining', 'Construction', 'Agriculture',
    'Food & Beverage', 'Pharmaceutical', 'Chemical', 'Petrochemical',
    'Power Generation', 'Utilities', 'Water Treatment',
  ];
  const industries = [];
  for (const kw of industryKeywords) {
    if (new RegExp(`\\b${kw}\\b`, 'i').test(html)) industries.push(kw);
  }
  if (industries.length > 0) enriched.industries_served = industries;

  // LinkedIn
  const linkedInMatch = html.match(/https?:\/\/(?:www\.)?linkedin\.com\/company\/[^"'\s>]+/i);
  if (linkedInMatch) enriched.linkedin_url = linkedInMatch[0].split('?')[0];

  // Logo URL — og:image
  const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                  html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (ogImage && !company.logo_url) enriched.logo_url = ogImage[1];

  // Phone — if not already captured
  if (!company.phone) {
    const phoneMatch = html.match(/(?:\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) enriched.phone = phoneMatch[0];
  }

  return enriched;
}

// ── DB helpers ────────────────────────────────────────────────────────────────

async function getCategoryId(slug) {
  const rows = await sql`SELECT id FROM categories WHERE slug = ${slug} LIMIT 1`;
  return rows[0]?.id ?? null;
}

async function getStateId(slug) {
  const rows = await sql`SELECT id, name FROM states WHERE slug = ${slug} LIMIT 1`;
  return rows[0] ?? null;
}

async function getExistingSlugs() {
  const rows = await sql`SELECT slug FROM companies`;
  return new Set(rows.map((r) => r.slug));
}

async function insertCompany(data, categoryId, dryRun) {
  if (dryRun) {
    console.log(`  [dry-run] Would insert: ${data.name} (${data.hq_city}, ${data.hq_state_label})`);
    return;
  }

  const [row] = await sql`
    INSERT INTO companies (
      name, slug, description, website, logo_url,
      founded_year, employee_count,
      hq_state_id, hq_state_label, hq_city,
      phone, address, country,
      products, industries_served, capabilities,
      certifications, naics_code, linkedin_url,
      contact_email, data_source, source_url,
      approved, is_verified, featured
    ) VALUES (
      ${data.name},
      ${data.slug},
      ${data.description ?? null},
      ${data.website ?? null},
      ${data.logo_url ?? null},
      ${data.founded_year ?? null},
      ${data.employee_count ?? null},
      ${data.hq_state_id ?? null},
      ${data.hq_state_label ?? null},
      ${data.hq_city ?? null},
      ${data.phone ?? null},
      ${data.address ?? null},
      ${'United States'},
      ${data.products ?? null},
      ${data.industries_served ?? null},
      ${data.capabilities ?? null},
      ${data.certifications ?? null},
      ${data.naics_code ?? null},
      ${data.linkedin_url ?? null},
      ${data.contact_email ?? null},
      ${data.data_source ?? 'thomasnet'},
      ${data.source_url ?? null},
      ${false},
      ${false},
      ${false}
    )
    RETURNING id
  `;

  if (categoryId) {
    await sql`
      INSERT INTO company_categories (company_id, category_id)
      VALUES (${row.id}, ${categoryId})
      ON CONFLICT DO NOTHING
    `;
  }

  return row.id;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();

  if (!args.industry || !args.state) {
    console.error('Usage: node scripts/import-manufacturers.cjs --industry=switchgear --state=california [--input-file=path/to/data.json]');
    process.exit(1);
  }

  const industrySlug = args.industry;
  const stateSlug    = args.state;
  const source       = args.source || 'thomasnet';
  const limit        = args.limit ? parseInt(args.limit, 10) : Infinity;
  const dryRun       = args['dry-run'] === true || args['dry-run'] === 'true';
  const inputFile    = args['input-file'];

  console.log(`\nImporter starting`);
  console.log(`  industry   : ${industrySlug}`);
  console.log(`  state      : ${stateSlug}`);
  console.log(`  source     : ${source}`);
  console.log(`  input-file : ${inputFile || '(live scrape)'}`);
  console.log(`  limit      : ${limit === Infinity ? 'none' : limit}`);
  console.log(`  dry-run    : ${dryRun}\n`);

  // Resolve state
  const stateRow = await getStateId(stateSlug);
  if (!stateRow) {
    console.error(`State not found in DB: ${stateSlug}`);
    process.exit(1);
  }

  // Resolve category
  const categoryId = await getCategoryId(industrySlug);
  if (!categoryId) {
    console.warn(`Category not found for slug "${industrySlug}" — companies will be inserted without a category link.`);
  }

  // Load existing slugs to avoid duplicates
  const existingSlugs = await getExistingSlugs();

  let rawCompanies = [];

  // ── Mode 1: JSON input file ─────────────────────────────────────────────────
  if (inputFile) {
    const fs = require('fs');
    const filePath = require('path').resolve(inputFile);
    if (!fs.existsSync(filePath)) {
      console.error(`Input file not found: ${filePath}`);
      process.exit(1);
    }
    rawCompanies = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`Loaded ${rawCompanies.length} companies from ${inputFile}`);

  // ── Mode 2: Live Thomasnet scrape ───────────────────────────────────────────
  } else {
    const thomasnetRegions = STATE_TO_THOMASNET[stateSlug];
    if (!thomasnetRegions) {
      console.error(`No Thomasnet region mapping for state: ${stateSlug}`);
      process.exit(1);
    }
    const keyword = INDUSTRY_TO_THOMASNET_KEYWORD[industrySlug] || industrySlug;

    for (const region of thomasnetRegions) {
      for (let page = 1; page <= 5; page++) {
        const pageParam = page > 1 ? `-${page}` : '';
        const thomasnetUrl = `https://www.thomasnet.com/suppliers/${region}/all-cities/${keyword}${pageParam}.html`;
        console.log(`Fetching: ${thomasnetUrl}`);
        const batch = await scrapeThomasnetPage(thomasnetUrl);
        console.log(`  Found ${batch.length} companies on page ${page}`);
        if (batch.length === 0) break;
        rawCompanies.push(...batch);
      }
    }
    console.log(`Total from Thomasnet: ${rawCompanies.length} companies`);
  }

  // ── Process each company ────────────────────────────────────────────────────
  let totalInserted = 0;
  let totalSkipped  = 0;

  for (const co of rawCompanies) {
    if (totalInserted >= limit) break;

    if (!co.name || co.name.length < 2) { totalSkipped++; continue; }

    const baseSlug = slugify(co.name);
    if (!baseSlug) { totalSkipped++; continue; }

    const slug = uniqueSlug(baseSlug, existingSlugs);
    existingSlugs.add(slug);

    // Enrich from official website
    console.log(`\nProcessing: ${co.name}`);
    if (co.website) console.log(`  website: ${co.website}`);
    const enriched = co.website ? await enrichFromWebsite(co) : {};

    const data = {
      name:              co.name,
      slug,
      description:       enriched.description || co.description || null,
      website:           co.website || null,
      logo_url:          enriched.logo_url || co.logo_url || null,
      founded_year:      enriched.founded_year || co.founded_year || null,
      employee_count:    enriched.employee_count || co.employee_count || null,
      hq_state_id:       stateRow.id,
      hq_state_label:    stateRow.name,
      hq_city:           co.city || co.hq_city || null,
      phone:             enriched.phone || co.phone || null,
      address:           co.address || null,
      products:          enriched.products?.length ? enriched.products : (co.products?.length ? co.products : null),
      industries_served: enriched.industries_served?.length ? enriched.industries_served : (co.industries_served?.length ? co.industries_served : null),
      capabilities:      enriched.capabilities?.length ? enriched.capabilities : (co.capabilities?.length ? co.capabilities : null),
      certifications:    enriched.certifications?.length ? enriched.certifications : (co.certifications?.length ? co.certifications : null),
      naics_code:        co.naics_code || null,
      linkedin_url:      enriched.linkedin_url || co.linkedin_url || null,
      contact_email:     co.contact_email || null,
      data_source:       source,
      source_url:        co.source_url || null,
    };

    try {
      await insertCompany(data, categoryId, dryRun);
      totalInserted++;
      console.log(`  [${totalInserted}] ${dryRun ? 'Would insert' : 'Inserted'}: ${data.name} — ${data.hq_city}, ${data.hq_state_label}`);
    } catch (err) {
      console.warn(`  [skip] ${co.name}: ${err.message}`);
      totalSkipped++;
    }

    // Polite delay between website requests
    if (co.website) await sleep(1200);
  }

  console.log(`\nImport complete.`);
  console.log(`  Inserted : ${totalInserted}`);
  console.log(`  Skipped  : ${totalSkipped}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
