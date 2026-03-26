import { Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import Directory from '@/views/Directory';
import { notFound } from 'next/navigation';
import { SITE_NAME, BASE_URL, SEO_YEAR, SEO_COUNTRY, getCategoryTitle, getCategoryMetaDescription, getCategoryTitleWithLocation, getCategoryMetaDescriptionWithLocation } from '@/lib/seo';

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function getInitialDirectoryData(categorySlug) {
  try {
    const supabase = getServerSupabase();
    if (!supabase) return { agencies: [], categories: [], specificCategory: null };
    const [{ data: agencyCategories }, { data: categories }] = await Promise.all([
      supabase.from('agency_categories').select('*').limit(10000),
      supabase.from('categories').select('*').order('name').limit(10000),
    ]);

    // If the specific category isn't in the 10k list, fetch it directly
    let specificCategory = categorySlug ? (categories || []).find(c => c.slug === categorySlug) || null : null;
    if (categorySlug && !specificCategory) {
      const { data: catData } = await supabase.from('categories').select('*').eq('slug', categorySlug).maybeSingle();
      specificCategory = catData || null;
    }

    let agencies = [];
    const cat = specificCategory;
    if (cat) {
      let categoryIds = [cat.id];
      if (cat.is_parent) {
        const subIds = (categories || []).filter(c => c.parent_id === cat.id).map(c => c.id);
        categoryIds.push(...subIds);
      }
      const relatedIds = [...new Set(
        (agencyCategories || []).filter(ac => categoryIds.includes(ac.category_id)).map(ac => ac.agency_id)
      )];
      if (relatedIds.length > 0) {
        const { data } = await supabase.from('agencies')
          .select('*').eq('approved', true).in('id', relatedIds)
          .order('avg_rating', { ascending: false }).limit(200);
        agencies = data || [];
      }
    }

    return { agencies, categories: categories || [], specificCategory };
  } catch {
    return { agencies: [], categories: [], specificCategory: null };
  }
}

const BASE_DESC = "The global platform to discover and connect with verified business service providers and staffing agencies worldwide.";

async function getCategoryBySlug(slug) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data } = await supabase.from('categories').select('name, description, slug').eq('slug', slug).maybeSingle();
  return data;
}

export async function generateMetadata({ params, searchParams }) {
  const resolved = await params;
  const resolvedSearch = await searchParams;
  const slugArr = resolved?.slug;
  const categorySlug = Array.isArray(slugArr) && slugArr.length === 1 ? slugArr[0]?.trim() : null;

  const countryName = resolvedSearch?.country || '';
  const stateName = resolvedSearch?.state || '';
  const location = [stateName, countryName].filter(Boolean).join(', ');

  if (!categorySlug) {
    const baseTitle = `Top Companies List in ${location || SEO_COUNTRY} ${SEO_YEAR} | Browse Verified Agencies | ${SITE_NAME}`;
    return {
      title: baseTitle,
      description: `Browse the top companies list. Find verified staffing agencies, HR services, and business providers. ${BASE_DESC}`,
      openGraph: { title: baseTitle, description: BASE_DESC, type: 'website' },
      alternates: { canonical: `${BASE_URL.replace(/\/$/, '')}/directory` },
    };
  }

  const category = await getCategoryBySlug(categorySlug);
  if (!category) {
    return { title: `${SITE_NAME} – Directory` };
  }

  const title = getCategoryTitleWithLocation(category.name, location);
  const description = getCategoryMetaDescriptionWithLocation(category.name, category.slug, location);
  const base = `${BASE_URL.replace(/\/$/, '')}/directory/${categorySlug}`;
  const qp = new URLSearchParams();
  if (countryName) qp.set('country', countryName);
  if (stateName) qp.set('state', stateName);
  const canonical = qp.size ? `${base}?${qp.toString()}` : base;

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

  const { agencies, categories, specificCategory } = await getInitialDirectoryData(categorySlug);

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" /></div>}>
      <Directory
        initialCategorySlug={categorySlug || undefined}
        initialCategoryData={specificCategory || undefined}
        initialAgencies={agencies}
        initialCategories={categories}
      />
    </Suspense>
  );
}
