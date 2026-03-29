import CategoryPage from '@/views/CategoryPage';
import { BASE_URL, SITE_NAME, SEO_YEAR, getCategoryTitle, getCategoryMetaDescription } from '@/lib/seo';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const slug = params?.slug || '';
  const categoryName = slug
    ? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Business Services';

  const title = getCategoryTitle(categoryName);
  const description = getCategoryMetaDescription(categoryName, slug);
  const canonical = `${_BASE}/CategoryPage?slug=${encodeURIComponent(slug)}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      type: 'website',
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
    },
  };
}

export default function CategoryPageRoute({ searchParams }) {
  return <CategoryPage searchParams={searchParams} />;
}
