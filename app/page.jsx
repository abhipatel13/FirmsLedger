import DirectoryHub from '@/views/DirectoryHub';
import JsonLd from '@/components/JsonLd';
import { SITE_NAME, BASE_URL } from '@/lib/seo';
import { fetchApprovedCompanyCount } from '@/db/neonApi';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const revalidate = 300;

export const metadata = {
  title: `Top Manufacturers by State — US Manufacturer Directory | ${SITE_NAME}`,
  description: 'Find the top verified manufacturers in your state. Browse bike, electrical, mechanical, and more by category and location.',
  alternates: { canonical: _BASE },
  openGraph: {
    title: `FirmsLedger — US Manufacturer Directory`,
    description: 'Browse verified manufacturers by category and state. Find the best in your area.',
    type: 'website',
    url: _BASE,
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: _BASE,
  description: 'US manufacturer directory. Find top verified manufacturers by category and state.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${_BASE}/top/{category_slug}/{state_slug}`,
    },
    'query-input': 'required name=category_slug required name=state_slug',
  },
};

export default async function HomePage() {
  const companyCount = await fetchApprovedCompanyCount();

  return (
    <>
      <JsonLd data={websiteSchema} />
      <DirectoryHub companyCount={companyCount} />
    </>
  );
}
