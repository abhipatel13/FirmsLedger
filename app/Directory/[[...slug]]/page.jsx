import { Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import Directory from '@/views/Directory';
import JsonLd from '@/components/JsonLd';
import CategorySEOContent from '@/components/directory/CategorySEOContent';
import CategorySEOIntro from '@/components/directory/CategorySEOIntro';
import { getFaqsFor } from '@/lib/categoryFaqs';
import { notFound } from 'next/navigation';
import { SITE_NAME, BASE_URL, SEO_YEAR, SEO_COUNTRY, getCategoryTitle, getCategoryMetaDescription, getCategoryTitleWithLocation, getCategoryMetaDescriptionWithLocation, CATEGORY_TITLE_OVERRIDES, getOverriddenCategoryTitle, getOverriddenCategoryDescription, getOverrideEntry } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function getInitialDirectoryData(categorySlug) {
  try {
    const supabase = getServerSupabase();
    if (!supabase) return { agencies: [], categories: [], specificCategory: null };
    const [{ data: agencyCategories }, { data: categories }] = await Promise.all([
      supabase.from('agency_categories').select('*').limit(10000),
      supabase.from('categories').select('*').order('name').limit(10000),
    ]);

    // If the specific category isn't in the 10k list, fetch it directly
    let specificCategory = categorySlug ? (categories || []).find(c => c.slug === categorySlug) || null : null;
    if (categorySlug && !specificCategory) {
      const { data: catData } = await supabase.from('categories').select('*').eq('slug', categorySlug).maybeSingle();
      specificCategory = catData || null;
    }

    let agencies = [];
    const cat = specificCategory;
    if (cat) {
      let categoryIds = [cat.id];
      if (cat.is_parent) {
        const subIds = (categories || []).filter(c => c.parent_id === cat.id).map(c => c.id);
        categoryIds.push(...subIds);
      }
      const relatedIds = [...new Set(
        (agencyCategories || []).filter(ac => categoryIds.includes(ac.category_id)).map(ac => ac.agency_id)
      )];
      if (relatedIds.length > 0) {
        const { data } = await supabase.from('agencies')
          .select('*').eq('approved', true).in('id', relatedIds)
          .order('avg_rating', { ascending: false }).limit(200);
        agencies = data || [];
      }
    }

    return { agencies, categories: categories || [], specificCategory };
  } catch {
    return { agencies: [], categories: [], specificCategory: null };
  }
}

const BASE_DESC = "The global platform to discover and connect with verified business service providers and staffing agencies worldwide.";

async function getCategoryBySlug(slug) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data } = await supabase.from('categories').select('id, name, description, slug, is_parent, parent_id').eq('slug', slug).maybeSingle();
  return data;
}

/**
 * Count approved agencies linked to a category, optionally constrained by
 * country/state/city. Used to put a real number in the SEO title:
 *   "Top 3 Artificial Turf Companies in South Korea (2026)"
 */
async function countAgenciesForCategory(categoryId, { country, state, city } = {}) {
  if (!categoryId) return 0;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return 0;
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data: links } = await supabase
    .from('agency_categories').select('agency_id').eq('category_id', categoryId).limit(5000);
  const ids = (links || []).map((l) => l.agency_id);
  if (ids.length === 0) return 0;

  let q = supabase.from('agencies').select('id', { count: 'exact', head: true })
    .eq('approved', true).in('id', ids.slice(0, 1000));
  if (country) q = q.ilike('hq_country', country);
  if (state)   q = q.ilike('hq_state',   state);
  if (city)    q = q.ilike('hq_city',    `%${city}%`);
  const { count } = await q;
  return count || 0;
}

/** Build a richer description by combining DB description with generated SEO copy */
function buildDescription(category, location) {
  const name = category.name;
  const dbDesc = category.description || '';
  const seoDesc = getCategoryMetaDescriptionWithLocation(name, category.slug, location);
  // If DB has a meaningful description, prepend it for uniqueness
  if (dbDesc && dbDesc.length > 20) {
    // Truncate combined to ~155 chars for optimal SERP display
    const combined = `${dbDesc} ${seoDesc}`;
    return combined.length > 300 ? combined.slice(0, 297) + '...' : combined;
  }
  return seoDesc;
}

export async function generateMetadata({ params, searchParams }) {
  const resolved = await params;
  const resolvedSearch = await searchParams;
  const slugArr = resolved?.slug;
  const categorySlug = Array.isArray(slugArr) && slugArr.length === 1 ? slugArr[0]?.trim() : null;

  const countryName = resolvedSearch?.country || '';
  const stateName = resolvedSearch?.state || '';
  const cityName = resolvedSearch?.city || '';
  const location = [cityName, stateName, countryName].filter(Boolean).join(', ');

  if (!categorySlug) {
    const baseTitle = `Top Companies List in ${location || SEO_COUNTRY} ${SEO_YEAR} | Browse Verified Agencies | ${SITE_NAME}`;
    return {
      title: baseTitle,
      description: `Browse the top companies list. Find verified staffing agencies, HR services, and business providers. ${BASE_DESC}`,
      openGraph: { title: baseTitle, description: BASE_DESC, type: 'website' },
      alternates: { canonical: `${BASE_URL.replace(/\/$/, '')}/directory` },
    };
  }

  const category = await getCategoryBySlug(categorySlug);
  if (!category) {
    return { title: `${SITE_NAME} – Directory` };
  }

  // Single source of truth for per-slug title overrides lives in src/lib/seo.js.
  // Add new categories there (slug → { top, noun }) — both the SEO <title>
  // and the on-page H1 read from the same config.
  const title = getOverriddenCategoryTitle(categorySlug, category.name, location, countryName)
    || getCategoryTitleWithLocation(category.name, location);
  // Override description wins (used for keyword-targeted pages like clotted cream).
  const description = getOverriddenCategoryDescription(categorySlug, countryName, category.name, location)
    || buildDescription(category, location);
  const base = `${BASE_URL.replace(/\/$/, '')}/directory/${categorySlug}`;
  const qp = new URLSearchParams();
  if (countryName) qp.set('country', countryName);
  if (stateName) qp.set('state', stateName);
  if (cityName) qp.set('city', cityName);
  const canonical = qp.size ? `${base}?${qp.toString()}` : base;

  // Thin-content gate: count agencies after applying location filters.
  // < 3 live = soft-404 risk → noindex. Google saves crawl budget for
  // pages that can actually rank. follow:true keeps internal link equity.
  const liveCount = await countAgenciesForCategory(category.id, {
    country: countryName, state: stateName, city: cityName,
  });
  const isThin = liveCount < 3;

  return {
    title,
    description,
    openGraph: { title, description, type: 'website', url: canonical },
    alternates: { canonical },
    robots: isThin
      ? { index: false, follow: true, googleBot: { index: false, follow: true } }
      : { index: true, follow: true },
  };
}

export default async function DirectoryRoute({ params, searchParams }) {
  const resolved = await params;
  const resolvedSearch = (await searchParams) || {};
  const slugArr = resolved?.slug;
  const categorySlug = Array.isArray(slugArr) && slugArr.length === 1 ? slugArr[0]?.trim() : null;

  if (slugArr && slugArr.length > 1) {
    notFound();
    return null;
  }

  const { agencies, categories, specificCategory } = await getInitialDirectoryData(categorySlug);

  // ── Build JSON-LD: ItemList of companies + BreadcrumbList ───────────────────
  let itemListJsonLd = null;
  let breadcrumbJsonLd = null;

  if (specificCategory) {
    const countryName = resolvedSearch?.country || '';
    const stateName   = resolvedSearch?.state   || '';
    const cityName    = resolvedSearch?.city    || '';
    const location    = [cityName, stateName, countryName].filter(Boolean).join(', ');

    // Filter SSR agencies to match what the user sees after country/state/city.
    const lc = (s) => (s || '').toString().toLowerCase();
    const filtered = (agencies || []).filter((a) => {
      if (countryName && lc(a.hq_country) !== lc(countryName)) return false;
      if (stateName   && lc(a.hq_state)   !== lc(stateName))   return false;
      if (cityName    && !lc(a.hq_city).includes(lc(cityName))) return false;
      return true;
    });

    // If a per-slug override caps the count (e.g. Top 5), trim ItemList to match.
    const override = getOverrideEntry(categorySlug, countryName);
    const cap = override?.top || filtered.length;
    const items = filtered.slice(0, cap);

    if (items.length > 0) {
      const canonical = (() => {
        const qp = new URLSearchParams();
        if (countryName) qp.set('country', countryName);
        if (stateName)   qp.set('state',   stateName);
        if (cityName)    qp.set('city',    cityName);
        const base = `${_BASE}/directory/${categorySlug}`;
        return qp.size ? `${base}?${qp.toString()}` : base;
      })();

      const listName = getOverriddenCategoryTitle(categorySlug, specificCategory.name, location, countryName)
        || getCategoryTitleWithLocation(specificCategory.name, location);

      itemListJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: listName,
        url: canonical,
        numberOfItems: items.length,
        itemListElement: items.map((a, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Organization',
            name: a.name,
            ...(a.website && { url: a.website }),
            ...(a.logo_url && { logo: a.logo_url }),
            ...(a.description && { description: a.description }),
            ...((a.hq_city || a.hq_state || a.hq_country) && {
              address: {
                '@type': 'PostalAddress',
                ...(a.hq_city    && { addressLocality: a.hq_city }),
                ...(a.hq_state   && { addressRegion:   a.hq_state }),
                ...(a.hq_country && { addressCountry:  a.hq_country }),
              },
            }),
          },
        })),
      };
    }

    // Breadcrumbs: Home → Directory → [Parent] → Category
    const parent = specificCategory.parent_id
      ? (categories || []).find((c) => c.id === specificCategory.parent_id)
      : null;
    const crumbs = [
      { name: 'Home',      url: _BASE },
      { name: 'Directory', url: `${_BASE}/directory` },
    ];
    if (parent) crumbs.push({ name: parent.name, url: `${_BASE}/directory/${parent.slug}` });
    crumbs.push({ name: specificCategory.name, url: `${_BASE}/directory/${specificCategory.slug}` });
    breadcrumbJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: c.url,
      })),
    };
  }

  // FAQPage JSON-LD — only emit when a curated FAQ override exists for this slug.
  // Generic templated FAQs are too thin to merit schema markup; Google
  // penalizes duplicate-content FAQ schemas across many pages.
  let faqJsonLd = null;
  if (specificCategory) {
    const curatedFaqs = getFaqsFor(specificCategory.slug);
    if (curatedFaqs?.length) {
      faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: curatedFaqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      };
    }
  }

  return (
    <>
      {itemListJsonLd  && <JsonLd data={itemListJsonLd} />}
      {breadcrumbJsonLd && <JsonLd data={breadcrumbJsonLd} />}
      {faqJsonLd && <JsonLd data={faqJsonLd} />}
      {specificCategory && (
        <CategorySEOIntro
          category={specificCategory}
          location={[resolvedSearch?.city, resolvedSearch?.state, resolvedSearch?.country].filter(Boolean).join(', ')}
          total={(agencies || []).filter((a) => {
            const lc = (s) => (s || '').toString().toLowerCase();
            if (resolvedSearch?.country && lc(a.hq_country) !== lc(resolvedSearch.country)) return false;
            if (resolvedSearch?.state   && lc(a.hq_state)   !== lc(resolvedSearch.state))   return false;
            if (resolvedSearch?.city    && !lc(a.hq_city).includes(lc(resolvedSearch.city))) return false;
            return true;
          }).length}
        />
      )}
      <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" /></div>}>
        <Directory
          initialCategorySlug={categorySlug || undefined}
          initialCategoryData={specificCategory || undefined}
          initialAgencies={agencies}
          initialCategories={categories}
        />
      </Suspense>
      {specificCategory && (
        <CategorySEOContent
          category={specificCategory}
          agencies={agencies || []}
          allCategories={categories}
        />
      )}
    </>
  );
}
