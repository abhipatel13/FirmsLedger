import DirectoryHub from '@/views/DirectoryHub';
import JsonLd from '@/components/JsonLd';
import { SITE_NAME, BASE_URL } from '@/lib/seo';
import { fetchHomepageStats, fetchStateCountsForCategory } from '@/db/neonApi';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const revalidate = 300;

export const metadata = {
  title: `Top Manufacturers by State — US Manufacturer Directory | ${SITE_NAME}`,
  description: 'Find manufacturers in your state. Browse electrical, mechanical, and more by category and location.',
  alternates: { canonical: _BASE },
  openGraph: {
    title: `FirmsLedger — US Manufacturer Directory`,
    description: 'Browse manufacturers by category and state. Find companies in your area.',
    type: 'website',
    url: _BASE,
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: _BASE,
  description: 'US manufacturer directory. Find manufacturers by category and state.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${_BASE}/top/{category_slug}/{state_slug}`,
    },
    'query-input': 'required name=category_slug required name=state_slug',
  },
};

const CORE_CATEGORIES = [
  { slug: 'electrical-components', shortName: 'Electrical Components' },
  { slug: 'mechanical-components', shortName: 'Mechanical Components' },
  { slug: 'plastics-packaging', shortName: 'Plastics & Packaging' },
  { slug: 'metal-fabrication', shortName: 'Metal Fabrication' },
  { slug: 'electronics-semiconductor', shortName: 'Electronics & Semiconductor' },
  { slug: 'automotive-parts', shortName: 'Automotive Parts' },
  { slug: 'textile-apparel', shortName: 'Textile & Apparel' },
  { slug: 'furniture-woodworking', shortName: 'Furniture & Woodworking' },
  { slug: 'food-beverage-processing', shortName: 'Food & Beverage' },
  { slug: 'medical-devices', shortName: 'Medical Devices' },
];

export default async function HomePage() {
  const [stats, ...categoryStatesList] = await Promise.all([
    fetchHomepageStats(),
    ...CORE_CATEGORIES.map(async (cat) => {
      const counts = await fetchStateCountsForCategory(cat.slug);
      return {
        categorySlug: cat.slug,
        categoryName: cat.shortName,
        states: counts.slice(0, 12),
      };
    }),
  ]);

  const { companyCount, categoryCount, stateCount } = stats;

  return (
    <>
      <JsonLd data={websiteSchema} />
      <DirectoryHub
        companyCount={companyCount}
        categoryCount={categoryCount}
        stateCount={stateCount}
        popularSearches={categoryStatesList}
      />
    </>
  );
}
