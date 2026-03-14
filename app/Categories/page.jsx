import Categories from '@/views/Categories';
import { SITE_NAME, BASE_URL, SEO_COUNTRY } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const metadata = {
  title: `Browse All Business Service Categories in ${SEO_COUNTRY} | ${SITE_NAME}`,
  description: `Explore all business service categories on FirmsLedger — staffing agencies, IT services, consulting firms, manufacturing suppliers, and more. Find verified providers across ${SEO_COUNTRY}.`,
  alternates: { canonical: `${_BASE}/Categories` },
  openGraph: {
    title: `All Business Service Categories in ${SEO_COUNTRY} | ${SITE_NAME}`,
    description: `Browse all business service categories on FirmsLedger. Verified providers across staffing, IT, consulting, manufacturing, and more in ${SEO_COUNTRY}.`,
    type: 'website',
    url: `${_BASE}/Categories`,
  },
};

export default function CategoriesPage() {
  return <Categories />;
}
