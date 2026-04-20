'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getDirectoryUrl, getBlogArticleUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import Breadcrumb from '@/components/Breadcrumb';
import {
  ArrowRight,
  BookOpen,
  FileText,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  Clock,
  TrendingUp,
} from 'lucide-react';

const POSTS_PER_PAGE = 9;
const ARTICLES_LIST = [];

export default function Blogs() {
  const [dbPosts, setDbPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch('/api/blog-posts')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!Array.isArray(data)) return;
        const mapped = data.map((p) => ({
          slug: p.slug,
          title: p.title,
          excerpt: p.meta_description || '',
          readTime: p.read_time || '10 min read',
          category: p.category || 'General',
          icon: FileText,
          image: p.image_url
            ? { src: p.image_url, alt: p.image_alt || p.title, width: 1200, height: 630 }
            : null,
        }));
        setDbPosts(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const staticSlugs = new Set(ARTICLES_LIST.map((a) => a.slug));
  const newDbPosts = dbPosts.filter((p) => !staticSlugs.has(p.slug));
  const allArticles = [...newDbPosts, ...ARTICLES_LIST];

  const categories = useMemo(() => {
    const set = new Set(allArticles.map((a) => a.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [allArticles]);

  const filtered = useMemo(() => {
    return allArticles.filter((a) => {
      const matchesCategory = activeCategory === 'All' || a.category === activeCategory;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        a.title?.toLowerCase().includes(q) ||
        a.excerpt?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [allArticles, activeCategory, query]);

  const featured = filtered[0];
  const rest = filtered.slice(1);
  const totalPages = Math.max(1, Math.ceil(rest.length / POSTS_PER_PAGE));
  const paginatedRest = rest.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, query]);

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
      <section className="relative overflow-hidden bg-[#0F1C30] text-white">
        {/* decorative gradient + grid pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F1C30] via-[#1A2E4A] to-[#0F1C30]" />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div
          aria-hidden
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-orange-500/20 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl"
        />

        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-semibold px-4 py-2 rounded-full mb-6 uppercase tracking-wider backdrop-blur-sm">
              <BookOpen className="w-4 h-4" />
              Guides & Lists
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-5 text-white">
              Insights &{' '}
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Resources
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
              Expert guides and curated lists to help you choose the right companies across every industry.
            </p>

            {/* Search bar */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search articles, topics, guides..."
                  className="w-full h-14 pl-12 pr-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:bg-white/15 transition-all"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg mx-auto">
              <Stat icon={FileText} value={allArticles.length} label="Articles" />
              <Stat icon={Sparkles} value={categories.length - 1} label="Topics" />
              <Stat icon={TrendingUp} value="Weekly" label="Updates" />
            </div>
          </div>
        </div>
      </section>

      {/* Category tabs */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-[#1A2E4A] text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {loading ? (
          <LoadingGrid />
        ) : filtered.length === 0 ? (
          <EmptyState query={query} onReset={() => { setQuery(''); setActiveCategory('All'); }} />
        ) : (
          <>
            {/* Featured */}
            {currentPage === 1 && featured && (
              <FeaturedCard article={featured} />
            )}

            {/* Grid */}
            {paginatedRest.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-extrabold text-[#1A2E4A]">Latest Articles</h2>
                  <span className="text-sm text-slate-500">
                    Showing {paginatedRest.length} of {rest.length}
                  </span>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedRest.map((article) => (
                    <ArticleCard key={article.slug} article={article} />
                  ))}
                </div>
              </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onChange={handlePageChange}
              />
            )}
          </>
        )}

        {/* CTA */}
        <section className="relative mt-16 rounded-2xl overflow-hidden bg-gradient-to-br from-[#1A2E4A] via-[#1A2E4A] to-[#0F1C30] p-10 md:p-14 text-center">
          <div
            aria-hidden
            className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-orange-500/20 blur-3xl"
          />
          <div className="relative">
            <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
              Ready to find the right partner?
            </h3>
            <p className="text-slate-300 max-w-md mx-auto mb-7">
              Find verified companies across every US industry. Compare reviews, expertise, and pricing.
            </p>
            <Link href={getDirectoryUrl()}>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 h-auto rounded-lg transition-colors">
                Browse Directory
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
      <Icon className="w-4 h-4 text-orange-400 mb-1" />
      <span className="text-xl font-extrabold text-white">{value}</span>
      <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function FeaturedCard({ article }) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-orange-500" />
        <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
          Featured Article
        </span>
      </div>
      <Link href={getBlogArticleUrl(article.slug)} className="block group">
        <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:border-orange-300 transition-all duration-300">
          <div className="grid md:grid-cols-2">
            {article.image ? (
              <div className="relative w-full aspect-[16/10] md:aspect-auto md:h-full bg-slate-100 overflow-hidden">
                <Image
                  src={article.image.src}
                  alt={article.image.alt}
                  width={article.image.width}
                  height={article.image.height}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                    <Sparkles className="w-3 h-3" />
                    Featured
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative w-full aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200" />
            )}
            <div className="p-8 md:p-10 flex flex-col justify-center gap-4">
              <span className="inline-block text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200 w-fit uppercase tracking-wider">
                {article.category}
              </span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#1A2E4A] group-hover:text-orange-600 transition-colors leading-tight">
                {article.title}
              </h2>
              <p className="text-slate-600 text-base leading-relaxed line-clamp-3">
                {article.excerpt}
              </p>
              <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-100">
                <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                  <Clock className="w-4 h-4" />
                  {article.readTime}
                </span>
                <span className="inline-flex items-center gap-2 text-orange-600 font-bold group-hover:gap-3 transition-all">
                  Read article
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    </div>
  );
}

function ArticleCard({ article }) {
  return (
    <Link href={getBlogArticleUrl(article.slug)} className="block h-full group">
      <article className="h-full bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-orange-300 hover:-translate-y-1 transition-all duration-300 flex flex-col">
        {article.image ? (
          <div className="relative w-full aspect-[16/10] bg-slate-100 overflow-hidden flex-shrink-0">
            <Image
              src={article.image.src}
              alt={article.image.alt}
              width={article.image.width}
              height={article.image.height}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute top-3 left-3">
              <span className="inline-block text-xs font-bold text-white bg-[#1A2E4A]/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
                {article.category}
              </span>
            </div>
          </div>
        ) : (
          <div className="relative w-full aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <FileText className="w-12 h-12 text-slate-300" />
          </div>
        )}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-lg font-extrabold text-slate-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors leading-snug">
            {article.title}
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              {article.readTime}
            </span>
            <span className="inline-flex items-center gap-1 text-orange-600 font-semibold text-sm group-hover:gap-2 transition-all">
              Read
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function LoadingGrid() {
  return (
    <div>
      <div className="mb-12 bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
        <div className="grid md:grid-cols-2">
          <div className="aspect-[16/10] bg-slate-200" />
          <div className="p-8 space-y-4">
            <div className="h-4 w-24 bg-slate-200 rounded-full" />
            <div className="h-8 bg-slate-200 rounded" />
            <div className="h-8 w-3/4 bg-slate-200 rounded" />
            <div className="h-4 bg-slate-200 rounded" />
            <div className="h-4 w-5/6 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
            <div className="aspect-[16/10] bg-slate-200" />
            <div className="p-5 space-y-3">
              <div className="h-5 bg-slate-200 rounded" />
              <div className="h-5 w-3/4 bg-slate-200 rounded" />
              <div className="h-4 bg-slate-200 rounded" />
              <div className="h-4 w-5/6 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ query, onReset }) {
  return (
    <div className="text-center py-20">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 text-orange-500 mb-5">
        <Search className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold text-[#1A2E4A] mb-2">No articles found</h3>
      <p className="text-slate-500 max-w-sm mx-auto mb-6">
        {query
          ? `We couldn't find any articles matching "${query}".`
          : "No articles in this category yet."}
      </p>
      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1A2E4A] text-white font-semibold hover:bg-[#0F1C30] transition-colors text-sm"
      >
        Clear filters
      </button>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onChange }) {
  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex items-center gap-1 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        Prev
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onChange(page)}
          className={`w-10 h-10 rounded-lg border text-sm font-semibold transition-all ${
            page === currentPage
              ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/30'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="inline-flex items-center gap-1 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
