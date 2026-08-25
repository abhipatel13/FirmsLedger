import { db } from '@/db/client';
import { states, categories, companies, company_categories } from '@/db/schema';
import { eq, and, isNotNull, ne, sql } from 'drizzle-orm';
import { MANUFACTURING_CATEGORIES, CATEGORY_SLUGS } from '@/lib/manufacturingCategories';
import { STATES_BY_COUNTRY } from '@/lib/statesByCountry';
import { unstable_cache } from 'next/cache';

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

// Without this the sitemap is baked at build time, so approving companies does
// not reach Google until the next deploy.
//
// Hourly used to be the freshness mechanism, which meant three DB queries (one
// of them a ~6,800-row profile scan) every hour, forever — enough on its own to
// wake the Neon compute 24x/day and, with a 300s autosuspend, bill ~2h/day of
// compute for a file Google fetches far less often than that.
//
// Daily is still well inside Google's sitemap recrawl cadence, and
// /api/cron/submit-urls already pushes new URLs directly on a daily schedule.
//
// ponytail: the DB work is tagged 'companies' to match src/db/neonApi.js, but
// nothing in the app calls revalidateTag() yet — the tag is inert and the TTL
// is doing all the work, so an approval can take up to 24h to appear here.
// Wiring revalidateTag into the admin approve route (plan Task 6) makes
// approvals instant and lets this TTL stay long.
export const revalidate = 86400;
const DAY = 86400;
const CACHE_TAGS = ['companies'];

// Below this many approved companies, a /{category}/{state} page is a thin/
// empty page — a soft-404 risk that wastes crawl budget. Keep it out of the
// sitemap; it's still reachable via the category hub, just not pushed to Google.
const MIN_LIVE_COMPANIES = 5;

function slugifyState(name) {
  return String(name).trim().toLowerCase().replace(/\s+/g, '-');
}

const STATE_SLUGS = STATES_BY_COUNTRY['United States'].map(slugifyState);

/**
 * One grouped query for every (category, state) pair with at least one
 * approved company, instead of 500+ per-combo queries.
 */
async function buildLiveCombosImpl() {
  try {
    const rows = await db
      .select({
        categorySlug: categories.slug,
        stateSlug: states.slug,
        count: sql`count(*)`.mapWith(Number),
      })
      .from(companies)
      .innerJoin(company_categories, eq(company_categories.company_id, companies.id))
      .innerJoin(categories, eq(categories.id, company_categories.category_id))
      .innerJoin(states, eq(states.id, companies.hq_state_id))
      .where(eq(companies.approved, true))
      .groupBy(categories.slug, states.slug);

    // category slug -> parent slug (for rolling child-category hits up to parent)
    const parentBySlug = new Map();
    const catRows = await db.select({ slug: categories.slug, parentId: categories.id, parent_id: categories.parent_id }).from(categories);
    const slugById = new Map(catRows.map((c) => [c.parentId, c.slug]));
    for (const c of catRows) {
      if (c.parent_id) parentBySlug.set(c.slug, slugById.get(c.parent_id));
    }

    const counts = new Map(); // "categorySlug|stateSlug" -> count
    const bump = (catSlug, stateSlug, val) => {
      const key = `${catSlug}|${stateSlug}`;
      counts.set(key, (counts.get(key) || 0) + val);
    };

    for (const r of rows) {
      bump(r.categorySlug, r.stateSlug, r.count);
      const parent = parentBySlug.get(r.categorySlug);
      if (parent) bump(parent, r.stateSlug, r.count);
    }

    // Entries, not the Map itself — unstable_cache serializes its return value
    // and a Map does not survive the round-trip.
    return [...counts];
  } catch (err) {
    console.error('Error building sitemap combos:', err);
    // DB unavailable at build time — fall back to emitting every combo so the
    // sitemap still lists all real routes rather than going empty.
    return null;
  }
}

const buildLiveCombos = unstable_cache(
  buildLiveCombosImpl,
  ['sitemapLiveCombos'],
  { revalidate: DAY, tags: CACHE_TAGS },
);

async function fetchIndexableSlugsImpl() {
  try {
    const profiles = await db
      .select({ slug: companies.slug })
      .from(companies)
      .where(and(
        eq(companies.approved, true),
        isNotNull(companies.description),
        ne(companies.description, ''),
      ));
    return profiles.map((p) => p.slug).filter(Boolean);
  } catch {
    // DB unavailable at build time — omit profiles rather than fail the sitemap.
    return [];
  }
}

const fetchIndexableSlugs = unstable_cache(
  fetchIndexableSlugsImpl,
  ['sitemapIndexableSlugs'],
  { revalidate: DAY, tags: CACHE_TAGS },
);

export default async function sitemap() {
  const now = new Date();
  const comboEntries = await buildLiveCombos();
  const combos = comboEntries ? new Map(comboEntries) : null;

  const urls = [];

  // ── Core pages ────────────────────────────────────────────────────────────
  urls.push({ url: `${BASE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 });
  // /search is noindexed (app/search/layout.jsx) — /{category}/{state} pages
  // are the canonical crawlable listings, so it doesn't belong in the sitemap.
  urls.push({ url: `${BASE_URL}/browse`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 });
  urls.push({ url: `${BASE_URL}/locations`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 });
  urls.push({ url: `${BASE_URL}/capabilities`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 });
  urls.push({ url: `${BASE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 });
  urls.push({ url: `${BASE_URL}/list-your-company`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 });
  urls.push({ url: `${BASE_URL}/claim-listing`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 });
  urls.push({ url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 });
  urls.push({ url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 });
  urls.push({ url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 });

  // ── Category hub pages: /{category} ─────────────────────────────────────
  for (const slug of CATEGORY_SLUGS) {
    urls.push({ url: `${BASE_URL}/${slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 });
  }

  // ── State hub pages: /states/{state} ────────────────────────────────────
  for (const stateSlug of STATE_SLUGS) {
    urls.push({ url: `${BASE_URL}/states/${stateSlug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 });
  }

  // ── Category + state pages: /{category}/{state} ────────────────────────
  for (const slug of CATEGORY_SLUGS) {
    for (const stateSlug of STATE_SLUGS) {
      if (combos) {
        const count = combos.get(`${slug}|${stateSlug}`) || 0;
        if (count < MIN_LIVE_COMPANIES) continue;
      }
      urls.push({ url: `${BASE_URL}/${slug}/${stateSlug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 });
    }
  }

  // ── Subcategory + state pages: /{category}/{subcategory}/{state} ───────
  for (const cat of MANUFACTURING_CATEGORIES) {
    for (const sub of cat.subcategories) {
      for (const stateSlug of STATE_SLUGS) {
        if (combos) {
          const count = combos.get(`${sub.slug}|${stateSlug}`) || 0;
          if (count < MIN_LIVE_COMPANIES) continue;
        }
        urls.push({ url: `${BASE_URL}/${cat.slug}/${sub.slug}/${stateSlug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 });
      }
    }
  }

  // ── Company profiles: /company/{slug} ───────────────────────────────────
  // Mirrors isIndexable() in app/company/[slug]/page.jsx — approved and
  // carrying a real (non-empty) description. Keep the two predicates in
  // agreement, otherwise the sitemap advertises noindexed URLs.
  for (const slug of await fetchIndexableSlugs()) {
    urls.push({ url: `${BASE_URL}/company/${slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 });
  }

  return urls;
}
