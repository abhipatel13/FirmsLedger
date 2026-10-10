/**
 * Build-time bulk data loader.
 *
 * Why this exists: rendering the ~9,125 company profile pages through
 * `fetchCompanyByIdAny()` + `fetchCompanyCategories()` means two DB round-trips
 * per page — ~18,250 queries for a full build, and 18,250 distinct
 * `unstable_cache` entries at runtime. That many keys evict, so every crawl of a
 * profile page is a cache miss and a fresh DB touch. Measured 2026-09-05: 19 real
 * queries in 12.5 minutes, spaced ~39s apart. Neon's Launch plan only suspends
 * after 300s of silence, so a touch every 39s means the compute never sleeps and
 * we pay ~$18.71/mo for a database doing milliseconds of work.
 *
 * This module loads everything in THREE queries, once per build process, and
 * serves lookups from memory. See HISTORY.md 2026-09-05.
 *
 * Build-only by design: at runtime we keep the existing per-slug cached
 * functions, because holding ~5MB of companies in memory on every serverless
 * cold start would be worse than the query it replaces.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SNAPSHOT = resolve(process.cwd(), '.static-data/db-snapshot.json');

/** True while `next build` is prerendering. */
export function isBuildPhase() {
  return process.env.NEXT_PHASE === 'phase-production-build';
}

// Memoised per worker. Reading a local file is cheap enough that duplicating it
// across Next.js build workers is fine — unlike querying, which is what broke
// three builds on 2026-09-05.
let loadPromise = null;

async function load() {
  let snapshot;
  try {
    snapshot = JSON.parse(readFileSync(SNAPSHOT, 'utf8'));
  } catch {
    // No snapshot (dev server, or the prebuild step was skipped) — callers fall
    // through to the cached DB path.
    snapshot = { companies: [], company_categories: [], categories: [] };
  }

  const allCompanies = snapshot.companies || [];
  const allLinks = snapshot.company_categories || [];
  const allCategories = snapshot.categories || [];

  const bySlug = new Map();
  for (const c of allCompanies) {
    if (c.slug) bySlug.set(c.slug, c);
    // fetchCompanyByIdAny accepts a UUID or a slug, so both must resolve.
    if (c.id) bySlug.set(c.id, c);
  }

  const linksByCompanyId = new Map();
  for (const link of allLinks) {
    const list = linksByCompanyId.get(link.company_id);
    if (list) list.push(link);
    else linksByCompanyId.set(link.company_id, [link]);
  }

  return { allCompanies, bySlug, linksByCompanyId, allCategories, empty: allCompanies.length === 0 };
}

export function getStaticData() {
  if (!loadPromise) loadPromise = load();
  return loadPromise;
}

/** Approved companies only — the set worth prerendering. */
export async function approvedCompanySlugs() {
  const { allCompanies } = await getStaticData();
  return allCompanies.filter((c) => c.approved && c.slug).map((c) => c.slug);
}

/**
 * Build-time equivalents of the neonApi fetchers. They return `undefined` when
 * called outside a build so callers can fall through to the cached DB path.
 */
export async function buildCompanyByIdAny(idOrSlug) {
  if (!isBuildPhase()) return undefined;
  const { bySlug, empty } = await getStaticData();
  if (empty) return undefined;
  return bySlug.get(idOrSlug) || null;
}

export async function buildCompanyCategories(companyId) {
  if (!isBuildPhase()) return undefined;
  const { linksByCompanyId, empty } = await getStaticData();
  if (empty) return undefined;
  return linksByCompanyId.get(companyId) || [];
}

/**
 * Top-N companies in a category, computed from the bulk data.
 *
 * Without this, every one of the 9,125 profile pages called
 * fetchCompaniesByCategoryAndState() for its "similar companies" strip. That is
 * cached per-category (~11 keys), but during a build the pages render
 * concurrently and stampede the DB before the cache fills — the 2026-09-05 build
 * lost 23 pages' strips to ETIMEDOUT.
 *
 * Ordering matches orderCol() in neonApi.js: avg_rating DESC then id ASC. The
 * id tiebreak is mandatory, not cosmetic — see CLAUDE.md.
 */
export async function buildTopCompaniesInCategory(categorySlug, limit = 30, stateId = null) {
  if (!isBuildPhase()) return undefined;
  const { allCompanies, allCategories, linksByCompanyId, empty } = await getStaticData();
  if (empty) return undefined;
  const category = allCategories.find((c) => c.slug === categorySlug);
  if (!category) return [];
  return allCompanies
    .filter((c) => {
      if (!c.approved || (stateId && c.hq_state_id !== stateId)) return false;
      const links = linksByCompanyId.get(c.id);
      return links ? links.some((l) => l.category_id === category.id) : false;
    })
    .sort((a, b) => (Number(b.avg_rating) || 0) - (Number(a.avg_rating) || 0)
      || String(a.id).localeCompare(String(b.id)))
    .slice(0, limit);
}

export async function buildCategories() {
  if (!isBuildPhase()) return undefined;
  const { allCategories, empty } = await getStaticData();
  if (empty) return undefined;
  return allCategories;
}
