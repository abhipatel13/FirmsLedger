import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AgencyCard from '@/components/AgencyCard';
import { BASE_URL, SITE_NAME, SEO_YEAR } from '@/lib/seo';
import {
  countrySlugToName,
  slugToTitle,
  getSearchPageTitle,
  getSearchPageDescription,
  TARGET_COUNTRIES,
  getCitiesForCountry,
  getStatesForCountry,
} from '@/lib/programmaticSeo';

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function getCategoryBySlug(slug) {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .eq('slug', slug)
    .maybeSingle();
  return data;
}

async function getCompaniesByCategoryAndCountry(categoryId, countryName) {
  const supabase = getServerSupabase();
  if (!supabase) return [];
  const { data: links } = await supabase
    .from('agency_categories')
    .select('agency_id')
    .eq('category_id', categoryId);
  if (!links || links.length === 0) return [];
  const ids = links.map((l) => l.agency_id);
  const { data } = await supabase
    .from('agencies')
    .select('*')
    .in('id', ids)
    .eq('approved', true)
    .ilike('hq_country', countryName)
    .order('avg_rating', { ascending: false })
    .limit(100);
  return data || [];
}

export async function generateMetadata({ params }) {
  const { industry, country } = await params;
  const countryName = countrySlugToName(country);
  const category = await getCategoryBySlug(industry);
  if (!countryName || !category) return { title: SITE_NAME };

  const title = getSearchPageTitle(category.name, countryName);
  const description = getSearchPageDescription(category.name, countryName);
  const canonical = `${BASE_URL}/search/${industry}/${country}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website', siteName: SITE_NAME },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export async function generateStaticParams() {
  const supabase = getServerSupabase();
  if (!supabase) return [];
  const { data: categories } = await supabase.from('categories').select('slug');
  const categorySlugs = (categories || []).map((c) => c.slug).filter(Boolean);
  const params = [];
  for (const industry of categorySlugs) {
    for (const country of TARGET_COUNTRIES) {
      params.push({ industry, country });
    }
  }
  return params;
}

export default async function SearchPage({ params }) {
  const { industry, country } = await params;
  const countryName = countrySlugToName(country);
  const category = await getCategoryBySlug(industry);

  if (!countryName || !category) notFound();

  const companies = await getCompaniesByCategoryAndCountry(category.id, countryName);
  const industryTitle = slugToTitle(industry);
  const displayed = companies.slice(0, 10);
  const pageTitle = `Top ${displayed.length > 0 ? displayed.length : 10} ${category.name} Companies in ${countryName} (${SEO_YEAR})`;
  const cities = getCitiesForCountry(country);
  const states = getStatesForCountry(country); // null if no states defined

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: pageTitle,
    description: getSearchPageDescription(category.name, countryName),
    url: `${BASE_URL}/search/${industry}/${country}`,
    numberOfItems: companies.length,
    itemListElement: companies.slice(0, 10).map((company, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: company.name,
      url: `${BASE_URL}/companies/${company.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-10">
            {/* Breadcrumb */}
            <nav className="text-sm text-slate-500 mb-4 flex items-center gap-1.5">
              <Link href="/" className="hover:text-slate-700">Home</Link>
              <span>/</span>
              <Link href="/directory" className="hover:text-slate-700">Directory</Link>
              <span>/</span>
              <Link href={`/directory/${industry}`} className="hover:text-slate-700">{category.name}</Link>
              <span>/</span>
              <span className="text-slate-800 font-medium">{countryName}</span>
            </nav>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              {pageTitle}
            </h1>
            <p className="text-slate-600 text-base max-w-2xl">
              {getSearchPageDescription(category.name, countryName)}
            </p>

            <div className="flex flex-wrap gap-3 mt-5 text-sm">
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium border border-blue-200">
                {category.name}
              </span>
              <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium border border-green-200">
                {countryName}
              </span>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
                {companies.length} Companies Found
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-10">
          {companies.length > 0 ? (
            <>
              <h2 className="text-xl font-semibold text-slate-800 mb-6">
                All {category.name} Companies in {countryName}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayed.map((company) => (
                  <AgencyCard key={company.id} agency={company} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-xl font-semibold text-slate-700 mb-2">
                No companies found yet
              </h2>
              <p className="text-slate-500 mb-6">
                We&apos;re growing our database of {category.name} companies in {countryName}.
              </p>
              <Link
                href="/ListYourCompany"
                className="inline-block bg-orange-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                List Your Company
              </Link>
            </div>
          )}

          {/* Browse by State (if states defined) */}
          {states && (
            <div className="mt-14 border-t border-slate-200 pt-10">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Browse {category.name} Companies by State in {countryName}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {Object.entries(states).map(([stateSlug, info]) => (
                  <Link
                    key={stateSlug}
                    href={`/search/${industry}/${country}/${stateSlug}`}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline px-3 py-2 bg-white border border-slate-200 rounded-lg transition-colors text-center"
                  >
                    {info.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Browse by City (fallback for countries without states) */}
          {!states && cities.length > 0 && (
            <div className="mt-14 border-t border-slate-200 pt-10">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Browse {category.name} Companies by City in {countryName}
              </h2>
              <div className="flex flex-wrap gap-2">
                {cities.map((citySlug) => (
                  <Link
                    key={citySlug}
                    href={`/search/${industry}/${country}/${citySlug}`}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline px-3 py-1.5 bg-white border border-slate-200 rounded-lg transition-colors"
                  >
                    {slugToTitle(citySlug)}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related Countries */}
          <div className="mt-8 border-t border-slate-200 pt-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Browse {category.name} Companies by Country
            </h2>
            <div className="flex flex-wrap gap-2">
              {TARGET_COUNTRIES.filter((c) => c !== country).map((c) => (
                <Link
                  key={c}
                  href={`/search/${industry}/${c}`}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline px-3 py-1.5 bg-white border border-slate-200 rounded-lg transition-colors"
                >
                  {countrySlugToName(c)}
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 bg-[#0D1B2A] text-white rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">
              Are you a {industryTitle} company in {countryName}?
            </h2>
            <p className="text-slate-300 mb-5">
              Get listed and reach thousands of buyers looking for {category.name.toLowerCase()} services in {countryName}.
            </p>
            <Link
              href="/ListYourCompany"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              List Your Company — It&apos;s Free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
