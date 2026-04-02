/**
 * FirmsLedger — Universal Site Scraper
 *
 * Crawls an entire website starting from a seed URL.
 * Auto-detects pagination, follows internal links, and extracts structured content.
 * Outputs results to a JSON (and optional CSV) file.
 *
 * Features:
 *   - Auto-pagination detection (next buttons, page numbers, infinite scroll)
 *   - Full-site crawl following internal links up to configurable depth
 *   - Respects robots.txt (optional)
 *   - Rate limiting & concurrency control
 *   - Extracts: title, meta description, headings, text, images, links, tables
 *   - Exports to JSON + CSV
 *
 * Usage:
 *   node scripts/site-scraper.cjs <url> [options]
 *
 * Examples:
 *   node scripts/site-scraper.cjs https://example.com
 *   node scripts/site-scraper.cjs https://example.com --max-pages 50 --depth 3
 *   node scripts/site-scraper.cjs https://example.com --csv --delay 2000
 *   node scripts/site-scraper.cjs https://example.com --selector ".product-card" --follow-pagination
 *   node scripts/site-scraper.cjs https://example.com --mode pagination-only
 *
 * Options:
 *   --max-pages <n>       Max pages to scrape (default: 100)
 *   --depth <n>           Max crawl depth from seed URL (default: 5)
 *   --delay <ms>          Delay between requests in ms (default: 1000)
 *   --concurrency <n>     Parallel pages to scrape (default: 3)
 *   --selector <css>      CSS selector to extract specific elements
 *   --csv                 Also export as CSV
 *   --output <path>       Output file path (default: ./scraped-<domain>-<timestamp>.json)
 *   --follow-pagination   Only follow pagination links, don't crawl entire site
 *   --mode <mode>         "full" (crawl entire site) or "pagination-only" (default: full)
 *   --headless <bool>     Run browser headless (default: true)
 *   --scroll              Enable infinite scroll detection
 *   --respect-robots      Respect robots.txt rules
 *   --include <pattern>   Only crawl URLs matching this regex
 *   --exclude <pattern>   Skip URLs matching this regex
 */

const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// ─── CLI ARGUMENT PARSER ────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  if (!args.length || args[0] === '--help' || args[0] === '-h') {
    console.log(`
  Universal Site Scraper — FirmsLedger

  Usage:  node scripts/site-scraper.cjs <url> [options]

  Options:
    --max-pages <n>       Max pages to scrape (default: 100)
    --depth <n>           Max crawl depth (default: 5)
    --delay <ms>          Delay between requests (default: 1000)
    --concurrency <n>     Parallel page scrapes (default: 3)
    --selector <css>      Extract specific elements via CSS selector
    --csv                 Also export as CSV
    --output <path>       Output file path
    --mode <mode>         "full" or "pagination-only" (default: full)
    --headless <bool>     Browser headless mode (default: true)
    --scroll              Enable infinite scroll detection
    --respect-robots      Respect robots.txt
    --include <regex>     Only crawl matching URLs
    --exclude <regex>     Skip matching URLs
    `);
    process.exit(0);
  }

  const seedUrl = args[0];
  const opts = {
    seedUrl,
    maxPages: 100,
    maxDepth: 5,
    delay: 1000,
    concurrency: 3,
    selector: null,
    csv: false,
    output: null,
    mode: 'full',
    headless: true,
    scroll: false,
    respectRobots: false,
    include: null,
    exclude: null,
  };

  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--max-pages': opts.maxPages = parseInt(args[++i], 10); break;
      case '--depth': opts.maxDepth = parseInt(args[++i], 10); break;
      case '--delay': opts.delay = parseInt(args[++i], 10); break;
      case '--concurrency': opts.concurrency = parseInt(args[++i], 10); break;
      case '--selector': opts.selector = args[++i]; break;
      case '--csv': opts.csv = true; break;
      case '--output': opts.output = args[++i]; break;
      case '--mode': opts.mode = args[++i]; break;
      case '--follow-pagination': opts.mode = 'pagination-only'; break;
      case '--headless': opts.headless = args[++i] !== 'false'; break;
      case '--scroll': opts.scroll = true; break;
      case '--respect-robots': opts.respectRobots = true; break;
      case '--include': opts.include = new RegExp(args[++i]); break;
      case '--exclude': opts.exclude = new RegExp(args[++i]); break;
    }
  }
  return opts;
}

// ─── HELPERS ────────────────────────────────────────────────────────────────
function normalizeUrl(href, baseUrl) {
  try {
    const u = new URL(href, baseUrl);
    u.hash = '';
    // Remove trailing slash for consistency (except root)
    if (u.pathname !== '/' && u.pathname.endsWith('/')) {
      u.pathname = u.pathname.slice(0, -1);
    }
    return u.href;
  } catch {
    return null;
  }
}

function isSameDomain(url, seedUrl) {
  try {
    return new URL(url).hostname === new URL(seedUrl).hostname;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'unknown';
  }
}

// Skip non-HTML resources
const SKIP_EXTENSIONS = /\.(jpg|jpeg|png|gif|svg|webp|ico|pdf|zip|tar|gz|mp4|mp3|avi|mov|css|js|woff|woff2|ttf|eot|xml|rss|atom)$/i;
function shouldSkipUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    return SKIP_EXTENSIONS.test(pathname);
  } catch {
    return true;
  }
}

// ─── PAGINATION DETECTOR ────────────────────────────────────────────────────
/**
 * Detects pagination links on a page.
 * Looks for common patterns: "Next" buttons, page numbers, load-more, rel="next".
 */
async function detectPagination(page, currentUrl) {
  return page.evaluate((currentHref) => {
    const links = [];

    // 1. rel="next" (most reliable)
    const relNext = document.querySelector('link[rel="next"], a[rel="next"]');
    if (relNext) {
      const href = relNext.getAttribute('href');
      if (href) links.push({ href, method: 'rel-next', priority: 10 });
    }

    // 2. Common "Next" button patterns
    const nextSelectors = [
      'a.next', 'a.next-page', 'a[aria-label="Next"]', 'a[aria-label="Next page"]',
      '.pagination a.next', '.pagination .next a', '.pager .next a',
      'a[class*="next"]', 'button[class*="next"]',
      'nav[aria-label="pagination"] a:last-child',
      '.pagination li:last-child a', '.pagination a:last-of-type',
    ];
    for (const sel of nextSelectors) {
      const el = document.querySelector(sel);
      if (el) {
        const href = el.getAttribute('href') || el.closest('a')?.getAttribute('href');
        if (href && href !== '#' && href !== currentHref) {
          links.push({ href, method: 'next-button', priority: 8 });
        }
      }
    }

    // 3. Text-based detection — links containing "Next", ">" , ">>"
    document.querySelectorAll('a').forEach((a) => {
      const text = (a.textContent || '').trim();
      const href = a.getAttribute('href');
      if (!href || href === '#' || href === currentHref) return;
      if (/^(next|next\s*page|›|»|>>|→|next\s*→)$/i.test(text)) {
        links.push({ href, method: 'text-next', priority: 7 });
      }
    });

    // 4. URL pattern detection — ?page=N, /page/N, &p=N, &offset=N
    const currentUrlObj = new URL(currentHref);
    const pagePatterns = [
      { param: 'page', regex: /[?&]page=(\d+)/ },
      { param: 'p', regex: /[?&]p=(\d+)/ },
      { param: 'offset', regex: /[?&]offset=(\d+)/ },
      { param: 'start', regex: /[?&]start=(\d+)/ },
    ];
    for (const { param, regex } of pagePatterns) {
      const match = currentHref.match(regex);
      if (match) {
        const current = parseInt(match[1], 10);
        const nextUrl = new URL(currentHref);
        if (param === 'offset') {
          // Guess page size from offset increment (default 10)
          nextUrl.searchParams.set(param, String(current + 10));
        } else {
          nextUrl.searchParams.set(param, String(current + 1));
        }
        links.push({ href: nextUrl.href, method: 'url-pattern', priority: 5 });
      }
    }

    // 5. Path-based pagination: /page/2, /p/2
    const pathMatch = currentHref.match(/\/(page|p)\/(\d+)/);
    if (pathMatch) {
      const nextNum = parseInt(pathMatch[2], 10) + 1;
      const nextHref = currentHref.replace(/\/(page|p)\/\d+/, `/${pathMatch[1]}/${nextNum}`);
      links.push({ href: nextHref, method: 'path-pattern', priority: 5 });
    }

    // De-duplicate by href and return sorted by priority
    const unique = {};
    for (const l of links) {
      if (!unique[l.href] || unique[l.href].priority < l.priority) {
        unique[l.href] = l;
      }
    }
    return Object.values(unique).sort((a, b) => b.priority - a.priority);
  }, currentUrl);
}

// ─── INFINITE SCROLL HANDLER ────────────────────────────────────────────────
async function handleInfiniteScroll(page, maxScrolls = 10) {
  let previousHeight = 0;
  let scrollCount = 0;

  while (scrollCount < maxScrolls) {
    const currentHeight = await page.evaluate(() => document.body.scrollHeight);
    if (currentHeight === previousHeight) break;

    previousHeight = currentHeight;
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(1500); // Wait for content to load
    scrollCount++;
  }

  return scrollCount;
}

// ─── PAGE CONTENT EXTRACTOR ─────────────────────────────────────────────────
async function extractPageContent(page, selector) {
  return page.evaluate((sel) => {
    const result = {
      url: window.location.href,
      title: document.title || '',
      metaDescription: '',
      canonical: '',
      h1: [],
      h2: [],
      h3: [],
      paragraphs: [],
      images: [],
      links: [],
      tables: [],
      customElements: [],
    };

    // Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) result.metaDescription = metaDesc.getAttribute('content') || '';

    // Canonical
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) result.canonical = canonical.getAttribute('href') || '';

    // Headings
    document.querySelectorAll('h1').forEach((el) => result.h1.push(el.textContent.trim()));
    document.querySelectorAll('h2').forEach((el) => result.h2.push(el.textContent.trim()));
    document.querySelectorAll('h3').forEach((el) => result.h3.push(el.textContent.trim()));

    // Paragraphs (non-empty, meaningful text)
    document.querySelectorAll('p').forEach((el) => {
      const text = el.textContent.trim();
      if (text.length > 20) result.paragraphs.push(text);
    });

    // Images
    document.querySelectorAll('img').forEach((el) => {
      const src = el.getAttribute('src') || el.getAttribute('data-src') || '';
      if (src) {
        result.images.push({
          src: src.startsWith('http') ? src : new URL(src, window.location.origin).href,
          alt: el.getAttribute('alt') || '',
          width: el.naturalWidth || el.width || null,
          height: el.naturalHeight || el.height || null,
        });
      }
    });

    // Internal links (for crawling)
    document.querySelectorAll('a[href]').forEach((el) => {
      const href = el.getAttribute('href');
      if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        result.links.push({
          href,
          text: el.textContent.trim().substring(0, 100),
        });
      }
    });

    // Tables
    document.querySelectorAll('table').forEach((table) => {
      const rows = [];
      table.querySelectorAll('tr').forEach((tr) => {
        const cells = [];
        tr.querySelectorAll('th, td').forEach((cell) => cells.push(cell.textContent.trim()));
        if (cells.length) rows.push(cells);
      });
      if (rows.length) result.tables.push(rows);
    });

    // Custom selector extraction
    if (sel) {
      document.querySelectorAll(sel).forEach((el) => {
        result.customElements.push({
          tag: el.tagName.toLowerCase(),
          text: el.textContent.trim(),
          html: el.innerHTML.substring(0, 2000),
          attributes: Object.fromEntries(
            Array.from(el.attributes).map((a) => [a.name, a.value])
          ),
        });
      });
    }

    return result;
  }, selector);
}

// ─── ROBOTS.TXT PARSER ──────────────────────────────────────────────────────
async function fetchRobotsTxt(seedUrl) {
  try {
    const origin = new URL(seedUrl).origin;
    const res = await fetch(`${origin}/robots.txt`);
    if (!res.ok) return { allowed: () => true };

    const text = await res.text();
    const disallowed = [];
    let isRelevant = false;

    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (/^user-agent:\s*\*/i.test(trimmed)) isRelevant = true;
      else if (/^user-agent:/i.test(trimmed)) isRelevant = false;
      else if (isRelevant && /^disallow:\s*/i.test(trimmed)) {
        const path = trimmed.replace(/^disallow:\s*/i, '').trim();
        if (path) disallowed.push(path);
      }
    }

    return {
      allowed: (url) => {
        const pathname = new URL(url).pathname;
        return !disallowed.some((d) => pathname.startsWith(d));
      },
    };
  } catch {
    return { allowed: () => true };
  }
}

// ─── MAIN SCRAPER ───────────────────────────────────────────────────────────
async function scrape(opts) {
  const puppeteer = require('puppeteer');

  console.log('\n========================================');
  console.log('  FirmsLedger — Universal Site Scraper');
  console.log('========================================\n');
  console.log(`  Seed URL:     ${opts.seedUrl}`);
  console.log(`  Mode:         ${opts.mode}`);
  console.log(`  Max pages:    ${opts.maxPages}`);
  console.log(`  Max depth:    ${opts.maxDepth}`);
  console.log(`  Delay:        ${opts.delay}ms`);
  console.log(`  Concurrency:  ${opts.concurrency}`);
  if (opts.selector) console.log(`  Selector:     ${opts.selector}`);
  if (opts.include) console.log(`  Include:      ${opts.include}`);
  if (opts.exclude) console.log(`  Exclude:      ${opts.exclude}`);
  console.log('');

  // Robots.txt
  let robots = { allowed: () => true };
  if (opts.respectRobots) {
    console.log('  Fetching robots.txt...');
    robots = await fetchRobotsTxt(opts.seedUrl);
  }

  // Launch browser
  const browser = await puppeteer.launch({
    headless: opts.headless ? 'new' : false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const visited = new Set();
  const queue = [{ url: normalizeUrl(opts.seedUrl, opts.seedUrl), depth: 0 }];
  const results = [];
  let pagesScraped = 0;

  // Process queue with concurrency control
  async function processUrl(item) {
    const { url, depth } = item;

    if (!url || visited.has(url) || pagesScraped >= opts.maxPages) return;
    if (depth > opts.maxDepth) return;
    if (shouldSkipUrl(url)) return;
    if (!isSameDomain(url, opts.seedUrl)) return;
    if (!robots.allowed(url)) {
      console.log(`  [BLOCKED by robots.txt] ${url}`);
      return;
    }
    if (opts.include && !opts.include.test(url)) return;
    if (opts.exclude && opts.exclude.test(url)) return;

    visited.add(url);
    pagesScraped++;

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    // Block images/fonts/media for speed
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'font', 'media', 'stylesheet'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    try {
      console.log(`  [${pagesScraped}/${opts.maxPages}] depth=${depth}  ${url}`);

      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Handle infinite scroll if enabled
      if (opts.scroll) {
        const scrolls = await handleInfiniteScroll(page);
        if (scrolls > 0) console.log(`    ↳ scrolled ${scrolls} times`);
      }

      // Extract content
      const content = await extractPageContent(page, opts.selector);
      content.depth = depth;
      content.scrapedAt = new Date().toISOString();
      results.push(content);

      // Detect and follow pagination
      const paginationLinks = await detectPagination(page, url);
      if (paginationLinks.length > 0) {
        console.log(`    ↳ pagination detected: ${paginationLinks.length} link(s) [${paginationLinks[0].method}]`);
        for (const pl of paginationLinks) {
          const nextUrl = normalizeUrl(pl.href, url);
          if (nextUrl && !visited.has(nextUrl)) {
            queue.push({ url: nextUrl, depth }); // Same depth for pagination
          }
        }
      }

      // In full mode, also follow internal links
      if (opts.mode === 'full') {
        for (const link of content.links) {
          const absoluteUrl = normalizeUrl(link.href, url);
          if (absoluteUrl && !visited.has(absoluteUrl) && isSameDomain(absoluteUrl, opts.seedUrl)) {
            queue.push({ url: absoluteUrl, depth: depth + 1 });
          }
        }
      }
    } catch (err) {
      console.log(`    ✗ Error: ${err.message.split('\n')[0]}`);
    } finally {
      await page.close();
    }

    // Rate limiting
    if (opts.delay > 0) await sleep(opts.delay);
  }

  // Process queue with concurrency
  while (queue.length > 0 && pagesScraped < opts.maxPages) {
    const batch = queue.splice(0, opts.concurrency);
    await Promise.all(batch.map(processUrl));
  }

  await browser.close();

  // ─── OUTPUT ─────────────────────────────────────────────────────────────
  const domain = getDomain(opts.seedUrl);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outDir = path.join(__dirname, '..', 'scraped-data');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const jsonFile = opts.output || path.join(outDir, `${domain}-${timestamp}.json`);

  // Write JSON
  const output = {
    meta: {
      seedUrl: opts.seedUrl,
      domain,
      mode: opts.mode,
      pagesScraped: results.length,
      scrapedAt: new Date().toISOString(),
      options: {
        maxPages: opts.maxPages,
        maxDepth: opts.maxDepth,
        delay: opts.delay,
        selector: opts.selector,
      },
    },
    pages: results,
  };

  fs.writeFileSync(jsonFile, JSON.stringify(output, null, 2));
  console.log(`\n  JSON saved: ${jsonFile}`);

  // Write CSV if requested
  if (opts.csv) {
    const csvFile = jsonFile.replace(/\.json$/, '.csv');
    const csvHeader = ['url', 'title', 'meta_description', 'h1', 'h2_count', 'paragraphs_count', 'images_count', 'links_count', 'tables_count', 'depth'];
    const csvRows = results.map((r) => [
      `"${r.url}"`,
      `"${(r.title || '').replace(/"/g, '""')}"`,
      `"${(r.metaDescription || '').replace(/"/g, '""')}"`,
      `"${(r.h1?.[0] || '').replace(/"/g, '""')}"`,
      r.h2?.length || 0,
      r.paragraphs?.length || 0,
      r.images?.length || 0,
      r.links?.length || 0,
      r.tables?.length || 0,
      r.depth,
    ]);
    const csvContent = [csvHeader.join(','), ...csvRows.map((r) => r.join(','))].join('\n');
    fs.writeFileSync(csvFile, csvContent);
    console.log(`  CSV saved:  ${csvFile}`);
  }

  // Summary
  console.log('\n========================================');
  console.log('  Scraping Complete!');
  console.log('========================================');
  console.log(`  Pages scraped: ${results.length}`);
  console.log(`  URLs visited:  ${visited.size}`);
  console.log(`  Domain:        ${domain}`);

  if (opts.selector && results.length > 0) {
    const totalCustom = results.reduce((sum, r) => sum + (r.customElements?.length || 0), 0);
    console.log(`  Custom elements found: ${totalCustom} (via "${opts.selector}")`);
  }

  const totalImages = results.reduce((sum, r) => sum + (r.images?.length || 0), 0);
  const totalTables = results.reduce((sum, r) => sum + (r.tables?.length || 0), 0);
  console.log(`  Total images:  ${totalImages}`);
  console.log(`  Total tables:  ${totalTables}`);
  console.log('');

  return output;
}

// ─── RUN ────────────────────────────────────────────────────────────────────
const opts = parseArgs();
scrape(opts).catch((err) => {
  console.error('\n  Fatal error:', err.message);
  process.exit(1);
});
