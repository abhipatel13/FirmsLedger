import { notFound } from 'next/navigation';
import { MANUFACTURING_CATEGORIES, CATEGORY_MAP } from '@/lib/manufacturingCategories';
import { BASE_URL, SITE_NAME } from '@/lib/seo';
import { renderCategoryPage } from './[state]/page';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { category: slug } = await params;
  const cat = CATEGORY_MAP[slug];
  if (!cat) return { title: `Category | ${SITE_NAME}` };
  const title = `${cat.name} Directory — All 50 US States`;
  const description = `Browse verified ${cat.noun} across all 50 US states on FirmsLedger. Find top-rated ${cat.noun} ranked by real customer reviews, not paid placements.`;
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
  const { page: pageParam } = await searchParams;
  if (!CATEGORY_MAP[slug]) notFound();
  return renderCategoryPage({ category: slug, state: undefined, pageParam });
}
