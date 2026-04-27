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
/**
 * Per-slug, per-country title overrides for the "Top N <Category> <Noun> in
 * <Location> (<Year>)" format. ONE source of truth — used by both the SEO
 * <title> and the on-page H1.
 *
 * Structure:
 *   slug → { '<Country>': { top, noun, name, description } }
 * Use '*' as the country key to apply to ALL locations of that slug
 * (or to a slug with no country filter at all).
 *
 * Per-entry options:
 *   top:         number shown in the title ("Top 10 …"). Omit for plain "Top …".
 *   noun:        word after the category name (default 'Companies').
 *   name:        override the displayed category name (e.g. show "Transformer"
 *                even though the DB slug is "transformers").
 *   description: SEO meta description override (use for keyword targeting).
 */
export const CATEGORY_TITLE_OVERRIDES = {
  'artificial-turf':           { 'South Korea':    { top: 10, noun: 'Companies' } },
  'transformers':              { 'United States':  { top: 8,  noun: 'Manufacturers', name: 'Transformer' } },
  'mushroom-producers':        { 'United States':  { top: 10, noun: 'Producers',     name: 'Mushroom' } },
  'vinyl-flooring':            { 'Philippines':    { top: 6,  noun: 'Manufacturers' } },
  'construction-companies':    { 'Mexico':         { top: 7,  noun: 'Companies',     name: 'Construction' } },
  'gold':                      { 'Philippines':    { top: 11, noun: 'Companies' } },
  'loudspeaker-manufacturers': { 'Denmark':        { top: 5,  noun: 'Manufacturers', name: 'Loudspeaker' } },
  'pumps':                     { 'China':          { top: 4,  noun: 'Manufacturers', name: 'Pump' } },
  'flexible-packaging':        { 'Canada':         { top: 5,  noun: 'Companies' } },
  'glass':                     { 'United Kingdom': { top: 3,  noun: 'Manufacturers', name: 'Glass' } },
  'plastic-recycling':         { 'India':          { top: 5,  noun: 'Companies' } },
  'embedded-systems':          { 'Singapore':      {           noun: 'Companies' } },
  'toy-manufacturing':         {
    'Singapore':     { top: 5, noun: 'Companies' },
    'India':         { top: 5, noun: 'Companies' },
    'United States': { top: 5, noun: 'Companies' },
    'Canada':        { top: 5, noun: 'Companies' },
    'Germany':       { top: 5, noun: 'Companies' },
    'France':        { top: 5, noun: 'Companies' },
  },

  // Global pages (no country filter) — use '*' key.
  'underwater-welding': { '*': { top: 10, noun: 'Companies' } },
  'cryogenic':          { '*': { top: 10, noun: 'Companies' } },

  // Clotted Cream — keyword-rich description (kept under 160 chars for SERP).
  // Targets: clotted cream, recipe, scones, fudge, cookie, near me.
  'clotted-cream': {
    '*': {
      top: 10,
      noun: 'Manufacturers',
      description:
        'Top 10 clotted cream manufacturers and brands for 2026. Find Devon and Cornish clotted cream for scones, recipes, fudge, cookies, and shops near you.',
    },
  },

  'seasoning':           { 'Greece':        { top: 5, noun: 'Companies' } },
  'accounting-software': { 'Kenya':         { top: 9, noun: 'Companies' } },
  'airlines':            { 'Saudi Arabia':  {         noun: 'Companies', name: 'Airline' } }, // no top → "Top Airline Companies in Saudi Arabia (2026)"
  'cell-phone-companies':{ 'United States': { top: 7, noun: 'Companies', name: 'Cell Phone' } },

  // Batch 1 (2026-04-26): 14 directories
  'slot-machines':           { 'United States': { top: 10, noun: 'Manufacturers', name: 'Slot Machine' } },
  'beer-distribution':       { 'United States': { top: 10, noun: 'Companies' } },
  'cables-wires':            { 'United States': { top: 7,  noun: 'Companies',     name: 'Wire And Cable' } },
  'aftermarket-parts':       { 'United States': { top: 10, noun: 'Manufacturers', name: 'Aftermarket Automotive Part' } },
  'mystery-shopping':        { 'United States': { top: 6,  noun: 'Companies' } },
  'butter':                  { 'Spain':         { top: 10, noun: 'Companies' } },
  'networking':              { 'China':         { top: 10, noun: 'Companies', name: 'Computer Networking' } },
  'beverage-manufacturers':  { 'Canada':        { top: 5,  noun: 'Manufacturers', name: 'Beverage' } },
  'appraisal-management':    { '*':             { top: 5,  noun: 'Companies' } },
  'roofing':                 { 'United States': { top: 8,  noun: 'Companies' } },
  'it-consulting':           { 'Germany':       { top: 10, noun: 'Companies' } },
  'promotions-management':   { 'India':         { top: 10, noun: 'Companies', name: 'Promotion' } },
  'atm-companies':           { 'India':         { top: 10, noun: 'Companies', name: 'ATM' } },
  'alternative-investments': { 'Australia':     { top: 6,  noun: 'Companies', name: 'Alternative Investment' } },

  // Batch 2 (2026-04-26): 33 directories
  'food-processing':           { 'Mexico':        { top: 10, noun: 'Companies' } },
  'root-beer':                 { '*':             { top: 10, noun: 'Companies' } },
  'hvac':                      { 'United States': { top: 10, noun: 'Companies' } },
  'erp-software':              { '*':             { top: 10, noun: 'Companies' } },
  'dental-implants':           { 'United States': { top: 10, noun: 'Companies', name: 'Dental Implant' } },
  'pex-pipe':                  { 'United States': { top: 10, noun: 'Manufacturers', name: 'PEX Pipe' } },
  'professional-services':     { '*':             { top: 10, noun: 'Companies' } },
  'automotive-manufacturing':  {
    'Kenya':         { top: 10, noun: 'Companies' },
    'Italy':         { top: 5,  noun: 'Companies' },
  },
  'hockey-tape':               { '*':             { top: 10, noun: 'Manufacturers', name: 'Hockey Tape' } },
  'solar-lights':              { 'China':         { top: 10, noun: 'Manufacturers', name: 'Solar Light' } },
  'cashews':                   { '*':             { top: 10, noun: 'Manufacturers', name: 'Cashew Nut' } },
  'influencer-marketing':      { 'Germany':       { top: 10, noun: 'Companies' } },
  'online-event-ticketing':    { 'Italy':         { top: 10, noun: 'Companies' } },
  'specialty-chemicals':       { 'Spain':         { top: 7,  noun: 'Companies' } },
  'sportswear':                { 'Italy':         { top: 10, noun: 'Companies' } },
  'composite-siding':          { 'United States': { top: 10, noun: 'Manufacturers', name: 'Composite Siding' } },
  'chemical-manufacturing':    { 'Malaysia':      { top: 10, noun: 'Companies' } },
  'sensors':                   { 'Finland':       { top: 10, noun: 'Manufacturers', name: 'Sensor' } },
  'lead-generation':           { 'United States': { top: 10, noun: 'Companies' } },
  'vacuum-service-trucks':     { '*':             { top: 10, noun: 'Manufacturers', name: 'Vacuum Service Truck' } },
  'proton-exchange-membranes': { '*':             { top: 11, noun: 'Manufacturers', name: 'Proton Exchange Membrane' } },
  'gas-stations':              { 'United States': { top: 9,  noun: 'Companies', name: 'Gas Station' } },
  'ski-manufacturers':         { '*':             { top: 8,  noun: 'Companies', name: 'Ski' } },
  'end-user-computing':        { '*':             { top: 9,  noun: 'Companies', name: 'End User Computing (EUC)' } },
  'real-estate-development':   { 'Spain':         { top: 5,  noun: 'Companies' } },
  'cigars':                    { '*':             { top: 7,  noun: 'Companies', name: 'Cigar' } },
  'pretzels':                  { 'United States': { top: 4,  noun: 'Companies', name: 'Pretzel' } },
  'acting':                    { 'Turkey':        { top: 8,  noun: 'Companies', name: 'Acting' } },
  'mro':                       { '*':             { top: 5,  noun: 'Companies', name: 'Maintenance Repair and Operations (MRO)' } },
  'paints':                    { 'United States': { top: 10, noun: 'Manufacturers', name: 'Paint' } },
};

/**
 * Build the "Top N <Category> <Noun> in <Location> (<Year>)" title for an
 * allowlisted slug+country combo. Returns null when no override matches —
 * callers fall back to the plain "Top <Category> Companies" title.
 *
 * `country` is matched against the keys; '*' acts as a wildcard fallback.
 */
export function getOverriddenCategoryTitle(slug, categoryName, location, country) {
  const override = getOverrideEntry(slug, country);
  if (!override) return null;
  const name = override.name || categoryName;
  const n = override.top ? `${override.top} ` : '';
  const noun = override.noun || 'Companies';
  const where = location ? ` in ${location}` : '';
  return `Top ${n}${name} ${noun}${where} (${SEO_YEAR})`;
}

/**
 * Returns the SEO meta description for this slug+country override.
 *
 *   1. Use the explicit `description` field if set (keyword-targeted copy).
 *   2. Else auto-generate a unique description from the override fields,
 *      so every curated page has its own meta description without forcing
 *      a hand-written one.
 *
 * Returns null only when there is no override at all — callers fall back
 * to the default category-level description.
 */
export function getOverriddenCategoryDescription(slug, country, categoryName, location) {
  const override = getOverrideEntry(slug, country);
  if (!override) return null;
  if (override.description) return override.description;

  // Auto-generated keyword-rich fallback. Kept under ~160 chars so Google
  // doesn't truncate it in search results.
  const name = override.name || categoryName || 'Business';
  const noun = override.noun || 'Companies';
  const where = location ? ` in ${location}` : '';
  const n = override.top ? `Top ${override.top} ` : 'Leading ';
  return `${n}${name} ${noun}${where} for ${SEO_YEAR}. Compare verified ${name.toLowerCase()} ${noun.toLowerCase()} by reviews, pricing, and location on FirmsLedger.`;
}

export function getOverrideEntry(slug, country) {
  const slugMap = CATEGORY_TITLE_OVERRIDES[slug];
  if (!slugMap) return null;
  return slugMap[country] || slugMap['*'] || null;
}

export function getCategoryTitle(categoryName, count) {
  const n = Number(count) > 0 ? `${count} ` : '';
  return `Top ${n}${categoryName} Companies (${SEO_YEAR})`;
}

/**
 * Location-aware title: "Top [N] [Category] Companies in [Location] (2026)".
 * The count is included only when > 0 so the title remains correct on
 * categories with no listings yet.
 */
export function getCategoryTitleWithLocation(categoryName, location, count) {
  const n = Number(count) > 0 ? `${count} ` : '';
  if (location) {
    return `Top ${n}${categoryName} Companies in ${location} (${SEO_YEAR})`;
  }
  return `Top ${n}${categoryName} Companies in ${SEO_YEAR}`;
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
