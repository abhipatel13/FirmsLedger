'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import StatePill from '@/components/Statepill';

export default function Locations({ tier1 = [], tier2 = [], rest = [] }) {
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* ── HERO HEADER ─────────────────────────────────────────── */}
      <section className="bg-[#0D1B2A] relative overflow-hidden" aria-labelledby="locations-heading">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full bg-orange-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-indigo-600/10 blur-[80px] pointer-events-none" />

        <div className="relative w-full px-4 sm:px-6 lg:px-8 pt-6 pb-20 sm:pt-8 sm:pb-24">
          <nav className="flex items-center gap-2 text-sm mb-8" aria-label="Breadcrumb">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">Home</Link>
            <span className="text-slate-600">/</span>
            <span className="text-white font-semibold">Locations</span>
          </nav>
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block text-orange-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 bg-orange-500/10 border border-orange-500/20 tracking-wider uppercase">
              Locations
            </span>
            <h1
              id="locations-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight"
            >
              Find Manufacturers by Location
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Browse verified manufacturers across all 50 US states. Start with the top manufacturing hubs or find shops in your state.
            </p>
          </div>
        </div>
      </section>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto">

          {/* ── TIER 1 ─────────────────────────────────────────── */}
          <span className="text-orange-500 text-xs font-semibold tracking-wider uppercase">
            Top Manufacturing States
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 mb-6">
            Major Manufacturing Hubs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {tier1.map((state) => (
              <Link
                key={state.slug}
                href={`/states/${state.slug}`}
                className="group flex items-center justify-between bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200"
              >
                <div>
                  <p className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                    {state.name}
                  </p>
                  <p className="text-xs text-slate-400 font-mono tracking-wide">{state.abbr}</p>
                </div>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>

          {/* ── TIER 2 ─────────────────────────────────────────── */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6">
            Strong Manufacturing States
          </h2>
          <div className="flex flex-wrap gap-2 mb-16">
            {tier2.map((state) => (
              <StatePill key={state.slug} name={state.name} slug={state.slug} />
            ))}
          </div>

          {/* ── ALL OTHER STATES ─────────────────────────────────── */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6">
            All Other States
          </h2>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {rest.map((state) => (
              <Link
                key={state.slug}
                href={`/states/${state.slug}`}
                className="text-sm text-slate-500 hover:text-orange-600 transition-colors"
              >
                {state.name}
              </Link>
            ))}
          </div>

          {/* ── CTA BANNER ─────────────────────────────────────── */}
          <div className="mt-20 bg-[#1A2E4A] rounded-2xl px-6 sm:px-12 py-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Ready to Find a Manufacturer Near You?
            </h2>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">
              Search our directory of verified manufacturers or list your own company today.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-[#0D1B2A] font-semibold text-sm px-6 py-3 rounded-full shadow-sm transition-all duration-200"
              >
                Search Manufacturers
              </Link>
              <Link
                href="/list-your-company"
                className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white font-semibold text-sm px-6 py-3 rounded-full transition-all duration-200"
              >
                List Your Company
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
