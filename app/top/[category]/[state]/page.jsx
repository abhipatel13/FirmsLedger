import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { BASE_URL, SITE_NAME } from '@/lib/seo';
import { CheckCircle, Star, MapPin, ArrowLeft, Shield } from 'lucide-react';
import { fetchCompaniesByCategoryAndState } from '@/db/neonApi';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toTitleCase(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const { category, state } = await params;
  const categoryName = toTitleCase(category);
  const stateName = toTitleCase(state);
  const title = `Top ${categoryName} in ${stateName}`;
  const description = `Ranked list of the best verified ${categoryName.toLowerCase()} in ${stateName}. Compare companies by rating, reviews, and specialization.`;
  const canonical = `${_BASE}/top/${category}/${state}`;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonical,
    },
  };
}

// ─── Stars ────────────────────────────────────────────────────────────────────

function StarRow({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-3.5 h-3.5 ${n <= Math.round(rating) ? 'fill-orange-400 text-orange-400' : 'fill-slate-100 text-slate-200'}`}
        />
      ))}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function RankedListingPage({ params }) {
  const { category, state } = await params;
  const categoryName = toTitleCase(category);
  const stateName = toTitleCase(state);
  const companies = await fetchCompaniesByCategoryAndState(category, state, '-avg_rating', 50);

  const pageTitle = `Top ${categoryName} in ${stateName}`;

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: pageTitle,
    url: `${_BASE}/top/${category}/${state}`,
    numberOfItems: companies.length,
    itemListElement: companies.map((company, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: company.name,
      description: company.description,
      url: `${_BASE}/companies/${company.slug}`,
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: _BASE },
      { '@type': 'ListItem', position: 2, name: 'Directory', item: `${_BASE}/top` },
      { '@type': 'ListItem', position: 3, name: categoryName, item: `${_BASE}/top/${category}` },
      { '@type': 'ListItem', position: 4, name: stateName, item: `${_BASE}/top/${category}/${state}` },
    ],
  };

  return (
    <>
      <JsonLd data={itemListJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <div className="bg-[#fffaf0] min-h-screen">

        {/* ── Page header ───────────────────────────────────────────── */}
        <div className="bg-[#faf5e8] border-b border-[#e5e5e5]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[#6a6a6a] hover:text-[#0a0a0a] text-xs font-semibold mb-6 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Directory
            </Link>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 bg-[#f5f0e0] border border-[#e5e5e5] rounded-full px-3 py-1 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0a0a0a] inline-block" />
              <span className="font-bold uppercase text-[#6a6a6a]" style={{ fontSize: 10, letterSpacing: '1.5px', fontFamily: '"IBM Plex Mono", monospace' }}>{categoryName}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <h1 className="text-[#0a0a0a] uppercase" style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, fontSize: 'clamp(36px, 5vw, 56px)', letterSpacing: '-0.5px', lineHeight: 0.95 }}>
                  {pageTitle}
                </h1>
                <p className="text-[#6a6a6a] text-sm mt-3 max-w-xl">
                  Ranked by verified reviews, ratings, and years in operation. Updated monthly.
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="bg-[#f5f0e0] border border-[#e5e5e5] rounded-2xl px-6 py-4 text-center">
                  <p className="text-[#0a0a0a]" style={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, fontSize: 28 }}>{companies.length}</p>
                  <p className="text-[#6a6a6a] mt-1" style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase' }}>verified listings</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ───────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── Ranked list ─────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[#6a6a6a] uppercase" style={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, fontSize: 11, letterSpacing: '1.5px' }}>
                  All {categoryName} in {stateName}
                </h2>
                <p className="text-[#9a9a9a] text-xs">Sorted by rating</p>
              </div>

              {companies.length === 0 ? (
                <div className="text-center py-16 text-[#6a6a6a]">
                  <p className="text-lg font-semibold text-[#0a0a0a] mb-2">No listings yet</p>
                  <p className="text-sm">Be the first {categoryName} in {stateName} to get listed.</p>
                  <Link href="/ListYourCompany" className="inline-block mt-4 bg-[#0a0a0a] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#3a3a3a] transition-colors">
                    List Your Company
                  </Link>
                </div>
              ) : (
              <div className="space-y-4">
                {companies.map((company, index) => (
                  <Link
                    key={company.slug}
                    href={`/companies/${company.slug}`}
                    className="group block bg-[#fffaf0] border border-[#e5e5e5] rounded-2xl p-6 hover:border-[#0a0a0a] hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      {/* Rank badge */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                          index === 0
                            ? 'bg-[#ffb084] text-[#0a0a0a]'
                            : index === 1
                            ? 'bg-[#e8b94a] text-[#0a0a0a]'
                            : index === 2
                            ? 'bg-[#1a3a3a] text-white'
                            : 'bg-[#f5f0e0] text-[#6a6a6a]'
                        }`}
                        style={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, fontSize: 12 }}
                      >
                        #{index + 1}
                      </div>

                      {/* Logo */}
                      {company.logo_url ? (
                        <img src={company.logo_url} alt={company.name} className="w-14 h-14 rounded-xl object-contain border border-[#e5e5e5] bg-white flex-shrink-0" />
                      ) : (
                        <div className="w-14 h-14 bg-[#f5f0e0] border border-[#e5e5e5] rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-xl font-bold text-[#9a9a9a]">{company.name.charAt(0)}</span>
                        </div>
                      )}

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[#0a0a0a]" style={{ fontSize: 15 }}>
                            {company.name}
                          </h3>
                          {company.is_verified && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0a0a0a] bg-[#f5f0e0] border border-[#e5e5e5] px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-2.5 h-2.5" />
                              Verified
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-1.5">
                            <StarRow rating={parseFloat(company.avg_rating) || 0} />
                            <span className="text-[#3a3a3a]" style={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600, fontSize: 13 }}>{(parseFloat(company.avg_rating) || 0).toFixed(1)}</span>
                          </div>
                          <span className="text-[#e5e5e5]">·</span>
                          <span className="text-[#6a6a6a]" style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 11 }}>{company.review_count || 0} reviews</span>
                          {(company.hq_city || company.hq_state_label) && (
                            <>
                              <span className="text-[#e5e5e5]">·</span>
                              <span className="text-xs text-[#6a6a6a] flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {[company.hq_city, company.hq_state_label].filter(Boolean).join(', ')}
                              </span>
                            </>
                          )}
                        </div>

                        {company.description && (
                          <p className="text-[#6a6a6a] text-sm leading-relaxed line-clamp-2">
                            {company.description}
                          </p>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="flex-shrink-0 hidden sm:flex flex-col items-end gap-2">
                        <span className="text-xs font-semibold text-[#0a0a0a] border border-[#e5e5e5] bg-[#f5f0e0] px-4 py-2 rounded-full group-hover:bg-[#0a0a0a] group-hover:text-white group-hover:border-[#0a0a0a] transition-all">
                          View Profile
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              )}

              <p className="text-center text-xs text-[#6a6a6a] mt-8 leading-relaxed max-w-md mx-auto">
                Rankings are based on verified reviews and ratings only. Paid placements are never accepted.{' '}
                <Link href="/ListYourCompany" className="text-[#0a0a0a] underline underline-offset-2 hover:text-[#3a3a3a]">
                  Add your company
                </Link>
              </p>
            </div>

            {/* ── Sidebar ─────────────────────────────────────────── */}
            <aside className="lg:w-72 flex-shrink-0 space-y-5">

              {/* Filter by category */}
              <div className="bg-[#fffaf0] border border-[#e5e5e5] rounded-2xl p-5">
                <h3 className="font-semibold text-[#0a0a0a] text-sm mb-4">Other Categories in {stateName}</h3>
                <div className="space-y-1">
                  {[
                    { slug: 'electrical-manufacturers', name: 'Electrical Manufacturers' },
                    { slug: 'mechanical-manufacturers', name: 'Mechanical Manufacturers' },
                    { slug: 'electronics-semiconductor-manufacturers', name: 'Electronics & Semiconductors' },
                    { slug: 'metal-fabrication-machining', name: 'Metal Fabrication' },
                    { slug: 'plastics-packaging-manufacturers', name: 'Plastics & Packaging' },
                    { slug: 'automotive-parts-manufacturers', name: 'Automotive Parts' },
                    { slug: 'medical-device-manufacturers', name: 'Medical Devices' },
                    { slug: 'food-beverage-processing', name: 'Food & Beverage' },
                    { slug: 'textile-apparel-manufacturers', name: 'Textile & Apparel' },
                    { slug: 'furniture-woodworking-manufacturers', name: 'Furniture & Woodworking' },
                  ].map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/top/${cat.slug}/${state}`}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        cat.slug === category
                          ? 'bg-[#f5f0e0] text-[#0a0a0a] font-semibold border border-[#e5e5e5]'
                          : 'text-[#6a6a6a] hover:bg-[#f5f0e0] hover:text-[#0a0a0a]'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {cat.slug === category && <span className="text-[10px] font-bold text-[#6a6a6a]">Current</span>}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Filter by state */}
              <div className="bg-[#fffaf0] border border-[#e5e5e5] rounded-2xl p-5">
                <h3 className="font-semibold text-[#0a0a0a] text-sm mb-4">Top States for {categoryName}</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'California', slug: 'california' },
                    { name: 'Texas', slug: 'texas' },
                    { name: 'New York', slug: 'new-york' },
                    { name: 'Florida', slug: 'florida' },
                    { name: 'Illinois', slug: 'illinois' },
                    { name: 'Pennsylvania', slug: 'pennsylvania' },
                    { name: 'Ohio', slug: 'ohio' },
                    { name: 'Michigan', slug: 'michigan' },
                  ].map((s) => (
                    <Link
                      key={s.slug}
                      href={`/top/${category}/${s.slug}`}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                        s.slug === state
                          ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]'
                          : 'bg-[#f5f0e0] text-[#3a3a3a] border-[#e5e5e5] hover:border-[#0a0a0a] hover:text-[#0a0a0a]'
                      }`}
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* List your company */}
              <div className="bg-[#ebe6d6] border border-[#e5e5e5] rounded-2xl p-5">
                <Shield className="w-6 h-6 text-[#0a0a0a] mb-3" />
                <h3 className="font-semibold text-[#0a0a0a] text-sm mb-2">List Your Company</h3>
                <p className="text-[#6a6a6a] text-xs leading-relaxed mb-4">
                  Appear in ranked lists across all 50 states. Reach buyers actively searching.
                </p>
                <Link
                  href="/ListYourCompany"
                  className="block text-center bg-[#0a0a0a] hover:bg-[#3a3a3a] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors"
                >
                  Get Listed
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
