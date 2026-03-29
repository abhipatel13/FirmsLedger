import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { SITE_NAME, BASE_URL, SEO_YEAR, SEO_COUNTRY } from '@/lib/seo';
import DynamicBlogRenderer from '@/components/DynamicBlogRenderer';

/** Fetch an AI-generated post from Supabase by slug */
async function getDbPost(slug) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();
    return data || null;
  } catch {
    return null;
  }
}
import BestContractStaffingAgenciesIndia2026Article from '@/views/blog/BestContractStaffingAgenciesIndia2026Article';
import BestPermanentStaffingRPOFirmsIndia2026Article from '@/views/blog/BestPermanentStaffingRPOFirmsIndia2026Article';
import HealthcareStaffingAhmedabadArticle from '@/views/blog/HealthcareStaffingAhmedabadArticle';
import Top10ITStaffingIndia2026Article from '@/views/blog/Top10ITStaffingIndia2026Article';
import TopIndustrialStaffingIndia2026Article from '@/views/blog/TopIndustrialStaffingIndia2026Article';
import Top10RecruitmentAgenciesIndia2026Article from '@/views/blog/Top10RecruitmentAgenciesIndia2026Article';
import TopStaffingAgenciesDelhiNCR2026Article from '@/views/blog/TopStaffingAgenciesDelhiNCR2026Article';
import TopITStaffingCompaniesBangalore2026Article from '@/views/blog/TopITStaffingCompaniesBangalore2026Article';
import Top10MillingMachineManufacturersIndia2026Article from '@/views/blog/Top10MillingMachineManufacturersIndia2026Article';
import Top10DrillingMachineBrandsIndia2026Article from '@/views/blog/Top10DrillingMachineBrandsIndia2026Article';
import Top10WaterPumpBrandsIndia2026Article from '@/views/blog/Top10WaterPumpBrandsIndia2026Article';
import Top10LEDLightBrandsIndia2026Article from '@/views/blog/Top10LEDLightBrandsIndia2026Article';
import BestSolarPanelBrandsIndia2026Article from '@/views/blog/BestSolarPanelBrandsIndia2026Article';
import Top10SwitchSocketBrandsIndia2026Article from '@/views/blog/Top10SwitchSocketBrandsIndia2026Article';
import Top10StabilizerBrandsIndia2026Article from '@/views/blog/Top10StabilizerBrandsIndia2026Article';
import BestSolarPanelsAustralia2026Article from '@/views/blog/BestSolarPanelsAustralia2026Article';
import BestSpecialtyChemicalCompaniesAustralia2026Article from '@/views/blog/BestSpecialtyChemicalCompaniesAustralia2026Article';
import TopCNCManufacturersNevada2026Article from '@/views/blog/TopCNCManufacturersNevada2026Article';

const ARTICLES = {
  'top-cnc-manufacturers-nevada-2026': {
    title: 'Top CNC Manufacturers in Nevada: Best Machine Shops for Precision Machining in 2026',
    description: 'A comprehensive guide to the best CNC manufacturers in Nevada — CES Machine, Owens Industries, Frigate, CapableMachining, and Tonza Making. Compared by capabilities, certifications, and industries served.',
    seoTitle: `Top CNC Manufacturers in Nevada: Best Machine Shops for Precision Machining in 2026 | ${SITE_NAME}`,
    seoDescription: 'Discover the top CNC manufacturers in Nevada for 2026. Compare CES Machine, Owens Industries, Frigate & more for precision machining, certifications, and industries served.',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Top CNC manufacturers in Nevada 2026 - precision machining and CNC machine shops',
    component: TopCNCManufacturersNevada2026Article,
  },
  'best-specialty-chemical-companies-australia-2026': {
    title: 'Best Specialty Chemical Companies in Australia for Manufacturing (2026)',
    description: 'A verified B2B guide to Australia\'s top specialty chemical suppliers — compared by sector expertise, AICIS compliance, certifications, and manufacturing capability for 2026.',
    seoTitle: 'Best Specialty Chemical Companies in Australia (2026) | B2B Guide',
    seoDescription: 'Discover the best specialty chemical companies in Australia for manufacturing in 2026. Compare Orica, Nufarm, Ixom, Brenntag, Chem-Supply & more by AICIS compliance, certifications & sectors served.',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Best specialty chemical companies in Australia for manufacturing 2026 - industrial chemical facility',
    component: BestSpecialtyChemicalCompaniesAustralia2026Article,
  },
  'best-solar-panels-australia-2026': {
    title: 'Best Solar Panels in Australia (2026) — Brands Compared & Reviewed',
    description: "A comprehensive guide to the best solar panel brands in Australia — compared by CEC approval, efficiency, warranty, and AUD price for homes, farms, and commercial use.",
    seoTitle: `Best Solar Panels in Australia (2026) — Brands Compared & Reviewed`,
    seoDescription: 'Looking for the best solar panels in Australia? Compare top brands, prices, efficiency & warranties. CEC approved. Updated for 2026.',
    image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Best solar panels in Australia 2026 - rooftop solar installation on Australian home',
    component: BestSolarPanelsAustralia2026Article,
  },
  'top-10-stabilizer-brands-india-2026': {
    title: 'Top 10 Stabilizer Brands in India (2026) – Best Brands for Home, Commercial & Industrial Use',
    description: "A comprehensive guide to India's best voltage stabilizer brands — evaluated by ISI certification, voltage correction range, warranty, and price across home, commercial, and industrial use.",
    seoTitle: `Top 10 Stabilizer Brands in India (2026) | Best Voltage Stabilizers for Home, Commercial & Industrial Use`,
    seoDescription: 'Discover the top 10 stabilizer brands in India for 2026. Compare V-Guard, Microtek, Luminous, Servokon & more. ISI certified. Best for AC, fridge & industrial use. Updated 2026.',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Top 10 stabilizer brands in India 2026 - best voltage stabilizers for home commercial and industrial use',
    component: Top10StabilizerBrandsIndia2026Article,
  },
  'top-10-switch-socket-brands-india-2026': {
    title: 'Top 10 Switch & Socket Brands in India (2026) – Best Brands for Home, Commercial & Industrial Use',
    description: "A comprehensive guide to India's best switch and socket brands — evaluated by ISI certification, build quality, design, warranty, and price across home, commercial, and industrial use.",
    seoTitle: `Top 10 Switch & Socket Brands in India (2026) | Best Modular Switches for Home & Commercial Use`,
    seoDescription: 'Discover the top 10 switch and socket brands in India for 2026. Compare Legrand, Havells, Anchor, Schneider, GM Modular & more. ISI certified. Updated 2026.',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Top 10 switch and socket brands in India 2026 - best modular switches for home and commercial use',
    component: Top10SwitchSocketBrandsIndia2026Article,
  },
  'best-solar-panel-brands-india-2026': {
    title: 'Best Solar Panel Brands in India (2026) – Best Brands for Home, Commercial & Industrial Use',
    description: "A comprehensive guide to India's best solar panel brands — evaluated by BIS/ALMM certification, efficiency, warranty, and price across home, commercial, and industrial use.",
    seoTitle: `Best Solar Panel Brands in India (2026) | Top Solar Panels for Home, Commercial & Industrial Use`,
    seoDescription: 'Discover the best solar panel brands in India for 2026. Compare Waaree, Tata Power Solar, Adani Solar, Vikram Solar & more. BIS certified, ALMM listed. Updated 2026.',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Best solar panel brands in India 2026 - top solar panels for home commercial and industrial use',
    component: BestSolarPanelBrandsIndia2026Article,
  },
  'top-10-led-light-brands-india-2026': {
    title: 'Top 10 LED Light Brands in India (2026) – Best for Home, Office & Industrial Use',
    description: "A comprehensive guide to India's best LED light brands — evaluated for BIS/ISI certification, energy efficiency, lumen output, warranty, and value across home, commercial, and industrial use.",
    seoTitle: `Top 10 LED Light Brands in India (2026) | Best LED Lights for Home, Office & Industrial Use`,
    seoDescription: 'Discover the top 10 LED light brands in India for 2026. Compare Philips, Havells, Syska, Wipro, Bajaj, Crompton & more for home, office and industrial use. BIS certified. Updated 2026.',
    image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Top 10 LED light brands in India 2026 - best LED lights for home office and industrial use',
    component: Top10LEDLightBrandsIndia2026Article,
  },
  'top-10-water-pump-brands-india-2026': {
    title: 'Top 10 Water Pump Brands in India (2026) – Best for Home, Agriculture & Industrial Use',
    description: 'A comprehensive guide to India\'s best water pump brands — evaluated for reliability, energy efficiency, after-sales service, and value across home, agriculture, and industrial use.',
    seoTitle: `Top 10 Water Pump Brands in India (2026) | Best Pumps for Home, Agriculture & Industrial Use`,
    seoDescription: 'Discover the top 10 water pump brands in India for 2026. Compare Kirloskar, Crompton, CRI, Grundfos & more for home, agriculture & industrial use. Updated 2026.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Top 10 water pump brands in India 2026 - best pumps for home agriculture and industrial use',
    component: Top10WaterPumpBrandsIndia2026Article,
  },
  'top-10-drilling-machine-brands-india-2026': {
    title: 'Top 10 Drilling Machine Brands in India (2026): Complete B2B Buyer\'s Guide',
    description: "Comprehensive B2B guide to India's top drilling machine brands — HMT, BFW, Jyoti CNC, Premier, INDER, Apex Tools, Precihole, Bosch, DeWalt & Makita. Compare by type, price range, certifications, and after-sales support.",
    seoTitle: `Top 10 Drilling Machine Brands in India ${SEO_YEAR} | ${SITE_NAME}`,
    seoDescription: `Expert B2B guide to the best drilling machine brands in India for ${SEO_YEAR}. Compare HMT, BFW, INDER, Bosch & more by type, price & industry. Updated ${SEO_YEAR}.`,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Top 10 drilling machine brands in India 2026 - industrial and CNC drilling machines',
    component: Top10DrillingMachineBrandsIndia2026Article,
  },
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
  if (!slug) return { title: `${SITE_NAME} – Blog` };

  // Static article metadata
  if (ARTICLES[slug]) {
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

  // DB-backed (AI-generated) article metadata
  const dbPost = await getDbPost(slug);
  if (!dbPost) return { title: `${SITE_NAME} – Blog` };
  const title = `${dbPost.title} | ${SITE_NAME}`;
  const canonical = `${BASE_URL.replace(/\/$/, '')}/blogs/${slug}`;
  return {
    title,
    description: dbPost.meta_description,
    openGraph: {
      title,
      description: dbPost.meta_description,
      type: 'article',
      url: canonical,
      ...(dbPost.image_url && {
        images: [{ url: dbPost.image_url, width: 1200, height: 630, alt: dbPost.image_alt || title }],
      }),
    },
    ...(dbPost.image_url && { twitter: { card: 'summary_large_image', images: [dbPost.image_url] } }),
    alternates: { canonical },
  };
}

export default async function BlogArticlePage({ params }) {
  const resolved = await params;
  const slug = resolved?.slug?.trim();
  if (!slug) notFound();

  // 1. Try static hand-written article first
  if (ARTICLES[slug]) {
    const ArticleComponent = ARTICLES[slug].component;
    return <ArticleComponent />;
  }

  // 2. Fall back to AI-generated post from Supabase
  const dbPost = await getDbPost(slug);
  if (!dbPost) notFound();

  // Fetch related posts from the same category
  let relatedPosts = [];
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );
    const { data } = await supabase
      .from('blog_posts')
      .select('slug, title, meta_description')
      .eq('published', true)
      .eq('category', dbPost.category)
      .neq('slug', slug)
      .limit(4);
    relatedPosts = (data || []).map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.meta_description,
    }));
  } catch {}

  return <DynamicBlogRenderer post={dbPost} relatedPosts={relatedPosts} />;
}
