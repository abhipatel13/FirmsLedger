'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getDirectoryUrl, createPageUrl } from '@/utils';
import Breadcrumb from '@/components/Breadcrumb';

const FEATURED_IMAGE = {
  src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=85',
  alt: 'Best permanent staffing and RPO firms in India 2026 - recruitment process outsourcing and direct hire',
  width: 1200,
  height: 630,
};

const FIRMS = [
  {
    rank: '01',
    badge: "Editor's Pick",
    name: 'TeamLease Digital',
    tagline: 'Full-cycle permanent and RPO for tech',
    description: "TeamLease Digital is the technology arm of India's largest staffing company. They offer permanent recruitment, RPO (Recruitment Process Outsourcing), and contract staffing for IT roles. With 3,000+ clients and nationwide compliance infrastructure, they are the go-to for large-scale permanent tech hiring and dedicated RPO engagements in 2026.",
    strengths: ['Permanent + RPO + contract', 'Nationwide IT focus', 'Listed entity reliability', 'High-volume hiring'],
  },
  {
    rank: '02',
    badge: 'Global RPO',
    name: 'Randstad India',
    tagline: 'Enterprise RPO and permanent staffing',
    description: "Randstad India delivers end-to-end RPO and permanent staffing for IT, engineering, BFSI, and GCCs. Their global playbooks and assessment frameworks ensure consistent quality for multinationals. Ideal for companies that want a single RPO partner for pan-India permanent hiring with international standards.",
    strengths: ['Full RPO capability', 'MNC & GCC focus', 'Assessment-led hiring', 'Permanent + contract'],
  },
  {
    rank: '03',
    badge: 'Executive Search',
    name: 'ABC Consultants',
    tagline: 'Senior and leadership permanent hiring',
    description: "One of India's most respected executive search firms, ABC Consultants specializes in permanent placement of C-suite, VP, and senior technology leaders. Their process is thorough and relationship-driven — resulting in high-impact strategic hires. Best for companies that need top-tier permanent leadership talent.",
    strengths: ['C-suite & VP hiring', 'Deep senior network', 'Strategic placements', 'Decades of reputation'],
  },
  {
    rank: '04',
    badge: 'Mid–Senior IT',
    name: 'Adecco India',
    tagline: 'Permanent tech hiring with technical assessments',
    description: "Adecco India focuses on permanent recruitment of mid to senior IT professionals — team leads, architects, engineering managers. Their role-specific technical testing and customized assessments set them apart from generalist recruiters. Strong for quality-over-volume permanent tech hiring.",
    strengths: ['Mid–senior IT', 'Technical assessments', 'Permanent focus', 'Global backing'],
  },
  {
    rank: '05',
    badge: 'RPO & TBO',
    name: 'ManpowerGroup India',
    tagline: 'RPO and talent-based outsourcing',
    description: "ManpowerGroup India offers RPO (Recruitment Process Outsourcing), permanent recruitment, and Talent-based Outsourcing (TBO) for IT and industrial roles. Their Hire-Train-Deploy model is valuable for permanent hiring where candidates need upskilling before joining. Serves both Indian enterprises and MNCs.",
    strengths: ['RPO & TBO', 'Hire-Train-Deploy', 'IT & industrial', 'Permanent + contract'],
  },
  {
    rank: '06',
    badge: 'Permanent Specialist',
    name: 'Xpheno',
    tagline: 'Direct hire and permanent tech recruitment',
    description: "Xpheno is a specialist in permanent recruitment across technology, engineering, and corporate functions. Based in Bangalore with a growing national footprint, they are known for candidate quality and transparent client communication. Ideal for permanent tech hiring in Tier-1 cities.",
    strengths: ['Permanent only focus', 'Tech & engineering', 'Bangalore stronghold', 'Quality placements'],
  },
  {
    rank: '07',
    badge: 'SMB & Startups',
    name: 'Multi Recruit',
    tagline: 'Cost-effective permanent hiring for SMBs',
    description: "Multi Recruit is highly rated for cost-effective permanent tech hiring. Startups and SMBs consistently report strong ROI and smooth processes. They focus on permanent placement with verified reviews — a solid choice when budget matters but you still want quality permanent hires.",
    strengths: ['Cost-effective', 'SMB & startup focus', 'Verified reviews', 'Permanent placement'],
  },
  {
    rank: '08',
    badge: 'EOR & Permanent',
    name: 'Wisemonk',
    tagline: 'Permanent hire without a local entity',
    description: "Wisemonk enables global companies to hire permanent talent in India without incorporating. Their EOR model handles payroll, compliance, and onboarding from day one — so you can make permanent offers to Indian talent while Wisemonk remains the legal employer until you set up an entity.",
    strengths: ['EOR for permanent hire', 'No entity required', 'From $99/employee/month', 'Remote-first'],
  },
];

export default function BestPermanentStaffingRPOFirmsIndia2026Article() {
  const staffingUrl = getDirectoryUrl();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={[{ label: 'Blog', href: createPageUrl('Blogs') }, { label: 'Best Permanent Staffing & RPO Firms in India 2026' }]} />
        </div>
      </div>

      <header className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block bg-blue-500/90 text-white text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg mb-6">
            Permanent Hiring & RPO · 2026
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight max-w-3xl">
            Best Permanent Staffing & RPO Firms in India 2026
          </h1>
          <p className="text-slate-300 text-lg mt-4 max-w-2xl">
            Expert-curated guide to India&apos;s top permanent recruitment and Recruitment Process Outsourcing (RPO) partners — for direct hire and scalable hiring programs.
          </p>
          <div className="flex flex-wrap items-center gap-6 mt-8 text-sm text-slate-400">
            <span>📅 February 2026</span>
            <span>⏱ 8 min read</span>
            <span>🏢 8 Firms Reviewed</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2">
        <figure className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white">
          <Image
            src={FEATURED_IMAGE.src}
            alt={FEATURED_IMAGE.alt}
            width={FEATURED_IMAGE.width}
            height={FEATURED_IMAGE.height}
            className="w-full h-auto object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
            priority
          />
          <figcaption className="sr-only">{FEATURED_IMAGE.alt}</figcaption>
        </figure>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="border-l-4 border-blue-600 bg-white rounded-r-xl shadow-sm p-6 md:p-8 mb-12">
          <p className="text-slate-600 text-base leading-relaxed">
            <strong className="text-slate-900">Permanent staffing vs RPO in 2026:</strong> Permanent staffing agencies help you fill individual roles on a per-hire fee (typically 8–20% of CTC). RPO (Recruitment Process Outsourcing) partners take over your entire or partial hiring process — from sourcing and screening to offer and onboarding — often on a per-hire or retained basis. Both are essential for building a long-term workforce; the right firm depends on volume, seniority, and whether you want project-based or embedded support.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { val: '8–20%', lab: 'Typical permanent placement fee (of CTC)' },
            { val: '14–21 days', lab: 'Top agency time-to-fill (permanent)' },
            { val: 'RPO', lab: 'Full hiring process outsourcing' },
            { val: '3,000+', lab: 'Largest agency client base' },
          ].map((item) => (
            <div key={item.val} className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm border-t-4 border-t-blue-600">
              <div className="text-2xl font-extrabold text-blue-600">{item.val}</div>
              <div className="text-xs text-slate-500 mt-1">{item.lab}</div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-3">When to Use Permanent Staffing vs RPO</h2>
        <p className="text-slate-600 leading-relaxed mb-6">
          Use a <strong className="text-slate-900">permanent staffing agency</strong> when you need to fill specific roles and are happy to pay per hire (8–20% of annual CTC). Use an <strong className="text-slate-900">RPO partner</strong> when you have high volume, recurring hiring, or want to outsource the entire recruitment function. Many top firms offer both — so you can start with permanent hiring and scale into RPO as needs grow.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {[
            { title: 'Permanent staffing', text: 'Best for: filling defined roles, paying per hire, retaining control of process. Typical fee: 8–20% of CTC. Timeline: 2–4 weeks for mid-level, 4–8 weeks for leadership.' },
            { title: 'RPO (Recruitment Process Outsourcing)', text: 'Best for: high volume, recurring hiring, or embedding a dedicated recruitment team. Pricing: per-hire, monthly retainer, or hybrid. You get scalability and often better time-to-fill.' },
          ].map((item) => (
            <div key={item.title} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-600 text-sm">{item.text}</p>
            </div>
          ))}
        </div>

        <hr className="border-slate-200 my-12" />

        <h2 className="text-2xl font-bold text-slate-900 mb-3">Best Permanent Staffing & RPO Firms in India (2026)</h2>
        <p className="text-slate-600 leading-relaxed mb-8">
          These firms lead in permanent recruitment and RPO — by scale, sector, seniority, or delivery model. Choose based on whether you need one-off permanent hires or a full hiring partnership.
        </p>

        <div className="space-y-8">
          {FIRMS.map((agency) => (
            <div
              key={agency.rank}
              className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow relative"
            >
              <div className="absolute top-6 right-6 text-4xl font-extrabold text-blue-100 hidden md:block">{agency.rank}</div>
              {agency.badge && (
                <span className="inline-block text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded bg-blue-50 text-blue-700 mb-3">
                  {agency.badge}
                </span>
              )}
              <h3 className="text-xl font-bold text-blue-600 mb-1">{agency.name}</h3>
              <p className="text-slate-500 text-sm italic mb-4">{agency.tagline}</p>
              <p className="text-slate-600 text-[15px] leading-relaxed mb-4">{agency.description}</p>
              <div className="flex flex-wrap gap-2">
                {agency.strengths.map((s) => (
                  <span key={s} className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <hr className="border-slate-200 my-12" />

        <h2 className="text-2xl font-bold text-slate-900 mb-3">How to Choose a Permanent or RPO Partner</h2>
        <ul className="space-y-0 border-t border-slate-200">
          {[
            { strong: 'Volume and model:', text: 'For 1–10 hires/year, permanent staffing per hire is fine. For 50+ hires or ongoing needs, consider RPO.' },
            { strong: 'Seniority:', text: 'Executive search (ABC, similar) for C-suite; mid–senior IT (Adecco, Xpheno); volume tech (TeamLease Digital, Randstad).' },
            { strong: 'Fee structure:', text: 'Permanent: 8–20% of CTC is standard. RPO: per-hire, monthly retainer, or hybrid — get clarity on what’s included.' },
            { strong: 'Time-to-fill:', text: 'Top agencies quote 14–21 days for mid-level permanent; 4–8 weeks for leadership. Ask for guarantees or benchmarks.' },
            { strong: 'Replacement guarantee:', text: 'Most offer 30–90 day free replacement if a permanent hire leaves. Confirm this in writing.' },
          ].map((item, i) => (
            <li key={i} className="py-4 border-b border-slate-200 pl-8 relative text-slate-600 text-[15px] before:content-['→'] before:absolute before:left-0 before:text-blue-600 before:font-semibold">
              <strong className="text-slate-900">{item.strong}</strong> {item.text}
            </li>
          ))}
        </ul>

        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white rounded-2xl p-8 md:p-10 text-center mt-12">
          <h2 className="text-2xl font-bold mb-3">Explore Staffing & RPO Partners</h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-6">
            Compare permanent staffing and RPO firms by sector, scale, and service model. Use our directory to shortlist the right partner for 2026.
          </p>
          <Link
            href={staffingUrl}
            className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all"
          >
            Browse Companies →
          </Link>
        </div>
      </main>
    </div>
  );
}
