'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { createPageUrl } from '@/utils';
import Breadcrumb from '@/components/Breadcrumb';

const FEATURED_IMAGE = {
  src: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=1200&q=85',
  alt: 'Top ice cream companies in the United States 2026 — premium ice cream scoops in waffle cones',
  width: 1200,
  height: 630,
};

const COMPANIES = [
  {
    rank: 1,
    name: 'Häagen-Dazs',
    founded: 1961,
    hq: 'Oakland, California (Nestlé/Dreyer\'s in US)',
    revenue: '~$1.0 billion in US retail sales',
    products: 'Pints (Vanilla, Chocolate, Strawberry, Dulce de Leche), Trio Crispy Layers, Heaven, Spirits, mini cups, ice cream bars',
    reach: 'National (US + 50+ countries globally)',
    audience: 'Premium consumers, gift buyers, affluent suburban households',
    edge: "Häagen-Dazs invented the super-premium category. The recipe is uncompromising — high butterfat (16%+), zero air whipped in (low overrun), and only five ingredients in the original Vanilla. Its global brand cachet justifies a price tag 30–50% above mid-market. The Trio Crispy Layers launch in 2022 reinvigorated US growth and remains a category-defining innovation.",
  },
  {
    rank: 2,
    name: "Ben & Jerry's",
    founded: 1978,
    hq: 'South Burlington, Vermont (Unilever)',
    revenue: '~$900 million in US retail',
    products: 'Pints (Cherry Garcia, Phish Food, Chunky Monkey, Half Baked, Americone Dream), Non-Dairy line, Topped, Light Ice Cream, mini cups',
    reach: 'National (US + 35+ countries)',
    audience: 'Millennials, Gen Z, mission-driven consumers, college campuses',
    edge: "Ben & Jerry's owns the chunk-and-swirl pint format like no one else — Cherry Garcia and Chunky Monkey are pop-culture references, not just SKUs. Its values-led brand (climate, fair trade, social justice) gives it cultural permission to charge premium pricing. The Non-Dairy line launched in 2016 made it the leading dairy-free pint brand in America before most legacy competitors had even noticed the category.",
  },
  {
    rank: 3,
    name: 'Breyers',
    founded: 1866,
    hq: 'Englewood Cliffs, New Jersey (Unilever)',
    revenue: '~$700 million in US retail',
    products: 'Natural Vanilla, Original (Mint Chocolate Chip, Rocky Road, Butter Pecan), CarbSmart, Lactose Free, Delights protein line, Frozen Dairy Dessert range',
    reach: 'National',
    audience: 'Mainstream families, value-conscious shoppers, supermarkets',
    edge: "Breyers is the heritage all-American family ice cream — the half-gallon (now 1.5-quart) tub that lives in tens of millions of US freezers. Its Natural Vanilla, made with five real ingredients and a yellow tint from real vanilla bean, is one of the best-selling ice cream SKUs in America. Breyers Delights pioneered the high-protein, lower-calorie pint format that Halo Top later popularized.",
  },
  {
    rank: 4,
    name: 'Baskin-Robbins',
    founded: 1945,
    hq: 'Canton, Massachusetts (Inspire Brands)',
    revenue: '~$1.4 billion in US system sales',
    products: 'The "31 flavors" rotation, Polar Pizza, ice cream cakes, sundaes, milkshakes, Cappuccino Blast',
    reach: 'National (~2,300 US locations) + 50+ countries',
    audience: 'Families with kids, birthday parties, mall and strip-center traffic, after-dinner dessert',
    edge: "Baskin-Robbins is the world's largest ice cream specialty chain by store count and effectively defined the American scoop-shop format. The '31 flavors' branding (one for every day of the month) is a marketing masterpiece that has survived since 1953. Its ice cream cakes business alone generates hundreds of millions annually and dominates the US celebration-cake category.",
  },
  {
    rank: 5,
    name: 'Blue Bell Creameries',
    founded: 1907,
    hq: 'Brenham, Texas',
    revenue: '~$700 million estimated',
    products: 'Homemade Vanilla, Dutch Chocolate, The Great Divide, Mint Chocolate Chip, Cookies \'n Cream, Mooo-llennium Crunch, half-gallons and pints, ice cream sandwiches',
    reach: 'Regional (~23 states, primarily Southern and Mountain US)',
    audience: 'Texas and Southern US loyalists, regional grocery chains, family freezers',
    edge: "Blue Bell is a regional cult brand. Despite being sold in roughly half the country, it ranks among the top 5 ice cream brands in the US by volume — proof of how fanatically loyal its customers are. Its Homemade Vanilla is consistently rated one of the best-tasting vanilla ice creams in blind tests against premium national competitors. Family-owned for over a century, Blue Bell has steadfastly refused to expand into markets it cannot supply with same-week delivery.",
  },
  {
    rank: 6,
    name: 'Tillamook',
    founded: 1909,
    hq: 'Tillamook, Oregon',
    revenue: '~$1.0 billion (overall co-op, includes cheese + butter)',
    products: 'Old Fashioned Vanilla, Oregon Strawberry, Mountain Huckleberry, Marionberry Pie, Tillamook Mudslide, ice cream sandwiches, novelties',
    reach: 'National (rapidly expanding from West Coast roots)',
    audience: 'Premium-but-approachable shoppers, Pacific Northwest loyalists, Whole Foods + mainstream grocery',
    edge: "Tillamook is a 100+ year farmer-owned cooperative that has parlayed its cheese reputation into one of the fastest-growing premium ice cream brands in America. The 48-ounce square pack — bigger than a pint, smaller than a half-gallon — is uniquely Tillamook and lets it sit between value and premium tiers. Local-flavored SKUs like Oregon Strawberry and Marionberry Pie give it a regional authenticity that no national brand can match.",
  },
  {
    rank: 7,
    name: 'Turkey Hill',
    founded: 1931,
    hq: 'Conestoga, Pennsylvania (Peet\'s/Peet\'s parent JDE Peet\'s and Kroger spinoff)',
    revenue: '~$500 million estimated',
    products: 'Original Recipe, Premium, Light Recipe, All Natural Recipe, Stewart\'s, Trio\'politan, Iced Coffee, Iced Tea',
    reach: 'National (strongest in Mid-Atlantic, Midwest, Southeast)',
    audience: 'Mainstream households, value seekers, ice tea + ice cream cross-buyers',
    edge: "Turkey Hill rose from a Lancaster County, Pennsylvania dairy into a national mid-tier ice cream powerhouse. Its 1.5-quart 'Original Recipe' carton is one of the highest-velocity ice cream SKUs in mainstream supermarkets, hitting a sweet spot between Breyers and store-brand pricing. Turkey Hill also dominates the bottled iced-tea category — a rare brand that owns shelf real estate in two completely different aisles.",
  },
  {
    rank: 8,
    name: "Dreyer's / Edy's",
    founded: 1928,
    hq: 'Oakland, California (Froneri / Nestlé JV)',
    revenue: '~$800 million in US retail (combined Dreyer\'s + Edy\'s + Drumstick novelties)',
    products: 'Slow Churned (light), Grand (full-fat), Dibs, Drumstick, Fruit Bars, Outshine, Häagen-Dazs distribution in US',
    reach: 'National (Dreyer\'s in West, Edy\'s east of Rockies — same product, different name)',
    audience: 'Mainstream families, calorie-conscious shoppers, novelty buyers',
    edge: "Dreyer's invented Slow Churned ice cream — a low-fat, low-calorie format that genuinely tastes like full-fat ice cream — long before Halo Top made the category famous. The brand also owns Drumstick (the iconic ice cream cone novelty) and the Outshine fruit bar lineup, giving Dreyer's/Edy's the broadest US ice cream portfolio outside of Unilever.",
  },
  {
    rank: 9,
    name: 'Talenti',
    founded: 2003,
    hq: 'Englewood Cliffs, New Jersey (Unilever, acquired 2014)',
    revenue: '~$400 million in US retail',
    products: 'Gelato pints (Sea Salt Caramel, Vanilla Caramel Truffle, Belgian Milk Chocolate), Sorbetto, Layers, Dairy-Free',
    reach: 'National',
    audience: 'Premium-skewing Millennials and Gen X, foodies, gelato enthusiasts',
    edge: "Talenti made gelato a mass-market category in America. The clear, BPA-free plastic jar — instantly recognizable, screw-top reusable, made for refrigerator-door display — is one of the most successful packaging innovations in modern US grocery. Its slow-cook caramel and chocolate flavors have set the bar for what super-premium frozen dessert can taste like, and Talenti remains the #1 gelato brand in the US.",
  },
  {
    rank: 10,
    name: "Friendly's",
    founded: 1935,
    hq: 'Wilbraham, Massachusetts (Brix Holdings)',
    revenue: '~$300 million in retail + restaurant ice cream',
    products: 'Friendly\'s Original Vanilla, Mint Chocolate Chip, Forbidden Chocolate, Wattamelon Roll, Sundae Singles, ice cream cakes',
    reach: 'Regional (Northeast US grocery + ~125 Friendly\'s restaurants)',
    audience: 'Northeast US families, nostalgia buyers, dine-in dessert customers',
    edge: "Friendly's holds a rare two-channel position — a 90-year-old Northeast restaurant chain AND a packaged ice cream brand sold in supermarkets across the region. The Wattamelon Roll (watermelon-shaped sherbet log) and Friendly's ice cream cakes are unmatched seasonal SKUs. The restaurants reinforce the retail brand and vice-versa — a flywheel competitors cannot easily replicate.",
  },
  {
    rank: 11,
    name: 'Good Humor',
    founded: 1920,
    hq: 'Englewood Cliffs, New Jersey (Unilever)',
    revenue: '~$500 million in US retail (novelty)',
    products: 'Strawberry Shortcake bar, Chocolate Eclair bar, Toasted Almond bar, Giant Cookie sandwich, Oreo Cookie Sandwich, Ice Cream Sandwich',
    reach: 'National grocery + ice cream truck operators',
    audience: 'Childhood-nostalgia adults, families, ice cream truck customers',
    edge: "Good Humor is American summer. Its Strawberry Shortcake and Chocolate Eclair bars are arguably the most recognizable ice cream novelties in the US — sold in every corner grocery, gas station freezer, beach concession, and ice cream truck for over a century. Good Humor's brand equity is why even the company's frequent recipe tweaks haven't dented sales — consumers buy the memory as much as the bar.",
  },
  {
    rank: 12,
    name: 'Halo Top',
    founded: 2011,
    hq: 'Los Angeles, California (Wells Enterprises)',
    revenue: '~$300 million in US retail',
    products: 'Light Ice Cream pints (Birthday Cake, Sea Salt Caramel, Chocolate Chip Cookie Dough), Dairy-Free, Keto, Pop bars, mini cups',
    reach: 'National + International (UK, Mexico, Australia)',
    audience: 'Calorie-counters, fitness consumers, late-night snackers, Millennials and Gen Z',
    edge: "Halo Top broke the rules. By printing the calorie count of the entire pint (260–360 calories) on the front of the label, it turned 'eating the whole pint' from a guilty admission into a marketing strategy. In 2017 it briefly outsold Häagen-Dazs and Ben & Jerry's pints — a once-in-a-generation grocery story. The brand singlehandedly created the better-for-you pint category that virtually every legacy player now competes in.",
  },
];

const TRENDS = [
  { title: 'Dairy-Free & Plant-Based', text: 'Oat milk, almond milk, and coconut-cream ice creams have moved from natural-foods specialty to every mainstream freezer in America. Ben & Jerry\'s Non-Dairy, Häagen-Dazs Non-Dairy, So Delicious, NadaMoo, and Oatly are growing 15–20% annually while traditional dairy ice cream is flat. Plant-based now accounts for 5–6% of the total US ice cream category and is forecast to hit 10% by 2030.' },
  { title: 'Premium & Artisan Boom', text: 'Super-premium and craft brands — Jeni\'s Splendid, Salt & Straw, Van Leeuwen, Tipsy Scoop — are taking grocery shelf share at the expense of mid-tier. Consumers are buying ice cream less often but spending more per visit. The $7–$10 pint is now firmly mainstream.' },
  { title: 'Better-For-You Reformulations', text: 'High-protein, low-sugar, keto-friendly, and reduced-calorie pints (Halo Top, Enlightened, Rebel, Nick\'s, Yasso) are the fastest-growing segment in the freezer. Even legacy brands have launched lower-calorie sub-lines (Breyers Delights, Edy\'s Slow Churned, Tillamook Light).' },
  { title: 'Innovative & Limited-Edition Flavors', text: 'Limited drops drive freezer foot traffic. Häagen-Dazs Trio Crispy Layers, Ben & Jerry\'s Netflix and Chill\'d, Talenti Layers, Salt & Straw monthly menus, and Tillamook regional collabs all use scarcity and surprise to convert browsing shoppers into impulse buyers.' },
  { title: 'Sustainable Packaging & Sourcing', text: 'Recyclable paper-based pint cups, fiber lids, RFA-certified cocoa, fair-trade vanilla, regenerative dairy, and methane-reduced cattle herds are no longer marketing fluff — they\'re expected. Tillamook is carbon-neutral. Ben & Jerry\'s reports Scope 3 emissions per pint. Consumers under 35 increasingly check labels for sustainability claims before reaching for a brand.' },
  { title: 'Direct-to-Consumer & E-Commerce', text: 'Frozen e-commerce — once a logistical impossibility — is now mainstream. Salt & Straw, Jeni\'s, and Tipsy Scoop ship dry-ice-packed pints nationwide. Goldbelly aggregates dozens of regional creameries. Instacart, DoorDash, and Uber Eats have made same-day frozen delivery routine. The grocery freezer is no longer the only retail channel.' },
];

const TIPS = [
  { title: 'Product quality & ingredient transparency', text: 'Look for short ingredient lists, real cream, real fruit, and absence of artificial flavoring or stabilizers. The brands rated highest in blind taste tests almost always have the simplest labels.' },
  { title: 'Brand reputation & customer reviews', text: 'Check Yelp for scoop shops, IRI/Nielsen velocity data for grocery brands, and Reddit communities like r/icecream for unfiltered consumer sentiment. Reputation is the cheapest market-research tool you have.' },
  { title: 'Franchise costs & unit economics', text: 'Baskin-Robbins, Friendly\'s, Cold Stone Creamery, and Marble Slab Creamery all franchise. Initial investment ranges from $250K–$700K, plus 5–6% royalty fees. Average unit volume varies widely by brand and location.' },
  { title: 'Distribution network', text: 'For private-label or co-pack opportunities, evaluate the distributor footprint. National coverage requires a partner with cold-chain infrastructure in every region — Dreyer\'s, Wells Enterprises, Hershey Creamery, and Schwan\'s lead in this space.' },
  { title: 'Innovation pipeline', text: 'How often does the brand launch new flavors? Limited editions? New formats? Brands with active R&D pipelines (Häagen-Dazs Trio, Talenti Layers, Halo Top Pop) outperform sleepy heritage brands in same-store growth.' },
  { title: 'Target demographic alignment', text: 'A premium gelato sold in a value supermarket will fail. A budget novelty sold at Whole Foods will fail. Match the brand to the demographic, channel, and price tier of the customer base you actually serve.' },
];

const FAQ_ITEMS = [
  { q: 'What is the largest ice cream company in the United States?', a: 'By total US retail dollar share, Häagen-Dazs and Ben & Jerry\'s (both Unilever) are typically the top two pint brands. By total volume across all formats including novelties and food-service, Unilever (which also owns Breyers, Talenti, Good Humor, and Magnum) is the largest player in the US ice cream market, followed by Nestlé/Froneri (Dreyer\'s, Edy\'s, Häagen-Dazs distribution, Drumstick).' },
  { q: 'How big is the US ice cream industry in 2026?', a: 'The US ice cream market is valued at approximately $13.5 billion in 2026 and is growing at roughly 4–5% annually. Premium and better-for-you segments are growing significantly faster than the overall market — both in the 8–12% range — while value and traditional novelty are flat to slightly declining.' },
  { q: 'Which ice cream brand is the most popular in America?', a: 'By household penetration, Breyers and Häagen-Dazs are typically the top mainstream and premium brands respectively. Ben & Jerry\'s leads in cultural and brand awareness scores. Blue Bell punches far above its weight in the regional markets it serves and ranks in the top 5 by volume despite being sold in only roughly half the country.' },
  { q: 'What is the best premium ice cream brand in the United States?', a: 'Häagen-Dazs and Ben & Jerry\'s anchor the super-premium pint segment. For artisan-tier premium, Jeni\'s Splendid, Salt & Straw, Van Leeuwen, and Tillamook lead — though only Tillamook has full national distribution. Talenti dominates the gelato sub-category.' },
  { q: 'Are dairy-free ice creams really growing fast?', a: 'Yes — dairy-free ice cream is one of the fastest-growing categories in the entire US frozen aisle, growing 15–20% annually compared to flat traditional dairy. Ben & Jerry\'s Non-Dairy, Häagen-Dazs Non-Dairy, So Delicious, Oatly, and NadaMoo lead the segment. Plant-based now represents about 5–6% of total US ice cream sales.' },
  { q: 'How do I open an ice cream franchise in the US?', a: 'The largest franchisable ice cream brands in America include Baskin-Robbins (~$300K initial investment), Cold Stone Creamery (~$300K–$450K), Marble Slab Creamery, Friendly\'s, and regional players like Bruster\'s and Carvel. Each requires a Franchise Disclosure Document (FDD) review, qualifying liquid capital, real estate approval, and a multi-week training program. Royalty fees typically run 5–6% of gross sales.' },
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
  headline: 'Top Ice Cream Companies in the United States: The Complete Guide [2026]',
  description: 'A comprehensive guide to the top 12 ice cream companies in the United States for 2026 — Häagen-Dazs, Ben & Jerry\'s, Breyers, Baskin-Robbins, Blue Bell, Tillamook, Turkey Hill, Dreyer\'s/Edy\'s, Talenti, Friendly\'s, Good Humor, and Halo Top. Industry trends, comparison table, and how to choose the right brand or franchise.',
  image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=1200&q=85',
  datePublished: '2026-05-02',
  dateModified: '2026-05-02',
  author: { '@type': 'Organization', name: 'FirmsLedger Editorial Team' },
  publisher: {
    '@type': 'Organization',
    name: 'FirmsLedger',
    logo: { '@type': 'ImageObject', url: 'https://www.firmsledger.com/logo.png' },
  },
};

export default function TopIceCreamCompaniesUSA2026Article() {
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
              { label: 'Top Ice Cream Companies USA (2026)' },
            ]}
          />
        </div>
      </div>

      <header className="bg-gradient-to-br from-pink-600 via-rose-500 to-orange-400 text-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block bg-white/95 text-pink-700 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg mb-6">
            Food &amp; Beverage · Ice Cream · USA · 2026
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight max-w-3xl leading-tight">
            Top Ice Cream Companies in the United States: The Complete Guide [2026]
          </h1>
          <p className="text-pink-50 text-lg mt-5 max-w-2xl leading-relaxed">
            Americans eat <strong>23 pounds</strong> of ice cream per person every year. Twelve companies do the heavy lifting. Here&apos;s the 2026 inside-out guide to the brands that own America&apos;s freezer.
          </p>
          <div className="flex flex-wrap items-center gap-6 mt-8 text-sm text-pink-100">
            <span>Updated: May 2026</span>
            <span>15 min read</span>
            <span>12 Brands Reviewed</span>
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
            Here&apos;s a number that should make you pause: the average American eats roughly <strong>23 pounds of ice cream every single year</strong> — about <strong>4.5 gallons per person</strong>. Multiply that across 332 million Americans and you get one of the most beloved, most consumed, and most fiercely fought-over food categories in the country. Ice cream is not just dessert — it&apos;s ritual, comfort, celebration, and a lazy Sunday afternoon in a single scoop.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-5">
            The US ice cream market is now valued at approximately <strong>$13.5 billion</strong> and is growing at roughly <strong>4–5% annually</strong>, with premium, dairy-free, and better-for-you sub-categories pulling double-digit growth. From the small-town creameries of Vermont and Texas to the global super-premium giants of California and New Jersey, twelve companies dominate the freezer aisle, the scoop shop, and increasingly the mailbox via dry-ice e-commerce.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed">
            This guide is your complete 2026 tour of the <strong>top ice cream companies in the USA</strong>: who they are, what they sell, who they sell to, what makes each one impossible to copy, and where the entire industry is headed next. Whether you&apos;re a passionate ice cream lover, a dessert entrepreneur shopping franchise FDDs, a grocery buyer planning your next set, or an investor sizing up the category — grab a spoon.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Snapshot of the US Ice Cream Industry in 2026</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {[
              { stat: '$13.5B', label: 'Total US retail value (2026)' },
              { stat: '4–5%', label: 'Annual category growth' },
              { stat: '23 lbs', label: 'Per-person annual consumption' },
              { stat: '5–6%', label: 'Plant-based market share (and rising)' },
            ].map((s) => (
              <div key={s.label} className="bg-pink-50 border border-pink-100 rounded-xl p-5">
                <p className="text-3xl font-extrabold text-pink-700 mb-1">{s.stat}</p>
                <p className="text-slate-700 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-slate-600 leading-relaxed mb-4">
            The category splits roughly into four segments. <strong>Premium &amp; super-premium</strong> (Häagen-Dazs, Ben &amp; Jerry&apos;s, Talenti, Tillamook, Jeni&apos;s) is the fastest-growing tier and now accounts for nearly 40% of total dollar sales. <strong>Mainstream and value</strong> (Breyers, Turkey Hill, Edy&apos;s, store brands) still moves the most volume but is flat in dollars. <strong>Dairy-free and better-for-you</strong> (Halo Top, Ben &amp; Jerry&apos;s Non-Dairy, So Delicious, Oatly, Yasso) is the explosive growth segment. <strong>Novelties</strong> (Good Humor, Drumstick, Magnum, ice cream sandwiches, popsicles) is a steady, high-margin category that owns summer and convenience.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Driving the 2026 growth: a return-to-indulgence post-pandemic, a wave of plant-based reformulations that finally taste like the dairy original, calorie-conscious pints that no longer compromise on flavor, and direct-to-consumer e-commerce that makes regional creameries accessible to anyone with a freezer.
          </p>
        </section>

        <section className="mb-12" aria-labelledby="top-companies">
          <h2 id="top-companies" className="text-2xl font-bold text-slate-900 mb-2">
            Top 12 Ice Cream Companies in the USA (2026)
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            Ranked by combined retail revenue, brand equity, distribution scale, and category influence.
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
                  <div className="bg-pink-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-pink-700 uppercase tracking-wide mb-1">Revenue</p>
                    <p className="text-slate-700 text-sm">{c.revenue}</p>
                  </div>
                  <div className="bg-rose-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-rose-700 uppercase tracking-wide mb-1">Distribution Reach</p>
                    <p className="text-slate-700 text-sm">{c.reach}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1">Flagship Products</p>
                    <p className="text-slate-700 text-sm">{c.products}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Target Audience</p>
                    <p className="text-slate-700 text-sm">{c.audience}</p>
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
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-sm">
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
          <h2 className="text-2xl font-bold text-slate-900 mb-3">How to Choose the Right Ice Cream Brand or Franchise</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            Whether you&apos;re a grocery buyer evaluating a new set, a dessert entrepreneur weighing a franchise, or an investor looking for an under-the-radar regional brand to back, the framework below applies universally.
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
                  <th className="text-left px-4 py-3 font-semibold">Founded</th>
                  <th className="text-left px-4 py-3 font-semibold">HQ</th>
                  <th className="text-left px-4 py-3 font-semibold">Flagship</th>
                  <th className="text-left px-4 py-3 font-semibold">Reach</th>
                  <th className="text-left px-4 py-3 font-semibold">Specialty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  ['1', 'Häagen-Dazs', '1961', 'Oakland, CA', 'Vanilla pint', 'National + 50 countries', 'Super-premium pints'],
                  ['2', "Ben & Jerry's", '1978', 'Vermont', 'Cherry Garcia', 'National + 35 countries', 'Chunk-and-swirl, mission brand'],
                  ['3', 'Breyers', '1866', 'New Jersey', 'Natural Vanilla', 'National', 'Mainstream family ice cream'],
                  ['4', 'Baskin-Robbins', '1945', 'Massachusetts', '31 flavors', '~2,300 US stores', 'Scoop-shop chain + ice cream cakes'],
                  ['5', 'Blue Bell', '1907', 'Brenham, TX', 'Homemade Vanilla', '~23 states', 'Regional cult brand'],
                  ['6', 'Tillamook', '1909', 'Tillamook, OR', 'Old Fashioned Vanilla', 'National', 'Farmer-owned premium co-op'],
                  ['7', 'Turkey Hill', '1931', 'Pennsylvania', 'Original Recipe', 'National', 'Mid-tier value'],
                  ['8', "Dreyer's / Edy's", '1928', 'Oakland, CA', 'Slow Churned', 'National', 'Light + novelty (Drumstick)'],
                  ['9', 'Talenti', '2003', 'New Jersey', 'Sea Salt Caramel', 'National', '#1 US gelato'],
                  ['10', "Friendly's", '1935', 'Massachusetts', 'Wattamelon Roll', 'Northeast US', 'Restaurant + retail'],
                  ['11', 'Good Humor', '1920', 'New Jersey', 'Strawberry Shortcake bar', 'National', 'Iconic novelty bars'],
                  ['12', 'Halo Top', '2011', 'Los Angeles, CA', 'Birthday Cake light pint', 'National + International', 'Better-for-you pints'],
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

        <section className="mb-12 bg-gradient-to-br from-pink-600 via-rose-500 to-orange-400 text-white rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl font-bold mb-4">The Future of American Ice Cream</h2>
          <p className="text-pink-50 leading-relaxed mb-4">
            The next five years of US ice cream will look very different from the last fifty. Plant-based will move from 5% of the freezer to 10%+. Better-for-you pints will become a default expectation, not a niche. Direct-to-consumer creameries that didn&apos;t exist in 2020 will rival regional brands in sales. And legacy giants — Häagen-Dazs, Breyers, Ben &amp; Jerry&apos;s — will keep winning by doing what they have done for half a century: making the most reliable, indulgent scoop you can find without leaving your kitchen.
          </p>
          <p className="text-pink-50 leading-relaxed mb-5">
            For consumers, it&apos;s the best era ever to be an ice cream lover — more flavors, more formats, more dietary options, more delivery channels than any previous generation. For entrepreneurs and investors, the category remains one of the most consistently profitable corners of US grocery, with clear gaps still open in regional premium, plant-based novelty, and direct-to-consumer subscription.
          </p>
          <p className="text-white font-semibold text-lg">
            Pick your brand. Pick your scoop. The freezer is open. 🍦
          </p>
        </section>

        <div className="text-center py-8 border-t border-slate-200">
          <p className="text-slate-600 mb-4 text-lg">
            Looking for verified food &amp; beverage suppliers and franchise opportunities?
          </p>
          <Link
            href="/directory"
            className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Browse the FirmsLedger Directory
          </Link>
        </div>

      </main>
    </article>
  );
}
