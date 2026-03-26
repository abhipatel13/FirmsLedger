import Home from '@/views/Home';
import JsonLd from '@/components/JsonLd';
import { SITE_NAME, SEO_YEAR, SEO_COUNTRY, BASE_URL } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const metadata = {
  title: `Top Companies List in ${SEO_COUNTRY} ${SEO_YEAR} | Products & Services Directory | ${SITE_NAME}`,
  description: `FirmsLedger delivers the definitive global top companies list. Discover verified manufacturers, suppliers, staffing agencies, and service providers worldwide. Browse by products, expertise, project needs, and pricing—all in one trusted directory.`,
  alternates: { canonical: _BASE },
  openGraph: {
    title: `Top Companies List in ${SEO_COUNTRY} | ${SITE_NAME}`,
    description: 'Discover verified manufacturers, suppliers, and service providers. Browse the top companies list by products, expertise, and pricing.',
    type: 'website',
    url: _BASE,
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: _BASE,
  description: "The trusted global platform to discover and connect with verified manufacturers, suppliers, and service providers worldwide.",
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${_BASE}/directory?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: _BASE,
  logo: `${_BASE}/icon.svg`,
  description: "The trusted global platform to discover and connect with verified manufacturers, suppliers, and service providers worldwide.",
  areaServed: 'Worldwide',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    url: `${_BASE}/contact`,
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={websiteSchema} />
      <JsonLd data={organizationSchema} />
      <Home />
    </>
  );
}
