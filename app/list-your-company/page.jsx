import ListYourCompany from '@/views/ListYourCompany';
import { BASE_URL, SITE_NAME } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const metadata = {
  title: `List Your Company | ${SITE_NAME}`,
  description: 'Get your manufacturing company listed on FirmsLedger. Free to start, no credit card required. Reach buyers actively searching across all 50 states.',
  alternates: { canonical: `${_BASE}/list-your-company` },
  openGraph: {
    title: `List Your Company | ${SITE_NAME}`,
    description: 'Get your manufacturing company listed on FirmsLedger. Free to start.',
    type: 'website',
    url: `${_BASE}/list-your-company`,
  },
};

export default function ListYourCompanyPage() {
  return <ListYourCompany />;
}
