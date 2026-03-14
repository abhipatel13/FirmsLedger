'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { getDirectoryUrl, createPageUrl } from '@/utils';
import Breadcrumb from '@/components/Breadcrumb';

const FEATURED_IMAGE = {
  src: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=85',
  alt: 'Best Solar Panel Brands in India 2025 - top solar panels for home, commercial and industrial use',
  width: 1200,
  height: 630,
};

const BRANDS = [
  {
    rank: 1,
    name: 'Waaree Energies',
    badge: "INDIA'S LARGEST MANUFACTURER",
    tags: ['INDIAN BRAND', 'HOME', 'COMMERCIAL', 'INDUSTRIAL', 'BIS CERTIFIED'],
    founded: 1989,
    hq: 'Mumbai, Maharashtra',
    overview:
      'Waaree Energies is the largest solar panel manufacturer in India by installed capacity, with over 13 GW of annual production capacity. Founded in 1989 and publicly listed, Waaree exports to more than 70 countries while maintaining a dominant presence in the Indian domestic market. Their panels are available across every segment — from small rooftop home systems to large utility-scale solar farms. Waaree is a trusted name among EPC contractors and individual buyers alike.',
    bestModel: 'Waaree Arka Series 540W Mono PERC / Waaree 335W Poly',
    features: [
      'Mono PERC and bifacial panel options available for maximum efficiency',
      'Efficiency ratings up to 21.5% on premium Arka series panels',
      'BIS certified and compliant with IEC 61215 and IEC 61730 international standards',
      '25-year linear power output warranty; 10-year product warranty',
      'Pan-India dealer and service network with over 360 channel partners',
    ],
    pros: [
      'Largest manufacturing capacity in India — consistent supply',
      'Wide product range from 100W to 600W+',
      'Strong export reputation = quality assurance',
      'Competitively priced for Indian market',
    ],
    cons: [
      'Premium models can be expensive for tight budgets',
      'After-sales response can vary by region',
    ],
    bestFor: 'Home rooftops, commercial installations, and large industrial plants',
    price: '₹22–₹35 per watt (varies by wattage and type)',
  },
  {
    rank: 2,
    name: 'Tata Power Solar',
    badge: 'MOST TRUSTED INDIAN BRAND',
    tags: ['INDIAN BRAND', 'HOME', 'COMMERCIAL', 'BIS CERTIFIED'],
    founded: 1989,
    hq: 'Bengaluru, Karnataka',
    overview:
      'Tata Power Solar is one of the most respected solar panel brands in India, backed by the legacy of the Tata Group. With over 35 years in the solar industry, Tata Power Solar manufactures cells, modules, and complete solar systems for homes and businesses. The Tata name alone gives buyers unmatched confidence in quality, warranty claims, and long-term support — making it a top pick for homeowners who value trust over price.',
    bestModel: 'Tata Power Solar 440W Mono PERC / Tata Power Solar 325W Poly',
    features: [
      'Manufactured in India with cells and modules made at the Bengaluru facility',
      'BIS certified panels with IEC 61215, IEC 61730, and IS 14286 compliance',
      '25-year linear performance warranty backed by Tata Group credibility',
      'Complete solar solutions available — panels, inverters, and EPC services',
      'Proven track record in government, commercial, and residential projects across India',
    ],
    pros: [
      'Tata brand backing = reliable warranty and service claims',
      'Strong nationwide service infrastructure',
      'Made in India — supports domestic manufacturing',
      'Suitable for MNRE-approved subsidy schemes',
    ],
    cons: [
      'Priced at a premium compared to newer brands',
      'Limited very high-wattage panel options',
    ],
    bestFor: 'Homeowners and businesses who prioritise brand reliability and after-sales service',
    price: '₹24–₹38 per watt',
  },
  {
    rank: 3,
    name: 'Adani Solar',
    badge: 'FASTEST GROWING INDIAN BRAND',
    tags: ['INDIAN BRAND', 'COMMERCIAL', 'INDUSTRIAL', 'BIS CERTIFIED'],
    founded: 2015,
    hq: 'Mundra, Gujarat',
    overview:
      'Adani Solar, the manufacturing arm of Adani Green Energy, has rapidly grown into one of India\'s top solar panel brands in India. Their facility in Mundra, Gujarat, is one of the largest integrated solar manufacturing plants in the country, producing both cells and modules. Adani Solar primarily caters to large commercial and utility-scale projects but has been expanding its presence in the residential segment.',
    bestModel: 'Adani Solar 540W Mono PERC / Adani Solar Bifacial 580W',
    features: [
      'Integrated manufacturing — cells and modules produced in-house at Mundra',
      'High-efficiency bifacial panels with up to 22% efficiency',
      'BIS certified; compliant with IEC and MNRE ALMM (Approved List of Models and Manufacturers)',
      '25-year linear power warranty and 12-year product warranty',
      'Strong supply capacity suitable for large EPC and government projects',
    ],
    pros: [
      'ALMM listed — eligible for government subsidies and SECI projects',
      'High-efficiency bifacial options for maximum generation',
      'Backed by the large Adani Group infrastructure',
      'Competitive pricing for bulk orders',
    ],
    cons: [
      'Primarily focused on large-scale and commercial projects',
      'Residential support network still expanding',
    ],
    bestFor: 'Commercial rooftops, industrial plants, and government solar projects',
    price: '₹23–₹36 per watt',
  },
  {
    rank: 4,
    name: 'Vikram Solar',
    badge: 'PREMIUM EXPORT-QUALITY',
    tags: ['INDIAN BRAND', 'COMMERCIAL', 'INDUSTRIAL', 'IEC CERTIFIED'],
    founded: 2006,
    hq: 'Kolkata, West Bengal',
    overview:
      'Vikram Solar is a premium Indian solar panel manufacturer known for exporting high-quality modules to Europe, the US, and Japan. Their export-grade quality makes them one of the best choices for buyers who want international-standard panels at Indian prices. Vikram Solar\'s Somera and ELDORA product series are widely used in commercial and utility projects across India and globally.',
    bestModel: 'Vikram Solar Somera 540W Mono PERC / Vikram ELDORA PRO Bifacial',
    features: [
      'Export-grade quality tested to stringent European and American standards',
      'Bifacial ELDORA PRO series delivers up to 22.5% module efficiency',
      'BIS certified with IEC 61215, IEC 61730, and UL certifications',
      '30-year linear power output warranty — longest in India',
      'Advanced anti-PID (Potential Induced Degradation) technology for Indian weather conditions',
    ],
    pros: [
      '30-year warranty is best-in-class in India',
      'Export pedigree ensures superior quality control',
      'Excellent performance in high-temperature and high-humidity conditions',
      'Strong institutional and EPC buyer base',
    ],
    cons: [
      'Premium pricing — not ideal for budget buyers',
      'Limited retail availability for small residential buyers',
    ],
    bestFor: 'Commercial, industrial, and buyers who want premium long-term performance',
    price: '₹26–₹40 per watt',
  },
  {
    rank: 5,
    name: 'Luminous Solar',
    badge: 'HOME & RESIDENTIAL FAVOURITE',
    tags: ['INDIAN BRAND', 'HOME', 'OFF-GRID', 'BIS CERTIFIED'],
    founded: 1988,
    hq: 'New Delhi, Delhi',
    overview:
      'Luminous is one of the most recognised solar panel brands in India for home and residential use. Best known for their inverters and batteries, Luminous has built a complete solar ecosystem — panels, inverters, batteries, and charge controllers — making them the go-to brand for homeowners setting up an off-grid or hybrid solar system. Their wide dealer network makes installation and after-sales service easily accessible across Tier 2 and Tier 3 cities.',
    bestModel: 'Luminous 335W Mono PERC / Luminous 200W Polycrystalline',
    features: [
      'Complete solar system compatibility — works seamlessly with Luminous inverters and batteries',
      'BIS certified panels suitable for MNRE subsidy-eligible rooftop installations',
      'Polycrystalline and mono PERC options available for different budgets',
      'Widely available through 70,000+ dealer and retailer network across India',
      'Best suited for residential off-grid and hybrid solar setups',
    ],
    pros: [
      'One-stop shop — panel + inverter + battery from one brand',
      'Widest dealer network in small cities and rural India',
      'Easy availability of spare parts and service',
      'Trusted brand for home buyers with no technical background',
    ],
    cons: [
      'Panel efficiency slightly lower than premium Mono PERC competitors',
      'Not ideal for large commercial or utility-scale projects',
    ],
    bestFor: 'Homeowners, rural households, and small businesses needing off-grid or hybrid solar',
    price: '₹20–₹30 per watt',
  },
  {
    rank: 6,
    name: 'Loom Solar',
    badge: 'BEST FOR SMALL ROOFTOPS',
    tags: ['INDIAN BRAND', 'HOME', 'SMALL COMMERCIAL', 'BIS CERTIFIED'],
    founded: 2018,
    hq: 'Faridabad, Haryana',
    overview:
      'Loom Solar is a young but fast-growing Indian solar brand that has become popular among homeowners and small business owners. Founded in 2018, Loom Solar focuses on compact, high-efficiency mono PERC panels ideal for small rooftops with limited space. They sell directly through their website and Amazon, making it easy for buyers to purchase without going through a dealer. Their SHARK series of high-wattage panels has been particularly well received.',
    bestModel: 'Loom Solar SHARK 440W Mono PERC / Loom Solar Panel 375W',
    features: [
      'Compact SHARK series panels generate more power per square foot — ideal for small rooftops',
      'BIS certified; compliant with IEC 61215 and IEC 61730',
      'Direct-to-consumer sales model via website and Amazon — transparent pricing',
      'SHARK Bi-facial panels available for enhanced generation on reflective surfaces',
      '25-year power output warranty and 10-year product warranty',
    ],
    pros: [
      'Best option for small rooftops with space constraints',
      'Transparent pricing — buy directly without middlemen',
      'High power density compared to price',
      'Good for DIY solar enthusiasts and technically aware buyers',
    ],
    cons: [
      'Newer brand — less long-term track record than Tata or Waaree',
      'After-sales service network still developing in some regions',
    ],
    bestFor: 'Urban homeowners, small shops, and buyers with limited rooftop space',
    price: '₹22–₹32 per watt',
  },
  {
    rank: 7,
    name: 'RenewSys India',
    badge: 'FULLY INTEGRATED INDIAN MANUFACTURER',
    tags: ['INDIAN BRAND', 'HOME', 'COMMERCIAL', 'BIS CERTIFIED'],
    founded: 2011,
    hq: 'Mumbai, Maharashtra',
    overview:
      'RenewSys is an integrated solar manufacturer that produces encapsulants, backsheets, and solar modules — all under one roof in India. This vertical integration gives RenewSys tight control over quality at every stage of production. Their DESERV and INSPIRA series panels are well suited for both residential and commercial applications. RenewSys panels are ALMM listed, making them eligible for government-subsidised rooftop solar schemes.',
    bestModel: 'RenewSys INSPIRA 540W Mono PERC / RenewSys DESERV 330W Poly',
    features: [
      'Vertically integrated manufacturing — modules, encapsulants, and backsheets made in India',
      'ALMM listed — eligible for PM Surya Ghar and other government subsidy schemes',
      'BIS certified with IEC 61215, IEC 61730, and IS 14286 compliance',
      '25-year linear performance warranty and 10-year product warranty',
      'Poly and mono PERC options for budget-to-premium buyers',
    ],
    pros: [
      'ALMM listed — ideal for subsidy-scheme installations',
      'Strong quality control from vertical integration',
      'Competitive pricing for BIS certified panels',
      'Good option for government and PSU solar tenders',
    ],
    cons: [
      'Brand awareness lower than Waaree or Tata among retail buyers',
      'Retail availability limited in smaller cities',
    ],
    bestFor: 'Subsidy-scheme installations, government projects, and cost-conscious commercial buyers',
    price: '₹21–₹33 per watt',
  },
  {
    rank: 8,
    name: 'Canadian Solar',
    badge: 'BEST INTERNATIONAL BRAND',
    tags: ['GLOBAL BRAND', 'COMMERCIAL', 'INDUSTRIAL', 'IEC CERTIFIED'],
    founded: 2001,
    hq: 'Canada (India offices in multiple cities)',
    overview:
      'Canadian Solar is one of the world\'s largest solar panel manufacturers, and it is widely used in large commercial and industrial projects across India. Though not manufactured in India, Canadian Solar panels are imported and distributed by authorized partners nationwide. They are known for high efficiency, consistent quality, and strong global warranty support. Many large IPPs (Independent Power Producers) and EPC firms in India prefer Canadian Solar for utility-scale projects.',
    bestModel: 'Canadian Solar HiKu6 CS6W 550W Mono PERC / Canadian Solar BiHiKu Bifacial',
    features: [
      'Tier 1 Bloomberg rated — among the most bankable solar panel brands globally',
      'HiKu6 series with 182mm large-format cells for higher efficiency and lower BOS costs',
      'Bifacial BiHiKu series for up to 30% additional energy from reflected light',
      '25-year linear power warranty backed by a global manufacturer',
      'Strong performance data and third-party testing certifications (IEC, UL, MCS)',
    ],
    pros: [
      'Globally bankable — preferred by large project financiers',
      'Consistently high quality and efficiency ratings',
      'Wide range of wattages from 330W to 680W+',
      'Reliable warranty claims via authorized India distributors',
    ],
    cons: [
      'Not manufactured in India — not eligible for ALMM subsidy schemes',
      'Higher price than domestic alternatives',
      'Not widely available for small retail purchases',
    ],
    bestFor: 'Large commercial installations, IPP projects, and industrial plants',
    price: '₹28–₹45 per watt',
  },
  {
    rank: 9,
    name: 'LONGi Solar',
    badge: "WORLD'S LARGEST SOLAR MANUFACTURER",
    tags: ['GLOBAL BRAND', 'HOME', 'COMMERCIAL', 'INDUSTRIAL', 'IEC CERTIFIED'],
    founded: 2000,
    hq: 'China (India offices in Gurugram)',
    overview:
      'LONGi Solar is the world\'s largest solar panel manufacturer by shipment volume, and their panels are widely imported and used across India. LONGi pioneered monocrystalline PERC technology at scale, bringing down costs significantly. Their Hi-MO series panels are popular in large EPC projects in India due to their high efficiency and competitive pricing. LONGi has been expanding its India presence with local partnerships and offices.',
    bestModel: 'LONGi Hi-MO 6 570W Mono PERC / LONGi Hi-MO 5 530W',
    features: [
      'Pioneer of monocrystalline PERC technology — sets industry efficiency benchmarks',
      'Hi-MO 6 series using 182mm wafer technology for high wattage output',
      'Among the most cost-efficient high-wattage panels available in India',
      '25-year linear power warranty; 15-year product warranty on select series',
      'IEC 61215, IEC 61730, MCS certified with globally recognised quality standards',
    ],
    pros: [
      'Excellent efficiency-to-price ratio',
      'Wide availability through Indian distributors',
      'Suitable for both rooftop and ground-mount installations',
      'Strong global reputation and consistent quality',
    ],
    cons: [
      'Not manufactured in India — not eligible for ALMM subsidy schemes',
      'Warranty claims can be slower than domestic brands',
    ],
    bestFor: 'Commercial rooftops, industrial plants, and large EPC projects seeking efficiency',
    price: '₹25–₹38 per watt',
  },
  {
    rank: 10,
    name: 'Microtek Solar',
    badge: 'BEST BUDGET OPTION',
    tags: ['INDIAN BRAND', 'HOME', 'OFF-GRID', 'BIS CERTIFIED'],
    founded: 1985,
    hq: 'New Delhi, Delhi',
    overview:
      'Microtek is a household name in India for inverters and UPS systems, and their solar division extends this legacy into affordable solar panels for home and small business use. Microtek Solar panels are BIS certified, widely available, and priced competitively — making them one of the most accessible solar panel brands in India for first-time buyers. Their panels pair naturally with Microtek solar inverters, simplifying system selection for homeowners.',
    bestModel: 'Microtek 330W Mono PERC / Microtek 250W Polycrystalline',
    features: [
      'BIS certified panels — safe and compliant with Indian quality standards',
      'Affordable polycrystalline and mono PERC options for all budgets',
      'Compatible with the full Microtek solar inverter and battery range',
      'Available at most electrical hardware stores and online platforms across India',
      '10-year product warranty and 25-year power output warranty',
    ],
    pros: [
      'Most affordable BIS certified option in the market',
      'Widely available in Tier 2 and Tier 3 cities',
      'Trusted brand name with decades of electronics heritage',
      'Good for small home systems and backup power',
    ],
    cons: [
      'Lower efficiency than mono PERC competitors',
      'Not suitable for large commercial or utility installations',
    ],
    bestFor: 'Budget-conscious homeowners, rural households, and small shops',
    price: '₹18–₹28 per watt',
  },
];

const COMPARISON = [
  { brand: 'Waaree Energies', model: 'Arka 540W Mono PERC', bestFor: 'Home & Industrial', price: '₹22–₹35/W', warranty: '25 years', bis: true },
  { brand: 'Tata Power Solar', model: '440W Mono PERC', bestFor: 'Home & Commercial', price: '₹24–₹38/W', warranty: '25 years', bis: true },
  { brand: 'Adani Solar', model: 'Bifacial 580W', bestFor: 'Commercial & Industrial', price: '₹23–₹36/W', warranty: '25 years', bis: true },
  { brand: 'Vikram Solar', model: 'ELDORA PRO Bifacial', bestFor: 'Commercial & Industrial', price: '₹26–₹40/W', warranty: '30 years', bis: true },
  { brand: 'Luminous Solar', model: '335W Mono PERC', bestFor: 'Home & Off-grid', price: '₹20–₹30/W', warranty: '25 years', bis: true },
  { brand: 'Loom Solar', model: 'SHARK 440W', bestFor: 'Small Rooftops', price: '₹22–₹32/W', warranty: '25 years', bis: true },
  { brand: 'RenewSys India', model: 'INSPIRA 540W', bestFor: 'Subsidy Schemes', price: '₹21–₹33/W', warranty: '25 years', bis: true },
  { brand: 'Canadian Solar', model: 'HiKu6 CS6W 550W', bestFor: 'Large Commercial', price: '₹28–₹45/W', warranty: '25 years', bis: false },
  { brand: 'LONGi Solar', model: 'Hi-MO 6 570W', bestFor: 'Commercial & EPC', price: '₹25–₹38/W', warranty: '25 years', bis: false },
  { brand: 'Microtek Solar', model: '330W Mono PERC', bestFor: 'Budget Home Use', price: '₹18–₹28/W', warranty: '25 years', bis: true },
];

const FAQ_ITEMS = [
  {
    q: 'Which is the best solar panel brand in India in 2025?',
    a: 'Waaree Energies, Tata Power Solar, and Adani Solar are the top three solar panel brands in India in 2025. Waaree leads in manufacturing capacity, Tata Power Solar leads in brand trust for home buyers, and Adani Solar leads for commercial and industrial projects. For premium quality, Vikram Solar\'s 30-year warranty panels are also excellent.',
  },
  {
    q: 'Which solar panel brand offers the best warranty in India?',
    a: 'Vikram Solar offers the best warranty in India — a 30-year linear power output warranty, which is the longest in the Indian market. Most other top brands including Waaree, Tata Power Solar, Adani Solar, and Luminous offer a standard 25-year linear performance warranty plus a 10-12 year product warranty.',
  },
  {
    q: 'Which solar panel is best for home use in India?',
    a: 'For home use, Luminous Solar, Loom Solar, and Tata Power Solar are the top choices. Luminous offers a complete ecosystem (panel + inverter + battery) through a wide dealer network. Loom Solar is ideal for small urban rooftops. Tata Power Solar gives homeowners the most confidence in warranty and after-sales support. All three are BIS certified and eligible for government subsidies.',
  },
  {
    q: 'Are Indian solar panel brands reliable?',
    a: 'Yes, Indian solar panel brands have improved significantly in quality over the last decade. Brands like Waaree, Tata Power Solar, Vikram Solar, and Adani Solar now export to Europe, the US, and Japan — meeting stringent international quality standards. They are BIS certified and ALMM listed, making them eligible for government subsidy schemes. Indian brands also offer better after-sales support and spare part availability compared to imported brands.',
  },
  {
    q: 'What is the average price of a solar panel in India in 2025?',
    a: 'In 2025, the average price of a solar panel in India ranges from ₹18 to ₹45 per watt depending on the brand, type, and wattage. A 335W poly panel from a budget brand costs approximately ₹6,000–₹8,000, while a 540W premium mono PERC panel costs ₹12,000–₹19,000. For a complete 3kW home solar system (panels + inverter + installation), expect to spend ₹1.5 lakh to ₹2.5 lakh before subsidies. Please verify current prices on Amazon, Flipkart, or directly with dealers as prices change frequently.',
  },
  {
    q: 'What does ALMM listing mean and why does it matter?',
    a: 'ALMM stands for Approved List of Models and Manufacturers, maintained by the Ministry of New and Renewable Energy (MNRE). Solar panels from ALMM-listed brands are eligible for government subsidy schemes like PM Surya Ghar Muft Bijli Yojana. If you plan to claim a government subsidy on your rooftop solar installation, you must use panels from ALMM-listed Indian manufacturers like Waaree, Tata Power Solar, Adani Solar, RenewSys, and others. Imported panels (Canadian Solar, LONGi) are not ALMM listed and are not eligible for subsidies.',
  },
  {
    q: 'What is the difference between monocrystalline and polycrystalline solar panels?',
    a: 'Monocrystalline (mono) panels are made from a single silicon crystal, giving them higher efficiency (18–22%) and better performance in low-light and high-temperature conditions. They are more expensive but generate more power per square foot — ideal for small rooftops. Polycrystalline (poly) panels are made from multiple silicon fragments, giving them lower efficiency (15–17%) but at a lower price. They are a good budget option for farms and open-ground installations with ample space.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

export default function BestSolarPanelBrandsIndia2025Article() {
  return (
    <>
      <Script
        id="faq-schema-solar"
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
                { label: 'Best Solar Panel Brands in India (2025)' },
              ]}
            />
          </div>
        </div>

        {/* Hero */}
        <header className="bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
            <div className="inline-block bg-emerald-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
              Solar Energy · Updated 2025
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-5">
              Best Solar Panel Brands in India (2025) – Best Brands for Home, Commercial &amp; Industrial Use
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed mb-8">
              A comprehensive, unbiased guide to India's top solar panel brands — compared by efficiency, BIS/ALMM certification, warranty, and price to help you make the right investment.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="bg-white/10 rounded-full px-3 py-1">20 min read</span>
              <span className="bg-white/10 rounded-full px-3 py-1">10 brands reviewed</span>
              <span className="bg-white/10 rounded-full px-3 py-1">BIS &amp; ALMM certified</span>
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
              { value: '73 GW+', label: 'India installed solar capacity (2025)' },
              { value: '25 yrs', label: 'Standard panel warranty in India' },
              { value: '₹78,000', label: 'Avg. 3kW home system cost (after subsidy)' },
              { value: '10 brands', label: 'Reviewed & compared in this guide' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center border-t-4 border-t-emerald-500">
                <div className="text-2xl font-extrabold text-slate-900 mb-1">{value}</div>
                <div className="text-xs text-slate-500 leading-snug">{label}</div>
              </div>
            ))}
          </div>

          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-5">Why Choosing the Right Solar Panel Brand Matters</h2>
            <div className="space-y-4 text-lg text-slate-700 leading-relaxed">
              <p>
                Every day, thousands of Indian homeowners and business owners invest ₹1.5 lakh to ₹10 lakh in solar panel installations — and many end up with under-performing panels, rejected subsidy claims, or unresponsive after-sales service simply because they chose the wrong brand.
              </p>
              <p>
                With over 200 solar panel brands available in India, the market is flooded with both excellent products and poor imitations. The right solar panel brand can deliver 25+ years of reliable energy savings. The wrong one can mean panels that degrade faster, warranties that are never honoured, and installers who disappear after payment.
              </p>
              <p>
                This guide cuts through the noise. We have researched and ranked the best solar panel brands in India for 2025 — focusing on manufacturing quality, BIS and ALMM certification, warranty terms, efficiency ratings, and real-world performance in Indian climatic conditions. Whether you are a homeowner, farmer, contractor, or business owner, this guide will help you choose the right brand with confidence.
              </p>
            </div>
          </section>

          {/* Buying Guide */}
          <section className="mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Things to Consider Before Buying Solar Panels in India</h2>
            <div className="divide-y divide-slate-200">
              {[
                {
                  title: '1. BIS Certification and ALMM Listing',
                  body: 'Always buy solar panels that are BIS (Bureau of Indian Standards) certified under IS 14286. For government subsidy eligibility — especially the PM Surya Ghar Muft Bijli Yojana — panels must be from ALMM (Approved List of Models and Manufacturers) listed Indian manufacturers. Imported panels from brands like Canadian Solar and LONGi are not ALMM listed and will not qualify for subsidies.',
                },
                {
                  title: '2. Panel Type: Mono PERC vs Polycrystalline',
                  body: 'Monocrystalline PERC panels offer higher efficiency (18–22%) and better performance in low-light and high-temperature conditions — ideal for small rooftops. Polycrystalline panels are cheaper but less efficient (15–17%), making them a good budget option for open farmland or large open-roof installations where space is not a constraint.',
                },
                {
                  title: '3. Efficiency and Wattage Rating',
                  body: 'Panel efficiency determines how much power is generated per square foot. In India, where rooftop space is often limited — especially in urban homes — higher efficiency panels generate more power from the same area. Look for panels rated at least 18% efficiency for home use. Also check the wattage: a 440W panel will generate approximately 30% more power than a 335W panel of the same size.',
                },
                {
                  title: '4. Warranty Terms',
                  body: "Solar panels come with two warranties: a product warranty (typically 10–12 years) covering manufacturing defects, and a linear performance warranty (typically 25–30 years) guaranteeing minimum power output over time. Always verify what percentage of original power output is guaranteed — most good panels guarantee 80% output at 25 years. Check whether the warranty is backed by the manufacturer directly or through a third-party guarantor in India.",
                },
                {
                  title: '5. Temperature Coefficient',
                  body: "India's climate is hot, and solar panels lose efficiency as temperature rises. The temperature coefficient measures how much power output drops per degree Celsius above 25°C. A lower temperature coefficient (e.g., -0.35%/°C) means better performance in Indian summers compared to panels with a coefficient of -0.45%/°C. Always check this specification for rooftops in hot regions like Rajasthan, Gujarat, or Tamil Nadu.",
                },
                {
                  title: '6. After-Sales Service and Dealer Network',
                  body: 'A solar panel system runs for 25+ years. Choose a brand with a strong, accessible service network in your city or district. Indian brands like Luminous, Waaree, and Tata Power Solar have wider Tier 2 and Tier 3 city coverage than imported brands. Ask your installer how quickly the brand responds to warranty claims and whether spare parts (junction boxes, cables, mounting hardware) are locally available.',
                },
              ].map(({ title, body }) => (
                <div key={title} className="py-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                  <p className="text-lg text-slate-700 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Brand Profiles */}
          <section className="mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Top 10 Solar Panel Brands in India (2025)</h2>
            <p className="text-lg text-slate-600 mb-8">Reviewed and ranked based on quality, certifications, warranty, efficiency, and market reputation.</p>

            <div className="divide-y divide-slate-200">
              {BRANDS.map((brand) => (
                <div key={brand.rank} className="py-10">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-5xl font-extrabold text-slate-100 leading-none select-none">{brand.rank}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-0.5 uppercase tracking-wide">
                          {brand.badge}
                        </span>
                        {brand.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">{tag}</span>
                        ))}
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">{brand.name}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">Est. {brand.founded} · {brand.hq}</p>
                    </div>
                  </div>

                  <p className="text-lg text-slate-700 leading-relaxed mb-5">{brand.overview}</p>

                  <div className="mb-5">
                    <p className="text-base font-semibold text-slate-800 mb-1">Best Model:</p>
                    <p className="text-lg text-emerald-700 font-medium">{brand.bestModel}</p>
                  </div>

                  <div className="mb-5">
                    <p className="text-base font-semibold text-slate-800 mb-3">Key Features</p>
                    <ul className="space-y-2">
                      {brand.features.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-base text-slate-700">
                          <span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6 mb-5">
                    <div>
                      <p className="text-base font-semibold text-slate-800 mb-3">Pros</p>
                      <ul className="space-y-2">
                        {brand.pros.map((p) => (
                          <li key={p} className="flex items-start gap-2 text-base text-slate-700">
                            <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">+</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-800 mb-3">Cons</p>
                      <ul className="space-y-2">
                        {brand.cons.map((c) => (
                          <li key={c} className="flex items-start gap-2 text-base text-slate-700">
                            <span className="text-red-400 font-bold mt-0.5 flex-shrink-0">−</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-6 text-base border-t border-slate-100 pt-4">
                    <div>
                      <span className="font-semibold text-slate-700">Best For: </span>
                      <span className="text-slate-600">{brand.bestFor}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Price Range: </span>
                      <span className="text-emerald-700 font-medium">{brand.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Comparison Table */}
          <section className="mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Solar Panel Brand Comparison Table (2025)</h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <table className="min-w-full text-base">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="px-4 py-3 text-left font-semibold">Brand</th>
                    <th className="px-4 py-3 text-left font-semibold">Top Model</th>
                    <th className="px-4 py-3 text-left font-semibold">Best For</th>
                    <th className="px-4 py-3 text-left font-semibold">Price Range</th>
                    <th className="px-4 py-3 text-left font-semibold">Warranty</th>
                    <th className="px-4 py-3 text-left font-semibold">BIS/ALMM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {COMPARISON.map((row, i) => (
                    <tr key={row.brand} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{row.brand}</td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{row.model}</td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{row.bestFor}</td>
                      <td className="px-4 py-3 text-emerald-700 font-medium whitespace-nowrap">{row.price}</td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{row.warranty}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.bis ? (
                          <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full border border-green-200">✓ Certified</span>
                        ) : (
                          <span className="inline-block bg-slate-100 text-slate-500 text-xs font-medium px-2 py-0.5 rounded-full">Imported</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-slate-500 mt-3">
              * Prices are approximate and vary by wattage, quantity, and supplier. Verify current prices on Amazon, Flipkart, or directly with authorised dealers before purchasing.
            </p>
          </section>

          {/* Which Brand Should You Choose */}
          <section className="mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Which Solar Panel Brand Should You Choose?</h2>
            <div className="divide-y divide-slate-200">
              {[
                {
                  heading: 'Best for Home Use',
                  body: 'Go with Tata Power Solar or Luminous Solar. Tata Power Solar gives you the highest confidence in warranty and after-sales support, backed by the Tata Group. Luminous is ideal if you want a one-stop shop — panels, inverters, and batteries all from one brand with a wide service network. Both are BIS certified and ALMM listed for government subsidy eligibility. For small urban rooftops with space constraints, Loom Solar SHARK series is an excellent choice.',
                },
                {
                  heading: 'Best for Commercial Use',
                  body: 'Waaree Energies and Adani Solar are the top solar panel brands in India for commercial rooftop and industrial installations. Both offer high-efficiency mono PERC and bifacial panels, strong supply chains for bulk orders, and ALMM listing for subsidy and tender eligibility. If you are looking for a premium internationally bankable option, Canadian Solar and LONGi Solar are excellent for large projects where financing and global warranties matter.',
                },
                {
                  heading: 'Best Budget Option',
                  body: 'Microtek Solar and RenewSys India offer the most competitive prices among BIS certified solar panel brands in India. Microtek is ideal for homeowners with a tight budget who want a known brand and wide availability. RenewSys is a solid choice for subsidy-scheme installations at lower cost. Both come with 25-year performance warranties and are eligible for PM Surya Ghar subsidies.',
                },
                {
                  heading: 'Best Premium Option',
                  body: 'Vikram Solar is the clear premium choice — their ELDORA PRO bifacial panels offer up to 22.5% efficiency and come with a 30-year linear power warranty, the best in India. Canadian Solar is the premium choice for buyers who want internationally bankable panels for large commercial or industrial projects. Both cost more but deliver superior long-term performance and warranty security.',
                },
              ].map(({ heading, body }) => (
                <div key={heading} className="py-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{heading}</h3>
                  <p className="text-lg text-slate-700 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section className="mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
            <div className="divide-y divide-slate-200">
              {FAQ_ITEMS.map(({ q, a }) => (
                <div key={q} className="py-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{q}</h3>
                  <p className="text-lg text-slate-700 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Conclusion */}
          <section className="mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-5">Conclusion</h2>
            <div className="space-y-4 text-lg text-slate-700 leading-relaxed">
              <p>
                India's solar market has matured significantly, and buyers today have access to world-class solar panel brands in India — both homegrown and international. Our top three picks for 2025 are <strong>Waaree Energies</strong> for the best combination of quality and value, <strong>Tata Power Solar</strong> for the most trusted home brand, and <strong>Vikram Solar</strong> for the best long-term investment with a 30-year warranty.
              </p>
              <p>
                If you are buying for a government-subsidised rooftop system, stick to ALMM-listed Indian brands — Waaree, Tata Power Solar, Adani Solar, Luminous, Loom Solar, or RenewSys. If you are buying for a large commercial or industrial project without subsidy constraints, Canadian Solar and LONGi Solar are excellent internationally bankable options.
              </p>
              <p>
                Always get at least three quotes from certified installers, verify the panel model is from an ALMM-listed manufacturer if applying for subsidies, and confirm the warranty terms in writing before signing any contract. Check the latest prices on Amazon, Flipkart, or directly with authorised brand dealers — solar panel prices fluctuate with raw material costs and government policy.
              </p>
              <p className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <strong>Disclaimer:</strong> Prices mentioned in this article are approximate and based on market data available at the time of writing. Actual prices may vary by region, quantity, wattage, and supplier. Always verify current prices on Amazon, Flipkart, or directly with authorised dealers before making a purchase decision.
              </p>
            </div>
          </section>

          {/* Related Keywords */}
          <div className="mb-12">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Related Topics</p>
            <div className="flex flex-wrap gap-2">
              {[
                'Solar Panel Brands in India',
                'Best Solar Panels 2025',
                'Mono PERC Solar Panel India',
                'BIS Certified Solar Panel',
                'ALMM Listed Solar Panels',
                'Solar Panel for Home India',
                'Rooftop Solar Subsidy India',
                'PM Surya Ghar Yojana',
                'Solar Panel Price per Watt India',
                'Waaree Solar Panel',
                'Tata Power Solar Panel',
                'Bifacial Solar Panel India',
              ].map((kw) => (
                <span key={kw} className="text-xs bg-slate-100 text-slate-600 rounded-full px-3 py-1 border border-slate-200">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 p-8 md:p-10 text-center text-white">
            <h3 className="text-xl font-bold mb-2">Find Solar Installers &amp; Dealers Near You</h3>
            <p className="text-emerald-100 max-w-md mx-auto mb-6 text-base">
              Browse verified solar installation companies and EPC contractors across India. Compare reviews, services, and pricing.
            </p>
            <Link href={getDirectoryUrl()}>
              <span className="inline-block bg-white text-slate-900 hover:bg-emerald-50 font-semibold rounded-xl px-7 py-3 text-base transition-colors cursor-pointer">
                Browse Directory
              </span>
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
