import DirectoryHub from '@/views/DirectoryHub';
import JsonLd from '@/components/JsonLd';
import { SITE_NAME, BASE_URL } from '@/lib/seo';
import { fetchHomepageStats, fetchStateCountsForCategory } from '@/db/neonApi';
import { categoryImageUrl } from '@/lib/capabilities';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

// 3600, not 300. A 5-minute ISR window on the busiest page re-rendered the
// homepage forever at exactly the Neon scale-to-zero timeout, so the compute
// never got an idle gap — see HISTORY.md 2026-09-02.
// `false`, not an hourly window. These pages are prebuilt, but a time-based
// revalidate makes them re-render AT RUNTIME on expiry, and a runtime render
// hits Postgres. Every wake costs Neon's full 300s suspend timeout regardless
// of how little work it does, so runtime re-renders are the cost driver.
// Freshness comes from rebuilds. See HISTORY.md 2026-09-09.
export const revalidate = false;

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
      urlTemplate: `${_BASE}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
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
        categoryImages={Object.fromEntries(
          CORE_CATEGORIES.map((c) => [c.slug, categoryImageUrl(c.slug)]),
        )}
      />
    </>
  );
}
