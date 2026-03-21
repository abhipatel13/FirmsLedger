/**
 * seoAuditor.ts
 *
 * Module 2 — Daily SEO Audit
 * Fetches pages, parses HTML with cheerio, runs 10 SEO checks,
 * computes a 0–100 score, and stores results in Supabase `seo_audits`.
 */

import * as cheerio from 'cheerio';
import { getServiceSupabase } from './supabaseClient';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CheckResult {
  passed: boolean;
  value: string | number | boolean | null;
  detail: string;
}

interface AuditIssue {
  check: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface PageAudit {
  page_url: string;
  checks: Record<string, CheckResult>;
  score: number;
  issues: AuditIssue[];
}

// ---------------------------------------------------------------------------
// Pages to audit
// ---------------------------------------------------------------------------

const BASE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com'
).replace(/\/$/, '');

/**
 * Returns the list of page URLs to audit each day.
 * Combines static core pages with recently-published dynamic pages.
 */
async function getPagesToAudit(): Promise<string[]> {
  const staticPages = [
    '/',
    '/directory',
    '/blogs',
    '/contact',
  ].map((p) => `${BASE_URL}${p}`);

  const supabase = getServiceSupabase();

  // Add up to 8 blog post pages
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(8);

  // Add up to 4 markdown blog pages
  const { data: blogs } = await supabase
    .from('blogs')
    .select('slug')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(4);

  // Add up to 4 directory category pages
  const { data: cats } = await supabase
    .from('categories')
    .select('slug')
    .limit(4);

  const blogUrls = (posts ?? []).map((p) => `${BASE_URL}/blogs/${p.slug}`);
  const mdBlogUrls = (blogs ?? []).map((b) => `${BASE_URL}/blogs/${b.slug}`);
  const catUrls = (cats ?? []).map((c) => `${BASE_URL}/directory/${c.slug}`);

  const all = [...staticPages, ...blogUrls, ...mdBlogUrls, ...catUrls];
  // Deduplicate and cap at 20
  return [...new Set(all)].slice(0, 20);
}

// ---------------------------------------------------------------------------
// SEO checks
// ---------------------------------------------------------------------------

/**
 * Counts visible words in body text (excluding scripts, styles, nav, footer).
 */
function countWords($: cheerio.CheerioAPI): number {
  $('script, style, nav, footer, header').remove();
  const text = $('body').text().replace(/\s+/g, ' ').trim();
  return text.split(' ').filter(Boolean).length;
}

/**
 * Runs all 10 SEO checks on the parsed HTML of a single page.
 */
function runChecks(
  $: cheerio.CheerioAPI,
  pageUrl: string
): Record<string, CheckResult> {
  const checks: Record<string, CheckResult> = {};

  // 1. Title tag length (50–60 chars)
  const title = $('title').first().text().trim();
  const titleLen = title.length;
  checks.title_tag = {
    passed: titleLen >= 50 && titleLen <= 60,
    value: titleLen,
    detail: title
      ? `Title: "${title}" (${titleLen} chars)`
      : 'No <title> tag found',
  };

  // 2. Meta description length (120–155 chars)
  const metaDesc =
    $('meta[name="description"]').attr('content')?.trim() ?? '';
  const metaLen = metaDesc.length;
  checks.meta_description = {
    passed: metaLen >= 120 && metaLen <= 155,
    value: metaLen,
    detail: metaDesc
      ? `Meta desc: ${metaLen} chars`
      : 'No meta description found',
  };

  // 3. H1 exists and is non-empty
  const h1Text = $('h1').first().text().trim();
  checks.h1_exists = {
    passed: h1Text.length > 0,
    value: h1Text || null,
    detail: h1Text ? `H1: "${h1Text.slice(0, 60)}"` : 'No H1 tag found',
  };

  // 4. All images have alt text
  const images = $('img').toArray();
  const imagesWithoutAlt = images.filter(
    (img) => !$(img).attr('alt')?.trim()
  );
  checks.image_alt_text = {
    passed: imagesWithoutAlt.length === 0,
    value: imagesWithoutAlt.length,
    detail:
      imagesWithoutAlt.length === 0
        ? `All ${images.length} images have alt text`
        : `${imagesWithoutAlt.length} image(s) missing alt text`,
  };

  // 5. Canonical URL present
  const canonical = $('link[rel="canonical"]').attr('href')?.trim() ?? '';
  checks.canonical_url = {
    passed: canonical.length > 0,
    value: canonical || null,
    detail: canonical ? `Canonical: ${canonical}` : 'No canonical URL found',
  };

  // 6. Internal links count > 0
  const internalLinks = $('a[href]')
    .toArray()
    .filter((a) => {
      const href = $(a).attr('href') ?? '';
      return href.startsWith('/') || href.includes(BASE_URL);
    });
  checks.internal_links = {
    passed: internalLinks.length > 0,
    value: internalLinks.length,
    detail: `${internalLinks.length} internal link(s) found`,
  };

  // 7. Schema markup (JSON-LD) present
  const jsonLd = $('script[type="application/ld+json"]');
  checks.schema_markup = {
    passed: jsonLd.length > 0,
    value: jsonLd.length,
    detail:
      jsonLd.length > 0
        ? `${jsonLd.length} JSON-LD block(s) found`
        : 'No JSON-LD schema markup found',
  };

  // 8. Slug is SEO-friendly (no uppercase, no special chars except hyphens)
  const urlPath = new URL(pageUrl).pathname;
  const slugFriendly = /^[a-z0-9\-/]*$/.test(urlPath);
  checks.seo_friendly_slug = {
    passed: slugFriendly,
    value: urlPath,
    detail: slugFriendly
      ? `Slug "${urlPath}" is SEO-friendly`
      : `Slug "${urlPath}" has uppercase or special characters`,
  };

  // 9. Word count > 300
  const wordCount = countWords($);
  checks.word_count = {
    passed: wordCount > 300,
    value: wordCount,
    detail: `${wordCount} words`,
  };

  // 10. Open Graph tags (og:title, og:description, og:image)
  const ogTitle = $('meta[property="og:title"]').attr('content') ?? '';
  const ogDesc = $('meta[property="og:description"]').attr('content') ?? '';
  const ogImage = $('meta[property="og:image"]').attr('content') ?? '';
  const ogPassed = ogTitle.length > 0 && ogDesc.length > 0 && ogImage.length > 0;
  checks.open_graph_tags = {
    passed: ogPassed,
    value: `title=${!!ogTitle}, desc=${!!ogDesc}, image=${!!ogImage}`,
    detail: ogPassed
      ? 'All OG tags present'
      : `Missing: ${[!ogTitle && 'og:title', !ogDesc && 'og:description', !ogImage && 'og:image'].filter(Boolean).join(', ')}`,
  };

  return checks;
}

/**
 * Converts check results into a list of human-readable issues.
 */
function buildIssues(checks: Record<string, CheckResult>): AuditIssue[] {
  const severityMap: Record<string, AuditIssue['severity']> = {
    title_tag: 'warning',
    meta_description: 'warning',
    h1_exists: 'critical',
    image_alt_text: 'warning',
    canonical_url: 'warning',
    internal_links: 'info',
    schema_markup: 'info',
    seo_friendly_slug: 'critical',
    word_count: 'warning',
    open_graph_tags: 'warning',
  };

  return Object.entries(checks)
    .filter(([, result]) => !result.passed)
    .map(([key, result]) => ({
      check: key,
      message: result.detail,
      severity: severityMap[key] ?? 'info',
    }));
}

// ---------------------------------------------------------------------------
// Fetch and robots.txt check
// ---------------------------------------------------------------------------

/** Cache of robots.txt noindex paths per domain */
const robotsCache = new Map<string, string[]>();

async function getNoindexPaths(origin: string): Promise<string[]> {
  if (robotsCache.has(origin)) return robotsCache.get(origin)!;
  try {
    const res = await fetch(`${origin}/robots.txt`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const text = await res.text();
    const disallowed: string[] = [];
    let isUserAgentAll = false;
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (/^user-agent:\s*\*/i.test(trimmed)) isUserAgentAll = true;
      else if (/^user-agent:/i.test(trimmed)) isUserAgentAll = false;
      else if (isUserAgentAll && /^disallow:/i.test(trimmed)) {
        const path = trimmed.replace(/^disallow:\s*/i, '').trim();
        if (path) disallowed.push(path);
      }
    }
    robotsCache.set(origin, disallowed);
    return disallowed;
  } catch {
    return [];
  }
}

async function isNoindex(pageUrl: string): Promise<boolean> {
  const { origin, pathname } = new URL(pageUrl);
  const disallowed = await getNoindexPaths(origin);
  return disallowed.some((d) => pathname.startsWith(d));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Audits a single page URL and returns the full audit result.
 * Returns null if the page is blocked by robots.txt or unreachable.
 */
export async function auditPage(pageUrl: string): Promise<PageAudit | null> {
  // Respect robots.txt — skip noindex pages
  if (await isNoindex(pageUrl)) return null;

  let html: string;
  try {
    const res = await fetch(pageUrl, {
      headers: { 'User-Agent': 'FirmsLedger-SEO-Bot/1.0' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    html = await res.text();
  } catch {
    return null;
  }

  const $ = cheerio.load(html);
  const checks = runChecks($, pageUrl);
  const passedCount = Object.values(checks).filter((c) => c.passed).length;
  const score = Math.round((passedCount / Object.keys(checks).length) * 100);
  const issues = buildIssues(checks);

  return { page_url: pageUrl, checks, score, issues };
}

/**
 * Runs the full daily SEO audit:
 * 1. Determines the top 20 pages to audit
 * 2. Runs 10 SEO checks on each
 * 3. Persists results to Supabase `seo_audits`
 * 4. Returns a summary
 */
export async function runDailySeoAudit(): Promise<{
  audited: number;
  skipped: number;
  avgScore: number;
  needsAttention: string[];
}> {
  const pages = await getPagesToAudit();
  const supabase = getServiceSupabase();

  const results: PageAudit[] = [];
  let skipped = 0;

  for (const url of pages) {
    try {
      const audit = await auditPage(url);
      if (!audit) {
        skipped++;
        continue;
      }
      results.push(audit);

      // Persist to Supabase
      await supabase.from('seo_audits').insert({
        page_url: audit.page_url,
        checks: audit.checks,
        score: audit.score,
        issues: audit.issues,
        audited_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error(`SEO audit failed for ${url}:`, err);
      skipped++;
    }
  }

  const avgScore =
    results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
      : 0;

  const needsAttention = results
    .filter((r) => r.score < 70)
    .map((r) => r.page_url);

  return {
    audited: results.length,
    skipped,
    avgScore,
    needsAttention,
  };
}
