'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getDirectoryUrl, getBlogArticleUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import Breadcrumb from '@/components/Breadcrumb';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Building2, FileText } from 'lucide-react';

const ARTICLES_LIST = [
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
      src: 'https://images.unsplash.com/photo-1600880292203-848bb581ba47?w=1200&q=85',
      alt: 'Best permanent staffing and RPO firms in India 2026 - recruitment process outsourcing and direct hire',
      width: 1200,
      height: 630,
    },
  },
];

export default function Blogs() {
  const featured = ARTICLES_LIST[0];
  const rest = ARTICLES_LIST.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={[{ label: 'Blog' }]} />
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.2),transparent)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 mb-6">
              <BookOpen className="w-4 h-4 text-blue-200" />
              <span className="text-sm font-medium text-slate-200">Guides & lists</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-5">
              Insights & Resources
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Expert guides and curated lists to help you choose the right staffing and service providers in India.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <p className="text-slate-600 text-center mb-10 max-w-xl mx-auto">
          Browse our latest articles on IT staffing, healthcare recruitment, industrial workforce, and more.
        </p>

        {/* Featured article */}
        {featured && featured.image && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-10"
          >
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Featured</span>
            <Link href={getBlogArticleUrl(featured.slug)} className="block group mt-2">
              <article className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-md hover:shadow-xl hover:border-blue-200 transition-all duration-300">
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
                    <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md w-fit">
                      {featured.category}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {featured.title}
                    </h2>
                    <p className="text-slate-600 text-base leading-relaxed line-clamp-2">
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-slate-500">{featured.readTime}</span>
                      <span className="inline-flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                        Read article
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          </motion.div>
        )}

        {/* More articles */}
        <div className="grid gap-6 sm:grid-cols-2">
          {rest.map((article, index) => (
            <motion.div
              key={article.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + index * 0.08 }}
            >
              <Link href={getBlogArticleUrl(article.slug)} className="block h-full group">
                <article className="h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col">
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
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {article.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 mb-3 flex-1">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs text-slate-500">{article.readTime}</span>
                      <span className="inline-flex items-center gap-1 text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
                        Read
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 rounded-2xl bg-slate-100 border border-slate-200 p-8 md:p-10 text-center"
        >
          <h3 className="text-xl font-bold text-slate-800 mb-2">Explore verified companies</h3>
          <p className="text-slate-600 max-w-md mx-auto mb-6">
            Find staffing agencies and service providers across India. Compare reviews, expertise, and pricing.
          </p>
          <Link href={getDirectoryUrl()}>
            <Button
              variant="outline"
              className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-700 rounded-xl px-6 py-3 font-medium"
            >
              Browse directory
            </Button>
          </Link>
        </motion.section>
      </div>
    </div>
  );
}
