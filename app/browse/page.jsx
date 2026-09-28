import Categories from '@/views/Categories';
import { SITE_NAME, BASE_URL } from '@/lib/seo';
import { api } from '@/api/apiClient';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const metadata = {
  title: 'Browse All Industries',
  description: `Explore all manufacturing industries on FirmsLedger — electrical, mechanical, plastics, metals, automotive, textile, furniture, food, and medical device manufacturers across the US.`,
  alternates: { canonical: `${_BASE}/browse` },
  openGraph: {
    title: `Browse All Industries | ${SITE_NAME}`,
    description: `Find manufacturers across 10 industries and 84+ subcategories across the US.`,
    type: 'website',
    url: `${_BASE}/browse`,
  },
};

export default async function BrowsePage() {
  const initialCategories = await api.entities.Category.list();
  return <Categories initialCategories={initialCategories} />;
}
