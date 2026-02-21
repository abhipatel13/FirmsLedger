import { notFound } from 'next/navigation';
import { SITE_NAME, BASE_URL, SEO_YEAR, SEO_COUNTRY } from '@/lib/seo';
import BestContractStaffingAgenciesIndia2026Article from '@/views/blog/BestContractStaffingAgenciesIndia2026Article';
import BestPermanentStaffingRPOFirmsIndia2026Article from '@/views/blog/BestPermanentStaffingRPOFirmsIndia2026Article';
import HealthcareStaffingAhmedabadArticle from '@/views/blog/HealthcareStaffingAhmedabadArticle';
import Top10ITStaffingIndia2026Article from '@/views/blog/Top10ITStaffingIndia2026Article';
import TopIndustrialStaffingIndia2026Article from '@/views/blog/TopIndustrialStaffingIndia2026Article';

const ARTICLES = {
  'best-contract-staffing-agencies-india-2026': {
    title: `Best Contract Staffing Agencies in India ${SEO_YEAR}`,
    description: "A practical guide to India's top contract and temporary staffing agencies — scale your workforce with compliance, speed, and flexibility. TeamLease, Quess, Innovsource, Randstad & more.",
    seoTitle: `Best Contract Staffing Agencies in India ${SEO_YEAR} | ${SEO_COUNTRY} | ${SITE_NAME}`,
    seoDescription: "Expert guide to the best contract staffing agencies in India for 2026. Temporary workforce, compliance, deployment speed. TeamLease, Quess, Innovsource, Randstad, Wisemonk. Updated February 2026.",
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Best contract staffing agencies in India 2026 - temporary and contract workforce solutions',
    component: BestContractStaffingAgenciesIndia2026Article,
  },
  'best-permanent-staffing-rpo-firms-india-2026': {
    title: `Best Permanent Staffing & RPO Firms in India ${SEO_YEAR}`,
    description: "Expert-curated guide to India's top permanent recruitment and RPO partners — for direct hire and scalable hiring programs. TeamLease Digital, Randstad, ABC Consultants, Adecco & more.",
    seoTitle: `Best Permanent Staffing & RPO Firms in India ${SEO_YEAR} | ${SEO_COUNTRY} | ${SITE_NAME}`,
    seoDescription: "Best permanent staffing and RPO firms in India for 2026. Direct hire, recruitment process outsourcing. TeamLease Digital, Randstad, ABC Consultants, Adecco, Xpheno. Updated February 2026.",
    image: 'https://images.unsplash.com/photo-1600880292203-848bb581ba47?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Best permanent staffing and RPO firms in India 2026 - recruitment process outsourcing and direct hire',
    component: BestPermanentStaffingRPOFirmsIndia2026Article,
  },
  'top-healthcare-staffing-agencies-ahmedabad-2026': {
    title: `Top Healthcare Staffing Agencies in Ahmedabad (${SEO_YEAR})`,
    description: 'A curated guide to the best healthcare staffing agencies in Ahmedabad. Find medical recruitment partners for hospitals, clinics, and healthcare facilities in Gujarat. Updated February 2026.',
    seoTitle: `Top Healthcare Staffing Agencies in Ahmedabad ${SEO_YEAR} | ${SEO_COUNTRY} | ${SITE_NAME}`,
    seoDescription: 'Discover the top healthcare staffing agencies in Ahmedabad. Curated guide to medical recruitment partners for hospitals and clinics in Gujarat. IMS People Possible, PACE, Hire Glocal & more. Updated 2026.',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Top Healthcare Staffing Agencies in Ahmedabad - medical recruitment for hospitals and clinics in Gujarat',
    component: HealthcareStaffingAhmedabadArticle,
  },
  'top-10-it-staffing-companies-india-2026': {
    title: `Top 10 IT Staffing Companies in India for ${SEO_YEAR}`,
    description: "A comprehensive, expert-curated guide to India's best tech recruitment agencies — helping businesses hire faster, smarter, and in full compliance. TeamLease Digital, Randstad, Quess, Adecco & more.",
    seoTitle: `Top 10 IT Staffing Companies in India ${SEO_YEAR} | ${SEO_COUNTRY} | ${SITE_NAME}`,
    seoDescription: "Expert guide to the best IT staffing companies in India for 2026. TeamLease Digital, Randstad, Quess, Adecco, Wisemonk and more. Contract, permanent, RPO & EOR. Updated February 2026.",
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Top 10 IT Staffing Companies in India 2026 - tech recruitment and staffing agencies',
    component: Top10ITStaffingIndia2026Article,
  },
  'top-industrial-staffing-companies-india-2026': {
    title: `Top Industrial Staffing Companies in India ${SEO_YEAR}`,
    description: "Discover the top industrial staffing companies in India for 2026. Compare leading blue-collar, manufacturing, logistics & engineering workforce agencies — services, sectors, and how to choose the right partner.",
    seoTitle: `Top Industrial Staffing Companies in India ${SEO_YEAR} | Best Blue-Collar & Manufacturing Recruitment | ${SITE_NAME}`,
    seoDescription: "Expert guide to India's best industrial staffing and workforce agencies for 2026 — manufacturing, logistics, construction, automotive, blue-collar hiring. TeamLease, Quess, Innovsource & more. Updated February 2026.",
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Top Industrial Staffing Companies in India 2026 - blue-collar manufacturing recruitment agencies',
    component: TopIndustrialStaffingIndia2026Article,
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
