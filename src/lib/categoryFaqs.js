/**
 * Per-slug FAQ overrides. Each entry is { q, a } — 5-7 questions per top slug.
 * Lookup: getFaqsFor(slug) returns the curated array, or null if no override.
 * Falls back to the generic templated FAQs in CategorySEOContent.
 *
 * Curated for top-traffic categories. Add more entries here as new
 * directory pages accumulate impressions in GSC.
 */

export const CATEGORY_FAQS = {
  /* ── Marketing & advertising ──────────────────────────────────── */
  'digital-marketing': [
    {
      q: 'What is a digital marketing company?',
      a: 'A digital marketing company designs and executes online campaigns across SEO, paid ads, social media, email, and content marketing. The goal is to drive measurable traffic, leads, and revenue using data-driven channels rather than traditional offline media.',
    },
    {
      q: 'What services do digital marketing firms usually provide?',
      a: 'Most full-service agencies cover Search Engine Optimization (SEO), Pay-Per-Click (PPC) advertising, Social Media Marketing (SMM), Content Marketing, Email Marketing, Marketing Automation, Conversion Rate Optimization (CRO), and analytics/reporting.',
    },
    {
      q: 'How can my business benefit from hiring a digital marketing company?',
      a: 'You gain access to specialists across every channel without building an in-house team, faster experimentation, proven playbooks, and clearer attribution. Most clients see measurable ROI within 3–6 months when paired with the right partner.',
    },
    {
      q: 'What factors should I consider when choosing a digital marketing agency?',
      a: 'Look at industry experience, case studies with measurable outcomes, transparent pricing, reporting cadence, in-house specialists vs. outsourced, contract length, and whether the team understands your funnel stage (lead-gen vs. ecom vs. SaaS).',
    },
    {
      q: 'How do digital marketing firms measure success?',
      a: 'Standard KPIs include organic traffic, keyword rankings, paid CPA/ROAS, conversion rate, MQL/SQL volume, customer LTV, and revenue attribution. Reputable agencies provide weekly or monthly dashboards tied to your business metrics.',
    },
    {
      q: 'How much do digital marketing services cost?',
      a: 'Hourly rates range from $25/hr (offshore) to $300+/hr (boutique US/EU). Monthly retainers typically run $2K–$50K depending on scope. Performance-based or hybrid pricing is common for paid media management.',
    },
  ],

  'seo': [
    {
      q: 'What does an SEO company do?',
      a: 'An SEO company optimizes your website to rank higher in Google and other search engines. Work covers technical audits, on-page optimization, link building, content strategy, local SEO, and ongoing performance reporting.',
    },
    {
      q: 'How long does SEO take to show results?',
      a: 'Most sites see meaningful traffic gains within 4–6 months. Competitive industries can take 9–12 months. New domains take longer than established sites due to limited authority.',
    },
    {
      q: 'What is the difference between SEO and PPC?',
      a: 'SEO drives organic (unpaid) traffic from search rankings — slower to build but compounds over time. PPC (Google Ads, Bing Ads) buys traffic instantly but stops the moment the budget pauses. Most strategies combine both.',
    },
    {
      q: 'How much should I budget for SEO services?',
      a: 'SMBs typically spend $1K–$5K/month, mid-market $5K–$20K/month, enterprise $20K+/month. Project-based audits range from $2K–$30K. Avoid agencies guaranteeing #1 rankings — that\'s a red flag.',
    },
    {
      q: 'What KPIs should an SEO agency report on?',
      a: 'Organic clicks (GSC), keyword rankings for target terms, impressions and CTR, indexed pages, backlink growth, conversion-from-organic, and revenue attribution. Vanity metrics like Domain Authority alone aren\'t enough.',
    },
  ],

  'social-media-marketing': [
    {
      q: 'What does a social media marketing agency do?',
      a: 'They manage your brand presence across platforms (Instagram, LinkedIn, TikTok, X, Facebook, YouTube). Work includes content creation, posting calendars, paid ads, community management, influencer partnerships, and analytics.',
    },
    {
      q: 'Which social platforms should my business be on?',
      a: 'Depends on your audience. B2B SaaS → LinkedIn + X. DTC ecom → Instagram + TikTok. Local services → Facebook + Instagram. Don\'t spread thin — go deep on 2–3 platforms where buyers actually are.',
    },
    {
      q: 'How much does social media marketing cost?',
      a: 'Monthly retainers range $2K–$15K for organic management, plus ad spend ($1K minimum to be meaningful). Influencer campaigns are separate, typically $5K–$100K per campaign depending on creator size.',
    },
    {
      q: 'Should I use organic posts or paid ads?',
      a: 'Both. Organic builds long-term audience and brand. Paid ads buy reach immediately and let you test creative. Most agencies recommend 70/30 organic/paid split early, shifting toward paid as you find winning creative.',
    },
    {
      q: 'How do I measure social media ROI?',
      a: 'Track engagement rate, audience growth, click-through to site, lead capture, and revenue from social-attributed sessions. Use UTM tags + last-click attribution at minimum; multi-touch is better.',
    },
  ],

  'ppc': [
    {
      q: 'What does a PPC agency do?',
      a: 'A PPC agency manages your paid advertising on Google Ads, Bing, Facebook/Meta, LinkedIn, and other platforms. Services include keyword research, ad copywriting, bid management, landing-page optimization, and conversion tracking.',
    },
    {
      q: 'How much should I spend on PPC each month?',
      a: 'Minimum effective Google Ads budget is around $1.5K/month for SMBs. Mid-market typically $10K–$50K/month. Enterprise $100K+. Agency management fees are usually 10–20% of ad spend, with a $1.5K floor.',
    },
    {
      q: 'How fast can PPC drive results?',
      a: 'Traffic and clicks start day 1. Conversion optimization typically takes 30–90 days as the agency tests audiences, ad creative, and landing pages. Mature accounts can hit target CPA within the first quarter.',
    },
    {
      q: 'What\'s a good ROAS for PPC campaigns?',
      a: '3x–5x ROAS is healthy for ecom; SaaS targets are typically CPA-based (cost per signup or trial). Shopping ads run 4x–8x ROAS, branded search 8x–20x. Anything below 2x usually needs creative or targeting fixes.',
    },
    {
      q: 'Google Ads or Facebook Ads — which is better?',
      a: 'Google captures intent (people searching for solutions) — usually higher conversion rate. Facebook/Instagram drives discovery — better for visual products + brand-building. Most agencies recommend running both with channel-specific funnels.',
    },
  ],

  /* ── Software & development ───────────────────────────────────── */
  'software-development': [
    {
      q: 'What does a software development company do?',
      a: 'They design, build, and maintain custom software for businesses — web apps, mobile apps, SaaS platforms, internal tools, and enterprise systems. Engagement models include full-cycle development, staff augmentation, and dedicated teams.',
    },
    {
      q: 'How do I choose between in-house developers and an agency?',
      a: 'Agencies win on speed-to-launch, broader skill mix, and zero hiring overhead. In-house wins on long-term ownership and deep domain knowledge. Hybrid (agency builds MVP, in-house maintains) is common.',
    },
    {
      q: 'How much does custom software development cost?',
      a: 'MVP web apps run $20K–$100K. Mobile apps $40K–$250K. Enterprise platforms $250K–$2M+. Hourly rates: offshore $25–$60/hr, US/EU mid-market $80–$150/hr, top-tier $200+/hr.',
    },
    {
      q: 'What is the typical software project timeline?',
      a: 'Discovery + design: 2–6 weeks. MVP build: 2–4 months. Production launch: 4–9 months total. Agile teams ship in 2-week sprints with reviewable progress every cycle.',
    },
    {
      q: 'Onshore, nearshore, or offshore — which should I pick?',
      a: 'Onshore (US/EU): highest cost, best timezone overlap, native communication. Nearshore (Latin America for US, Eastern Europe for EU): mid-cost, mostly overlapping hours. Offshore (India, SE Asia): lowest cost, requires structured project management.',
    },
  ],

  'web-development': [
    {
      q: 'What does a web development agency do?',
      a: 'They build websites and web applications — marketing sites, ecommerce stores, dashboards, member portals, and custom platforms. Services span design, frontend (React/Vue/Next), backend (Node, Python, Rails), CMS integration, and DevOps.',
    },
    {
      q: 'WordPress, Shopify, or custom build — which is right for me?',
      a: 'WordPress: content-heavy marketing sites. Shopify: ecommerce with standard checkout flows. Custom build: when off-the-shelf platforms can\'t handle your business logic. Most SMBs are best served by a polished WordPress or Shopify site.',
    },
    {
      q: 'How much does a website cost to build?',
      a: 'Template-based small business sites: $3K–$15K. Mid-tier custom marketing site: $15K–$60K. Ecommerce: $20K–$100K. Enterprise/SaaS web app: $100K–$1M+. Ongoing maintenance: 15–25% of build cost annually.',
    },
    {
      q: 'How long does it take to build a website?',
      a: 'Small business site: 4–8 weeks. Mid-market custom site: 2–4 months. Ecommerce or web app: 3–9 months. Discovery + design eats 25% of the timeline; build + QA the rest.',
    },
    {
      q: 'Should the agency host my site too?',
      a: 'Hosting separately (Vercel, Netlify, AWS, dedicated managed host) is usually cheaper and gives you ownership. Some agencies bundle hosting at 2–3x markup. Get hosting credentials in your name regardless.',
    },
  ],

  'mobile-app-development': [
    {
      q: 'What does a mobile app development company do?',
      a: 'They design and build iOS and Android apps. Approaches include native (Swift/Kotlin), cross-platform (React Native, Flutter), or hybrid. Full-service teams handle UX, backend, app store submission, and ongoing maintenance.',
    },
    {
      q: 'Native or cross-platform — which should I choose?',
      a: 'Native: best performance, full platform feature access, higher cost (build twice). Cross-platform: 30–50% cheaper, single codebase, slightly slower for graphics-heavy apps. For most consumer + business apps, cross-platform (Flutter or React Native) wins.',
    },
    {
      q: 'How much does it cost to build a mobile app?',
      a: 'Simple MVP: $30K–$80K. Mid-complexity (auth, payments, backend): $80K–$200K. Complex platforms (real-time, AI, video): $200K–$500K+. Annual maintenance runs 15–20% of build cost.',
    },
    {
      q: 'How long does mobile app development take?',
      a: 'MVP: 3–4 months. Production-ready app: 4–8 months. Apple App Store review takes 1–7 days; Google Play 1–3 days. Plan for 2–3 release cycles to stabilize before public launch.',
    },
    {
      q: 'What happens after the app is launched?',
      a: 'OS updates (iOS, Android) require yearly compatibility work. Crash monitoring (Sentry, Firebase Crashlytics), feature iterations, and store optimization (ASO) are ongoing. Most agencies offer post-launch retainers.',
    },
  ],

  'it-consulting': [
    {
      q: 'What does an IT consulting firm do?',
      a: 'IT consultants assess your technology stack, recommend improvements, and often implement them. Engagements range from cybersecurity audits to cloud migrations, ERP rollouts, digital transformation roadmaps, and CTO-as-a-service.',
    },
    {
      q: 'When should a business hire an IT consultant?',
      a: 'Before major tech investments (cloud migration, ERP, CRM), after a security incident, when scaling past your current systems, during M&A integration, or when in-house IT lacks specialized expertise (AI, compliance, data warehousing).',
    },
    {
      q: 'How much does IT consulting cost?',
      a: 'Boutique consultants: $150–$300/hr. Mid-tier firms (Slalom, Pariveda tier): $200–$400/hr. Big-4 / strategic (Deloitte, Accenture): $300–$800/hr. Project rates vary widely; scope discovery is critical before signing.',
    },
    {
      q: 'What deliverables should I expect from IT consulting?',
      a: 'Current-state assessment, gap analysis, recommended target architecture, implementation roadmap with phased budgets, vendor recommendations, and risk register. Implementation deliverables depend on scope.',
    },
    {
      q: 'IT consulting vs. managed services — what\'s the difference?',
      a: 'Consulting = strategic advice + project work, time-bound. Managed services (MSP) = ongoing ops support (monitoring, helpdesk, patching) on a monthly retainer. Many firms offer both; bundle if you need long-term support.',
    },
  ],

  'cybersecurity': [
    {
      q: 'What does a cybersecurity company do?',
      a: 'They protect your organization from cyber threats — penetration testing, vulnerability assessments, SOC monitoring, incident response, compliance audits (SOC2, ISO 27001, HIPAA), security training, and managed detection.',
    },
    {
      q: 'When should I hire a cybersecurity firm?',
      a: 'Before passing a SOC2/ISO audit, after any security incident, when handling PCI/HIPAA/GDPR data, before product launch (pen test), or when in-house IT lacks security specialists.',
    },
    {
      q: 'How much do cybersecurity services cost?',
      a: 'Pen tests: $5K–$50K per engagement. SOC2 audit prep: $15K–$50K. Managed detection (MDR): $5K–$50K/month based on endpoints. Virtual CISO retainers: $5K–$25K/month.',
    },
    {
      q: 'What\'s the difference between a pen test and a vulnerability scan?',
      a: 'Vulnerability scan = automated tool flagging known CVEs. Pen test = humans actively trying to exploit your systems, often finding issues scanners miss (logic flaws, chained exploits). Pen tests cost more but find real risks.',
    },
    {
      q: 'How do I evaluate a cybersecurity firm?',
      a: 'Check OSCP/CISSP/CEH certifications on the team, request anonymized prior reports, confirm they don\'t offshore actual testing, and verify cyber liability insurance. Avoid firms that won\'t share methodology.',
    },
  ],

  /* ── Design ──────────────────────────────────────────────────── */
  'web-design': [
    {
      q: 'What does a web design agency do?',
      a: 'They craft the visual and interactive design of your website — branding, UX wireframes, UI mockups, prototyping, and design system delivery. Some agencies stop at design files; full-service teams hand off to developers.',
    },
    {
      q: 'Web design vs. web development — what\'s the difference?',
      a: 'Web design = how the site looks and feels (visual, UX, layout). Web development = building it in code. Most projects need both; some agencies bundle, others specialize. Specialists usually deliver higher quality on each side.',
    },
    {
      q: 'How much does web design cost?',
      a: 'Template customization: $1K–$5K. Custom marketing site design: $8K–$40K. Full design system (multi-page + components): $30K–$150K. Hourly senior designers: $100–$250/hr.',
    },
    {
      q: 'Should I get a custom design or use a template?',
      a: 'Templates are fine for early-stage and standard businesses. Custom design pays off when brand differentiation matters, you need complex flows, or you\'re scaling past template limits. Most fast-growing companies upgrade within 2 years.',
    },
    {
      q: 'What\'s included in a web design deliverable?',
      a: 'Wireframes (low-fi structure), high-fidelity mockups (Figma/Sketch), interactive prototype, design system (colors, typography, components), and a developer handoff doc. Asset exports (SVG, PNG) and brand guidelines are standard.',
    },
  ],

  'ux-ui-design': [
    {
      q: 'What does a UX/UI design firm do?',
      a: 'UX (user experience) firms research user behavior and design intuitive flows. UI (user interface) is the visual surface — buttons, layouts, typography. Most agencies handle both: research → wireframes → prototypes → polished UI.',
    },
    {
      q: 'When should I hire a UX/UI designer?',
      a: 'Before building a new product (avoids costly rework), when conversion rates plateau, after user complaints about confusion, before raising funding (good design = strong demos), or when scaling beyond a single founder-designed UI.',
    },
    {
      q: 'How much does UX/UI design cost?',
      a: 'Hourly: $80–$250/hr. Project-based: discovery + research $5K–$20K, full app design $20K–$150K. Design systems for SaaS: $40K–$200K. Ongoing retainers: $5K–$25K/month.',
    },
    {
      q: 'What is a design system and do I need one?',
      a: 'A design system = reusable components (buttons, forms, modals) + design tokens (colors, spacing, typography). Worth it if you have a multi-page app or multiple developers. Saves 30–50% of design time long-term.',
    },
    {
      q: 'How do I measure good UX design?',
      a: 'Task completion rate, time-on-task, error rate, NPS, retention, and conversion rate against control. A/B test design changes; gut-feel critiques are unreliable.',
    },
  ],

  'graphic-design': [
    {
      q: 'What does a graphic design agency do?',
      a: 'They produce visual assets — logos, branding, marketing collateral, social graphics, packaging, infographics, presentations, and print design. Some specialize in branding; others in production design.',
    },
    {
      q: 'How much does logo design cost?',
      a: 'Freelancer logo: $200–$2K. Boutique branding agency: $5K–$30K (includes brand book, color system, typography). Top-tier agency: $30K–$200K+. Cheap logos rarely come with brand guidelines.',
    },
    {
      q: 'What\'s the difference between a logo and a brand identity?',
      a: 'Logo = single mark. Brand identity = full system: logo, color palette, typography, voice, imagery, and brand guidelines doc. Identity is what designers, devs, and marketers reference for consistency.',
    },
    {
      q: 'How long does a branding project take?',
      a: 'Logo only: 2–4 weeks. Full brand identity: 6–12 weeks. Includes discovery, concepts, revisions, and final delivery (vector files, brand book, social templates).',
    },
    {
      q: 'How many logo revisions should I expect?',
      a: '2–3 concept directions, then 2–3 rounds of refinements on the chosen direction. Reputable agencies cap revisions in the contract; unlimited revisions usually mean low quality or scope creep.',
    },
  ],

  /* ── Industry-specific ───────────────────────────────────────── */
  'real-estate-services': [
    {
      q: 'What do real estate service companies do?',
      a: 'They support buying, selling, leasing, property management, valuation, brokerage, and real estate consulting. Firms range from individual brokers to global players (CBRE, JLL, Cushman & Wakefield).',
    },
    {
      q: 'Commercial vs. residential real estate firms — which do I need?',
      a: 'Residential: homes, condos, multifamily for individuals. Commercial: office, retail, industrial, hospitality, multi-family at scale for investors and businesses. Specialization matters — generalists rarely excel at both.',
    },
    {
      q: 'How are real estate firms compensated?',
      a: 'Sales: typically 5–6% commission split between buyer/seller agents (residential), 4–7% for commercial. Property management: 8–12% of monthly rent. Consulting: hourly or project-based ($200–$500/hr).',
    },
    {
      q: 'What should I look for in a real estate firm?',
      a: 'Local market expertise, transaction volume in your asset class, network depth, transparent fee structure, and track record. For commercial, ask for case studies on deals similar to yours.',
    },
    {
      q: 'Do I need a real estate lawyer in addition to an agent?',
      a: 'Yes for any commercial deal. For residential, depends on state — some require attorney closings, others don\'t. Always recommended for complex transactions, contingencies, or unusual financing.',
    },
  ],

  'artificial-intelligence-machine-learning': [
    {
      q: 'What do AI / machine learning companies do?',
      a: 'They build custom AI solutions: predictive models, computer vision, NLP, recommendation engines, generative AI features, and ML infrastructure (MLOps). Common use cases: forecasting, fraud detection, chatbots, document processing, image classification.',
    },
    {
      q: 'When should my business invest in AI/ML?',
      a: 'When you have repeatable decisions backed by data, repetitive document/image tasks, or volume that humans can\'t scale. AI without clean data + clear use cases burns money. Start with a narrow proof-of-concept.',
    },
    {
      q: 'How much does an AI/ML project cost?',
      a: 'POC: $20K–$100K (4–8 weeks). Production model: $100K–$500K. Custom LLM fine-tuning: $50K–$300K. Ongoing MLOps + retraining: $5K–$50K/month. Hourly senior ML engineers: $150–$400/hr.',
    },
    {
      q: 'Should I use generative AI or build a custom model?',
      a: 'Generative AI (OpenAI, Anthropic, etc.) for general tasks, summarization, content generation, conversational interfaces. Custom models for narrow, high-accuracy use cases (fraud, medical imaging, predictive maintenance) where domain data wins.',
    },
    {
      q: 'What\'s the difference between ML and traditional automation?',
      a: 'Traditional automation = explicit rules. ML learns patterns from data and adapts. Use rules for known logic; use ML when patterns are too complex or noisy to hand-code (e.g., spam detection, image recognition).',
    },
  ],

  'financial-services': [
    {
      q: 'What do financial services firms do?',
      a: 'They span banking, lending, asset management, wealth advisory, insurance, payment processing, fintech, and corporate finance. Firms range from local advisors to global investment banks.',
    },
    {
      q: 'How do I choose a financial advisor?',
      a: 'Verify fiduciary status (legally required to act in your interest), fee structure (flat fee > AUM-based > commission), CFP certification, and referenceable clients in your wealth tier. Avoid commission-only advisors with conflicts of interest.',
    },
    {
      q: 'What\'s the difference between RIA and broker-dealer?',
      a: 'RIA (Registered Investment Advisor): fiduciary, fee-based, must put client interests first. Broker-dealer: suitability standard (lower bar), often commission-based. RIAs are generally preferred for unbiased advice.',
    },
    {
      q: 'How much do financial services cost?',
      a: 'Wealth management: 0.5%–1.5% of AUM annually (under $1M; lower for larger). Flat-fee advisors: $2K–$10K/year. Hourly: $200–$500. Investment banking: 1–7% of deal size depending on transaction.',
    },
    {
      q: 'When should I hire a financial firm vs. DIY?',
      a: 'DIY for straightforward retirement accounts under $250K. Hire when you have business equity, multiple accounts, tax complexity, estate planning needs, or wealth >$500K. The fee usually pays for itself in tax savings and avoided mistakes.',
    },
  ],

  'healthcare': [
    {
      q: 'What do healthcare service companies do?',
      a: 'Healthcare services span clinical providers, telehealth, medical billing, healthcare IT, revenue cycle management, healthcare consulting, and B2B services for hospitals, clinics, payers, and pharma.',
    },
    {
      q: 'How do I choose a healthcare service vendor?',
      a: 'Verify HIPAA compliance + BAA (Business Associate Agreement). Check experience in your sub-segment (provider, payer, life sciences). Confirm credentialing, licensing, and security certifications (SOC2, HITRUST).',
    },
    {
      q: 'What is HIPAA and why does it matter?',
      a: 'HIPAA = US healthcare privacy + security regulation governing PHI (protected health information). Any vendor handling PHI must sign a BAA and meet security/privacy controls. Non-compliance = fines up to $1.5M per violation.',
    },
    {
      q: 'How much do healthcare services cost?',
      a: 'Highly variable — billing/RCM services: 4–10% of collections. Healthcare IT consulting: $200–$600/hr. EHR implementation: $50K–$5M+ depending on practice size. Telehealth platforms: $50–$500/provider/month.',
    },
    {
      q: 'What is value-based care and how does it affect vendor choice?',
      a: 'Value-based care = providers paid for outcomes (quality, lower costs) rather than volume of services. Vendors offering analytics, care coordination, and patient engagement tools matter more under VBC contracts.',
    },
  ],

  'environmental-services': [
    {
      q: 'What do environmental service firms do?',
      a: 'They handle waste management, recycling, hazardous materials disposal, environmental consulting, remediation (soil/water cleanup), regulatory compliance (EPA, state EPA, ISO 14001), and sustainability reporting.',
    },
    {
      q: 'When does my business need an environmental services firm?',
      a: 'Before site purchases (Phase I/II environmental site assessment), during permit applications, after spills or contamination events, for compliance with EPA/OSHA/state regulations, and for ESG reporting.',
    },
    {
      q: 'How much do environmental consulting services cost?',
      a: 'Phase I site assessment: $2K–$8K. Phase II (sampling): $10K–$50K. Remediation projects: $50K–$5M+ based on contamination type. Compliance retainers: $5K–$25K/month. Hourly: $150–$350/hr.',
    },
    {
      q: 'What is a Phase I Environmental Site Assessment?',
      a: 'Phase I = no-sampling review of a property\'s environmental history (records, site visit, interviews) per ASTM E1527 standard. Required by lenders before commercial transactions to identify potential contamination liability.',
    },
    {
      q: 'How do I choose an environmental services partner?',
      a: 'Verify state and EPA certifications, professional licensure (PE, PG, CHMM), insurance coverage including pollution liability, prior project experience in your industry, and regulatory relationships in your state.',
    },
  ],
};

/**
 * Returns curated FAQs for a slug, or null if no override exists.
 * Callers fall back to the templated FAQs in CategorySEOContent.
 */
export function getFaqsFor(slug) {
  if (!slug) return null;
  return CATEGORY_FAQS[slug] || null;
}
