/**
 * FirmsLedger — Thomasnet Puppeteer Scraper
 *
 * Scrapes Thomasnet supplier listing pages using a real browser,
 * extracts company data, and writes JSON files to scripts/data/.
 * Those JSON files are then imported via import-manufacturers.cjs.
 *
 * Usage:
 *   node scripts/scrape-thomasnet-pup.cjs --category=switchgear --state=california
 *   node scripts/scrape-thomasnet-pup.cjs --category=solar-panels --state=texas --max-pages=5
 *   node scripts/scrape-thomasnet-pup.cjs --category=cnc-machining --state=new-york --headless=false
 *
 * Outputs:
 *   scripts/data/{category}-{state}.json  — array of company objects
 */

'use strict';

const fs      = require('fs');
const path    = require('path');
const puppeteer = require('puppeteer');

// ─── ARG PARSING ──────────────────────────────────────────────────────────────

const ARGV = {};
process.argv.slice(2).forEach(arg => {
  const [k, v] = arg.replace(/^--/, '').split('=');
  ARGV[k] = v ?? true;
});

const CATEGORY  = ARGV.category;
const STATE_SLUG = ARGV.state;
const MAX_PAGES = parseInt(ARGV['max-pages'] || '5', 10);
const HEADLESS  = ARGV.headless !== 'false';
const OUT_DIR   = path.join(__dirname, 'data');

if (!CATEGORY || !STATE_SLUG) {
  console.error('Usage: node scripts/scrape-thomasnet-pup.cjs --category=switchgear --state=california');
  process.exit(1);
}

// ─── MAPPINGS ─────────────────────────────────────────────────────────────────

// Thomasnet region slugs for each US state (some states split into sub-regions)
const STATE_TO_REGIONS = {
  'california':  ['northern-california', 'southern-california'],
  'texas':       ['texas'],
  'new-york':    ['new-york'],
  'florida':     ['florida'],
  'illinois':    ['illinois'],
  'ohio':        ['ohio'],
  'michigan':    ['michigan'],
  'pennsylvania': ['pennsylvania'],
  'georgia':     ['georgia'],
  'washington':  ['washington'],
  'massachusetts': ['massachusetts'],
  'arizona':     ['arizona'],
  'indiana':     ['indiana'],
  'tennessee':   ['tennessee'],
  'north-carolina': ['north-carolina'],
  'wisconsin':   ['wisconsin'],
  'colorado':    ['colorado'],
  'minnesota':   ['minnesota'],
  'oregon':      ['oregon'],
  'new-jersey':  ['new-jersey'],
  'connecticut': ['connecticut'],
};

// Thomasnet keyword for each category slug
const CATEGORY_TO_KEYWORD = {
  'switchgear':             'switchgear',
  'solar-panels':           'solar-panels',
  'electrical-wire-cable':  'electrical-wire',
  'semiconductor-chips':    'semiconductors',
  'cnc-machining':          'cnc-machining',
};

// State name for nsearch fallback URL
const STATE_SLUG_TO_NAME = {
  'california': 'California',
  'texas': 'Texas',
  'new-york': 'New+York',
  'florida': 'Florida',
  'illinois': 'Illinois',
  'ohio': 'Ohio',
  'michigan': 'Michigan',
  'pennsylvania': 'Pennsylvania',
  'georgia': 'Georgia',
  'washington': 'Washington',
  'massachusetts': 'Massachusetts',
  'arizona': 'Arizona',
  'indiana': 'Indiana',
  'tennessee': 'Tennessee',
  'north-carolina': 'North+Carolina',
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function cleanText(str) {
  return (str || '').replace(/\s+/g, ' ').trim();
}

function extractPhone(text) {
  const m = (text || '').match(/(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
  return m ? m[0].replace(/\s+/g, ' ').trim() : null;
}

// ─── BROWSER SETUP ────────────────────────────────────────────────────────────

async function launchBrowser() {
  return puppeteer.launch({
    headless: HEADLESS,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--window-size=1280,900',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
    defaultViewport: { width: 1280, height: 900 },
  });
}

async function setupPage(browser) {
  const page = await browser.newPage();

  // Mask automation
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    window.chrome = { runtime: {} };
  });

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  );

  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Upgrade-Insecure-Requests': '1',
  });

  // Block heavy resources to speed things up
  await page.setRequestInterception(true);
  page.on('request', req => {
    const rt = req.resourceType();
    if (['font', 'media'].includes(rt)) {
      req.abort();
    } else if (rt === 'script' && /google-analytics|gtm|hotjar|segment\.io|datadome/.test(req.url())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  return page;
}

// ─── DATA EXTRACTION ──────────────────────────────────────────────────────────

/**
 * Extract companies from a loaded Thomasnet page.
 * Tries multiple strategies in order of reliability.
 */
async function extractCompaniesFromPage(page, pageUrl) {
  const companies = [];

  // Strategy 1: __NEXT_DATA__ (most reliable — Thomasnet uses Next.js)
  try {
    const nextData = await page.evaluate(() => {
      const el = document.getElementById('__NEXT_DATA__');
      return el ? JSON.parse(el.textContent) : null;
    });

    if (nextData) {
      const extracted = extractFromNextData(nextData, pageUrl);
      if (extracted.length > 0) {
        console.log(`    [__NEXT_DATA__] Found ${extracted.length} companies`);
        companies.push(...extracted);
      }
    }
  } catch (_) {}

  if (companies.length > 0) return companies;

  // Strategy 2: JSON-LD structured data
  try {
    const jsonLds = await page.evaluate(() => {
      return [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map(el => { try { return JSON.parse(el.textContent); } catch (_) { return null; } })
        .filter(Boolean);
    });

    for (const data of jsonLds) {
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (['Organization', 'LocalBusiness', 'Corporation'].includes(item['@type'])) {
          companies.push({
            name:        item.name || '',
            website:     item.url || item.sameAs || '',
            phone:       item.telephone || '',
            address:     formatJSONLDAddress(item.address),
            city:        item.address?.addressLocality || '',
            description: item.description || '',
            source_url:  pageUrl,
          });
        }
      }
    }
  } catch (_) {}

  if (companies.length > 0) {
    console.log(`    [JSON-LD] Found ${companies.length} companies`);
    return companies;
  }

  // Strategy 3: DOM scraping — profile cards
  try {
    const domCompanies = await page.evaluate((url) => {
      const results = [];

      // Try various card selectors used by Thomasnet over the years
      const selectors = [
        '[data-testid="searchProfileCard"]',
        '[class*="ProfileCard"]',
        '[class*="profile-card"]',
        '[class*="SupplierCard"]',
        '[class*="supplier-card"]',
        '.product-profiles__list-item',
        'li[class*="search-result"]',
        '[class*="CompanyCard"]',
        'article[class*="card"]',
      ];

      for (const sel of selectors) {
        const cards = document.querySelectorAll(sel);
        if (!cards.length) continue;

        cards.forEach(card => {
          const name =
            (card.querySelector('h2')?.textContent?.trim()) ||
            (card.querySelector('h3')?.textContent?.trim()) ||
            (card.querySelector('[class*="name"]')?.textContent?.trim()) ||
            '';
          if (!name || name.length < 2) return;

          const externalLinks = [...card.querySelectorAll('a')]
            .map(a => a.href)
            .filter(h => h && h.startsWith('http') && !h.includes('thomasnet.com'));
          const website = externalLinks[0] || '';

          const thomasLinks = [...card.querySelectorAll('a')]
            .map(a => a.href)
            .filter(h => h && h.includes('thomasnet.com/profile'));
          const thomasUrl = thomasLinks[0] || url;

          const locationEl = card.querySelector('[class*="location"], [class*="city"], [class*="address"]');
          const city = locationEl?.textContent?.trim() || '';

          const descEl = card.querySelector('[class*="description"], [class*="snippet"], p');
          const description = descEl?.textContent?.trim() || '';

          // Phone — scan all text
          const allText = card.textContent || '';
          const phoneMatch = allText.match(/(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
          const phone = phoneMatch ? phoneMatch[0] : '';

          results.push({ name, website, phone, city, description, source_url: thomasUrl });
        });

        if (results.length) break;
      }

      return results;
    }, pageUrl);

    if (domCompanies.length > 0) {
      console.log(`    [DOM] Found ${domCompanies.length} companies`);
      companies.push(...domCompanies);
    }
  } catch (_) {}

  // Strategy 4: Extract all company-name-like h2/h3 headings + nearby links
  if (companies.length === 0) {
    try {
      const headingCompanies = await page.evaluate((url) => {
        const skip = /^(Search Results|Suppliers|Products|Filter|Sort|Home|About|Contact|Menu|Navigation|Related|Advertisement|Sponsored)$/i;
        const results = [];
        document.querySelectorAll('h2, h3').forEach(h => {
          const name = h.textContent?.trim();
          if (!name || name.length < 3 || name.length > 100 || skip.test(name)) return;

          const parent = h.closest('li, article, section, [class]') || h.parentElement;
          const link = parent?.querySelector('a[href^="http"]:not([href*="thomasnet"])');
          const website = link?.href || '';
          const phoneMatch = (parent?.textContent || '').match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);

          results.push({ name, website, phone: phoneMatch?.[0] || '', city: '', description: '', source_url: url });
        });
        return results.slice(0, 30);
      }, pageUrl);

      if (headingCompanies.length > 0) {
        console.log(`    [Headings] Found ${headingCompanies.length} companies`);
        companies.push(...headingCompanies);
      }
    } catch (_) {}
  }

  return companies;
}

function extractFromNextData(nextData, pageUrl) {
  const companies = [];

  function walk(obj) {
    if (!obj || typeof obj !== 'object') return;

    // Look for arrays of suppliers/results
    const listKeys = ['suppliers', 'results', 'profiles', 'companies', 'items', 'listings'];
    for (const key of listKeys) {
      if (Array.isArray(obj[key]) && obj[key].length > 0) {
        const items = obj[key];
        // Check if items look like company data
        if (items[0] && (items[0].name || items[0].companyName || items[0].title)) {
          for (const item of items) {
            const co = {
              name:           item.name || item.companyName || item.title || '',
              website:        item.website || item.homepageUrl || item.url || '',
              phone:          item.phone || item.phoneNumber || item.telephone || '',
              city:           item.city || item.location?.city || item.address?.city || '',
              address:        item.address || (typeof item.location === 'string' ? item.location : '') || '',
              description:    item.description || item.summary || item.snippet || '',
              employee_count: item.employeeCount || item.employees || item.employeeRange || item.employeesNum || '',
              founded_year:   item.foundedYear || item.founded || item.establishedYear || null,
              source_url:     item.url || pageUrl,
            };
            if (co.name) companies.push(co);
          }
          return; // Found what we needed
        }
      }
    }

    // Recurse into nested objects
    for (const val of Object.values(obj)) {
      walk(val);
      if (companies.length > 0) return;
    }
  }

  walk(nextData);
  return companies;
}

function formatJSONLDAddress(addr) {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  return [addr.streetAddress, addr.addressLocality, addr.addressRegion, addr.postalCode]
    .filter(Boolean).join(', ');
}

// ─── PAGE NAVIGATION ──────────────────────────────────────────────────────────

async function scrapeThomasnetUrl(page, url, pageNum) {
  console.log(`    Loading page ${pageNum}: ${url}`);

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
  } catch (err) {
    // networkidle2 timeout is OK — page may still have loaded content
    if (!err.message.includes('Navigation timeout')) {
      console.log(`    ⚠️  Navigation error: ${err.message.slice(0, 80)}`);
      return [];
    }
  }

  // Wait for content or bot-challenge signals
  await sleep(2500 + Math.random() * 2000);

  // Check if we hit a bot challenge / CAPTCHA
  const title = await page.title().catch(() => '');
  const bodyText = await page.evaluate(() => document.body?.textContent?.slice(0, 200) || '').catch(() => '');

  if (/just a moment|attention required|checking your browser|enable javascript|403/i.test(title + bodyText)) {
    console.log(`    ⚠️  Bot challenge detected — waiting 8s and retrying`);
    await sleep(8000);
    // Try scrolling to trigger lazy loads
    await page.evaluate(() => window.scrollBy(0, 400)).catch(() => {});
    await sleep(3000);
  }

  // Dismiss cookie consent if present
  try {
    await page.click(
      '[id*="accept"], button[aria-label*="Accept"], [class*="cookie"] button, #onetrust-accept-btn-handler',
      { timeout: 2000 }
    );
    await sleep(500);
  } catch (_) {}

  // Scroll to trigger lazy-loading
  await page.evaluate(() => window.scrollBy(0, 600)).catch(() => {});
  await sleep(1000);

  return extractCompaniesFromPage(page, url);
}

async function hasNextPage(page) {
  try {
    const found = await page.evaluate(() => {
      const selectors = [
        'a[rel="next"]',
        '[aria-label="Next page"]',
        '[aria-label="Next"]',
        'a[data-testid*="next"]',
        'button[data-testid*="next"]',
        '.pagination__next',
        '[class*="pagination"] a[class*="next"]',
        'a[class*="next-page"]',
      ];
      return selectors.some(sel => {
        const el = document.querySelector(sel);
        return el && !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true';
      });
    });
    return found;
  } catch (_) {
    return false;
  }
}

async function clickNextPage(page) {
  try {
    await page.click('[rel="next"], [aria-label="Next page"], [aria-label="Next"], [class*="pagination"] a[class*="next"]');
    await sleep(3000);
    return true;
  } catch (_) {
    return false;
  }
}

// ─── MAIN SCRAPE ──────────────────────────────────────────────────────────────

async function scrapeCategory(browser, category, stateSlug) {
  const regions  = STATE_TO_REGIONS[stateSlug];
  const keyword  = CATEGORY_TO_KEYWORD[category] || category;
  const stateName = STATE_SLUG_TO_NAME[stateSlug] || stateSlug.replace(/-/g, '+');

  if (!regions) {
    console.error(`No region mapping for state: ${stateSlug}`);
    return [];
  }

  const page = await setupPage(browser);
  const allCompanies = [];
  const seenNames = new Set();

  try {
    // First visit thomasnet homepage to get cookies (reduces bot detection)
    console.log('  Warming up browser on thomasnet.com...');
    await page.goto('https://www.thomasnet.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(2000 + Math.random() * 1000);

    for (const region of regions) {
      console.log(`\n  Region: ${region}`);

      // Build URL list to try (primary + fallback)
      const urlVariants = [
        // Old-style supplier listing (SEO-friendly, often works):
        `https://www.thomasnet.com/suppliers/${region}/all-cities/${keyword}.html`,
        // Search fallback:
        `https://www.thomasnet.com/nsearch.html?cov=NA&what=${encodeURIComponent(keyword.replace(/-/g, ' ') + ' manufacturers')}&where=${stateName}&fs=1`,
      ];

      let regionCompanies = [];

      for (const baseUrl of urlVariants) {
        if (regionCompanies.length > 0) break; // Stop once we have results

        // Scrape with pagination
        for (let pg = 1; pg <= MAX_PAGES; pg++) {
          // Append page number to URL
          let pageUrl;
          if (baseUrl.includes('nsearch')) {
            pageUrl = pg > 1 ? `${baseUrl}&pg=${pg}` : baseUrl;
          } else {
            pageUrl = pg > 1 ? baseUrl.replace('.html', `-${pg}.html`) : baseUrl;
          }

          const batch = await scrapeThomasnetUrl(page, pageUrl, pg);
          console.log(`    Got ${batch.length} companies from page ${pg}`);

          if (batch.length === 0) break; // No more results

          regionCompanies.push(...batch);

          // Check pagination
          if (pg < MAX_PAGES) {
            const hasNext = await hasNextPage(page);
            if (!hasNext) {
              // Try clicking next page button, or increment URL
              const clicked = await clickNextPage(page);
              if (!clicked) break;
              const moreCompanies = await extractCompaniesFromPage(page, pageUrl);
              if (moreCompanies.length === 0) break;
              pg++; // We already advanced manually
            }
          }

          await sleep(2000 + Math.random() * 1500);
        }

        if (regionCompanies.length > 0) {
          console.log(`    ✓ URL variant worked: ${baseUrl.slice(0, 60)}...`);
        }
      }

      // Dedupe by name
      for (const co of regionCompanies) {
        const key = (co.name || '').toLowerCase().trim();
        if (!key || seenNames.has(key)) continue;
        seenNames.add(key);
        allCompanies.push(co);
      }

      await sleep(3000); // Pause between regions
    }
  } finally {
    await page.close();
  }

  return allCompanies;
}

// ─── ENTRY POINT ──────────────────────────────────────────────────────────────

async function main() {
  const regions = STATE_TO_REGIONS[STATE_SLUG];
  const keyword = CATEGORY_TO_KEYWORD[CATEGORY];

  if (!regions) {
    console.error(`Unknown state: ${STATE_SLUG}. Supported: ${Object.keys(STATE_TO_REGIONS).join(', ')}`);
    process.exit(1);
  }
  if (!keyword) {
    console.error(`Unknown category: ${CATEGORY}. Supported: ${Object.keys(CATEGORY_TO_KEYWORD).join(', ')}`);
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const outFile = path.join(OUT_DIR, `${CATEGORY}-${STATE_SLUG}.json`);
  console.log(`🔍 Scraping Thomasnet: category=${CATEGORY} state=${STATE_SLUG}`);
  console.log(`   Keyword : ${keyword}`);
  console.log(`   Regions : ${regions.join(', ')}`);
  console.log(`   Max pages: ${MAX_PAGES}`);
  console.log(`   Output  : ${outFile}\n`);

  const browser = await launchBrowser();

  let companies = [];
  try {
    companies = await scrapeCategory(browser, CATEGORY, STATE_SLUG);
  } finally {
    await browser.close();
  }

  if (companies.length === 0) {
    console.log('\n⚠️  No companies found. This may be due to bot protection.');
    console.log('   Try: --headless=false to see the browser, or provide a JSON file manually.');
    process.exit(0);
  }

  // Save to JSON
  fs.writeFileSync(outFile, JSON.stringify(companies, null, 2), 'utf8');
  console.log(`\n✅ Scraped ${companies.length} companies → ${outFile}`);

  // Print sample
  console.log('\nSample (first 3):');
  companies.slice(0, 3).forEach(co => {
    console.log(`  - ${co.name} | ${co.city} | ${co.website || '(no website)'}`);
  });
}

main().catch(err => {
  console.error('❌ Fatal:', err.message);
  process.exit(1);
});
