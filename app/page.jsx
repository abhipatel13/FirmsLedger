import MarketplaceHub from '@/views/marketplace/MarketplaceHub';
import JsonLd from '@/components/JsonLd';
import { SITE_NAME, BASE_URL } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const metadata = {
  title: `B2B Marketplace — Connect Buyers & Suppliers Globally | ${SITE_NAME}`,
  description: 'Post RFQs to find suppliers or list your products to reach buyers worldwide. Free B2B marketplace for all industries.',
  alternates: { canonical: _BASE },
  openGraph: {
    title: `FirmsLedger B2B Marketplace`,
    description: 'Post RFQs or list your products. Connect with buyers and suppliers worldwide.',
    type: 'website',
    url: _BASE,
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: _BASE,
  description: 'Global B2B marketplace. Post RFQs to find suppliers or list products to reach buyers worldwide.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${_BASE}/marketplace/rfqs?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={websiteSchema} />
      <MarketplaceHub />
    </>
  );
}
