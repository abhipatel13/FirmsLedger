'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { getDirectoryUrl, createPageUrl } from '@/utils';
import Breadcrumb from '@/components/Breadcrumb';

const FEATURED_IMAGE = {
  src: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&q=85',
  alt: 'Best specialty chemical companies in Australia for manufacturing 2026 - industrial chemical facility',
  width: 1200,
  height: 630,
};

const COMPANIES = [
  {
    rank: 1,
    name: 'Orica Limited',
    badge: 'AUSTRALIA\'S LARGEST SPECIALTY CHEMICAL COMPANY',
    tags: ['ASX LISTED', 'MINING', 'EXPLOSIVES', 'GLOBAL'],
    founded: 1874,
    hq: 'Melbourne, VIC',
    overview:
      'Orica is Australia\'s largest specialty chemical and explosives manufacturer, and one of the largest in the world. Originally founded as the Australian branch of Nobel Industries, Orica today supplies commercial explosives, blasting systems, and specialty mining chemicals to customers across mining, quarrying, oil and gas, and construction sectors in over 100 countries. Its Minova brand provides geotechnical and ground support solutions, while its environmental solutions division addresses water treatment and remediation. Orica holds ISO 9001, ISO 14001, and ISO 45001 certifications, and operates advanced manufacturing plants across New South Wales, Victoria, and Queensland. For procurement managers in heavy industry, Orica represents unmatched scale, supply reliability, and technical depth in specialty explosives chemistry.',
    industries: ['Mining & Resources', 'Quarrying', 'Oil & Gas', 'Construction'],
    certifications: ['ISO 9001', 'ISO 14001', 'ISO 45001'],
    website: 'orica.com',
  },
  {
    rank: 2,
    name: 'Nufarm Limited',
    badge: 'LEADING AGRICULTURAL SPECIALTY CHEMICALS',
    tags: ['ASX LISTED', 'AGRICULTURE', 'CROP PROTECTION', 'GLOBAL'],
    founded: 1956,
    hq: 'Laverton North, VIC',
    overview:
      'Nufarm is one of Australia\'s most recognised specialty chemical companies, specialising in crop protection products including herbicides, fungicides, insecticides, and seed treatments. Listed on the ASX, the company operates manufacturing facilities across Australia, Europe, and North America, and exports to more than 100 countries. Nufarm\'s manufacturing operations are registered with the Australian Pesticides and Veterinary Medicines Authority (APVMA) and the company maintains rigorous GMP (Good Manufacturing Practice) standards across its production lines. Its Omega-3 canola programme further extends its chemistry expertise into nutritional and specialty ingredient manufacturing. For agribusiness procurement teams seeking APVMA-compliant crop protection chemistry, Nufarm is the dominant domestic supplier.',
    industries: ['Agriculture', 'Food Processing', 'Crop Protection', 'Seed Treatment'],
    certifications: ['APVMA Registered', 'GMP', 'ISO 9001'],
    website: 'nufarm.com',
  },
  {
    rank: 3,
    name: 'DGL Group',
    badge: 'INTEGRATED SPECIALTY CHEMICAL LOGISTICS & DISTRIBUTION',
    tags: ['ASX LISTED', 'DANGEROUS GOODS', 'BLENDING', 'DISTRIBUTION'],
    founded: 2005,
    hq: 'Ingleburn, NSW',
    overview:
      'DGL Group is a vertically integrated specialty chemical manufacturer, blender, and distributor with operations across Australia and New Zealand. The company specialises in hazardous chemicals — managing the full supply chain from manufacturing and blending through to warehousing and compliant distribution. DGL serves customers in mining, agriculture, food processing, water treatment, and industrial manufacturing. The company operates AICIS-registered facilities and maintains strict dangerous goods compliance across its 40+ sites. DGL\'s value proposition is unique: it combines chemical manufacturing with licensed dangerous goods logistics, reducing complexity for buyers who source, store, and distribute specialty chemicals. For mid-market manufacturers seeking a single-source partner, DGL is one of Australia\'s most capable operators.',
    industries: ['Mining', 'Agriculture', 'Food Processing', 'Water Treatment', 'Industrial Manufacturing'],
    certifications: ['AICIS Registered', 'Dangerous Goods Licensed', 'ISO 9001'],
    website: 'dglgroup.com.au',
  },
  {
    rank: 4,
    name: 'Chem-Supply Pty Ltd',
    badge: 'LARGEST INDEPENDENT CHEMICAL DISTRIBUTOR',
    tags: ['LABORATORY', 'INDUSTRIAL', 'PHARMA GRADE', 'NATIONAL'],
    founded: 1886,
    hq: 'Port Adelaide, SA',
    overview:
      'Chem-Supply is one of Australia\'s oldest and most trusted specialty chemical companies, having supplied laboratory, industrial, food-grade, and pharmaceutical-grade chemicals to Australian manufacturers since 1886. Operating from its manufacturing and distribution headquarters in Port Adelaide, Chem-Supply maintains warehouses in every Australian state, ensuring rapid delivery to regional and metropolitan customers alike. The company supplies over 3,000 products including solvents, acids, bases, salts, specialty reagents, and food-grade chemicals. Its laboratory chemicals division is a preferred supplier to universities, hospitals, and research institutions. Chem-Supply holds AICIS registration and GMP certification for its pharmaceutical-grade products, making it a versatile partner for buyers needing both industrial and regulated-grade chemistry.',
    industries: ['Pharmaceutical', 'Food & Beverage', 'Laboratory & Research', 'Industrial Manufacturing', 'Education'],
    certifications: ['AICIS Registered', 'GMP', 'ISO 9001'],
    website: 'chemsupply.com.au',
  },
  {
    rank: 5,
    name: 'Dulux Group (Nippon Paint)',
    badge: 'LEADING PAINTS & COATINGS SPECIALTY CHEMIST',
    tags: ['COATINGS', 'ADHESIVES', 'CONSTRUCTION', 'CONSUMER & INDUSTRIAL'],
    founded: 1918,
    hq: 'Clayton, VIC',
    overview:
      'The Dulux Group, now a subsidiary of Nippon Paint Holdings, is Australia\'s premier manufacturer of specialty paints, coatings, and adhesives. Its manufacturing operations in Clayton (VIC), Rocklea (QLD), and other Australian sites produce architectural coatings, industrial protective coatings, marine coatings, and specialty adhesives under brands including Dulux, Cabot\'s, Selleys, and Berger. For industrial buyers, the Dulux Protective Coatings division supplies high-performance anti-corrosion systems used in infrastructure, mining, and heavy manufacturing. Products are developed to comply with Australian standards (AS/NZS), and the company\'s technical teams provide specification and application support. ISO 9001 and ISO 14001 certified, Dulux remains the benchmark supplier for specialty coating chemistry in Australia.',
    industries: ['Construction', 'Mining & Infrastructure', 'Marine', 'Consumer Manufacturing', 'Oil & Gas'],
    certifications: ['ISO 9001', 'ISO 14001', 'AS/NZS Compliant'],
    website: 'duluxgroup.com.au',
  },
  {
    rank: 6,
    name: 'Redox Pty Ltd',
    badge: 'PREMIER RAW MATERIAL DISTRIBUTOR',
    tags: ['DISTRIBUTION', 'FOOD GRADE', 'PHARMA', 'INDUSTRIAL'],
    founded: 1965,
    hq: 'Minto, NSW',
    overview:
      'Redox is one of Australia\'s leading specialty chemical and ingredient distributors, supplying over 1,000 products to the food, pharmaceutical, personal care, mining, water treatment, and industrial manufacturing sectors. Operating warehouses across all Australian states and in New Zealand, Redox specialises in sourcing high-purity specialty raw materials from global manufacturers and delivering them to Australian processors with full traceability and documentation. The company holds HACCP and GMP certifications, and all food-grade and pharmaceutical-grade products are supplied with Certificate of Analysis (CoA) and full AICIS documentation. Redox\'s technical team provides formulation support and regulatory guidance, making it a trusted partner for manufacturers navigating the complexity of Australian chemical compliance.',
    industries: ['Food & Beverage', 'Pharmaceutical', 'Personal Care', 'Mining', 'Water Treatment'],
    certifications: ['HACCP', 'GMP', 'AICIS Registered'],
    website: 'redox.com',
  },
  {
    rank: 7,
    name: 'Ixom (formerly Orica Chemicals)',
    badge: 'LEADING CHLOR-ALKALI & WATER TREATMENT CHEMICALS',
    tags: ['WATER TREATMENT', 'CHLORINE', 'CAUSTIC SODA', 'INDUSTRIAL'],
    founded: 2015,
    hq: 'Melbourne, VIC',
    overview:
      'Ixom is Australia\'s largest manufacturer and distributor of chlor-alkali chemicals, supplying chlorine, caustic soda, hydrochloric acid, and specialty water treatment chemicals to municipal water utilities, mining operations, food processors, and industrial manufacturers across Australia and New Zealand. Spun out of Orica in 2015 and later acquired by Blackstone, Ixom operates the largest chlor-alkali manufacturing plant in Australia at Yarraville, Victoria, and distributes through a national network of owned and contracted warehouses. Ixom is AICIS registered and operates under stringent process safety management protocols. It is the go-to specialty chemical supplier for water treatment procurement teams, holding long-term supply contracts with major Australian water authorities.',
    industries: ['Water Treatment', 'Food & Beverage', 'Mining', 'Pulp & Paper', 'Municipal Utilities'],
    certifications: ['AICIS Registered', 'ISO 9001', 'ISO 45001'],
    website: 'ixom.com',
  },
  {
    rank: 8,
    name: 'Brenntag Australia',
    badge: 'GLOBAL SPECIALTY CHEMICAL DISTRIBUTION LEADER',
    tags: ['DISTRIBUTION', 'PHARMA', 'FOOD', 'INDUSTRIAL'],
    founded: 1874,
    hq: 'Dandenong South, VIC',
    overview:
      'Brenntag Australia is the local arm of Brenntag SE, the world\'s largest specialty and industrial chemical distributor. Operating from strategically located distribution centres across Australia, Brenntag supplies specialty chemicals, performance ingredients, and blended solutions to the pharmaceutical, food and nutrition, personal care, coatings, agriculture, and industrial manufacturing sectors. Its value-added services include formulation development, blending, repackaging, and supply chain management — making it more than a distributor. Brenntag Australia sources products from leading global manufacturers including BASF, Dow, Evonik, and Solvay, ensuring access to a broad portfolio of specialty materials. For procurement managers seeking a single-source specialty chemical partner with global supply reliability and local technical support, Brenntag is a trusted choice.',
    industries: ['Pharmaceutical', 'Food & Nutrition', 'Personal Care', 'Coatings', 'Industrial Manufacturing'],
    certifications: ['AICIS Registered', 'GMP', 'FSSC 22000', 'ISO 9001'],
    website: 'brenntag.com/australia',
  },
  {
    rank: 9,
    name: 'Archroma Australia',
    badge: 'SPECIALTY CHEMICALS FOR TEXTILES & FUNCTIONAL FINISHES',
    tags: ['TEXTILES', 'PAPER', 'FUNCTIONAL FINISHES', 'SUSTAINABILITY'],
    founded: 2013,
    hq: 'Sydney, NSW',
    overview:
      'Archroma is a global specialty chemicals company with strong operations in Australia, supplying colour and specialty chemicals for the textiles, apparel, packaging, and paper industries. Spun off from Clariant\'s textile and paper businesses in 2013, Archroma has built a reputation for sustainable specialty chemistry — its EarthColors® range uses plant-based dyes, and its aniline-free chemistry systems meet the strictest international bluesign® and ZDHC standards. For Australian manufacturers in textiles, technical fabrics, and functional finishes, Archroma provides both commodity and high-performance specialty chemicals with strong technical application support. The company maintains AICIS registration and aligns its product portfolio with REACH and Australian regulatory requirements.',
    industries: ['Textiles & Apparel', 'Technical Fabrics', 'Packaging', 'Paper & Board'],
    certifications: ['AICIS Registered', 'bluesign® Approved', 'ZDHC Compliant', 'ISO 14001'],
    website: 'archroma.com',
  },
  {
    rank: 10,
    name: 'Harcros Chemicals Australia',
    badge: 'SPECIALTY SURFACTANTS & INDUSTRIAL CHEMISTRY',
    tags: ['SURFACTANTS', 'MINING', 'AGRICULTURE', 'INDUSTRIAL'],
    founded: 1950,
    hq: 'Brisbane, QLD',
    overview:
      'Harcros Chemicals Australia is a mid-tier specialty chemical manufacturer and distributor with a strong focus on surfactants, emulsifiers, and specialty industrial chemicals for the mining, agriculture, and manufacturing sectors. Operating from manufacturing and distribution facilities in Queensland, the company supplies a broad range of specialty chemistry including flotation reagents for mining, emulsifier systems for agriculture, and specialty cleaning and process chemicals for industrial manufacturers. Harcros maintains AICIS registration and works closely with customers on technical formulation support. For regional manufacturers in Queensland and northern Australia who need a responsive specialty chemical partner with manufacturing capability rather than pure distribution, Harcros offers a compelling domestic alternative to multinational distributors.',
    industries: ['Mining', 'Agriculture', 'Industrial Cleaning', 'Manufacturing'],
    certifications: ['AICIS Registered', 'ISO 9001'],
    website: 'harcros.com.au',
  },
];

const FAQS = [
  {
    q: 'What are the top specialty chemical companies in Australia?',
    a: 'The top specialty chemical companies in Australia include Orica Limited, Nufarm, DGL Group, Chem-Supply, Dulux Group, Redox, and Ixom. These companies serve sectors ranging from mining and agriculture to pharmaceuticals and water treatment, and collectively represent the backbone of Australia\'s specialty chemicals industry.',
  },
  {
    q: 'What is the difference between commodity chemicals and specialty chemicals?',
    a: 'Commodity chemicals are produced in large volumes at relatively low cost and are sold primarily on price — examples include sulfuric acid, ammonia, and ethylene. Specialty chemicals, by contrast, are produced in smaller quantities, are highly formulated for specific performance applications, and command a premium based on their technical value rather than price alone. Examples include flotation reagents, food-grade emulsifiers, pharmaceutical excipients, and high-performance industrial coatings.',
  },
  {
    q: 'Are Australian specialty chemical companies AICIS compliant?',
    a: 'Yes. All legitimate specialty chemical manufacturers and importers operating in Australia are required to register with the Australian Industrial Chemicals Introduction Scheme (AICIS), administered by the Department of Health. AICIS replaced the former NICNAS scheme in 2020 and regulates the introduction and use of industrial chemicals to protect human health and the environment. All companies listed in this guide maintain current AICIS registration.',
  },
  {
    q: 'Which industries use specialty chemicals the most in Australia?',
    a: 'Australia\'s largest consumers of specialty chemicals are the mining and resources sector (flotation reagents, explosives, process chemicals), agriculture (crop protection, fertiliser adjuvants), water treatment (chlorine, coagulants, flocculants), food and beverage manufacturing (food-grade additives, sanitisers), and the construction industry (coatings, adhesives, sealants). The mining sector alone accounts for a significant share of Australia\'s total specialty chemical consumption.',
  },
  {
    q: 'How do I find a verified specialty chemical supplier for my manufacturing business in Australia?',
    a: 'To find a verified specialty chemical supplier in Australia, look for companies that hold AICIS registration, relevant ISO certifications (9001, 14001), and sector-specific accreditations such as GMP for pharmaceutical applications or HACCP for food-grade chemistry. You can use B2B directories like FirmsLedger to discover and compare verified chemical service providers, or contact industry associations such as the Chemistry Industry Association of Australia (CIAA) for member referrals.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

export default function BestSpecialtyChemicalCompaniesAustralia2026Article() {
  return (
    <>
      <Script
        id="faq-schema-specialty-chemicals-australia"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumb
              items={[
                { label: 'Blog', href: createPageUrl('Blogs') },
                { label: 'Best Specialty Chemical Companies in Australia (2026)' },
              ]}
            />
          </div>
        </div>

        {/* Hero */}
        <header className="bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
            <div className="inline-block bg-teal-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
              Australia · Chemicals · Updated 2026
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-5">
              Best Specialty Chemical Companies in Australia for Manufacturing (2026)
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed mb-8">
              A verified B2B guide to Australia's top specialty chemical suppliers — compared by sector expertise, AICIS compliance, certifications, and manufacturing capability for 2026.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="bg-white/10 rounded-full px-3 py-1">20 min read</span>
              <span className="bg-white/10 rounded-full px-3 py-1">10 companies profiled</span>
              <span className="bg-white/10 rounded-full px-3 py-1">AICIS compliant</span>
              <span className="bg-white/10 rounded-full px-3 py-1">B2B buyer's guide</span>
            </div>
          </div>
        </header>

        {/* Hero Image */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-10">
          <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[16/7] bg-slate-200">
            <Image
              src={FEATURED_IMAGE.src}
              alt={FEATURED_IMAGE.alt}
              width={FEATURED_IMAGE.width}
              height={FEATURED_IMAGE.height}
              className="object-cover w-full h-full"
              priority
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        </div>

        {/* Article Body */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
            {[
              { value: 'A$13B+', label: 'Australia\'s specialty chemicals market size (2025)' },
              { value: '4,000+', label: 'Chemical manufacturers & distributors in Australia' },
              { value: '100+', label: 'Countries served by Australia\'s top chemical exporters' },
              { value: 'AICIS', label: 'Mandatory compliance scheme for all chemical suppliers' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center border-t-4 border-t-teal-500">
                <div className="text-2xl font-extrabold text-slate-900 mb-1">{value}</div>
                <div className="text-xs text-slate-500 leading-snug">{label}</div>
              </div>
            ))}
          </div>

          {/* Introduction */}
          <section className="mb-12">
            <div className="space-y-4 text-lg text-slate-700 leading-relaxed">
              <p>
                Australia's specialty chemicals sector is a critical enabler of the country's manufacturing economy. Valued at over A$13 billion and underpinned by demand from mining, agriculture, pharmaceuticals, food processing, and construction, the market for <strong>specialty chemicals in Australia</strong> continues to grow as manufacturers demand higher-performance, more precisely formulated products.
              </p>
              <p>
                Unlike commodity chemicals, <strong>specialty chemicals</strong> are designed for specific applications — from flotation reagents that extract copper from ore, to food-grade emulsifiers that give products their texture, to industrial coatings that protect offshore infrastructure from corrosion. Choosing the right specialty chemical partner is not simply a procurement decision; it is a technical and regulatory one.
              </p>
              <p>
                This guide profiles the <strong>best specialty chemical companies in Australia for manufacturing</strong> in 2026 — covering large ASX-listed players, mid-market manufacturers, and specialist distributors. Each company has been assessed on product range, industry experience, certifications, AICIS compliance, and supply reliability.
              </p>
              <p>
                Whether you are a procurement manager sourcing mining process chemicals, a food manufacturer seeking certified food-grade additives, or an industrial buyer evaluating coating suppliers, this guide will help you identify the right partner for your operation.
              </p>
            </div>
          </section>

          {/* What Are Specialty Chemicals */}
          <section className="mb-14 bg-teal-50 border border-teal-100 rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">What Are Specialty Chemicals?</h2>
            <div className="space-y-4 text-lg text-slate-700 leading-relaxed">
              <p>
                <strong>Specialty chemicals</strong> are chemical products manufactured and sold for their specific performance, function, or technical properties — rather than their composition alone. They are typically produced in smaller volumes than commodity chemicals, command higher margins, and are sold to customers based on the value they deliver in a particular application.
              </p>
              <p>
                In manufacturing, specialty chemicals include adhesives and sealants, performance coatings, process chemicals, food and pharmaceutical additives, water treatment reagents, surfactants, and electronic chemicals. Their defining characteristic is that they are formulated to solve a specific technical problem — and cannot simply be substituted with a generic alternative without affecting the manufacturing process or end-product quality.
              </p>
              <p>
                For Australian manufacturers, sourcing from AICIS-registered specialty chemical suppliers is not optional — it is a legal requirement. Suppliers who are not registered with the <strong>Australian Industrial Chemicals Introduction Scheme (AICIS)</strong> cannot legally introduce industrial chemicals into Australia.
              </p>
            </div>
          </section>

          {/* How We Selected */}
          <section className="mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">How We Selected These Companies</h2>
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              Each company in this guide was evaluated against six criteria relevant to Australian manufacturing buyers:
            </p>
            <div className="divide-y divide-slate-200">
              {[
                { title: 'Years in Operation', body: 'Preference was given to companies with at least 10 years of proven Australian market presence, demonstrating supply reliability and financial stability.' },
                { title: 'Product Range & Depth', body: 'Companies were assessed on the breadth of their specialty chemical portfolio and their ability to serve multiple applications or industries.' },
                { title: 'Certifications', body: 'ISO 9001, ISO 14001, ISO 45001, GMP, HACCP, and sector-specific accreditations were assessed. Companies without AICIS registration were excluded.' },
                { title: 'Client Industries Served', body: 'Priority was given to companies that demonstrably supply to Australia\'s key manufacturing sectors: mining, agriculture, food and beverage, pharmaceuticals, and industrial production.' },
                { title: 'Reputation & Market Standing', body: 'Industry reputation, client testimonials, regulatory compliance history, and standing within the Chemistry Industry Association of Australia (CIAA) were considered.' },
                { title: 'Export Capability', body: 'Companies with demonstrated capability to supply regionally (New Zealand, Asia-Pacific) were noted as they typically signal higher operational maturity and supply chain sophistication.' },
              ].map(({ title, body }) => (
                <div key={title} className="py-5">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
                  <p className="text-lg text-slate-600 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Company Profiles */}
          <section className="mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              Top 10 Best Specialty Chemical Companies in Australia for Manufacturing (2026)
            </h2>
            <p className="text-lg text-slate-600 mb-8">Profiled and ranked for B2B procurement managers and manufacturing decision-makers.</p>

            <div className="divide-y divide-slate-200">
              {COMPANIES.map((company) => (
                <div key={company.rank} className="py-10">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-5xl font-extrabold text-slate-100 leading-none select-none">{company.rank}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 rounded-full px-3 py-0.5 uppercase tracking-wide">
                          {company.badge}
                        </span>
                        {company.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">{tag}</span>
                        ))}
                      </div>
                      <h3 className="text-2xl font-extrabold text-slate-900 mb-1">{company.name}</h3>
                      <p className="text-sm text-slate-500">
                        Founded: {company.founded} &nbsp;·&nbsp; HQ: {company.hq} &nbsp;·&nbsp;
                        <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">{company.website}</a>
                      </p>
                    </div>
                  </div>

                  <p className="text-lg text-slate-700 leading-relaxed mb-5">{company.overview}</p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Industries Served</p>
                      <div className="flex flex-wrap gap-2">
                        {company.industries.map((ind) => (
                          <span key={ind} className="text-xs bg-white border border-slate-200 text-slate-700 rounded-full px-2.5 py-1">{ind}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                      <p className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">Certifications</p>
                      <div className="flex flex-wrap gap-2">
                        {company.certifications.map((cert) => (
                          <span key={cert} className="text-xs bg-white border border-teal-200 text-teal-800 rounded-full px-2.5 py-1 font-medium">{cert}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Summary Table */}
          <section className="mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Quick Comparison: Top Specialty Chemical Companies in Australia</h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-teal-600 text-white">
                    <th className="text-left px-4 py-3 font-semibold">Company</th>
                    <th className="text-left px-4 py-3 font-semibold">HQ</th>
                    <th className="text-left px-4 py-3 font-semibold">Specialty</th>
                    <th className="text-left px-4 py-3 font-semibold">Industries Served</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ['Orica Limited', 'Melbourne, VIC', 'Explosives & Mining Chemicals', 'Mining, Oil & Gas, Construction'],
                    ['Nufarm Limited', 'Laverton North, VIC', 'Crop Protection Chemicals', 'Agriculture, Food Processing'],
                    ['DGL Group', 'Ingleburn, NSW', 'Hazardous Chemical Mfg & Logistics', 'Mining, Agriculture, Water Treatment'],
                    ['Chem-Supply', 'Port Adelaide, SA', 'Lab, Industrial & Pharma Chemicals', 'Pharma, Food, Research, Industrial'],
                    ['Dulux Group', 'Clayton, VIC', 'Paints, Coatings & Adhesives', 'Construction, Mining, Marine'],
                    ['Redox Pty Ltd', 'Minto, NSW', 'Specialty Raw Material Distribution', 'Food, Pharma, Personal Care, Mining'],
                    ['Ixom', 'Melbourne, VIC', 'Chlor-Alkali & Water Treatment', 'Water Utilities, Food, Mining'],
                    ['Brenntag Australia', 'Dandenong South, VIC', 'Specialty Chemical Distribution', 'Pharma, Food, Coatings, Industrial'],
                    ['Archroma Australia', 'Sydney, NSW', 'Textile & Functional Finish Chemicals', 'Textiles, Packaging, Paper'],
                    ['Harcros Chemicals', 'Brisbane, QLD', 'Surfactants & Industrial Chemistry', 'Mining, Agriculture, Industrial'],
                  ].map(([name, hq, specialty, industries], i) => (
                    <tr key={name} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-4 py-3 font-semibold text-slate-900">{name}</td>
                      <td className="px-4 py-3 text-slate-600">{hq}</td>
                      <td className="px-4 py-3 text-slate-600">{specialty}</td>
                      <td className="px-4 py-3 text-slate-600">{industries}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Key Industries */}
          <section className="mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Key Industries Driving Specialty Chemical Demand in Australia</h2>
            <div className="space-y-6">
              {[
                {
                  icon: '⛏️',
                  title: 'Mining & Resources',
                  body: 'Australia\'s mining sector is the single largest consumer of specialty chemicals domestically. Flotation reagents, leaching chemicals, explosives, and dust suppression agents are consumed in enormous volumes across iron ore, gold, copper, lithium, and coal operations in WA, Queensland, and NSW. The global demand for critical minerals is accelerating investment — and chemical consumption — in this sector through 2026 and beyond.',
                },
                {
                  icon: '🌾',
                  title: 'Agriculture & Food Processing',
                  body: 'Australia is one of the world\'s leading agricultural exporters, and its food and agribusiness sector relies heavily on specialty chemicals — from APVMA-registered crop protection products and fertiliser adjuvants to food-grade processing aids and sanitisers. As export markets demand higher food safety standards, the need for certified, traceable specialty chemical inputs is increasing.',
                },
                {
                  icon: '💊',
                  title: 'Pharmaceuticals & Biotech',
                  body: 'Australia\'s pharmaceutical manufacturing sector — though smaller than the US or Europe — is growing rapidly, driven by government biosecurity investment and increasing domestic API (active pharmaceutical ingredient) production. GMP-certified specialty chemical excipients, solvents, and reagents are in growing demand from contract development and manufacturing organisations (CDMOs).',
                },
                {
                  icon: '🎨',
                  title: 'Paints, Coatings & Adhesives',
                  body: 'The construction boom across Australian capital cities, combined with infrastructure spending in road, rail, and energy, is sustaining strong demand for specialty coatings, sealants, and adhesives. Anti-corrosion coatings for coastal and tropical infrastructure and fire-retardant formulations for commercial construction are among the fastest-growing sub-segments.',
                },
                {
                  icon: '💧',
                  title: 'Water Treatment',
                  body: 'With growing water scarcity pressures and stricter municipal water quality regulations, demand for specialty water treatment chemicals — including coagulants, flocculants, biocides, and pH adjustment chemicals — is increasing across both municipal utilities and industrial applications in mining and food processing.',
                },
              ].map(({ icon, title, body }) => (
                <div key={title} className="flex gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <span className="text-3xl flex-shrink-0">{icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                    <p className="text-base text-slate-600 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* What to Look For */}
          <section className="mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">What to Look for When Choosing a Specialty Chemical Supplier in Australia</h2>
            <div className="divide-y divide-slate-200">
              {[
                {
                  title: '1. AICIS Registration',
                  body: 'This is non-negotiable. Every specialty chemical supplier introducing industrial chemicals in Australia must be registered with AICIS. Always request a supplier\'s AICIS registration number and verify it through the AICIS public register before signing a supply agreement.',
                },
                {
                  title: '2. Quality Certifications',
                  body: 'Look for ISO 9001 (quality management), ISO 14001 (environmental management), and where applicable, GMP certification for pharmaceutical or food-grade applications, and HACCP for food processing supply chains. These certifications are independently audited and signal a serious, process-driven supplier.',
                },
                {
                  title: '3. Technical Support & Customisation',
                  body: 'A genuine specialty chemical partner should offer formulation development support, application testing, and technical account management — not just order fulfilment. The ability to customise a product for your specific process conditions separates true specialty suppliers from distributors reselling standard grades.',
                },
                {
                  title: '4. Supply Chain Reliability',
                  body: 'Assess a supplier\'s domestic manufacturing or warehousing footprint, their lead times, and their contingency plans for supply disruption. Suppliers with Australian manufacturing capability or bonded local warehouses are typically more reliable than those relying entirely on overseas supply chains.',
                },
                {
                  title: '5. Sustainability Practices',
                  body: 'ESG compliance is increasingly a procurement requirement for Australian manufacturers supplying into export markets or listed companies. Look for suppliers with documented sustainability commitments, green chemistry credentials, and transparent environmental reporting — particularly if your downstream customers are requesting Scope 3 emissions data.',
                },
              ].map(({ title, body }) => (
                <div key={title} className="py-5">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-lg text-slate-600 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section className="mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {FAQS.map(({ q, a }) => (
                <details key={q} className="group bg-white border border-slate-200 rounded-xl shadow-sm">
                  <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold text-slate-900 text-lg list-none">
                    {q}
                    <span className="ml-4 text-teal-600 text-xl font-bold group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-base text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                    {a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Conclusion */}
          <section className="mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-5">Conclusion</h2>
            <div className="space-y-4 text-lg text-slate-700 leading-relaxed">
              <p>
                Australia's specialty chemicals sector is diverse, technically sophisticated, and underpinned by some of the country's most demanding industrial markets. The <strong>best specialty chemical companies in Australia for manufacturing</strong> share three common traits: deep technical expertise in their chosen applications, robust regulatory compliance (beginning with AICIS registration), and the ability to provide reliable supply at industrial scale.
              </p>
              <p>
                Whether you are sourcing process chemicals for a Western Australian mine site, certified food-grade additives for a food manufacturer in Victoria, or high-performance industrial coatings for a construction project in Queensland, the ten companies profiled in this guide represent the strongest starting points for a structured B2B evaluation.
              </p>
              <p>
                For procurement managers looking to discover and compare additional verified chemical service providers and industrial suppliers across Australia, FirmsLedger's B2B directory makes it easy to find, evaluate, and connect with the right partners.
              </p>
            </div>
          </section>

          {/* CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 p-8 md:p-10 text-center text-white">
            <h3 className="text-2xl md:text-3xl font-extrabold mb-3">Find Verified Chemical & Industrial Suppliers</h3>
            <p className="text-teal-100 mb-6 max-w-lg mx-auto text-lg leading-relaxed">
              Browse FirmsLedger's directory of verified B2B service providers across Australia, India, and beyond. Compare expertise, certifications, and industries served.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={getDirectoryUrl()}>
                <span className="inline-block bg-white text-teal-700 font-bold px-8 py-3 rounded-xl hover:bg-teal-50 transition-colors">
                  Browse Directory
                </span>
              </Link>
              <Link href="/ListYourCompany">
                <span className="inline-block bg-teal-500/40 border border-teal-300 text-white font-semibold px-8 py-3 rounded-xl hover:bg-teal-500/60 transition-colors">
                  List Your Company
                </span>
              </Link>
            </div>
          </div>

        </article>
      </div>
    </>
  );
}
