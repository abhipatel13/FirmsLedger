/**
 * Shared SEO constants and helpers for metadata (titles, descriptions).
 * Titles use format: "Top [Category] in [Year] in [Country] | FirmsLedger"
 */

export const SITE_NAME = 'FirmsLedger';

export const SEO_YEAR = 2026;
export const SEO_COUNTRY = process.env.NEXT_PUBLIC_SEO_COUNTRY || 'United States';
export const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://firmsledger.com';

/** Unique meta descriptions for staffing subcategories (slug → description) */
export const STAFFING_CATEGORY_DESCRIPTIONS = {
  'it-technology-staffing':
    'Find the best IT staffing agencies in the US. Compare verified tech recruiters for software engineers, data scientists, cybersecurity, cloud, and DevOps roles on FirmsLedger.',
  'healthcare-staffing':
    'Find leading healthcare staffing companies across the US. Compare travel nursing, allied health, physician, and medical staffing agencies with verified reviews on FirmsLedger.',
  'industrial-manufacturing-staffing':
    'Find the best industrial and manufacturing staffing agencies in the US. Compare skilled trades, warehouse, production, and factory workforce providers on FirmsLedger.',
  'construction-staffing':
    'Find top construction staffing companies in the US. Compare electricians, pipefitters, welders, laborers, and project management staffing agencies on FirmsLedger.',
  'accounting-finance-staffing':
    'Find the best accounting and finance staffing agencies in the US. Compare CPAs, controllers, bookkeepers, and financial analyst recruiters on FirmsLedger.',
  'administrative-office-staffing':
    'Find top administrative and office staffing agencies in the US. Compare receptionists, executive assistants, and office manager recruiters on FirmsLedger.',
  'executive-search-recruiting':
    'Find leading executive search firms in the US. Compare C-suite, VP, and director-level retained and contingency search agencies on FirmsLedger.',
  'legal-staffing':
    'Find top legal staffing agencies in the US. Compare paralegals, legal assistants, contract attorneys, and law firm support recruiters on FirmsLedger.',
  'engineering-staffing':
    'Find the best engineering staffing companies in the US. Compare mechanical, electrical, civil, and aerospace engineer recruiters on FirmsLedger.',
  'warehouse-logistics-staffing':
    'Find top warehouse and logistics staffing agencies in the US. Compare warehouse workers, forklift operators, drivers, and supply chain recruiters on FirmsLedger.',
  'temporary-staffing':
    'Find the best temporary staffing agencies in the US. Compare short-term, seasonal, and temp-to-hire workforce solutions across all industries on FirmsLedger.',
  'remote-staffing':
    'Find top remote staffing companies in the US. Compare distributed teams, remote workers, and virtual assistant providers on FirmsLedger.',
  'government-defense-staffing':
    'Find leading government and defense staffing agencies in the US. Compare security-cleared professionals for federal, state, and military contracts on FirmsLedger.',
  'hospitality-event-staffing':
    'Find top hospitality and event staffing agencies in the US. Compare servers, bartenders, event coordinators, and hotel staffing providers on FirmsLedger.',
  'scientific-pharmaceutical-staffing':
    'Find the best scientific and pharmaceutical staffing agencies in the US. Compare lab technicians, researchers, QA specialists, and clinical trial recruiters on FirmsLedger.',
};

/**
 * Meta description for a category page. Uses unique copy when available, else a generated one.
 */
export function getCategoryMetaDescription(categoryName, slug, options = {}) {
  const { underStaffing = false } = options;
  const key = (slug || '').trim().toLowerCase();
  if (underStaffing && STAFFING_CATEGORY_DESCRIPTIONS[key]) {
    return STAFFING_CATEGORY_DESCRIPTIONS[key];
  }
  const name = categoryName || 'Service';
  return `Find the best ${name} companies worldwide on FirmsLedger. Compare verified ${name.toLowerCase()} providers by real client reviews, team size, pricing, and expertise — updated for ${SEO_YEAR}.`;
}

/** Title for a category listing page: "Top [Category Name] Companies (2026)" */
export function getCategoryTitle(categoryName) {
  return `Top ${categoryName} Companies (${SEO_YEAR})`;
}

/**
 * Location-aware title: "Top [Category] Companies in [Location] (2026)"
 * Falls back to plain category title when no location provided.
 */
export function getCategoryTitleWithLocation(categoryName, location) {
  if (location) {
    return `Top ${categoryName} Companies in ${location} (${SEO_YEAR})`;
  }
  return `Top ${categoryName} Companies in ${SEO_YEAR}`;
}

/**
 * Location-aware meta description.
 * The DB description (set per-category) provides the unique informative part.
 * This function adds location context on top for geo pages.
 */
export function getCategoryMetaDescriptionWithLocation(categoryName, slug, location) {
  const key = (slug || '').trim().toLowerCase();
  if (!location && STAFFING_CATEGORY_DESCRIPTIONS[key]) {
    return STAFFING_CATEGORY_DESCRIPTIONS[key];
  }
  const name = categoryName || 'Business';
  if (location) {
    return `Find the best ${name} companies in ${location}. Compare verified ${name.toLowerCase()} providers in ${location} by client reviews, pricing, and expertise. Browse top-rated ${name.toLowerCase()} service providers and manufacturers on FirmsLedger — ${SEO_YEAR} rankings.`;
  }
  return `Find the best ${name} companies and service providers on FirmsLedger. Compare verified ${name.toLowerCase()} providers by real client reviews, team size, pricing, and expertise — updated for ${SEO_YEAR}.`;
}
