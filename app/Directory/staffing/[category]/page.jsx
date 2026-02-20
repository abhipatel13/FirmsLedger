import { Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import Directory from '@/views/Directory';
import { notFound } from 'next/navigation';
import { SITE_NAME, BASE_URL, getCategoryTitle, getCategoryMetaDescription } from '@/lib/seo';

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
  const slug = resolved?.category?.trim();
  if (!slug) return { title: `${SITE_NAME} – Staffing Directory` };
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: `${SITE_NAME} – Staffing` };
  const title = getCategoryTitle(category.name);
  const description = getCategoryMetaDescription(category.name, category.slug, { underStaffing: true });
  const canonical = `${BASE_URL.replace(/\/$/, '')}/directory/staffing/${slug}`;
  return {
    title,
    description,
    openGraph: { title, description, type: 'website', url: canonical },
    alternates: { canonical },
  };
}

export default async function DirectoryStaffingCategoryPage({ params }) {
  const resolved = await params;
  const slug = resolved?.category?.trim();
  if (!slug) {
    notFound();
    return null;
  }
  const category = await getCategoryBySlug(slug);
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" /></div>}>
      <Directory initialCategorySlug={slug} underStaffing />
    </Suspense>
  );
}
