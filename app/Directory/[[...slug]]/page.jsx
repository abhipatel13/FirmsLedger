import { Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import Directory from '@/views/Directory';
import { notFound } from 'next/navigation';
import { SITE_NAME, BASE_URL, SEO_YEAR, SEO_COUNTRY, getCategoryTitle, getCategoryMetaDescription } from '@/lib/seo';

const BASE_DESC = "India's trusted platform to discover and connect with verified business service providers and staffing agencies.";

async function getCategoryBySlug(slug) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data } = await supabase.from('categories').select('name, description, slug').eq('slug', slug).maybeSingle();
  return data;
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const slugArr = resolved?.slug;
  const categorySlug = Array.isArray(slugArr) && slugArr.length === 1 ? slugArr[0]?.trim() : null;

  if (!categorySlug) {
    return {
      title: `Top Companies List in ${SEO_COUNTRY} ${SEO_YEAR} | Browse Verified Agencies | ${SITE_NAME}`,
      description: `Browse the top companies list. Find verified staffing agencies, HR services, and business providers. ${BASE_DESC}`,
      openGraph: { title: `Top Companies List | ${SITE_NAME}`, description: BASE_DESC, type: 'website' },
      alternates: { canonical: `${BASE_URL.replace(/\/$/, '')}/directory` },
    };
  }

  const category = await getCategoryBySlug(categorySlug);
  if (!category) {
    return { title: `${SITE_NAME} – Directory` };
  }
  const title = getCategoryTitle(category.name);
  const description = getCategoryMetaDescription(category.name, category.slug);
  const canonical = `${BASE_URL.replace(/\/$/, '')}/directory/${categorySlug}`;
  return {
    title,
    description,
    openGraph: { title, description, type: 'website', url: canonical },
    alternates: { canonical },
  };
}

export default async function DirectoryRoute({ params }) {
  const resolved = await params;
  const slugArr = resolved?.slug;
  const categorySlug = Array.isArray(slugArr) && slugArr.length === 1 ? slugArr[0]?.trim() : null;

  if (slugArr && slugArr.length > 1) {
    notFound();
    return null;
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" /></div>}>
      <Directory initialCategorySlug={categorySlug || undefined} />
    </Suspense>
  );
}
