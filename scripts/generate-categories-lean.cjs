const fs = require('fs');
const path = require('path');

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function esc(str) {
  return str.replace(/'/g, "''");
}

const INDUSTRIES = [
  { parent: 'Staffing & Recruiting', children: ['Healthcare Staffing', 'Industrial Staffing', 'Executive Search', 'Temporary Staffing', 'Permanent Staffing', 'Remote Staffing'] },
  { parent: 'Construction', children: ['Commercial Construction', 'Residential Construction', 'Civil Contractors', 'MEP Contractors', 'Interior Fit Out', 'Construction Equipment Rental'] },
  { parent: 'Healthcare', children: ['Hospitals', 'Clinics', 'Diagnostic Centers', 'Medical Devices', 'Pharmaceutical Manufacturers', 'Telemedicine'] },
  { parent: 'Finance & Accounting', children: ['Accounting Firms', 'Tax Consultants', 'Audit Services', 'Payroll Services', 'Bookkeeping', 'CFO Advisory'] },
  { parent: 'Legal Services', children: ['Corporate Law Firms', 'Litigation Firms', 'IP Law Firms', 'Contract Management', 'Compliance Consulting', 'Trademark Services'] },
  { parent: 'Marketing & Advertising', children: ['Digital Marketing', 'SEO Services', 'Performance Marketing', 'Branding Agencies', 'Social Media Marketing', 'Content Marketing'] },
  { parent: 'Logistics & Transportation', children: ['Freight Forwarding', 'Warehousing', 'Last Mile Delivery', 'Cold Chain Logistics', 'Customs Clearance', '3PL Services'] },
  { parent: 'Real Estate', children: ['Residential Brokerage', 'Commercial Brokerage', 'Property Management', 'Facility Management', 'Real Estate Developers', 'Valuation Services'] },
  { parent: 'Manufacturing', children: ['Industrial Manufacturing', 'CNC Manufacturing', 'Metal Fabrication', 'Plastic Components', 'Automotive Components', 'Contract Manufacturing'] },
  { parent: 'Machinery & Equipment', children: ['CNC Machines', 'Milling Machines', 'Drilling Machines', 'Welding Equipment', 'Packaging Machinery', 'Material Handling Equipment'] },
  { parent: 'Chemicals & Materials', children: ['Specialty Chemicals', 'Industrial Chemicals', 'Polymers', 'Coatings', 'Adhesives & Sealants', 'Water Treatment Chemicals'] },
  { parent: 'Retail & E-commerce', children: ['D2C Brands', 'Online Marketplaces', 'B2B E-commerce', 'Retail Chains', 'E-commerce Fulfillment', 'Marketplace Operations'] },
];

function buildParentDescription(parent) {
  return `${parent} companies listed on FirmsLedger. Compare verified providers, check reviews, and find trusted partners.`;
}

function buildChildDescription(child, parent) {
  return `${child} companies in ${parent}. Browse verified providers and shortlist the right partner on FirmsLedger.`;
}

function generateSQL(industries) {
  const lines = [];
  lines.push('-- FirmsLedger: Lean Category Seed');
  lines.push('-- Purpose: replace all current categories with a focused, storage-light set');
  lines.push('-- Excludes IT / Web Services for now\n');
  lines.push('BEGIN;');
  lines.push('');
  lines.push('-- Remove category links first to satisfy foreign keys');
  lines.push('DELETE FROM agency_categories');
  lines.push('WHERE category_id IN (SELECT id FROM categories);');
  lines.push('');
  lines.push('-- Remove all current categories');
  lines.push('DELETE FROM categories;');
  lines.push('');

  let parentOrder = 1;
  for (const { parent, children } of industries) {
    const parentSlug = toSlug(parent);
    const parentDesc = buildParentDescription(parent);

    lines.push(`-- ${parent}`);
    lines.push(`INSERT INTO categories (name, slug, description, is_parent, parent_id, "order") VALUES ('${esc(parent)}', '${parentSlug}', '${esc(parentDesc)}', true, NULL, ${parentOrder});`);

    const uniqueChildren = [...new Set(children)];
    uniqueChildren.forEach((child, idx) => {
      const childSlug = toSlug(child);
      const childDesc = buildChildDescription(child, parent);
      lines.push('INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")');
      lines.push(`SELECT '${esc(child)}', '${childSlug}', '${esc(childDesc)}', false, c.id, ${idx + 1}`);
      lines.push(`FROM categories c WHERE c.slug = '${parentSlug}';`);
    });
    lines.push('');
    parentOrder += 1;
  }

  lines.push('COMMIT;');
  lines.push('');
  return lines.join('\n');
}

const sql = generateSQL(INDUSTRIES);
const outPath = path.join(__dirname, '..', 'supabase', 'seed-categories-lean.sql');
fs.writeFileSync(outPath, sql, 'utf8');

let total = 0;
for (const { children } of INDUSTRIES) total += children.length + 1;

console.log(`Generated ${total} categories across ${INDUSTRIES.length} parent categories`);
console.log('Output: supabase/seed-categories-lean.sql');
console.log('This SQL deletes all current categories, then inserts the new set.');
