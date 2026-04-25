'use client';

import React from 'react';
import Link from 'next/link';
import { getDirectoryUrl, getCompanyProfileUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import AISearchBar from '@/components/AISearchBar';
import {
  ArrowRight, Star, Shield, CheckCircle, Award,
  ChevronRight, Sparkles, Globe, Users, Zap,
  Building2, Cpu, Megaphone, Briefcase, HeartPulse,
  Factory, GraduationCap, Truck, Wrench, Plane, Ship,
  ShoppingBag, Home as HomeIcon, Scale, Palette,
  Leaf, Printer, Brain, Dumbbell, FlaskConical, Anchor,
  Camera, Music, Film, Utensils, Car, Hammer, TreePine,
  Sprout, Building, Bitcoin, CreditCard, Stethoscope,
  Dna, Atom, Radio, Tv, Newspaper, BookOpen, Pen,
  Database, Cloud, Lock, Bug, Smartphone, Wifi, Box,
  Package, Warehouse, Train, Bus, Bike, Rocket, Satellite,
  Landmark, Gavel, Coins, TrendingUp, Tractor, Wheat,
  Droplet, Flame, Sun, Wind, Beaker, Microscope,
} from 'lucide-react';

// Pick a Lucide icon by keyword pattern on the category name/slug.
// Order matters — more specific patterns first so e.g. "aerospace" hits Plane
// before falling back to Building2.
function pickCategoryIcon(cat) {
  const text = `${cat?.name || ''} ${cat?.slug || ''}`.toLowerCase();
  const rules = [
    [/aerospace|aviation|airline|aircraft|drone/, Plane],
    [/space|satellite|rocket|orbital/,            Rocket],
    [/marine|shipping|maritime|naval|port|harbor/, Ship],
    [/automotive|auto|car |vehicle/,              Car],
    [/train|rail/,                                Train],
    [/transit|bus /,                              Bus],
    [/cycle|bike|bicycle/,                        Bike],
    [/logistics|freight|warehous|supply|courier|trucking/, Truck],
    [/3d print|additive manufactur|printing/,     Printer],
    [/manufactur|fabricat|industr|factory|assembly|machining|foundry|mill/, Factory],
    [/construct|contractor|builder|carpentry|masonry|roofing|paving/, Hammer],
    [/plumb|hvac|electric|repair|maintenance/,    Wrench],
    [/ai\b|artificial intelligence|machine learning|deep learning|neural/, Brain],
    [/cyber|security|infosec|firewall|defense soft/, Lock],
    [/cloud|saas|devops|hosting|server/,          Cloud],
    [/data |database|analytics|big data|warehouse data/, Database],
    [/software|app |mobile|ios |android|sdk/,     Smartphone],
    [/network|telecom|5g|4g|wifi|wireless|broadband/, Wifi],
    [/it |technology|tech |software|platform/,    Cpu],
    [/defense|military|weapon|tactical|combat/,   Shield],
    [/biotech|life science|genom|dna|cell/,       Dna],
    [/pharma|drug|chemistry|chemical/,            FlaskConical],
    [/lab |laboratory|research|microscop/,        Microscope],
    [/health|medical|clinic|hospital|dental|veterinary|telemedicine|wellness|therapy/, Stethoscope],
    [/sports|fitness|gym|athletic|exercise/,      Dumbbell],
    [/food|restaurant|cafe|catering|bakery|culinary/, Utensils],
    [/agri|farm|crop|wheat|grain/,                Wheat],
    [/agro|seed|fertilizer|cultivation/,          Sprout],
    [/forest|timber|lumber|wood/,                 TreePine],
    [/environment|sustain|recycl|waste|green |eco /, Leaf],
    [/water|hydro|plumb|irrigat/,                 Droplet],
    [/oil|gas |petroleum|fuel|combustion/,        Flame],
    [/solar|photovoltaic/,                        Sun],
    [/wind |turbine|renewable/,                   Wind],
    [/energy|power |utility|electric/,            Zap],
    [/real estate|property|housing|residential/,  HomeIcon],
    [/commercial real|building|architecture|interior design/, Building],
    [/legal|law|attorney|paralegal|notary/,       Scale],
    [/court|judicial|litigation|judge/,           Gavel],
    [/government|public sector|municipal|civic|policy/, Landmark],
    [/account|audit|tax|bookkeeping|cpa|payroll/, Briefcase],
    [/bank|finance|investment|wealth|capital/,    Coins],
    [/credit|payment|fintech|loan|mortgage/,      CreditCard],
    [/crypto|blockchain|bitcoin|web3|nft/,        Bitcoin],
    [/trading|broker|stock|market |hedge/,        TrendingUp],
    [/marketing|advertis|seo|sem|brand|pr |creative agency/, Megaphone],
    [/media|news|journalism|publish|magazine|newspaper/, Newspaper],
    [/tv|television|broadcast/,                   Tv],
    [/radio|podcast|audio /,                      Radio],
    [/film|movie|cinema|video production/,        Film],
    [/music|audio|sound /,                        Music],
    [/photography|photo /,                        Camera],
    [/design|graphic|ux|ui/,                      Palette],
    [/writing|content|copywrit|editor /,          Pen],
    [/book|library|literature/,                   BookOpen],
    [/education|school|academy|training|tutor|university|edtech/, GraduationCap],
    [/retail|store|shop |boutique|outlet|ecommerce|e-commerce/, ShoppingBag],
    [/consumer|goods|fmcg|household/,             Package],
    [/staffing|recruit|hr |human resources|talent|hiring/, Users],
    [/travel|tourism|hotel|hospitality|cruise/,   Globe],
    [/agro chem|pesticide|herbicide/,             Beaker],
  ];
  for (const [rx, Icon] of rules) {
    if (rx.test(text)) return Icon;
  }
  return Building2;
}
const COLOR_POOL = [
  'bg-blue-50 border-blue-100 text-blue-600',
  'bg-violet-50 border-violet-100 text-violet-600',
  'bg-emerald-50 border-emerald-100 text-emerald-600',
  'bg-amber-50 border-amber-100 text-amber-600',
  'bg-cyan-50 border-cyan-100 text-cyan-600',
  'bg-pink-50 border-pink-100 text-pink-600',
  'bg-orange-50 border-orange-100 text-orange-600',
  'bg-rose-50 border-rose-100 text-rose-600',
  'bg-indigo-50 border-indigo-100 text-indigo-600',
];
function colorFor(slug) {
  let hash = 0;
  for (let i = 0; i < (slug || '').length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return COLOR_POOL[hash % COLOR_POOL.length];
}


export default function Home() {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.entities.Category.list(),
  });

  const { data: topRatedAgencies = [] } = useQuery({
    queryKey: ['top-rated-agencies'],
    queryFn: () => api.entities.Agency.filter({ approved: true }, '-avg_rating', 6),
  });

  const { data: recentReviews = [] } = useQuery({
    queryKey: ['recent-reviews'],
    queryFn: () => api.entities.Review.filter({ approved: true }, '-created_date', 3),
  });

  return (
    <div className="bg-white">

      {/* ── HERO (dark navy + gold) ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0F1A2C] via-[#1A2E4A] to-[#131F30]">
        {/* Dot grid background */}
        <div
          className="absolute inset-0 opacity-[0.15] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Ambient gold glows */}
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

        <div className="relative w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="max-w-[800px] mx-auto text-center animate-fade-in-up">

            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-white leading-tight lg:leading-[1.2] mb-6 tracking-tight">
              Discover and Compare the{' '}
              <span className="text-gradient">Best Products and Services</span>
            </h1>

            <p className="text-slate-300 text-lg sm:text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
              Find verified companies, products, and services across every industry, worldwide. Read real reviews, compare options, and buy or hire with confidence.
            </p>

            {/* SpotSaaS-style Search Bar */}
            <div className="max-w-[680px] mx-auto mb-10">
              <AISearchBar />
            </div>

            {/* Quick category links — top parent categories from DB */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {categories
                .filter((c) => c.is_parent ?? c.isParent)
                .slice(0, 6)
                .map((cat) => (
                  <Link
                    key={cat.id}
                    href={getDirectoryUrl(cat.slug)}
                    className="text-sm text-slate-200 bg-white/5 border border-white/15 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-200"
                  >
                    {cat.name}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR (SpotSaaS dark navy) ──────────────────────── */}
      <section className="bg-[#1A2E4A] py-10 sm:py-12">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 sm:gap-16 lg:gap-24">
            {[
              { num: `${categories.length || '15'}+`, label: 'Categories' },
              { num: 'Global', label: 'Coverage' },
              { num: '30+', label: 'Verified Companies' },
              { num: '100+', label: 'Client Reviews' },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight">{num}</div>
                <div className="text-base sm:text-lg text-slate-400 mt-1 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW AI WORKS ─────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-[0.2em] mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A2E4A] tracking-tight">
              From requirement to shortlist in <span className="text-gradient">seconds</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
            {/* Connector line — desktop only */}
            <div className="hidden md:block absolute top-12 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px z-0" style={{ background: 'linear-gradient(90deg, #F5A623, #243B58, #F5A623)' }} />

            {[
              {
                num: '01',
                icon: Sparkles,
                title: 'Describe your need',
                desc: 'Type what you\'re looking for in plain English — location, industry, team size, budget, timeline.',
              },
              {
                num: '02',
                icon: Zap,
                title: 'AI matches instantly',
                desc: 'Our AI reads your requirement and scores every verified agency against it in real time.',
              },
              {
                num: '03',
                icon: CheckCircle,
                title: 'Get your shortlist',
                desc: 'Receive your top 3 matches with scores, AI explanations, and direct links to their profiles.',
              },
            ].map(({ num, icon: Icon, title, desc }) => (
              <div key={num} className="relative z-10 bg-white border border-slate-200 rounded-xl p-7 card-hover group">
                <div className="w-12 h-12 bg-[#1A2E4A] rounded-lg flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-5xl font-bold text-slate-200 mb-3 leading-none select-none">{num}</div>
                <h3 className="font-semibold text-[#1A2E4A] text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICE CATEGORIES ────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-[#F7F8FA]">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
            <div>
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">Categories</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A2E4A] tracking-tight">
                Browse All Categories
              </h2>
              <p className="text-slate-500 text-sm mt-2 max-w-lg">
                Find verified companies across every industry — staffing, healthcare, travel, IT, education, and more.
              </p>
            </div>
            <Link href={getDirectoryUrl()} className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors whitespace-nowrap">
              View all companies <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {(() => {
            const parentCategories = categories
              .filter((c) => c.is_parent ?? c.isParent)
              .slice(0, 12);
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {parentCategories.map((cat) => {
                  const href = getDirectoryUrl(cat.slug);
                  const IconComp = pickCategoryIcon(cat);
                  const colorClass = colorFor(cat.slug);

                  return (
                    <Link key={cat.id} href={href} className="group">
                      <div className="bg-white border border-slate-100 rounded-2xl p-5 card-hover h-full flex flex-col">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                            <IconComp className="w-5 h-5" />
                          </div>
                          <h3 className="font-bold text-[#1A2E4A] text-[15px] flex-1 group-hover:text-orange-600 transition-colors">
                            {cat.name}
                          </h3>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </section>

      {/* ── TOP RATED COMPANIES ───────────────────────────────────── */}
      {topRatedAgencies.length > 0 && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">Rankings</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A2E4A] tracking-tight">
                  Top Rated Companies
                </h2>
              </div>
              <Link href={getDirectoryUrl()} className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-orange-600 transition-colors whitespace-nowrap">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topRatedAgencies.slice(0, 6).map((agency, index) => (
                <Link key={agency.id} href={getCompanyProfileUrl(agency)}>
                  <div className="group bg-white border border-slate-100 rounded-2xl p-5 card-hover h-full">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Rank badge */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black ${index === 0 ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        #{index + 1}
                      </div>

                      {/* Logo */}
                      {agency.logo_url ? (
                        <img src={agency.logo_url} alt={agency.name} className="w-10 h-10 rounded-lg object-contain border border-slate-100 bg-white" />
                      ) : (
                        <div className="w-10 h-10 bg-[#1A2E4A] rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-orange-400">{agency.name.charAt(0)}</span>
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-sm truncate group-hover:text-orange-600 transition-colors">
                          {agency.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < Math.floor(agency.avg_rating || 0) ? 'fill-orange-400 text-orange-400' : 'fill-slate-100 text-slate-100'}`} />
                          ))}
                          <span className="text-xs font-semibold text-slate-600 ml-1">{(agency.avg_rating || 0).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-400">{agency.review_count || 0} verified reviews</span>
                      <span className="text-xs font-semibold text-orange-500 group-hover:text-orange-600">View →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── WHY TRUST ─────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">Why FirmsLedger</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A2E4A] tracking-tight leading-tight mb-5">
                The trusted global directory<br />for verified companies
              </h2>
              <p className="text-slate-500 leading-relaxed mb-8 max-w-md text-[15px]">
                Every company is manually verified. Every review is from a real client. Rankings are data-driven — never paid placements.
              </p>
              <Link href={getDirectoryUrl()}>
                <Button className="bg-[#1A2E4A] hover:bg-[#1a2f4a] text-white font-semibold px-6 py-3 h-auto rounded-xl text-sm">
                  Explore the directory <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: Shield, title: 'Verified Listings', desc: 'Every company is checked before going live. No fake agencies, no ghost profiles.' },
                { icon: Star, title: 'Real Reviews Only', desc: 'All reviews are from verified clients — we never edit, hide, or filter ratings.' },
                { icon: CheckCircle, title: 'Always Updated', desc: 'Company data is reviewed regularly to keep information accurate and current.' },
                { icon: Award, title: 'Unbiased Rankings', desc: 'Rankings are purely performance-based. Zero pay-to-rank influence.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="border border-slate-100 rounded-2xl p-6 card-hover bg-white">
                  <div className="w-9 h-9 bg-orange-50 border border-orange-100 rounded-lg flex items-center justify-center mb-3">
                    <Icon className="w-4.5 h-4.5 text-orange-500" />
                  </div>
                  <h3 className="font-bold text-[#1A2E4A] text-sm mb-1.5">{title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── RECENT REVIEWS ────────────────────────────────────────── */}
      {recentReviews.length > 0 && (
        <section className="py-20 sm:py-28 bg-[#F7F8FA]">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <p className="text-xs font-bold text-orange-500 uppercase tracking-[0.2em] mb-2">Social Proof</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A2E4A] tracking-tight">
                What Clients Are Saying
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentReviews.map((review) => (
                <div key={review.id} className="bg-white border border-slate-100 rounded-2xl p-6 card-hover flex flex-col">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(review.rating_overall || 0) ? 'fill-orange-400 text-orange-400' : 'fill-slate-100 text-slate-100'}`} />
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-1">{(review.rating_overall || 0).toFixed(1)}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-2 leading-snug">{review.title}</h3>
                  <p className="text-slate-500 text-xs line-clamp-3 mb-4 leading-relaxed flex-1">{review.body}</p>
                  <div className="border-t border-slate-100 pt-3 flex items-center gap-2">
                    <div className="w-7 h-7 bg-[#1A2E4A] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-orange-400">
                        {(review.company_name || 'C').charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 leading-none">{review.company_name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{review.role_hired}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TOP REGIONS ──────────────────────────────────────────── */}
      <section className="py-12 bg-white border-t border-slate-100">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-600">Browse Companies by Country</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              'United States', 'United Kingdom', 'Canada', 'Australia',
              'Germany', 'France', 'India', 'Singapore',
              'Netherlands', 'Ireland', 'United Arab Emirates', 'Qatar',
              'Spain', 'Japan', 'Brazil', 'Sweden', 'Switzerland',
            ].map((country) => (
              <Link
                key={country}
                href={`${getDirectoryUrl()}?location=${encodeURIComponent(country)}`}
                className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-all"
              >
                {country}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────── */}
      <section className="bg-[#1A2E4A] py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-indigo-500/8 blur-[100px] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }}
        />
        <div className="relative w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                Ready to find your perfect product or service?
              </h2>
              <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
                Join thousands of businesses worldwide using FirmsLedger to find verified companies in seconds.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link href="/ai-match?q=">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-7 py-3 h-auto rounded-xl text-sm transition-colors">
                  Try AI Matchmaker <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/ListYourCompany">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 font-semibold px-7 py-3 h-auto rounded-xl text-sm transition-colors bg-transparent">
                  List Your Company
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
