import { notFound } from 'next/navigation';
import { MANUFACTURING_CATEGORIES, CATEGORY_MAP } from '@/lib/manufacturingCategories';
import { BASE_URL, SITE_NAME } from '@/lib/seo';
import { fetchCategoryStats } from '@/db/neonApi';
import { renderCategoryPage } from './[state]/page';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { category: slug } = await params;
  const cat = CATEGORY_MAP[slug];
  if (!cat) return { title: `Category | ${SITE_NAME}` };
  const stats = await fetchCategoryStats(slug);
  const title = `Top ${Math.min(stats.totalCount, 10)} ${cat.name} in the US`;
  const description = stats.totalCount > 0
    ? `Browse ${stats.totalCount} ${cat.noun} across all 50 US states. Compare capabilities, location, and company size. No paid placements.`
    : `Browse ${cat.noun} across all 50 US states on FirmsLedger. Compare capabilities, location, and company size. No paid placements.`;
  const canonical = `${_BASE}/${slug}`;
  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical },
    openGraph: { title, description, type: 'website', url: canonical },
  };
}

export function generateStaticParams() {
  return MANUFACTURING_CATEGORIES.map((c) => ({ category: c.slug }));
}

export default async function CategoryLandingPage({ params, searchParams }) {
  const { category: slug } = await params;
  const sp = await searchParams;
  if (!CATEGORY_MAP[slug]) notFound();
  return renderCategoryPage({ category: slug, state: undefined, pageParam: sp.page, searchParams: sp });
}
