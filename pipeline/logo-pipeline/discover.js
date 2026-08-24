import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

// S2 — cheerio-based homepage logo discovery. One homepage fetch per unique
// domain, cached to html_cache/{domain}.html (plus a .meta.json sidecar with
// the post-redirect final URL, needed to resolve relative logo URLs).

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const MAX_REDIRECTS = 5;
const HOMEPAGE_CAP_BYTES = 2 * 1024 * 1024; // 2MB response cap
const HOMEPAGE_TIMEOUT_MS = 10_000;

const memo = new Map();

/**
 * Bounded HTTP GET with manual redirect handling (<=5), timeout, and a
 * byte-size cap on the body. Returns { ok, url, status, headers, body } or
 * { ok:false, error, retryable }.
 */
export async function fetchBounded(url, { maxBytes, timeoutMs = 10_000, headers = {} } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let currentUrl = url;
  try {
    for (let i = 0; i <= MAX_REDIRECTS; i++) {
      const res = await fetch(currentUrl, {
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': BROWSER_UA,
          'Accept-Language': 'en-US,en;q=0.9',
          Accept: '*/*',
          ...headers,
        },
      });

      if (res.status === 301 || res.status === 302 || res.status === 303 || res.status === 307 || res.status === 308) {
        const loc = res.headers.get('location');
        if (!loc) return { ok: false, error: `redirect ${res.status} with no Location header`, retryable: false };
        currentUrl = new URL(loc, currentUrl).href;
        continue;
      }

      if (res.status === 429 || res.status >= 500) {
        return { ok: false, status: res.status, error: `HTTP ${res.status}`, retryable: true };
      }
      if (!res.ok) {
        return { ok: false, status: res.status, error: `HTTP ${res.status}`, retryable: false };
      }

      const read = await readBounded(res.body, maxBytes);
      if (read.truncated) {
        return { ok: false, error: `response exceeded ${maxBytes} byte cap`, retryable: false };
      }
      return {
        ok: true,
        url: res.url || currentUrl,
        status: res.status,
        headers: res.headers,
        body: read.buffer,
      };
    }
    return { ok: false, error: `too many redirects (>${MAX_REDIRECTS})`, retryable: false };
  } catch (e) {
    return { ok: false, error: e.message || String(e), retryable: true };
  } finally {
    clearTimeout(timer);
  }
}

async function readBounded(stream, maxBytes) {
  const reader = stream.getReader();
  const chunks = [];
  let total = 0;
  let truncated = false;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
    if (total > maxBytes) {
      truncated = true;
      await reader.cancel();
      break;
    }
  }
  const buffer = Buffer.concat(chunks, Math.min(total, maxBytes));
  return { buffer, truncated };
}

function cachePaths(cacheDir, domain) {
  return {
    html: path.join(cacheDir, `${domain}.html`),
    meta: path.join(cacheDir, `${domain}.meta.json`),
  };
}

function readCache(cacheDir, domain) {
  const { html, meta } = cachePaths(cacheDir, domain);
  if (!fs.existsSync(html) || !fs.existsSync(meta)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(meta, 'utf8'));
    return {
      html: fs.readFileSync(html, 'utf8'),
      finalUrl: parsed.finalUrl || `https://${domain}/`,
    };
  } catch {
    return null;
  }
}

function writeCache(cacheDir, domain, html, finalUrl) {
  const { html: htmlPath, meta: metaPath } = cachePaths(cacheDir, domain);
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(htmlPath, html);
  fs.writeFileSync(metaPath, JSON.stringify({ finalUrl }));
}

/**
 * Discover a logo candidate for a domain.
 * Returns a parsed candidate { source, url } or null (clean miss).
 * Throws on transient network failure so callers can mark the company failed.
 * Memoized in-memory for the run and cached to html_cache/ across runs.
 */
export async function discoverLogoCandidates2(domain, cacheDir) {
  const html = await fetchHomepage(domain, cacheDir);
  if (!html) return [];
  return discoverLogoCandidates(html.html, html.finalUrl);
}

export async function discoverLogo(domain, cacheDir) {
  if (memo.has(domain)) {
    const entry = memo.get(domain);
    if (entry.kind === 'error') throw new Error(entry.error);
    return entry.value;
  }

  const cached = readCache(cacheDir, domain);
  if (cached) {
    const parsed = discoverLogoFromHtml(cached.html, cached.finalUrl);
    memo.set(domain, { kind: 'ok', value: parsed });
    return parsed;
  }

  let res = await fetchBounded(`https://${domain}/`, {
    maxBytes: HOMEPAGE_CAP_BYTES,
    timeoutMs: HOMEPAGE_TIMEOUT_MS,
  });
  if (!res.ok && res.retryable) {
    const alt = await fetchBounded(`http://${domain}/`, {
      maxBytes: HOMEPAGE_CAP_BYTES,
      timeoutMs: HOMEPAGE_TIMEOUT_MS,
    });
    if (alt.ok) res = alt;
  }

  if (!res.ok) {
    if (res.retryable) {
      memo.set(domain, { kind: 'error', error: `homepage fetch failed (${domain}): ${res.error}` });
      throw new Error(`homepage fetch failed (${domain}): ${res.error}`);
    }
    memo.set(domain, { kind: 'ok', value: null });
    return null;
  }

  const html = res.body.toString('utf8');
  const finalUrl = res.url || `https://${domain}/`;
  writeCache(cacheDir, domain, html, finalUrl);
  const parsed = discoverLogoFromHtml(html, finalUrl);
  memo.set(domain, { kind: 'ok', value: parsed });
  return parsed;
}

/**
 * Homepage fetch + on-disk cache, shared by the single- and multi-candidate
 * entry points. Returns { html, finalUrl } or null on a clean miss; throws on
 * a transient failure so the caller can mark the company retryable.
 */
export async function fetchHomepage(domain, cacheDir) {
  const memoKey = `html:${domain}`;
  if (memo.has(memoKey)) {
    const entry = memo.get(memoKey);
    if (entry.kind === 'error') throw new Error(entry.error);
    return entry.value;
  }

  const cached = readCache(cacheDir, domain);
  if (cached) return { html: cached.html, finalUrl: cached.finalUrl };

  let res = await fetchBounded(`https://${domain}/`, {
    maxBytes: HOMEPAGE_CAP_BYTES,
    timeoutMs: HOMEPAGE_TIMEOUT_MS,
  });
  if (!res.ok && res.retryable) {
    const alt = await fetchBounded(`http://${domain}/`, {
      maxBytes: HOMEPAGE_CAP_BYTES,
      timeoutMs: HOMEPAGE_TIMEOUT_MS,
    });
    if (alt.ok) res = alt;
  }

  if (!res.ok) {
    if (res.retryable) {
      const msg = `homepage fetch failed (${domain}): ${res.error}`;
      memo.set(memoKey, { kind: 'error', error: msg });
      throw new Error(msg);
    }
    memo.set(memoKey, { kind: 'ok', value: null });
    return null;
  }

  const html = res.body.toString('utf8');
  const finalUrl = res.url || `https://${domain}/`;
  writeCache(cacheDir, domain, html, finalUrl);
  const value = { html, finalUrl };
  memo.set(memoKey, { kind: 'ok', value });
  return value;
}

function resolveUrl(rel, base) {
  try {
    return new URL(rel, base).href;
  } catch {
    return null;
  }
}

function findLogoInJsonLd(node) {
  if (node == null || typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
    return null;
  }
  if (Array.isArray(node)) {
    for (const item of node) {
      const r = findLogoInJsonLd(item);
      if (r) return r;
    }
    return null;
  }
  if (typeof node === 'object') {
    if (typeof node.logo === 'string' && node.logo) return node.logo;
    if (node.logo && typeof node.logo === 'object') {
      if (typeof node.logo.url === 'string' && node.logo.url) return node.logo.url;
      if (Array.isArray(node.logo)) {
        for (const item of node.logo) {
          const r = findLogoInJsonLd(item);
          if (r) return r;
        }
      }
    }
    for (const key of Object.keys(node)) {
      const r = findLogoInJsonLd(node[key]);
      if (r) return r;
    }
  }
  return null;
}

// Site-builder default artwork. These download fine and pass every size and
// format check, but they are the *platform's* placeholder, not the company's
// mark — a GoDaddy or Squarespace default in a listing looks deliberate and is
// therefore worse than showing no logo at all.
const PLACEHOLDER_PATTERNS = [
  /img1\.wsimg\.com\/.*\/logo-default/i,      // GoDaddy Website Builder
  /assets\.squarespace\.com\/universal\//i,   // Squarespace default favicon
  /static\.parastorage\.com\/.*favicon/i,     // Wix default
  /cdn\.shopify\.com\/.*\/no-image/i,
  /\/(?:default|placeholder|no[-_]?image|blank)[-_.]/i,
];

export function isPlaceholderUrl(url) {
  return PLACEHOLDER_PATTERNS.some((re) => re.test(url));
}

// Sites commonly ship a light-on-dark variant of the mark for dark headers and
// footers (…-white.svg, …-reverse.png, …-inverted.png). Those render as a blank
// square on the directory's white cards — 1-source-solar shipped exactly that.
// Only a naming heuristic; a white variant with an unhelpful filename still
// gets through.
// ponytail: filename heuristic, sample the rendered pixels if misses show up.
// Deliberately loose — these names run together in CamelCase ("WhiteGreen"),
// so word-boundary matching misses them. A false positive only *demotes* a
// candidate within its tier, never rejects it, so over-matching is cheap.
const REVERSED_VARIANT = /white|reverse|invert|negativ|footer|on-?dark/i;

export function isReversedVariant(url) {
  return REVERSED_VARIANT.test(url);
}

/**
 * Parse a homepage HTML document for logo candidates, best-first.
 *
 * Order matters and is the whole point of this function. og:image used to be
 * tried FIRST, which is wrong: on most small-business sites og:image is the
 * social share card — a hero photo, a marketing banner, even a screenshot of
 * the homepage — not the company mark. That produced building photos and stock
 * imagery in the directory listings. og:image is now a last resort and is only
 * accepted when its URL actually looks like a logo.
 *
 * Returns an array of { source, url } (may be empty). Callers try them in
 * order, so a candidate that downloads but fails validation falls through to
 * the next one instead of losing the company entirely.
 */
export function discoverLogoCandidates(html, baseUrl) {
  const $ = load(html);
  const out = [];
  const seen = new Set();
  const push = (source, raw) => {
    if (!raw) return;
    const url = resolveUrl(String(raw).trim(), baseUrl);
    if (!url || seen.has(url)) return;
    seen.add(url);
    if (isPlaceholderUrl(url)) return;
    out.push({ source, url });
  };

  // 1. JSON-LD Organization.logo — the only source that *means* "logo".
  for (const el of $('script[type="application/ld+json"]').toArray()) {
    const raw = $(el).html() || '';
    if (!raw.trim()) continue;
    let data = null;
    try {
      data = JSON.parse(raw);
    } catch {
      try {
        data = JSON.parse(raw.replace(/\/\*[^]*?\*\//g, ''));
      } catch {
        continue;
      }
    }
    const logo = findLogoInJsonLd(data);
    if (logo) {
      push('json_ld', logo);
      break;
    }
  }

  // 2. <img> that declares itself a logo. Header/nav first — a site's own
  //    mark lives in the masthead, while a "logo" further down is usually a
  //    client/partner/certification badge.
  const logoish = (el) => {
    const $el = $(el);
    const hay = [$el.attr('class'), $el.attr('alt'), $el.attr('id'), $el.attr('src'), $el.attr('data-src')]
      .filter(Boolean)
      .join(' ');
    return /logo|brand/i.test(hay);
  };
  const srcOf = (el) => $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src');
  for (const el of $('header img, nav img, .header img, #header img, .navbar img, .site-header img, .logo img, #logo img').toArray()) {
    if (logoish(el)) push('html_logo', srcOf(el));
  }

  // 3. apple-touch-icon — typically 180x180 and a real mark, unlike favicon.
  $('link[rel~="apple-touch-icon"], link[rel~="apple-touch-icon-precomposed"]').each((_, el) => {
    push('apple_touch_icon', $(el).attr('href'));
  });

  // 4. og:image, but ONLY when the URL itself looks like a logo. Without this
  //    guard this branch is what pulled in share cards and hero photos.
  const og = $('meta[property="og:image"], meta[name="og:image"]').first().attr('content');
  if (og && /logo|brand|mark(?:\b|_)/i.test(og)) push('og_logo', og);

  // 5. Logo-ish <img> anywhere else on the page, ranked BELOW the icons on
  //    purpose. A "logo" outside the masthead is usually somebody else's:
  //    messengerclothing.com serves a client gallery (BSB-logo.png,
  //    Exline-logo.png) from its own domain with empty alt text, so neither
  //    host-matching nor alt-checking distinguishes it from the real mark.
  //    A site's own logo is in the header; these are a last resort.
  for (const el of $('img').toArray()) {
    if (logoish(el)) push('html_logo_page', srcOf(el));
  }

  // 6. favicon last. The download step enforces a minimum size so a 16px or
  //    32px icon is rejected rather than upscaled into a blurry smear.
  $('link[rel~="icon"], link[rel="shortcut icon"]').each((_, el) => {
    push('favicon', $(el).attr('href'));
  });

  // Stable sort keeps the source priority above, but demotes light-on-dark
  // variants within each tier so the standard mark wins when both are offered.
  return out
    .map((c, i) => ({ c, i, penalty: isReversedVariant(c.url) ? 1 : 0 }))
    .sort((a, b) => a.penalty - b.penalty || a.i - b.i)
    .map((x) => x.c);
}

/** Back-compat single-candidate wrapper. */
export function discoverLogoFromHtml(html, baseUrl) {
  return discoverLogoCandidates(html, baseUrl)[0] || null;
}
