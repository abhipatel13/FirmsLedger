import { notFound } from 'next/navigation';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { BASE_URL, SITE_NAME } from '@/lib/seo';
import { Shield, Info } from 'lucide-react';
import { fetchCompaniesByCategoryAndState, fetchStateCountsForCategory, fetchCategoryStats } from '@/db/neonApi';
import { MANUFACTURING_CATEGORIES, CATEGORY_MAP, CATEGORY_SLUGS, ALL_SUBCATEGORY_SLUGS } from '@/lib/manufacturingCategories';
import CompanyCard from '@/components/listing/CompanyCard';
import FilterBar from '@/components/listing/FilterBar';
import StatsBand from '@/components/listing/StatsBand';
import OtherCategoriesCard from '@/components/listing/OtherCategoriesCard';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

const VALID_CATEGORIES = new Set(CATEGORY_SLUGS);

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
  const delta = 1;
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

export async function generateMetadata({ params, searchParams }) {
  const { category, state } = await params;
  const { page: pageParam } = (await searchParams) || {};
  const page = parseInt(pageParam, 10) || 1;
  const pageSuffix = page > 1 ? ` — Page ${page}` : '';
  const pageQuery = page > 1 ? `?page=${page}` : '';

  if (!VALID_CATEGORIES.has(category)) return { title: `Not Found | ${SITE_NAME}` };

  const cat = CATEGORY_MAP[category];

  // Subcategory hub
  if (ALL_SUBCATEGORY_SLUGS.has(state)) {
    const sub = cat?.subcategories.find((s) => s.slug === state);
    const subName = sub?.name || toTitleCase(state);
    const title = `${subName} Manufacturers — All 50 US States${pageSuffix}`;
    const stats = await fetchCategoryStats(category);
    const description = stats.totalCount > 0
      ? `Browse ${stats.verifiedCount} verified ${subName.toLowerCase()} manufacturers across the US. ${stats.totalCount} total listings with ${stats.medianRating ? `an average rating of ${stats.medianRating.toFixed(1)}` : 'verified reviews'}. Part of the ${cat?.name} directory on FirmsLedger.`
      : `Find verified ${subName.toLowerCase()} manufacturers across all 50 US states. Browse by state or compare top-rated companies. Part of the ${cat?.name} directory on FirmsLedger.`;
    const canonical = `${_BASE}/${category}/${state}${pageQuery}`;
    return {
      title: `${title} | ${SITE_NAME}`,
      description,
      alternates: { canonical },
      robots: { index: false, follow: true },
      openGraph: { title, description, type: 'website', url: canonical },
    };
  }

  // State listing
  const categoryName = cat?.name || toTitleCase(category);
  const stateName    = toTitleCase(state);
  const title        = `${categoryName} in ${stateName}${pageSuffix}`;
  const stats        = await fetchCategoryStats(category, state);
  const description  = stats.totalCount > 0
    ? `Browse ${stats.verifiedCount} verified ${cat?.noun || categoryName.toLowerCase()} in ${stateName}. ${stats.totalCount} total listings with ${stats.medianRating ? `an average rating of ${stats.medianRating.toFixed(1)}` : 'verified reviews'}. No paid placements.`
    : `Find verified ${cat?.noun || categoryName.toLowerCase()} in ${stateName}. Compare companies by rating, reviews, and specialization. No paid placements.`;
  const canonical    = `${_BASE}/${category}/${state}${pageQuery}`;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical },
    robots: page > 1 ? { index: false, follow: true } : undefined,
    openGraph: { title, description, type: 'website', url: canonical },
  };
}

export function generateStaticParams() {
  return [];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CategoryStatePage({ params, searchParams }) {
  const { category, state } = await params;
  const sp = await searchParams;
  return renderCategoryPage({ category, state, pageParam: sp.page, searchParams: sp });
}

export async function renderCategoryPage({ category, state, pageParam, searchParams = {} }) {
  if (!VALID_CATEGORIES.has(category)) notFound();

  const cat = CATEGORY_MAP[category];

  // ── Branch: subcategory hub — nationwide listing, same flow as category ──
  if (state && ALL_SUBCATEGORY_SLUGS.has(state)) {
    const sub = cat.subcategories.find((s) => s.slug === state);
    if (!sub) notFound();

    const subcategory = state;
    const canonical = `${_BASE}/${category}/${subcategory}`;
    const basePath = `/${category}/${subcategory}`;
    const pageTitle = `Top ${sub.name} Manufacturers in the US`;

    // No subcategory tagging exists in the DB yet, so this shows the parent
    // category's nationwide companies — same data source as the category page.
    const { activeStates, activeEmployeeRanges } = parseFilterParams(searchParams);
    const [companies, stateCounts, stats] = await Promise.all([
      fetchCompaniesByCategoryAndState(category, null, '-avg_rating', 500, { stateSlugs: activeStates, employeeRanges: activeEmployeeRanges }),
      fetchStateCountsForCategory(category),
      fetchCategoryStats(category),
    ]);

    const totalPages    = Math.max(1, Math.ceil(companies.length / PAGE_SIZE));
    const currentPage   = Math.min(Math.max(1, parseInt(pageParam, 10) || 1), totalPages);
    const pageCompanies = companies.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const rankOffset    = (currentPage - 1) * PAGE_SIZE;

    const itemListJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: pageTitle,
      url: canonical,
      numberOfItems: companies.length,
      itemListElement: companies.map((company, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: company.name,
        description: company.description,
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
            <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '40px 24px 36px' }}>

              {/* Breadcrumb */}
              <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
                <Link href="/" className="breadcrumb-link" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 500 }}>Home</Link>
                <span style={{ color: '#cbd5e1', fontSize: 13 }}>/</span>
                <Link href={`/${category}`} className="breadcrumb-link" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 500 }}>{cat.shortName}</Link>
                <span style={{ color: '#cbd5e1', fontSize: 13 }}>/</span>
                <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 500 }}>{sub.name}</span>
              </nav>

              {/* Category badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: cat.accent, borderRadius: 9999, padding: '4px 12px', marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: cat.accentText, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{cat.shortName}</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20 }}>
                <div>
                  <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 10, marginTop: 0 }}>
                    {pageTitle}
                  </h1>
                  <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.5, maxWidth: 520 }}>
                    Ranked by verified reviews and ratings. Updated monthly.
                  </p>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 9999, padding: '6px 14px', flexShrink: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{companies.length}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>verified listings</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Stats strip ── */}
          <StatsBand stats={stats} categoryNoun={cat?.noun || 'manufacturers'} stateName={null} showStatesCovered />

          {/* ── Content ── */}
          <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '32px 24px 64px' }}>

            {/* ── Filter Bar ── */}
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

            {/* ── Ranked list ── */}
            <div style={{ minWidth: 0, marginTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
                  All {sub.name} in the US
                </h2>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Sorted by rating</p>
              </div>

              {companies.length === 0 ? (
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
                    <CompanyCard key={company.slug} company={company} rank={rankOffset + i} />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 28, flexWrap: 'wrap' }} aria-label="Pagination">
                  <Link
                    href={`${basePath}${buildFilterQueryString(activeStates, activeEmployeeRanges, currentPage - 1)}`}
                    aria-disabled={currentPage === 1}
                    style={{
                      pointerEvents: currentPage === 1 ? 'none' : 'auto',
                      opacity: currentPage === 1 ? 0.4 : 1,
                      fontSize: 13, fontWeight: 500, color: '#475569',
                      padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
                      textDecoration: 'none', backgroundColor: '#ffffff',
                    }}
                  >
                    ← Prev
                  </Link>

                  {paginationRange(currentPage, totalPages).map((n, i) =>
                    n === '…' ? (
                      <span key={`dots-${i}`} style={{ fontSize: 13, color: '#94a3b8', padding: '8px 4px' }}>…</span>
                    ) : (
                      <Link
                        key={n}
                        href={`${basePath}${buildFilterQueryString(activeStates, activeEmployeeRanges, n)}`}
                        aria-current={n === currentPage ? 'page' : undefined}
                        style={{
                          fontSize: 13, fontWeight: 600,
                          minWidth: 34, textAlign: 'center',
                          padding: '8px 10px', borderRadius: 8,
                          textDecoration: 'none',
                          color: n === currentPage ? '#ffffff' : '#475569',
                          backgroundColor: n === currentPage ? '#1A2E4A' : '#ffffff',
                          border: n === currentPage ? '1px solid #1A2E4A' : '1px solid #e2e8f0',
                        }}
                      >
                        {n}
                      </Link>
                    )
                  )}

                  <Link
                    href={`${basePath}${buildFilterQueryString(activeStates, activeEmployeeRanges, currentPage + 1)}`}
                    aria-disabled={currentPage === totalPages}
                    style={{
                      pointerEvents: currentPage === totalPages ? 'none' : 'auto',
                      opacity: currentPage === totalPages ? 0.4 : 1,
                      fontSize: 13, fontWeight: 500, color: '#475569',
                      padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
                      textDecoration: 'none', backgroundColor: '#ffffff',
                    }}
                  >
                    Next →
                  </Link>
                </nav>
              )}

              <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 24, lineHeight: 1.6 }}>
                Rankings are based on verified reviews and ratings only. Paid placements are never accepted.{' '}
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
  const showStateFilter = !state; // nationwide only
  const [companies, stateCounts, stats] = await Promise.all([
    fetchCompaniesByCategoryAndState(category, state || null, '-avg_rating', 500, {
      stateSlugs: showStateFilter ? activeStates : [],
      employeeRanges: activeEmployeeRanges,
    }),
    showStateFilter ? fetchStateCountsForCategory(category) : Promise.resolve([]),
    fetchCategoryStats(category, state || undefined),
  ]);
  const pageTitle    = stateName ? `Top ${categoryName} in ${stateName}` : `Top ${categoryName} in the US`;
  const basePath     = state ? `/${category}/${state}` : `/${category}`;

  const totalPages   = Math.max(1, Math.ceil(companies.length / PAGE_SIZE));
  const currentPage  = Math.min(Math.max(1, parseInt(pageParam, 10) || 1), totalPages);
  const pageCompanies = companies.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rankOffset    = (currentPage - 1) * PAGE_SIZE;

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: pageTitle,
    url: `${_BASE}${basePath}`,
    numberOfItems: companies.length,
    itemListElement: companies.map((company, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: company.name,
      description: company.description,
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

  return (
    <>
      <JsonLd data={itemListJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>

        {/* ── Page header ─────────────────────────────────────────── */}
        <div style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '40px 24px 36px' }}>

            {/* Breadcrumb */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
              <Link href="/" className="breadcrumb-link" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 500 }}>
                Home
              </Link>
              <span style={{ color: '#cbd5e1', fontSize: 13 }}>/</span>
              {stateName ? (
                <>
                  <Link href={`/${category}`} className="breadcrumb-link" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 500 }}>
                    {categoryName}
                  </Link>
                  <span style={{ color: '#cbd5e1', fontSize: 13 }}>/</span>
                  <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 500 }}>{stateName}</span>
                </>
              ) : (
                <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 500 }}>{categoryName}</span>
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

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20 }}>
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
                <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Ranked by verified reviews and ratings. Updated monthly.
                </p>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 9999, padding: '6px 14px', flexShrink: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{companies.length}</span>
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>verified listings</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <StatsBand stats={stats} categoryNoun={cat?.noun || categoryName.toLowerCase()} stateName={stateName} showStatesCovered={!stateName} />

        {/* ── Content ─────────────────────────────────────────────── */}
        <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '32px 24px 64px' }}>

          {/* ── Filter Bar ── */}
          <FilterBar
            basePath={basePath}
            activeStates={activeStates}
            activeEmployeeRanges={activeEmployeeRanges}
            stateCounts={stateCounts}
            showStateFilter={showStateFilter}
            subcategories={cat?.subcategories}
            category={category}
            currentSubcategory={null}
            currentState={showStateFilter ? null : state}
          />

          {/* ── Ranked list ─────────────────────────────────────── */}
          <div style={{ minWidth: 0, marginTop: 24 }}>
            {stateName && (
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.65, margin: '0 0 24px' }}>
                Comparing {companies.length} {cat?.noun || categoryName.toLowerCase()} headquartered in {stateName}, ranked by
                verified customer reviews. Every profile below is manually screened before it goes live — request quotes
                directly from suppliers, or {' '}
                <Link href="/list-your-company" style={{ color: '#1A2E4A', textDecoration: 'underline', textUnderlineOffset: 2 }}>
                  list your own company
                </Link>{' '}
                to reach buyers searching {stateName}.
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
                All {categoryName}{stateName ? ` in ${stateName}` : ' in the US'}
              </h2>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Sorted by rating</p>
            </div>

            {companies.length === 0 ? (
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
                  <CompanyCard key={company.slug} company={company} rank={rankOffset + i} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 28, flexWrap: 'wrap' }} aria-label="Pagination">
                <Link
                  href={`${basePath}${buildFilterQueryString(activeStates, activeEmployeeRanges, currentPage - 1)}`}
                  aria-disabled={currentPage === 1}
                  style={{
                    pointerEvents: currentPage === 1 ? 'none' : 'auto',
                    opacity: currentPage === 1 ? 0.4 : 1,
                    fontSize: 13, fontWeight: 500, color: '#475569',
                    padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
                    textDecoration: 'none', backgroundColor: '#ffffff',
                  }}
                >
                  ← Prev
                </Link>

                {paginationRange(currentPage, totalPages).map((n, i) =>
                  n === '…' ? (
                    <span key={`dots-${i}`} style={{ fontSize: 13, color: '#94a3b8', padding: '8px 4px' }}>…</span>
                  ) : (
                    <Link
                      key={n}
                      href={`${basePath}${buildFilterQueryString(activeStates, activeEmployeeRanges, n)}`}
                      aria-current={n === currentPage ? 'page' : undefined}
                      style={{
                        fontSize: 13, fontWeight: 600,
                        minWidth: 34, textAlign: 'center',
                        padding: '8px 10px', borderRadius: 8,
                        textDecoration: 'none',
                        color: n === currentPage ? '#ffffff' : '#475569',
                        backgroundColor: n === currentPage ? '#1A2E4A' : '#ffffff',
                        border: n === currentPage ? '1px solid #1A2E4A' : '1px solid #e2e8f0',
                      }}
                    >
                      {n}
                    </Link>
                  )
                )}

                <Link
                  href={`${basePath}${buildFilterQueryString(activeStates, activeEmployeeRanges, currentPage + 1)}`}
                  aria-disabled={currentPage === totalPages}
                  style={{
                    pointerEvents: currentPage === totalPages ? 'none' : 'auto',
                    opacity: currentPage === totalPages ? 0.4 : 1,
                    fontSize: 13, fontWeight: 500, color: '#475569',
                    padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
                    textDecoration: 'none', backgroundColor: '#ffffff',
                  }}
                >
                  Next →
                </Link>
              </nav>
            )}

            <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 24, lineHeight: 1.6 }}>
              Rankings are based on verified reviews and ratings only. Paid placements are never accepted.{' '}
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

            {!showStateFilter ? (
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
            ) : null}

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

        {/* ── Category description (nationwide category page only) ── */}
        {!stateName && cat?.longDescription && (
          <section style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', paddingTop: 48, paddingBottom: 48 }} className="px-6 lg:px-8">
            <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}>
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
                padding: '28px 32px',
                display: 'flex',
                gap: 20,
                alignItems: 'flex-start',
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
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em', margin: '0 0 10px' }}>
                    About {cat.shortName}
                  </h2>
                  <p style={{ fontSize: 14, lineHeight: 1.75, color: '#475569', margin: 0, maxWidth: 820 }}>
                    {cat.longDescription}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      <style>{`
        .breadcrumb-link:hover { color: #0f172a !important; }
        .sidebar-cat-link:not(.active):hover { background-color: #ffffff !important; color: #0f172a !important; }
        .sidebar-state-pill:not(.active):hover { border-color: #94a3b8 !important; color: #0f172a !important; }
        .cta-btn:hover { background-color: #D48E1A !important; }
      `}</style>
    </>
  );
}
