import Home from '@/views/Home';
import JsonLd from '@/components/JsonLd';
import { SITE_NAME, SEO_YEAR, SEO_COUNTRY, BASE_URL } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const metadata = {
  title: `Best Companies & Service Providers ${SEO_YEAR} | Global Business Directory | ${SITE_NAME}`,
  description: `FirmsLedger is the trusted global business directory. Find and compare verified companies across staffing, healthcare, travel, IT, education, and every other industry. Read real client reviews and get matched with the right partner.`,
  alternates: { canonical: _BASE },
  openGraph: {
    title: `Best Companies Worldwide | ${SITE_NAME}`,
    description: 'Find and compare the best companies worldwide. Verified reviews, ratings, and direct contact across every industry.',
    type: 'website',
    url: _BASE,
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: _BASE,
  description: "The trusted global business directory. Find and compare verified companies across every industry, worldwide.",
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
  description: "The trusted global business directory. Find and compare verified companies across every industry, worldwide.",
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
