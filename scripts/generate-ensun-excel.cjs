/**
 * Generates an Excel report of all ensun.io categories and their status in FirmsLedger.
 * Run: node scripts/generate-ensun-excel.cjs
 */

const fs = require('fs');
const path = require('path');

// All 55 categories from ensun.io with metadata
const categories = [
  // Healthcare & Medical
  { category: 'Dental', slug: 'dental', parent: 'Healthcare & Medical', countries: 'Germany, Italy, China, Japan', status: 'NEW', ensunUrl: 'https://ensun.io/search/dental' },
  { category: 'Pharmaceutical', slug: 'pharmaceutical', parent: 'Healthcare & Medical', countries: 'Canada, Germany', status: 'NEW', ensunUrl: 'https://ensun.io/search/pharmaceutical' },
  { category: 'Stent', slug: 'stent', parent: 'Healthcare & Medical', countries: 'Global', status: 'NEW', ensunUrl: 'https://ensun.io/search/stent' },
  { category: 'Vitamin', slug: 'vitamin', parent: 'Healthcare & Medical', countries: 'Australia', status: 'NEW', ensunUrl: 'https://ensun.io/search/vitamin' },
  { category: 'Neurotechnology', slug: 'neurotechnology', parent: 'Healthcare & Medical', countries: 'Switzerland, Estonia', status: 'NEW', ensunUrl: 'https://ensun.io/search/neurotechnology' },

  // Manufacturing & Industrial
  { category: 'Forging', slug: 'forging', parent: 'Manufacturing & Industrial', countries: 'China, Australia', status: 'NEW', ensunUrl: 'https://ensun.io/search/forging' },
  { category: 'Rotational Molding', slug: 'rotational-molding', parent: 'Manufacturing & Industrial', countries: 'Global', status: 'NEW', ensunUrl: 'https://ensun.io/search/rotational-molding' },
  { category: 'Pipe', slug: 'pipe', parent: 'Manufacturing & Industrial', countries: 'Canada', status: 'NEW', ensunUrl: 'https://ensun.io/search/pipe' },
  { category: 'Transformer', slug: 'transformer', parent: 'Manufacturing & Industrial', countries: 'Pakistan', status: 'NEW', ensunUrl: 'https://ensun.io/search/transformer' },
  { category: 'Gas Cylinder', slug: 'gas-cylinder', parent: 'Manufacturing & Industrial', countries: 'Global', status: 'NEW', ensunUrl: 'https://ensun.io/search/gas-cylinder' },
  { category: 'Automotive Glass', slug: 'automotive-glass', parent: 'Manufacturing & Industrial', countries: 'Global', status: 'NEW', ensunUrl: 'https://ensun.io/search/automotive-glass' },
  { category: 'Loudspeaker', slug: 'loudspeaker', parent: 'Manufacturing & Industrial', countries: 'Italy', status: 'NEW', ensunUrl: 'https://ensun.io/search/loudspeaker' },

  // Energy & Utilities
  { category: 'Electricity', slug: 'electricity', parent: 'Energy & Utilities', countries: 'Poland', status: 'NEW', ensunUrl: 'https://ensun.io/search/electricity' },
  { category: 'Propane', slug: 'propane', parent: 'Energy & Utilities', countries: 'Canada', status: 'NEW', ensunUrl: 'https://ensun.io/search/propane' },
  { category: 'Biochar', slug: 'biochar', parent: 'Energy & Utilities', countries: 'Germany', status: 'NEW', ensunUrl: 'https://ensun.io/search/biochar' },
  { category: 'Pyrolysis', slug: 'pyrolysis', parent: 'Energy & Utilities', countries: 'Global', status: 'NEW', ensunUrl: 'https://ensun.io/search/pyrolysis' },

  // Electronics & Technology
  { category: 'Semiconductor', slug: 'semiconductor', parent: 'Electronics & Technology', countries: 'Pakistan, Denmark', status: 'NEW', ensunUrl: 'https://ensun.io/search/semiconductor' },
  { category: 'Computer', slug: 'computer', parent: 'Electronics & Technology', countries: 'India', status: 'NEW', ensunUrl: 'https://ensun.io/search/computer' },
  { category: 'Printer', slug: 'printer', parent: 'Electronics & Technology', countries: 'Japan', status: 'NEW', ensunUrl: 'https://ensun.io/search/printer' },
  { category: 'Satellite', slug: 'satellite', parent: 'Electronics & Technology', countries: 'India', status: 'NEW', ensunUrl: 'https://ensun.io/search/satellite' },
  { category: 'Quantum Security', slug: 'quantum-security', parent: 'Electronics & Technology', countries: 'Global', status: 'NEW', ensunUrl: 'https://ensun.io/search/quantum-security' },
  { category: 'ATM', slug: 'atm', parent: 'Electronics & Technology', countries: 'Pakistan', status: 'NEW', ensunUrl: 'https://ensun.io/search/atm' },

  // Construction & Infrastructure
  { category: 'Construction', slug: 'construction', parent: 'Construction & Infrastructure', countries: 'Mexico', status: 'NEW', ensunUrl: 'https://ensun.io/search/construction' },
  { category: 'Elevator', slug: 'elevator', parent: 'Construction & Infrastructure', countries: 'Greece, Turkey', status: 'NEW', ensunUrl: 'https://ensun.io/search/elevator' },

  // Chemicals & Materials
  { category: 'Resin', slug: 'resin', parent: 'Chemicals & Materials', countries: 'Turkey', status: 'NEW', ensunUrl: 'https://ensun.io/search/resin' },
  { category: 'Lactose', slug: 'lactose', parent: 'Chemicals & Materials', countries: 'Global', status: 'NEW', ensunUrl: 'https://ensun.io/search/lactose' },
  { category: 'Biostimulant', slug: 'biostimulant', parent: 'Chemicals & Materials', countries: 'Global', status: 'NEW', ensunUrl: 'https://ensun.io/search/biostimulant' },
  { category: 'Cosmetics', slug: 'cosmetics', parent: 'Chemicals & Materials', countries: 'Iran, Czechia', status: 'NEW', ensunUrl: 'https://ensun.io/search/cosmetics' },

  // Agriculture & Farming
  { category: 'Agriculture', slug: 'agriculture', parent: 'Agriculture & Farming', countries: 'Romania', status: 'NEW', ensunUrl: 'https://ensun.io/search/agriculture' },
  { category: 'Fertilizer', slug: 'fertilizer', parent: 'Agriculture & Farming', countries: 'Egypt', status: 'NEW', ensunUrl: 'https://ensun.io/search/fertilizer' },
  { category: 'Agrochemical', slug: 'agrochemical', parent: 'Agriculture & Farming', countries: 'Pakistan, Poland', status: 'NEW', ensunUrl: 'https://ensun.io/search/agrochemical' },

  // Textiles & Apparel
  { category: 'Clothing', slug: 'clothing', parent: 'Textiles & Apparel', countries: 'Egypt', status: 'NEW', ensunUrl: 'https://ensun.io/search/clothing' },
  { category: 'Hosiery', slug: 'hosiery', parent: 'Textiles & Apparel', countries: 'China', status: 'NEW', ensunUrl: 'https://ensun.io/search/hosiery' },

  // Aerospace & Defense
  { category: 'Aerospace', slug: 'aerospace', parent: 'Aerospace & Defense', countries: 'Norway', status: 'NEW', ensunUrl: 'https://ensun.io/search/aerospace' },
  { category: 'Ammunition', slug: 'ammunition', parent: 'Aerospace & Defense', countries: 'Spain', status: 'NEW', ensunUrl: 'https://ensun.io/search/ammunition' },
  { category: 'Gunpowder', slug: 'gunpowder', parent: 'Aerospace & Defense', countries: 'Global', status: 'NEW', ensunUrl: 'https://ensun.io/search/gunpowder' },

  // Transportation & Logistics
  { category: 'Maritime', slug: 'maritime', parent: 'Transportation & Logistics', countries: 'Germany', status: 'NEW', ensunUrl: 'https://ensun.io/search/maritime' },
  { category: 'Shipping', slug: 'shipping', parent: 'Transportation & Logistics', countries: 'Ghana', status: 'NEW', ensunUrl: 'https://ensun.io/search/shipping' },
  { category: 'Delivery Drone', slug: 'delivery-drone', parent: 'Transportation & Logistics', countries: 'Global', status: 'NEW', ensunUrl: 'https://ensun.io/search/delivery-drone' },

  // Home & Lifestyle
  { category: 'Lighting', slug: 'lighting', parent: 'Home & Lifestyle', countries: 'India, Belgium', status: 'NEW', ensunUrl: 'https://ensun.io/search/lighting' },
  { category: 'Refrigerator', slug: 'refrigerator', parent: 'Home & Lifestyle', countries: 'India', status: 'NEW', ensunUrl: 'https://ensun.io/search/refrigerator' },
  { category: 'Mattress', slug: 'mattress', parent: 'Home & Lifestyle', countries: 'Italy', status: 'NEW', ensunUrl: 'https://ensun.io/search/mattress' },

  // Financial Services
  { category: 'Funding', slug: 'funding', parent: 'Financial Services', countries: 'Zimbabwe', status: 'NEW', ensunUrl: 'https://ensun.io/search/funding' },

  // ── ALREADY EXIST IN FIRMSLEDGER ───────────────────────────────────────────
  { category: 'Coffee', slug: 'coffee', parent: 'Food & Beverage', countries: 'Israel', status: 'EXISTS', ensunUrl: 'https://ensun.io/search/coffee' },
  { category: 'Greenhouse', slug: 'greenhouse', parent: 'Agriculture & Farming', countries: 'Germany, Netherlands', status: 'EXISTS', ensunUrl: 'https://ensun.io/search/greenhouse' },
  { category: 'Butter', slug: 'butter', parent: 'Food & Beverage', countries: 'Pakistan', status: 'EXISTS', ensunUrl: 'https://ensun.io/search/butter' },
  { category: 'EdTech', slug: 'edtech', parent: 'Education', countries: 'Bangladesh', status: 'EXISTS', ensunUrl: 'https://ensun.io/search/edtech' },
  { category: 'Lingerie', slug: 'lingerie', parent: 'Textiles & Apparel', countries: 'Brazil, Turkey', status: 'EXISTS', ensunUrl: 'https://ensun.io/search/lingerie' },
  { category: 'Dredging', slug: 'dredging', parent: 'Construction', countries: 'Philippines', status: 'EXISTS', ensunUrl: 'https://ensun.io/search/dredging' },
  { category: 'Gaming', slug: 'gaming', parent: 'Entertainment', countries: 'Spain', status: 'EXISTS', ensunUrl: 'https://ensun.io/search/gaming' },
  { category: 'Aircraft', slug: 'aircraft', parent: 'Aerospace & Defense', countries: 'Australia', status: 'EXISTS', ensunUrl: 'https://ensun.io/search/aircraft' },
  { category: 'Nanotechnology', slug: 'nanotechnology', parent: 'Technology', countries: 'Germany', status: 'EXISTS', ensunUrl: 'https://ensun.io/search/nanotechnology' },
  { category: 'Glass', slug: 'glass', parent: 'Manufacturing', countries: 'Bangladesh', status: 'EXISTS', ensunUrl: 'https://ensun.io/search/glass' },
  { category: 'HVAC', slug: 'hvac', parent: 'Construction', countries: 'Philippines', status: 'EXISTS', ensunUrl: 'https://ensun.io/search/hvac' },
  { category: 'Fragrance', slug: 'fragrance', parent: 'Chemicals & Materials', countries: 'India', status: 'EXISTS', ensunUrl: 'https://ensun.io/search/fragrance' },
];

// ── Generate CSV (Excel-compatible) ──────────────────────────────────────────

const header = ['#', 'Category', 'Slug', 'Parent Group', 'Countries (from ensun.io)', 'Status', 'Ensun URL', 'FirmsLedger URL'];
const rows = categories.map((c, i) => [
  i + 1,
  c.category,
  c.slug,
  c.parent,
  c.countries,
  c.status,
  c.ensunUrl,
  `https://www.firmsledger.com/directory?category=${c.slug}`,
]);

// Escape for CSV
function csvEscape(val) {
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

const csvContent = [header, ...rows].map(r => r.map(csvEscape).join(',')).join('\n');

// Add BOM for Excel to detect UTF-8
const BOM = '\uFEFF';
const outPath = path.join(__dirname, '..', 'scraped-data', 'ensun-categories-report.csv');

// Ensure dir exists
const outDir = path.dirname(outPath);
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(outPath, BOM + csvContent);
console.log(`\n  Excel-compatible CSV saved: ${outPath}`);
console.log(`  Total categories: ${categories.length}`);
console.log(`  New (to add):     ${categories.filter(c => c.status === 'NEW').length}`);
console.log(`  Already exist:    ${categories.filter(c => c.status === 'EXISTS').length}\n`);

// Also generate a quick summary
const summary = `
ENSUN.IO CATEGORIES REPORT FOR FIRMSLEDGER
============================================
Date: ${new Date().toISOString().slice(0, 10)}

Total categories found: ${categories.length}
Already in FirmsLedger:  ${categories.filter(c => c.status === 'EXISTS').length}
New categories to add:   ${categories.filter(c => c.status === 'NEW').length}

NEW PARENT GROUPS CREATED:
${[...new Set(categories.filter(c => c.status === 'NEW').map(c => c.parent))].map(p => `  - ${p}`).join('\n')}

NEW CATEGORIES BY GROUP:
${[...new Set(categories.filter(c => c.status === 'NEW').map(c => c.parent))].map(parent => {
  const children = categories.filter(c => c.parent === parent && c.status === 'NEW');
  return `\n  ${parent}:\n${children.map(c => `    - ${c.category} (${c.countries})`).join('\n')}`;
}).join('\n')}

ALREADY EXISTING:
${categories.filter(c => c.status === 'EXISTS').map(c => `  - ${c.category} (${c.countries})`).join('\n')}
`;

const summaryPath = path.join(outDir, 'ensun-categories-summary.txt');
fs.writeFileSync(summaryPath, summary);
console.log(`  Summary saved: ${summaryPath}\n`);
