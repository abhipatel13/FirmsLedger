'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getDirectoryUrl, getBlogArticleUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import Breadcrumb from '@/components/Breadcrumb';
import { ArrowRight, BookOpen, Building2, FileText, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

const POSTS_PER_PAGE = 6;

const ARTICLES_LIST = [
  {
    slug: 'top-cnc-manufacturers-nevada-2026',
    title: 'Top CNC Manufacturers in Nevada: Best Machine Shops for Precision Machining in 2026',
    excerpt: 'A comprehensive guide to the best CNC manufacturers in Nevada — CES Machine, Owens Industries, Frigate, CapableMachining & Tonza Making. Compared by capabilities, certifications, and industries served.',
    readTime: '12 min read',
    category: 'Manufacturing',
    icon: Settings,
    image: {
      src: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&q=85',
      alt: 'Top CNC manufacturers in Nevada 2026 - precision machining and CNC machine shops',
      width: 1200,
      height: 630,
    },
  },
  {
    slug: 'best-specialty-chemical-companies-australia-2026',
    title: 'Best Specialty Chemical Companies in Australia for Manufacturing (2026)',
    excerpt: 'A verified B2B guide to Australia\'s top specialty chemical suppliers — Orica, Nufarm, Ixom, Brenntag, Chem-Supply & more. Compared by AICIS compliance, certifications, and industries served.',
    readTime: '20 min read',
    category: 'Specialty Chemicals',
    icon: Settings,
    image: {
      src: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&q=85',
      alt: 'Best specialty chemical companies in Australia for manufacturing 2026 - industrial chemical facility',
      width: 1200,
      height: 630,
    },
  },
  {
    slug: 'best-solar-panels-australia-2026',
    title: 'Best Solar Panels in Australia (2026) — Brands Compared & Reviewed',
    excerpt: "A comprehensive guide to the best solar panel brands in Australia — SunPower, REC Group, Q CELLS, Jinko, LONGi & more. Compare by CEC approval, efficiency, AUD price, and warranty for homes, farms, and commercial use.",
    readTime: '20 min read',
    category: 'Solar Energy',
    icon: Settings,
    image: {
      src: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=1200&q=85',
      alt: 'Best solar panels in Australia 2026 - rooftop solar installation on Australian home',
      width: 1200,
      height: 630,
    },
  },
  {
    slug: 'top-10-stabilizer-brands-india-2026',
    title: 'Top 10 Stabilizer Brands in India (2026) – Best Brands for Home, Commercial & Industrial Use',
    excerpt: "A comprehensive guide to India's top voltage stabilizer brands — V-Guard, Microtek, Luminous, Servokon & more. Compare by ISI certification, voltage range, warranty, and price for home, commercial, and industrial use.",
    readTime: '18 min read',
    category: 'Electrical',
    icon: Settings,
    image: {
      src: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&q=85',
      alt: 'Top 10 stabilizer brands in India 2026 - best voltage stabilizers for home commercial and industrial use',
      width: 1200,
      height: 630,
    },
  },
  {
    slug: 'top-10-switch-socket-brands-india-2026',
    title: 'Top 10 Switch & Socket Brands in India (2026) – Best Brands for Home, Commercial & Industrial Use',
    excerpt: "A comprehensive guide to India's top switch and socket brands — Legrand, Havells, Anchor, Schneider Electric, GM Modular & more. Compare by ISI certification, build quality, warranty, and price.",
    readTime: '18 min read',
    category: 'Electrical',
    icon: Settings,
    image: {
      src: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&q=85',
      alt: 'Top 10 switch and socket brands in India 2026 - best modular switches for home and commercial use',
      width: 1200,
      height: 630,
    },
  },
  {
    slug: 'best-solar-panel-brands-india-2026',
    title: 'Best Solar Panel Brands in India (2026) – Best Brands for Home, Commercial & Industrial Use',
    excerpt: "A comprehensive guide to India's top solar panel brands — Waaree, Tata Power Solar, Adani Solar, Vikram Solar, Luminous & more. Compare by BIS/ALMM certification, efficiency, warranty, and price.",
    readTime: '20 min read',
    category: 'Solar Energy',
    icon: Settings,
    image: {
      src: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=85',
      alt: 'Best solar panel brands in India 2026 - top solar panels for home commercial and industrial use',
      width: 1200,
      height: 630,
    },
  },
  {
    slug: 'top-10-led-light-brands-india-2026',
    title: 'Top 10 LED Light Brands in India (2026) – Best for Home, Office & Industrial Use',
    excerpt: "A comprehensive guide to India's best LED light brands — Philips, Havells, Syska, Wipro, Bajaj & more. Compare for BIS certification, energy efficiency, warranty, and value across home, commercial, and industrial use.",
    readTime: '14 min read',
    category: 'Manufacturing',
    icon: Settings,
    image: {
      src: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=1200&q=85',
      alt: 'Top 10 LED light brands in India 2026 - best LED lights for home office and industrial use',
      width: 1200,
      height: 630,
    },
  },
  {
    slug: 'top-10-water-pump-brands-india-2026',
    title: 'Top 10 Water Pump Brands in India (2026) – Best for Home, Agriculture & Industrial Use',
    excerpt: "A comprehensive guide to India's best water pump brands — Kirloskar, Crompton, CRI, Grundfos, Shakti & more. Compare for home use, agriculture, and industrial applications.",
    readTime: '15 min read',
    category: 'Manufacturing',
    icon: Settings,
    image: {
      src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85',
      alt: 'Top 10 water pump brands in India 2026 - best pumps for home agriculture and industrial use',
      width: 1200,
      height: 630,
    },
  },
  {
    slug: 'top-10-drilling-machine-brands-india-2026',
    title: 'Top 10 Drilling Machine Brands in India (2026): Complete B2B Buyer\'s Guide',
    excerpt: 'A data-backed B2B guide to India\'s top drilling machine brands — HMT, BFW, Jyoti CNC, Premier, INDER, Apex Tools, Precihole, Bosch, DeWalt & Makita. Compare by type, price, certifications, and after-sales support.',
    readTime: '12 min read',
    category: 'Manufacturing',
    icon: Settings,
    image: {
      src: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&q=85',
      alt: 'Top 10 drilling machine brands in India 2026 - industrial and CNC drilling machines',
      width: 1200,
      height: 630,
    },
  },
  {
    slug: 'top-10-milling-machine-manufacturers-india-2026',
    title: 'Top 10 Milling Machine Manufacturers in India (2026): Verified B2B Guide',
    excerpt: 'A comprehensive B2B guide to India\'s top milling machine manufacturers — HMT, BFW, Jyoti CNC, Ace Micromatic, Lokesh Machines, Godrej, MTAB, Premier, Electronica & Precihole. Compare by specialization, certifications, and industries served.',
    readTime: '10 min read',
    category: 'Manufacturing',
    icon: Settings,
    image: {
      src: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1200&q=85',
      alt: 'Top 10 milling machine manufacturers in India 2026 - CNC and industrial machine tools',
      width: 1200,
      height: 630,
    },
  },
  {
    slug: 'top-10-recruitment-agencies-india-2026',
    title: 'Top 10 Recruitment Agencies in India (2026): Find the Best Hiring Partner',
    excerpt: "Comprehensive guide to India's top 10 recruitment agencies — TeamLease, Naukri, Randstad, Adecco, ManpowerGroup, ABC Consultants, Michael Page, Korn Ferry, Heidrick & Struggles, Quess.",
    readTime: '12 min read',
    category: 'Recruitment',
    icon: FileText,
    image: {
      src: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&q=85',
      alt: 'Top 10 recruitment agencies in India 2026 - best hiring partners and staffing firms',
      width: 1200,
      height: 630,
    },
  },
  {
    slug: 'top-industrial-staffing-companies-india-2026',
    title: 'Top Industrial Staffing Companies in India 2026',
    excerpt: "A definitive guide to India's best industrial workforce and recruitment agencies — manufacturing, logistics, construction, automotive, and blue-collar hiring.",
    readTime: '9 min read',
    category: 'Industrial',
    icon: Building2,
    image: {
      src: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=85',
      alt: 'Top Industrial Staffing Companies in India 2026 - blue-collar manufacturing recruitment agencies',
      width: 1200,
      height: 630,
    },
  },
  {
    slug: 'top-10-it-staffing-companies-india-2026',
    title: 'Top 10 IT Staffing Companies in India for 2026',
    excerpt: "A comprehensive, expert-curated guide to India's best tech recruitment agencies — helping businesses hire faster, smarter, and in full compliance.",
    readTime: '8 min read',
    category: 'IT Staffing',
    icon: FileText,
    image: {
      src: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=85',
      alt: 'Top 10 IT Staffing Companies in India 2026 - tech recruitment and staffing agencies',
      width: 1200,
      height: 630,
    },
  },
  {
    slug: 'top-healthcare-staffing-agencies-ahmedabad-2026',
    title: 'Top Healthcare Staffing Agencies in Ahmedabad (2026)',
    excerpt: 'A curated guide to the best medical recruitment partners helping hospitals, clinics, and healthcare facilities in Ahmedabad find top-tier talent.',
    readTime: '7 min read',
    category: 'Healthcare',
    icon: FileText,
    image: {
      src: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=85',
      alt: 'Top Healthcare Staffing Agencies in Ahmedabad - medical recruitment for hospitals and clinics in Gujarat',
      width: 1200,
      height: 630,
    },
  },
  {
    slug: 'best-contract-staffing-agencies-india-2026',
    title: 'Best Contract Staffing Agencies in India 2026',
    excerpt: "A practical guide to India's top contract and temporary staffing agencies — scale your workforce with compliance, speed, and flexibility.",
    readTime: '8 min read',
    category: 'Contract Staffing',
    icon: FileText,
    image: {
      src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=85',
      alt: 'Best contract staffing agencies in India 2026 - temporary and contract workforce solutions',
      width: 1200,
      height: 630,
    },
  },
  {
    slug: 'best-permanent-staffing-rpo-firms-india-2026',
    title: 'Best Permanent Staffing & RPO Firms in India 2026',
    excerpt: "Expert-curated guide to India's top permanent recruitment and RPO partners — for direct hire and scalable hiring programs.",
    readTime: '8 min read',
    category: 'Permanent & RPO',
    icon: FileText,
    image: {
      src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=85',
      alt: 'Best permanent staffing and RPO firms in India 2026 - recruitment process outsourcing and direct hire',
      width: 1200,
      height: 630,
    },
  },
  {
    slug: 'top-staffing-agencies-delhi-ncr-2026',
    title: 'Top Staffing Agencies in Delhi NCR (2026): Best Recruitment Partners in Gurgaon, Noida & Delhi',
    excerpt: 'A city-specific guide to the 10 best staffing and recruitment agencies serving Delhi, Gurgaon, Noida, Faridabad, and the wider NCR region.',
    readTime: '11 min read',
    category: 'Delhi NCR',
    icon: Building2,
    image: {
      src: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=85',
      alt: 'Top Staffing Agencies in Delhi NCR 2026 - best recruitment firms in Gurgaon, Noida and Delhi',
      width: 1200,
      height: 630,
    },
  },
  {
    slug: 'top-it-staffing-companies-bangalore-2026',
    title: 'Top IT Staffing Companies in Bangalore (2026): Best Tech Recruitment Agencies in Bengaluru',
    excerpt: "A city-specific guide to the 10 best IT staffing and tech recruitment agencies serving Bangalore's ORR, Whitefield, Electronic City, Manyata, and startup corridors.",
    readTime: '10 min read',
    category: 'Bangalore IT',
    icon: FileText,
    image: {
      src: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=1200&q=85',
      alt: 'Top IT Staffing Companies in Bangalore 2026 - best tech recruitment agencies in Bengaluru',
      width: 1200,
      height: 630,
    },
  },
];

export default function Blogs() {
  const [dbPosts, setDbPosts] = useState([]);

  useEffect(() => {
    fetch('/api/blog-posts')
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        if (!Array.isArray(data)) return;
        const mapped = data.map((p) => ({
          slug: p.slug,
          title: p.title,
          excerpt: p.meta_description || '',
          readTime: p.read_time || '10 min read',
          category: p.category || 'General',
          icon: FileText,
          image: p.image_url ? { src: p.image_url, alt: p.image_alt || p.title, width: 1200, height: 630 } : null,
        }));
        setDbPosts(mapped);
      })
      .catch(() => {});
  }, []);

  // DB posts first (newest AI posts), then static articles
  const staticSlugs = new Set(ARTICLES_LIST.map((a) => a.slug));
  const newDbPosts = dbPosts.filter((p) => !staticSlugs.has(p.slug));
  const allArticles = [...newDbPosts, ...ARTICLES_LIST];

  const featured = allArticles[0];
  const rest = allArticles.slice(1);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(rest.length / POSTS_PER_PAGE);

  const paginatedRest = rest.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  function handlePageChange(page) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={[{ label: 'Blog' }]} />
        </div>
      </div>

      {/* Hero */}
      <section className="bg-[#0D1B2A] text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-14 md:py-18">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/20 text-orange-400 text-xs font-semibold px-4 py-2 rounded-full mb-6 uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              Guides & Lists
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-5 text-white">
              Insights & Resources
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Expert guides and curated lists to help you choose the right staffing and service providers.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <p className="text-slate-500 text-center mb-10 max-w-xl mx-auto text-sm">
          Browse our latest articles on IT staffing, healthcare recruitment, industrial workforce, and more.
        </p>

        {/* Featured article */}
        {currentPage === 1 && featured && featured.image && (
          <div className="mb-10">
            <span className="text-xs font-semibold text-orange-500 uppercase tracking-widest">Featured</span>
            <Link href={getBlogArticleUrl(featured.slug)} className="block group mt-2">
              <article className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-orange-300 transition-all duration-200">
                <div className="flex flex-col md:flex-row">
                  <div className="relative w-full md:w-80 lg:w-96 flex-shrink-0 aspect-[16/10] md:aspect-auto md:h-[240px] bg-slate-100">
                    <Image
                      src={featured.image.src}
                      alt={featured.image.alt}
                      width={featured.image.width}
                      height={featured.image.height}
                      className="object-cover w-full h-full"
                      sizes="(max-width: 768px) 100vw, 384px"
                    />
                  </div>
                  <div className="p-6 md:p-8 flex flex-col md:justify-center gap-4 flex-1 min-w-0">
                    <span className="inline-block text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded border border-orange-200 w-fit">
                      {featured.category}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-[#0D1B2A] group-hover:text-orange-600 transition-colors leading-snug">
                      {featured.title}
                    </h2>
                    <p className="text-slate-500 text-base leading-relaxed line-clamp-2">
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-slate-400">{featured.readTime}</span>
                      <span className="inline-flex items-center gap-2 text-orange-600 font-semibold group-hover:gap-3 transition-all text-sm">
                        Read article
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          </div>
        )}

        {/* More articles */}
        <div className="grid gap-5 sm:grid-cols-2">
          {paginatedRest.map((article) => (
            <Link key={article.slug} href={getBlogArticleUrl(article.slug)} className="block h-full group">
              <article className="h-full bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-orange-300 transition-all duration-200 flex flex-col">
                {article.image && (
                  <div className="relative w-full aspect-[16/10] bg-slate-100 flex-shrink-0">
                    <Image
                      src={article.image.src}
                      alt={article.image.alt}
                      width={article.image.width}
                      height={article.image.height}
                      className="object-cover w-full h-full"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-orange-500 uppercase tracking-wider">
                    {article.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-3 flex-1">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs text-slate-400">{article.readTime}</span>
                    <span className="inline-flex items-center gap-1 text-orange-600 font-medium text-sm group-hover:gap-2 transition-all">
                      Read
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-9 h-9 rounded-md border text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* CTA */}
        <section className="mt-14 rounded-xl bg-[#0D1B2A] p-8 md:p-10 text-center">
          <h3 className="text-xl font-extrabold text-white mb-2">Explore verified companies</h3>
          <p className="text-slate-400 max-w-md mx-auto mb-6 text-sm">
            Find staffing agencies and service providers across India. Compare reviews, expertise, and pricing.
          </p>
          <Link href={getDirectoryUrl()}>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-7 py-3 h-auto rounded-md transition-colors text-sm">
              Browse Directory
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
