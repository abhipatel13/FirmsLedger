export function createPageUrl(pageName: string) {
  if (pageName === 'Home') return '/';
  if (pageName === 'Directory') return '/browse';
  if (pageName === 'Contact') return '/contact';
  return '/' + pageName.replace(/ /g, '-');
}

/**
 * Category URL: /{categorySlug} — e.g. /electrical-components
 */
export function getDirectoryUrl(categorySlug?: string, options?: { underStaffing?: boolean }) {
  if (!categorySlug || !categorySlug.trim()) return '/browse';
  return `/${categorySlug.trim()}`;
}

/**
 * URL for any category row, parent or subcategory, with an optional state.
 *
 * There is no standalone /{subcategorySlug} route — a subcategory only
 * resolves under its parent: /{parentSlug}/{subcategorySlug} (nationwide) or
 * /{parentSlug}/{subcategorySlug}/{stateSlug} (state-scoped — subcategory
 * segment comes BEFORE state; see app/[category]/[state]/[subcategory]/page.jsx,
 * which swaps the [state] and [subcategory] param names on purpose). `cat`
 * must carry `is_parent` and, for subcategories, `parentSlug` (the parent
 * category's slug — resolve it from the full categories list before calling
 * this, since a company's own linked-category rows don't include it).
 */
export function getCategoryHref(
  cat?: { slug?: string | null; is_parent?: boolean | null; parentSlug?: string | null } | null,
  stateSlug?: string | null
) {
  if (!cat?.slug) return '/browse';
  const topSlug = cat.is_parent ? cat.slug : cat.parentSlug;
  if (!topSlug) return '/browse'; // orphaned subcategory — parent not found
  const parts = [topSlug, cat.is_parent ? null : cat.slug, stateSlug].filter(Boolean);
  return `/${parts.join('/')}`;
}

/** Staffing hub — no equivalent in new structure, fall back to browse */
export function getDirectoryStaffingUrl() {
  return '/browse';
}

/** Build directory URL with optional query (location, search, etc.) */
export function getDirectoryUrlWithParams(categorySlug?: string, params?: { location?: string; search?: string; rating?: string; teamSize?: string }) {
  const base = getDirectoryUrl(categorySlug);
  if (!params) return base;
  const search = new URLSearchParams();
  if (params.location) search.set('location', params.location);
  if (params.search) search.set('search', params.search);
  if (params.rating) search.set('rating', params.rating);
  if (params.teamSize) search.set('teamSize', params.teamSize);
  const q = search.toString();
  return q ? `${base}?${q}` : base;
}

/** Company profile URL: /company/company-slug. Prefer slug; fallback to legacy ?id= for agencies without slug. */
export function getCompanyProfileUrl(agency: { slug?: string | null; id?: string } | null | undefined): string {
  if (!agency) return '/browse';
  const slug = agency.slug?.trim();
  if (slug) return `/company/${encodeURIComponent(slug)}`;
  if (agency.id) return `/company?id=${encodeURIComponent(agency.id)}`;
  return '/browse';
}

/**
 * Build a local initials-avatar data URI — no network request, so it can never
 * 400 through the Next.js image optimizer (unlike the ui-avatars.com service
 * this replaced, whose host isn't in next.config.mjs remotePatterns).
 */
function initialsAvatarDataUri(name: string): string {
  const initials = (name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('') || '?';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="#1A2E4A"/><text x="50%" y="50%" dy=".1em" fill="#fff" font-family="Arial, sans-serif" font-size="52" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Resolve a logo URL for a company. We deliberately skip Google's favicon API
 * — it always returns a generic globe placeholder for unknown domains, which
 * onError can't detect.
 *   1. agency.logo_url   (curator-supplied)
 *   2. local initials avatar
 */
export function getAgencyLogoUrl(agency: {
  logo_url?: string | null;
  name?: string | null;
} | null | undefined): string {
  if (!agency) return '';
  if (agency.logo_url) return agency.logo_url;
  return initialsAvatarDataUri(agency.name || '?');
}

/** Validate description content, filtering out scraper blocks, JavaScript requirements, or tag lists. */
export function isProperDescription(desc: string | null | undefined): boolean {
  if (!desc) return false;
  const normalized = desc.toLowerCase().trim();
  if (
    normalized.includes('incident id') ||
    normalized.includes('access denied') ||
    normalized.includes('enable javascript') ||
    normalized.includes('requires javascript') ||
    normalized.includes('checking your browser') ||
    normalized.includes('request unsuccessful') ||
    normalized.includes('incapsula') ||
    normalized.includes('cloudflare') ||
    normalized.includes('please enable js') ||
    normalized.includes('security check') ||
    normalized.includes('error 403') ||
    normalized.includes('forbidden') ||
    normalized.includes('captcha')
  ) {
    return false;
  }
  
  // If it has multiple pipe characters (e.g. >= 2), it's probably just a tag list and not a proper sentence
  const pipeCount = (desc.match(/\|/g) || []).length;
  if (pipeCount >= 2) {
    return false;
  }

  // If it's too short (e.g. less than 15 characters), it might not be a real description
  if (desc.trim().length < 15) {
    return false;
  }

  return true;
}

/** Get the company description, falling back to a nice dynamic description if none exists */
export function getCompanyDescription(company: {
  description?: string | null;
  name?: string | null;
  hq_city?: string | null;
  hq_state_label?: string | null;
  hq_state?: string | null;
  employee_count?: string | null;
  founded_year?: number | null;
  certifications?: string[] | null;
  is_verified?: boolean | null;
} | null | undefined, categoryName?: string | null, allCategoryNames?: string[] | null): string {
  if (!company) return '';
  const name = company.name || 'This company';
  const state = company.hq_state_label || company.hq_state;
  const locationParts = [company.hq_city, state].filter(Boolean);
  const locationStr = locationParts.length > 0 ? ` based in ${locationParts.join(', ')}` : '';
  const category = categoryName ? categoryName.toLowerCase() : 'manufacturing and business services';

  const realDesc = company.description && company.description.trim() && isProperDescription(company.description)
    ? company.description.trim()
    : null;

  // A real but thin description (most scraped ones are < 30 words) gets padded with
  // context sentences instead of being thrown away — keeps the genuine copy, fixes word count.
  if (realDesc && realDesc.split(/\s+/).filter(Boolean).length >= 40) {
    return realDesc;
  }

  const sentences = realDesc
    ? [realDesc]
    : [`${name} is a${company.is_verified ? ' verified' : ''} provider of ${category}${locationStr}, listed on FirmsLedger.`];

  const facts = [];
  if (company.founded_year) facts.push(`founded in ${company.founded_year}`);
  if (company.employee_count) facts.push(`with ${company.employee_count} employees`);
  if (facts.length > 0) {
    sentences.push(`The company is ${facts.join(' and ')}.`);
  }

  if (company.certifications && company.certifications.length > 0) {
    sentences.push(`They hold the following certifications: ${company.certifications.join(', ')}.`);
  }

  if (locationParts.length > 0) {
    sentences.push(`Businesses researching ${category} providers${locationStr} can review ${name}'s listing for contact details, service focus, and verified reviews before requesting a quote.`);
  }

  if (allCategoryNames && allCategoryNames.length > 1) {
    sentences.push(`${name} is listed under ${allCategoryNames.join(', ')} on FirmsLedger${locationStr ? `, serving clients${locationStr}` : ''}.`);
  }

  sentences.push('Connect with them through FirmsLedger to learn more about their capabilities, services, and operations.');

  return sentences.join(' ');
}