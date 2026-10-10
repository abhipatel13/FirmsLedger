'use client';

import React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import FilterBar from '@/components/listing/FilterBar';
import { ArrowRight } from 'lucide-react';

export default function Capabilities({ counts = {}, items = [] }) {
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* ── HERO HEADER ─────────────────────────────────────────── */}
      <section className="bg-[#0D1B2A] relative overflow-hidden" aria-labelledby="capabilities-heading">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full bg-orange-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-indigo-600/10 blur-[80px] pointer-events-none" />

        <div className="relative w-full px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-20 sm:pb-24">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block text-orange-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 bg-orange-500/10 border border-orange-500/20 tracking-wider uppercase">
              What We Cover
            </span>
            <h1
              id="capabilities-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight"
            >
              Manufacturing Capabilities
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Browse US manufacturers by what they actually do — ordered by how many companies we list for each process.
            </p>
          </div>
        </div>
      </section>

      {/* ── GRID OF CAPABILITIES ─────────────────────────────────── */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <Suspense fallback={null}>
            <FilterBar showStateFilter />
          </Suspense>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((cat) => {
              const imageUrl = cat.imageUrl;
              return (
                <Link
                  key={cat.slug}
                  id={`capability-card-${cat.slug}`}
                  href={cat.href}
                  className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300"
                >
                  {/* Card Image Container. Capabilities with no photo we could
                      verify get a typographic tile — an unrelated stock image
                      on a category card is worse than none. */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{
                          background: '#0F172A',
                          backgroundImage:
                            'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                          backgroundSize: '28px 28px',
                        }}
                      />
                    )}
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Category Title Overlaid on Image Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h2 className="text-base sm:text-lg font-bold text-white tracking-wide group-hover:text-orange-300 transition-colors">
                        {cat.name}
                      </h2>
                      {counts[cat.slug] ? (
                        <p className="mt-0.5 font-mono text-[11px] tracking-wide text-white/60 tabular-nums">
                          {counts[cat.slug].toLocaleString()} companies
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Card Body - Description below Image */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
                      {cat.desc}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500 group-hover:text-orange-600 transition-colors mt-auto">
                      Explore category
                      <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ── ALL CATEGORIES LINK CTA ──────────────────────────────── */}
          <div className="text-center mt-16 pt-12 border-t border-slate-200">
            <p className="text-slate-500 text-sm mb-4">
              Prefer to browse by industry instead?
            </p>
            <Link
              id="btn-browse-all-categories"
              href="/browse"
              className="inline-flex items-center gap-2 bg-[#0D1B2A] hover:bg-[#1A2E44] text-white font-semibold text-sm px-6 py-3 rounded-full shadow-sm transition-all duration-200 group"
            >
              Browse all industries
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
