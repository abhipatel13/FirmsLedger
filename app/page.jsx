import Home from '@/views/Home';
import JsonLd from '@/components/JsonLd';
import { SITE_NAME, SEO_YEAR, SEO_COUNTRY, BASE_URL } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const metadata = {
  title: `Top Companies List in ${SEO_COUNTRY} ${SEO_YEAR} | Verified Service Providers | ${SITE_NAME}`,
  description: `FirmsLedger delivers India's definitive top companies list. Discover verified staffing agencies, consultants, and business service providers. Browse by expertise, project needs, and pricing—all in one trusted directory.`,
  alternates: { canonical: _BASE },
  openGraph: {
    title: `Top Companies List in ${SEO_COUNTRY} | ${SITE_NAME}`,
    description: 'Discover verified business service providers and staffing agencies. Browse the top companies list by expertise, project needs, and pricing.',
    type: 'website',
    url: _BASE,
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: _BASE,
  description: "India's most trusted platform to discover and connect with verified business service providers.",
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
  description: "India's most trusted platform to discover and connect with verified business service providers.",
  areaServed: 'IN',
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
