/**
 * seed-agency-data.mjs
 *
 * Seeds all agencies with:
 *   - service_focus, industry_focus, client_focus  (based on category)
 *   - hourly_rate, phone, tagline                  (sensible defaults)
 *   - 3 anonymous reviews per agency
 *
 * Run:  node scripts/seed-agency-data.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cmhkesseaomvszsaavzb.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtaGtlc3NlYW9tdnN6c2FhdnpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTUzODM5NywiZXhwIjoyMDg3MTE0Mzk3fQ.PQd8M_llfDenHRYN43HZK-txA33HAjBLhuw8csbH4M8';

const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

// ─── Category → focus data map ────────────────────────────────────────────────

const CATEGORY_FOCUS = {
  // ── Digital Marketing ──────────────────────────────────────────────────────
  'digital-marketing': {
    service_focus: [
      { service: 'SEO Services',                 percentage: 35, category: 'Digital Marketing' },
      { service: 'PPC & Paid Ads',               percentage: 25, category: 'Digital Marketing' },
      { service: 'Social Media Marketing',       percentage: 20, category: 'Digital Marketing' },
      { service: 'Content Marketing',            percentage: 12, category: 'Digital Marketing' },
      { service: 'Email Marketing',              percentage: 8,  category: 'Digital Marketing' },
    ],
    industry_focus: [
      { industry: 'E-commerce',         percentage: 25 },
      { industry: 'SaaS & Technology',  percentage: 20 },
      { industry: 'Healthcare',         percentage: 15 },
      { industry: 'Finance',            percentage: 15 },
      { industry: 'Retail',             percentage: 15 },
      { industry: 'Real Estate',        percentage: 10 },
    ],
    client_focus: { small_business: 45, medium_business: 35, large_business: 20 },
    hourly_rate: '$75 - $149/hr',
    tagline: 'Results-driven digital marketing for modern brands.',
  },

  // ── SEO ────────────────────────────────────────────────────────────────────
  'seo': {
    service_focus: [
      { service: 'On-Page SEO',       percentage: 30, category: 'SEO' },
      { service: 'Technical SEO',     percentage: 25, category: 'SEO' },
      { service: 'Link Building',     percentage: 25, category: 'SEO' },
      { service: 'Local SEO',         percentage: 12, category: 'SEO' },
      { service: 'SEO Audits',        percentage: 8,  category: 'SEO' },
    ],
    industry_focus: [
      { industry: 'E-commerce',     percentage: 30 },
      { industry: 'Local Business', percentage: 25 },
      { industry: 'Healthcare',     percentage: 20 },
      { industry: 'Legal',          percentage: 15 },
      { industry: 'Finance',        percentage: 10 },
    ],
    client_focus: { small_business: 55, medium_business: 30, large_business: 15 },
    hourly_rate: '$50 - $99/hr',
    tagline: 'Helping businesses rank higher and grow organically.',
  },

  // ── Web Development ────────────────────────────────────────────────────────
  'web-development': {
    service_focus: [
      { service: 'Custom Web Development', percentage: 35, category: 'Web Development' },
      { service: 'E-commerce Development', percentage: 25, category: 'Web Development' },
      { service: 'CMS & WordPress',         percentage: 20, category: 'Web Development' },
      { service: 'API Development',         percentage: 12, category: 'Web Development' },
      { service: 'Website Maintenance',     percentage: 8,  category: 'Web Development' },
    ],
    industry_focus: [
      { industry: 'Retail & E-commerce',  percentage: 30 },
      { industry: 'SaaS',                 percentage: 25 },
      { industry: 'Healthcare',           percentage: 15 },
      { industry: 'Education',            percentage: 15 },
      { industry: 'Non-profit',           percentage: 15 },
    ],
    client_focus: { small_business: 40, medium_business: 40, large_business: 20 },
    hourly_rate: '$75 - $149/hr',
    tagline: 'Building fast, scalable websites that convert visitors into customers.',
  },

  // ── Mobile App Development ─────────────────────────────────────────────────
  'mobile-app-development': {
    service_focus: [
      { service: 'iOS Development',     percentage: 30, category: 'Mobile Apps' },
      { service: 'Android Development', percentage: 30, category: 'Mobile Apps' },
      { service: 'React Native',        percentage: 25, category: 'Mobile Apps' },
      { service: 'Flutter',             percentage: 10, category: 'Mobile Apps' },
      { service: 'App Maintenance',     percentage: 5,  category: 'Mobile Apps' },
    ],
    industry_focus: [
      { industry: 'FinTech',         percentage: 25 },
      { industry: 'HealthTech',      percentage: 20 },
      { industry: 'Retail',          percentage: 20 },
      { industry: 'Logistics',       percentage: 20 },
      { industry: 'Entertainment',   percentage: 15 },
    ],
    client_focus: { small_business: 35, medium_business: 40, large_business: 25 },
    hourly_rate: '$100 - $199/hr',
    tagline: 'Native and cross-platform apps built for performance and scale.',
  },

  // ── IT Services ────────────────────────────────────────────────────────────
  'it-services': {
    service_focus: [
      { service: 'Cloud Solutions',     percentage: 30, category: 'IT Services' },
      { service: 'Cybersecurity',       percentage: 25, category: 'IT Services' },
      { service: 'IT Support & Help Desk', percentage: 20, category: 'IT Services' },
      { service: 'Network Management',  percentage: 15, category: 'IT Services' },
      { service: 'IT Consulting',       percentage: 10, category: 'IT Services' },
    ],
    industry_focus: [
      { industry: 'Finance',           percentage: 25 },
      { industry: 'Healthcare',        percentage: 25 },
      { industry: 'Manufacturing',     percentage: 20 },
      { industry: 'Government',        percentage: 15 },
      { industry: 'Education',         percentage: 15 },
    ],
    client_focus: { small_business: 30, medium_business: 45, large_business: 25 },
    hourly_rate: '$75 - $150/hr',
    tagline: 'Reliable IT infrastructure and support for growing businesses.',
  },

  // ── Staffing ───────────────────────────────────────────────────────────────
  'staffing-companies': {
    service_focus: [
      { service: 'Permanent Placement',   percentage: 35, category: 'Staffing' },
      { service: 'Contract Staffing',     percentage: 30, category: 'Staffing' },
      { service: 'Executive Search',      percentage: 15, category: 'Staffing' },
      { service: 'Temp-to-Hire',          percentage: 12, category: 'Staffing' },
      { service: 'RPO Services',          percentage: 8,  category: 'Staffing' },
    ],
    industry_focus: [
      { industry: 'IT & Technology',   percentage: 30 },
      { industry: 'Healthcare',        percentage: 20 },
      { industry: 'Finance',           percentage: 15 },
      { industry: 'Engineering',       percentage: 20 },
      { industry: 'Manufacturing',     percentage: 15 },
    ],
    client_focus: { small_business: 30, medium_business: 45, large_business: 25 },
    hourly_rate: '$25 - $75/hr',
    tagline: 'Connecting top talent with the companies that need them most.',
  },

  // ── Accounting & Finance ───────────────────────────────────────────────────
  'accounting': {
    service_focus: [
      { service: 'Bookkeeping',        percentage: 30, category: 'Accounting' },
      { service: 'Tax Preparation',    percentage: 25, category: 'Accounting' },
      { service: 'CFO Services',       percentage: 20, category: 'Accounting' },
      { service: 'Payroll',            percentage: 15, category: 'Accounting' },
      { service: 'Audit & Assurance',  percentage: 10, category: 'Accounting' },
    ],
    industry_focus: [
      { industry: 'Small Business',  percentage: 35 },
      { industry: 'E-commerce',      percentage: 20 },
      { industry: 'Real Estate',     percentage: 20 },
      { industry: 'Healthcare',      percentage: 15 },
      { industry: 'Startups',        percentage: 10 },
    ],
    client_focus: { small_business: 55, medium_business: 35, large_business: 10 },
    hourly_rate: '$75 - $200/hr',
    tagline: 'Accurate financials and strategic tax planning for business growth.',
  },

  // ── Legal ──────────────────────────────────────────────────────────────────
  'legal': {
    service_focus: [
      { service: 'Business Law',        percentage: 30, category: 'Legal' },
      { service: 'Contract Review',     percentage: 25, category: 'Legal' },
      { service: 'IP & Trademarks',     percentage: 20, category: 'Legal' },
      { service: 'Employment Law',      percentage: 15, category: 'Legal' },
      { service: 'Litigation',          percentage: 10, category: 'Legal' },
    ],
    industry_focus: [
      { industry: 'Technology',     percentage: 25 },
      { industry: 'Real Estate',    percentage: 25 },
      { industry: 'Healthcare',     percentage: 20 },
      { industry: 'Finance',        percentage: 15 },
      { industry: 'Manufacturing',  percentage: 15 },
    ],
    client_focus: { small_business: 40, medium_business: 40, large_business: 20 },
    hourly_rate: '$150 - $400/hr',
    tagline: 'Protecting your business with clear, practical legal advice.',
  },

  // ── PR & Communications ────────────────────────────────────────────────────
  'public-relations': {
    service_focus: [
      { service: 'Media Relations',     percentage: 35, category: 'PR' },
      { service: 'Brand Communications', percentage: 25, category: 'PR' },
      { service: 'Crisis Management',    percentage: 20, category: 'PR' },
      { service: 'Event PR',             percentage: 12, category: 'PR' },
      { service: 'Influencer Relations', percentage: 8,  category: 'PR' },
    ],
    industry_focus: [
      { industry: 'Consumer Brands', percentage: 30 },
      { industry: 'Technology',      percentage: 25 },
      { industry: 'Healthcare',      percentage: 20 },
      { industry: 'Finance',         percentage: 15 },
      { industry: 'Non-profit',      percentage: 10 },
    ],
    client_focus: { small_business: 30, medium_business: 40, large_business: 30 },
    hourly_rate: '$100 - $250/hr',
    tagline: 'Shaping narratives and building the reputation your brand deserves.',
  },

  // ── Design ────────────────────────────────────────────────────────────────
  'graphic-design': {
    service_focus: [
      { service: 'Brand Identity',   percentage: 35, category: 'Design' },
      { service: 'UI/UX Design',     percentage: 30, category: 'Design' },
      { service: 'Print Design',     percentage: 15, category: 'Design' },
      { service: 'Motion Graphics',  percentage: 12, category: 'Design' },
      { service: 'Packaging Design', percentage: 8,  category: 'Design' },
    ],
    industry_focus: [
      { industry: 'Retail & FMCG',  percentage: 30 },
      { industry: 'Technology',     percentage: 25 },
      { industry: 'Food & Beverage', percentage: 20 },
      { industry: 'Fashion',        percentage: 15 },
      { industry: 'Healthcare',     percentage: 10 },
    ],
    client_focus: { small_business: 50, medium_business: 35, large_business: 15 },
    hourly_rate: '$50 - $120/hr',
    tagline: 'Design that communicates clearly and builds lasting brand love.',
  },

  // ── Default (fallback for any other category) ─────────────────────────────
  'default': {
    service_focus: [
      { service: 'Consulting',          percentage: 40, category: 'Business Services' },
      { service: 'Strategy & Planning', percentage: 25, category: 'Business Services' },
      { service: 'Implementation',      percentage: 20, category: 'Business Services' },
      { service: 'Training & Support',  percentage: 15, category: 'Business Services' },
    ],
    industry_focus: [
      { industry: 'Technology',    percentage: 25 },
      { industry: 'Finance',       percentage: 20 },
      { industry: 'Healthcare',    percentage: 20 },
      { industry: 'Retail',        percentage: 20 },
      { industry: 'Manufacturing', percentage: 15 },
    ],
    client_focus: { small_business: 40, medium_business: 40, large_business: 20 },
    hourly_rate: '$75 - $150/hr',
    tagline: 'Expert services helping businesses reach their full potential.',
  },
};

// ─── Review pool (varied across industries/personas) ─────────────────────────

const REVIEW_SETS = [
  // Set A – strong 5-star
  [
    {
      title: 'Exceeded every expectation we had',
      body: 'Working with this team was a genuinely great experience from start to finish. They took the time to understand our business goals before proposing any solutions. Delivery was on schedule and the results spoke for themselves within the first quarter.',
      company_name: 'TechVenture Solutions',
      rating_overall: 5.0, rating_quality: 5.0, rating_communication: 5.0, rating_value: 5.0, rating_timeliness: 5.0,
      role_hired: 'CEO', work_duration: '6 months',
    },
    {
      title: 'Professional, efficient, and easy to work with',
      body: 'I was skeptical at first but they proved me wrong. The team kept us updated at every stage, responded quickly to feedback, and delivered a polished result. Would absolutely hire them again for future projects.',
      company_name: 'Meridian Group',
      rating_overall: 5.0, rating_quality: 5.0, rating_communication: 4.5, rating_value: 5.0, rating_timeliness: 4.5,
      role_hired: 'Operations Director', work_duration: '3 months',
    },
    {
      title: 'Measurable results, not just promises',
      body: 'Unlike previous vendors we\'ve used, this company focused on outcomes from day one. We saw a 40% improvement in the metric that mattered most to us. Their reporting is transparent and the team genuinely cares about your success.',
      company_name: 'Northfield Capital',
      rating_overall: 5.0, rating_quality: 5.0, rating_communication: 5.0, rating_value: 4.5, rating_timeliness: 5.0,
      role_hired: 'Marketing Manager', work_duration: '12 months',
    },
  ],
  // Set B – strong positive, slight nuance
  [
    {
      title: 'Great quality work and solid communication',
      body: 'The team delivered exactly what was scoped and communicated well throughout. There were a couple of minor delays but they were transparent about why and made up for it. Overall a great partner and we plan to continue the engagement.',
      company_name: 'Apex Industries',
      rating_overall: 4.5, rating_quality: 5.0, rating_communication: 4.5, rating_value: 4.5, rating_timeliness: 4.0,
      role_hired: 'Project Lead', work_duration: '4 months',
    },
    {
      title: 'Knowledgeable team that really listens',
      body: 'What set them apart was how much they listened. They asked the right questions upfront, pushed back constructively when they saw a better approach, and delivered work we were proud to show off. Highly recommend.',
      company_name: 'BlueOcean Ventures',
      rating_overall: 5.0, rating_quality: 5.0, rating_communication: 5.0, rating_value: 4.0, rating_timeliness: 4.5,
      role_hired: 'Co-Founder', work_duration: '8 months',
    },
    {
      title: 'Delivered real ROI within 90 days',
      body: 'We had clear KPIs and they hit all of them. The onboarding process was smooth and the team was proactive in identifying opportunities we hadn\'t even considered. The pricing is fair for the quality you get.',
      company_name: 'SunRise Logistics',
      rating_overall: 4.5, rating_quality: 4.5, rating_communication: 4.5, rating_value: 4.5, rating_timeliness: 5.0,
      role_hired: 'Head of Growth', work_duration: '3 months',
    },
  ],
  // Set C – very positive overall
  [
    {
      title: 'Best agency experience we\'ve had in years',
      body: 'We\'ve worked with many agencies before and this one stands out for their strategic thinking. They didn\'t just execute — they brought ideas, challenged our assumptions, and helped us see opportunities we\'d missed. Very impressive team.',
      company_name: 'Pinnacle Brands',
      rating_overall: 5.0, rating_quality: 5.0, rating_communication: 4.5, rating_value: 5.0, rating_timeliness: 5.0,
      role_hired: 'VP Marketing', work_duration: '9 months',
    },
    {
      title: 'Transparent, accountable, and skilled',
      body: 'They gave us clear scope, stuck to it, and flagged issues early so we could adjust without nasty surprises. The actual work quality was high and they brought genuine expertise to every meeting. Our go-to for this type of work.',
      company_name: 'HorizonTech',
      rating_overall: 4.5, rating_quality: 5.0, rating_communication: 5.0, rating_value: 4.0, rating_timeliness: 4.5,
      role_hired: 'CTO', work_duration: '6 months',
    },
    {
      title: 'Transformed how we approach this area of our business',
      body: 'We came in with a vague brief and they helped us sharpen it into a concrete strategy. The execution followed through perfectly. The team became a real extension of ours and the knowledge transfer at the end was excellent.',
      company_name: 'Goldleaf Partners',
      rating_overall: 5.0, rating_quality: 5.0, rating_communication: 5.0, rating_value: 5.0, rating_timeliness: 4.5,
      role_hired: 'Managing Director', work_duration: '10 months',
    },
  ],
  // Set D – 4-star balanced
  [
    {
      title: 'Solid work, would use again',
      body: 'Good team, good results. They delivered what was promised and the quality was high. Communication could have been a bit more proactive at times but overall we got what we needed and the project came in on budget.',
      company_name: 'Sterling & Co.',
      rating_overall: 4.0, rating_quality: 4.5, rating_communication: 3.5, rating_value: 4.5, rating_timeliness: 4.0,
      role_hired: 'Business Owner', work_duration: '2 months',
    },
    {
      title: 'Reliable partner for our ongoing needs',
      body: 'We\'ve been working with them on a retainer for over a year and they\'ve consistently delivered. They know our business well now which means less briefing time and faster turnaround. Good value for the quality.',
      company_name: 'Crescent Media',
      rating_overall: 4.5, rating_quality: 4.5, rating_communication: 4.5, rating_value: 4.0, rating_timeliness: 4.5,
      role_hired: 'Marketing Director', work_duration: '14 months',
    },
    {
      title: 'Strong results for a competitive market',
      body: 'Our industry is tough and highly competitive but they navigated the landscape confidently. They understood the nuances quickly and produced work that resonated with our target audience. Results have been consistently positive.',
      company_name: 'Wavecrest Digital',
      rating_overall: 4.5, rating_quality: 4.5, rating_communication: 4.0, rating_value: 4.5, rating_timeliness: 4.5,
      role_hired: 'Head of Digital', work_duration: '5 months',
    },
  ],
];

// Spread out created_at dates (past 6 months)
function randomPastDate(daysAgo = 180) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  return d.toISOString();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching agencies and categories…');

  // Fetch all data in parallel
  const [{ data: agencies }, { data: agencyCategories }, { data: categories }] = await Promise.all([
    sb.from('agencies').select('id, name, slug').order('name'),
    sb.from('agency_categories').select('agency_id, category_id'),
    sb.from('categories').select('id, slug, name'),
  ]);

  if (!agencies?.length) { console.error('No agencies found.'); process.exit(1); }
  console.log(`Found ${agencies.length} agencies, ${categories?.length} categories`);

  // Build lookup maps
  const catById  = Object.fromEntries((categories || []).map(c => [c.id, c]));
  const agCatMap = {};
  for (const ac of (agencyCategories || [])) {
    if (!agCatMap[ac.agency_id]) agCatMap[ac.agency_id] = [];
    agCatMap[ac.agency_id].push(ac.category_id);
  }

  // ── Run the migration first (idempotent) ───────────────────────────────────
  console.log('\nRunning migration 005 (add new columns)…');
  // Migration must be run manually in Supabase SQL Editor (supabase/migrations/005_agency_profile_fields.sql)
  console.log('(Skipping migration – run 005_agency_profile_fields.sql in Supabase SQL Editor if not done yet)');

  let updatedAgencies = 0;
  let insertedReviews = 0;
  const errors = [];

  for (let i = 0; i < agencies.length; i++) {
    const agency = agencies[i];
    process.stdout.write(`\r[${i + 1}/${agencies.length}] ${agency.name.padEnd(40)}`);

    // ── Determine category slug for this agency ──────────────────────────────
    const catIds  = agCatMap[agency.id] || [];
    const catSlug = catIds
      .map(id => catById[id]?.slug || '')
      .find(slug => CATEGORY_FOCUS[slug]) || 'default';

    const focus = CATEGORY_FOCUS[catSlug] || CATEGORY_FOCUS['default'];

    // ── Update agency focus data ─────────────────────────────────────────────
    const { error: upErr } = await sb
      .from('agencies')
      .update({
        service_focus:  focus.service_focus,
        industry_focus: focus.industry_focus,
        client_focus:   focus.client_focus,
        hourly_rate:    focus.hourly_rate,
        // tagline: skipped — column not yet in DB, add manually via migration
      })
      .eq('id', agency.id);

    if (upErr) {
      errors.push(`Update ${agency.name}: ${upErr.message}`);
      continue;
    }
    updatedAgencies++;

    // ── Skip if agency already has approved reviews ──────────────────────────
    const { count } = await sb
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', agency.id)
      .eq('approved', true);

    if (count > 0) continue;

    // ── Insert 3 anonymous reviews ───────────────────────────────────────────
    const reviewSet = REVIEW_SETS[i % REVIEW_SETS.length];
    const rows = reviewSet.map((r, j) => ({
      agency_id:            agency.id,
      user_id:              null,
      rating_overall:       r.rating_overall,
      rating_quality:       r.rating_quality,
      rating_communication: r.rating_communication,
      rating_value:         r.rating_value,
      rating_timeliness:    r.rating_timeliness,
      title:                r.title,
      body:                 r.body,
      company_name:         r.company_name,
      role_hired:           r.role_hired,
      work_duration:        r.work_duration,
      verified:             false,
      approved:             true,
      created_at:           randomPastDate(180 - j * 30),
      updated_at:           new Date().toISOString(),
    }));

    const { error: revErr } = await sb.from('reviews').insert(rows);
    if (revErr) {
      errors.push(`Reviews ${agency.name}: ${revErr.message}`);
    } else {
      insertedReviews += rows.length;
    }
  }

  // ── Update avg_rating + review_count ─────────────────────────────────────
  console.log('\n\nUpdating avg_rating and review_count for all agencies…');
  const { data: allReviews } = await sb
    .from('reviews')
    .select('agency_id, rating_overall')
    .eq('approved', true);

  const statsMap = {};
  for (const r of allReviews || []) {
    if (!statsMap[r.agency_id]) statsMap[r.agency_id] = { sum: 0, count: 0 };
    statsMap[r.agency_id].sum   += parseFloat(r.rating_overall);
    statsMap[r.agency_id].count += 1;
  }

  for (const [agencyId, { sum, count }] of Object.entries(statsMap)) {
    await sb.from('agencies').update({
      avg_rating:   Math.round((sum / count) * 10) / 10,
      review_count: count,
    }).eq('id', agencyId);
  }

  console.log('\n── Done ────────────────────────────────────────────────────────');
  console.log(`  Agencies updated : ${updatedAgencies}`);
  console.log(`  Reviews inserted : ${insertedReviews}`);
  if (errors.length) {
    console.warn(`  Errors (${errors.length}):`);
    errors.forEach(e => console.warn('   ', e));
  }
}

main().catch(err => { console.error('\nFatal:', err); process.exit(1); });
