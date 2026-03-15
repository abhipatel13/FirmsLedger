const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

/** All published blog article slugs — keep in sync with app/Blogs/[slug]/page.jsx */
const BLOG_SLUGS = [
  'best-solar-panels-australia-2026',
  'top-10-stabilizer-brands-india-2026',
  'top-10-switch-socket-brands-india-2026',
  'best-solar-panel-brands-india-2026',
  'top-10-led-light-brands-india-2026',
  'top-10-water-pump-brands-india-2026',
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
];

/** Staffing sub-category slugs */
const STAFFING_SLUGS = [
  'executive-search',
  'healthcare-staffing',
  'it-staffing',
  'temporary-staffing',
  'permanent-staffing',
  'remote-staffing',
  'contract-staffing',
  'hr-recruitment-services',
  'technical-staffing',
  'industrial-staffing',
];

export default async function sitemap() {
  const now = new Date();

  const staticRoutes = [
    { url: `${BASE_URL}/`,                  lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/directory`,         lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/directory/staffing`,lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/blogs`,             lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/contact`,           lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/ListYourCompany`,   lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/Categories`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
  ];

  const staffingRoutes = STAFFING_SLUGS.map((slug) => ({
    url: `${BASE_URL}/directory/staffing/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const blogRoutes = BLOG_SLUGS.map((slug) => ({
    url: `${BASE_URL}/blogs/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...staffingRoutes, ...blogRoutes];
}
