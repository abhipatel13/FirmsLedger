import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AgencyCard from '@/components/AgencyCard';
import { BASE_URL, SITE_NAME, SEO_YEAR } from '@/lib/seo';
import {
  countrySlugToName,
  stateSlugToInfo,
  slugToTitle,
  getSearchPageTitle,
  getSearchPageDescription,
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
    .select('id, name, slug')
    .eq('slug', slug)
    .maybeSingle();
  return data;
}

async function getCompaniesByStateCity(categoryId, countryName, stateName, cityName) {
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
    .ilike('hq_state', stateName)
    .ilike('hq_city', cityName)
    .order('avg_rating', { ascending: false })
    .limit(100);
  return data || [];
}

export async function generateMetadata({ params }) {
  const { industry, country, state, city } = await params;
  const stateInfo = stateSlugToInfo(country, state);
  const category = await getCategoryBySlug(industry);
  if (!stateInfo || !category) return { title: SITE_NAME };

  const countryName = countrySlugToName(country);
  const cityName = slugToTitle(city);
  const locationName = `${cityName}, ${stateInfo.name}, ${countryName}`;
  const title = getSearchPageTitle(category.name, cityName);
  const description = getSearchPageDescription(category.name, locationName);
  const canonical = `${BASE_URL}/search/${industry}/${country}/${state}/${city}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website', siteName: SITE_NAME },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function StateCityPage({ params }) {
  const { industry, country, state, city } = await params;
  const stateInfo = stateSlugToInfo(country, state);
  const countryName = countrySlugToName(country);
  const category = await getCategoryBySlug(industry);

  if (!stateInfo || !category) notFound();

  // Validate city belongs to this state
  if (!stateInfo.cities.includes(city)) notFound();

  const cityName = slugToTitle(city);
  const companies = await getCompaniesByStateCity(
    category.id, countryName, stateInfo.name, cityName
  );

  const displayed = companies.slice(0, 10);
  const pageTitle = `Top ${displayed.length > 0 ? displayed.length : 10} ${category.name} Companies in ${cityName} (${SEO_YEAR})`;
  const locationName = `${cityName}, ${stateInfo.name}, ${countryName}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: pageTitle,
    description: getSearchPageDescription(category.name, locationName),
    url: `${BASE_URL}/search/${industry}/${country}/${state}/${city}`,
    numberOfItems: companies.length,
    itemListElement: companies.slice(0, 10).map((company, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: company.name,
      url: `${BASE_URL}/companies/${company.slug}`,
    })),
  };

  const sibling = stateInfo.cities.filter((c) => c !== city).slice(0, 24);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-10">
            <nav className="text-sm text-slate-500 mb-4 flex flex-wrap items-center gap-1.5">
              <Link href="/" className="hover:text-slate-700">Home</Link>
              <span>/</span>
              <Link href={`/search/${industry}/${country}`} className="hover:text-slate-700">{countryName}</Link>
              <span>/</span>
              <Link href={`/search/${industry}/${country}/${state}`} className="hover:text-slate-700">{stateInfo.name}</Link>
              <span>/</span>
              <span className="text-slate-800 font-medium">{cityName}</span>
            </nav>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">{pageTitle}</h1>
            <p className="text-slate-600 text-base max-w-2xl">
              {getSearchPageDescription(category.name, locationName)}
            </p>

            <div className="flex flex-wrap gap-3 mt-5 text-sm">
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium border border-blue-200">{category.name}</span>
              <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full font-medium border border-orange-200">{cityName}</span>
              <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium border border-purple-200">{stateInfo.name}</span>
              <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium border border-green-200">{countryName}</span>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">{companies.length} Companies</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-10">
          {companies.length > 0 ? (
            <>
              <h2 className="text-xl font-semibold text-slate-800 mb-6">
                All {category.name} Companies in {cityName}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayed.map((company) => (
                  <AgencyCard key={company.id} agency={company} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-xl font-semibold text-slate-700 mb-2">No companies listed yet in {cityName}</h2>
              <p className="text-slate-500 mb-6">Be the first {category.name.toLowerCase()} company in {cityName}.</p>
              <Link href="/ListYourCompany" className="inline-block bg-orange-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-orange-700 transition-colors">
                List Your Company
              </Link>
            </div>
          )}

          {/* Other cities in same state */}
          {sibling.length > 0 && (
            <div className="mt-14 border-t border-slate-200 pt-10">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                {category.name} Companies in Other {stateInfo.name} Cities
              </h2>
              <div className="flex flex-wrap gap-2">
                {sibling.map((c) => (
                  <Link
                    key={c}
                    href={`/search/${industry}/${country}/${state}/${c}`}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline px-3 py-1.5 bg-white border border-slate-200 rounded-lg transition-colors"
                  >
                    {slugToTitle(c)}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 mt-6 text-sm">
            <Link href={`/search/${industry}/${country}/${state}`} className="text-slate-500 hover:text-slate-700 underline">
              ← All {stateInfo.name} companies
            </Link>
            <Link href={`/search/${industry}/${country}`} className="text-slate-500 hover:text-slate-700 underline">
              ← All {countryName} companies
            </Link>
          </div>

          <div className="mt-10 bg-[#0D1B2A] text-white rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Are you a {slugToTitle(industry)} company in {cityName}?</h2>
            <p className="text-slate-300 mb-5">Get listed and reach buyers in {cityName} looking for {category.name.toLowerCase()} services.</p>
            <Link href="/ListYourCompany" className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              List Your Company — It&apos;s Free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
