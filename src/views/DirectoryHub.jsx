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
import { visualsFor } from '@/lib/categoryRegistry';
import HeroSearch from '@/components/home/HeroSearch';

// ─── Static data ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    slug: 'electrical-components',
    name: 'Electrical Components Manufacturers',
    shortName: 'Electrical Components',
    desc: 'Wiring systems, components, switchgear, and electrical equipment.',
  },
  {
    slug: 'mechanical-components',
    name: 'Mechanical Components Manufacturers',
    shortName: 'Mechanical Components',
    desc: 'CNC machining, precision parts, assemblies, and tooling.',
  },
  {
    slug: 'plastics-packaging',
    name: 'Plastics & Packaging Manufacturers',
    shortName: 'Plastics & Packaging',
    desc: 'Injection molding, packaging materials, containers, and plastic components.',
  },
  {
    slug: 'metal-fabrication',
    name: 'Metal Fabrication & Machining',
    shortName: 'Metal Fabrication',
    desc: 'Sheet metal, welding, stamping, and custom metal fabrication.',
  },
  {
    slug: 'electronics-semiconductor',
    name: 'Electronics & Semiconductor Manufacturers',
    shortName: 'Electronics & Semiconductor',
    desc: 'PCBs, chips, electronic assemblies, and semiconductor components.',
  },
  {
    slug: 'automotive-parts',
    name: 'Automotive Parts Manufacturers',
    shortName: 'Automotive Parts',
    desc: 'OEM and aftermarket automotive components and assemblies.',
  },
  {
    slug: 'textile-apparel',
    name: 'Textile & Apparel Manufacturers',
    shortName: 'Textile & Apparel',
    desc: 'Fabric production, garment manufacturing, and textile finishing.',
  },
  {
    slug: 'furniture-woodworking',
    name: 'Furniture & Woodworking Manufacturers',
    shortName: 'Furniture & Woodworking',
    desc: 'Custom furniture, cabinetry, and woodworking production.',
  },
  {
    slug: 'food-beverage-processing',
    name: 'Food & Beverage Processing',
    shortName: 'Food & Beverage',
    desc: 'Food processing equipment, packaging lines, and beverage production.',
  },
  {
    slug: 'medical-devices',
    name: 'Medical Device Manufacturers',
    shortName: 'Medical Devices',
    desc: 'Diagnostic equipment, surgical instruments, and medical components.',
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

const POPULAR_SUBCATEGORIES = [
  { label: 'CNC Machining', href: '/mechanical-components/cnc-machining' },
  { label: 'Injection Molding', href: '/plastics-packaging/injection-molding' },
  { label: 'Sheet Metal', href: '/metal-fabrication/sheet-metal-fabrication' },
  { label: 'PCB Assembly', href: '/electronics-semiconductor/pcb-assembly' },
  { label: 'Wiring Harnesses', href: '/electrical-components/wiring-harness' },
  { label: 'Laser Cutting', href: '/metal-fabrication/laser-cutting' },
];

const FALLBACK_COMPANY_COUNT = 67;
const FALLBACK_CATEGORY_COUNT = 10;
const FALLBACK_STATE_COUNT = 50;

function getHomepageStats(companyCount, categoryCount = FALLBACK_CATEGORY_COUNT, stateCount = FALLBACK_STATE_COUNT) {
  const listedCompanies = String(Number(companyCount) > 0 ? companyCount : FALLBACK_COMPANY_COUNT);
  const totalCategories = String(Number(categoryCount) > 0 ? categoryCount : FALLBACK_CATEGORY_COUNT);
  const totalStates = String(Number(stateCount) > 0 ? stateCount : FALLBACK_STATE_COUNT);

  return {
    stats: [
      { value: totalCategories, label: 'Categories' },
      { value: totalStates, label: 'States covered' },
      { value: listedCompanies, label: 'Companies listed' },
      { value: '100%', label: 'Verified listings' },
    ],
    trustStats: [
      { value: '100%', label: 'Listings reviewed', icon: Shield, iconBg: 'bg-amber-50', iconBorder: 'border-amber-200', iconText: 'text-amber-700' },
      { value: '0', label: 'Paid rankings — ever', icon: CheckCircle, iconBg: 'bg-green-50', iconBorder: 'border-green-200', iconText: 'text-green-700' },
      { value: totalStates, label: 'States covered', icon: Star, iconBg: 'bg-blue-50', iconBorder: 'border-blue-200', iconText: 'text-blue-700' },
      { value: totalCategories, label: 'Categories', icon: Wrench, iconBg: 'bg-rose-50', iconBorder: 'border-rose-200', iconText: 'text-rose-700' },
      { value: listedCompanies, label: 'Companies listed', icon: Package, iconBg: 'bg-violet-50', iconBorder: 'border-violet-200', iconText: 'text-violet-700' },
    ],
  };
}

// ─── Scroll effects ──────────────────────────────────────────────────────────────

function useFadeInOnScroll() {
  const ref = React.useRef(null);
  const [visible, setVisible] = useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

function AnimatedCounter({ value, duration = 1200 }) {
  const ref = React.useRef(null);
  const [display, setDisplay] = useState('0');
  const [started, setStarted] = useState(false);

  const numericMatch = String(value).match(/[\d.]+/);
  const numericTarget = numericMatch ? parseFloat(numericMatch[0]) : null;
  const prefix = numericMatch ? value.slice(0, numericMatch.index) : '';
  const suffix = numericMatch ? value.slice(numericMatch.index + numericMatch[0].length) : '';

  React.useEffect(() => {
    const node = ref.current;
    if (!node || numericTarget === null) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          const startTime = performance.now();
          function tick(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(numericTarget * eased).toString());
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [numericTarget, duration, started]);

  if (numericTarget === null) {
    return <span ref={ref}>{value}</span>;
  }
  return <span ref={ref}>{prefix}{display}{suffix}</span>;
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

const CATEGORIES_PREVIEW_COUNT = 4;

export default function DirectoryHub({
  companyCount = FALLBACK_COMPANY_COUNT,
  categoryCount = FALLBACK_CATEGORY_COUNT,
  stateCount = FALLBACK_STATE_COUNT,
  popularSearches = [],
}) {
  const [selectedState, setSelectedState] = useState('california');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const activeState = US_STATES.find((s) => s.slug === selectedState);
  const visibleCategories = showAllCategories ? CATEGORIES : CATEGORIES.slice(0, CATEGORIES_PREVIEW_COUNT);
  const { stats, trustStats } = getHomepageStats(companyCount, categoryCount, stateCount);

  const [categoriesRef, categoriesVisible] = useFadeInOnScroll();
  const [trustRef, trustVisible] = useFadeInOnScroll();
  const [statementRef, statementVisible] = useFadeInOnScroll();
  const [howRef, howVisible] = useFadeInOnScroll();
  const [statesRef, statesVisible] = useFadeInOnScroll();
  const [ctaRef, ctaVisible] = useFadeInOnScroll();

  return (
    <div className="bg-white">

      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-slate-200 py-16 sm:py-20 lg:py-24" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="grid-texture-dark absolute inset-0 opacity-40 pointer-events-none" />
        <div className="absolute -top-40 -left-20 w-[520px] h-[520px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(212,160,23,0.08), transparent 70%)' }} />
        <div className="absolute -bottom-40 -right-20 w-[480px] h-[480px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(15,23,42,0.05), transparent 70%)' }} />
        <div className="relative max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="text-center mx-auto max-w-[760px]">
            <Badge
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-8 font-semibold text-[11px] tracking-wider uppercase"
              style={{ backgroundColor: 'rgba(15,23,42,0.05)', border: '1px solid rgba(15,23,42,0.12)', color: '#0F172A' }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--gold)' }} />
              USA Manufacturer Directory
            </Badge>

            <h1 className="text-[40px] sm:text-5xl lg:text-[68px] font-bold leading-[1.06] tracking-tight text-[#211F1C] mb-6">
              Find top <span className="text-[#0F172A]">manufacturers</span> across the USA
            </h1>

            <p className="text-lg text-[17px] leading-relaxed text-slate-600 mb-10">
              Browse verified manufacturers across every USA state by category — electrical, mechanical, automotive, and more. Ranked by real reviews.
            </p>

            <div className="flex flex-wrap justify-center gap-5">
              {[
                { icon: CheckCircle, text: '100% verified listings' },
                { icon: Shield, text: 'Zero paid rankings' },
                { icon: Star, text: 'All 50 USA states' },
                { icon: Package, text: 'Free to list' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                  <span className="text-[13px] font-medium text-slate-600">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ DARK SEARCH BAND ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-12 sm:py-16 border-b border-slate-800" style={{ background: 'linear-gradient(160deg, #0F172A, #070D18)' }}>
        <div className="grid-texture absolute inset-0 opacity-10 pointer-events-none" />
        <div className="relative max-w-[1280px] mx-auto px-6 lg:px-8">
          <HeroSearch categories={CATEGORIES} states={US_STATES} />

          {/* Popular Subcategory Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 max-w-[720px] mx-auto">
            <span className="text-[#6B7280] font-bold text-[11px] uppercase tracking-wider mr-2">Popular:</span>
            {POPULAR_SUBCATEGORIES.map((sub) => (
              <Link
                key={sub.label}
                href={sub.href}
                className="text-xs text-[#9CA3AF] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] px-3 py-1.5 rounded-lg hover:text-[#D4A017] hover:border-[rgba(212,160,23,0.4)] transition-all duration-200"
              >
                {sub.label}
              </Link>
            ))}
          </div>

          {/* 1px divider */}
          <div className="border-t border-[rgba(255,255,255,0.08)] my-8 max-w-[720px] mx-auto" />

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-[720px] mx-auto text-center">
            {stats.map(({ value, label }) => (
              <div key={label} className="space-y-1">
                <div className="text-3xl font-bold leading-none tracking-tight text-[#F9FAFB] tabular-nums">
                  <AnimatedCounter value={value} />
                </div>
                <div className="text-xs text-[#9CA3AF] font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CATEGORY CARDS ════════════════════════════════════════════ */}
      <section
        ref={categoriesRef}
        className={`py-20 sm:py-24 lg:py-28 transition-all duration-500 ${categoriesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ backgroundColor: 'var(--bg-surface)' }}
        id="categories"
      >
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">

          <div className="text-center mb-12">
            <SectionEyebrow>Browse by Category</SectionEyebrow>
            <h2 className="text-[28px] sm:text-4xl font-bold tracking-tight text-[#211F1C] leading-tight">
              Popular manufacturing categories
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {visibleCategories.map((cat) => {
              const visuals = visualsFor(cat.slug);
              const Icon = visuals?.icon || Package;
              const tw = visuals?.tw || { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', dot: 'bg-slate-500' };
              return (
                <Card
                  key={cat.slug}
                  className="card-premium bg-white rounded-2xl p-0 flex flex-col h-full overflow-hidden"
                >
                  <div className={cn('h-[3px] w-full', tw.dot)} />
                  <div className="p-6 flex flex-col flex-1">
                  <div className={cn('w-10 h-10 rounded-lg border flex items-center justify-center mb-4', tw.bg, tw.border)}>
                    <Icon className={cn('w-[18px] h-[18px]', tw.text)} />
                  </div>

                  <h3 className="text-[15px] font-semibold text-[#211F1C] mb-2 leading-snug flex-1">
                    {cat.name}
                  </h3>

                  <p className="text-[13px] leading-relaxed text-slate-500 mb-4 line-clamp-1">
                    {cat.desc}
                  </p>

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

          {/* ── Popular Searches Section ── */}
          {popularSearches && popularSearches.length > 0 && (
            <div className="mt-20 pt-16 border-t border-slate-200/60">
              <div className="text-center mb-10">
                <SectionEyebrow>Popular Searches</SectionEyebrow>
                <h3 className="text-2xl font-bold tracking-tight text-[#211F1C] mt-2">
                  Browse manufacturers by category and state
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {popularSearches.map((search) => {
                  if (!search.states || search.states.length === 0) return null;
                  return (
                    <div key={search.categorySlug} className="bg-white/40 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-6 shadow-sm">
                      <h4 className="text-[14px] font-bold text-slate-800 tracking-wide uppercase mb-4 flex items-center justify-between">
                        <span>{search.categoryName}</span>
                        <span className="text-[11px] font-medium text-slate-400 bg-slate-100 rounded-full px-2 py-0.5 normal-case">
                          {search.states.length} states
                        </span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {search.states.map((st) => (
                          <Link
                            key={st.stateSlug}
                            href={`/${search.categorySlug}/${st.stateSlug}`}
                            className="inline-flex items-center gap-1 text-[13px] font-medium text-[#1A2E4A]/85 hover:text-[#1A2E4A] hover:bg-slate-100 border border-slate-200/60 hover:border-slate-300 rounded-lg px-2.5 py-1 transition-all"
                          >
                            <span>{st.stateLabel}</span>
                            <span className="text-[11px] text-slate-400 font-normal">({st.count})</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══ TRUST ═════════════════════════════════════════════════════ */}
      <section
        ref={trustRef}
        className={`py-20 sm:py-24 lg:py-28 transition-all duration-500 ${trustVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ backgroundColor: 'var(--bg-cream)' }}
      >
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <SectionEyebrow>Why trust our listings</SectionEyebrow>
            <h2 className="text-[28px] sm:text-4xl font-bold tracking-tight text-[#211F1C] leading-tight mb-4">
              What makes this directory different
            </h2>
            <p className="text-slate-500 leading-relaxed max-w-md mx-auto">
              Every listing and every review goes through manual verification before it ever reaches the public directory.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {trustStats.map(({ value, label, icon: Icon, iconBg, iconBorder, iconText }) => (
              <Card key={label} className="card-premium rounded-2xl p-5 text-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <div className={cn('w-9 h-9 rounded-lg border flex items-center justify-center mx-auto mb-3', iconBg, iconBorder)}>
                  <Icon className={cn('w-4 h-4', iconText)} />
                </div>
                <div className="text-2xl font-bold text-[#211F1C] tracking-tight tabular-nums mb-1">{value}</div>
                <div className="text-xs text-slate-500 font-medium leading-snug">{label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BOLD STATEMENT ═══════════════════════════════════════════ */}
      <section
        ref={statementRef}
        className={`grid-texture noise-texture py-24 sm:py-28 lg:py-32 relative overflow-hidden transition-all duration-500 ${statementVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ background: 'linear-gradient(160deg, #0F172A, #070D18)' }}
      >
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(212,160,23,0.12), transparent 70%)' }} />
        <div className="relative max-w-[1280px] mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-[40px] sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.02]" style={{ color: 'var(--gold)' }}>
            Zero Paid Rankings.
          </h2>
          <p className="mt-6 text-base sm:text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
            Every company on this list earned its spot through real reviews — nothing else.
          </p>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════ */}
      <section
        ref={howRef}
        className={`py-20 sm:py-24 lg:py-28 border-t border-slate-200 transition-all duration-500 ${howVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
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
              { num: '2', color: 'text-amber-700 bg-amber-50 border-amber-200', title: 'Select your state', desc: 'All 50 USA states covered. Find manufacturers close to your supply chain.' },
              { num: '3', color: 'text-green-700 bg-green-50 border-green-200', title: 'Browse the rankings', desc: 'Ranked by verified reviews and ratings. No pay-to-rank. No sponsored placements.' },
            ].map(({ num, color, title, desc }) => (
              <Card key={num} className="card-premium rounded-2xl p-7">
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
      <section
        ref={statesRef}
        className={`py-20 sm:py-24 lg:py-28 border-t border-slate-200 transition-all duration-500 ${statesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ backgroundColor: 'var(--bg-surface-alt)' }}
        id="states"
      >
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">

          <div className="flex items-baseline justify-between flex-wrap gap-3 mb-8">
            <div>
              <SectionEyebrow>Browse by State</SectionEyebrow>
              <h2 className="text-[28px] sm:text-4xl font-bold tracking-tight text-[#211F1C] leading-tight">
                Every USA state
              </h2>
            </div>
            <span className="text-[13px] text-slate-400 font-medium">
              50 states · 10 categories each
            </span>
          </div>

          <Card className="grid grid-cols-1 md:grid-cols-[240px_1fr] rounded-2xl overflow-hidden border-slate-200 shadow-sm p-0">

            {/* Left: state list */}
            <ScrollArea className="h-[220px] md:h-[540px] border-b md:border-b-0 md:border-r border-slate-200" style={{ backgroundColor: 'var(--bg-cream)' }}>
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
                          ? 'bg-white text-[#211F1C] font-semibold border-l-[#D4A017]'
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
      <section
        ref={ctaRef}
        className={`grid-texture py-20 sm:py-24 lg:py-28 relative overflow-hidden transition-all duration-500 ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ background: 'linear-gradient(160deg, #0F172A, #070D18)' }}
      >
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(212,160,23,0.10), transparent 70%)' }} />
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
                className="inline-flex items-center gap-2 bg-[#D4A017] hover:bg-[#A87A0F] text-[#1A2E4A] rounded-full px-7 py-3.5 text-sm font-semibold shadow-[0_4px_16px_rgba(212,160,23,0.35)] hover:shadow-[0_6px_20px_rgba(212,160,23,0.5)] transition-all btn-scale"
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
