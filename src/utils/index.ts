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

/** Get the company description, falling back to a nice dynamic description if none exists */
export function getCompanyDescription(company: {
  description?: string | null;
  name?: string | null;
  hq_city?: string | null;
  hq_state_label?: string | null;
  hq_state?: string | null;
} | null | undefined): string {
  if (!company) return '';
  if (company.description && company.description.trim()) return company.description.trim();
  const name = company.name || 'This company';
  const state = company.hq_state_label || company.hq_state;
  const locationParts = [company.hq_city, state].filter(Boolean);
  const locationStr = locationParts.length > 0 ? ` based in ${locationParts.join(', ')}` : '';
  return `${name} is a verified manufacturer${locationStr}. Connect to learn more about their capabilities, services, and operations.`;
}