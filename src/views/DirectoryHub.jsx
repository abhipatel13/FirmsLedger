'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, CheckCircle, Star, Shield, Package, Wrench, Cpu, Car,
  Shirt, Sofa, UtensilsCrossed, Stethoscope,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// ─── Static data ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    slug: 'electrical-components',
    name: 'Electrical Components Manufacturers',
    shortName: 'Electrical Components',
    desc: 'Wiring systems, components, switchgear, and electrical equipment.',
    iconBg: 'bg-amber-50', iconBorder: 'border-amber-200', iconText: 'text-amber-700', dot: 'bg-amber-500',
    icon: BoltIcon,
  },
  {
    slug: 'mechanical-components',
    name: 'Mechanical Components Manufacturers',
    shortName: 'Mechanical Components',
    desc: 'CNC machining, precision parts, assemblies, and tooling.',
    iconBg: 'bg-slate-100', iconBorder: 'border-slate-300', iconText: 'text-slate-700', dot: 'bg-slate-500',
    icon: GearIcon,
  },
  {
    slug: 'plastics-packaging',
    name: 'Plastics & Packaging Manufacturers',
    shortName: 'Plastics & Packaging',
    desc: 'Injection molding, packaging materials, containers, and plastic components.',
    iconBg: 'bg-green-50', iconBorder: 'border-green-200', iconText: 'text-green-700', dot: 'bg-green-500',
    icon: Package,
  },
  {
    slug: 'metal-fabrication',
    name: 'Metal Fabrication & Machining',
    shortName: 'Metal Fabrication',
    desc: 'Sheet metal, welding, stamping, and custom metal fabrication.',
    iconBg: 'bg-blue-50', iconBorder: 'border-blue-200', iconText: 'text-blue-700', dot: 'bg-blue-500',
    icon: Wrench,
  },
  {
    slug: 'electronics-semiconductor',
    name: 'Electronics & Semiconductor Manufacturers',
    shortName: 'Electronics & Semiconductor',
    desc: 'PCBs, chips, electronic assemblies, and semiconductor components.',
    iconBg: 'bg-violet-50', iconBorder: 'border-violet-200', iconText: 'text-violet-700', dot: 'bg-indigo-500',
    icon: Cpu,
  },
  {
    slug: 'automotive-parts',
    name: 'Automotive Parts Manufacturers',
    shortName: 'Automotive Parts',
    desc: 'OEM and aftermarket automotive components and assemblies.',
    iconBg: 'bg-rose-50', iconBorder: 'border-rose-200', iconText: 'text-rose-700', dot: 'bg-red-500',
    icon: Car,
  },
  {
    slug: 'textile-apparel',
    name: 'Textile & Apparel Manufacturers',
    shortName: 'Textile & Apparel',
    desc: 'Fabric production, garment manufacturing, and textile finishing.',
    iconBg: 'bg-pink-50', iconBorder: 'border-pink-200', iconText: 'text-pink-700', dot: 'bg-pink-500',
    icon: Shirt,
  },
  {
    slug: 'furniture-woodworking',
    name: 'Furniture & Woodworking Manufacturers',
    shortName: 'Furniture & Woodworking',
    desc: 'Custom furniture, cabinetry, and woodworking production.',
    iconBg: 'bg-orange-50', iconBorder: 'border-orange-200', iconText: 'text-orange-800', dot: 'bg-orange-400',
    icon: Sofa,
  },
  {
    slug: 'food-beverage-processing',
    name: 'Food & Beverage Processing',
    shortName: 'Food & Beverage',
    desc: 'Food processing equipment, packaging lines, and beverage production.',
    iconBg: 'bg-amber-50', iconBorder: 'border-amber-200', iconText: 'text-amber-800', dot: 'bg-amber-600',
    icon: UtensilsCrossed,
  },
  {
    slug: 'medical-devices',
    name: 'Medical Device Manufacturers',
    shortName: 'Medical Devices',
    desc: 'Diagnostic equipment, surgical instruments, and medical components.',
    iconBg: 'bg-teal-50', iconBorder: 'border-teal-200', iconText: 'text-teal-700', dot: 'bg-teal-500',
    icon: Stethoscope,
  },
];

const US_STATES = [
  { name: 'Maine', slug: 'maine', region: 'Northeast' },
  { name: 'Vermont', slug: 'vermont', region: 'Northeast' },
  { name: 'New Hampshire', slug: 'new-hampshire', region: 'Northeast' },
  { name: 'Massachusetts', slug: 'massachusetts', region: 'Northeast' },
  { name: 'Rhode Island', slug: 'rhode-island', region: 'Northeast' },
  { name: 'Connecticut', slug: 'connecticut', region: 'Northeast' },
  { name: 'New York', slug: 'new-york', region: 'Northeast' },
  { name: 'New Jersey', slug: 'new-jersey', region: 'Northeast' },
  { name: 'Pennsylvania', slug: 'pennsylvania', region: 'Northeast' },
  { name: 'Delaware', slug: 'delaware', region: 'Northeast' },
  { name: 'Maryland', slug: 'maryland', region: 'Northeast' },
  { name: 'Ohio', slug: 'ohio', region: 'Midwest' },
  { name: 'Michigan', slug: 'michigan', region: 'Midwest' },
  { name: 'Indiana', slug: 'indiana', region: 'Midwest' },
  { name: 'Illinois', slug: 'illinois', region: 'Midwest' },
  { name: 'Wisconsin', slug: 'wisconsin', region: 'Midwest' },
  { name: 'Minnesota', slug: 'minnesota', region: 'Midwest' },
  { name: 'Iowa', slug: 'iowa', region: 'Midwest' },
  { name: 'Missouri', slug: 'missouri', region: 'Midwest' },
  { name: 'North Dakota', slug: 'north-dakota', region: 'Midwest' },
  { name: 'South Dakota', slug: 'south-dakota', region: 'Midwest' },
  { name: 'Nebraska', slug: 'nebraska', region: 'Midwest' },
  { name: 'Kansas', slug: 'kansas', region: 'Midwest' },
  { name: 'West Virginia', slug: 'west-virginia', region: 'South' },
  { name: 'Virginia', slug: 'virginia', region: 'South' },
  { name: 'Kentucky', slug: 'kentucky', region: 'South' },
  { name: 'Tennessee', slug: 'tennessee', region: 'South' },
  { name: 'North Carolina', slug: 'north-carolina', region: 'South' },
  { name: 'South Carolina', slug: 'south-carolina', region: 'South' },
  { name: 'Georgia', slug: 'georgia', region: 'South' },
  { name: 'Florida', slug: 'florida', region: 'South' },
  { name: 'Alabama', slug: 'alabama', region: 'South' },
  { name: 'Mississippi', slug: 'mississippi', region: 'South' },
  { name: 'Arkansas', slug: 'arkansas', region: 'South' },
  { name: 'Louisiana', slug: 'louisiana', region: 'South' },
  { name: 'Oklahoma', slug: 'oklahoma', region: 'South' },
  { name: 'Texas', slug: 'texas', region: 'South' },
  { name: 'Montana', slug: 'montana', region: 'West' },
  { name: 'Idaho', slug: 'idaho', region: 'West' },
  { name: 'Wyoming', slug: 'wyoming', region: 'West' },
  { name: 'Colorado', slug: 'colorado', region: 'West' },
  { name: 'New Mexico', slug: 'new-mexico', region: 'West' },
  { name: 'Arizona', slug: 'arizona', region: 'West' },
  { name: 'Utah', slug: 'utah', region: 'West' },
  { name: 'Nevada', slug: 'nevada', region: 'West' },
  { name: 'California', slug: 'california', region: 'West' },
  { name: 'Oregon', slug: 'oregon', region: 'West' },
  { name: 'Washington', slug: 'washington', region: 'West' },
  { name: 'Alaska', slug: 'alaska', region: 'West' },
  { name: 'Hawaii', slug: 'hawaii', region: 'West' },
];

const STATS = [
  { value: '10', label: 'Categories' },
  { value: '50', label: 'States covered' },
  { value: '67', label: 'Companies listed' },
  { value: '100%', label: 'Verified listings' },
];

const TRUST_TILES = [
  {
    number: '100%',
    label: 'Listings reviewed before publishing',
    desc: 'Every company submission goes through a manual approval step, and every review is independently verified before it goes live.',
    icon: Shield,
    iconBg: 'bg-amber-50', iconBorder: 'border-amber-200', iconText: 'text-amber-700',
  },
  {
    number: '0',
    label: 'Paid rankings — ever',
    desc: "Companies can't buy their way up the list. Rankings are purely performance-based, determined solely by verified ratings and reviews.",
    icon: CheckCircle,
    iconBg: 'bg-green-50', iconBorder: 'border-green-200', iconText: 'text-green-700',
  },
  {
    number: null,
    label: 'Real reviews only',
    desc: 'All reviews come from verified clients — we never edit, hide, or filter ratings.',
    icon: Star,
    iconBg: 'bg-blue-50', iconBorder: 'border-blue-200', iconText: 'text-blue-700',
  },
  {
    number: '10',
    label: 'Manufacturing categories',
    desc: 'Electrical, mechanical, plastics, metal fabrication, electronics, automotive, textile, furniture, food, and medical.',
    icon: Wrench,
    iconBg: 'bg-rose-50', iconBorder: 'border-rose-200', iconText: 'text-rose-700',
  },
];

// ─── Inline icons ────────────────────────────────────────────────────────────────

function BoltIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function GearIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

// ─── Shared section wrapper ─────────────────────────────────────────────────────

function SectionEyebrow({ children }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-2.5">
      {children}
    </p>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────────

const CATEGORIES_PREVIEW_COUNT = 3;

export default function DirectoryHub() {
  const [selectedState, setSelectedState] = useState('california');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const activeState = US_STATES.find((s) => s.slug === selectedState);
  const visibleCategories = showAllCategories ? CATEGORIES : CATEGORIES.slice(0, CATEGORIES_PREVIEW_COUNT);

  return (
    <div className="bg-white">

      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-slate-200 py-20 sm:py-24 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">

            {/* LEFT */}
            <div>
              <Badge className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 rounded-full px-3.5 py-1.5 mb-7 font-semibold text-[11px] tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                US Manufacturer Directory
              </Badge>

              <h1 className="text-[40px] sm:text-5xl lg:text-[64px] font-bold leading-[1.06] tracking-tight text-[#211F1C] mb-5 max-w-lg">
                Find top <span className="text-[#1A2E4A]">manufacturers</span> across the US
              </h1>

              <p className="text-lg leading-relaxed text-slate-600 mb-8 max-w-md">
                Browse verified manufacturers across every US state by category — electrical, mechanical, automotive, and more. Ranked by real reviews.
              </p>

              <div className="flex flex-wrap gap-5">
                {[
                  { icon: CheckCircle, text: '100% verified listings' },
                  { icon: Shield, text: 'Zero paid rankings' },
                  { icon: Star, text: 'All 50 US states' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-[#F5A623] flex-shrink-0" />
                    <span className="text-[13px] font-medium text-slate-600">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — stats grid */}
            <div className="relative">
              <div className="absolute -inset-8 rounded-full bg-[#F5A623]/10 blur-3xl pointer-events-none" />
              <div className="relative grid grid-cols-2 gap-2.5">
                {STATS.map(({ value, label }) => (
                  <Card key={label} className="bg-[#FAF7F1] border-slate-200 rounded-xl px-6 py-5 shadow-none">
                    <div className="text-3xl font-bold text-[#211F1C] leading-none mb-1 tracking-tight tabular-nums">
                      {value}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">{label}</div>
                  </Card>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══ CATEGORY CARDS ════════════════════════════════════════════ */}
      <section className="bg-[#FAF7F1] py-20 sm:py-24 lg:py-28" id="categories">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">

          <div className="text-center mb-12">
            <SectionEyebrow>Browse by Category</SectionEyebrow>
            <h2 className="text-[28px] sm:text-4xl font-bold tracking-tight text-[#211F1C] leading-tight">
              Popular manufacturing categories
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Card
                  key={cat.slug}
                  className="bg-white border-slate-200 rounded-2xl p-0 flex flex-col h-full overflow-hidden transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
                >
                  <div className={cn('h-[3px] w-full', cat.dot)} />
                  <div className="p-6 flex flex-col flex-1">
                  <div className={cn('w-10 h-10 rounded-lg border flex items-center justify-center mb-4', cat.iconBg, cat.iconBorder)}>
                    <Icon className={cn('w-[18px] h-[18px]', cat.iconText)} />
                  </div>

                  <h3 className="text-[15px] font-semibold text-[#211F1C] mb-2 leading-snug flex-1">
                    {cat.name}
                  </h3>

                  <p className="text-[13px] leading-relaxed text-slate-500 mb-4">
                    {cat.desc}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {[
                      { slug: 'california', label: 'California' },
                      { slug: 'texas', label: 'Texas' },
                      { slug: 'new-york', label: 'New York' },
                    ].map(({ slug, label }) => (
                      <Link
                        key={slug}
                        href={`/${cat.slug}/${slug}`}
                        className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-[3px] transition-colors hover:border-slate-400 hover:text-slate-900"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>

                  <Link
                    href={`/${cat.slug}`}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1A2E4A] group"
                  >
                    View all states
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  </div>
                </Card>
              );
            })}
          </div>

          {CATEGORIES.length > CATEGORIES_PREVIEW_COUNT && (
            <div className="text-center mt-8">
              <button
                type="button"
                onClick={() => setShowAllCategories((v) => !v)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1A2E4A] border border-slate-300 rounded-full px-5 py-2.5 hover:border-slate-400 hover:bg-white transition-colors"
              >
                {showAllCategories ? 'Show less' : `View more categories (${CATEGORIES.length - CATEGORIES_PREVIEW_COUNT})`}
                <ArrowRight className={cn('w-3.5 h-3.5 transition-transform', showAllCategories && 'rotate-90')} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ══ TRUST ═════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-16 items-center">

            <div>
              <SectionEyebrow>Why trust our listings</SectionEyebrow>
              <h2 className="text-[28px] sm:text-4xl font-bold tracking-tight text-[#211F1C] leading-tight mb-4">
                What makes this directory different
              </h2>
              <p className="text-slate-500 leading-relaxed max-w-sm">
                Every listing and every review goes through manual verification before it ever reaches the public directory.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TRUST_TILES.map(({ number, label, desc, icon: Icon, iconBg, iconBorder, iconText }) => (
                <Card key={label} className="bg-[#FAF7F1] border-slate-200 rounded-2xl p-6 shadow-none">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn('w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0', iconBg, iconBorder)}>
                      <Icon className={cn('w-4 h-4', iconText)} />
                    </div>
                    {number && (
                      <span className="text-xl font-bold text-[#211F1C] tracking-tight tabular-nums">{number}</span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-[#211F1C] mb-1.5 leading-snug">{label}</h3>
                  <p className="text-[13px] leading-relaxed text-slate-500">{desc}</p>
                </Card>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════ */}
      <section className="bg-[#FAF7F1] py-20 sm:py-24 lg:py-28 border-t border-slate-200">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <SectionEyebrow>How it works</SectionEyebrow>
            <h2 className="text-[28px] sm:text-4xl font-bold tracking-tight text-[#211F1C] leading-tight">
              From search to shortlist in seconds
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { num: '1', color: 'text-[#1A2E4A] bg-[#1A2E4A]/10 border-[#1A2E4A]/20', title: 'Pick a category', desc: 'Choose from Electrical Components, Mechanical Components, Automotive, and more.' },
              { num: '2', color: 'text-amber-700 bg-amber-50 border-amber-200', title: 'Select your state', desc: 'All 50 US states covered. Find manufacturers close to your supply chain.' },
              { num: '3', color: 'text-green-700 bg-green-50 border-green-200', title: 'Browse the rankings', desc: 'Ranked by verified reviews and ratings. No pay-to-rank. No sponsored placements.' },
            ].map(({ num, color, title, desc }) => (
              <Card key={num} className="bg-white border-slate-200 rounded-2xl p-7 shadow-none">
                <div className={cn('w-9 h-9 rounded-lg border flex items-center justify-center mb-4 text-[15px] font-bold tabular-nums shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]', color)}>
                  {num}
                </div>
                <h3 className="text-base font-semibold tracking-tight text-[#211F1C] mb-2">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ══ US STATES PANEL ═══════════════════════════════════════════ */}
      <section className="bg-white py-20 sm:py-24 lg:py-28 border-t border-slate-200" id="states">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">

          <div className="flex items-baseline justify-between flex-wrap gap-3 mb-8">
            <div>
              <SectionEyebrow>Browse by State</SectionEyebrow>
              <h2 className="text-[28px] sm:text-4xl font-bold tracking-tight text-[#211F1C] leading-tight">
                Every US state
              </h2>
            </div>
            <span className="text-[13px] text-slate-400 font-medium">
              50 states · 10 categories each
            </span>
          </div>

          <Card className="grid grid-cols-1 md:grid-cols-[240px_1fr] rounded-2xl overflow-hidden border-slate-200 shadow-sm p-0">

            {/* Left: state list */}
            <ScrollArea className="h-[220px] md:h-[540px] bg-[#FAF7F1] border-b md:border-b-0 md:border-r border-slate-200">
              <div className="py-1">
                {US_STATES.map((state) => {
                  const active = selectedState === state.slug;
                  return (
                    <button
                      key={state.slug}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelectedState(state.slug)}
                      className={cn(
                        'flex w-full text-left px-5 py-2 text-[13.5px] leading-tight border-l-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2E4A] focus-visible:ring-inset',
                        active
                          ? 'bg-white text-[#211F1C] font-semibold border-l-[#F5A623]'
                          : 'text-slate-500 font-normal border-l-transparent hover:bg-white/60 hover:text-slate-800'
                      )}
                    >
                      {state.name}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Right: categories for selected state */}
            <div className="px-8 py-8 sm:px-10">
              {activeState && (
                <>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold tracking-tight text-[#211F1C] mb-1">
                      {activeState.name}
                    </h3>
                    <p className="text-[13px] text-slate-500">
                      {activeState.region} · Choose a manufacturing category
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/${cat.slug}/${selectedState}`}
                        className="flex items-center gap-2 text-[13.5px] text-slate-700 leading-relaxed py-1.5 transition-colors hover:text-[#1A2E4A]"
                      >
                        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', cat.dot)} />
                        {cat.shortName} in {activeState.name}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <Link
                      href={`/states/${activeState.slug}`}
                      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1A2E4A] group"
                    >
                      See all manufacturers in {activeState.name}
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </section>

      {/* ══ CTA BAND ══════════════════════════════════════════════════ */}
      <section className="bg-[#1A2E4A] py-20 sm:py-24 lg:py-28 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-indigo-500/8 blur-[100px] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }}
        />
        <div className="relative max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-10">
            <div className="max-w-lg">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40 mb-3">
                For manufacturers
              </p>
              <h2 className="text-[28px] sm:text-[44px] font-bold tracking-tight text-white leading-tight mb-4">
                Get your company in front of buyers
              </h2>
              <p className="text-base leading-relaxed text-white/60">
                Join FirmsLedger and appear in state-level ranked lists. Verified listings reach procurement managers actively searching for manufacturers.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/list-your-company"
                className="inline-flex items-center gap-2 bg-[#F5A623] hover:bg-[#D48E1A] text-[#1A2E4A] rounded-full px-7 py-3.5 text-sm font-semibold shadow-[0_4px_16px_rgba(245,166,35,0.35)] hover:shadow-[0_6px_20px_rgba(245,166,35,0.5)] transition-all"
              >
                List Your Company
                <ArrowRight className="w-[15px] h-[15px]" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-transparent text-white/80 hover:text-white border border-white/20 hover:border-white/55 rounded-full px-7 py-3.5 text-sm font-medium transition-all"
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
