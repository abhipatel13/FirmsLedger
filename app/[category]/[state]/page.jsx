import { notFound } from 'next/navigation';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { BASE_URL, SITE_NAME } from '@/lib/seo';
import { CheckCircle, Star, MapPin, Shield, ArrowRight } from 'lucide-react';
import { fetchCompaniesByCategoryAndState } from '@/db/neonApi';
import { MANUFACTURING_CATEGORIES, CATEGORY_MAP, CATEGORY_SLUGS, ALL_SUBCATEGORY_SLUGS } from '@/lib/manufacturingCategories';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

const VALID_CATEGORIES = new Set(CATEGORY_SLUGS);

const SIDEBAR_CATEGORIES = MANUFACTURING_CATEGORIES.map((c) => ({
  slug: c.slug,
  name: c.shortName,
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

const ALL_US_STATES = [
  { name: 'Alabama',        slug: 'alabama',        abbr: 'AL' },
  { name: 'Alaska',         slug: 'alaska',         abbr: 'AK' },
  { name: 'Arizona',        slug: 'arizona',        abbr: 'AZ' },
  { name: 'Arkansas',       slug: 'arkansas',       abbr: 'AR' },
  { name: 'California',     slug: 'california',     abbr: 'CA' },
  { name: 'Colorado',       slug: 'colorado',       abbr: 'CO' },
  { name: 'Connecticut',    slug: 'connecticut',    abbr: 'CT' },
  { name: 'Delaware',       slug: 'delaware',       abbr: 'DE' },
  { name: 'Florida',        slug: 'florida',        abbr: 'FL' },
  { name: 'Georgia',        slug: 'georgia',        abbr: 'GA' },
  { name: 'Hawaii',         slug: 'hawaii',         abbr: 'HI' },
  { name: 'Idaho',          slug: 'idaho',          abbr: 'ID' },
  { name: 'Illinois',       slug: 'illinois',       abbr: 'IL' },
  { name: 'Indiana',        slug: 'indiana',        abbr: 'IN' },
  { name: 'Iowa',           slug: 'iowa',           abbr: 'IA' },
  { name: 'Kansas',         slug: 'kansas',         abbr: 'KS' },
  { name: 'Kentucky',       slug: 'kentucky',       abbr: 'KY' },
  { name: 'Louisiana',      slug: 'louisiana',      abbr: 'LA' },
  { name: 'Maine',          slug: 'maine',          abbr: 'ME' },
  { name: 'Maryland',       slug: 'maryland',       abbr: 'MD' },
  { name: 'Massachusetts',  slug: 'massachusetts',  abbr: 'MA' },
  { name: 'Michigan',       slug: 'michigan',       abbr: 'MI' },
  { name: 'Minnesota',      slug: 'minnesota',      abbr: 'MN' },
  { name: 'Mississippi',    slug: 'mississippi',    abbr: 'MS' },
  { name: 'Missouri',       slug: 'missouri',       abbr: 'MO' },
  { name: 'Montana',        slug: 'montana',        abbr: 'MT' },
  { name: 'Nebraska',       slug: 'nebraska',       abbr: 'NE' },
  { name: 'Nevada',         slug: 'nevada',         abbr: 'NV' },
  { name: 'New Hampshire',  slug: 'new-hampshire',  abbr: 'NH' },
  { name: 'New Jersey',     slug: 'new-jersey',     abbr: 'NJ' },
  { name: 'New Mexico',     slug: 'new-mexico',     abbr: 'NM' },
  { name: 'New York',       slug: 'new-york',       abbr: 'NY' },
  { name: 'North Carolina', slug: 'north-carolina', abbr: 'NC' },
  { name: 'North Dakota',   slug: 'north-dakota',   abbr: 'ND' },
  { name: 'Ohio',           slug: 'ohio',           abbr: 'OH' },
  { name: 'Oklahoma',       slug: 'oklahoma',       abbr: 'OK' },
  { name: 'Oregon',         slug: 'oregon',         abbr: 'OR' },
  { name: 'Pennsylvania',   slug: 'pennsylvania',   abbr: 'PA' },
  { name: 'Rhode Island',   slug: 'rhode-island',   abbr: 'RI' },
  { name: 'South Carolina', slug: 'south-carolina', abbr: 'SC' },
  { name: 'South Dakota',   slug: 'south-dakota',   abbr: 'SD' },
  { name: 'Tennessee',      slug: 'tennessee',      abbr: 'TN' },
  { name: 'Texas',          slug: 'texas',          abbr: 'TX' },
  { name: 'Utah',           slug: 'utah',           abbr: 'UT' },
  { name: 'Vermont',        slug: 'vermont',        abbr: 'VT' },
  { name: 'Virginia',       slug: 'virginia',       abbr: 'VA' },
  { name: 'Washington',     slug: 'washington',     abbr: 'WA' },
  { name: 'West Virginia',  slug: 'west-virginia',  abbr: 'WV' },
  { name: 'Wisconsin',      slug: 'wisconsin',      abbr: 'WI' },
  { name: 'Wyoming',        slug: 'wyoming',        abbr: 'WY' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toTitleCase(slug) {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const { category, state } = await params;
  if (!VALID_CATEGORIES.has(category)) return { title: `Not Found | ${SITE_NAME}` };

  const cat = CATEGORY_MAP[category];

  // Subcategory hub
  if (ALL_SUBCATEGORY_SLUGS.has(state)) {
    const sub = cat?.subcategories.find((s) => s.slug === state);
    const subName = sub?.name || toTitleCase(state);
    const title = `${subName} Manufacturers — All 50 US States`;
    const description = `Find verified ${subName.toLowerCase()} manufacturers across all 50 US states. Browse by state or compare top-rated companies. Part of the ${cat?.name} directory on FirmsLedger.`;
    const canonical = `${_BASE}/${category}/${state}`;
    return {
      title: `${title} | ${SITE_NAME}`,
      description,
      alternates: { canonical },
      openGraph: { title, description, type: 'website', url: canonical },
    };
  }

  // State listing
  const categoryName = cat?.name || toTitleCase(category);
  const stateName    = toTitleCase(state);
  const title        = `${categoryName} in ${stateName}`;
  const description  = `Find verified ${cat?.noun || categoryName.toLowerCase()} in ${stateName}. Compare companies by rating, reviews, and specialization. No paid placements.`;
  const canonical    = `${_BASE}/${category}/${state}`;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical },
    openGraph: { title, description, type: 'website', url: canonical },
  };
}

export function generateStaticParams() {
  return [];
}

// ─── Star row ─────────────────────────────────────────────────────────────────

function StarRow({ rating }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          style={{
            width: 13,
            height: 13,
            fill: n <= Math.round(rating) ? '#F5A623' : '#e2e8f0',
            color: n <= Math.round(rating) ? '#F5A623' : '#e2e8f0',
          }}
        />
      ))}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CategoryStatePage({ params, searchParams }) {
  const { category, state } = await params;
  const { page: pageParam } = await searchParams;
  return renderCategoryPage({ category, state, pageParam });
}

export async function renderCategoryPage({ category, state, pageParam }) {
  if (!VALID_CATEGORIES.has(category)) notFound();

  const cat = CATEGORY_MAP[category];

  // ── Branch: subcategory hub ──────────────────────────────────────────────
  if (state && ALL_SUBCATEGORY_SLUGS.has(state)) {
    const sub = cat.subcategories.find((s) => s.slug === state);
    if (!sub) notFound();

    const canonical = `${_BASE}/${category}/${state}`;

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
        <JsonLd data={breadcrumbJsonLd} />

        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>

          {/* ── Header ── */}
          <div style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ maxWidth: 1152, margin: '0 auto', padding: '40px 24px 36px' }}>

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
                    {sub.name} Manufacturers
                  </h1>
                  <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.5, maxWidth: 520 }}>
                    Browse verified {sub.name.toLowerCase()} manufacturers across all 50 US states.
                    Ranked by real reviews — no paid placements.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 20px', textAlign: 'center' }}>
                    <p style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>50</p>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: '3px 0 0', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>States</p>
                  </div>
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 20px', textAlign: 'center' }}>
                    <p style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>{cat.subcategories.length}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: '3px 0 0', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Subcategories</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Content ── */}
          <div style={{ maxWidth: 1152, margin: '0 auto', padding: '36px 24px 72px' }}>
            <div style={{ display: 'flex', gap: 28 }} className="listing-layout">

              {/* ── State grid ── */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 16px' }}>
                  Browse by state — {sub.name}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                  {ALL_US_STATES.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/${category}/${state}/${s.slug}`}
                      className="state-card"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 10,
                        padding: '12px 14px',
                        textDecoration: 'none',
                        transition: 'border-color 0.12s, box-shadow 0.12s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          width: 32,
                          height: 32,
                          borderRadius: 6,
                          backgroundColor: '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#475569',
                          flexShrink: 0,
                          letterSpacing: '0.03em',
                        }}>
                          {s.abbr}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{s.name}</span>
                      </div>
                      <ArrowRight style={{ width: 14, height: 14, color: '#cbd5e1', flexShrink: 0 }} />
                    </Link>
                  ))}
                </div>

                <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 32, lineHeight: 1.6 }}>
                  Rankings are based on verified reviews only. Paid placements are never accepted.{' '}
                  <Link href="/list-your-company" style={{ color: '#1A2E4A', textDecoration: 'underline', textUnderlineOffset: 2 }}>
                    Add your company
                  </Link>
                </p>
              </div>

              {/* ── Sidebar ── */}
              <aside style={{ width: 264, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }} className="listing-sidebar">

                {/* Other subcategories */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
                  <h3 style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 12, marginTop: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {cat.shortName} Subcategories
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {cat.subcategories.map((s) => (
                      <Link
                        key={s.slug}
                        href={`/${category}/${s.slug}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: 8,
                          fontSize: 13,
                          textDecoration: 'none',
                          transition: 'background 0.1s',
                          color: s.slug === state ? '#0f172a' : '#475569',
                          backgroundColor: s.slug === state ? '#ffffff' : 'transparent',
                          fontWeight: s.slug === state ? 600 : 400,
                          border: s.slug === state ? '1px solid #e2e8f0' : '1px solid transparent',
                        }}
                        className={`sidebar-cat-link${s.slug === state ? ' active' : ''}`}
                      >
                        <span>{s.name}</span>
                        {s.slug === state && <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8' }}>Current</span>}
                      </Link>
                    ))}
                  </div>
                  <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 10, paddingTop: 10 }}>
                    <Link
                      href={`/${category}`}
                      style={{ fontSize: 12, color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 6 }}
                      className="breadcrumb-link"
                    >
                      ← All {cat.shortName}
                    </Link>
                  </div>
                </div>

                {/* Top states for this subcategory */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
                  <h3 style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 12, marginTop: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Top States
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {TOP_STATES.map((s) => (
                      <Link
                        key={s.slug}
                        href={`/${category}/${state}/${s.slug}`}
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          padding: '5px 10px',
                          borderRadius: 9999,
                          border: '1px solid #e2e8f0',
                          textDecoration: 'none',
                          color: '#475569',
                          backgroundColor: '#ffffff',
                          transition: 'all 0.12s',
                        }}
                        className="sidebar-state-pill"
                      >
                        {s.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div style={{ backgroundColor: '#1A2E4A', borderRadius: 12, padding: 20 }}>
                  <Shield style={{ width: 22, height: 22, color: 'rgba(255,255,255,0.7)', marginBottom: 12 }} />
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#ffffff', marginBottom: 6, marginTop: 0 }}>List Your Company</h3>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 14, marginTop: 0 }}>
                    Appear in ranked lists across all 50 states. Reach buyers actively searching.
                  </p>
                  <Link
                    href="/list-your-company"
                    style={{ display: 'block', textAlign: 'center', backgroundColor: '#F5A623', color: '#1A2E4A', fontWeight: 600, fontSize: 12, padding: '9px 16px', borderRadius: 8, textDecoration: 'none', transition: 'background 0.12s' }}
                    className="cta-btn"
                  >
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
          .breadcrumb-link:hover { color: #0f172a !important; }
          .state-card:hover { border-color: #94a3b8 !important; box-shadow: 0 2px 8px -2px rgba(15,23,42,0.08) !important; }
          .sidebar-cat-link:not(.active):hover { background-color: #ffffff !important; color: #0f172a !important; }
          .sidebar-state-pill:hover { border-color: #94a3b8 !important; color: #0f172a !important; }
          .cta-btn:hover { background-color: #D48E1A !important; }
        `}</style>
      </>
    );
  }

  // ── Branch: state listing (or nationwide when `state` is absent) ────────
  const categoryName = cat?.name || toTitleCase(category);
  const stateName    = state ? toTitleCase(state) : null;
  const companies    = await fetchCompaniesByCategoryAndState(category, state || null, '-avg_rating', 500);
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
          <div style={{ maxWidth: 1152, margin: '0 auto', padding: '40px 24px 36px' }}>

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
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '16px 24px',
                textAlign: 'center',
                flexShrink: 0,
              }}>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{companies.length}</p>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>verified listings</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────────────── */}
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '32px 24px 64px' }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 28 }} className="listing-layout">

            {/* ── Ranked list ─────────────────────────────────────── */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
                  All {categoryName}{stateName ? ` in ${stateName}` : ' in the US'}
                </p>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Sorted by rating</p>
              </div>

              {companies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 24px', color: '#64748b' }}>
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
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pageCompanies.map((company, i) => {
                  const index = rankOffset + i;
                  return (
                    <Link
                      key={company.slug}
                      href={`/company/${company.slug}`}
                      style={{
                        display: 'block',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 12,
                        padding: '20px 24px',
                        textDecoration: 'none',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                      }}
                      className="company-card"
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>

                        {/* Rank badge */}
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          backgroundColor: index === 0 ? '#1A2E4A' : index === 1 ? '#243B58' : index === 2 ? '#f1f5f9' : '#f8fafc',
                          color: index < 2 ? '#ffffff' : '#64748b',
                          fontSize: 12,
                          fontWeight: 700,
                          fontVariantNumeric: 'tabular-nums',
                        }}>
                          #{index + 1}
                        </div>

                        {/* Logo */}
                        {company.logo_url ? (
                          <img src={company.logo_url} alt={company.name} style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'contain', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 52, height: 52, backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 20, fontWeight: 700, color: '#94a3b8' }}>{company.name.charAt(0)}</span>
                          </div>
                        )}

                        {/* Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: 0 }}>
                              {company.name}
                            </h3>
                            {company.is_verified && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 10,
                                fontWeight: 600,
                                color: '#16a34a',
                                backgroundColor: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                padding: '2px 8px',
                                borderRadius: 9999,
                              }}>
                                <CheckCircle style={{ width: 10, height: 10 }} />
                                Verified
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <StarRow rating={parseFloat(company.avg_rating) || 0} />
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                                {(parseFloat(company.avg_rating) || 0).toFixed(1)}
                              </span>
                            </div>
                            <span style={{ color: '#e2e8f0' }}>·</span>
                            <span style={{ fontSize: 12, color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
                              {company.review_count || 0} reviews
                            </span>
                            {(company.hq_city || company.hq_state_label) && (
                              <>
                                <span style={{ color: '#e2e8f0' }}>·</span>
                                <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <MapPin style={{ width: 11, height: 11 }} />
                                  {[company.hq_city, company.hq_state_label].filter(Boolean).join(', ')}
                                </span>
                              </>
                            )}
                          </div>

                          {company.description && (
                            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {company.description}
                            </p>
                          )}
                        </div>

                        {/* CTA arrow */}
                        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                          <ArrowRight style={{ width: 16, height: 16, color: '#94a3b8' }} />
                        </div>
                      </div>
                    </Link>
                  );})}
                </div>
              )}

              {totalPages > 1 && (
                <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 28, flexWrap: 'wrap' }} aria-label="Pagination">
                  <Link
                    href={`${basePath}${currentPage - 1 > 1 ? `?page=${currentPage - 1}` : ''}`}
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

                  {Array.from({ length: totalPages }, (_, n) => n + 1).map((n) => (
                    <Link
                      key={n}
                      href={`${basePath}${n > 1 ? `?page=${n}` : ''}`}
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
                  ))}

                  <Link
                    href={`${basePath}?page=${currentPage + 1}`}
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
            </div>

            {/* ── Sidebar ─────────────────────────────────────────── */}
            <aside style={{ width: 264, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }} className="listing-sidebar">

              {/* Other categories */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
                <h3 style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 12, marginTop: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {stateName ? `Other Categories in ${stateName}` : 'Other Categories'}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {SIDEBAR_CATEGORIES.map((c) => (
                    <Link
                      key={c.slug}
                      href={state ? `/${c.slug}/${state}` : `/${c.slug}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: 8,
                        fontSize: 13,
                        textDecoration: 'none',
                        transition: 'background 0.1s',
                        color: c.slug === category ? '#0f172a' : '#475569',
                        backgroundColor: c.slug === category ? '#ffffff' : 'transparent',
                        fontWeight: c.slug === category ? 600 : 400,
                        border: c.slug === category ? '1px solid #e2e8f0' : '1px solid transparent',
                      }}
                      className={`sidebar-cat-link${c.slug === category ? ' active' : ''}`}
                    >
                      <span>{c.name}</span>
                      {c.slug === category && <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8' }}>Current</span>}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Top states */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
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
              <div style={{ backgroundColor: '#1A2E4A', borderRadius: 12, padding: 20 }}>
                <Shield style={{ width: 22, height: 22, color: 'rgba(255,255,255,0.7)', marginBottom: 12 }} />
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#ffffff', marginBottom: 6, marginTop: 0 }}>List Your Company</h3>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 14, marginTop: 0 }}>
                  Appear in ranked lists across all 50 states. Reach buyers actively searching.
                </p>
                <Link
                  href="/list-your-company"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    backgroundColor: '#F5A623',
                    color: '#1A2E4A',
                    fontWeight: 600,
                    fontSize: 12,
                    padding: '9px 16px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    transition: 'background 0.12s',
                  }}
                  className="cta-btn"
                >
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
        .breadcrumb-link:hover { color: #0f172a !important; }
        .company-card:hover { border-color: #94a3b8 !important; box-shadow: 0 4px 16px -4px rgba(15,23,42,0.07) !important; }
        .sidebar-cat-link:not(.active):hover { background-color: #ffffff !important; color: #0f172a !important; }
        .sidebar-state-pill:not(.active):hover { border-color: #94a3b8 !important; color: #0f172a !important; }
        .cta-btn:hover { background-color: #D48E1A !important; }
      `}</style>
    </>
  );
}
