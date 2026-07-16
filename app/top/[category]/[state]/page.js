import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { BASE_URL, SITE_NAME } from '@/lib/seo';
import { CheckCircle, Star, MapPin, Globe, ArrowLeft, Shield } from 'lucide-react';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toTitleCase(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ─── Mock companies (consistent with future data shape) ───────────────────────
// Fields: name, slug, description, logo_url, website, state, city, rating, review_count, is_verified

function getMockCompanies(categorySlug, stateSlug) {
  const stateName = toTitleCase(stateSlug);
  const categoryName = toTitleCase(categorySlug);

  const templates = [
    {
      name: `${stateName} Precision Works`,
      slug: `${stateSlug}-precision-works`,
      description: `A vertically integrated ${categoryName.toLowerCase()} facility specializing in custom orders and OEM production runs. ISO 9001 certified with a 22-year track record in ${stateName}.`,
      city: getMainCity(stateSlug, 0),
      rating: 4.9,
      review_count: 87,
      is_verified: true,
    },
    {
      name: `Allied ${toTitleCase(categorySlug.split('-')[0])} Industries`,
      slug: `allied-${categorySlug.split('-')[0]}-industries`,
      description: `Mid-size manufacturer serving regional distributors and direct B2B clients. Known for tight tolerances and on-time delivery. 300+ active enterprise accounts.`,
      city: getMainCity(stateSlug, 1),
      rating: 4.7,
      review_count: 54,
      is_verified: true,
    },
    {
      name: `${stateName} Industrial Group`,
      slug: `${stateSlug}-industrial-group`,
      description: `Family-owned for three generations. Specializes in high-volume runs with competitive unit costs. Strong export footprint across 18 countries.`,
      city: getMainCity(stateSlug, 2),
      rating: 4.5,
      review_count: 41,
      is_verified: true,
    },
    {
      name: `NextGen ${toTitleCase(categorySlug.split('-')[0])} Co.`,
      slug: `nextgen-${categorySlug.split('-')[0]}-co`,
      description: `Founded in 2014, bringing modern lean-manufacturing practices to ${stateName}. Fast prototyping with production ramp in as little as 6 weeks.`,
      city: getMainCity(stateSlug, 3),
      rating: 4.3,
      review_count: 29,
      is_verified: false,
    },
    {
      name: `Cornerstone Mfg. ${stateName}`,
      slug: `cornerstone-mfg-${stateSlug}`,
      description: `Regional staple with deep distribution relationships. Focuses on consistent quality over price competition. Best for recurring long-term supply contracts.`,
      city: getMainCity(stateSlug, 4),
      rating: 4.1,
      review_count: 18,
      is_verified: true,
    },
  ];

  return templates;
}

const CITY_MAP = {
  california: ['San Francisco', 'Los Angeles', 'San Jose', 'San Diego', 'Fresno'],
  texas: ['Austin', 'Houston', 'Dallas', 'Fort Worth', 'San Antonio'],
  'new-york': ['New York City', 'Buffalo', 'Rochester', 'Albany', 'Syracuse'],
  florida: ['Miami', 'Tampa', 'Orlando', 'Jacksonville', 'Fort Lauderdale'],
  illinois: ['Chicago', 'Aurora', 'Naperville', 'Rockford', 'Springfield'],
  pennsylvania: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading'],
  ohio: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron'],
  michigan: ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Lansing'],
};

function getMainCity(stateSlug, index) {
  const cities = CITY_MAP[stateSlug];
  if (cities) return cities[index % cities.length];
  const stateName = toTitleCase(stateSlug);
  return `${stateName} City`;
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
  const companies = getMockCompanies(category, state);

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

      <div className="bg-[#F7F8FA] min-h-screen">

        {/* ── Page header ───────────────────────────────────────────── */}
        <div className="bg-[#0F1A2C] border-b border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-orange-400 text-xs font-semibold mb-6 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Directory
            </Link>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-5">
              <Link href="/" className="hover:text-orange-400 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-slate-400">{categoryName}</span>
              <span>/</span>
              <span className="text-white font-semibold">{stateName}</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white leading-tight tracking-tight">
                  {pageTitle}
                </h1>
                <p className="text-slate-400 text-sm mt-2 max-w-xl">
                  Ranked by verified reviews, ratings, and years in operation.
                  Updated monthly.
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-white">{companies.length}</p>
                  <p className="text-slate-400 text-xs">verified listings</p>
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
                <h2 className="font-bold text-[#1A2E4A] text-sm uppercase tracking-widest">
                  All {categoryName} in {stateName}
                </h2>
                <p className="text-slate-400 text-xs">Sorted by rating</p>
              </div>

              <div className="space-y-4">
                {companies.map((company, index) => (
                  <Link
                    key={company.slug}
                    href={`/companies/${company.slug}`}
                    className="group block bg-white border border-slate-200 rounded-2xl p-6 hover:border-orange-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      {/* Rank badge */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black transition-colors ${
                        index === 0
                          ? 'bg-orange-500 text-white'
                          : index === 1
                          ? 'bg-[#1A2E4A] text-white'
                          : index === 2
                          ? 'bg-slate-700 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        #{index + 1}
                      </div>

                      {/* Logo placeholder */}
                      <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:border-orange-200 transition-colors">
                        <span className="text-xl font-black text-slate-300">{company.name.charAt(0)}</span>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-bold text-[#1A2E4A] text-base group-hover:text-orange-600 transition-colors">
                            {company.name}
                          </h3>
                          {company.is_verified && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-2.5 h-2.5" />
                              Verified
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-1.5">
                            <StarRow rating={company.rating} />
                            <span className="text-sm font-bold text-slate-700">{company.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs text-slate-500">{company.review_count} reviews</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {company.city}, {stateName}
                          </span>
                        </div>

                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                          {company.description}
                        </p>
                      </div>

                      {/* CTA */}
                      <div className="flex-shrink-0 hidden sm:flex flex-col items-end gap-2">
                        <span className="text-xs font-bold text-orange-500 border border-orange-200 px-4 py-2 rounded-full group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-all">
                          View Profile
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <p className="text-center text-xs text-slate-400 mt-8 leading-relaxed max-w-md mx-auto">
                Rankings are based on verified reviews and ratings only. Paid placements are never accepted.{' '}
                <Link href="/ListYourCompany" className="text-orange-500 hover:text-orange-600 underline underline-offset-2">
                  Add your company
                </Link>
              </p>
            </div>

            {/* ── Sidebar ─────────────────────────────────────────── */}
            <aside className="lg:w-72 flex-shrink-0 space-y-5">

              {/* Filter by category */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h3 className="font-bold text-[#1A2E4A] text-sm mb-4">Other Categories in {stateName}</h3>
                <div className="space-y-1">
                  {[
                    { slug: 'bike-manufacturers', name: 'Bike Manufacturers' },
                    { slug: 'electrical-manufacturers', name: 'Electrical Manufacturers' },
                    { slug: 'mechanical-manufacturers', name: 'Mechanical Manufacturers' },
                  ].map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/top/${cat.slug}/${state}`}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        cat.slug === category
                          ? 'bg-orange-50 text-orange-600 font-bold border border-orange-200'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-[#1A2E4A]'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {cat.slug === category && <span className="text-[10px] font-bold text-orange-400">Current</span>}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Filter by state */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h3 className="font-bold text-[#1A2E4A] text-sm mb-4">Top States for {categoryName}</h3>
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
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                        s.slug === state
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50'
                      }`}
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* List your company */}
              <div className="bg-[#0F1A2C] rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-orange-500/15 rounded-full blur-2xl" />
                <Shield className="w-6 h-6 text-orange-400 mb-3 relative" />
                <h3 className="font-bold text-white text-sm mb-2 relative">List Your Company</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4 relative">
                  Appear in ranked lists across all 50 states. Reach buyers actively searching.
                </p>
                <Link
                  href="/ListYourCompany"
                  className="block text-center bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors relative"
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
