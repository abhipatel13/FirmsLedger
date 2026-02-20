'use client';

import React from 'react';
import Link from 'next/link';
import { getDirectoryUrl, createPageUrl } from '@/utils';
import Breadcrumb from '@/components/Breadcrumb';

const AGENCIES = [
  {
    rank: '01',
    badge: 'badge-local',
    badgeLabel: 'Ahmedabad-Based',
    name: 'IMS People Possible',
    tagline: 'Offshore-to-onshore healthcare recruitment powerhouse',
    description: "Headquartered in Makarba, Ahmedabad, IMS People Possible is one of the city's most prominent names in healthcare-linked recruitment. With 20+ years of experience and a workforce of 3,000+ professionals, they support global healthcare staffing companies in the UK and the US while also catering to local hospital recruitment needs. Their 24×7 operations and tech-driven talent matching make them a go-to for scale hiring.",
    specialties: ['ICU Nurses', 'Locum Doctors', 'Allied Health', 'Hospital Admin', 'Offshore Recruitment'],
  },
  {
    rank: '02',
    badge: 'badge-local',
    badgeLabel: 'Gujarat Specialist',
    name: 'PACE – Pacific Asia Consulting Expertise',
    tagline: "Gujarat's dedicated medical recruitment agency",
    description: "PACE is a renowned medical recruitment agency specifically focused on Gujarat's healthcare sector. With a verified network of 400+ hospitals and 1,000+ successful doctor placements, they have become the most trusted name for physician and specialist recruitment in the state. Whether you need a cardiologist, radiologist, or general surgeon, PACE's consultants understand medical credentials deeply and move fast.",
    specialties: ['Physicians & Specialists', 'Surgeons', 'Radiologists', 'Hospital-to-Hospital Hiring'],
  },
  {
    rank: '03',
    badge: 'badge-national',
    badgeLabel: 'National · Local Presence',
    name: 'Hire Glocal',
    tagline: 'Multi-sector staffing with strong healthcare vertical',
    description: "Hire Glocal has built a solid reputation as Ahmedabad's leading multi-sector staffing firm, with a dedicated healthcare and pharmaceutical vertical. They handle executive search, CXO-level healthcare hiring, turnkey recruitment, and interim management for hospitals, diagnostics chains, and pharma companies operating in Gujarat. Ideal for leadership and mid-management healthcare roles.",
    specialties: ['CXO Healthcare Hiring', 'Pharma Staffing', 'Diagnostic Chains', 'Executive Search'],
  },
  {
    rank: '04',
    badge: 'badge-local',
    badgeLabel: 'Ahmedabad-Based',
    name: 'Capacite Global',
    tagline: 'Placement consultancy with healthcare and global talent export',
    description: "Listed among Ahmedabad's Top 10 HR consultancies, Capacite Global provides permanent, temporary, and contract staffing across healthcare, IT, and engineering. Their unique strength is a Talent Export program — connecting Indian healthcare professionals (nurses, paramedics, administrators) with international roles, while also serving local hospitals with end-to-end recruitment support.",
    specialties: ['Nurses & Paramedics', 'International Placements', 'Contract Staffing', 'Healthcare Admin'],
  },
  {
    rank: '05',
    badge: 'badge-national',
    badgeLabel: 'National · Pan-India',
    name: 'ALP Consulting',
    tagline: "India's established healthcare staffing specialist",
    description: "One of India's oldest and most respected healthcare staffing agencies, ALP Consulting maintains an extensive pre-vetted database of nurses, physicians, allied health professionals, and hospital administrators. For Ahmedabad-based hospitals seeking to scale rapidly — particularly during seasonal patient surges or unexpected staff shortages — ALP's contract and permanent staffing solutions offer reliability and speed.",
    specialties: ['Staff Nurses', 'Physicians', 'Temp & Permanent Staffing', 'Elder Care'],
  },
  {
    rank: '06',
    badge: 'badge-national',
    badgeLabel: 'National · Tech-Enabled',
    name: 'YOMA Business Solutions',
    tagline: 'Tech-enabled healthcare staffing with end-to-end support',
    description: "YOMA is a technology-first staffing agency offering tailored healthcare solutions for hospitals, clinics, labs, elder-care facilities, and specialty units. Their AI-assisted screening and onboarding reduces administrative burden significantly, making them a strong choice for hospitals in Ahmedabad that want a modern, digitally-managed staffing partner rather than a traditional consultancy.",
    specialties: ['Labs & Diagnostics', 'Elder Care', 'Specialty Units', 'AI-Assisted Screening'],
  },
  {
    rank: '07',
    badge: 'badge-local',
    badgeLabel: 'Gujarat-Based',
    name: 'TIGI HR',
    tagline: "Gujarat's premier talent acquisition partner",
    description: "TIGI HR has established itself as one of Gujarat's premier recruitment agencies with a strong healthcare and pharmaceutical practice. With deep roots in the regional talent market, they specialize in customized talent acquisition solutions — from ward-level nursing recruitment to senior hospital management hiring. Their local market knowledge makes them particularly effective for Ahmedabad-specific hiring campaigns.",
    specialties: ['Pharma Recruitment', 'Clinical Staff', 'Management Roles', 'Mass Hiring'],
  },
  {
    rank: '08',
    badge: 'badge-local',
    badgeLabel: 'Ahmedabad-Based',
    name: 'Place1India HR Solutions',
    tagline: 'Placement consultancy from entry to exit',
    description: "A well-regarded Ahmedabad placement consultancy, Place1India offers corporate recruitment across healthcare, IT, and industrial sectors. For hospitals seeking cost-effective bulk hiring of nurses, ward staff, and support personnel, their broad database and affordable charges make them a popular choice among mid-sized nursing homes and clinics across Ahmedabad and greater Gujarat.",
    specialties: ['Nursing Staff', 'Ward Attendants', 'Hospital Support Roles', 'Bulk Hiring'],
  },
];

export default function HealthcareStaffingAhmedabadArticle() {
  const healthcareUrl = getDirectoryUrl('healthcare-staffing', { underStaffing: true });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={[{ label: 'Blog', href: createPageUrl('Blogs') }, { label: 'Top Healthcare Staffing Agencies in Ahmedabad' }]} />
        </div>
      </div>

      {/* Header - site theme hero */}
      <header className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block bg-blue-500/90 text-white text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg mb-6">
            Healthcare Recruitment · 2026
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight max-w-3xl">
            Top Healthcare Staffing Agencies in Ahmedabad
          </h1>
          <p className="text-slate-300 text-lg mt-4 max-w-2xl">
            A curated guide to the best medical recruitment partners helping hospitals, clinics, and healthcare facilities in Ahmedabad find top-tier talent.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="border-l-4 border-blue-600 bg-white rounded-r-xl shadow-sm p-6 md:p-8 mb-12">
          <p className="text-slate-600 text-base leading-relaxed">
            Ahmedabad is fast becoming one of India&apos;s most dynamic healthcare hubs — home to <strong className="text-slate-900">Civil Hospital</strong>, one of Asia&apos;s largest public hospitals, and a rapidly growing network of private super-specialty centers. As the city&apos;s medical ecosystem expands, the demand for qualified doctors, nurses, paramedics, and allied health professionals has surged. This is where <strong className="text-slate-900">healthcare staffing agencies</strong> play a critical role — bridging the gap between talent and opportunity at speed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm border-t-4 border-t-blue-600">
            <div className="text-3xl font-extrabold text-blue-600">2.4M</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mt-2">Nursing Shortfall in India by 2026</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm border-t-4 border-t-blue-600">
            <div className="text-3xl font-extrabold text-blue-600">20–60</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mt-2">Days avg. placement via specialist agency</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm border-t-4 border-t-blue-600">
            <div className="text-3xl font-extrabold text-blue-600">35%</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mt-2">Better retention vs. traditional hiring</div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-3">Why Healthcare Staffing Agencies Matter in 2026</h2>
        <p className="text-slate-600 leading-relaxed mb-8">
          Traditional HR teams often lack the specialized knowledge to verify clinical credentials, check NMC/MCI registrations, or assess ACLS/BLS certifications. Healthcare staffing agencies fill this gap — offering pre-vetted, compliant talent within weeks, not months. In Ahmedabad&apos;s competitive medical talent market, the right staffing partner can make or break a hospital&apos;s operational efficiency.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-lg mb-4">🩺</div>
            <h3 className="font-bold text-slate-900 mb-2">Clinical Credential Verification</h3>
            <p className="text-slate-600 text-sm">Agencies handle NMC/MCI checks, experience letter verification, BLS/ACLS certifications, and police clearance — reducing liability for hospitals.</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-lg mb-4">⚡</div>
            <h3 className="font-bold text-slate-900 mb-2">Faster Time-to-Hire</h3>
            <p className="text-slate-600 text-sm">Specialist agencies maintain pre-screened talent pools, cutting placement time from 60–120 days (traditional) to as little as 20 days.</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-lg mb-4">📊</div>
            <h3 className="font-bold text-slate-900 mb-2">Flexible Staffing Models</h3>
            <p className="text-slate-600 text-sm">From locum doctors and contract nurses to permanent executive hires — agencies offer scalable solutions for every staffing need.</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-lg mb-4">🔒</div>
            <h3 className="font-bold text-slate-900 mb-2">Regulatory Compliance</h3>
            <p className="text-slate-600 text-sm">Navigating Gujarat&apos;s healthcare labor laws, shift regulations, and patient-ratio mandates is far easier with a knowledgeable agency partner.</p>
          </div>
        </div>

        <hr className="border-slate-200 my-12" />

        <h2 className="text-2xl font-bold text-slate-900 mb-3">Top Healthcare Staffing Agencies in Ahmedabad (2026)</h2>
        <p className="text-slate-600 leading-relaxed mb-8">
          Below are the leading agencies — both Ahmedabad-based and national firms with strong local presence — that hospitals and clinics in the city rely on today.
        </p>

        <div className="space-y-8">
          {AGENCIES.map((agency) => (
            <div
              key={agency.rank}
              className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow relative"
            >
              <div className="absolute top-6 right-6 text-4xl font-extrabold text-blue-100 hidden md:block">{agency.rank}</div>
              <span className={`inline-block text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded mb-3 ${agency.badge === 'badge-local' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                {agency.badgeLabel}
              </span>
              <h3 className="text-xl font-bold text-blue-600 mb-1">{agency.name}</h3>
              <p className="text-slate-500 text-sm italic mb-4">{agency.tagline}</p>
              <p className="text-slate-600 text-[15px] leading-relaxed mb-4">{agency.description}</p>
              <div className="flex flex-wrap gap-2">
                {agency.specialties.map((spec) => (
                  <span key={spec} className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <hr className="border-slate-200 my-12" />

        <h2 className="text-2xl font-bold text-slate-900 mb-3">How to Choose the Right Agency for Your Hospital</h2>
        <p className="text-slate-600 leading-relaxed mb-4">
          Not all staffing agencies are equal. When evaluating a partner for healthcare recruitment in Ahmedabad, consider these key criteria:
        </p>

        <ul className="space-y-0 border-t border-slate-200">
          <li className="py-4 border-b border-slate-200 pl-8 relative text-slate-600 text-[15px] before:content-['→'] before:absolute before:left-0 before:text-blue-600 before:font-semibold">
            <strong className="text-slate-900">Healthcare Specialization:</strong> Choose an agency that exclusively or primarily works in healthcare — not a general staffing firm dabbling in medical roles.
          </li>
          <li className="py-4 border-b border-slate-200 pl-8 relative text-slate-600 text-[15px] before:content-['→'] before:absolute before:left-0 before:text-blue-600 before:font-semibold">
            <strong className="text-slate-900">Credential Verification Process:</strong> Ask specifically how they verify NMC/MCI registration, ACLS/BLS certifications, and conduct background checks.
          </li>
          <li className="py-4 border-b border-slate-200 pl-8 relative text-slate-600 text-[15px] before:content-['→'] before:absolute before:left-0 before:text-blue-600 before:font-semibold">
            <strong className="text-slate-900">Local Gujarat Network:</strong> Agencies with deep local ties can source passive candidates from Ahmedabad, Gandhinagar, Surat, and Vadodara — giving you a wider talent pool.
          </li>
          <li className="py-4 border-b border-slate-200 pl-8 relative text-slate-600 text-[15px] before:content-['→'] before:absolute before:left-0 before:text-blue-600 before:font-semibold">
            <strong className="text-slate-900">Time-to-Fill Guarantee:</strong> Top agencies should be able to present verified candidates within 20–45 days for most roles. Demand this clarity upfront.
          </li>
          <li className="py-4 border-b border-slate-200 pl-8 relative text-slate-600 text-[15px] before:content-['→'] before:absolute before:left-0 before:text-blue-600 before:font-semibold">
            <strong className="text-slate-900">Flexible Engagement Models:</strong> Ensure they offer contract, temp-to-perm, and permanent hiring — so you can scale staffing up or down with patient volumes.
          </li>
          <li className="py-4 border-b border-slate-200 pl-8 relative text-slate-600 text-[15px] before:content-['→'] before:absolute before:left-0 before:text-blue-600 before:font-semibold">
            <strong className="text-slate-900">Transparent Pricing:</strong> Healthcare permanent staffing typically costs 8–15% of annual CTC. Be wary of hidden charges for onboarding or compliance documentation.
          </li>
          <li className="py-4 pl-8 relative text-slate-600 text-[15px] before:content-['→'] before:absolute before:left-0 before:text-blue-600 before:font-semibold">
            <strong className="text-slate-900">Post-Placement Support:</strong> The best agencies offer a replacement guarantee (typically 30–90 days) if a hired candidate leaves early.
          </li>
        </ul>

        <hr className="border-slate-200 my-12" />

        <h2 className="text-2xl font-bold text-slate-900 mb-3">The Ahmedabad Healthcare Landscape in 2026</h2>
        <p className="text-slate-600 leading-relaxed mb-4">
          Ahmedabad&apos;s Civil Hospital — treating over 1.3 million patients and performing nearly 80,000 surgeries annually — is just the tip of the iceberg. The city is home to a dense network of private hospitals, diagnostic chains, specialty clinics, and pharmaceutical companies, all competing for the same limited pool of skilled medical talent.
        </p>
        <p className="text-slate-600 leading-relaxed mb-12">
          The Gujarat government&apos;s push to expand healthcare infrastructure — including proposed expansions at Civil Hospital that would make it the world&apos;s largest hospital — signals that the demand for healthcare talent will only intensify over the next few years. For HR managers and hospital administrators, building relationships with reliable staffing agencies now is not just smart — it&apos;s essential.
        </p>

        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white rounded-2xl p-8 md:p-10 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to Find the Right Staffing Partner?</h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-6">
            Whether you&apos;re a hospital administrator looking to fill urgent nursing vacancies or a healthcare professional seeking your next career move in Ahmedabad — the agencies listed above are your best starting point.
          </p>
          <Link
            href={healthcareUrl}
            className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all"
          >
            Explore All Agencies →
          </Link>
        </div>
      </main>
    </div>
  );
}
