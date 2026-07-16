'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, MapPin, ChevronRight, Search, CheckCircle, Shield, Star } from 'lucide-react';

// ─── Static data (real DB will replace once schema lands) ─────────────────────

const CATEGORIES = [
  {
    slug: 'bike-manufacturers',
    name: 'Bike Manufacturers',
    description: 'Road, mountain, BMX, and specialty bicycle makers',
    icon: BikeIcon,
    count: '40+',
  },
  {
    slug: 'electrical-manufacturers',
    name: 'Electrical Manufacturers',
    description: 'Wiring systems, components, and electrical equipment',
    icon: BoltIcon,
    count: '120+',
  },
  {
    slug: 'mechanical-manufacturers',
    name: 'Mechanical Manufacturers',
    description: 'Precision parts, CNC machining, and assemblies',
    icon: GearIcon,
    count: '95+',
  },
];

const US_STATES = [
  // Northeast
  { name: 'Maine', slug: 'maine', abbr: 'ME', region: 'Northeast' },
  { name: 'Vermont', slug: 'vermont', abbr: 'VT', region: 'Northeast' },
  { name: 'New Hampshire', slug: 'new-hampshire', abbr: 'NH', region: 'Northeast' },
  { name: 'Massachusetts', slug: 'massachusetts', abbr: 'MA', region: 'Northeast' },
  { name: 'Rhode Island', slug: 'rhode-island', abbr: 'RI', region: 'Northeast' },
  { name: 'Connecticut', slug: 'connecticut', abbr: 'CT', region: 'Northeast' },
  { name: 'New York', slug: 'new-york', abbr: 'NY', region: 'Northeast' },
  { name: 'New Jersey', slug: 'new-jersey', abbr: 'NJ', region: 'Northeast' },
  { name: 'Pennsylvania', slug: 'pennsylvania', abbr: 'PA', region: 'Northeast' },
  { name: 'Delaware', slug: 'delaware', abbr: 'DE', region: 'Northeast' },
  { name: 'Maryland', slug: 'maryland', abbr: 'MD', region: 'Northeast' },
  // Midwest
  { name: 'Ohio', slug: 'ohio', abbr: 'OH', region: 'Midwest' },
  { name: 'Michigan', slug: 'michigan', abbr: 'MI', region: 'Midwest' },
  { name: 'Indiana', slug: 'indiana', abbr: 'IN', region: 'Midwest' },
  { name: 'Illinois', slug: 'illinois', abbr: 'IL', region: 'Midwest' },
  { name: 'Wisconsin', slug: 'wisconsin', abbr: 'WI', region: 'Midwest' },
  { name: 'Minnesota', slug: 'minnesota', abbr: 'MN', region: 'Midwest' },
  { name: 'Iowa', slug: 'iowa', abbr: 'IA', region: 'Midwest' },
  { name: 'Missouri', slug: 'missouri', abbr: 'MO', region: 'Midwest' },
  { name: 'North Dakota', slug: 'north-dakota', abbr: 'ND', region: 'Midwest' },
  { name: 'South Dakota', slug: 'south-dakota', abbr: 'SD', region: 'Midwest' },
  { name: 'Nebraska', slug: 'nebraska', abbr: 'NE', region: 'Midwest' },
  { name: 'Kansas', slug: 'kansas', abbr: 'KS', region: 'Midwest' },
  // South
  { name: 'West Virginia', slug: 'west-virginia', abbr: 'WV', region: 'South' },
  { name: 'Virginia', slug: 'virginia', abbr: 'VA', region: 'South' },
  { name: 'Kentucky', slug: 'kentucky', abbr: 'KY', region: 'South' },
  { name: 'Tennessee', slug: 'tennessee', abbr: 'TN', region: 'South' },
  { name: 'North Carolina', slug: 'north-carolina', abbr: 'NC', region: 'South' },
  { name: 'South Carolina', slug: 'south-carolina', abbr: 'SC', region: 'South' },
  { name: 'Georgia', slug: 'georgia', abbr: 'GA', region: 'South' },
  { name: 'Florida', slug: 'florida', abbr: 'FL', region: 'South' },
  { name: 'Alabama', slug: 'alabama', abbr: 'AL', region: 'South' },
  { name: 'Mississippi', slug: 'mississippi', abbr: 'MS', region: 'South' },
  { name: 'Arkansas', slug: 'arkansas', abbr: 'AR', region: 'South' },
  { name: 'Louisiana', slug: 'louisiana', abbr: 'LA', region: 'South' },
  { name: 'Oklahoma', slug: 'oklahoma', abbr: 'OK', region: 'South' },
  { name: 'Texas', slug: 'texas', abbr: 'TX', region: 'South' },
  // West
  { name: 'Montana', slug: 'montana', abbr: 'MT', region: 'West' },
  { name: 'Idaho', slug: 'idaho', abbr: 'ID', region: 'West' },
  { name: 'Wyoming', slug: 'wyoming', abbr: 'WY', region: 'West' },
  { name: 'Colorado', slug: 'colorado', abbr: 'CO', region: 'West' },
  { name: 'New Mexico', slug: 'new-mexico', abbr: 'NM', region: 'West' },
  { name: 'Arizona', slug: 'arizona', abbr: 'AZ', region: 'West' },
  { name: 'Utah', slug: 'utah', abbr: 'UT', region: 'West' },
  { name: 'Nevada', slug: 'nevada', abbr: 'NV', region: 'West' },
  { name: 'California', slug: 'california', abbr: 'CA', region: 'West' },
  { name: 'Oregon', slug: 'oregon', abbr: 'OR', region: 'West' },
  { name: 'Washington', slug: 'washington', abbr: 'WA', region: 'West' },
  { name: 'Alaska', slug: 'alaska', abbr: 'AK', region: 'West' },
  { name: 'Hawaii', slug: 'hawaii', abbr: 'HI', region: 'West' },
];

const REGIONS = ['Northeast', 'Midwest', 'South', 'West'];

// ─── Inline icons (no extra deps) ─────────────────────────────────────────────

function BikeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="18.5" cy="17.5" r="3.5" />
      <circle cx="5.5" cy="17.5" r="3.5" />
      <path d="M15 6a1 1 0 0 0-1-1h-3l-2 5" />
      <path d="m9 15 3-9 3.5 4.5" />
      <path d="M5.5 14 9 6h5" />
      <path d="m18.5 14-2.5-4" />
    </svg>
  );
}

function BoltIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function GearIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function DirectoryHub() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedState, setSelectedState] = useState('');

  function handleSearch(e) {
    e.preventDefault();
    if (selectedCategory && selectedState) {
      router.push(`/top/${selectedCategory}/${selectedState}`);
    }
  }

  return (
    <div className="bg-white">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B1623] via-[#0F1A2C] to-[#0B1623]">
        {/* Grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Ambient glows */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 text-center">

          <p className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            US Manufacturer Directory
          </p>

          <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-extrabold text-white leading-[1.1] tracking-tight mb-5">
            Find the Top Manufacturers
            <br />
            <span className="text-gradient">in Your State</span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-12">
            Browse verified manufacturers by category and state — bike, electrical, mechanical, and more.
          </p>

          {/* Search widget */}
          <form
            onSubmit={handleSearch}
            className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-2 sm:p-3 max-w-2xl mx-auto flex flex-col sm:flex-row gap-2"
          >
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 bg-white/10 border border-white/10 text-white placeholder-slate-400 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-orange-500/60 focus:bg-white/15 transition-colors appearance-none cursor-pointer"
              style={{ WebkitAppearance: 'none' }}
            >
              <option value="" disabled className="bg-[#0F1A2C]">Select Category</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug} className="bg-[#0F1A2C] text-white">{c.name}</option>
              ))}
            </select>

            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="flex-1 bg-white/10 border border-white/10 text-white placeholder-slate-400 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-orange-500/60 focus:bg-white/15 transition-colors appearance-none cursor-pointer"
              style={{ WebkitAppearance: 'none' }}
            >
              <option value="" disabled className="bg-[#0F1A2C]">Select State</option>
              {US_STATES.map((s) => (
                <option key={s.slug} value={s.slug} className="bg-[#0F1A2C] text-white">{s.name}</option>
              ))}
            </select>

            <button
              type="submit"
              disabled={!selectedCategory || !selectedState}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap sm:w-auto w-full"
            >
              <Search className="w-4 h-4" />
              Find Manufacturers
            </button>
          </form>

          <p className="text-slate-500 text-xs mt-4">
            Example:{' '}
            <Link href="/top/bike-manufacturers/california" className="text-orange-400 hover:text-orange-300 underline underline-offset-2">
              Top Bike Manufacturers in California
            </Link>
          </p>
        </div>
      </section>

      {/* ── CATEGORY TILES ──────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 bg-[#F7F8FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-[0.2em] mb-3">Browse by Category</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A2E4A] tracking-tight">
              Popular Manufacturing Categories
            </h2>
            <p className="text-slate-500 text-sm mt-3 max-w-lg mx-auto">
              Each category contains ranked lists for every US state — verified, data-driven, and always current.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.slug} className="group">
                  <div className="bg-white border border-slate-100 rounded-2xl p-7 hover:border-orange-200 hover:shadow-md transition-all duration-200 h-full flex flex-col">
                    <div className="w-12 h-12 bg-[#0F1A2C] rounded-xl flex items-center justify-center mb-5 group-hover:bg-orange-500 transition-colors">
                      <Icon className="w-6 h-6 text-orange-400 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-bold text-[#1A2E4A] text-lg mb-2 group-hover:text-orange-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-5 flex-1">
                      {cat.description}
                    </p>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-xs text-slate-400 font-medium">{cat.count} companies listed</span>
                      <div className="flex flex-wrap gap-1.5">
                        {['California', 'Texas', 'New York'].map((state) => (
                          <Link
                            key={state}
                            href={`/top/${cat.slug}/${state.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-[11px] font-semibold text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors"
                          >
                            {state}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── US STATES ────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-bold text-orange-500 uppercase tracking-[0.2em] mb-3">Browse by State</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A2E4A] tracking-tight">
                Every US State
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                Select a state to browse all manufacturer categories available there.
              </p>
            </div>
            <p className="text-slate-400 text-sm font-medium">{US_STATES.length} states covered</p>
          </div>

          <div className="space-y-8">
            {REGIONS.map((region) => {
              const states = US_STATES.filter((s) => s.region === region);
              return (
                <div key={region}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{region}</span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {states.map((state) => (
                      <Link
                        key={state.slug}
                        href={`/top/bike-manufacturers/${state.slug}`}
                        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-all"
                        title={state.name}
                      >
                        <span className="text-xs font-black text-slate-400 group-hover:text-orange-400 transition-colors">{state.abbr}</span>
                        <span>{state.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TRUST SIGNALS ────────────────────────────────────────────── */}
      <section className="py-16 bg-[#F7F8FA] border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: CheckCircle, title: 'Verified Listings', desc: 'Every manufacturer checked before going live' },
              { icon: Star, title: 'Real Reviews', desc: 'All reviews from verified clients — never filtered' },
              { icon: Shield, title: 'Unbiased Rankings', desc: 'Performance-based only — zero pay-to-rank' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 bg-white border border-slate-100 rounded-xl p-5">
                <div className="w-9 h-9 bg-orange-50 border border-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4.5 h-4.5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1A2E4A] text-sm mb-0.5">{title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIST YOUR COMPANY CTA ─────────────────────────────────────── */}
      <section className="bg-[#0F1A2C] py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-[500px] h-[300px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div>
              <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">For Manufacturers</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                Get your company in front of buyers
              </h2>
              <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
                Join FirmsLedger and appear in state-level ranked lists. Verified listings reach procurement managers actively searching for manufacturers.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link
                href="/ListYourCompany"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-7 py-3 rounded-xl transition-colors"
              >
                List Your Company
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white hover:bg-white/10 hover:border-white/40 font-semibold text-sm px-7 py-3 rounded-xl transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
