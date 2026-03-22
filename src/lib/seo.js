/**
 * Shared SEO constants and helpers for metadata (titles, descriptions).
 * Titles use format: "Top [Category] in [Year] in [Country] | FirmsLedger"
 */

export const SITE_NAME = 'FirmsLedger';

/**
 * All published blog article slugs.
 * Keep in sync with app/Blogs/[slug]/page.jsx ARTICLES keys
 * and app/sitemap.js BLOG_SLUGS.
 */
export const BLOG_SLUGS = [
  'top-10-stabilizer-brands-india-2025',
  'top-10-switch-socket-brands-india-2025',
  'best-solar-panel-brands-india-2025',
  'top-10-led-light-brands-india-2025',
  'top-10-water-pump-brands-india-2025',
  'top-10-drilling-machine-brands-india-2026',
  'top-10-milling-machine-manufacturers-india-2026',
  'top-10-recruitment-agencies-india-2026',
  'best-contract-staffing-agencies-india-2026',
  'best-permanent-staffing-rpo-firms-india-2026',
  'top-healthcare-staffing-agencies-ahmedabad-2026',
  'top-10-it-staffing-companies-india-2026',
  'top-industrial-staffing-companies-india-2026',
  'top-staffing-agencies-delhi-ncr-2026',
  'top-it-staffing-companies-bangalore-2026',
  'best-solar-panels-australia-2026',
  'top-cnc-manufacturers-nevada-2026',
];
export const SEO_YEAR = 2026;
export const SEO_COUNTRY = process.env.NEXT_PUBLIC_SEO_COUNTRY || 'Global';
export const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://firmsledger.com';

/** Unique meta descriptions for staffing subcategories (slug → description) */
export const STAFFING_CATEGORY_DESCRIPTIONS = {
  'executive-search':
    'Discover the top executive search firms at FirmsLedger. Browse verified providers for C-level and senior leadership hiring. Compare the most reliable executive search agencies worldwide by expertise, project needs, and pricing.',
  'healthcare-staffing':
    'Discover the top healthcare staffing companies at FirmsLedger. Browse verified medical and healthcare staffing agencies with proven expertise. Find the most reliable healthcare staffing providers worldwide by specialty, project needs, and pricing.',
  'it-staffing':
    'Discover the top IT staffing companies at FirmsLedger. Browse verified technology and software staffing providers with proven expertise. Compare the most reliable IT staffing agencies worldwide by expertise, project needs, and pricing.',
  'temporary-staffing':
    'Discover the top temporary staffing agencies at FirmsLedger. Browse verified short-term and contract staffing providers. Find the most reliable temporary staffing solutions worldwide for your project needs and budget.',
  'permanent-staffing':
    'Discover the top permanent staffing and placement firms at FirmsLedger. Browse verified full-time hiring and recruitment providers. Compare the most reliable permanent staffing agencies worldwide by expertise and pricing.',
  'remote-staffing':
    'Discover the top remote staffing companies at FirmsLedger. Browse verified providers for distributed and remote teams. Find the most reliable remote staffing agencies worldwide by expertise, project needs, and pricing.',
  'contract-staffing':
    'Discover the top contract staffing firms at FirmsLedger. Browse verified project-based and contract staffing providers. Compare the most reliable contract staffing agencies worldwide by expertise, project needs, and pricing.',
  'hr-recruitment-services':
    'Discover the top HR and recruitment service providers at FirmsLedger. Browse verified HR outsourcing and recruitment process outsourcing (RPO) agencies. Find the most reliable HR and recruitment partners worldwide.',
  'technical-staffing':
    'Discover the top technical staffing companies at FirmsLedger. Browse verified engineering and technical staffing providers. Compare the most reliable technical staffing agencies worldwide by expertise, project needs, and pricing.',
  'industrial-staffing':
    'Discover the top industrial staffing companies at FirmsLedger. Browse verified manufacturing and industrial staffing providers. Find the most reliable industrial staffing agencies worldwide for your workforce needs.',
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
  return `Discover the top ${categoryName} companies at FirmsLedger. Browse verified service providers with proven expertise. Compare the most reliable providers worldwide by expertise, project needs, and pricing.`;
}

/** Title for a category listing page: "Top [Category Name] in 2026 in Global" */
export function getCategoryTitle(categoryName) {
  return `Top ${categoryName} in ${SEO_YEAR} in ${SEO_COUNTRY}`;
}
