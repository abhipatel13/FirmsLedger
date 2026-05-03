'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { createPageUrl } from '@/utils';
import Breadcrumb from '@/components/Breadcrumb';

const FEATURED_IMAGE = {
  src: 'https://images.unsplash.com/photo-1519642918688-7e43b19245d8?w=1200&q=85',
  alt: 'Top food distribution companies in the United States 2026 — refrigerated trucks at distribution warehouse',
  width: 1200,
  height: 630,
};

const COMPANIES = [
  {
    rank: 1,
    name: 'Sysco',
    founded: 1969,
    hq: 'Houston, Texas',
    revenue: '~$80.5 billion',
    marketCap: '~$36 billion',
    centers: '333 worldwide',
    fleet: '~14,000 trucks',
    products: 'Full broadline — produce, proteins, dairy, frozen, dry goods, equipment, supplies',
    clients: 'Independent restaurants, chains, healthcare, education, hospitality',
    edge: "Sysco is the undisputed heavyweight of US foodservice distribution, supplying roughly 725,000 customer locations across 90+ countries. Its scale gives it pricing power no competitor matches, and the Sysco Your Way program for independent restaurants — combining a dedicated rep, custom menu costing, and recipe support — has become a category benchmark.",
  },
  {
    rank: 2,
    name: 'US Foods',
    founded: 1989,
    hq: 'Rosemont, Illinois',
    revenue: '~$37.8 billion',
    marketCap: '~$15 billion',
    centers: '70+',
    fleet: '~6,500 trucks',
    products: 'Broadline foodservice with a strong exclusive-brand portfolio',
    clients: 'Independents, regional chains, healthcare, hospitality, education',
    edge: 'US Foods has out-innovated larger rivals on tech-enabled ordering through its MOXē platform, which uses AI to recommend products, flag inventory gaps, and forecast demand. Its Scoop program — a quarterly drop of 30+ chef-developed exclusive items — has become must-watch for menu R&D teams.',
  },
  {
    rank: 3,
    name: 'Performance Food Group (PFG)',
    founded: 1885,
    hq: 'Richmond, Virginia',
    revenue: '~$60 billion',
    marketCap: '~$13 billion',
    centers: '150+',
    fleet: '~8,500 trucks',
    products: 'Broadline foodservice, vending, convenience, theatre concessions',
    clients: 'Restaurants, c-stores, schools, vending operators, movie theatres',
    edge: "PFG's three-headed structure — Foodservice, Vistar (vending and c-store), and Convenience — gives it a footprint inside channels its rivals don't touch. The 2024 acquisition of Cheney Brothers added deep Southeast coverage and elevated PFG into clear #2 territory by combined revenue.",
  },
  {
    rank: 4,
    name: 'McLane Company',
    founded: 1894,
    hq: 'Temple, Texas',
    revenue: '~$55 billion',
    marketCap: 'Private (Berkshire Hathaway)',
    centers: '80+',
    fleet: '~7,000 trucks',
    products: 'Grocery, foodservice, beverage, candy, tobacco, general merchandise',
    clients: '7-Eleven, Yum! Brands, Walmart, thousands of independent c-stores',
    edge: 'McLane is the quiet giant of convenience-store distribution — it touches an estimated 75% of all US c-stores. Berkshire ownership gives it patient capital that competitors with quarterly earnings calls cannot match.',
  },
  {
    rank: 5,
    name: 'Gordon Food Service (GFS)',
    founded: 1897,
    hq: 'Wyoming, Michigan',
    revenue: '~$22 billion',
    marketCap: 'Private (family-owned)',
    centers: '30+',
    fleet: '~3,500 trucks',
    products: 'Broadline foodservice plus 175+ Gordon Food Service Store locations',
    clients: 'Restaurants, schools, healthcare, hospitality across eastern US and Canada',
    edge: 'GFS is the largest privately held foodservice distributor in North America. Customer and employee tenure both beat industry averages by wide margins. Its dual model — B2B distribution plus cash-and-carry retail stores — gives small operators a flexible second supply channel.',
  },
  {
    rank: 6,
    name: 'Dot Foods',
    founded: 1960,
    hq: 'Mt. Sterling, Illinois',
    revenue: '~$13 billion',
    marketCap: 'Private',
    centers: '14',
    fleet: '~1,400 trucks',
    products: 'Redistribution — 132,000+ SKUs from 1,100+ manufacturers',
    clients: 'Other foodservice and retail distributors (Sysco, US Foods, KeHE, regional players)',
    edge: "Dot is the distributor's distributor — a category it essentially invented. It lets manufacturers reach small distributors without breaking case minimums, and lets distributors carry long-tail SKUs without warehousing them. Without Dot Foods, the US specialty food long tail would collapse.",
  },
  {
    rank: 7,
    name: 'United Natural Foods (UNFI)',
    founded: 1996,
    hq: 'Providence, Rhode Island',
    revenue: '~$31 billion',
    marketCap: '~$1.6 billion',
    centers: '50+',
    fleet: '~4,000 trucks',
    products: 'Natural, organic, specialty, fresh produce, conventional grocery',
    clients: 'Whole Foods Market (primary supplier since 1997), independent natural retailers, conventional supermarkets',
    edge: 'UNFI is the largest publicly traded wholesale grocery distributor in North America and the engine room of the US natural and organic channel. Its 2018 Supervalu acquisition added conventional grocery scale, making it one of the few distributors that can serve a Whole Foods and a regional supermarket chain from the same warehouse network.',
  },
  {
    rank: 8,
    name: 'KeHE Distributors',
    founded: 1952,
    hq: 'Naperville, Illinois',
    revenue: '~$8 billion',
    marketCap: 'Private (ESOP, B Corp)',
    centers: '17',
    fleet: '~1,200 trucks',
    products: 'Natural, organic, specialty, fresh, ethnic foods — 75,000+ SKUs',
    clients: 'Sprouts, Wegmans, Publix, Kroger, Amazon, independent grocers',
    edge: "KeHE is the launchpad for emerging brands — its category management team and Trends on Trend shows are where buyers find what's next. Combined with B Corp values and 100% employee ownership, it has become the preferred partner for mission-driven food brands.",
  },
  {
    rank: 9,
    name: 'SpartanNash',
    founded: 1917,
    hq: 'Grand Rapids, Michigan',
    revenue: '~$9.5 billion',
    marketCap: '~$760 million',
    centers: '20+',
    fleet: '~1,500 trucks',
    products: 'Wholesale grocery, fresh, frozen, military commissary distribution',
    clients: 'Independent grocers, regional chains, US military commissaries worldwide',
    edge: 'SpartanNash is the #1 distributor to US military commissaries, supplying bases in 40+ states and overseas — a contract that requires entirely separate logistics, security, and compliance infrastructure most distributors will not build. It also operates 145 corporate-owned grocery stores, giving it real-world insight into independent retail economics.',
  },
  {
    rank: 10,
    name: 'HAVI',
    founded: 1974,
    hq: 'Downers Grove, Illinois',
    revenue: '~$10 billion',
    marketCap: 'Private',
    centers: '100+ globally',
    fleet: 'Partner fleets in 100+ countries',
    products: 'Integrated supply-chain services — sourcing, logistics, packaging, analytics',
    clients: "McDonald's (primary global logistics partner since 1981), other major QSR chains",
    edge: "HAVI is a supply-chain services company that happens to do enormous distribution volumes. Its 40+ year exclusive relationship with McDonald's means HAVI runs one of the most studied, most replicated logistics operations in the world.",
  },
  {
    rank: 11,
    name: "The Chefs' Warehouse",
    founded: 1985,
    hq: 'Ridgefield, Connecticut',
    revenue: '~$3.7 billion',
    marketCap: '~$1.9 billion',
    centers: '40+',
    fleet: '~1,000 trucks',
    products: 'Specialty and gourmet — artisan cheeses, charcuterie, premium proteins, truffles, oils, pastry, imports',
    clients: 'Independent fine-dining restaurants, country clubs, hotels, caterers',
    edge: "Chefs' Warehouse is the go-to for high-end, chef-driven kitchens — its catalogue includes products broadliners do not carry, and its sales reps are typically former chefs themselves. Acquisitions of Allen Brothers (premium beef) and Hardie's (Texas produce) have expanded its specialty footprint without diluting curation.",
  },
  {
    rank: 12,
    name: 'Core-Mark International',
    founded: 1888,
    hq: 'Westlake, Texas',
    revenue: '~$22 billion (within PFG)',
    marketCap: 'Subsidiary of PFG',
    centers: '32 across US and Canada',
    fleet: '~2,500 trucks',
    products: 'Convenience store distribution — packaged foods, beverages, candy, tobacco, fresh',
    clients: 'Circle K, Murphy USA, ARCO, thousands of independent c-stores',
    edge: 'Core-Mark is the only true national alternative to McLane in c-store distribution and a category leader in fresh and healthy options for c-stores — a segment growing far faster than traditional packaged snacks. As a PFG subsidiary, it has access to broadline scale while keeping its specialized c-store playbook intact.',
  },
];

const TRENDS = [
  { title: 'AI & Demand Forecasting', text: 'The biggest distributors moved past simple sales-history forecasting into AI models that ingest weather, local events, social-media signals, traffic data, and reservation platforms to predict demand at SKU-store-day level. US Foods MOXē, Sysco, and PFG machine-learning replenishment systems reduce food waste by 15–25% and out-of-stocks by similar margins.' },
  { title: 'Blockchain Traceability', text: "FDA's Food Safety Modernization Act Rule 204 forces end-to-end traceability for high-risk foods by January 2026. UNFI, KeHE, and Sysco are deploying blockchain ledgers (often built on IBM Food Trust or Hyperledger) that let a head of romaine be traced from field to plate in seconds rather than days." },
  { title: 'Cold Chain Innovation', text: 'Multi-temperature trailers, real-time IoT temperature monitoring, and hydrogen and electric refrigerated fleets are now in production deployment. Sysco committed to 35% electric vehicles by 2030. HAVI piloted hydrogen reefer units in California.' },
  { title: 'E-commerce & Last-Mile Delivery', text: 'Distributors now offer next-day delivery on smaller order sizes, scheduled drop windows, and self-service portals that look more like Amazon than legacy ordering software. Minimum order values are dropping — finally good news for small independents.' },
  { title: 'Sustainability', text: 'Pressure from end consumers, public-company investors, and major chain customers (Walmart, Target, Costco) is pushing distributors to commit to verifiable Scope 1, 2, and 3 emissions reductions. Renewable-energy warehouses, route optimization, recyclable packaging, and food-recovery partnerships with Feeding America are now table stakes.' },
  { title: 'Natural & Organic Growth', text: 'Natural, organic, plant-based, and functional foods continue to grow at 6–9% annually while conventional grocery grows at 1–2%. UNFI and KeHE remain dominant pure-plays, but every broadline distributor has built or acquired a natural-foods division.' },
];

const TIPS = [
  { title: 'Geographic coverage', text: 'Confirm the distributor has a DC within same-day or next-day drive of your location. A great distributor 600 miles away is, in practice, a mediocre distributor.' },
  { title: 'Product range', text: 'Match catalogue depth to your menu or shelf strategy. Broadliners cover 80% of needs; specialists fill the gaps.' },
  { title: 'Minimum order requirements', text: 'Understand the threshold for free delivery and the cost of falling below it. For small operators, a $750 minimum can be the difference between profit and loss on a slow week.' },
  { title: 'Technology platform', text: "Test the ordering system, mobile app, invoice integration, and analytics dashboard. If your team won't use it, the relationship will erode." },
  { title: 'Financial stability', text: 'Public-company distributors publish quarterly earnings; for private players, ask about leverage ratios and credit ratings. A distributor that goes under takes your inventory pipeline with it.' },
  { title: 'Certifications', text: 'SQF, BRCGS, USDA Organic, Non-GMO Project, kosher, halal — match certifications to your customer promises.' },
  { title: 'Customer service model', text: 'Dedicated rep? 24/7 dispatch? Proactive substitution alerts? Service quality is the variable that most often gets cited in distributor switching surveys.' },
  { title: 'Reference checks', text: 'Ask for three operators of similar size in your region. Candid feedback from peers is more valuable than any pitch deck.' },
];

const FAQ_ITEMS = [
  { q: 'Who is the largest food distribution company in the United States?', a: 'Sysco is the largest food distribution company in the United States, with approximately $80.5 billion in annual revenue, 333 distribution centers worldwide, and roughly 725,000 customer locations across 90+ countries.' },
  { q: 'How big is the US food distribution industry?', a: 'The US food distribution market is valued at approximately $991 billion and is projected to cross the trillion-dollar threshold within the next 18 months. It powers every grocery aisle, restaurant kitchen, hospital cafeteria, hotel buffet, and convenience store cooler in America.' },
  { q: 'What is the difference between broadline and specialty food distributors?', a: 'Broadline distributors carry an enormous range — fresh produce, frozen proteins, dairy, dry goods, equipment, paper, chemicals — and serve as one-stop shops (e.g., Sysco, US Foods). Specialty distributors focus on a defined category — natural and organic, ethnic foods, premium proteins, seafood, or convenience-store goods — trading breadth for depth, expertise, and curation.' },
  { q: 'Which food distributor is best for independent restaurants?', a: 'Sysco and US Foods both have programs designed specifically for independent operators. Sysco Your Way provides dedicated reps, custom menu costing, and recipe support. US Foods MOXē and the Scoop program help independents with tech-enabled ordering and chef-developed exclusive items. Gordon Food Service is also strong for small operators thanks to its cash-and-carry stores.' },
  { q: 'Who supplies food to McDonald’s?', a: "HAVI has been McDonald's primary global logistics partner since 1981, running one of the most studied and replicated supply-chain operations in the world. It manages sourcing, logistics, packaging, and analytics for McDonald's restaurants in 100+ countries." },
  { q: 'Who is the main food distributor for Whole Foods?', a: 'United Natural Foods, Inc. (UNFI) has been the primary distributor for Whole Foods Market since 1997. UNFI is the largest publicly traded wholesale grocery distributor in North America and the engine room of the US natural and organic channel.' },
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

const ARTICLE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Top Food Distribution Companies in the United States: The Complete Guide [2026]',
  description: 'A comprehensive guide to the top 12 food distribution companies in the United States for 2026 — Sysco, US Foods, PFG, McLane, Gordon Food Service, Dot Foods, UNFI, KeHE, SpartanNash, HAVI, Chefs Warehouse, and Core-Mark. Industry trends, comparison table, and how to choose the right partner.',
  image: 'https://images.unsplash.com/photo-1519642918688-7e43b19245d8?w=1200&q=85',
  datePublished: '2026-05-02',
  dateModified: '2026-05-02',
  author: { '@type': 'Organization', name: 'FirmsLedger Editorial Team' },
  publisher: {
    '@type': 'Organization',
    name: 'FirmsLedger',
    logo: { '@type': 'ImageObject', url: 'https://www.firmsledger.com/logo.png' },
  },
};

export default function TopFoodDistributionCompaniesUSA2026Article() {
  return (
    <article className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Script id="faq-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(FAQ_JSON_LD)}
      </Script>
      <Script id="article-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(ARTICLE_JSON_LD)}
      </Script>

      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb
            items={[
              { label: 'Blog', href: createPageUrl('Blogs') },
              { label: 'Top Food Distribution Companies USA (2026)' },
            ]}
          />
        </div>
      </div>

      <header className="bg-gradient-to-br from-orange-700 via-amber-700 to-red-800 text-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block bg-amber-400 text-amber-950 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg mb-6">
            Food &amp; Beverage · Distribution · USA · 2026
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight max-w-3xl leading-tight">
            Top Food Distribution Companies in the United States: The Complete Guide [2026]
          </h1>
          <p className="text-amber-50 text-lg mt-5 max-w-2xl leading-relaxed">
            A $991 billion industry — invisible to most consumers, indispensable to every restaurant, grocer, and food brand. Here is the 2026 guide to the 12 distributors that move America&apos;s food.
          </p>
          <div className="flex flex-wrap items-center gap-6 mt-8 text-sm text-amber-100">
            <span>Updated: May 2026</span>
            <span>15 min read</span>
            <span>12 Distributors Reviewed</span>
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

        <section className="mb-12">
          <p className="text-slate-700 text-lg leading-relaxed mb-5">
            Every morning, before most Americans pour their first cup of coffee, a silent army of more than <strong>400,000 trucks</strong> is already moving across the country — carrying produce from California fields to Manhattan delis, frozen seafood from Alaskan ports to Texas steakhouses, and dry goods from Midwestern warehouses to school cafeterias in Florida. By the time you finish breakfast, roughly <strong>1.2 billion meals</strong> will have been served somewhere in the US, and almost none of it would be possible without one of the most overlooked industries in modern commerce.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-5">
            The US food distribution market is now valued at approximately <strong>$991 billion</strong> and is projected to cross the trillion-dollar threshold within the next 18 months. It powers every grocery aisle, restaurant kitchen, hospital cafeteria, hotel buffet, and convenience store cooler in America. Yet ask the average restaurant owner or grocery retailer to name the top five food distribution companies in the United States, and you will often get blank stares.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed">
            That is a problem — because choosing the right distributor (or understanding the leverage your existing one holds) is one of the highest-impact decisions a food business can make. Margins, menu flexibility, food-safety compliance, sustainability claims, and customer experience all flow downstream from this one partnership. This guide breaks down the <strong>top 12 food distribution companies in the United States</strong> for 2026, the trends reshaping the supply chain, and a practical framework for choosing the partner that fits your operation.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">What Is Food Distribution?</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            At its simplest, food distribution is the connective tissue between producers and the businesses that feed Americans. The chain looks like this:
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-5 text-amber-950 font-semibold text-sm">
            Producers (farms, ranches, food manufacturers) → Distributors → Retailers / Restaurants / Institutions → Consumers
          </div>
          <p className="text-slate-600 leading-relaxed mb-4">
            Distributors buy in massive volumes, warehouse the goods in temperature-controlled facilities, break those volumes into smaller commercial-grade orders, and deliver them — often within 24–48 hours — to roughly <strong>1 million US foodservice locations</strong> and <strong>63,000 grocery stores</strong>.
          </p>
          <p className="text-slate-600 leading-relaxed">
            The industry generally splits into two categories. <strong>Broadline distributors</strong> (Sysco, US Foods) carry an enormous range and serve as one-stop shops. <strong>Specialty distributors</strong> focus on a defined category — natural and organic, ethnic foods, premium proteins, seafood, c-store — trading breadth for depth, expertise, and curation. Most operators use a hybrid: a broadline as the backbone and one or two specialists for the products that define their brand.
          </p>
        </section>

        <section className="mb-12" aria-labelledby="top-distributors">
          <h2 id="top-distributors" className="text-2xl font-bold text-slate-900 mb-2">
            Top 12 Food Distribution Companies in 2026
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            Ranked by combined revenue, distribution scale, and category influence.
          </p>
          <div className="divide-y divide-slate-200">
            {COMPANIES.map((c) => (
              <div key={c.rank} className="py-10">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-extrabold text-slate-200 leading-none">#{c.rank}</span>
                  <h3 className="text-2xl font-bold text-slate-900">{c.name}</h3>
                </div>
                <p className="text-slate-500 text-sm mb-4">
                  <strong>Founded:</strong> {c.founded} &nbsp;·&nbsp; <strong>HQ:</strong> {c.hq}
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mb-5">
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Revenue / Market Cap</p>
                    <p className="text-slate-700 text-sm">{c.revenue} &nbsp;·&nbsp; {c.marketCap}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Network</p>
                    <p className="text-slate-700 text-sm">{c.centers} DCs &nbsp;·&nbsp; {c.fleet}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1">Products</p>
                    <p className="text-slate-700 text-sm">{c.products}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Key Clients</p>
                    <p className="text-slate-700 text-sm">{c.clients}</p>
                  </div>
                </div>
                <p className="text-slate-700 text-base leading-relaxed">{c.edge}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Key Industry Trends in 2026</h2>
          <div className="space-y-6">
            {TRENDS.map((trend, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{trend.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{trend.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">How to Choose the Right Food Distributor</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            The right distributor depends entirely on your operation, but the framework below is universal. Shortlist three, run a 90-day pilot with each on a defined product subset, and measure fill rate, on-time delivery, invoice accuracy, and rep responsiveness.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {TIPS.map((tip, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <h3 className="font-bold text-slate-800 mb-2 text-sm">{tip.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{tip.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-5">Comparison Table: Top 12 at a Glance</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">#</th>
                  <th className="text-left px-4 py-3 font-semibold">Company</th>
                  <th className="text-left px-4 py-3 font-semibold">HQ</th>
                  <th className="text-left px-4 py-3 font-semibold">Revenue</th>
                  <th className="text-left px-4 py-3 font-semibold">Specialty</th>
                  <th className="text-left px-4 py-3 font-semibold">Market Cap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  ['1', 'Sysco', 'Houston, TX', '$80.5B', 'Broadline foodservice', '$36B'],
                  ['2', 'US Foods', 'Rosemont, IL', '$37.8B', 'Broadline + tech ordering', '$15B'],
                  ['3', 'Performance Food Group', 'Richmond, VA', '$60B', 'Broadline + c-store + vending', '$13B'],
                  ['4', 'McLane Company', 'Temple, TX', '$55B', 'C-store + QSR distribution', 'Private (Berkshire)'],
                  ['5', 'Gordon Food Service', 'Wyoming, MI', '$22B', 'Broadline + cash-and-carry', 'Private'],
                  ['6', 'Dot Foods', 'Mt. Sterling, IL', '$13B', 'Redistribution', 'Private'],
                  ['7', 'UNFI', 'Providence, RI', '$31B', 'Natural, organic, grocery', '$1.6B'],
                  ['8', 'KeHE Distributors', 'Naperville, IL', '$8B', 'Natural, specialty, emerging', 'Private (ESOP)'],
                  ['9', 'SpartanNash', 'Grand Rapids, MI', '$9.5B', 'Grocery + military commissary', '$760M'],
                  ['10', 'HAVI', 'Downers Grove, IL', '$10B', 'Integrated QSR supply chain', 'Private'],
                  ['11', "Chefs' Warehouse", 'Ridgefield, CT', '$3.7B', 'Specialty / fine dining', '$1.9B'],
                  ['12', 'Core-Mark', 'Westlake, TX', '$22B (in PFG)', 'C-store distribution', 'Subsidiary of PFG'],
                ].map((row, i) => (
                  <tr key={row[1]} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    {row.map((cell, j) => (
                      <td key={j} className={`px-4 py-3 ${j === 1 ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {FAQ_ITEMS.map((faq, i) => (
              <div key={i} className="border-b border-slate-200 pb-6">
                <h3 className="font-bold text-slate-800 mb-2">{faq.q}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12 bg-gradient-to-br from-orange-700 via-amber-700 to-red-800 text-white rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl font-bold mb-4">The Future of Food Distribution</h2>
          <p className="text-amber-50 leading-relaxed mb-4">
            The next five years will redefine what it means to be a food distribution company in the United States. The leaders of 2030 will not simply be the ones with the most trucks or the largest warehouses — they will be the ones who turn data into demand accuracy, blockchain into food-safety advantage, and electrification into both a sustainability story and a long-term cost moat. Consolidation will continue at the top, specialization will deepen at the edges, and the operators who win will be those who build deliberate, multi-distributor strategies rather than defaulting to whoever showed up first.
          </p>
          <p className="text-amber-50 leading-relaxed mb-5">
            If you operate a restaurant, grocery store, c-store, or food brand, take this as a signal: review your distribution partnerships at least once a year. The best distributor for the business you ran in 2023 may not be the best distributor for the business you are running in 2026.
          </p>
          <p className="text-white font-semibold text-lg">
            Start the conversation now — your margins, your menu, and your customers will thank you. 🚛
          </p>
        </section>

        <div className="text-center py-8 border-t border-slate-200">
          <p className="text-slate-600 mb-4 text-lg">
            Looking for verified food &amp; beverage suppliers?
          </p>
          <Link
            href="/directory"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Browse the FirmsLedger Directory
          </Link>
        </div>

      </main>
    </article>
  );
}
