import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import { BASE_URL } from '@/lib/seo';
import { Shield } from 'lucide-react';
import CompanyCard from '@/components/listing/CompanyCard';
import { fetchCompaniesByCategoryAndState, fetchStateCountsForCategory, fetchCategoryStats, filterCompaniesBySubcategoryKeywords } from '@/db/neonApi';
import { MANUFACTURING_CATEGORIES, CATEGORY_MAP, CATEGORY_SLUGS } from '@/lib/manufacturingCategories';
import { ALL_US_STATES } from '@/lib/usStates';
import { getCompanyDescription } from '@/utils';
import FilterBar from '@/components/listing/FilterBar';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 25;

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

const VALID_CATEGORIES = new Set(CATEGORY_SLUGS);
const VALID_STATES = new Set(ALL_US_STATES.map((s) => s.slug));

function toTitleCase(slug) {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function buildFilterQueryString(activeEmployeeRanges, page) {
  const params = new URLSearchParams();
  if (activeEmployeeRanges.length) params.set('employees', activeEmployeeRanges.join(','));
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `?${query}` : '';
}

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

export async function generateMetadata({ params, searchParams }) {
  const { category, state: subcategory, subcategory: state } = await params;
  const sParams = (await searchParams) || {};
  const { page: pageParam } = sParams;

  if (
    VALID_STATES.has(category) &&
    VALID_CATEGORIES.has(subcategory) &&
    CATEGORY_MAP[subcategory]?.subcategories.some((s) => s.slug === state)
  ) {
    const query = new URLSearchParams(sParams).toString();
    const target = query ? `/${subcategory}/${state}/${category}?${query}` : `/${subcategory}/${state}/${category}`;
    permanentRedirect(target);
  }

  const cat = CATEGORY_MAP[category];
  if (!cat) return { title: 'Not Found' };

  const sub = cat.subcategories.find((s) => s.slug === subcategory);
  const subName  = sub?.name || toTitleCase(subcategory);
  const stateName = toTitleCase(state);
  
  // Fetch parent-category companies, then narrow in-app by the subcategory's
  // keywords (no subcategory column exists in the DB yet). Fall back to the
  // unfiltered list when no keyword matches — never an empty results page.
  const keywords = sub?.keywords || [];
  const allCompanies = await fetchCompaniesByCategoryAndState(category, state, '-avg_rating', 500);
  const filteredCompanies = filterCompaniesBySubcategoryKeywords(allCompanies, keywords);
  const companies = filteredCompanies.length > 0 ? filteredCompanies : allCompanies;
  const totalPages    = Math.max(1, Math.ceil(companies.length / PAGE_SIZE));
  const clampedPage   = Math.min(Math.max(1, parseInt(pageParam, 10) || 1), totalPages);
  
  const pageSuffix = clampedPage > 1 ? ` — Page ${clampedPage}` : '';
  const pageQuery = clampedPage > 1 ? `?page=${clampedPage}` : '';

  const title = clampedPage > 1
    ? `${subName} in ${stateName}${pageSuffix}`
    : `Top ${companies.length} ${subName} Manufacturers in ${stateName}`;
    
  const stats = await fetchCategoryStats(category, state);
  const description = `Find ${subName.toLowerCase()} manufacturers in ${stateName}. Part of the ${cat.name} directory. No paid placements.`;
  const canonical = `${_BASE}/${category}/${subcategory}/${state}${pageQuery}`;

  return {
    title,
    description,
    alternates: { canonical },
    robots: (clampedPage > 1 || companies.length < 5) ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: { title, description, type: 'website', url: canonical },
  };
}

export function generateStaticParams() {
  return [];
}



// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SubcategoryStatePage({ params, searchParams }) {
  const { category, state: subcategory, subcategory: state } = await params;

  if (
    VALID_STATES.has(category) &&
    VALID_CATEGORIES.has(subcategory) &&
    CATEGORY_MAP[subcategory]?.subcategories.some((s) => s.slug === state)
  ) {
    const sp = await searchParams;
    const query = new URLSearchParams(sp).toString();
    const target = query ? `/${subcategory}/${state}/${category}?${query}` : `/${subcategory}/${state}/${category}`;
    permanentRedirect(target);
  }

  const sParams = await searchParams;
  const pageParam = sParams?.page;
  const employeesParam = sParams?.employees;
  const activeEmployeeRanges = employeesParam ? String(employeesParam).split(',').filter(Boolean) : [];

  const cat = CATEGORY_MAP[category];
  if (!cat || !VALID_CATEGORIES.has(category)) notFound();

  const sub = cat.subcategories.find((s) => s.slug === subcategory);
  if (!sub) notFound();

  const stateName = toTitleCase(state);

  // Fetch parent-category companies, then narrow in-app by the subcategory's
  // keywords (no subcategory column exists in the DB yet). Fall back to the
  // unfiltered list when no keyword matches — never an empty results page.
  const keywords = sub?.keywords || [];
  const [allCompanies, stateCounts] = await Promise.all([
    fetchCompaniesByCategoryAndState(category, state, '-avg_rating', 500, {
      employeeRanges: activeEmployeeRanges,
    }),
    fetchStateCountsForCategory(category),
  ]);
  const filteredCompanies = filterCompaniesBySubcategoryKeywords(allCompanies, keywords);
  const companies = filteredCompanies.length > 0 ? filteredCompanies : allCompanies;

  const totalPages    = Math.max(1, Math.ceil(companies.length / PAGE_SIZE));
  const currentPage   = Math.min(Math.max(1, parseInt(pageParam, 10) || 1), totalPages);
  const pageTitle = currentPage === 1
    ? `Top ${companies.length} ${sub.name} Manufacturers in ${stateName}`
    : `${sub.name} Manufacturers in ${stateName}`;
  const pageCompanies = companies.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rankOffset     = (currentPage - 1) * PAGE_SIZE;
  const basePath       = `/${category}/${subcategory}/${state}`;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',            item: _BASE },
      { '@type': 'ListItem', position: 2, name: cat.shortName,     item: `${_BASE}/${category}` },
      { '@type': 'ListItem', position: 3, name: sub.name,          item: `${_BASE}/${category}/${subcategory}` },
      { '@type': 'ListItem', position: 4, name: stateName,         item: `${_BASE}/${category}/${subcategory}/${state}` },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />

      <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>

        {/* ── Page header ── */}
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
              <Link href="/" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 500, flexShrink: 0 }}>Home</Link>
              <span style={{ color: '#cbd5e1', fontSize: 13, flexShrink: 0 }}>/</span>
              <Link href={`/${category}`} style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 500, flexShrink: 0 }}>{cat.shortName}</Link>
              <span style={{ color: '#cbd5e1', fontSize: 13, flexShrink: 0 }}>/</span>
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, flexShrink: 0 }}>{sub.name}</span>
              <span style={{ color: '#cbd5e1', fontSize: 13, flexShrink: 0 }}>/</span>
              <Link href={`/${category}/${state}`} style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 500, flexShrink: 0 }}>{stateName}</Link>
            </nav>

            {/* Category badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: cat.accent, borderRadius: 9999, padding: '4px 12px', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: cat.accentText, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{cat.shortName}</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
              <div>
                <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 10, marginTop: 0 }}>
                  {pageTitle}
                </h1>
                <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
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
                height: 'fit-content'
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{companies.length}</span>
                  <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, letterSpacing: '0.02em', lineHeight: 1 }}>listings</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Content ── */}
        <div className="mx-auto max-w-[var(--max-width)] px-4 pt-5 pb-12 sm:px-6 sm:pt-8 sm:pb-16">
          <FilterBar
            basePath={basePath}
            activeStates={[]}
            activeEmployeeRanges={activeEmployeeRanges}
            stateCounts={stateCounts}
            showStateFilter={true}
            subcategories={cat?.subcategories}
            category={category}
            currentSubcategory={subcategory}
            currentState={state}
          />

          <div style={{ display: 'flex', flexDirection: 'row', gap: 28, marginTop: 24 }} className="listing-layout">

            {/* ── Company list ── */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {companies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 24px', color: '#64748b' }}>
                  <p style={{ fontSize: 17, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>No listings yet</p>
                  <p style={{ fontSize: 14 }}>Be the first {sub.name} company in {stateName} to get listed.</p>
                  <Link href="/list-your-company" style={{ display: 'inline-flex', marginTop: 16, backgroundColor: '#0f172a', color: '#ffffff', fontSize: 13, fontWeight: 600, padding: '10px 20px', borderRadius: 8, textDecoration: 'none' }}>
                    List Your Company
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pageCompanies.map((company, i) => (
                    <CompanyCard
                      key={company.slug}
                      company={company}
                      rank={rankOffset + i}
                    />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 28, flexWrap: 'wrap' }} aria-label="Pagination">
                  <Link
                    href={`${basePath}${buildFilterQueryString(activeEmployeeRanges, currentPage - 1)}`}
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
                        href={`${basePath}${buildFilterQueryString(activeEmployeeRanges, n)}`}
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
                    href={`${basePath}${buildFilterQueryString(activeEmployeeRanges, currentPage + 1)}`}
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
            </div>

            {/* ── Sidebar ── */}
            <aside style={{ width: 264, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }} className="listing-sidebar">

              {/* Other subcategories */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
                <h3 style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 12, marginTop: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {cat.shortName} in {stateName}
                </h3>
                <Link href={`/${category}/${state}`} className="sidebar-back-link" style={{ display: 'block', padding: '8px 10px', borderRadius: 8, fontSize: 13, textDecoration: 'none', color: '#64748b', marginBottom: 4, transition: 'background 0.1s' }}>
                  ← All {cat.shortName}
                </Link>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {cat.subcategories.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/${category}/${s.slug}/${state}`}
                      style={{
                        display: 'block',
                        padding: '8px 10px',
                        borderRadius: 8,
                        fontSize: 13,
                        textDecoration: 'none',
                        transition: 'background 0.1s',
                        color: s.slug === subcategory ? '#0f172a' : '#475569',
                        backgroundColor: s.slug === subcategory ? '#ffffff' : 'transparent',
                        fontWeight: s.slug === subcategory ? 600 : 400,
                        border: s.slug === subcategory ? '1px solid #e2e8f0' : '1px solid transparent',
                      }}
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div style={{ background: 'linear-gradient(160deg, #0F172A, #070D18)', borderRadius: 12, padding: 20 }}>
                <Shield style={{ width: 22, height: 22, color: 'rgba(255,255,255,0.7)', marginBottom: 12 }} />
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#ffffff', marginBottom: 6, marginTop: 0 }}>List Your Company</h3>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 14, marginTop: 0 }}>
                  Appear in ranked lists across all 50 states. Reach buyers actively searching.
                </p>
                <Link href="/list-your-company" className="cta-btn" style={{ display: 'block', textAlign: 'center', backgroundColor: '#F5A623', color: '#1A2E4A', fontWeight: 600, fontSize: 12, padding: '9px 16px', borderRadius: 8, textDecoration: 'none', transition: 'background 0.12s' }}>
                  Get Listed
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .listing-layout { flex-direction: column !important; }
          .listing-sidebar { width: 100% !important; }
        }
        .company-card:hover { border-color: #94a3b8 !important; box-shadow: 0 4px 16px -4px rgba(15,23,42,0.07) !important; }
        .sidebar-back-link:hover { background-color: #ffffff !important; color: #0f172a !important; }
        .cta-btn:hover { background-color: #D48E1A !important; }
      `}</style>
    </>
  );
}
