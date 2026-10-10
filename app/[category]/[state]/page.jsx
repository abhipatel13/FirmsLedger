import { Suspense } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { BASE_URL, SEO_YEAR } from '@/lib/seo';
import { Shield, Info } from 'lucide-react';
import { fetchCompaniesByCategoryAndState, fetchStateCountsForCategory, fetchCategoryStats, countCompaniesByCategoryAndState } from '@/db/neonApi';
import { MANUFACTURING_CATEGORIES, CATEGORY_MAP, CATEGORY_SLUGS, ALL_SUBCATEGORY_SLUGS, categoryTitleNoun } from '@/lib/manufacturingCategories';
import { ALL_US_STATES } from '@/lib/usStates';
import CompanyCard from '@/components/listing/CompanyCard';
import FilterBar from '@/components/listing/FilterBar';
import OtherCategoriesCard from '@/components/listing/OtherCategoriesCard';
import { getCompanyDescription, buildListingTitle, fitTitle } from '@/utils';
import {
  generateDynamicCategoryStateMetaDescription,
  generateDynamicCategoryStateAboveFoldText,
  generateDynamicCategoryStateOnPageText,
  generateCategoryStateFAQs,
  getNeighboringStates
} from '@/lib/seoDescription';

// Prebuilt at deploy. `revalidate = false` (not a duration) because a
// time-based window makes the page re-render AT RUNTIME on expiry, and a runtime
// render hits Postgres — which is the whole cost problem. Freshness comes from
// rebuilds. See HISTORY.md 2026-09-05.
export const revalidate = false;
export const dynamicParams = true;

// One indexable page has to satisfy "top 9", "top 10", "top 20", "top 25" — a
// bigger first page means the larger N subsumes the smaller instead of the
// remainder landing on a noindexed ?page=2. The page is static and cannot
// serve ?page=2, so anything past PAGE_SIZE is unreachable: titles and
// ItemList count only what is rendered (see shownCount below).
const PAGE_SIZE = 50;

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

const VALID_CATEGORIES = new Set(CATEGORY_SLUGS);
const VALID_STATES = new Set(ALL_US_STATES.map((s) => s.slug));

const SIDEBAR_CATEGORIES_FULL = MANUFACTURING_CATEGORIES.map((c) => ({
  slug: c.slug,
  name: c.shortName,
  subcategories: c.subcategories,
}));

const TOP_STATES = [
  { name: 'California',    slug: 'california'   },
  { name: 'Texas',         slug: 'texas'        },
  { name: 'New York',      slug: 'new-york'     },
  { name: 'Florida',       slug: 'florida'      },
  { name: 'Illinois',      slug: 'illinois'     },
  { name: 'Pennsylvania',  slug: 'pennsylvania' },
  { name: 'Ohio',          slug: 'ohio'         },
  { name: 'Michigan',      slug: 'michigan'     },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toTitleCase(slug) {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function parseFilterParams(searchParams) {
  const statesParam = searchParams?.states;
  const employeesParam = searchParams?.employees;
  const activeStates = statesParam ? String(statesParam).split(',').filter(Boolean) : [];
  const activeEmployeeRanges = employeesParam ? String(employeesParam).split(',').filter(Boolean) : [];
  return { activeStates, activeEmployeeRanges };
}

function buildFilterQueryString(activeStates, activeEmployeeRanges, page) {
  const params = new URLSearchParams();
  if (activeStates.length) params.set('states', activeStates.join(','));
  if (activeEmployeeRanges.length) params.set('employees', activeEmployeeRanges.join(','));
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `?${query}` : '';
}

/**
 * Builds a compact page-number list for pagination: always shows page 1 and
 * the last page, a window around the current page, and '…' for any gaps —
 * instead of rendering every page number (unusable once totalPages is large).
 */
function paginationRange(current, total) {
  const delta = 3;
  const range = [];
  const withDots = [];
  let prev;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (prev !== undefined) {
      if (i - prev === 2) withDots.push(prev + 1);
      else if (i - prev > 2) withDots.push('…');
    }
    withDots.push(i);
    prev = i;
  }

  return withDots;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const { category, state } = await params;
  // Page 1, unfiltered — the only variant that is ever prerendered or indexed.
  const pageParam = undefined;
  const activeStates = [];
  const activeEmployeeRanges = [];

  if (VALID_STATES.has(category) && VALID_CATEGORIES.has(state)) {
    const query = new URLSearchParams(sParams).toString();
    const target = query ? `/${state}/${category}?${query}` : `/${state}/${category}`;
    permanentRedirect(target);
  }

  if (!VALID_CATEGORIES.has(category)) return { title: 'Not Found' };

  if (state && !VALID_STATES.has(state) && !ALL_SUBCATEGORY_SLUGS.has(state)) {
    return { title: 'Not Found' };
  }

  const cat = CATEGORY_MAP[category];

  // Subcategory hub
  if (ALL_SUBCATEGORY_SLUGS.has(state)) {
    const sub = cat?.subcategories.find((s) => s.slug === state);
    const subName = sub?.name || toTitleCase(state);
    
    // Count the SUBCATEGORY, not the parent. Passing `category` here described
    // the parent's listings on a page titled for the subcategory.
    const count = await countCompaniesByCategoryAndState(state, null, {
      stateSlugs: activeStates,
      employeeRanges: activeEmployeeRanges,
    });
    
    const totalPages    = Math.max(1, Math.ceil(count / PAGE_SIZE));
    const clampedPage   = Math.min(Math.max(1, parseInt(pageParam, 10) || 1), totalPages);
    
    const pageSuffix = clampedPage > 1 ? ` — Page ${clampedPage}` : '';
    const pageQuery = clampedPage > 1 ? `?page=${clampedPage}` : '';

    const title = clampedPage > 1
      ? `${subName} — US Directory${pageSuffix}`
      : `${subName} Manufacturers in the US`;
      
    // Fetch stats using cache
    const stats = await fetchCategoryStats(state);
    
    const description = stats.totalCount > 0
      ? `Browse ${stats.totalCount} ${subName.toLowerCase()} manufacturers across the US. Compare capabilities, location, and company size. Part of the ${cat?.name} directory on FirmsLedger.`
      : `Find ${subName.toLowerCase()} manufacturers across all 50 US states. Browse by state or compare companies. Part of the ${cat?.name} directory on FirmsLedger.`;
    const canonical = `${_BASE}/${category}/${state}${pageQuery}`;
    return {
      title: fitTitle(title),
      description,
      alternates: { canonical },
      robots: { index: false, follow: true },
      openGraph: { title, description, type: 'website', url: canonical },
    };
  }

  // State listing
  const categoryName = cat?.name || toTitleCase(category);
  const stateName    = toTitleCase(state);
  
  // Fetch matching company count to clamp page number correctly
  const count = await countCompaniesByCategoryAndState(category, state || null, {
    stateSlugs: !state ? activeStates : [],
    employeeRanges: activeEmployeeRanges,
  });
  
  const totalPages    = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const clampedPage   = Math.min(Math.max(1, parseInt(pageParam, 10) || 1), totalPages);
  
  const pageSuffix = clampedPage > 1 ? ` — Page ${clampedPage}` : '';
  const pageQuery = clampedPage > 1 ? `?page=${clampedPage}` : '';

  const titleNoun = categoryTitleNoun(cat) || `${categoryName} Companies`;
  // "Top N" must match the companies the page actually renders.
  const title = buildListingTitle({ count: Math.min(count, PAGE_SIZE), noun: titleNoun, stateName, pageSuffix });
    
  // Fetch stats using cache
  const stats = await fetchCategoryStats(category, state);

  const description = state
    ? generateDynamicCategoryStateMetaDescription({
        categorySlug: category,
        categoryName: cat?.shortName || categoryName,
        stateSlug: state,
        stateName,
        totalCount: stats.totalCount || count,
      })
    : stats.totalCount > 0
      ? `Browse ${stats.totalCount} ${cat?.noun || categoryName.toLowerCase()} in the US. Compare capabilities, location, and company size. No paid placements.`
      : `Find ${cat?.noun || categoryName.toLowerCase()} in the US. Compare companies by location, size, and specialization. No paid placements.`;
  const canonical    = `${_BASE}/${category}/${state}${pageQuery}`;

  return {
    title: fitTitle(title),
    description,
    alternates: { canonical },
    robots: (clampedPage > 1 || count < 5) ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: { title, description, type: 'website', url: canonical },
  };
}

export function generateStaticParams() {
  // ~10 categories x 50 states. Both constants are static imports, so this
  // needs no DB call. Subcategory combos fall through to dynamicParams and are
  // cached after their first render.
  return CATEGORY_SLUGS.flatMap((category) =>
    ALL_US_STATES.map((s) => ({ category, state: s.slug }))
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CategoryStatePage({ params }) {
  const { category, state } = await params;
  if (VALID_STATES.has(category) && VALID_CATEGORIES.has(state)) {
    permanentRedirect(`/${state}/${category}`);
  }
  return renderCategoryPage({ category, state });
}

export async function renderCategoryPage({ category, state, pageParam, searchParams = {} }) {
  if (VALID_STATES.has(category) && VALID_CATEGORIES.has(state)) {
    const query = new URLSearchParams(searchParams).toString();
    const target = query ? `/${state}/${category}?${query}` : `/${state}/${category}`;
    permanentRedirect(target);
  }

  if (!VALID_CATEGORIES.has(category)) notFound();

  if (state && !VALID_STATES.has(state) && !ALL_SUBCATEGORY_SLUGS.has(state)) {
    notFound();
  }

  const cat = CATEGORY_MAP[category];

  // ── Branch: subcategory hub — nationwide listing, same flow as category ──
  if (state && ALL_SUBCATEGORY_SLUGS.has(state)) {
    const sub = cat.subcategories.find((s) => s.slug === state);
    if (!sub) notFound();

    const subcategory = state;
    const canonical = `${_BASE}/${category}/${subcategory}`;
    const basePath = `/${category}/${subcategory}`;

    // Read the subcategory, not the parent.
    //
    // This previously queried `category`, on the assumption that no subcategory
    // tagging existed. It does: company_categories carries subcategory rows
    // (solar-panels 536, welding 365, cnc-machining 79). Worse, the two sets are
    // disjoint — of 728 companies tagged solar-panels, zero also carry the
    // electrical-components tag — so the page was not showing a superset of its
    // subject, it was showing an unrelated group of companies under a solar
    // heading.
    const { activeStates, activeEmployeeRanges } = parseFilterParams(searchParams);

    const totalCount = await countCompaniesByCategoryAndState(subcategory, null, {
      stateSlugs: activeStates,
      employeeRanges: activeEmployeeRanges,
    });

    const totalPages    = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const currentPage   = Math.min(Math.max(1, parseInt(pageParam, 10) || 1), totalPages);

    const [pageCompanies, stateCounts, stats] = await Promise.all([
      fetchCompaniesByCategoryAndState(subcategory, null, '-avg_rating', PAGE_SIZE, (currentPage - 1) * PAGE_SIZE, {
        stateSlugs: activeStates,
        employeeRanges: activeEmployeeRanges,
      }),
      // State facets and the listings/states counters describe the subcategory
      // too — otherwise the filter offered states the listing cannot show.
      fetchStateCountsForCategory(subcategory),
      fetchCategoryStats(subcategory),
    ]);

    const rankOffset    = (currentPage - 1) * PAGE_SIZE;
    const pageTitle     = `${sub.name} Manufacturers in the US`;

    const itemListJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: pageTitle,
      url: canonical,
      numberOfItems: pageCompanies.length,
      itemListElement: pageCompanies.map((company, i) => ({
        '@type': 'ListItem',
        position: rankOffset + i + 1,
        name: company.name,
        description: getCompanyDescription(company),
        url: `${_BASE}/company/${company.slug}`,
      })),
    };

    const breadcrumbJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',          item: _BASE },
        { '@type': 'ListItem', position: 2, name: cat.shortName,   item: `${_BASE}/${category}` },
        { '@type': 'ListItem', position: 3, name: sub.name,        item: canonical },
      ],
    };

    return (
      <>
        <JsonLd data={itemListJsonLd} />
        <JsonLd data={breadcrumbJsonLd} />

        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>

          {/* ── Header ── */}
          <div style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <div className="mx-auto max-w-[var(--max-width)] px-4 pt-6 pb-5 sm:px-6 sm:pt-10 sm:pb-9">

              {/* Breadcrumb */}
              <nav className="scrollbar-hide" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 20,
                flexWrap: 'nowrap',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                WebkitOverflowScrolling: 'touch',
              }}>
                <Link href="/" className="breadcrumb-link" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 500, flexShrink: 0 }}>Home</Link>
                <span style={{ color: '#cbd5e1', fontSize: 13, flexShrink: 0 }}>/</span>
                <Link href={`/${category}`} className="breadcrumb-link" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 500, flexShrink: 0 }}>{cat.shortName}</Link>
                <span style={{ color: '#cbd5e1', fontSize: 13, flexShrink: 0 }}>/</span>
                <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 500, flexShrink: 0 }}>{sub.name}</span>
              </nav>

              {/* Category badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: cat.accent, borderRadius: 9999, padding: '4px 12px', marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: cat.accentText, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{cat.shortName}</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
                <div>
                  <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 10, marginTop: 0 }}>
                    {pageTitle}
                  </h1>
                  <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.5, maxWidth: 520 }}>
                    Grouped by category and location. Updated monthly.
                  </p>
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 9999,
                  padding: '8px 16px',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
                  flexShrink: 0,
                  gap: 14,
                  height: 'fit-content'
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{stats.totalCount}</span>
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, letterSpacing: '0.02em', lineHeight: 1 }}>listings</span>
                  </div>
                  {stats?.statesCovered > 0 && (
                    <>
                      <div style={{ width: 1, height: 16, backgroundColor: '#cbd5e1' }} />
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{stats.statesCovered}</span>
                        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, letterSpacing: '0.02em', lineHeight: 1 }}>states</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Content ── */}
          <div className="mx-auto max-w-[var(--max-width)] px-4 pt-5 pb-12 sm:px-6 sm:pt-8 sm:pb-16">

            {/* ── Filter Bar ── */}
            {/* Suspense: FilterBar calls useSearchParams(), which Next requires
                to sit behind a boundary once the page is statically prerendered. */}
            <Suspense fallback={null}>
              <FilterBar
                basePath={basePath}
                activeStates={activeStates}
                activeEmployeeRanges={activeEmployeeRanges}
                stateCounts={stateCounts}
                showStateFilter={true}
                subcategories={cat.subcategories}
                category={category}
                currentSubcategory={subcategory}
                currentState={null}
              />
            </Suspense>

            {/* ── Ranked list ── */}
            <div style={{ minWidth: 0, marginTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
                  All {sub.name} in the US
                </h2>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Sorted by rating</p>
              </div>

              {totalCount === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 24px', color: '#64748b' }}>
                  {(activeStates.length || activeEmployeeRanges.length) ? (
                    <>
                      <p style={{ fontSize: 17, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>No companies match these filters</p>
                      <Link href={basePath} style={{ color: '#1A2E4A', textDecoration: 'underline', textUnderlineOffset: 2 }}>
                        Clear filters
                      </Link>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: 17, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>No listings yet</p>
                      <p style={{ fontSize: 14 }}>Be the first {sub.name} company in the US to get listed.</p>
                      <Link href="/list-your-company" style={{ display: 'inline-flex', marginTop: 16, backgroundColor: '#0f172a', color: '#ffffff', fontSize: 13, fontWeight: 600, padding: '10px 20px', borderRadius: 8, textDecoration: 'none' }}>
                        List Your Company
                      </Link>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pageCompanies.map((company, i) => (
                    <CompanyCard key={company.slug} company={company} />
                  ))}
                </div>
              )}

              {/* Pagination moved to /search: this page is prebuilt at deploy and
                  cannot read ?page=. Page 2+ was already noindex, so nothing
                  indexable is lost. See HISTORY.md 2026-09-05. */}
              {totalCount > PAGE_SIZE && (
                <div style={{ textAlign: 'center', marginTop: 28 }}>
                  <Link
                    href={`/search?category=${encodeURIComponent(category)}`}
                    style={{
                      display: 'inline-block', fontSize: 14, fontWeight: 500,
                      color: '#1A2E4A', padding: '10px 18px', borderRadius: 8,
                      border: '1px solid #e2e8f0', textDecoration: 'none',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    View all {totalCount} companies →
                  </Link>
                </div>
              )}

              <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 24, lineHeight: 1.6 }}>
                Listings are grouped by category and location. Paid placements are never accepted.{' '}
                <Link href="/list-your-company" style={{ color: '#1A2E4A', textDecoration: 'underline', textUnderlineOffset: 2 }}>
                  Add your company
                </Link>
              </p>

              {/* Relocated CTA */}
              <div style={{ background: 'linear-gradient(160deg, #0F172A, #070D18)', borderRadius: 12, padding: 20, marginTop: 32 }}>
                <Shield style={{ width: 22, height: 22, color: 'rgba(255,255,255,0.7)', marginBottom: 12 }} />
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#ffffff', marginBottom: 6, marginTop: 0 }}>List Your Company</h3>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 14, marginTop: 0 }}>
                  Appear in ranked lists across all 50 states. Reach buyers actively searching.
                </p>
                <Link
                  href="/list-your-company"
                  style={{ display: 'inline-block', textAlign: 'center', backgroundColor: '#F5A623', color: '#1A2E4A', fontWeight: 600, fontSize: 12, padding: '9px 20px', borderRadius: 8, textDecoration: 'none', transition: 'background 0.12s' }}
                  className="cta-btn"
                >
                  Get Listed
                </Link>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .breadcrumb-link:hover { color: #0f172a !important; }
          .cta-btn:hover { background-color: #D48E1A !important; }
        `}</style>
      </>
    );
  }

  // ── Branch: state listing (or nationwide when `state` is absent) ────────
  const categoryName = cat?.name || toTitleCase(category);
  const stateName    = state ? toTitleCase(state) : null;
  const { activeStates, activeEmployeeRanges } = parseFilterParams(searchParams);
  const showStateFilter = true; // Always show state filter dropdown

  const totalCount = await countCompaniesByCategoryAndState(category, state || null, {
    stateSlugs: !state ? activeStates : [],
    employeeRanges: activeEmployeeRanges,
  });

  const totalPages   = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage  = Math.min(Math.max(1, parseInt(pageParam, 10) || 1), totalPages);

  const [pageCompanies, stateCounts, stats] = await Promise.all([
    fetchCompaniesByCategoryAndState(category, state || null, '-avg_rating', PAGE_SIZE, (currentPage - 1) * PAGE_SIZE, {
      stateSlugs: !state ? activeStates : [],
      employeeRanges: activeEmployeeRanges,
    }),
    fetchStateCountsForCategory(category),
    fetchCategoryStats(category, state || undefined),
  ]);

  const pageTitleNoun = categoryTitleNoun(cat) || `${categoryName} Companies`;
  const pageTitle    = stateName
    ? `Top ${Math.min(totalCount, PAGE_SIZE)} ${pageTitleNoun} in ${stateName} ${SEO_YEAR}`
    : cat?.hubH1 || `${pageTitleNoun} in the US`;
  const basePath     = state ? `/${category}/${state}` : `/${category}`;

  const rankOffset    = (currentPage - 1) * PAGE_SIZE;

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: pageTitle,
    url: `${_BASE}${basePath}`,
    numberOfItems: pageCompanies.length,
    itemListElement: pageCompanies.map((company, i) => ({
      '@type': 'ListItem',
      position: rankOffset + i + 1,
      name: company.name,
      description: getCompanyDescription(company),
      url: `${_BASE}/company/${company.slug}`,
    })),
  };

  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Home',       item: _BASE },
    { '@type': 'ListItem', position: 2, name: categoryName, item: `${_BASE}/${category}` },
  ];
  if (stateName) {
    breadcrumbItems.push({ '@type': 'ListItem', position: 3, name: stateName, item: `${_BASE}${basePath}` });
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  };

  const faqJsonLd = state
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: generateCategoryStateFAQs({
          categorySlug: category,
          categoryName: cat?.shortName || categoryName,
          stateSlug: state,
          stateName,
          totalCount: totalCount,
          verifiedCount: stats.verifiedCount,
          medianRating: stats.medianRating,
          topSpecialties: stats.topSpecialties,
        }).map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      }
    : null;

  return (
    <>
      <JsonLd data={itemListJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      {faqJsonLd && <JsonLd data={faqJsonLd} />}

      <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>

        {/* ── Page header ─────────────────────────────────────────── */}
        <div style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div className="mx-auto max-w-[var(--max-width)] px-4 pt-6 pb-5 sm:px-6 sm:pt-10 sm:pb-9">

            {/* Breadcrumb */}
            <nav className="scrollbar-hide" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 20,
              flexWrap: 'nowrap',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              WebkitOverflowScrolling: 'touch',
            }}>
              <Link href="/" className="breadcrumb-link" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 500, flexShrink: 0 }}>
                Home
              </Link>
              <span style={{ color: '#cbd5e1', fontSize: 13, flexShrink: 0 }}>/</span>
              {stateName ? (
                <>
                  <Link href={`/${category}`} className="breadcrumb-link" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 500, flexShrink: 0 }}>
                    {categoryName}
                  </Link>
                  <span style={{ color: '#cbd5e1', fontSize: 13, flexShrink: 0 }}>/</span>
                  <Link href={`/states/${state}`} className="breadcrumb-link" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 500, flexShrink: 0 }}>
                    {stateName} Hub
                  </Link>
                </>
              ) : (
                <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 500, flexShrink: 0 }}>{categoryName}</span>
              )}
            </nav>

            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 9999,
              padding: '4px 12px',
              marginBottom: 16,
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{categoryName}</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
              <div>
                <h1 style={{
                  fontSize: 'clamp(28px, 4vw, 44px)',
                  fontWeight: 700,
                  color: '#0f172a',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.1,
                  marginBottom: 10,
                  marginTop: 0,
                }}>
                  {pageTitle}
                </h1>
                {state ? (
                  <p style={{ fontSize: 14, color: '#475569', margin: 0, lineHeight: 1.6, maxWidth: 640 }}>
                    {generateDynamicCategoryStateAboveFoldText({
                      categorySlug: category,
                      categoryName: cat?.shortName || categoryName,
                      stateSlug: state,
                      stateName,
                      totalCount: totalCount,
                    })}
                  </p>
                ) : (
                  <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    Grouped by category and location. Updated monthly.
                  </p>
                )}
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 9999,
                padding: '8px 16px',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
                flexShrink: 0,
                gap: 14,
                height: 'fit-content'
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{totalCount}</span>
                  <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, letterSpacing: '0.02em', lineHeight: 1 }}>listings</span>
                </div>
                {!stateName && stats?.statesCovered > 0 && (
                  <>
                    <div style={{ width: 1, height: 16, backgroundColor: '#cbd5e1' }} />
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{stats.statesCovered}</span>
                      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, letterSpacing: '0.02em', lineHeight: 1 }}>states</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────────────── */}
        <div className="mx-auto max-w-[var(--max-width)] px-4 pt-5 pb-12 sm:px-6 sm:pt-8 sm:pb-16">

          {/* ── Filter Bar ── */}
          {/* Suspense: FilterBar calls useSearchParams(), which Next requires
              to sit behind a boundary once the page is statically prerendered. */}
          <Suspense fallback={null}>
            <FilterBar
              basePath={basePath}
              activeStates={activeStates}
              activeEmployeeRanges={activeEmployeeRanges}
              stateCounts={stateCounts}
              showStateFilter={showStateFilter}
              subcategories={cat?.subcategories}
              category={category}
              currentSubcategory={null}
              currentState={state || null}
            />
          </Suspense>

          {/* ── Ranked list ─────────────────────────────────────── */}
          <div style={{ minWidth: 0, marginTop: 24 }}>
            {stateName && (
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.65, margin: '0 0 24px' }}>
                Comparing {totalCount} {cat?.noun || categoryName.toLowerCase()} headquartered in {stateName}, sorted by
                rating. Request quotes directly from suppliers, or {' '}
                <Link href="/list-your-company" style={{ color: '#1A2E4A', textDecoration: 'underline', textUnderlineOffset: 2 }}>
                  list your own company
                </Link>{' '}
                to reach buyers searching {stateName}.
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
                All {cat?.shortName || categoryName}{stateName ? ` in ${stateName}` : ' in the US'}
              </h2>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Sorted by rating</p>
            </div>

            {totalCount === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 24px', color: '#64748b' }}>
                {(activeStates.length || activeEmployeeRanges.length) ? (
                  <>
                    <p style={{ fontSize: 17, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>No companies match these filters</p>
                    <Link href={basePath} style={{ color: '#1A2E4A', textDecoration: 'underline', textUnderlineOffset: 2 }}>
                      Clear filters
                    </Link>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 17, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>No listings yet</p>
                    <p style={{ fontSize: 14 }}>Be the first {categoryName}{stateName ? ` in ${stateName}` : ' in the US'} to get listed.</p>
                    <Link href="/list-your-company" style={{
                      display: 'inline-flex',
                      marginTop: 16,
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      fontSize: 13,
                      fontWeight: 600,
                      padding: '10px 20px',
                      borderRadius: 8,
                      textDecoration: 'none',
                    }}>
                      List Your Company
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pageCompanies.map((company, i) => (
                  <CompanyCard key={company.slug} company={company} />
                ))}
              </div>
            )}

            {/* Pagination moved to /search: this page is prebuilt at deploy and
                cannot read ?page=. Page 2+ was already noindex, so nothing
                indexable is lost. See HISTORY.md 2026-09-05. */}
            {totalCount > PAGE_SIZE && (
              <div style={{ textAlign: 'center', marginTop: 28 }}>
                <Link
                  href={`/search?category=${encodeURIComponent(category)}${state ? `&state=${encodeURIComponent(state)}` : ''}`}
                  style={{
                    display: 'inline-block', fontSize: 14, fontWeight: 500,
                    color: '#1A2E4A', padding: '10px 18px', borderRadius: 8,
                    border: '1px solid #e2e8f0', textDecoration: 'none',
                    backgroundColor: '#ffffff',
                  }}
                >
                  View all {totalCount} companies →
                </Link>
              </div>
            )}

            <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 24, lineHeight: 1.6 }}>
              Listings are grouped by category and location. Paid placements are never accepted.{' '}
              <Link href="/list-your-company" style={{ color: '#1A2E4A', textDecoration: 'underline', textUnderlineOffset: 2 }}>
                Add your company
              </Link>
            </p>

            {/* ── Relocated sidebar content ── */}

            {/* Other categories */}
            <OtherCategoriesCard
              categories={SIDEBAR_CATEGORIES_FULL}
              activeCategory={category}
              state={state}
              stateName={stateName}
            />

            {/* Browse by Specialty in State */}
            {stateName && cat?.subcategories && cat.subcategories.length > 0 && (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, marginTop: 14 }}>
                <h3 style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 12, marginTop: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Browse {cat.shortName || categoryName} in {stateName} by Specialty
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px 16px' }}>
                  {cat.subcategories.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/${category}/${sub.slug}/${state}`}
                      className="specialty-link"
                      style={{
                        fontSize: 13,
                        color: '#475569',
                        textDecoration: 'none',
                        transition: 'color 0.12s',
                      }}
                    >
                      {sub.name} in {stateName}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, marginTop: 14 }}>
              <h3 style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 12, marginTop: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Top States
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {TOP_STATES.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/${category}/${s.slug}`}
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      padding: '5px 10px',
                      borderRadius: 9999,
                      border: '1px solid',
                      textDecoration: 'none',
                      transition: 'all 0.12s',
                      borderColor: s.slug === state ? '#1A2E4A' : '#e2e8f0',
                      backgroundColor: s.slug === state ? '#1A2E4A' : '#ffffff',
                      color: s.slug === state ? '#ffffff' : '#475569',
                    }}
                    className={`sidebar-state-pill${s.slug === state ? ' active' : ''}`}
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{ background: 'linear-gradient(160deg, #0F172A, #070D18)', borderRadius: 12, padding: 20, marginTop: 14 }}>
              <Shield style={{ width: 22, height: 22, color: 'rgba(255,255,255,0.7)', marginBottom: 12 }} />
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#ffffff', marginBottom: 6, marginTop: 0 }}>List Your Company</h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 14, marginTop: 0 }}>
                Appear in ranked lists across all 50 states. Reach buyers actively searching.
              </p>
              <Link
                href="/list-your-company"
                style={{
                  display: 'inline-block',
                  textAlign: 'center',
                  backgroundColor: '#F5A623',
                  color: '#1A2E4A',
                  fontWeight: 600,
                  fontSize: 12,
                  padding: '9px 20px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  transition: 'background 0.12s',
                }}
                className="cta-btn"
              >
                Get Listed
              </Link>
            </div>
          </div>
        </div>

        {/* ── Category description / FAQ / Related Links (rendered on both nationwide and state pages) ── */}
        {((!stateName && cat?.longDescription) || (stateName && totalCount > 0)) && (
          <section style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', paddingTop: 48, paddingBottom: 64 }} className="px-6 lg:px-8">
            <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}>
              
              {/* Main description card */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
                padding: '28px 32px',
                display: 'flex',
                gap: 20,
                alignItems: 'flex-start',
                marginBottom: 32,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: 'rgba(212,160,23,0.12)',
                  flexShrink: 0,
                }}>
                  <Info size={17} style={{ color: '#D4A017' }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em', margin: '0 0 10px' }}>
                    {stateName ? `About ${cat.shortName} in ${stateName}` : `About ${cat.shortName}`}
                  </h2>
                  <p style={{ fontSize: 14, lineHeight: 1.75, color: '#475569', margin: 0, maxWidth: 820 }}>
                    {stateName
                      ? generateDynamicCategoryStateOnPageText({
                          categorySlug: category,
                          categoryName: cat.shortName,
                          stateSlug: state,
                          stateName,
                          totalCount: totalCount,
                          verifiedCount: stats.verifiedCount,
                          medianRating: stats.medianRating,
                          topSpecialties: stats.topSpecialties,
                          subcategories: cat.subcategories,
                        })
                      : cat.longDescription}
                  </p>
                </div>
              </div>

              {/* FAQ Block (State pages only) */}
              {stateName && (
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
                  padding: '28px 32px',
                  marginBottom: 32,
                }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em', margin: '0 0 20px' }}>
                    Frequently Asked Questions
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {generateCategoryStateFAQs({
                      categorySlug: category,
                      categoryName: cat.shortName,
                      stateSlug: state,
                      stateName,
                      totalCount: totalCount,
                      verifiedCount: stats.verifiedCount,
                      medianRating: stats.medianRating,
                      topSpecialties: stats.topSpecialties,
                    }).map((faq, i) => (
                      <div key={i} style={{ borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none', paddingBottom: i < 2 ? 20 : 0 }}>
                        <h4 style={{ fontSize: 14.5, fontWeight: 600, color: '#0f172a', margin: '0 0 8px' }}>
                          {faq.q}
                        </h4>
                        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#475569', margin: 0 }}>
                          {faq.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related/Neighboring States Horizontal Links */}
              {stateName && (
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
                  padding: '24px 32px',
                }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 16px' }}>
                    Neighboring States
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {getNeighboringStates(state).map((ns) => (
                      <Link
                        key={ns.slug}
                        href={`/${category}/${ns.slug}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 9999,
                          padding: '6px 14px',
                          fontSize: 13,
                          fontWeight: 500,
                          color: '#475569',
                          textDecoration: 'none',
                          transition: 'all 0.12s',
                        }}
                        className="sidebar-state-pill"
                      >
                        {ns.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </section>
        )}
      </div>

      <style>{`
        .breadcrumb-link:hover { color: #0f172a !important; }
        .sidebar-cat-link:not(.active):hover { background-color: #ffffff !important; color: #0f172a !important; }
        .sidebar-state-pill:not(.active):hover { border-color: #94a3b8 !important; color: #0f172a !important; }
        .cta-btn:hover { background-color: #D48E1A !important; }
        .specialty-link:hover { color: #F5A623 !important; }
      `}</style>
    </>
  );
}
