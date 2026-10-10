import { notFound } from 'next/navigation';
import { MANUFACTURING_CATEGORIES, CATEGORY_MAP } from '@/lib/manufacturingCategories';
import { BASE_URL, OG_IMAGE } from '@/lib/seo';
import { fetchCategoryStats } from '@/db/neonApi';
import { renderCategoryPage } from './[state]/page';
import { fitTitle } from '@/utils';

const _BASE = (BASE_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

export const revalidate = false;
export const dynamicParams = true;

export async function generateMetadata({ params }) {
  const { category: slug } = await params;
  const cat = CATEGORY_MAP[slug];
  if (!cat) return { title: 'Category' };
  const stats = await fetchCategoryStats(slug);
  const title = cat.hubTitle || `${cat.name} in the US`;
  const description = stats.totalCount > 0
    ? `Browse ${stats.totalCount} ${cat.hubNoun || cat.noun} across all 50 US states. Compare capabilities, location, and company size. No paid placements.`
    : `Browse ${cat.noun} across all 50 US states on FirmsLedger. Compare capabilities, location, and company size. No paid placements.`;
  const canonical = `${_BASE}/${slug}`;
  return {
    title: fitTitle(title),
    description,
    alternates: { canonical },
    openGraph: { images: [OG_IMAGE], title, description, type: 'website', url: canonical },
  };
}

export function generateStaticParams() {
  return MANUFACTURING_CATEGORIES.map((c) => ({ category: c.slug }));
}

export default async function CategoryLandingPage({ params }) {
  const { category: slug } = await params;
  if (!CATEGORY_MAP[slug]) notFound();
  return renderCategoryPage({ category: slug, state: undefined });
}
