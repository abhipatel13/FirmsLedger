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

/**
 * Parse a homepage HTML document for a logo candidate, in priority order:
 * 1. og:image, 2. JSON-LD .logo, 3. link rel icon/apple-touch-icon,
 * 4. <img> with logo-ish class/alt/id. Returns { source, url } or null.
 */
export function discoverLogoFromHtml(html, baseUrl) {
  const $ = load(html);

  const og = $('meta[property="og:image"], meta[name="og:image"]').first().attr('content');
  if (og) {
    const url = resolveUrl(og.trim(), baseUrl);
    if (url) return { source: 'og_logo', url };
  }

  let jsonLdLogo = null;
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
      jsonLdLogo = logo;
      break;
    }
  }
  if (jsonLdLogo) {
    const url = resolveUrl(jsonLdLogo, baseUrl);
    if (url) return { source: 'json_ld', url };
  }

  const icon = $('link[rel~="icon"], link[rel="apple-touch-icon"], link[rel="shortcut icon"]')
    .first()
    .attr('href');
  if (icon) {
    const url = resolveUrl(icon.trim(), baseUrl);
    if (url) return { source: 'favicon', url };
  }

  const img = $('img')
    .filter((_, el) => {
      const $el = $(el);
      return (
        /logo/i.test($el.attr('class') || '') ||
        /logo/i.test($el.attr('alt') || '') ||
        /logo/i.test($el.attr('id') || '')
      );
    })
    .first();
  const src = img.attr('src') || img.attr('data-src');
  if (src) {
    const url = resolveUrl(src.trim(), baseUrl);
    if (url) return { source: 'html_logo', url };
  }

  return null;
}
