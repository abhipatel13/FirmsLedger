'use client';

import React from 'react';
import Link from 'next/link';
import { getDirectoryUrl, getBlogArticleUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import Breadcrumb from '@/components/Breadcrumb';
import { motion } from 'framer-motion';
import { FileText, ArrowRight } from 'lucide-react';

const FEATURED_ARTICLE = {
  slug: 'top-healthcare-staffing-agencies-ahmedabad-2026',
  title: 'Top Healthcare Staffing Agencies in Ahmedabad (2026)',
  excerpt: 'A curated guide to the best medical recruitment partners helping hospitals, clinics, and healthcare facilities in Ahmedabad find top-tier talent.',
  readTime: '7 min read',
};

export default function Blogs() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={[{ label: 'Blog' }]} />
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Insights & Resources
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
              Expert advice, industry trends, and guides to help you choose the right service providers and make smarter business decisions.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Latest Article</h2>
          <Link href={getBlogArticleUrl(FEATURED_ARTICLE.slug)}>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-16 h-16 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-8 h-8 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">{FEATURED_ARTICLE.readTime}</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-2 mb-2">{FEATURED_ARTICLE.title}</h3>
                  <p className="text-slate-600 text-sm">{FEATURED_ARTICLE.excerpt}</p>
                </div>
                <span className="text-blue-600 font-medium text-sm flex items-center gap-1 group">
                  Read article
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col items-center justify-center py-12 text-center border-t border-slate-200 mt-12"
        >
          <p className="text-slate-600 max-w-md mb-6">
            More guides on staffing and service providers in India are on the way. Explore our directory in the meantime.
          </p>
          <Link href={getDirectoryUrl()}>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-6 py-3">
              Browse Companies
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
