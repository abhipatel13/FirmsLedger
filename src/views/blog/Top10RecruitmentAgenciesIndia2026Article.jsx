'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { getDirectoryUrl, getDirectoryStaffingUrl, createPageUrl } from '@/utils';
import Breadcrumb from '@/components/Breadcrumb';

const FEATURED_IMAGE = {
  src: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&q=85',
  alt: 'Top 10 recruitment agencies in India 2026 - best hiring partners and staffing firms',
  width: 1200,
  height: 630,
};

const AGENCIES = [
  {
    rank: 1,
    name: 'TeamLease Services',
    founded: 2002,
    hq: 'Bengaluru, Karnataka',
    specialization: 'Staffing, HR services, skill development',
    description: "India's largest staffing company, with over 250,000 associates deployed across 6,000+ pin codes. Listed on BSE and NSE, offering end-to-end HR solutions including payroll, compliance, and skill training.",
    strengths: ['Unmatched scale in mass/volume hiring', 'Strong presence in BFSI, retail, telecom, and manufacturing', 'TeamLease Skills University for skill development', 'Pan-India geographic coverage'],
    bestFor: 'Large enterprises needing high-volume staffing, temp-to-perm hiring, and compliance management.',
  },
  {
    rank: 2,
    name: 'Naukri.com / Info Edge India',
    founded: 1997,
    hq: 'Noida, Uttar Pradesh',
    specialization: 'Technology-driven recruitment, job board + executive search',
    description: "India's largest job portal with over 90 million registered candidates. AI-powered matching, Resdex used by 60,000+ recruiters. Data-driven, technology-first talent sourcing.",
    strengths: ['Largest candidate database in India', 'AI-powered candidate matching and resume ranking', 'Strong across IT/Tech, Engineering, Management, Finance', 'Resdex resume database tool'],
    bestFor: 'Companies seeking technology-first talent sourcing and mid-level hiring across all industries.',
  },
  {
    rank: 3,
    name: 'Randstad India',
    founded: 2008,
    hq: 'Chennai, Tamil Nadu',
    specialization: 'Permanent staffing, contract staffing, executive search, HR solutions',
    description: 'Subsidiary of Randstad N.V., one of the world\'s largest HR services companies. Over 100 offices in India across 16 cities, serving 20+ industry sectors with global best practices.',
    strengths: ['Global expertise with deep local market knowledge', 'Strong in IT & Tech, Engineering, Life Sciences, BFSI, FMCG', 'Robust compliance and payroll management', 'Diversity and inclusion hiring programs'],
    bestFor: 'MNCs and large Indian enterprises wanting a globally aligned recruitment partner with strong local networks.',
  },
  {
    rank: 4,
    name: 'Adecco India',
    founded: 1997,
    hq: 'Mumbai, Maharashtra',
    specialization: 'Temporary staffing, permanent placement, outsourcing',
    description: 'Part of the Adecco Group — the world\'s second-largest HR solutions company. Focus on workforce agility, seasonal demand, project-based hiring, and long-term talent strategy.',
    strengths: ['Expertise in flexible workforce solutions', 'Strong in Engineering, IT, Automotive, and Logistics', 'Talent analytics and workforce planning', 'Presence in Tier 1 and Tier 2 cities'],
    bestFor: 'Companies needing flexible workforce solutions, contract staffing, and temp-to-hire arrangements.',
  },
  {
    rank: 5,
    name: 'ManpowerGroup India',
    founded: 1998,
    hq: 'Mumbai, Maharashtra',
    specialization: 'Workforce solutions, permanent staffing, RPO, talent consulting',
    description: 'Subsidiary of ManpowerGroup Inc., a global leader in innovative workforce solutions. Consultative approach with RPO, talent consulting, and workforce management beyond basic staffing.',
    strengths: ['Deep expertise in Recruitment Process Outsourcing (RPO)', 'Research-backed talent assessments', 'Brands: Manpower, Experis (IT/Tech), Talent Solutions', 'Sector expertise in IT, Healthcare, Engineering, Finance'],
    bestFor: 'Enterprises seeking a strategic, long-term workforce partner with strong RPO capabilities.',
  },
  {
    rank: 6,
    name: 'ABC Consultants',
    founded: 1969,
    hq: 'New Delhi, NCR',
    specialization: 'Executive search, senior and middle management hiring',
    description: "One of India's oldest and most respected recruitment firms, with over five decades of experience in placing senior and mid-level professionals. Pioneer in executive search in India.",
    strengths: ['Pioneer in executive search in India', 'Deep sector knowledge: Manufacturing, IT, Healthcare, FMCG, Retail', 'Strong referral network built over decades', 'Relationship-driven search methodology'],
    bestFor: 'Companies looking for CXO, VP, and Director-level hires with a trusted, experienced search firm.',
  },
  {
    rank: 7,
    name: 'Michael Page India',
    founded: 2010,
    hq: 'Mumbai, Maharashtra',
    specialization: 'Professional and executive recruitment, specialist hiring',
    description: 'Part of global PageGroup. Specialist consultants with sector-specific expertise — not generalists. Strong in Finance, Technology, Engineering, Legal, HR, and Marketing.',
    strengths: ['Specialist consultants with sector-specific expertise', 'Strong in Finance, Technology, Engineering, Legal, HR, Marketing', 'Extensive candidate networks in India and Southeast Asia', 'Transparent, process-driven approach with detailed reporting'],
    bestFor: 'Mid-to-senior level professional hiring in specialized disciplines, especially for MNCs in India.',
  },
  {
    rank: 8,
    name: 'Korn Ferry India',
    founded: '1990s',
    hq: 'Mumbai, Maharashtra',
    specialization: 'Executive search, leadership consulting, talent assessment',
    description: "The world's largest executive search firm. Unrivaled access to CXO-level talent in India and globally. Proprietary leadership assessment tools (viaEdge, KFLA) and consulting beyond recruitment.",
    strengths: ['#1 executive search firm globally', 'Unrivaled access to CXO-level talent', 'Leadership development, succession planning', 'Consulting services beyond recruitment'],
    bestFor: 'Boards and CEOs seeking top-tier leadership talent and succession planning at the executive level.',
  },
  {
    rank: 9,
    name: 'Heidrick & Struggles India',
    founded: '2000s',
    hq: 'Mumbai, Maharashtra',
    specialization: 'Executive search, leadership consulting',
    description: "One of the world's premier executive search and leadership advisory firms. Strong in Financial Services, Technology, Consumer Goods, and Industrial sectors. Leadership consulting and culture shaping.",
    strengths: ['Elite global executive search reputation', 'Leadership advisory and culture shaping services', 'Deep cross-border search capabilities', 'India-focused thought leadership and research'],
    bestFor: 'Global organizations seeking India\'s next-generation leaders or Indian conglomerates building global teams.',
  },
  {
    rank: 10,
    name: 'Quess Corp',
    founded: 2007,
    hq: 'Bengaluru, Karnataka',
    specialization: 'Staffing, IT staffing, facility management, skill development',
    description: "One of India's fastest-growing business services companies. Over 500,000 associates across 64 cities. Workforce solutions from technology staffing to industrial staffing and facility management.",
    strengths: ['One of India\'s largest workforce management companies', 'Strong IT staffing arm (Quess IT Staffing)', 'Extensive presence in Tier 2 and Tier 3 cities', 'Diversified: staffing + facilities + technology services'],
    bestFor: 'Enterprises needing large-scale staffing, IT talent, and integrated facility management across pan-India.',
  },
];

const COMPARISON_ROWS = [
  { agency: 'TeamLease Services', founded: '2002', hq: 'Bengaluru', bestFor: 'Volume/Mass Hiring', sectors: 'BFSI, Retail, Telecom' },
  { agency: 'Naukri / Info Edge', founded: '1997', hq: 'Noida', bestFor: 'Tech-Driven Sourcing', sectors: 'All Sectors' },
  { agency: 'Randstad India', founded: '2008', hq: 'Chennai', bestFor: 'MNC Staffing', sectors: 'IT, Engineering, FMCG' },
  { agency: 'Adecco India', founded: '1997', hq: 'Mumbai', bestFor: 'Flexible Workforce', sectors: 'Engineering, Automotive' },
  { agency: 'ManpowerGroup India', founded: '1998', hq: 'Mumbai', bestFor: 'RPO Solutions', sectors: 'IT, Healthcare, Finance' },
  { agency: 'ABC Consultants', founded: '1969', hq: 'New Delhi', bestFor: 'Senior Management', sectors: 'Manufacturing, FMCG' },
  { agency: 'Michael Page India', founded: '2010', hq: 'Mumbai', bestFor: 'Specialist Hiring', sectors: 'Finance, Legal, Tech' },
  { agency: 'Korn Ferry India', founded: '1990s', hq: 'Mumbai', bestFor: 'C-Suite Search', sectors: 'All Sectors' },
  { agency: 'Heidrick & Struggles', founded: '2000s', hq: 'Mumbai', bestFor: 'Board/CXO Search', sectors: 'BFSI, Technology' },
  { agency: 'Quess Corp', founded: '2007', hq: 'Bengaluru', bestFor: 'Large-Scale Staffing', sectors: 'IT, Facilities, Industrial' },
];

const CHOOSE_TIPS = [
  { title: 'Define Your Hiring Need', text: 'Executive search firms like Korn Ferry and ABC Consultants excel at leadership hiring; TeamLease and Quess Corp handle volume staffing.' },
  { title: 'Match Industry Expertise', text: 'A tech company in Hyderabad benefits from a firm with a strong IT talent network. Ask about their sector placement track record.' },
  { title: 'Check Geographic Coverage', text: 'For pan-India operations, choose firms with nationwide presence. In Tier 2 cities, verify the agency has local consultants or networks.' },
  { title: 'Understand the Fee Structure', text: 'Executive search typically charges 12–25% of annual CTC. Staffing agencies use a markup model. Know what you\'re paying for.' },
  { title: 'Assess Technology Capabilities', text: 'Agencies using AI-based screening, ATS integration, and analytics deliver faster, more accurate results. Ask about their tech stack.' },
  { title: 'Ask for Client References', text: 'The best agencies will share references. Speaking with existing clients gives unfiltered insight into quality and service levels.' },
];

const FAQ_ITEMS = [
  { q: 'Which is the largest recruitment agency in India?', a: 'TeamLease Services is considered the largest staffing company in India by headcount, with over 250,000 associates deployed. Quess Corp is a close second by scale of operations.' },
  { q: 'Which recruitment agency is best for IT hiring in India?', a: 'For IT and technology hiring, top choices include Randstad India (tech specialization), Quess IT Staffing, and Naukri.com\'s recruitment services given their massive tech candidate database.' },
  { q: 'Are recruitment agencies free for job seekers in India?', a: 'Legitimate recruitment agencies in India do not charge job seekers. They earn fees from the hiring company. Be cautious of any agency that asks candidates to pay placement fees.' },
  { q: 'What is the average recruitment agency fee in India?', a: 'For executive search, fees typically range from 12% to 25% of the placed candidate\'s annual CTC. For bulk staffing, agencies charge a markup on the employee\'s salary (usually 10–20% depending on the contract).' },
  { q: 'How long does recruitment take through an agency?', a: 'For mid-level roles, most agencies close positions within 2–6 weeks. Senior executive searches can take 6–12 weeks. Volume hiring timelines vary widely by scale and location.' },
  { q: 'Can startups use recruitment agencies in India?', a: 'Yes. Many agencies have startup-friendly packages. Michael Page India and Randstad India, for example, work with funded startups and scale-ups, not just large enterprises.' },
];

const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
};

export default function Top10RecruitmentAgenciesIndia2026Article() {
  const directoryUrl = getDirectoryUrl();
  const staffingUrl = getDirectoryStaffingUrl();

  return (
    <article className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Script
        id="faq-schema"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(FAQ_JSON_LD)}
      </Script>
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb
            items={[
              { label: 'Blog', href: createPageUrl('Blogs') },
              { label: 'Top 10 Recruitment Agencies in India (2026)' },
            ]}
          />
        </div>
      </div>

      <header className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block bg-blue-500/90 text-white text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg mb-6">
            Recruitment · India · 2026
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight max-w-3xl">
            Top 10 Recruitment Agencies in India (2026): Find the Best Hiring Partner
          </h1>
          <p className="text-slate-300 text-lg mt-4 max-w-2xl">
            Finding the right talent in India&apos;s competitive job market is no easy task. This guide breaks down the top 10 recruitment agencies in India — their specializations, strengths, and what makes them stand out.
          </p>
          <div className="flex flex-wrap items-center gap-6 mt-8 text-sm text-slate-400">
            <span>Last Updated: 2026</span>
            <span>12 min read</span>
            <span>10 Agencies Reviewed</span>
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
        <p className="text-slate-600 text-lg leading-relaxed mb-8">
          Whether you&apos;re a multinational expanding operations or a startup building your core team, partnering with the right recruitment agency can make or break your hiring success. With thousands of staffing firms across India, we&apos;ve done the research so you can choose with confidence.
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Why Use a Recruitment Agency in India?</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Companies from Fortune 500s to growing SMEs rely on recruitment agencies in India for:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-600 mb-4">
            <li><strong className="text-slate-800">Access to a pre-vetted talent pool</strong> that isn&apos;t visible on public job boards</li>
            <li><strong className="text-slate-800">Faster time-to-hire</strong>, often 40–60% quicker than in-house recruitment</li>
            <li><strong className="text-slate-800">Industry expertise</strong> in niche domains like IT, BFSI, healthcare, or manufacturing</li>
            <li><strong className="text-slate-800">Cost efficiency</strong> — reduces overhead of maintaining large HR departments</li>
            <li><strong className="text-slate-800">Compliance and legal support</strong>, especially for contract staffing and international hiring</li>
          </ul>
          <p className="text-slate-600 leading-relaxed">
            India&apos;s recruitment industry is one of the largest in Asia, valued at over $5 billion and growing rapidly. With IT hubs in Bangalore and Hyderabad, financial centers in Mumbai, and manufacturing belts across Pune, Chennai, and NCR, the demand for specialized recruitment partners has never been higher.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">How We Selected These Agencies</h2>
          <p className="text-slate-600 leading-relaxed mb-4">Our ranking is based on:</p>
          <ul className="list-disc pl-6 space-y-1 text-slate-600">
            <li>Industry reputation and client reviews</li>
            <li>Years of experience and market presence</li>
            <li>Range of sectors covered</li>
            <li>Geographic reach across India</li>
            <li>Technology adoption and candidate screening quality</li>
            <li>Specialization in executive search, mass hiring, or contract staffing</li>
          </ul>
        </section>

        <section className="mb-12" aria-labelledby="top-10-list">
          <h2 id="top-10-list" className="text-2xl font-bold text-slate-900 mb-6">Top 10 Recruitment Agencies in India (2026)</h2>
          <div className="space-y-8">
            {AGENCIES.map((agency) => (
              <div
                key={agency.rank}
                className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow relative"
              >
                <div className="absolute top-6 right-6 text-4xl font-extrabold text-blue-100 hidden md:block" aria-hidden>#{agency.rank}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{agency.name}</h3>
                <p className="text-slate-500 text-sm mb-4">
                  <strong>Founded:</strong> {agency.founded} · <strong>Headquarters:</strong> {agency.hq} · <strong>Specialization:</strong> {agency.specialization}
                </p>
                <p className="text-slate-600 leading-relaxed mb-4">{agency.description}</p>
                <h4 className="text-sm font-bold text-slate-800 mb-2">Key Strengths</h4>
                <ul className="space-y-2 mb-4">
                  {agency.strengths.map((s) => (
                    <li key={s} className="text-slate-600 text-sm flex gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-slate-700 text-sm font-medium">
                  <span className="text-slate-500">Best For:</span> {agency.bestFor}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12 overflow-x-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Comparison Table: Top 10 Recruitment Agencies in India</h2>
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="text-left p-3 font-semibold text-slate-900">Agency</th>
                  <th className="text-left p-3 font-semibold text-slate-900">Founded</th>
                  <th className="text-left p-3 font-semibold text-slate-900">HQ</th>
                  <th className="text-left p-3 font-semibold text-slate-900">Best For</th>
                  <th className="text-left p-3 font-semibold text-slate-900">Key Sectors</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    <td className="p-3 font-medium text-slate-800">{row.agency}</td>
                    <td className="p-3 text-slate-600">{row.founded}</td>
                    <td className="p-3 text-slate-600">{row.hq}</td>
                    <td className="p-3 text-slate-600">{row.bestFor}</td>
                    <td className="p-3 text-slate-600">{row.sectors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">How to Choose the Right Recruitment Agency in India</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            With so many options, here&apos;s how to narrow down your choice:
          </p>
          <ul className="space-y-4">
            {CHOOSE_TIPS.map((tip) => (
              <li key={tip.title} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <strong className="text-slate-900">{tip.title}</strong>
                <span className="text-slate-600 text-sm ml-1">{tip.text}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {FAQ_ITEMS.map((faq, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Conclusion</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            India&apos;s recruitment industry is mature, diverse, and increasingly technology-driven. Whether you need one transformational leader or thousands of frontline employees, there&apos;s a specialized agency built for that need. The top 10 recruitment agencies in India listed here — from the scale of TeamLease and Quess Corp to the executive precision of Korn Ferry and Heidrick & Struggles — represent the best the Indian market has to offer.
          </p>
          <p className="text-slate-600 leading-relaxed">
            <strong className="text-slate-800">Your next step:</strong> Define your hiring goals, shortlist 2–3 agencies that match your sector and scale, and request an initial consultation. The right recruitment partner won&apos;t just fill vacancies — they&apos;ll become a strategic extension of your HR function.
          </p>
        </section>

        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white rounded-2xl p-8 md:p-10 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to Find Your Hiring Partner?</h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-6">
            Browse verified staffing and recruitment agencies on FirmsLedger. Compare providers by expertise, reviews, and location — and connect with the best fit for your hiring needs.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={directoryUrl}
              className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-6 py-3 rounded-xl transition-all"
            >
              Browse All Agencies →
            </Link>
            <Link
              href={staffingUrl}
              className="inline-block bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-all"
            >
              Staffing Companies →
            </Link>
          </div>
        </div>

        <footer className="mt-12 pt-8 border-t border-slate-200 text-center text-slate-500 text-sm">
          <p>
            Last Updated: 2026. This article is for informational purposes. Agency details, rankings, and market position may change. Verify current capabilities directly with each agency before engagement.
          </p>
        </footer>
      </main>
    </article>
  );
}
