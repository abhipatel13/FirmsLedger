import ListYourCompany from '@/views/ListYourCompany';
import JsonLd from '@/components/JsonLd';
import { BASE_URL, SITE_NAME, OG_IMAGES } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');
const _URL = `${_BASE}/list-your-company`;

export const metadata = {
  title: 'List Your Manufacturing Company Free',
  description: 'List your manufacturing company on FirmsLedger free. Get discovered by buyers searching by category and state across all 50 states. No credit card required.',
  alternates: { canonical: _URL },
  openGraph: {
    images: OG_IMAGES,
    title: `List Your Manufacturing Company Free | ${SITE_NAME}`,
    description: 'Get your manufacturing company listed on FirmsLedger. Free to start, no credit card required.',
    type: 'website',
    url: _URL,
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: _BASE },
    { '@type': 'ListItem', position: 2, name: 'List Your Company', item: _URL },
  ],
};

export default function ListYourCompanyPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <ListYourCompany />
    </>
  );
}
