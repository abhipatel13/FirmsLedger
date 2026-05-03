import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { SITE_NAME, BASE_URL, SEO_YEAR, SEO_COUNTRY } from '@/lib/seo';
import DynamicBlogRenderer from '@/components/DynamicBlogRenderer';

import Top10RecruitmentAgenciesIndia2026Article from '@/views/blog/Top10RecruitmentAgenciesIndia2026Article';
import TopITStaffingCompaniesBangalore2026Article from '@/views/blog/TopITStaffingCompaniesBangalore2026Article';
import TopFoodDistributionCompaniesUSA2026Article from '@/views/blog/TopFoodDistributionCompaniesUSA2026Article';
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
import TopMedicalVentilatorManufacturersUSA2026Article from '@/views/blog/TopMedicalVentilatorManufacturersUSA2026Article';
import TopAmericanCruiseCompanies2026Article from '@/views/blog/TopAmericanCruiseCompanies2026Article';

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

const ARTICLES = {
  'top-food-distribution-companies-usa-2026': {
    title: 'Top Food Distribution Companies in the United States: The Complete Guide [2026]',
    seoTitle: `Top Food Distribution Companies in the United States (2026) | ${SITE_NAME}`,
    seoDescription: 'Top 12 food distribution companies in the US for 2026 — Sysco, US Foods, PFG, McLane, Gordon, Dot Foods, UNFI, KeHE, SpartanNash, HAVI, Chefs\' Warehouse, Core-Mark. Revenue, trends, and how to choose.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Top food distribution companies in the United States 2026',
    component: TopFoodDistributionCompaniesUSA2026Article,
  },
  'top-american-cruise-companies-2026': {
    title: 'Top American Cruise Companies: The Best of the US Cruise Industry in 2026',
    seoTitle: 'Top American Cruise Companies: Best US Cruise Lines in 2026 | FirmsLedger',
    seoDescription: 'Discover the top American cruise companies in 2026. Compare Carnival, Royal Caribbean, Disney, Viking & more by destinations, price, and onboard experience.',
    image: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Top American cruise companies 2026 — luxury cruise ship at sea',
    component: TopAmericanCruiseCompanies2026Article,
  },
  'top-medical-ventilator-manufacturers-usa-2026': {
    title: 'Top Medical Ventilator Manufacturers in the USA: Leaders Powering Respiratory Care in 2026',
    seoTitle: 'Top Medical Ventilator Manufacturers in the USA (2026) | Best ICU & Respiratory Care Brands | FirmsLedger',
    seoDescription: 'Discover the top medical ventilator manufacturers in the USA for 2026 — from Medtronic to ResMed. Compare ICU, portable & home care ventilator leaders.',
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Top medical ventilator manufacturers in the USA 2026 — ICU ventilator and respiratory care equipment',
    component: TopMedicalVentilatorManufacturersUSA2026Article,
  },
  'top-cnc-manufacturers-nevada-2026': {
    title: 'Top CNC Manufacturers in Nevada: Best Machine Shops for Precision Machining in 2026',
    seoTitle: `Top CNC Manufacturers in Nevada: Best Machine Shops for Precision Machining in 2026 | ${SITE_NAME}`,
    seoDescription: 'Discover the top CNC manufacturers in Nevada for 2026. Compare CES Machine, Owens Industries, Frigate & more for precision machining, certifications, and industries served.',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Top CNC manufacturers in Nevada 2026 - precision machining and CNC machine shops',
    component: TopCNCManufacturersNevada2026Article,
  },
  'best-specialty-chemical-companies-australia-2026': {
    title: 'Best Specialty Chemical Companies in Australia for Manufacturing (2026)',
    seoTitle: 'Best Specialty Chemical Companies in Australia (2026) | B2B Guide',
    seoDescription: 'Discover the best specialty chemical companies in Australia for manufacturing in 2026. Compare Orica, Nufarm, Ixom, Brenntag, Chem-Supply & more.',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Best specialty chemical companies in Australia for manufacturing 2026 - industrial chemical facility',
    component: BestSpecialtyChemicalCompaniesAustralia2026Article,
  },
  'best-solar-panels-australia-2026': {
    title: 'Best Solar Panels in Australia (2026) — Brands Compared & Reviewed',
    seoTitle: 'Best Solar Panels in Australia (2026) — Brands Compared & Reviewed',
    seoDescription: 'Looking for the best solar panels in Australia? Compare top brands, prices, efficiency & warranties. CEC approved. Updated for 2026.',
    image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Best solar panels in Australia 2026 - rooftop solar installation on Australian home',
    component: BestSolarPanelsAustralia2026Article,
  },
  'top-10-stabilizer-brands-india-2026': {
    title: 'Top 10 Stabilizer Brands in India (2026) — Best Brands for Home, Commercial & Industrial Use',
    seoTitle: 'Top 10 Stabilizer Brands in India (2026) | Best Voltage Stabilizers',
    seoDescription: 'Top 10 stabilizer brands in India for 2026. Compare V-Guard, Microtek, Luminous, Servokon & more. ISI certified. Best for AC, fridge & industrial use.',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Top 10 stabilizer brands in India 2026 - best voltage stabilizers',
    component: Top10StabilizerBrandsIndia2026Article,
  },
  'top-10-switch-socket-brands-india-2026': {
    title: 'Top 10 Switch & Socket Brands in India (2026)',
    seoTitle: 'Top 10 Switch & Socket Brands in India (2026)',
    seoDescription: 'Top 10 switch and socket brands in India for 2026. Compare Legrand, Havells, Anchor, Schneider, GM Modular & more. ISI certified.',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Top 10 switch and socket brands in India 2026',
    component: Top10SwitchSocketBrandsIndia2026Article,
  },
  'best-solar-panel-brands-india-2026': {
    title: 'Best Solar Panel Brands in India (2026)',
    seoTitle: 'Best Solar Panel Brands in India (2026) | Top Solar Panels',
    seoDescription: 'Best solar panel brands in India for 2026. Compare Waaree, Tata Power Solar, Adani Solar, Vikram Solar & more. BIS certified, ALMM listed.',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Best solar panel brands in India 2026',
    component: BestSolarPanelBrandsIndia2026Article,
  },
  'top-10-led-light-brands-india-2026': {
    title: 'Top 10 LED Light Brands in India (2026)',
    seoTitle: 'Top 10 LED Light Brands in India (2026)',
    seoDescription: 'Top 10 LED light brands in India for 2026. Compare Philips, Havells, Syska, Wipro, Bajaj, Crompton & more for home, office and industrial use.',
    image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Top 10 LED light brands in India 2026',
    component: Top10LEDLightBrandsIndia2026Article,
  },
  'top-10-water-pump-brands-india-2026': {
    title: 'Top 10 Water Pump Brands in India (2026)',
    seoTitle: 'Top 10 Water Pump Brands in India (2026)',
    seoDescription: 'Top 10 water pump brands in India for 2026. Compare Kirloskar, Crompton, CRI, Grundfos & more.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Top 10 water pump brands in India 2026',
    component: Top10WaterPumpBrandsIndia2026Article,
  },
  'top-10-drilling-machine-brands-india-2026': {
    title: "Top 10 Drilling Machine Brands in India (2026): Complete B2B Buyer's Guide",
    seoTitle: `Top 10 Drilling Machine Brands in India ${SEO_YEAR} | ${SITE_NAME}`,
    seoDescription: `Expert B2B guide to the best drilling machine brands in India for ${SEO_YEAR}. Compare HMT, BFW, INDER, Bosch & more.`,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Top 10 drilling machine brands in India 2026',
    component: Top10DrillingMachineBrandsIndia2026Article,
  },
  'top-10-milling-machine-manufacturers-india-2026': {
    title: 'Top 10 Milling Machine Manufacturers in India (2026)',
    seoTitle: `Top 10 Milling Machine Manufacturers in India ${SEO_YEAR} | ${SITE_NAME}`,
    seoDescription: `Expert B2B guide to the best milling machine manufacturers in India for ${SEO_YEAR}.`,
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Top 10 milling machine manufacturers in India 2026',
    component: Top10MillingMachineManufacturersIndia2026Article,
  },
  'top-10-recruitment-agencies-india-2026': {
    title: 'Top 10 Recruitment Agencies in India (2026)',
    seoTitle: `Top 10 Recruitment Agencies in India (2026) | ${SEO_COUNTRY} | ${SITE_NAME}`,
    seoDescription: 'Expert guide to the best recruitment agencies in India for 2026. TeamLease, Naukri, Randstad, Adecco & more.',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Top 10 recruitment agencies in India 2026',
    component: Top10RecruitmentAgenciesIndia2026Article,
  },
  'top-it-staffing-companies-bangalore-2026': {
    title: `Top IT Staffing Companies in Bangalore (${SEO_YEAR})`,
    seoTitle: `Top IT Staffing Companies in Bangalore ${SEO_YEAR} | ${SITE_NAME}`,
    seoDescription: `Best IT staffing companies in Bangalore for ${SEO_YEAR} — ORR, Whitefield, Electronic City, Manyata, Koramangala.`,
    image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=1200&h=630&fit=crop&q=85',
    imageAlt: 'Top IT Staffing Companies in Bangalore 2026',
    component: TopITStaffingCompaniesBangalore2026Article,
  },
};

export async function generateMetadata({ params }) {
  const resolved = await params;
  const slug = resolved?.slug?.trim();
  if (!slug) return { title: `${SITE_NAME} – Blog` };

  if (ARTICLES[slug]) {
    const meta = ARTICLES[slug];
    const title = meta.seoTitle || `${meta.title} | ${SITE_NAME}`;
    const description = meta.seoDescription || meta.description;
    const canonical = `${BASE_URL.replace(/\/$/, '')}/blog/${slug}`;
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

  const dbPost = await getDbPost(slug);
  if (!dbPost) return { title: `${SITE_NAME} – Blog` };
  const title = `${dbPost.title} | ${SITE_NAME}`;
  const canonical = `${BASE_URL.replace(/\/$/, '')}/blog/${slug}`;
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

  if (ARTICLES[slug]) {
    const ArticleComponent = ARTICLES[slug].component;
    return <ArticleComponent />;
  }

  const dbPost = await getDbPost(slug);
  if (!dbPost) notFound();

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
