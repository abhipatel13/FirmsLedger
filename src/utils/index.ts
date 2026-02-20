const DIRECTORY_BASE = '/directory';
const STAFFING_SEGMENT = 'staffing';

export function createPageUrl(pageName: string) {
  if (pageName === 'Home') return '/';
  if (pageName === 'Directory') return DIRECTORY_BASE;
  if (pageName === 'Blogs') return '/blogs';
  return '/' + pageName.replace(/ /g, '-');
}

/** Blog article URL: /blogs/slug */
export function getBlogArticleUrl(slug: string): string {
  return `/blogs/${encodeURIComponent(slug)}`;
}

/**
 * SEO-friendly directory URL.
 * Use underStaffing: true for categories under Staffing (e.g. healthcare-staffing) → /directory/staffing/healthcare-staffing
 */
export function getDirectoryUrl(categorySlug?: string, options?: { underStaffing?: boolean }) {
  if (!categorySlug || !categorySlug.trim()) return DIRECTORY_BASE;
  const slug = categorySlug.trim();
  if (options?.underStaffing) {
    return `${DIRECTORY_BASE}/${STAFFING_SEGMENT}/${slug}`;
  }
  return `${DIRECTORY_BASE}/${slug}`;
}

/** URL for staffing hub: /directory/staffing */
export function getDirectoryStaffingUrl() {
  return `${DIRECTORY_BASE}/${STAFFING_SEGMENT}`;
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

/** Company profile URL: /companies/company-slug. Prefer slug; fallback to legacy ?id= for agencies without slug. */
export function getCompanyProfileUrl(agency: { slug?: string | null; id?: string } | null | undefined): string {
  if (!agency) return '/directory';
  const slug = agency.slug?.trim();
  if (slug) return `/companies/${encodeURIComponent(slug)}`;
  if (agency.id) return `/AgencyProfile?id=${encodeURIComponent(agency.id)}`;
  return '/directory';
}