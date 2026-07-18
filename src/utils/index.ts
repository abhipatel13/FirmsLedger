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
 * Resolve a logo URL for a company. We deliberately skip Google's favicon API
 * — it always returns a generic globe placeholder for unknown domains, which
 * onError can't detect. Default to ui-avatars so every card shows clean
 * brand-colored initials when no real logo is curated.
 *   1. agency.logo_url   (curator-supplied)
 *   2. ui-avatars with the company name
 */
export function getAgencyLogoUrl(agency: {
  logo_url?: string | null;
  name?: string | null;
} | null | undefined): string {
  if (!agency) return '';
  if (agency.logo_url) return agency.logo_url;
  const name = encodeURIComponent(agency.name || '?');
  return `https://ui-avatars.com/api/?name=${name}&background=1A2E4A&color=fff&size=128&bold=true`;
}