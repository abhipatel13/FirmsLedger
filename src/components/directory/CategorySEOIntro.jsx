'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CategorySEOIntro({ category, location, total = 0 }) {
  const [open, setOpen] = useState(false);
  if (!category) return null;

  const name = category.name || 'Companies';
  const lower = name.toLowerCase();
  const inLoc = location ? ` in ${location}` : '';

  return (
    <section className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A2E4A] tracking-tight mb-5">
          The Best {name} Companies{inLoc}
        </h1>

        <div className={`text-slate-700 text-[15px] leading-relaxed space-y-4 ${open ? '' : 'line-clamp-4'}`}>
          <p>
            There are a large number of {lower} providers{inLoc ? ` operating${inLoc}` : ' worldwide'} you can reach
            out to for help. We have collected the leading firms in one curated list of top {lower} companies that
            deliver a full range of services and help you avoid mistakes due to lack of experience. With deep
            expertise across the {lower} space, these companies drive measurable outcomes for businesses of every
            size.
          </p>
          <p>
            {category.description || `Selecting the right ${lower} partner is a decisive factor for success in today's market. The companies featured here have been vetted for quality, transparency, and verified client reviews — no pay-to-rank, no fake testimonials.`}
          </p>
          <p>
            Whether you are a startup looking for a flexible, cost-effective {lower} provider or an established
            enterprise scaling complex {lower} workflows{inLoc}, you will find providers that fit your stage of
            growth, budget, and integration needs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-semibold inline-flex items-center gap-1"
        >
          {open ? 'Show less' : 'Read more'}
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-slate-600">
          <span><strong className="text-[#1A2E4A]">{total}</strong> Companies</span>
          <span>Last updated: <strong className="text-[#1A2E4A]">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
        </div>
      </div>
    </section>
  );
}
