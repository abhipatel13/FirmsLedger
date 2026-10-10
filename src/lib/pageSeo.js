import SUBCATEGORY_COMBOS from '@/lib/generated/subcategoryCombos.json';
import { fetchStateListing, fetchStateHubStats } from '@/db/neonApi';
import { MANUFACTURING_CATEGORIES } from '@/lib/manufacturingCategories';
import { buildListingFacts } from '@/lib/listingFacts';
import { SEO_OVERRIDES, resolveOverride, listingVars, stateHubVars } from '@/lib/seoOverrides';

const subCountsFor = (cat, stateSlug) =>
  Object.fromEntries((cat?.subcategories || []).map((s) => [
    s.slug,
    SUBCATEGORY_COMBOS.find((c) => c.category === cat.slug && c.sub === s.slug && c.state === stateSlug)?.n || 0,
  ]));

export async function stateListingSeo({ path, listSlug, stateSlug, stateName, cat }) {
  const companies = await fetchStateListing(listSlug, stateSlug);
  const facts = buildListingFacts(companies);
  const override = SEO_OVERRIDES[path];
  const seo = override
    ? resolveOverride(override, listingVars({ facts, companies, stateName, stateSlug, override, cat, subCounts: subCountsFor(cat, stateSlug) }))
    : null;
  return { companies, facts, seo };
}

export async function stateHubSeo({ stateSlug, stateName }) {
  const [stats, lists] = await Promise.all([
    fetchStateHubStats(stateSlug),
    Promise.all(MANUFACTURING_CATEGORIES.map((c) => fetchStateListing(c.slug, stateSlug))),
  ]);
  const sections = MANUFACTURING_CATEGORIES
    .map((cat, i) => ({ cat, companies: lists[i] }))
    .filter((s) => s.companies.length > 0)
    .sort((a, b) => b.companies.length - a.companies.length);
  const override = SEO_OVERRIDES[`/states/${stateSlug}`];
  const seo = override
    ? resolveOverride(override, stateHubVars({
        stateName,
        stateSlug,
        totalCount: stats.totalCount,
        topCities: stats.topCities,
        topCategories: sections.map((s) => ({ slug: s.cat.slug, count: s.companies.length })),
        categories: MANUFACTURING_CATEGORIES,
      }))
    : null;
  return { stats, sections, seo };
}
