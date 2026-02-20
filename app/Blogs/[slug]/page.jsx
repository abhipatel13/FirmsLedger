import { notFound } from 'next/navigation';
import { SITE_NAME, BASE_URL, SEO_YEAR, SEO_COUNTRY } from '@/lib/seo';
import HealthcareStaffingAhmedabadArticle from '@/views/blog/HealthcareStaffingAhmedabadArticle';

const ARTICLES = {
  'top-healthcare-staffing-agencies-ahmedabad-2026': {
    title: `Top Healthcare Staffing Agencies in Ahmedabad (${SEO_YEAR})`,
    description: 'A curated guide to the best healthcare staffing agencies in Ahmedabad. Find medical recruitment partners for hospitals, clinics, and healthcare facilities in Gujarat. Updated February 2026.',
    seoTitle: `Top Healthcare Staffing Agencies in Ahmedabad ${SEO_YEAR} | ${SEO_COUNTRY} | ${SITE_NAME}`,
    seoDescription: 'Discover the top healthcare staffing agencies in Ahmedabad. Curated guide to medical recruitment partners for hospitals and clinics in Gujarat. IMS People Possible, PACE, Hire Glocal & more. Updated 2026.',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Top Healthcare Staffing Agencies in Ahmedabad - medical recruitment for hospitals and clinics in Gujarat',
    component: HealthcareStaffingAhmedabadArticle,
  },
};

export async function generateMetadata({ params }) {
  const resolved = await params;
  const slug = resolved?.slug?.trim();
  if (!slug || !ARTICLES[slug]) return { title: `${SITE_NAME} – Blog` };
  const meta = ARTICLES[slug];
  const title = meta.seoTitle || `${meta.title} | ${SITE_NAME}`;
  const description = meta.seoDescription || meta.description;
  const canonical = `${BASE_URL.replace(/\/$/, '')}/blogs/${slug}`;
  const imageUrl = meta.image || null;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonical,
      ...(imageUrl && {
        images: [{ url: imageUrl, width: 1200, height: 630, alt: meta.imageAlt || title }],
      }),
    },
    ...(imageUrl && { twitter: { card: 'summary_large_image', images: [imageUrl] } }),
    alternates: { canonical },
  };
}

export default async function BlogArticlePage({ params }) {
  const resolved = await params;
  const slug = resolved?.slug?.trim();
  if (!slug || !ARTICLES[slug]) notFound();
  const ArticleComponent = ARTICLES[slug].component;
  return <ArticleComponent />;
}
