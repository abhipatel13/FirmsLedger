const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

/** All published blog article slugs — keep in sync with app/Blogs/[slug]/page.jsx */
const BLOG_SLUGS = [
  'best-specialty-chemical-companies-australia-2026',
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

/** Fetch AI-generated blog slugs from Supabase */
async function getDbBlogSlugs() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return [];
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('published', true)
      .order('created_at', { ascending: false });
    return data || [];
  } catch {
    return [];
  }
}

async function getCategorySlugs() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return [];
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data } = await supabase.from('categories').select('slug').order('slug');
    return (data || []).map((row) => row.slug).filter(Boolean);
  } catch {
    return [];
  }
}

const TARGET_COUNTRIES = [
  'india', 'united-states', 'united-kingdom', 'australia', 'canada',
  'germany', 'france', 'uae', 'singapore', 'south-africa',
  'netherlands', 'brazil', 'mexico', 'japan', 'new-zealand',
  'italy', 'spain', 'china', 'south-korea', 'malaysia',
  'indonesia', 'thailand', 'vietnam', 'philippines', 'nigeria',
  'kenya', 'egypt', 'saudi-arabia', 'qatar', 'turkey',
  'poland', 'sweden', 'switzerland', 'argentina', 'colombia',
  'pakistan', 'bangladesh', 'israel', 'norway', 'denmark',
];

// Top cities per country for sitemap (keep sitemap manageable — Google discovers rest via internal links)

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

  const categorySlugs = await getCategorySlugs();
  const categoryRoutes = categorySlugs.map((slug) => ({
    url: `${BASE_URL}/directory/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // AI-generated posts from Supabase (exclude slugs already in static list)
  const dbPosts = await getDbBlogSlugs();
  const staticSlugsSet = new Set(BLOG_SLUGS);
  const dbBlogRoutes = dbPosts
    .filter((p) => !staticSlugsSet.has(p.slug))
    .map((p) => ({
      url: `${BASE_URL}/blogs/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : now,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  // Programmatic SEO: /search/[industry]/[country]
  // Limit to top 100 categories × all countries to stay under 50k URLs
  const TOP_CATEGORIES = categorySlugs.slice(0, 100);
  const searchRoutes = [];
  for (const slug of TOP_CATEGORIES) {
    for (const country of TARGET_COUNTRIES) {
      searchRoutes.push({
        url: `${BASE_URL}/search/${slug}/${country}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  // State pages — top 50 categories × key India states only
  const KEY_STATES = ['gujarat','maharashtra','karnataka','tamil-nadu','delhi','uttar-pradesh','rajasthan','telangana'];
  const stateRoutes = [];
  for (const slug of TOP_CATEGORIES.slice(0, 50)) {
    for (const state of KEY_STATES) {
      stateRoutes.push({
        url: `${BASE_URL}/search/${slug}/india/${state}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.78,
      });
    }
  }

  // City pages — top 30 categories × key cities only
  // Google discovers remaining pages via internal links on state/country pages
  const KEY_CITIES = [
    { country: 'india', state: 'gujarat',       city: 'ahmedabad' },
    { country: 'india', state: 'gujarat',       city: 'surat' },
    { country: 'india', state: 'gujarat',       city: 'vadodara' },
    { country: 'india', state: 'gujarat',       city: 'rajkot' },
    { country: 'india', state: 'maharashtra',   city: 'mumbai' },
    { country: 'india', state: 'maharashtra',   city: 'pune' },
    { country: 'india', state: 'karnataka',     city: 'bangalore' },
    { country: 'india', state: 'tamil-nadu',    city: 'chennai' },
    { country: 'india', state: 'telangana',     city: 'hyderabad' },
    { country: 'india', state: 'delhi',         city: 'new-delhi' },
    { country: 'united-states', state: 'california', city: 'los-angeles' },
    { country: 'united-states', state: 'texas',      city: 'houston' },
    { country: 'united-kingdom', state: 'england',   city: 'london' },
    { country: 'australia', state: 'new-south-wales', city: 'sydney' },
  ];
  const cityRoutes = [];
  for (const slug of TOP_CATEGORIES.slice(0, 30)) {
    for (const { country, state, city } of KEY_CITIES) {
      cityRoutes.push({
        url: `${BASE_URL}/search/${slug}/${country}/${state}/${city}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.75,
      });
    }
  }

  return [...staticRoutes, ...staffingRoutes, ...blogRoutes, ...dbBlogRoutes, ...categoryRoutes, ...searchRoutes, ...stateRoutes, ...cityRoutes];
}
