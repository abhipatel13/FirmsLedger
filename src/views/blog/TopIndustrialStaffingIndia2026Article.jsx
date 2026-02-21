'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getDirectoryUrl, createPageUrl } from '@/utils';
import Breadcrumb from '@/components/Breadcrumb';

const FEATURED_IMAGE = {
  src: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=85',
  alt: 'Top Industrial Staffing Companies in India 2026 - blue-collar manufacturing recruitment agencies',
  width: 1200,
  height: 630,
};

const COMPANIES = [
  { rank: 1, rankClass: 'gold', name: 'TeamLease Services Ltd.', badge: "Editor's #1 Pick", tags: ['Industrial Staffing', '600+ Cities', 'Apprenticeship Programs'], description: "TeamLease is India's most trusted industrial staffing company, listed on the NSE and BSE, and having placed over 3 million workers nationwide across 600+ towns and cities in 28 states. In 2026, their manufacturing and industrial division remains unmatched for reach, compliance depth, and workforce scale — making them the go-to partner for any large industrial operation in India.", features: ['Manages 350,000+ associates annually across industrial, manufacturing, and general staffing', "Expert in India's complex Labour Codes — EPF, ESI, professional tax, contract labour compliance", 'Government-linked apprenticeship programs under NAPS for cost-effective skilling', 'Workforce planning reports for manufacturing sector trends (H1/H2 FY26)', 'Payroll outsourcing, skilling programs, and compliance consulting bundled together', 'Serves 3,000+ clients including major OEMs, FMCG giants, and industrial conglomerates'], sectors: ['Automotive', 'FMCG', 'Telecom', 'Retail', 'Manufacturing', 'Logistics'], bestFor: 'Large-scale industrial workforce management & nationwide compliance' },
  { rank: 2, rankClass: 'gold', name: 'Quess Corp Ltd.', badge: 'Largest by Headcount', tags: ['450,000+ Workers', 'General + Industrial'], description: "India's largest staffing company by headcount with 450,000+ employees under management, Quess Corp is a powerhouse for industrial and general labour staffing. Part of the Fairfax Group, Quess offers end-to-end workforce management including facility management, shopfloor staffing, and payroll processing for India's industrial sector.", features: ["India's largest employer — accounts for ~1.4% of all new EPFO registrations nationally", 'End-to-end workforce management: staffing, payroll, facility management, technology HR', 'Strong in shopfloor staffing, assembly line workers, machine operators, and material handling', 'Post-demerger, runs a more focused and agile talent platform for industrial clients', 'Serves 2,000+ industrial clients across retail, BFSI, telecom, and manufacturing'], sectors: ['Manufacturing', 'Facility Mgmt', 'Retail', 'Healthcare', 'Oil & Gas'], bestFor: 'High-volume industrial hiring & facility workforce management' },
  { rank: 3, rankClass: 'silver', name: 'Innovsource Services Pvt. Ltd.', badge: 'Blue-Collar Specialist', tags: ['Grey-Collar Ready', '2+ Decades Experience'], description: "Innovsource is one of India's most recognized specialists in blue-collar and grey-collar industrial workforce solutions. With over two decades of experience and AI-powered deployment systems, Innovsource can place a blue-collar worker in 48–72 hours — compared to 14+ days for in-house teams. Their \"Grey-Collar\" workforce model is purpose-built for the future of India's factory floor.", features: ['48–72 hour deployment for blue-collar positions using AI matching and WhatsApp bots', 'Pioneering the "Grey-Collar" model — workers with both manual and digital skills', 'End-to-end services: permanent recruitment, facility management, managed services, apprentice hiring', 'Assumes full legal liability for PF, ESIC, and labour law compliance on behalf of clients', 'Upskills workers via NAPS and private programs before deployment', 'Strong elastic staffing model for peak-demand logistics and e-commerce operations'], sectors: ['E-commerce', 'Logistics', 'Retail', 'FMCG', 'Manufacturing'], bestFor: 'Fast-turn blue-collar deployment & grey-collar workforce evolution' },
  { rank: 4, rankClass: 'silver', name: 'Randstad India', badge: null, tags: ['Global Standards', 'Engineering & Mfg', 'Multinational-Friendly'], description: "The Indian arm of Randstad — one of the world's largest HR companies — brings international hiring standards to India's industrial sector. Particularly powerful for automotive, chemical, and heavy engineering companies with multinational operations requiring cross-border compliance and workforce consistency.", features: ['Permanent, temporary, and contract staffing for industrial and engineering verticals', 'Deep specialization in automotive supply chain, chemical processing, and heavy manufacturing', 'Global compliance protocols aligned with international employment norms', 'Assessment-based hiring with psychometric and skill tests for industrial roles', 'Talent-centric approach combining recruitment and workforce consulting'], sectors: ['Automotive', 'Chemical', 'Engineering', 'BFSI', 'Manufacturing'], bestFor: 'Multinational industrial companies with cross-border compliance needs' },
  { rank: 5, rankClass: 'silver', name: 'GI Group India', badge: 'Fastest Growing', tags: ['360° Service Model', 'European MNC Favourite'], description: "GI Group is one of the world's fastest-growing industrial staffing firms, and its India operations have rapidly expanded through a distinctive \"360-degree\" service model. Their deep expertise in automotive and chemical sectors, combined with localized labour-relations management, makes them the preferred partner for European industrial companies entering India.", features: ['Full-cycle industrial recruitment from shopfloor workers to plant supervisors', 'Specializes in automotive assembly, chemical processing, and precision engineering', 'Handles complex labour relations for unionized plants and large factories', 'Localized insights for managing state-specific compliance and regional labour markets', 'Customized, industry-specific talent strategies for each engagement'], sectors: ['Automotive', 'Chemical', 'Pharma', 'Engineering'], bestFor: 'European industrial MNCs & automotive/chemical sector hiring' },
  { rank: 6, rankClass: 'bronze', name: 'Weavings Manpower Solutions (Planet Group)', badge: null, tags: ['Oil & Gas', 'Warehouse & Logistics', 'End-to-End Solutions'], description: 'Operating under the Planet Group umbrella, Weavings Manpower Solutions has built a strong reputation for providing industrial workforce across some of India\'s most demanding sectors — including Oil & Gas, Logistics & Warehousing, and E-commerce. Their end-to-end HR management platform covers everything from recruitment to payroll to compliance.', features: ['Provides both permanent and temporary staffing with full payroll management services', 'Strong delivery capability in Oil & Gas, Logistics, and Warehouse Management', 'Covers E-commerce last-mile and manufacturing assembly operations', 'Competitive people management systems for volume industrial hiring', 'Served diverse industrial clients across multiple Indian states'], sectors: ['Oil & Gas', 'Warehousing', 'E-commerce', 'Manufacturing', 'Logistics'], bestFor: 'Oil & Gas, logistics, and warehouse workforce management' },
  { rank: 7, rankClass: 'bronze', name: 'CIEL HR Services', badge: 'AI-Powered', tags: ['50+ Locations', 'Automobile & FMCG'], description: 'A rapidly growing, technology-first staffing company, CIEL HR uses AI-powered candidate matching for industrial and manufacturing roles. Founded by industry veterans and backed by in-house algorithms, CIEL has a growing presence in 50+ Indian locations — with particular strength in automobile manufacturing and FMCG sector staffing.', features: ['AI-powered matching platform for faster, more accurate industrial role placement', 'Project-based hiring for seasonal production ramp-ups and new line commissioning', 'Covers blue-collar, grey-collar, and mid-level manufacturing professionals', 'Full HR process outsourcing: onboarding to payroll to exit formalities', 'Strong industry-spanning coverage from shopfloor to supervisory levels'], sectors: ['Automobile', 'FMCG', 'Healthcare', 'Manufacturing'], bestFor: 'Technology-enabled industrial hiring with AI-driven accuracy' },
  { rank: 8, rankClass: null, name: 'ManpowerGroup India', badge: null, tags: ['Hire-Train-Deploy', 'Engineering Roles', 'Global Firm'], description: 'ManpowerGroup brings global industrial workforce expertise to India with a powerful Hire-Train-Deploy (HTD) model that makes them especially valuable for manufacturers setting up new facilities or needing job-ready workers in specialized engineering domains.', features: ['Hire-Train-Deploy model reduces time-to-productivity for complex industrial roles', 'Strong in engineering, infrastructure, and technical manufacturing roles', 'Permanent recruitment, temporary staffing, and talent-based outsourcing (TBO)', "Compliance-ready model aligned with India's new Labour Codes", 'Global reach benefits MNCs setting up Indian manufacturing operations'], sectors: ['Engineering', 'Infrastructure', 'Manufacturing', 'Finance'], bestFor: 'New facility ramp-ups requiring trained industrial workers' },
  { rank: 9, rankClass: null, name: 'Kelly Services India', badge: null, tags: ['Engineering Specialists', 'Life Sciences', 'Technical Roles'], description: 'Kelly Services is a global staffing leader with significant depth in engineering, manufacturing, and life sciences staffing in India. Their strength lies in placing technical and specialized industrial professionals — from quality engineers and maintenance technicians to production supervisors and EHS specialists.', features: ['Deep technical expertise in engineering, manufacturing, and life sciences domains', 'Strong in placing QA/QC engineers, maintenance technicians, and plant supervisors', 'Workforce solutions for production and education sectors across India', 'Global compliance protocols for Indian and multinational industrial clients', 'Decades of experience in specialized industrial recruitment'], sectors: ['Engineering', 'Life Sciences', 'Manufacturing', 'Technology'], bestFor: 'Specialized engineering and technical industrial roles' },
  { rank: 10, rankClass: null, name: 'YOMA Business Solutions', badge: 'Tech-Driven', tags: ['Multi-Sector', 'Scalable Platform'], description: 'Based in Gurugram, YOMA is a fast-rising industrial and general staffing platform that combines technology with strong domain knowledge. Their scalable model covers the entire talent lifecycle — from recruitment and onboarding to payroll and compliance — and serves manufacturing, healthcare, retail, and BFSI clients nationwide.', features: ['Technology-driven platform for scalable industrial and general workforce solutions', 'Covers full talent lifecycle: recruitment → onboarding → payroll → compliance', 'Shortens hiring cycles with AI-enabled screening and digital onboarding', 'Customizable talent strategies for businesses of all sizes', 'Particularly strong in northern India (Gurugram, Delhi NCR) industrial corridor'], sectors: ['Manufacturing', 'Retail', 'Healthcare', 'BFSI'], bestFor: 'Growing businesses needing scalable, tech-first staffing' },
];

const SECTOR_ROWS = [
  { sector: 'Automotive / EV', agencies: 'GI Group, Randstad India, CIEL HR', roles: 'Assembly operators, QA engineers, tooling technicians' },
  { sector: 'Manufacturing / FMCG', agencies: 'TeamLease, Quess Corp, CIEL HR', roles: 'Shopfloor workers, packaging staff, machine operators' },
  { sector: 'Logistics / Warehousing', agencies: 'Innovsource, Weavings, Quess Corp', roles: 'Warehouse staff, forklift operators, delivery associates' },
  { sector: 'Chemical / Pharma', agencies: 'GI Group, Randstad India, Kelly Services', roles: 'Lab technicians, process operators, EHS specialists' },
  { sector: 'Construction / Infrastructure', agencies: 'TeamLease, ManpowerGroup, Weavings', roles: 'Civil workers, electricians, welders, riggers' },
  { sector: 'Electronics / Semiconductors', agencies: 'TeamLease, Randstad India, Kelly Services', roles: 'PCB assembly, quality inspectors, test technicians' },
  { sector: 'Oil & Gas / Energy', agencies: 'Weavings, Kelly Services, ManpowerGroup', roles: 'Instrumentation engineers, pipefitters, HSE officers' },
  { sector: 'E-commerce / Retail', agencies: 'Innovsource, Quess Corp, YOMA', roles: 'Pickers, packers, delivery executives, store staff' },
];

const CHECKLIST = [
  { title: 'Sector Specialization', text: 'Confirm the agency has recruiters who understand your specific industry — whether automotive, pharma, logistics, or construction. Generic agencies often struggle with technical role requirements.' },
  { title: 'Geographic Reach', text: "India's industrial corridors span Tamil Nadu, Maharashtra, Gujarat, Karnataka, and Andhra Pradesh. Ensure your agency operates in your plant locations and surrounding talent catchment areas." },
  { title: 'Compliance Infrastructure', text: "Under India's Labour Codes, contract workers must be properly covered for EPF, ESIC, and gratuity. Ask for specifics on how the agency manages statutory compliance and assumes legal liability." },
  { title: 'Deployment Speed', text: 'For industrial operations, time-to-deploy is critical. Leading agencies can place blue-collar workers in 48–72 hours. Anything over 10 days for contract workers is a red flag.' },
  { title: 'Pre-Screening Standards', text: 'Verify their background verification, safety certifications, and skill assessment protocols. For hazardous industrial environments, this is non-negotiable.' },
  { title: 'Skilling Capabilities', text: 'Top agencies offer in-house or government-linked skilling programs (NAPS, PMKVY) to train workers before deployment — reducing your onboarding burden.' },
  { title: 'Attrition Management', text: 'Blue-collar attrition in India exceeds 25% annually in some sectors. Ask what retention programs, bench strength, and replacement guarantees the agency offers.' },
  { title: 'Pricing Model Clarity', text: 'Contract industrial staffing typically runs at a monthly mark-up of ₹3,000–₹10,000 per worker above base wages. Ensure full cost transparency including PF, ESIC, and statutory contributions.' },
];

const TRENDS = [
  { title: 'Grey-Collar is the New Blue-Collar', text: "India's factory workforce is evolving. Workers now need both manual skills and digital literacy. Communication skills (89%) and basic computer proficiency (81%) have become the top manufacturing hiring priorities in FY26, according to TeamLease EOR data." },
  { title: 'PLI-Driven Demand Surge', text: "India's Production Linked Incentive schemes have attracted over ₹2 lakh crore in commitments — creating commissioning-paced waves of industrial hiring in EVs, electronics, semiconductors, and renewables." },
  { title: 'China+1 Manufacturing Boom', text: 'Global companies diversifying away from China are setting up in Maharashtra, Tamil Nadu, Karnataka, and Gujarat — creating sudden, high-volume demand for skilled industrial workers and engineering talent.' },
  { title: 'AI-Powered Deployment', text: 'Leading agencies now use WhatsApp bots and AI matching to source and deploy blue-collar workers in under 72 hours — compressing a process that once took 2–3 weeks.' },
  { title: 'Electronics Manufacturing Explosion', text: 'Projections indicate 5–6 million new electronics manufacturing jobs will emerge by 2026, primarily in semiconductor, mobile phone, and PCB assembly clusters in Tamil Nadu, Telangana, and Uttar Pradesh.' },
  { title: 'Gig & Flex Workforce Normalization', text: 'Industrial companies are increasingly using elastic staffing models to handle peak production runs, seasonal demand spikes, and rapid scale-down without legal liability.' },
];

const FAQ = [
  { q: 'What is industrial staffing in India?', a: "Industrial staffing refers to the recruitment, deployment, and management of workers in manufacturing, logistics, construction, automotive, chemical, oil & gas, and other industrial sectors. This includes blue-collar shopfloor workers, grey-collar technicians, and skilled industrial professionals. Agencies manage sourcing, training, payroll, and compliance on behalf of the client company." },
  { q: 'Which is the best industrial staffing company in India in 2026?', a: "TeamLease Services ranks #1 for industrial staffing in India in 2026 due to its unmatched national reach (600+ cities, 28 states), compliance infrastructure, and scale (350,000+ associates). For blue-collar speed, Innovsource's 72-hour deployment model is unmatched. For automotive/chemical MNCs, GI Group and Randstad India are the strongest choices." },
  { q: 'What is the difference between blue-collar and grey-collar staffing?', a: "Blue-collar workers perform manual, physical labour — assembly line operators, welders, loaders, fitters. Grey-collar workers are an emerging hybrid category who combine manual skills with digital proficiency — operating computerized machinery, using digital production management tools, or maintaining automated systems. In 2026, most industrial hiring in India is shifting toward grey-collar profiles." },
  { q: 'How much does industrial staffing cost in India?', a: 'Industrial contract staffing typically involves a monthly mark-up of ₹3,000–₹10,000 per worker above their base wage, covering the agency\'s costs for payroll administration, EPF, ESIC, professional tax, and compliance management. Permanent placement fees for skilled industrial professionals are typically 8–15% of annual CTC.' },
  { q: 'How quickly can an industrial staffing agency deploy workers in India?', a: "Top agencies like Innovsource can deploy pre-screened blue-collar workers in 48–72 hours using AI-driven matching and WhatsApp-based onboarding. Standard contract worker placement takes 5–10 days. Skilled industrial professional placement (permanent) typically requires 3–6 weeks depending on specialization and location." },
  { q: 'Which cities in India are best for industrial hiring?', a: "India's top industrial hiring corridors in 2026 are: Pune & Mumbai (automotive, capital goods, engineering), Chennai & Coimbatore (automotive, FMCG, engineering components), Bengaluru (aerospace, electronics, EV), Ahmedabad & Surat (chemicals, pharmaceuticals, textiles), and Hyderabad & Vishakhapatnam (semiconductors, pharma, heavy engineering)." },
];

export default function TopIndustrialStaffingIndia2026Article() {
  const industrialUrl = getDirectoryUrl('industrial-staffing', { underStaffing: true });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={[{ label: 'Blog', href: createPageUrl('Blogs') }, { label: 'Top Industrial Staffing Companies in India 2026' }]} />
        </div>
      </div>

      <header className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
            ⚙️ Updated February 2026
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight max-w-3xl">
            Top Industrial Staffing Companies in <span className="text-amber-300">India</span> for 2026
          </h1>
          <p className="text-slate-300 text-lg mt-4 max-w-2xl">
            A definitive guide to India&apos;s best industrial workforce and recruitment agencies — covering manufacturing, logistics, construction, automotive, and blue-collar hiring in 2026.
          </p>
          <div className="flex flex-wrap items-center gap-6 mt-8 text-sm text-slate-400">
            <span>📅 February 20, 2026</span>
            <span>⏱ 9 min read</span>
            <span>🏭 10 Agencies Reviewed</span>
            <span>🔧 Manufacturing + Blue-Collar Focus</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2">
        <figure className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white">
          <Image src={FEATURED_IMAGE.src} alt={FEATURED_IMAGE.alt} width={FEATURED_IMAGE.width} height={FEATURED_IMAGE.height} className="w-full h-auto object-cover" sizes="(max-width: 896px) 100vw, 896px" priority />
          <figcaption className="sr-only">{FEATURED_IMAGE.alt}</figcaption>
        </figure>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="border-l-4 border-amber-500 bg-amber-50/50 rounded-r-xl p-6 mb-12">
          <p className="text-slate-700 text-base leading-relaxed">
            <strong className="text-slate-900">2026 Market Snapshot:</strong> India&apos;s industrial staffing sector is at an inflection point. Driven by PLI-scheme investments exceeding <strong>₹2 lakh crore</strong>, a surging China+1 manufacturing strategy, and EV & semiconductor sector expansion, demand for industrial and blue-collar talent has never been higher. McKinsey projects that <strong>70% of India&apos;s 90 million new jobs by 2030 will be blue-collar roles</strong> — making the right industrial staffing partner a critical business decision, not just an HR one.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          {[
            { val: '₹2L Cr+', lab: 'PLI investment commitments driving industrial hiring' },
            { val: '450M+', lab: "Blue-collar workforce in India's economy" },
            { val: '7.7%', lab: 'Manufacturing GDP growth in Q2 FY26' },
            { val: '48 hrs', lab: 'Top agency deployment time for blue-collar roles' },
            { val: '5–6M', lab: 'New electronics mfg jobs projected by 2026' },
            { val: '$18.5B', lab: 'India staffing market valuation (2025)' },
          ].map((stat) => (
            <div key={stat.val} className="bg-white border border-slate-200 rounded-xl p-5 text-center shadow-sm border-t-4 border-t-amber-500">
              <div className="text-2xl font-extrabold text-amber-600">{stat.val}</div>
              <div className="text-xs text-slate-500 mt-1">{stat.lab}</div>
            </div>
          ))}
        </div>

        <p className="text-slate-600 leading-relaxed mb-12">
          Whether you run a manufacturing plant in Pune, a logistics hub in Chennai, or an infrastructure project in Gujarat, finding skilled industrial workers quickly and compliantly is a growing challenge. The companies below represent India&apos;s finest industrial staffing partners for 2026 — evaluated on sector depth, geographic reach, compliance capabilities, and workforce management quality.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mb-6">🏆 Top Industrial Staffing Companies in India for 2026</h2>

        <div className="space-y-8">
          {COMPANIES.map((co) => (
            <div key={co.rank} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-wrap gap-4 items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border-2 flex-shrink-0 ${co.rankClass === 'gold' ? 'border-amber-500 text-amber-600 bg-amber-50' : co.rankClass === 'silver' ? 'border-slate-400 text-slate-600 bg-slate-50' : co.rankClass === 'bronze' ? 'border-amber-700 text-amber-700 bg-amber-50/50' : 'border-slate-200 text-slate-500 bg-slate-50'}`}>
                  #{co.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-900">{co.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {co.badge && <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded">{co.badge}</span>}
                    {co.tags.map((t) => <span key={t} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded">{t}</span>)}
                  </div>
                </div>
              </div>
              <p className="text-slate-600 text-[15px] leading-relaxed mb-4">{co.description}</p>
              <ul className="space-y-2 mb-4">
                {co.features.map((f) => (
                  <li key={f} className="text-slate-600 text-sm flex gap-2">
                    <span className="text-amber-500 flex-shrink-0">▸</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
                <span className="text-slate-500 text-xs font-semibold">Key Sectors:</span>
                {co.sectors.map((s) => <span key={s} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded border border-slate-200">{s}</span>)}
              </div>
              <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg py-2 px-4 text-sm text-blue-800 font-medium">
                ✦ Best For: {co.bestFor}
              </div>
            </div>
          ))}
        </div>

        <hr className="border-slate-200 my-12" />

        <h2 className="text-2xl font-bold text-slate-900 mb-4">🏭 Which Agency for Which Industrial Sector?</h2>
        <p className="text-slate-600 mb-6">Not every agency is strong in every sector. Use this table to quickly identify which company is best matched to your industry:</p>
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm mb-12">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-amber-50 border-b border-amber-200">
                <th className="text-left py-3 px-4 font-bold text-amber-800">Industrial Sector</th>
                <th className="text-left py-3 px-4 font-bold text-amber-800">Top Recommended Agencies</th>
                <th className="text-left py-3 px-4 font-bold text-amber-800">Key Roles Filled</th>
              </tr>
            </thead>
            <tbody>
              {SECTOR_ROWS.map((row) => (
                <tr key={row.sector} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-800">{row.sector}</td>
                  <td className="py-3 px-4 text-slate-600">{row.agencies}</td>
                  <td className="py-3 px-4 text-slate-600">{row.roles}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-4">🔎 How to Choose the Right Industrial Staffing Partner</h2>
        <p className="text-slate-600 mb-6">Industrial staffing is more specialized than general white-collar recruitment. Workers are deployed on production lines, in warehouses, or on construction sites — mistakes in hiring have direct safety and productivity consequences. Here is what to evaluate:</p>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-12">
          <h3 className="font-bold text-slate-900 mb-4">Your Industrial Staffing Evaluation Checklist</h3>
          <ul className="space-y-4">
            {CHECKLIST.map((item) => (
              <li key={item.title} className="flex gap-3 text-slate-600 text-sm">
                <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                <span><strong className="text-slate-800">{item.title}:</strong> {item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-4">📊 Key Industrial Staffing Trends in India for 2026</h2>
        <p className="text-slate-600 mb-6">The industrial workforce landscape in India is evolving rapidly. These are the most important trends shaping hiring in 2026:</p>
        <ul className="space-y-4 mb-12">
          {TRENDS.map((t) => (
            <li key={t.title} className="flex gap-3 text-slate-600 text-sm">
              <span className="text-amber-500 font-bold flex-shrink-0">↗</span>
              <span><strong className="text-slate-800">{t.title}:</strong> {t.text}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mb-6">❓ Frequently Asked Questions</h2>
        <div className="space-y-6 mb-12">
          {FAQ.map((faq, i) => (
            <div key={i} className="border-b border-slate-200 pb-4">
              <p className="font-bold text-slate-900 mb-2">Q{i + 1}: {faq.q}</p>
              <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white rounded-2xl p-8 md:p-10 text-center">
          <h2 className="text-2xl font-bold mb-3">⚙️ Ready to Build Your Industrial Workforce in India?</h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-6">
            India&apos;s industrial staffing market is one of the most dynamic and opportunity-rich in the world. Whether you&apos;re scaling a manufacturing plant, managing seasonal logistics demand, or building a new EV assembly operation, the agencies listed above are equipped to deliver compliant, skilled, and deployable industrial talent — faster than you can hire in-house.
          </p>
          <Link href={industrialUrl} className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-all">
            Explore Industrial Staffing →
          </Link>
        </div>
      </main>
    </div>
  );
}
