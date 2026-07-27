import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import { BASE_URL, SITE_NAME } from '@/lib/seo';
import { CheckCircle, Star, MapPin, Shield, ArrowRight } from 'lucide-react';
import { fetchCompaniesByCategoryAndState } from '@/db/neonApi';
import { MANUFACTURING_CATEGORIES, CATEGORY_MAP, CATEGORY_SLUGS } from '@/lib/manufacturingCategories';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

const VALID_CATEGORIES = new Set(CATEGORY_SLUGS);

function toTitleCase(slug) {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const { category, state: subcategory, subcategory: state } = await params;
  const cat = CATEGORY_MAP[category];
  if (!cat) return { title: `Not Found | ${SITE_NAME}` };

  const sub = cat.subcategories.find((s) => s.slug === subcategory);
  const subName  = sub?.name || toTitleCase(subcategory);
  const stateName = toTitleCase(state);
  const title = `${subName} Manufacturers in ${stateName}`;
  const description = `Find verified ${subName.toLowerCase()} manufacturers in ${stateName}. Part of the ${cat.name} directory. Ranked by real reviews, no paid placements.`;
  const canonical = `${_BASE}/${category}/${subcategory}/${state}`;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical },
    // Ignores the subcategory param when querying companies (no per-
    // subcategory tagging in the DB yet), so this renders the same list as
    // the plain /{category}/{state} page — noindex to avoid duplicate content.
    robots: { index: false, follow: true },
    openGraph: { title, description, type: 'website', url: canonical },
  };
}

export function generateStaticParams() {
  return [];
}

// ─── Stars ────────────────────────────────────────────────────────────────────

function StarRow({ rating }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} style={{ width: 13, height: 13, fill: n <= Math.round(rating) ? '#F5A623' : '#e2e8f0', color: n <= Math.round(rating) ? '#F5A623' : '#e2e8f0' }} />
      ))}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SubcategoryStatePage({ params, searchParams }) {
  const { category, state: subcategory, subcategory: state } = await params;
  const { page: pageParam } = await searchParams;
  const cat = CATEGORY_MAP[category];
  if (!cat || !VALID_CATEGORIES.has(category)) notFound();

  const sub = cat.subcategories.find((s) => s.slug === subcategory);
  if (!sub) notFound();

  const stateName = toTitleCase(state);
  const pageTitle = `${sub.name} Manufacturers in ${stateName}`;

  // Fetch companies — pass both category and subcategory for filtering
  const companies = await fetchCompaniesByCategoryAndState(category, state, '-avg_rating', 500);

  const totalPages    = Math.max(1, Math.ceil(companies.length / PAGE_SIZE));
  const currentPage   = Math.min(Math.max(1, parseInt(pageParam, 10) || 1), totalPages);
  const pageCompanies = companies.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rankOffset     = (currentPage - 1) * PAGE_SIZE;
  const basePath       = `/${category}/${subcategory}/${state}`;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',            item: _BASE },
      { '@type': 'ListItem', position: 2, name: cat.shortName,     item: `${_BASE}/${category}` },
      { '@type': 'ListItem', position: 3, name: sub.name,          item: `${_BASE}/${category}/${subcategory}/${state}` },
      { '@type': 'ListItem', position: 4, name: stateName,         item: `${_BASE}/${category}/${subcategory}/${state}` },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />

      <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>

        {/* ── Page header ── */}
        <div style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: 1152, margin: '0 auto', padding: '40px 24px 36px' }}>

            {/* Breadcrumb */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
              <Link href="/" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 500 }}>Home</Link>
              <span style={{ color: '#cbd5e1', fontSize: 13 }}>/</span>
              <Link href={`/${category}`} style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 500 }}>{cat.shortName}</Link>
              <span style={{ color: '#cbd5e1', fontSize: 13 }}>/</span>
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{sub.name}</span>
              <span style={{ color: '#cbd5e1', fontSize: 13 }}>/</span>
              <Link href={`/${category}/${state}`} style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 500 }}>{stateName}</Link>
            </nav>

            {/* Category badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: cat.accent, borderRadius: 9999, padding: '4px 12px', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: cat.accentText, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{cat.shortName}</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20 }}>
              <div>
                <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 10, marginTop: 0 }}>
                  {pageTitle}
                </h1>
                <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Ranked by verified reviews and ratings. Updated monthly.
                </p>
              </div>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 24px', textAlign: 'center', flexShrink: 0 }}>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>{companies.length}</p>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>verified listings</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '32px 24px 64px' }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 28 }} className="listing-layout">

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
                  {pageCompanies.map((company, i) => {
                  const index = rankOffset + i;
                  return (
                    <Link
                      key={company.slug}
                      href={`/company/${company.slug}`}
                      style={{ display: 'block', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 24px', textDecoration: 'none', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                      className="company-card"
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: index === 0 ? '#1A2E4A' : index < 3 ? '#243B58' : '#f8fafc', color: index < 2 ? '#ffffff' : '#64748b', fontSize: 12, fontWeight: 700 }}>
                          #{index + 1}
                        </div>
                        {company.logo_url ? (
                          <img src={company.logo_url} alt={company.name} style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'contain', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 52, height: 52, backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 20, fontWeight: 700, color: '#94a3b8' }}>{company.name.charAt(0)}</span>
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: 0 }}>{company.name}</h3>
                            {company.is_verified && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: '#16a34a', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: 9999 }}>
                                <CheckCircle style={{ width: 10, height: 10 }} /> Verified
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                            <StarRow rating={parseFloat(company.avg_rating) || 0} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{(parseFloat(company.avg_rating) || 0).toFixed(1)}</span>
                            <span style={{ color: '#e2e8f0' }}>·</span>
                            <span style={{ fontSize: 12, color: '#94a3b8' }}>{company.review_count || 0} reviews</span>
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
                            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{company.description}</p>
                          )}
                        </div>
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
