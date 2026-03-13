import { notFound } from 'next/navigation';
import { SITE_NAME, BASE_URL, SEO_YEAR, SEO_COUNTRY } from '@/lib/seo';
import BestContractStaffingAgenciesIndia2026Article from '@/views/blog/BestContractStaffingAgenciesIndia2026Article';
import BestPermanentStaffingRPOFirmsIndia2026Article from '@/views/blog/BestPermanentStaffingRPOFirmsIndia2026Article';
import HealthcareStaffingAhmedabadArticle from '@/views/blog/HealthcareStaffingAhmedabadArticle';
import Top10ITStaffingIndia2026Article from '@/views/blog/Top10ITStaffingIndia2026Article';
import TopIndustrialStaffingIndia2026Article from '@/views/blog/TopIndustrialStaffingIndia2026Article';
import Top10RecruitmentAgenciesIndia2026Article from '@/views/blog/Top10RecruitmentAgenciesIndia2026Article';
import TopStaffingAgenciesDelhiNCR2026Article from '@/views/blog/TopStaffingAgenciesDelhiNCR2026Article';
import TopITStaffingCompaniesBangalore2026Article from '@/views/blog/TopITStaffingCompaniesBangalore2026Article';
import Top10MillingMachineManufacturersIndia2026Article from '@/views/blog/Top10MillingMachineManufacturersIndia2026Article';

const ARTICLES = {
  'top-10-milling-machine-manufacturers-india-2026': {
    title: 'Top 10 Milling Machine Manufacturers in India (2026): Verified B2B Guide',
    description: "Comprehensive B2B guide to India's top milling machine manufacturers — HMT, BFW, Jyoti CNC, Ace Micromatic, Lokesh Machines, Godrej, MTAB, Premier, Electronica & Precihole. Compare certifications, specializations, and industries served.",
    seoTitle: `Top 10 Milling Machine Manufacturers in India ${SEO_YEAR} | CNC & Industrial Machine Tools | ${SITE_NAME}`,
    seoDescription: `Expert B2B guide to the best milling machine manufacturers in India for ${SEO_YEAR}. Compare HMT, BFW, Jyoti CNC, Ace Micromatic & more by location, certifications, and specialization. Updated ${SEO_YEAR}.`,
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Top 10 milling machine manufacturers in India 2026 - CNC and industrial machine tools',
    component: Top10MillingMachineManufacturersIndia2026Article,
  },
  'top-10-recruitment-agencies-india-2026': {
    title: 'Top 10 Recruitment Agencies in India (2026): Find the Best Hiring Partner',
    description: "Comprehensive guide to India's top 10 recruitment agencies — TeamLease, Naukri, Randstad, Adecco, ManpowerGroup, ABC Consultants, Michael Page, Korn Ferry, Heidrick & Struggles, Quess. Specializations, strengths, and how to choose.",
    seoTitle: `Top 10 Recruitment Agencies in India (2026) | Best Hiring Partners | ${SEO_COUNTRY} | ${SITE_NAME}`,
    seoDescription: "Expert guide to the best recruitment agencies in India for 2026. Compare TeamLease, Naukri, Randstad, Adecco, ManpowerGroup, ABC Consultants, Michael Page, Korn Ferry, Heidrick & Struggles, Quess. Executive search, staffing, RPO. Updated 2026.",
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Top 10 recruitment agencies in India 2026 - best hiring partners and staffing firms',
    component: Top10RecruitmentAgenciesIndia2026Article,
  },
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
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=630&fit=crop&q=85',
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
  'top-staffing-agencies-delhi-ncr-2026': {
    title: `Top Staffing Agencies in Delhi NCR (${SEO_YEAR})`,
    description: 'A city-specific guide to the 10 best staffing and recruitment agencies serving Delhi, Gurgaon, Noida, Faridabad, and the wider NCR region. Updated March 2026.',
    seoTitle: `Top Staffing Agencies in Delhi NCR ${SEO_YEAR} | Best Recruitment Firms in Gurgaon, Noida & Delhi | ${SITE_NAME}`,
    seoDescription: `Expert guide to the best staffing agencies in Delhi NCR for ${SEO_YEAR} — Gurgaon, Noida, Delhi, Faridabad. ABC Consultants, TeamLease, Randstad, ManpowerGroup, GlobalHunt & more. Updated March 2026.`,
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Top Staffing Agencies in Delhi NCR 2026 - best recruitment firms in Gurgaon, Noida and Delhi',
    component: TopStaffingAgenciesDelhiNCR2026Article,
  },
  'top-it-staffing-companies-bangalore-2026': {
    title: `Top IT Staffing Companies in Bangalore (${SEO_YEAR})`,
    description: "A city-specific guide to the 10 best IT staffing and tech recruitment agencies serving Bangalore's ORR, Whitefield, Electronic City, Manyata, and startup corridors. Updated March 2026.",
    seoTitle: `Top IT Staffing Companies in Bangalore ${SEO_YEAR} | Best Tech Recruitment Agencies in Bengaluru | ${SITE_NAME}`,
    seoDescription: `Expert guide to the best IT staffing companies in Bangalore for ${SEO_YEAR} — ORR, Whitefield, Electronic City, Manyata, Koramangala. TeamLease Digital, Xpheno, Quess, Careernet, Zyoin & more. Updated March 2026.`,
    image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Top IT Staffing Companies in Bangalore 2026 - best tech recruitment agencies in Bengaluru',
    component: TopITStaffingCompaniesBangalore2026Article,
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
