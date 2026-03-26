import Categories from '@/views/Categories';
import { SITE_NAME, BASE_URL, SEO_COUNTRY } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const metadata = {
  title: `Browse All Business Categories in ${SEO_COUNTRY} | Products & Services | ${SITE_NAME}`,
  description: `Explore all business categories on FirmsLedger — manufacturers, suppliers, staffing agencies, IT companies, consulting firms, and more. Find verified companies across ${SEO_COUNTRY}.`,
  alternates: { canonical: `${_BASE}/Categories` },
  openGraph: {
    title: `All Business Categories in ${SEO_COUNTRY} | Products & Services | ${SITE_NAME}`,
    description: `Browse all business categories on FirmsLedger. Verified manufacturers, suppliers, staffing agencies, IT companies, consulting firms and more in ${SEO_COUNTRY}.`,
    type: 'website',
    url: `${_BASE}/Categories`,
  },
};

export default function CategoriesPage() {
  return <Categories />;
}
