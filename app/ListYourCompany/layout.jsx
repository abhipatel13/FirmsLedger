import { BASE_URL, SITE_NAME } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const metadata = {
  title: `List Your Company | ${SITE_NAME}`,
  description: `Add your business to FirmsLedger — India's trusted directory of verified service providers. Submit your company profile for free and reach thousands of potential clients.`,
  alternates: { canonical: `${_BASE}/ListYourCompany` },
  openGraph: {
    title: 'List Your Company on FirmsLedger',
    description: `Add your business to FirmsLedger — India's trusted directory. Reach thousands of potential clients. Submit your company profile for free.`,
    type: 'website',
    url: `${_BASE}/ListYourCompany`,
  },
};

export default function ListYourCompanyLayout({ children }) {
  return children;
}
