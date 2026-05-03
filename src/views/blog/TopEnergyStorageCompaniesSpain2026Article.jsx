'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { createPageUrl } from '@/utils';
import Breadcrumb from '@/components/Breadcrumb';

const FEATURED_IMAGE = {
  src: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1200&q=85',
  alt: 'Top energy storage companies in Spain 2026 — wind farm and grid-scale battery storage facility',
  width: 1200,
  height: 630,
};

const COMPANIES = [
  {
    rank: 1,
    name: 'Iberdrola',
    founded: 1992,
    hq: 'Bilbao, Spain',
    capacity: 'Operating ~4.4 GW of pumped hydro globally + ~600 MW BESS pipeline in Iberia',
    tech: 'Pumped hydro, lithium-ion BESS, green hydrogen, hybrid renewable + storage plants',
    projects: 'Tâmega (Portugal/Iberia) 1,158 MW pumped hydro, Andévalo solar+storage hybrid, Puertollano green hydrogen plant (Spain\'s first 100% renewable industrial-scale)',
    partners: 'Red Eléctrica, EU IPCEI, BP, H2 Green Steel, Cummins',
    edge: "Iberdrola is Europe's largest renewable utility and the single most important energy storage operator on the Iberian peninsula. It owns four of Spain's largest pumped-hydro stations and is the country's lead developer of green hydrogen at industrial scale. Its hybrid plants (solar + wind + battery + hydrogen) at Puertollano and elsewhere are templates for how the rest of Europe will integrate storage with intermittent renewables.",
  },
  {
    rank: 2,
    name: 'Endesa',
    founded: 1944,
    hq: 'Madrid, Spain (Enel Group)',
    capacity: '~2 GW of pumped hydro + ~1 GW BESS in development across Spain',
    tech: 'Lithium-ion BESS, pumped hydro, integrated renewable + storage at retired coal sites',
    projects: 'Andorra (Teruel) 1,585 MW renewable cluster with BESS at former coal plant site, Carboneras (Almería) repurposing, Compostilla (León) hybrid project',
    partners: 'Enel X, REE, IDAE, regional governments of Aragón and Andalusia',
    edge: "Endesa, Spain's biggest electricity utility by retail customers, is leading the country's just transition by converting decommissioned coal sites into renewable-plus-storage hubs. Its Andorra project in Teruel is among the largest single-site renewable redevelopments in Europe — combining solar, wind, BESS, and hydrogen production on land that powered Spain's coal economy for 40 years.",
  },
  {
    rank: 3,
    name: 'Repsol',
    founded: 1987,
    hq: 'Madrid, Spain',
    capacity: '~600 MW renewable + storage in Spain operating; 1.7+ GW pipeline',
    tech: 'Lithium-ion BESS co-located with PV, green hydrogen, e-fuels, advanced biofuels',
    projects: 'Kappa solar plant + BESS (Manzanares, Ciudad Real), Frontera + Valdesolar solar parks with future storage, Bilbao green hydrogen hub at Petronor refinery',
    partners: 'EnBW, Saudi Aramco, Ibereólica, Spanish Ministry for Ecological Transition',
    edge: "Repsol's pivot from oil major to integrated low-carbon multi-energy company is one of the most credible transitions in European energy. Its strategy uniquely combines BESS with green hydrogen and synthetic fuels — addressing both the short-duration (battery) and long-duration (hydrogen) storage needs that pure-play storage companies cannot. Repsol intends to invest €6.5B in low-carbon by 2030.",
  },
  {
    rank: 4,
    name: 'Acciona Energía',
    founded: 1997,
    hq: 'Alcobendas, Madrid',
    capacity: '~13 GW renewable globally + 2 GW Spanish storage pipeline',
    tech: 'Lithium-ion BESS, hybrid solar + storage, green hydrogen via Plug Power JV',
    projects: 'Montes del Cierzo BESS (Navarra), El Romero hybrid PV+storage, Mallorca battery storage cluster, Stelaris e-methanol facility',
    partners: 'Plug Power, Nordex, Caterpillar, regional Navarra and Aragón authorities',
    edge: "Acciona Energía is the only major listed company in Spain that operates exclusively in renewables and storage — no fossil legacy. Its hybrid plants in Navarra and the Balearics show how BESS can stabilize grids on both peninsular and island systems. Acciona was also the first IPP in Spain to receive EU Innovation Fund support for green hydrogen at scale.",
  },
  {
    rank: 5,
    name: 'Naturgy',
    founded: 1843,
    hq: 'Madrid, Spain',
    capacity: '~5 GW renewable globally + dedicated storage targets in Spain',
    tech: 'BESS, pumped hydro (legacy + new), green gas / biomethane, integrated gas-to-storage strategies',
    projects: 'La Muela pumped hydro modernization, hybrid PV + BESS in Andalusia and Castilla-La Mancha, Mallorca grid services',
    partners: 'CriteriaCaixa, IFM Investors, Sonatrach, Spanish TSO Red Eléctrica',
    edge: "Naturgy combines a 180-year energy heritage with one of the most aggressive recent pivots toward renewables and storage. Its modernization of legacy hydro assets, paired with new BESS deployment, gives it a unique multi-asset portfolio. Naturgy is also the largest gas distributor in Spain — positioning it for biomethane and green-gas integration as 'molecular' storage scales up alongside electrons.",
  },
  {
    rank: 6,
    name: 'EDP Renewables (EDPR)',
    founded: 2007,
    hq: 'Oviedo, Asturias',
    capacity: '~16 GW renewable globally + 500+ MW storage pipeline in Iberia',
    tech: 'Lithium-ion BESS, PV + storage hybrids, distributed solar + storage offerings, hydrogen via parent EDP',
    projects: 'Valdesolar PV+BESS (Badajoz), Cordel da Vinha (cross-border Portugal/Spain) hybrid park, Mediterranean island storage solutions',
    partners: 'EDP Group, Engie, Sonatrach, regional governments of Extremadura and Galicia',
    edge: "EDPR is one of the world's largest pure-play renewable developers and a leader in Iberian energy markets. Its hybridization-first strategy — adding storage to existing wind and solar — accelerates capacity deployment without new permitting cycles. EDPR also runs Spain's most active distributed-generation + behind-the-meter storage program for commercial and industrial clients.",
  },
  {
    rank: 7,
    name: 'Solaria',
    founded: 2002,
    hq: 'Madrid, Spain',
    capacity: '~2.4 GW PV operating + 7+ GWh BESS pipeline by 2030',
    tech: 'Utility-scale solar PV with co-located lithium-ion BESS',
    projects: 'Trillo, Ignis, and Garoña solar+storage clusters in Castilla-La Mancha and Castilla y León; Trujillo cluster in Extremadura',
    partners: 'BEI / European Investment Bank, regional Spanish governments, EPC partners across Iberia',
    edge: "Solaria is the largest pure-play PV developer in Spain and one of the most aggressive companies adding battery storage to existing solar parks. By co-locating BESS, Solaria captures evening peak prices its solar-only competitors miss — a pricing arbitrage that has become a defining feature of the Spanish wholesale market in 2025–2026.",
  },
  {
    rank: 8,
    name: 'Gestamp Solar (Solarpack)',
    founded: 2005,
    hq: 'Bilbao, Spain (acquired by EQT-controlled Solarpack/Q-Energy)',
    capacity: '~1 GW operating + 2.5 GW storage-ready PV pipeline in Iberia',
    tech: 'Utility-scale PV, BESS co-location, hybrid project structuring, asset management',
    projects: 'Tordesillas solar park (Valladolid) with storage retrofit, Andalusian and Aragonese hybrid PV + BESS',
    partners: 'EQT, BlackRock, Mitsui, EPC firms across Spain',
    edge: "Gestamp Solar (now part of the Solarpack / Q-Energy umbrella) was one of the first Spanish developers to systematically design new solar parks as 'storage-ready' — pre-permitting BESS interconnection capacity even before final-investment decisions on batteries. This forward-engineering has accelerated its hybridization timeline by 18–24 months versus competitors.",
  },
  {
    rank: 9,
    name: 'Ingeteam',
    founded: 1972,
    hq: 'Zamudio, Bizkaia',
    capacity: '~30 GW of inverters supplied globally + 1+ GWh BESS systems integrated',
    tech: 'Power electronics, BESS PCS (Power Conversion Systems), grid-forming inverters, hydrogen electrolyzer power systems',
    projects: 'INGECON SUN STORAGE installations across Iberia, Cazalla BESS, virtual power plant integrations with Spanish utilities',
    partners: 'Iberdrola, Acciona, EDP, Enel, Vestas, Siemens Gamesa',
    edge: "Ingeteam is Spain's leading domestic power-electronics manufacturer and a critical-but-invisible enabler of nearly every large storage project in the country. Its grid-forming inverters allow BESS to provide synchronous-machine-like grid services — frequency response, black start, voltage regulation — that grid operators increasingly demand as fossil generation retires.",
  },
  {
    rank: 10,
    name: 'Gamesa Electric',
    founded: 2014,
    hq: 'Madrid, Spain (Siemens Gamesa Renewable Energy)',
    capacity: 'Inverter and storage systems supporting GW-scale renewable + BESS installs across Spain',
    tech: 'Battery storage power conversion, PV inverters, hybrid plant controllers, grid-stability solutions',
    projects: 'BESS PCS supplies for utility-scale solar developers across Spain, microgrid solutions in Canary and Balearic Islands',
    partners: 'Siemens Energy, Iberdrola, regional island grid operators',
    edge: "Gamesa Electric (the power-electronics business of Siemens Gamesa) brings world-class hardware expertise to Spain's storage market. Its specialty — controlling the interface between batteries and the grid — is increasingly valuable as Spain interconnects more islanded systems (Balearics, Canaries) and brings online grid-forming batteries that must behave like rotating machines.",
  },
  {
    rank: 11,
    name: 'Plenitude (Eni)',
    founded: 2022,
    hq: 'Rome, Italy (with major Spanish subsidiary; Spanish operations from Madrid)',
    capacity: '~3 GW renewable + storage globally; 600+ MW Spanish solar with BESS in development',
    tech: 'Solar PV with co-located BESS, EV charging infrastructure, retail energy services, biomethane',
    projects: 'Acquisition of PLT Energia portfolio in Spain, Sicilian-style storage models adapted to Iberia, EV charging + storage hubs',
    partners: 'Eni Group, EU Innovation Fund, Spanish regional EV operators',
    edge: "Plenitude is Eni's clean-energy retail and renewables arm — and one of the most aggressive new entrants in the Spanish market. Its integrated strategy combines utility-scale storage with 8,000+ EV charging points (and growing) and retail electricity supply, making it one of the few companies in Spain that touches every layer of the energy transition simultaneously.",
  },
  {
    rank: 12,
    name: 'Amp Energy Spain',
    founded: 2009,
    hq: 'Toronto, Canada (Spanish operations from Madrid)',
    capacity: '~1.8 GW BESS pipeline announced for Spain; multi-GWh project portfolio',
    tech: 'Standalone grid-scale BESS, hybrid renewable + storage, AI-driven energy management software (Amp X)',
    projects: 'Andalusia and Aragón standalone BESS projects, Amp X virtual power plant deployments',
    partners: 'Hg Capital, Carlyle, EU Innovation Fund applicants, Spanish system operator REE',
    edge: "Amp Energy is one of the largest international pure-play storage developers to enter Spain. Its proprietary Amp X software platform aggregates distributed batteries into virtual power plants that bid into wholesale and ancillary-services markets — a business model that Spain's secondary regulation reform (Royal Decree 23/2020 and updates) finally made commercially viable in 2024–2026.",
  },
];

const TRENDS = [
  { title: 'Large-Scale BESS Deployment', text: 'Spain is on track to install **8–10 GW of grid-scale battery storage by 2030**, up from less than 1 GW in 2024. Project sizes routinely exceed 100 MW / 400 MWh, with most new BESS co-located at solar plants to capture the steep evening price curve created by midday PV oversupply.' },
  { title: 'Green Hydrogen as Long-Duration Storage', text: 'Spain has Europe\'s most ambitious green hydrogen plan — **11 GW of electrolyzer capacity targeted by 2030**. With abundant solar irradiance and curtailable wind, hydrogen offers the seasonal-scale storage that lithium-ion cannot economically provide. Iberdrola, Repsol, Acciona, and Cepsa are leading the build-out, supported by the EU Innovation Fund and PERTE ERHA program.' },
  { title: 'Pumped Hydro Modernization', text: 'Spain operates roughly **6 GW of pumped hydro storage** — the second-largest fleet in Europe. Naturgy, Iberdrola, and Endesa are upgrading existing stations with variable-speed turbines, increasing flexibility and adding ~1.5 GW of effective storage without new construction permits.' },
  { title: 'Virtual Power Plants & Smart Grid Integration', text: 'Aggregation of distributed batteries, EV chargers, and demand-response loads into virtual power plants is now a regulated activity in Spain. REE\'s ancillary services markets, restructured under Royal Decree 23/2020 and subsequent reforms, allow VPP operators to bid alongside conventional generators — a step-change for behind-the-meter and commercial storage economics.' },
  { title: 'EU Taxonomy & ESG Investment Surge', text: '**€140+ billion of NextGenerationEU funding** flows through Spain over 2021–2026, with significant allocations to renewable storage and hydrogen. The EU Taxonomy classification of large-scale BESS as a sustainable activity has unlocked institutional capital that previously avoided the asset class.' },
  { title: 'AI-Powered Energy Management', text: 'Trading algorithms now manage when batteries charge, discharge, or sit idle on a 15-minute, then 5-minute, basis — capturing arbitrage spreads in Iberia\'s wholesale electricity market that human dispatchers cannot. Amp X, Habitat Energy, Fluence Mosaic, and Tesla Autobidder all operate sophisticated trading layers on Spanish BESS assets.' },
  { title: 'Decentralized Storage & Prosumer Growth', text: 'Self-consumption (autoconsumo) regulation reforms have ignited residential and commercial behind-the-meter solar + battery installations — over **2 GW added in 2023–2025**. Companies like Holaluz, Otovo, Eoliz, and Soltec\'s residential subsidiary are competing fiercely for this rapidly growing segment.' },
];

const POLICY = [
  { title: 'PNIEC 2021–2030', text: 'Spain\'s National Integrated Energy and Climate Plan targets **74% renewable electricity by 2030** (revised 2024 update raises this further), **22 GW of energy storage**, **11 GW of green hydrogen electrolyzers**, and **a 32% reduction in greenhouse gas emissions vs 1990**. The PNIEC is the master document driving every storage investment decision in the country.' },
  { title: 'Royal Decree 23/2020 & subsequent reforms', text: 'These reforms unlocked grid-scale storage participation in ancillary services, secondary regulation, and capacity markets — the legal foundation for commercial BESS in Spain. Successive updates (RD-Law 17/2022, RD-Law 8/2023) refined balancing market design and curtailment compensation rules.' },
  { title: 'NextGenerationEU & PERTE Programs', text: 'Spain\'s share of NextGenerationEU funding (~€140B) is being deployed via PERTE programs (Strategic Projects for Economic Recovery and Transformation). PERTE ERHA targets renewable hydrogen, energy storage, and the electricity grid — disbursing **€6.9 billion** in subsidies for storage and hydrogen projects through 2026.' },
  { title: 'Red Eléctrica de España (REE) Grid Codes', text: 'REE, Spain\'s TSO, operates the world\'s most renewable-heavy mainland grid (above 50% renewables most days). Its updated grid codes mandate grid-forming capability, voltage support, and frequency response from new utility-scale storage — pushing inverter and BESS suppliers toward more sophisticated power-electronics designs.' },
  { title: 'Carbon Neutrality 2050', text: 'Spain\'s Climate Change and Energy Transition Law (Ley 7/2021) commits the country to climate neutrality by 2050 and a fully decarbonized electricity system by 2050 — placing storage at the structural center of national infrastructure planning.' },
];

const TIPS = [
  { title: 'Match technology to use case', text: 'Lithium-ion BESS is the right answer for short-duration (1–4 hours) arbitrage and ancillary services. Pumped hydro and green hydrogen handle long-duration (8h–seasonal) storage. Flow batteries (e.g., vanadium redox) sit between, valuable for 6–10 hour discharge profiles.' },
  { title: 'Project scale & grid connection', text: 'Spain\'s grid-connection queue exceeds **150 GW** of pending applications. Partners with existing connection rights (often via co-location with operating wind or solar) can deliver projects 2–3 years faster than greenfield developers.' },
  { title: 'Regulatory compliance', text: 'Verify partner experience navigating REE balancing market participation, MITECO permitting, and regional environmental approvals. Storage developers without operational track record in Iberian markets routinely underestimate timelines by 12+ months.' },
  { title: 'Financial stability', text: 'Storage projects require 15–20 year financing and equity commitments well past commissioning. Prefer partners with investment-grade credit ratings, listed equity, or backing from blue-chip infrastructure funds (KKR, EQT, Brookfield, IFM, BlackRock).' },
  { title: 'After-sales service & augmentation', text: 'Lithium-ion BESS lose ~2% capacity annually. A robust augmentation plan — adding cells to maintain rated capacity over a 15-year life — is mandatory. Suppliers that contract guaranteed-availability service agreements offer significantly lower lifecycle risk.' },
  { title: 'Track record of delivered projects', text: 'Ask for an audited list of operating projects with capacity, year commissioned, and ancillary-services revenue performance. Companies with 500+ MW already operating in Iberia have de-risked operating models. New entrants without local operating assets carry materially higher execution risk.' },
];

const FAQ_ITEMS = [
  { q: 'Who is the largest energy storage company in Spain?', a: 'Iberdrola is the largest energy storage operator in Spain by combined capacity, owning approximately 4.4 GW of pumped hydro storage globally (with the largest concentration in Iberia) plus a 600+ MW battery storage pipeline. Endesa (Enel Group) is the second-largest, with ~2 GW of pumped hydro and a major BESS pipeline at former coal sites.' },
  { q: 'How big is the Spanish energy storage market in 2026?', a: 'Spain\'s energy storage market is forecast to reach approximately €4 billion in cumulative investment by 2026, with grid-scale battery storage capacity growing from less than 1 GW in 2024 to a target of 8–10 GW by 2030 under the PNIEC plan. Pumped hydro adds another 6 GW, and green hydrogen targets 11 GW of electrolyzer capacity.' },
  { q: 'What is PNIEC and how does it affect storage in Spain?', a: 'PNIEC (Plan Nacional Integrado de Energía y Clima) is Spain\'s National Integrated Energy and Climate Plan covering 2021–2030. It mandates 22 GW of energy storage capacity, 11 GW of green hydrogen electrolyzers, and 74% renewable electricity by 2030. PNIEC is the master regulatory document that channels both EU NextGenerationEU funding and domestic capital into Spanish storage projects.' },
  { q: 'Is green hydrogen really a storage technology?', a: 'Yes — green hydrogen functions as long-duration energy storage. Excess renewable electricity is used to electrolyze water into hydrogen, which can be stored in tanks or salt caverns for weeks or months and reconverted to electricity (via fuel cells or turbines) when needed. Lithium-ion handles short-duration; hydrogen handles seasonal-scale balancing — a role no other technology can fill economically at GW scale today.' },
  { q: 'Which Spanish company is best for grid-scale BESS development?', a: 'Iberdrola, Acciona Energía, EDP Renewables, and Solaria are the most experienced grid-scale battery storage developers operating in Spain. Pure-play storage entrants like Amp Energy and Plenitude (Eni) are also rapidly building large pipelines. The right partner depends on project size, geographic location, and integration requirements.' },
  { q: 'How does NextGenerationEU funding support storage in Spain?', a: 'Spain receives roughly €140 billion in NextGenerationEU funding through 2026, of which the PERTE ERHA program (Renewable Energy, Renewable Hydrogen and Storage) allocates ~€6.9 billion specifically to storage and hydrogen. This funding has accelerated final-investment decisions for projects that would otherwise have struggled to attract debt at acceptable rates.' },
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
  headline: 'Top Energy Storage Companies in Spain: The Complete Guide [2026]',
  description: 'A comprehensive 2026 guide to the top 12 energy storage companies in Spain — Iberdrola, Endesa, Repsol, Acciona Energía, Naturgy, EDP Renewables, Solaria, Gestamp Solar, Ingeteam, Gamesa Electric, Plenitude, and Amp Energy. Covers BESS, pumped hydro, green hydrogen, PNIEC policy, NextGenerationEU funding, and how to choose a storage partner.',
  image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1200&q=85',
  datePublished: '2026-05-02',
  dateModified: '2026-05-02',
  author: { '@type': 'Organization', name: 'FirmsLedger Editorial Team' },
  publisher: {
    '@type': 'Organization',
    name: 'FirmsLedger',
    logo: { '@type': 'ImageObject', url: 'https://www.firmsledger.com/logo.png' },
  },
};

export default function TopEnergyStorageCompaniesSpain2026Article() {
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
              { label: 'Top Energy Storage Companies in Spain (2026)' },
            ]}
          />
        </div>
      </div>

      <header className="bg-gradient-to-br from-emerald-700 via-teal-700 to-slate-900 text-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block bg-emerald-400 text-emerald-950 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg mb-6">
            Energy · Storage · Spain · 2026
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight max-w-3xl leading-tight">
            Top Energy Storage Companies in Spain: The Complete Guide [2026]
          </h1>
          <p className="text-emerald-50 text-lg mt-5 max-w-2xl leading-relaxed">
            Spain runs above <strong>50% renewables</strong> on a normal weekday and is targeting <strong>22 GW of energy storage by 2030</strong>. These are the 12 companies turning that target into steel, silicon, and salt caverns.
          </p>
          <div className="flex flex-wrap items-center gap-6 mt-8 text-sm text-emerald-100">
            <span>Updated: May 2026</span>
            <span>16 min read</span>
            <span>12 Companies Reviewed</span>
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
            On a sunny weekday in May 2026, Spain&apos;s electricity grid frequently runs above <strong>50% renewable generation</strong> — sometimes climbing past <strong>75%</strong> during midday solar peaks. The country has installed <strong>30+ GW of solar PV</strong> and <strong>32+ GW of wind</strong>, transforming what was once a fossil-dependent power system into one of Europe&apos;s most ambitious clean-energy laboratories. But there&apos;s a problem: the sun sets, the wind drops, and electricity demand peaks in the evening. Without storage, all that renewable capacity is throttled by curtailment, price collapse, or grid instability.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed mb-5">
            That is why <strong>energy storage in Spain</strong> has become the country&apos;s most important infrastructure priority. Under the EU Green Deal, the <strong>National Integrated Energy and Climate Plan (PNIEC)</strong>, and the <strong>NextGenerationEU recovery fund</strong>, Spain is targeting <strong>22 GW of installed energy storage by 2030</strong> — roughly 20× current grid-scale battery capacity — alongside <strong>11 GW of green hydrogen electrolyzers</strong> and modernization of its existing <strong>6 GW pumped-hydro fleet</strong>.
          </p>
          <p className="text-slate-700 text-lg leading-relaxed">
            This guide profiles the <strong>top 12 energy storage companies in Spain</strong> for 2026, the technologies they are deploying, the policy framework that shapes their decisions, and a practical framework for selecting a partner. Whether you are an investor, project developer, off-taker, or policymaker, this is the strategic landscape you need to know.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Snapshot of Spain&apos;s Energy Storage Market</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {[
              { stat: '22 GW', label: 'Storage target by 2030 (PNIEC)' },
              { stat: '~6 GW', label: 'Operating pumped hydro fleet' },
              { stat: '11 GW', label: 'Green hydrogen electrolyzer target by 2030' },
              { stat: '€140B+', label: 'NextGenerationEU funding allocated to Spain' },
            ].map((s) => (
              <div key={s.label} className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
                <p className="text-3xl font-extrabold text-emerald-700 mb-1">{s.stat}</p>
                <p className="text-slate-700 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-slate-600 leading-relaxed mb-4">
            The Spanish storage market splits into four major segments. <strong>Grid-scale battery storage (BESS)</strong>, dominated by lithium-ion, is the fastest-growing — projected to scale from less than 1 GW in 2024 to 8–10 GW by 2030. <strong>Pumped-hydro storage</strong> remains the workhorse, with ~6 GW operating and another 1.5 GW of effective capacity unlocked via variable-speed turbine retrofits. <strong>Green hydrogen</strong> is the long-duration storage horizon — Spain has Europe&apos;s most ambitious electrolyzer pipeline. <strong>Thermal and behind-the-meter storage</strong> — including residential battery + solar systems — make up a smaller but rapidly growing segment.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Three forces are driving 2026 acceleration: (1) the structural collapse of midday solar prices in Iberia, which makes evening discharge arbitrage a guaranteed money-maker for BESS owners; (2) NextGenerationEU subsidies that de-risk early-stage capital; and (3) regulatory reforms (Royal Decree 23/2020 and follow-on measures) that finally allow batteries to monetize ancillary services and capacity payments alongside conventional generators.
          </p>
        </section>

        <section className="mb-12" aria-labelledby="top-companies">
          <h2 id="top-companies" className="text-2xl font-bold text-slate-900 mb-2">
            Top 12 Energy Storage Companies in Spain (2026)
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            Ranked by combined operating capacity, project pipeline, technology breadth, and category influence.
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
                  <div className="bg-emerald-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Capacity / Pipeline</p>
                    <p className="text-slate-700 text-sm">{c.capacity}</p>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-1">Core Technology</p>
                    <p className="text-slate-700 text-sm">{c.tech}</p>
                  </div>
                  <div className="bg-slate-100 rounded-lg p-3">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Key Projects</p>
                    <p className="text-slate-700 text-sm">{c.projects}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Partners &amp; Clients</p>
                    <p className="text-slate-700 text-sm">{c.partners}</p>
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
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
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
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Spain&apos;s Regulatory &amp; Policy Landscape</h2>
          <div className="space-y-5">
            {POLICY.map((p, i) => (
              <div key={i} className="bg-slate-50 border-l-4 border-emerald-600 rounded-r-xl p-5">
                <h3 className="font-bold text-slate-800 mb-2">{p.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">How to Choose the Right Energy Storage Partner</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            Selecting a storage partner is a 15–20 year commitment. The framework below applies whether you are an off-taker procuring services, an investor backing a developer, or a corporate buyer seeking a behind-the-meter solution.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {TIPS.map((tip, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5">
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
                  <th className="text-left px-4 py-3 font-semibold">Core Technology</th>
                  <th className="text-left px-4 py-3 font-semibold">Key Projects</th>
                  <th className="text-left px-4 py-3 font-semibold">Capacity</th>
                  <th className="text-left px-4 py-3 font-semibold">Specialization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  ['1', 'Iberdrola', 'Bilbao', 'Pumped hydro + BESS + H₂', 'Tâmega, Puertollano', '~4.4 GW PHS + 600 MW BESS', 'Hybrid renewable + storage'],
                  ['2', 'Endesa', 'Madrid', 'BESS + pumped hydro', 'Andorra (Teruel), Compostilla', '~2 GW PHS + 1 GW BESS', 'Coal-to-renewable conversion'],
                  ['3', 'Repsol', 'Madrid', 'BESS + green H₂', 'Kappa, Bilbao H₂ hub', '600 MW + 1.7 GW pipeline', 'Multi-energy + e-fuels'],
                  ['4', 'Acciona Energía', 'Madrid', 'BESS + green H₂', 'Montes del Cierzo, El Romero', '13 GW renewables + 2 GW pipeline', 'Pure-play renewables + storage'],
                  ['5', 'Naturgy', 'Madrid', 'BESS + pumped hydro + biogas', 'La Muela, Andalusia hybrids', '5 GW renewables', 'Multi-asset gas + storage'],
                  ['6', 'EDP Renewables', 'Oviedo', 'BESS + hybrid PV', 'Valdesolar, Cordel da Vinha', '16 GW + 500 MW pipeline', 'Hybridization-first'],
                  ['7', 'Solaria', 'Madrid', 'PV + co-located BESS', 'Trillo, Garoña, Trujillo', '2.4 GW PV + 7 GWh BESS', '#1 pure-play Spanish PV+BESS'],
                  ['8', 'Gestamp Solar', 'Bilbao', 'PV + BESS', 'Tordesillas, Andalusia', '1 GW + 2.5 GW pipeline', 'Storage-ready PV design'],
                  ['9', 'Ingeteam', 'Bizkaia', 'Power electronics, BESS PCS', 'INGECON SUN STORAGE', '30 GW inverters + 1 GWh BESS', 'Domestic power-electronics leader'],
                  ['10', 'Gamesa Electric', 'Madrid', 'BESS PCS, hybrid controllers', 'Island microgrids, GW PCS', 'GW-scale supplies', 'Grid-stability hardware'],
                  ['11', 'Plenitude (Eni)', 'Madrid (ES ops)', 'PV + BESS + EV charging', 'PLT Energia portfolio', '3 GW global + 600 MW Spain', 'Integrated retail + storage'],
                  ['12', 'Amp Energy Spain', 'Madrid (ES ops)', 'Standalone BESS + VPPs', 'Andalusia, Aragón', '1.8 GW pipeline', 'AI-driven VPP operator'],
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

        <section className="mb-12 bg-gradient-to-br from-emerald-700 via-teal-700 to-slate-900 text-white rounded-2xl p-8 md:p-10">
          <h2 className="text-2xl font-bold mb-4">Spain&apos;s Path to European Storage Leadership</h2>
          <p className="text-emerald-50 leading-relaxed mb-4">
            By 2030, Spain will likely be the largest energy storage market in southern Europe and one of the three largest on the continent. The country&apos;s combination of structural renewable oversupply, supportive regulation, EU funding, and a dozen credible operators with deep balance sheets has created an environment where storage projects scale faster and finance more cheaply than almost anywhere else in Europe.
          </p>
          <p className="text-emerald-50 leading-relaxed mb-5">
            For investors, the question is no longer whether Spanish storage will deliver returns — it is which technologies, geographies, and partners will deliver the best risk-adjusted returns over the next decade. For developers and corporates, the gap between leaders and laggards is widening fast: those without operating Iberian assets by 2027 will struggle to compete with the dozen incumbents profiled above.
          </p>
          <p className="text-white font-semibold text-lg">
            The next decade of Spanish energy storage is being decided right now. The question is which side of the build-out you want to be on. ⚡
          </p>
        </section>

        <div className="text-center py-8 border-t border-slate-200">
          <p className="text-slate-600 mb-4 text-lg">
            Looking for verified energy &amp; renewable infrastructure partners?
          </p>
          <Link
            href="/directory"
            className="inline-block bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Browse the FirmsLedger Directory
          </Link>
        </div>

      </main>
    </article>
  );
}
