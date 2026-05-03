'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronDown, MapPin, Building2 } from 'lucide-react';
import { getDirectoryUrl } from '@/utils';
import { getFaqsFor } from '@/lib/categoryFaqs';

const HOURLY_BUCKETS = ['< $25/hr', '$25 - $49/hr', '$50 - $99/hr', '$100 - $149/hr', '$150 - $199/hr', '$200 - $300/hr', '$300+/hr'];
const SIZE_BUCKETS = ['1 - 9', '10 - 49', '50 - 199', '200 - 499', '500 - 999', '1000 - 4999', '10000+'];
const YEAR = new Date().getFullYear();

/* Map free-form team_size strings ("12", "10-50", "Boutique 1-10") into the buckets above. */
function mapTeamSize(raw) {
  if (!raw) return null;
  const s = String(raw).toLowerCase().replace(/,/g, '');
  const nums = (s.match(/\d+/g) || []).map(Number);
  if (!nums.length) return null;
  const n = Math.max(...nums);
  if (n <= 9) return '1 - 9';
  if (n <= 49) return '10 - 49';
  if (n <= 199) return '50 - 199';
  if (n <= 499) return '200 - 499';
  if (n <= 999) return '500 - 999';
  if (n <= 4999) return '1000 - 4999';
  return '10000+';
}

/* Match hourly_rate string to a bucket. SuperbCompanies uses these labels exactly. */
function mapHourlyRate(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  if (HOURLY_BUCKETS.includes(s)) return s;
  // Loose parse: extract first number, classify
  const n = parseInt(s.replace(/[^0-9]/g, ''), 10);
  if (Number.isNaN(n)) return null;
  if (n < 25) return '< $25/hr';
  if (n < 50) return '$25 - $49/hr';
  if (n < 100) return '$50 - $99/hr';
  if (n < 150) return '$100 - $149/hr';
  if (n < 200) return '$150 - $199/hr';
  if (n < 300) return '$200 - $300/hr';
  return '$300+/hr';
}

function modeOf(arr) {
  const counts = {};
  for (const v of arr) {
    if (!v) continue;
    counts[v] = (counts[v] || 0) + 1;
  }
  let best = null, bestN = 0;
  for (const [k, n] of Object.entries(counts)) {
    if (n > bestN) { best = k; bestN = n; }
  }
  return best;
}

function avgBucket(arr) {
  if (!arr.length) return null;
  return modeOf(arr);
}

export default function CategorySEOContent({ category, agencies = [], allCategories = [] }) {
  const [openFaq, setOpenFaq] = useState(0);
  const [openGuide, setOpenGuide] = useState(-1);

  const total = agencies.length;
  const categoryName = category?.name || 'Companies';

  /* ── Aggregates ─────────────────────────────────────── */
  const { byCountry, bySize, popularRate, lowestRate, highestRate, totalWithRate, totalNoRate } = useMemo(() => {
    const countryMap = {};
    const sizeMap = {};
    const allRates = [];

    for (const a of agencies) {
      const country = (a.hq_country || '').trim();
      const rate = mapHourlyRate(a.hourly_rate);
      const sizeBucket = mapTeamSize(a.team_size);

      if (country) {
        if (!countryMap[country]) countryMap[country] = { count: 0, rates: [] };
        countryMap[country].count++;
        if (rate) countryMap[country].rates.push(rate);
      }
      if (sizeBucket) {
        if (!sizeMap[sizeBucket]) sizeMap[sizeBucket] = { count: 0, rates: [] };
        sizeMap[sizeBucket].count++;
        if (rate) sizeMap[sizeBucket].rates.push(rate);
      }
      if (rate) allRates.push(rate);
    }

    const totalWithRate = allRates.length;
    const totalNoRate = total - totalWithRate;

    return {
      byCountry: Object.entries(countryMap)
        .map(([name, v]) => ({ name, count: v.count, popular: avgBucket(v.rates), avg: avgBucket(v.rates) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      bySize: SIZE_BUCKETS
        .filter((b) => sizeMap[b])
        .map((b) => ({ size: b, count: sizeMap[b].count, popular: avgBucket(sizeMap[b].rates), avg: avgBucket(sizeMap[b].rates) })),
      popularRate: avgBucket(allRates) || '$50 - $99/hr',
      lowestRate: allRates.length ? HOURLY_BUCKETS.find((b) => allRates.includes(b)) || '< $25/hr' : '< $25/hr',
      highestRate: allRates.length ? [...HOURLY_BUCKETS].reverse().find((b) => allRates.includes(b)) || '$300+/hr' : '$300+/hr',
      totalWithRate,
      totalNoRate,
    };
  }, [agencies, total]);

  /* ── Related categories: siblings (same parent) ──────── */
  const relatedCategories = useMemo(() => {
    if (!category?.parent_id) return [];
    return allCategories
      .filter((c) => c.parent_id === category.parent_id && c.id !== category.id)
      .slice(0, 9);
  }, [category, allCategories]);

  /* ── Related industries: parent + uncle/aunt parents ─── */
  const relatedIndustries = useMemo(() => {
    return allCategories
      .filter((c) => c.is_parent && c.id !== category?.parent_id)
      .slice(0, 9);
  }, [category, allCategories]);

  /* ── Popular locations: top countries from byCountry ─── */
  const popularLocations = byCountry.slice(0, 9);

  /* ── FAQs: curated per-slug override, fallback to template ───── */
  const faqs = useMemo(() => {
    const curated = getFaqsFor(category?.slug);
    if (curated) return curated;
    // Fallback template — interpolated from category name
    return [
      {
        q: `What is a ${categoryName.toLowerCase()} company?`,
        a: `A ${categoryName.toLowerCase()} company specializes in delivering ${categoryName.toLowerCase()} products and services for businesses. Verified providers on FirmsLedger are evaluated based on client reviews, project portfolios, industry expertise, and pricing transparency.`,
      },
      {
        q: `What services do ${categoryName.toLowerCase()} firms usually provide?`,
        a: `${categoryName} firms typically deliver consulting, project execution, ongoing support, and specialized expertise tailored to your industry. Specific service offerings depend on the firm's size, location, and core specialization. Browse provider profiles above for full service breakdowns.`,
      },
      {
        q: `How can my business benefit from hiring a ${categoryName.toLowerCase()} company?`,
        a: `Hiring a verified ${categoryName.toLowerCase()} firm gives you access to specialized expertise without long-term hiring overhead, faster execution, and proven processes. The right partner reduces risk, accelerates outcomes, and lets your internal team focus on core priorities.`,
      },
      {
        q: `What factors should be considered when choosing a ${categoryName.toLowerCase()} agency?`,
        a: `Evaluate years of experience, client reviews, hourly pricing, team size, industry focus, and case studies. The companies on this page are filtered by location and ranked by verified rating, so you can compare apples to apples.`,
      },
      {
        q: `How do ${categoryName.toLowerCase()} firms assess project success?`,
        a: `Most firms track defined KPIs (deliverable completion, ROI, time-to-value, client satisfaction scores) and provide periodic reports. Ask any provider for sample project metrics before signing.`,
      },
      {
        q: `What is the average cost of services from ${categoryName.toLowerCase()} companies?`,
        a: `Based on our directory data, the most popular hourly rate among ${categoryName.toLowerCase()} firms is ${popularRate}. Pricing varies by location, company size, and project complexity — see the breakdown tables above.`,
      },
    ];
  }, [category?.slug, categoryName, popularRate]);

  if (!category) return null;

  return (
    <section className="bg-white border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">

        {/* ── Reasons to Implement [Category] Strategies ──────────────── */}
        <div className="prose prose-slate max-w-none text-[15px] leading-relaxed">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A2E4A] tracking-tight">
            Reasons to Work With {categoryName} Providers
          </h2>
          <p className="text-slate-700">
            {categoryName} is about removing manual effort from operations and replacing it with reliable,
            measurable processes. The right {categoryName.toLowerCase()} partner combines proven technology,
            domain expertise, and a track record of integrating with your existing systems.
          </p>
          <p className="text-slate-700">
            Today, {categoryName.toLowerCase()} is a decisive factor for back-office productivity. The vendors
            featured here serve organizations at every stage — from startups consolidating their first workflows
            to enterprises modernizing legacy {categoryName.toLowerCase()} stacks.
          </p>
          <p className="text-slate-700"><strong>Common use cases handled by {categoryName.toLowerCase()} firms:</strong></p>
          <ul className="text-slate-700 list-disc pl-6 space-y-1">
            <li>Capture and digitization across email, PDF, and paper sources.</li>
            <li>Workflow automation and approval routing.</li>
            <li>Data extraction with OCR + AI/LLM accuracy tuning.</li>
            <li>ERP, accounting, and finance system integration.</li>
            <li>Compliance, audit trail, and tax authority reporting.</li>
            <li>Reporting, analytics, and exception handling dashboards.</li>
          </ul>
        </div>

        {/* ── Main Benefits ──────────────────────────────────────────── */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A2E4A] tracking-tight mb-5">
            Main Benefits of {categoryName}
          </h2>
          <ul className="text-slate-700 text-[15px] leading-relaxed list-disc pl-6 space-y-2">
            <li><strong>Faster processing.</strong> Automated workflows cut cycle time from days to minutes.</li>
            <li><strong>Lower cost per transaction.</strong> Mature {categoryName.toLowerCase()} platforms reduce manual labor cost by 60–80%.</li>
            <li><strong>Higher accuracy.</strong> Modern AI extraction reaches 95–99% field accuracy after tuning, reducing rework.</li>
            <li><strong>Better compliance.</strong> Built-in audit logs, role-based approvals, and tax-authority integrations protect you during audits.</li>
            <li><strong>Scalability.</strong> Same headcount handles 5–10× more volume during seasonal peaks.</li>
            <li><strong>Real-time visibility.</strong> Dashboards show liabilities, exceptions, and cash flow without manual reporting.</li>
            <li><strong>Vendor-friendly.</strong> Self-service portals reduce inbound support load and accelerate payments.</li>
            <li><strong>ERP integration.</strong> Direct sync with SAP, Oracle, NetSuite, QuickBooks, and Microsoft Dynamics.</li>
          </ul>
        </div>

        {/* ── Pricing of services by location ────────────── */}
        {byCountry.length > 0 && (
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#1A2E4A] tracking-tight text-center mb-2">
              Pricing of {categoryName} Services by Location
            </h3>
            <p className="text-center text-slate-500 text-sm mb-6">
              <span className="inline-block px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold mr-2">Pricing in {YEAR}</span>
              Data current as of: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Country</th>
                    <th className="text-left py-3 px-4 font-semibold">Number of companies</th>
                    <th className="text-left py-3 px-4 font-semibold">% of companies</th>
                    <th className="text-left py-3 px-4 font-semibold">Avg. hourly rate</th>
                    <th className="text-left py-3 px-4 font-semibold">Most popular rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {byCountry.map((row) => (
                    <tr key={row.name} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-[#1A2E4A]">{row.name}</td>
                      <td className="py-3 px-4 text-slate-700">{row.count}</td>
                      <td className="py-3 px-4 text-slate-700">{((row.count / total) * 100).toFixed(2)}%</td>
                      <td className="py-3 px-4 text-slate-700">{row.avg || '—'}</td>
                      <td className="py-3 px-4 text-slate-700">{row.popular || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <StatCard label="Highest hourly rate" value={highestRate} accent="text-[#1A2E4A]" />
              <StatCard label="Lowest hourly rate" value={lowestRate} accent="text-slate-600" />
              <StatCard label="Most popular" value={popularRate} accent="text-blue-600" />
            </div>
          </div>
        )}

        {/* ── Pricing by size of companies ───────────────── */}
        {bySize.length > 0 && (
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#1A2E4A] tracking-tight text-center mb-2">
              Pricing of {categoryName} Services by Company Size
            </h3>
            <p className="text-center text-slate-500 text-sm mb-6">
              <span className="inline-block px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold">Pricing in {YEAR}</span>
            </p>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Employees</th>
                    <th className="text-left py-3 px-4 font-semibold">Number of companies</th>
                    <th className="text-left py-3 px-4 font-semibold">% of companies</th>
                    <th className="text-left py-3 px-4 font-semibold">Avg. hourly rate</th>
                    <th className="text-left py-3 px-4 font-semibold">Most popular rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bySize.map((row) => (
                    <tr key={row.size} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-[#1A2E4A]">{row.size}</td>
                      <td className="py-3 px-4 text-slate-700">{row.count}</td>
                      <td className="py-3 px-4 text-slate-700">{((row.count / total) * 100).toFixed(2)}%</td>
                      <td className="py-3 px-4 text-slate-700">{row.avg || '—'}</td>
                      <td className="py-3 px-4 text-slate-700">{row.popular || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Summary block ──────────────────────────────── */}
        {total > 0 && (
        <div className="prose prose-slate max-w-none text-[15px] leading-relaxed">
          <h3 className="text-xl sm:text-2xl font-bold text-[#1A2E4A] tracking-tight">
            Summary of {categoryName} Companies Rates
          </h3>
          <p className="text-slate-700">
            We analyzed data from <strong>{total}</strong> {categoryName.toLowerCase()} firms{' '}
            {totalWithRate > 0 && (
              <>
                and revealed that <strong>{totalWithRate}</strong> of them disclosed pricing information.{' '}
              </>
            )}
            The data shows that hourly rates for {categoryName.toLowerCase()} services vary depending on the
            company&apos;s location, industry focus, and size.
          </p>
          {byCountry[0] && (
            <p className="text-slate-700">
              <strong>Hourly rate by location.</strong> Companies from {byCountry[0].name} lead in volume with{' '}
              {byCountry[0].count} firms charging an average of {byCountry[0].avg || popularRate}. Pricing varies
              regionally, with the most common bucket overall being {popularRate}.
            </p>
          )}
          {bySize[0] && (
            <p className="text-slate-700">
              <strong>Hourly rate by firm size.</strong> Most {categoryName.toLowerCase()} firms ({bySize[0].count})
              fall in the {bySize[0].size} employee range and charge {bySize[0].popular || popularRate}. Larger
              firms typically charge higher rates due to broader capacity and enterprise contracts.
            </p>
          )}
        </div>
        )}

        {/* ── Choosing the Right Partner: Full Guide ──────────────────── */}
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#1A2E4A] tracking-tight text-center mb-6">
            Choosing the Right {categoryName} Partner: A Full Guide
          </h3>
          <div className="space-y-3 max-w-3xl mx-auto">
            {[
              {
                q: `Which ${categoryName} providers featured here have more than 10 years of experience?`,
                a: `Established ${categoryName.toLowerCase()} firms typically run on enterprise-tier platforms with proven uptime SLAs. Use the year-founded filter on the listing above to surface vendors with 10+ years of operating history and battle-tested integrations.`,
              },
              {
                q: `Which ${categoryName} firms with 1–3 years of experience offer competitive pricing?`,
                a: `Newer ${categoryName.toLowerCase()} entrants frequently offer aggressive launch pricing in the < $25 - $49/hr range. They are a good fit for small teams or pilots where flexibility matters more than long change-management track records.`,
              },
              {
                q: `Which ${categoryName} providers with 10+ years of experience offer the lowest prices?`,
                a: `A small set of established ${categoryName.toLowerCase()} firms run high-volume offshore delivery centers and pass savings on to clients — typically billing < $25 - $49/hr while still offering enterprise-grade SLAs. Look for ISO 27001 / SOC 2 certification before committing.`,
              },
              {
                q: `What questions should I ask before signing with a ${categoryName.toLowerCase()} provider?`,
                a: `Ask about: (1) extraction accuracy on a sample of YOUR documents, (2) pre-built ERP and tax-authority integrations, (3) data residency and SOC 2 / ISO 27001 status, (4) exception-handling UX, (5) onboarding timeline, (6) pricing model (per-document vs. flat SaaS), and (7) typical client time-to-value.`,
              },
            ].map((g, i) => (
              <div
                key={i}
                className={`border rounded-xl overflow-hidden transition-colors ${
                  openGuide === i ? 'border-blue-300 bg-blue-50/30' : 'border-slate-200 bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenGuide(openGuide === i ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-bold text-[#1A2E4A] text-sm sm:text-base">{g.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${openGuide === i ? 'rotate-180' : ''}`} />
                </button>
                {openGuide === i && (
                  <div className="px-5 pb-4 text-slate-600 text-sm leading-relaxed">
                    {g.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Choosing the right partner: FAQ accordion ─── */}
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#1A2E4A] tracking-tight text-center mb-6">
            Frequently Asked Questions
          </h3>
          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((f, i) => (
              <div
                key={i}
                className={`border rounded-xl overflow-hidden transition-colors ${
                  openFaq === i ? 'border-blue-300 bg-blue-50/30' : 'border-slate-200 bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-bold text-[#1A2E4A] text-sm sm:text-base">{f.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-slate-600 text-sm leading-relaxed">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Related Categories ──────────────────────────── */}
        {relatedCategories.length > 0 && (
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#1A2E4A] tracking-tight text-center mb-6">
              Related Categories
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 max-w-4xl mx-auto">
              {relatedCategories.map((c) => (
                <Link
                  key={c.id}
                  href={getDirectoryUrl(c.slug)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline inline-flex items-center gap-1.5"
                >
                  ↳ {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Related Industries ──────────────────────────── */}
        {relatedIndustries.length > 0 && (
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#1A2E4A] tracking-tight text-center mb-6">
              Related Industries
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 max-w-4xl mx-auto">
              {relatedIndustries.map((c) => (
                <Link
                  key={c.id}
                  href={getDirectoryUrl(c.slug)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline inline-flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4" /> {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Popular Locations ───────────────────────────── */}
        {popularLocations.length > 0 && (
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#1A2E4A] tracking-tight text-center mb-6">
              Popular Locations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 max-w-4xl mx-auto">
              {popularLocations.map((loc) => (
                <Link
                  key={loc.name}
                  href={`${getDirectoryUrl(category.slug)}?country=${encodeURIComponent(loc.name)}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline inline-flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" /> {categoryName} Companies in {loc.name}
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

function StatCard({ label, value, accent = 'text-blue-600' }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
      <div className={`text-2xl sm:text-3xl font-extrabold ${accent}`}>{value}</div>
      <div className="text-xs text-slate-500 uppercase tracking-widest mt-2 font-semibold">{label}</div>
    </div>
  );
}
