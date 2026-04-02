'use client';

import React from 'react';
import Link from 'next/link';
import { getDirectoryUrl, getDirectoryStaffingUrl, getCompanyProfileUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import AISearchBar from '@/components/AISearchBar';
import {
  ArrowRight, Star, Shield, CheckCircle, Award,
  ChevronRight, Sparkles, Globe, Users, Zap,
  Building2, Cpu, Megaphone, Briefcase, HeartPulse,
  Factory, GraduationCap, Truck, Wrench,
} from 'lucide-react';

const CATEGORY_ICONS = {
  'staffing-companies': Users,
  'it-services': Cpu,
  'marketing-agencies': Megaphone,
  'consulting': Briefcase,
  'healthcare': HeartPulse,
  'manufacturing': Factory,
  'education': GraduationCap,
  'logistics': Truck,
  'maintenance': Wrench,
};
const CATEGORY_COLORS = {
  'staffing-companies': 'bg-blue-50 border-blue-100 text-blue-600',
  'it-services': 'bg-violet-50 border-violet-100 text-violet-600',
  'marketing-agencies': 'bg-pink-50 border-pink-100 text-pink-600',
  'consulting': 'bg-amber-50 border-amber-100 text-amber-600',
  'healthcare': 'bg-emerald-50 border-emerald-100 text-emerald-600',
  'manufacturing': 'bg-slate-50 border-slate-200 text-slate-600',
  'education': 'bg-cyan-50 border-cyan-100 text-cyan-600',
  'logistics': 'bg-orange-50 border-orange-100 text-orange-600',
  'maintenance': 'bg-rose-50 border-rose-100 text-rose-600',
};


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

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="bg-[#0D1B2A] relative overflow-hidden min-h-[calc(100vh-5rem)] flex flex-col">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }}
        />
        {/* Glow orbs */}
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full bg-orange-400/8 blur-[90px] pointer-events-none" />

        <div className="relative w-full px-4 sm:px-6 lg:px-8 flex-1 flex items-center justify-center pb-8">
          <div className="max-w-4xl mx-auto text-center">

            {/* Brand / Logo */}
            <div className="mb-4">
              <img src="/logo-white.svg" alt="FirmsLedger" className="h-16 sm:h-24 lg:h-32 w-auto mx-auto" />
            </div>

            <p className="text-slate-300 text-lg sm:text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
              The better way to find companies
            </p>

            {/* Ensun-style AI Search Bar */}
            <AISearchBar />
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative border-t border-white/10 mt-4 bg-white/[0.02] backdrop-blur-sm">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-wrap justify-center gap-0">
              {[
                { num: '5,000+', label: 'Categories' },
                { num: '2,300+', label: 'Cities Covered' },
                { num: '50+', label: 'Verified Agencies' },
                { num: '4.8', label: 'Avg Rating', stars: true },
              ].map(({ num, label, stars }, i) => (
                <div key={label} className={`text-center px-8 sm:px-12 ${i > 0 ? 'border-l border-white/10' : ''}`}>
                  <div className="text-xl font-extrabold text-white flex items-center justify-center gap-1">
                    {num}
                    {stars && (
                      <span className="flex items-center gap-0.5 ml-1">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                        ))}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW AI WORKS ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">How It Works</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D1B2A] tracking-tight">
              From requirement to shortlist in seconds
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line — desktop only */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-slate-200 z-0" />

            {[
              {
                num: '1',
                icon: Sparkles,
                title: 'Describe your need',
                desc: 'Type what you\'re looking for in plain English — location, industry, team size, budget, timeline.',
                color: 'bg-orange-500',
              },
              {
                num: '2',
                icon: Zap,
                title: 'AI matches instantly',
                desc: 'Our AI reads your requirement and scores every verified agency against it in real time.',
                color: 'bg-[#0D1B2A]',
              },
              {
                num: '3',
                icon: CheckCircle,
                title: 'Get your shortlist',
                desc: 'Receive your top 3 matches with scores, AI explanations, and direct links to their profiles.',
                color: 'bg-green-600',
              },
            ].map(({ num, icon: Icon, title, desc, color }) => (
              <div key={num} className="relative z-10 bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-3xl font-black text-slate-100 mb-2 leading-none">{num}</div>
                <h3 className="font-bold text-[#0D1B2A] mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICE CATEGORIES ────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#F7F8FA]">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
            <div>
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">Categories</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D1B2A] tracking-tight">
                Browse by Industry
              </h2>
              <p className="text-slate-500 text-sm mt-2 max-w-lg">
                Find verified companies across manufacturing, staffing, IT, marketing, and more.
              </p>
            </div>
            <Link href="/Categories" className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors whitespace-nowrap">
              View all categories <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {(() => {
            const parents = categories
              .filter(c => (c.is_parent ?? c.isParent))
              .slice(0, 9);
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {parents.map((parent) => {
                  const children = categories
                    .filter(c => (c.parent_id ?? c.parentId) === parent.id)
                    .slice(0, 4);
                  const href = parent.slug === 'staffing-companies'
                    ? getDirectoryStaffingUrl()
                    : getDirectoryUrl(parent.slug);
                  const IconComp = CATEGORY_ICONS[parent.slug] || Building2;
                  const colorClass = CATEGORY_COLORS[parent.slug] || 'bg-amber-50 border-amber-100 text-amber-600';

                  return (
                    <Link key={parent.id} href={href} className="group">
                      <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-orange-300 hover:shadow-lg transition-all duration-200 h-full flex flex-col">
                        {/* Header row: icon + title + arrow */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                            <IconComp className="w-5 h-5" />
                          </div>
                          <h3 className="font-bold text-[#0D1B2A] text-[15px] flex-1 group-hover:text-orange-600 transition-colors">
                            {parent.name}
                          </h3>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </div>

                        {/* Subcategory chips */}
                        {children.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-auto">
                            {children.map((c) => (
                              <span
                                key={c.id}
                                className="text-[11px] text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md"
                              >
                                {c.name}
                              </span>
                            ))}
                            {categories.filter(c => (c.parent_id ?? c.parentId) === parent.id).length > 4 && (
                              <span className="text-[11px] text-orange-500 font-medium px-2 py-0.5">
                                +{categories.filter(c => (c.parent_id ?? c.parentId) === parent.id).length - 4} more
                              </span>
                            )}
                          </div>
                        )}
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
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D1B2A] tracking-tight">
                  Top Rated Agencies
                </h2>
              </div>
              <Link href={getDirectoryUrl()} className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-orange-600 transition-colors whitespace-nowrap">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topRatedAgencies.slice(0, 6).map((agency, index) => (
                <Link key={agency.id} href={getCompanyProfileUrl(agency)}>
                  <div className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-orange-300 hover:shadow-md transition-all duration-200 h-full">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Rank badge */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black ${index === 0 ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        #{index + 1}
                      </div>

                      {/* Logo */}
                      {agency.logo_url ? (
                        <img src={agency.logo_url} alt={agency.name} className="w-10 h-10 rounded-lg object-contain border border-slate-100 bg-white" />
                      ) : (
                        <div className="w-10 h-10 bg-[#0D1B2A] rounded-lg flex items-center justify-center flex-shrink-0">
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
      <section className="py-16 sm:py-20 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">Why FirmsLedger</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0D1B2A] tracking-tight leading-tight mb-5">
                The trusted standard<br />for B2B vendor research
              </h2>
              <p className="text-slate-500 leading-relaxed mb-8 max-w-md text-[15px]">
                Every company is manually verified. Every review is from a real client. Rankings are data-driven — never paid placements.
              </p>
              <Link href={getDirectoryUrl()}>
                <Button className="bg-[#0D1B2A] hover:bg-[#1a2f4a] text-white font-semibold px-6 py-3 h-auto rounded-xl text-sm">
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
                <div key={title} className="border border-slate-200 rounded-xl p-5 hover:border-orange-300 hover:bg-orange-50/30 transition-all">
                  <div className="w-9 h-9 bg-orange-50 border border-orange-100 rounded-lg flex items-center justify-center mb-3">
                    <Icon className="w-4.5 h-4.5 text-orange-500" />
                  </div>
                  <h3 className="font-bold text-[#0D1B2A] text-sm mb-1.5">{title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── RECENT REVIEWS ────────────────────────────────────────── */}
      {recentReviews.length > 0 && (
        <section className="py-16 sm:py-20 bg-[#F7F8FA]">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">Social Proof</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D1B2A] tracking-tight">
                What Clients Are Saying
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentReviews.map((review) => (
                <div key={review.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(review.rating_overall || 0) ? 'fill-orange-400 text-orange-400' : 'fill-slate-100 text-slate-100'}`} />
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-1">{(review.rating_overall || 0).toFixed(1)}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-2 leading-snug">{review.title}</h3>
                  <p className="text-slate-500 text-xs line-clamp-3 mb-4 leading-relaxed flex-1">{review.body}</p>
                  <div className="border-t border-slate-100 pt-3 flex items-center gap-2">
                    <div className="w-7 h-7 bg-[#0D1B2A] rounded-full flex items-center justify-center flex-shrink-0">
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

      {/* ── COUNTRIES ─────────────────────────────────────────────── */}
      <section className="py-12 bg-white border-t border-slate-100">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-600">Available in 100+ Countries</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              'United States', 'United Kingdom', 'Canada', 'Australia',
              'Singapore', 'United Arab Emirates', 'Germany', 'France',
              'Japan', 'India', 'Netherlands', 'Sweden',
            ].map((country) => (
              <Link
                key={country}
                href={`${getDirectoryUrl()}?country=${encodeURIComponent(country)}`}
                className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-all"
              >
                {country}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────── */}
      <section className="bg-[#0D1B2A] py-14 sm:py-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }}
        />
        <div className="relative w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                Ready to find your perfect agency?
              </h2>
              <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
                Join businesses using FirmsLedger AI to cut vendor sourcing from weeks to seconds.
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
