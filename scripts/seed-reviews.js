/**
 * Seed realistic B2B reviews for the 67 seeded companies.
 * Run: node scripts/seed-reviews.js
 * Safe to re-run — skips companies that already have reviews.
 */
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

// ── Review templates ──────────────────────────────────────────────────────────

const TITLES = [
  'Consistent quality and on-time delivery',
  'Excellent supplier for our production needs',
  'Strong technical capability, great communication',
  'Reliable long-term manufacturing partner',
  'Impressed with their turnaround time',
  'High-quality output, competitive pricing',
  'Great team, transparent throughout the project',
  'Exceeded our specifications on every order',
  'Solid partner for complex machining work',
  'Professional operation with ISO standards',
  'Outstanding precision and zero defects on our last run',
  'Responsive team, delivered ahead of schedule',
  'Best vendor we have worked with in years',
  'Flexible on order volumes, very accommodating',
  'Highly recommend for OEM production runs',
];

const BODIES = [
  'We have been sourcing from this manufacturer for over two years. Every batch has met our tolerance requirements without exception. Their quality control process is clearly well-established and the team communicates proactively whenever there are scheduling changes.',
  'Engaged them for a large-scale production run of electrical components. The lead times were accurate, the packaging was appropriate for transit, and the account manager kept us updated at every stage. Will definitely be renewing the contract.',
  'We needed a fast-turnaround supplier for CNC machined parts and they delivered within the stated window. Surface finishes were exactly as specified and the documentation — including material certifications — was thorough and professionally presented.',
  'After disappointing experiences with two previous vendors, this manufacturer restored our confidence. Their engineers engaged with our design team early in the process to flag potential manufacturing challenges before production began. That proactive approach saved us significant rework costs.',
  'Pricing is competitive for the quality tier they operate at. We benchmarked against four other suppliers and chose them based on a combination of per-unit cost and the technical capabilities tour we conducted. No regrets — 18 months in and zero line stoppages attributable to their parts.',
  'Their facility is well-organized and clearly ISO 9001 certified in practice, not just on paper. The inspection reports provided with each shipment give us full traceability. Our quality team has flagged this supplier as preferred status.',
  'Fast response to RFQ, reasonable MOQ for our volume, and they were willing to supply test samples before we committed to the full order. The samples matched production quality exactly — a rarity in our experience.',
  'We work in a regulated industry and documentation is critical. This team provided all required certifications, material data sheets, and test reports without us having to chase anything. That alone makes them stand out from most of the market.',
  'Communication was excellent throughout. Even when they encountered a raw material delay, they notified us three weeks ahead and proposed a revised schedule that kept our production line running. That level of transparency is what we look for in a strategic supplier.',
  'Quality is consistently high across different product lines. We have ordered electrical assemblies, mechanical sub-components, and packaging from the same facility and the standard has been uniform. A genuinely capable manufacturer.',
  'They handle complexity well. We gave them a technically demanding brief with tight dimensional tolerances and they came back with a process plan within 48 hours. The first article inspection passed with zero non-conformances.',
  'Our procurement team initially had concerns about lead time given the distance, but they have consistently outperformed the agreed schedule. Three orders in and we are now treating them as a core supplier in our approved vendor list.',
  'The relationship has evolved from transactional to collaborative over the past year. They now flag upstream material cost movements proactively so we can adjust purchasing plans accordingly. That kind of partnership is invaluable.',
  'Visited the facility last quarter and came away impressed with the automation investment they have made. The production floor is clean, organized, and the operators clearly know the equipment well. Reflects in the output quality.',
  'We brought them a design challenge that two other manufacturers had declined due to complexity. They took it on, asked the right clarifying questions, and produced first-off parts that were within tolerance. Problem solvers.',
];

const REVIEWER_NAMES = [
  'Michael Torres', 'Jennifer Walsh', 'David Kim', 'Sarah Chen', 'Robert Patel',
  'Amanda Fischer', 'James O\'Brien', 'Lisa Nakamura', 'Christopher Reyes', 'Emily Huang',
  'Daniel Schneider', 'Michelle Park', 'Andrew Malik', 'Rachel Goldstein', 'Kevin Murphy',
  'Stephanie Johansson', 'Brian Okafor', 'Natalie Rossi', 'Thomas Bergmann', 'Karen Yamamoto',
];

const REVIEWER_COMPANIES = [
  'Apex Industrial Supply Co.', 'Vertex Manufacturing Group', 'Summit Precision Products',
  'Meridian OEM Solutions', 'Cascade Engineering LLC', 'Pinnacle Assembly Systems',
  'Horizon Components Inc.', 'Cornerstone Fabrication', 'Crestline Industrial Partners',
  'Keystone Production Group', 'Ridgeline Manufacturing', 'Bluewater Supply Chain',
  'Atlas Component Works', 'Sterling Industrial Group', 'Pacific OEM Partners',
  'Lakeside Assembly Co.', 'Highpoint Engineering Solutions', 'Ironwood Manufacturing',
  'Clearwater Precision Inc.', 'Northgate Industrial Supply',
];

const ROLES = [
  'Procurement Manager', 'Supply Chain Director', 'Operations Manager',
  'VP of Manufacturing', 'Sourcing Lead', 'Quality Assurance Manager',
  'Production Director', 'Materials Manager', 'Plant Manager', 'Engineering Manager',
];

const DURATIONS = [
  '3 months', '6 months', '1 year', '18 months', '2 years', '2+ years',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min, max, step = 0.1) {
  const steps = Math.round((max - min) / step);
  return +(min + Math.floor(Math.random() * (steps + 1)) * step).toFixed(1);
}

function subRating(base) {
  const delta = rand(-0.4, 0.4);
  return Math.min(5.0, Math.max(3.0, +(base + delta).toFixed(1)));
}

function generateReview(companyId, reviewIndex) {
  const overall = rand(3.8, 5.0);
  return {
    company_id:           companyId,
    reviewer_name:        pick(REVIEWER_NAMES),
    reviewer_company:     pick(REVIEWER_COMPANIES),
    rating_overall:       overall,
    rating_quality:       subRating(overall),
    rating_communication: subRating(overall),
    rating_value:         subRating(overall),
    rating_timeliness:    subRating(overall),
    title:                pick(TITLES),
    body:                 pick(BODIES),
    work_duration:        pick(DURATIONS),
    role_hired:           pick(ROLES),
    verified:             true,
    approved:             true,
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Seeding reviews...\n');

  const companies = await sql`SELECT id, name FROM companies WHERE approved = true ORDER BY name`;
  console.log(`📋 Found ${companies.length} companies\n`);

  // Check which companies already have reviews
  const existing = await sql`SELECT DISTINCT company_id FROM reviews`;
  const withReviews = new Set(existing.map((r) => r.company_id));

  let inserted = 0;
  let skipped = 0;

  for (const company of companies) {
    if (withReviews.has(company.id)) {
      skipped++;
      continue;
    }

    // 2–3 reviews per company
    const count = 2 + Math.floor(Math.random() * 2);
    const reviewBatch = Array.from({ length: count }, (_, i) => generateReview(company.id, i));

    for (const r of reviewBatch) {
      await sql`
        INSERT INTO reviews (
          company_id, reviewer_name, reviewer_company,
          rating_overall, rating_quality, rating_communication, rating_value, rating_timeliness,
          title, body, work_duration, role_hired,
          verified, approved
        ) VALUES (
          ${r.company_id}, ${r.reviewer_name}, ${r.reviewer_company},
          ${r.rating_overall}, ${r.rating_quality}, ${r.rating_communication},
          ${r.rating_value}, ${r.rating_timeliness},
          ${r.title}, ${r.body}, ${r.work_duration}, ${r.role_hired},
          ${r.verified}, ${r.approved}
        )
      `;
      inserted++;
    }

    // Update company avg_rating and review_count
    await sql`
      UPDATE companies SET
        avg_rating   = (SELECT ROUND(AVG(rating_overall)::numeric, 2) FROM reviews WHERE company_id = ${company.id} AND approved = true),
        review_count = (SELECT COUNT(*) FROM reviews WHERE company_id = ${company.id} AND approved = true)
      WHERE id = ${company.id}
    `;
  }

  const total = await sql`SELECT COUNT(*) FROM reviews`;
  console.log(`✅ Done!`);
  console.log(`   Inserted: ${inserted} reviews`);
  console.log(`   Skipped (already had reviews): ${skipped} companies`);
  console.log(`   Total reviews in DB: ${total[0].count}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
