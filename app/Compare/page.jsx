import Compare from '@/views/Compare';
import { SITE_NAME, BASE_URL } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const metadata = {
  title: `Compare Companies | ${SITE_NAME}`,
  description: 'Compare verified business service providers side by side on FirmsLedger. Evaluate expertise, team size, pricing, and reviews to choose the right partner.',
  alternates: { canonical: `${_BASE}/Compare` },
  openGraph: {
    title: `Compare Companies | ${SITE_NAME}`,
    description: 'Compare verified business service providers side by side on FirmsLedger.',
    type: 'website',
    url: `${_BASE}/Compare`,
  },
};

export default function ComparePage({ searchParams }) {
  return <Compare searchParams={searchParams} />;
}
