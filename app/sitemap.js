import { db } from '@/db/client';
import { states, categories, companies, company_categories } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { MANUFACTURING_CATEGORIES, CATEGORY_SLUGS } from '@/lib/manufacturingCategories';
import { STATES_BY_COUNTRY } from '@/lib/statesByCountry';

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

// Below this many approved companies, a /{category}/{state} page is a thin/
// empty page — a soft-404 risk that wastes crawl budget. Keep it out of the
// sitemap; it's still reachable via the category hub, just not pushed to Google.
const MIN_LIVE_COMPANIES = 1;

function slugifyState(name) {
  return String(name).trim().toLowerCase().replace(/\s+/g, '-');
}

const STATE_SLUGS = STATES_BY_COUNTRY['United States'].map(slugifyState);

/**
 * One grouped query for every (category, state) pair with at least one
 * approved company, instead of 500+ per-combo queries.
 */
async function buildLiveCombos() {
  try {
    const rows = await db
      .select({
        categorySlug: categories.slug,
        categoryParentId: categories.parent_id,
        categoryId: categories.id,
        stateSlug: states.slug,
      })
      .from(companies)
      .innerJoin(company_categories, eq(company_categories.company_id, companies.id))
      .innerJoin(categories, eq(categories.id, company_categories.category_id))
      .innerJoin(states, eq(states.id, companies.hq_state_id))
      .where(eq(companies.approved, true));

    // category slug -> parent slug (for rolling child-category hits up to parent)
    const parentBySlug = new Map();
    const catRows = await db.select({ slug: categories.slug, parentId: categories.id, parent_id: categories.parent_id }).from(categories);
    const slugById = new Map(catRows.map((c) => [c.parentId, c.slug]));
    for (const c of catRows) {
      if (c.parent_id) parentBySlug.set(c.slug, slugById.get(c.parent_id));
    }

    const counts = new Map(); // "categorySlug|stateSlug" -> count
    const bump = (catSlug, stateSlug) => {
      const key = `${catSlug}|${stateSlug}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    };

    for (const r of rows) {
      bump(r.categorySlug, r.stateSlug);
      const parent = parentBySlug.get(r.categorySlug);
      if (parent) bump(parent, r.stateSlug);
    }

    return counts;
  } catch {
    // DB unavailable at build time — fall back to emitting every combo so the
    // sitemap still lists all real routes rather than going empty.
    return null;
  }
}

export default async function sitemap() {
  const now = new Date();
  const combos = await buildLiveCombos();

  const urls = [];

  // ── Core pages ────────────────────────────────────────────────────────────
  urls.push({ url: `${BASE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 });
  urls.push({ url: `${BASE_URL}/browse`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 });
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

  // NOTE: /company/{slug} pages are intentionally excluded — they are
  // noindex'd (see app/company/[slug]/page.jsx), so they should not appear
  // in the sitemap as canonical entry points.

  return urls;
}
