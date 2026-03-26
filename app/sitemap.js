const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.firmsledger.com').replace(/\/$/, '');

// ─── Static blog slugs ──────────────────────────────────────────────────────
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

const STAFFING_SLUGS = [
  'executive-search', 'healthcare-staffing', 'it-staffing', 'temporary-staffing',
  'permanent-staffing', 'remote-staffing', 'contract-staffing',
  'hr-recruitment-services', 'technical-staffing', 'industrial-staffing',
];

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

// Slug → display name for building ?country= query params
const COUNTRY_NAMES = {
  'india': 'India', 'united-states': 'United States', 'united-kingdom': 'United Kingdom',
  'australia': 'Australia', 'canada': 'Canada', 'germany': 'Germany', 'france': 'France',
  'uae': 'UAE', 'singapore': 'Singapore', 'south-africa': 'South Africa',
  'netherlands': 'Netherlands', 'brazil': 'Brazil', 'mexico': 'Mexico', 'japan': 'Japan',
  'new-zealand': 'New Zealand', 'italy': 'Italy', 'spain': 'Spain', 'china': 'China',
  'south-korea': 'South Korea', 'malaysia': 'Malaysia', 'indonesia': 'Indonesia',
  'thailand': 'Thailand', 'vietnam': 'Vietnam', 'philippines': 'Philippines',
  'nigeria': 'Nigeria', 'kenya': 'Kenya', 'egypt': 'Egypt', 'saudi-arabia': 'Saudi Arabia',
  'qatar': 'Qatar', 'turkey': 'Turkey', 'poland': 'Poland', 'sweden': 'Sweden',
  'switzerland': 'Switzerland', 'argentina': 'Argentina', 'colombia': 'Colombia',
  'pakistan': 'Pakistan', 'bangladesh': 'Bangladesh', 'israel': 'Israel',
  'norway': 'Norway', 'denmark': 'Denmark',
};

// State slug → display name (for key states)
const STATE_NAMES = {
  'gujarat': 'Gujarat', 'maharashtra': 'Maharashtra', 'karnataka': 'Karnataka',
  'tamil-nadu': 'Tamil Nadu', 'delhi': 'Delhi', 'uttar-pradesh': 'Uttar Pradesh',
  'rajasthan': 'Rajasthan', 'telangana': 'Telangana', 'andhra-pradesh': 'Andhra Pradesh',
  'kerala': 'Kerala', 'west-bengal': 'West Bengal', 'punjab': 'Punjab',
  'california': 'California', 'texas': 'Texas', 'new-york': 'New York',
  'florida': 'Florida', 'illinois': 'Illinois',
  'england': 'England', 'scotland': 'Scotland', 'wales': 'Wales',
  'new-south-wales': 'New South Wales', 'victoria': 'Victoria',
  'queensland': 'Queensland', 'western-australia': 'Western Australia',
  'ontario': 'Ontario', 'british-columbia': 'British Columbia', 'quebec': 'Quebec',
  'bavaria': 'Bavaria', 'north-rhine-westphalia': 'North Rhine-Westphalia',
  'dubai': 'Dubai',
};

// Key states per country for state-level pages
const KEY_STATES = [
  // India
  { country: 'india', state: 'gujarat' },
  { country: 'india', state: 'maharashtra' },
  { country: 'india', state: 'karnataka' },
  { country: 'india', state: 'tamil-nadu' },
  { country: 'india', state: 'delhi' },
  { country: 'india', state: 'uttar-pradesh' },
  { country: 'india', state: 'rajasthan' },
  { country: 'india', state: 'telangana' },
  { country: 'india', state: 'andhra-pradesh' },
  { country: 'india', state: 'kerala' },
  { country: 'india', state: 'west-bengal' },
  { country: 'india', state: 'punjab' },
  // USA
  { country: 'united-states', state: 'california' },
  { country: 'united-states', state: 'texas' },
  { country: 'united-states', state: 'new-york' },
  { country: 'united-states', state: 'florida' },
  { country: 'united-states', state: 'illinois' },
  // UK
  { country: 'united-kingdom', state: 'england' },
  { country: 'united-kingdom', state: 'scotland' },
  { country: 'united-kingdom', state: 'wales' },
  // Australia
  { country: 'australia', state: 'new-south-wales' },
  { country: 'australia', state: 'victoria' },
  { country: 'australia', state: 'queensland' },
  { country: 'australia', state: 'western-australia' },
  // Canada
  { country: 'canada', state: 'ontario' },
  { country: 'canada', state: 'british-columbia' },
  { country: 'canada', state: 'quebec' },
  // Germany
  { country: 'germany', state: 'bavaria' },
  { country: 'germany', state: 'north-rhine-westphalia' },
];

// Key cities for city-level pages
const KEY_CITIES = [
  // India
  { country: 'india', state: 'gujarat',         city: 'ahmedabad' },
  { country: 'india', state: 'gujarat',         city: 'surat' },
  { country: 'india', state: 'gujarat',         city: 'vadodara' },
  { country: 'india', state: 'gujarat',         city: 'rajkot' },
  { country: 'india', state: 'maharashtra',     city: 'mumbai' },
  { country: 'india', state: 'maharashtra',     city: 'pune' },
  { country: 'india', state: 'maharashtra',     city: 'nagpur' },
  { country: 'india', state: 'karnataka',       city: 'bangalore' },
  { country: 'india', state: 'karnataka',       city: 'mysore' },
  { country: 'india', state: 'tamil-nadu',      city: 'chennai' },
  { country: 'india', state: 'tamil-nadu',      city: 'coimbatore' },
  { country: 'india', state: 'telangana',       city: 'hyderabad' },
  { country: 'india', state: 'delhi',           city: 'new-delhi' },
  { country: 'india', state: 'uttar-pradesh',   city: 'lucknow' },
  { country: 'india', state: 'uttar-pradesh',   city: 'noida' },
  { country: 'india', state: 'west-bengal',     city: 'kolkata' },
  { country: 'india', state: 'rajasthan',       city: 'jaipur' },
  { country: 'india', state: 'kerala',          city: 'kochi' },
  // USA
  { country: 'united-states', state: 'california',  city: 'los-angeles' },
  { country: 'united-states', state: 'california',  city: 'san-francisco' },
  { country: 'united-states', state: 'texas',       city: 'houston' },
  { country: 'united-states', state: 'texas',       city: 'dallas' },
  { country: 'united-states', state: 'new-york',    city: 'new-york-city' },
  { country: 'united-states', state: 'florida',     city: 'miami' },
  { country: 'united-states', state: 'illinois',    city: 'chicago' },
  // UK
  { country: 'united-kingdom', state: 'england',    city: 'london' },
  { country: 'united-kingdom', state: 'england',    city: 'manchester' },
  { country: 'united-kingdom', state: 'england',    city: 'birmingham' },
  // Australia
  { country: 'australia', state: 'new-south-wales', city: 'sydney' },
  { country: 'australia', state: 'victoria',        city: 'melbourne' },
  { country: 'australia', state: 'queensland',      city: 'brisbane' },
  // Canada
  { country: 'canada', state: 'ontario',            city: 'toronto' },
  { country: 'canada', state: 'british-columbia',   city: 'vancouver' },
  // UAE
  { country: 'uae', state: 'dubai',                 city: 'dubai' },
];

// ─── Supabase helpers ────────────────────────────────────────────────────────

async function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(url, key, { auth: { persistSession: false } });
}

async function getCategorySlugs() {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) return [];
    const { data } = await supabase.from('categories').select('slug').order('slug');
    return (data || []).map((r) => r.slug).filter(Boolean);
  } catch { return []; }
}

async function getCompanySlugs() {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) return [];
    const { data } = await supabase
      .from('agencies')
      .select('slug, updated_at')
      .eq('approved', true)
      .order('updated_at', { ascending: false });
    return data || [];
  } catch { return []; }
}

async function getDbBlogSlugs() {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) return [];
    const { data } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('published', true)
      .order('created_at', { ascending: false });
    return data || [];
  } catch { return []; }
}

// ─── Sitemap ─────────────────────────────────────────────────────────────────

export default async function sitemap() {
  const now = new Date();

  const [categorySlugs, companies, dbPosts] = await Promise.all([
    getCategorySlugs(),
    getCompanySlugs(),
    getDbBlogSlugs(),
  ]);

  // ── Static pages ────────────────────────────────────────────────────────────
  const staticRoutes = [
    { url: `${BASE_URL}/`,                   lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/directory`,          lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/directory/staffing`, lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/blogs`,              lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/contact`,            lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/ListYourCompany`,    lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/Categories`,         lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
  ];

  // ── Staffing sub-pages ──────────────────────────────────────────────────────
  const staffingRoutes = STAFFING_SLUGS.map((slug) => ({
    url: `${BASE_URL}/directory/staffing/${slug}`,
    lastModified: now, changeFrequency: 'weekly', priority: 0.7,
  }));

  // ── Blog pages ──────────────────────────────────────────────────────────────
  const staticBlogRoutes = BLOG_SLUGS.map((slug) => ({
    url: `${BASE_URL}/blogs/${slug}`,
    lastModified: now, changeFrequency: 'monthly', priority: 0.7,
  }));

  const staticSlugsSet = new Set(BLOG_SLUGS);
  const dbBlogRoutes = dbPosts
    .filter((p) => !staticSlugsSet.has(p.slug))
    .map((p) => ({
      url: `${BASE_URL}/blogs/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : now,
      changeFrequency: 'monthly', priority: 0.7,
    }));

  // ── Company profile pages ───────────────────────────────────────────────────
  const companyRoutes = companies.map((c) => ({
    url: `${BASE_URL}/companies/${c.slug}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : now,
    changeFrequency: 'weekly', priority: 0.8,
  }));

  // ── Category directory pages (all categories) ───────────────────────────────
  const categoryRoutes = categorySlugs.map((slug) => ({
    url: `${BASE_URL}/directory/${slug}`,
    lastModified: now, changeFrequency: 'weekly', priority: 0.8,
  }));

  // ── /directory/[category]?country=[Name] — top 200 categories × all countries ─
  // 200 × 40 = 8,000 URLs
  const TOP_CATS = categorySlugs.slice(0, 200);
  const searchRoutes = [];
  for (const slug of TOP_CATS) {
    for (const countrySlug of TARGET_COUNTRIES) {
      const countryName = COUNTRY_NAMES[countrySlug];
      if (!countryName) continue;
      searchRoutes.push({
        url: `${BASE_URL}/directory/${slug}?country=${encodeURIComponent(countryName)}`,
        lastModified: now, changeFrequency: 'weekly', priority: 0.8,
      });
    }
  }

  // ── /directory/[category]?country=[Name]&state=[Name] — top 100 categories × key states
  const stateRoutes = [];
  for (const slug of categorySlugs.slice(0, 100)) {
    for (const { country, state } of KEY_STATES) {
      const countryName = COUNTRY_NAMES[country];
      const stateName = STATE_NAMES[state];
      if (!countryName || !stateName) continue;
      stateRoutes.push({
        url: `${BASE_URL}/directory/${slug}?country=${encodeURIComponent(countryName)}&state=${encodeURIComponent(stateName)}`,
        lastModified: now, changeFrequency: 'weekly', priority: 0.78,
      });
    }
  }

  // ── /directory/[category]?country=[Name]&state=[Name] — top 50 categories × key cities
  // City is included in state for now (directory doesn't have city-level filtering yet)
  const cityRoutes = [];
  for (const slug of categorySlugs.slice(0, 50)) {
    for (const { country, state } of KEY_CITIES) {
      const countryName = COUNTRY_NAMES[country];
      const stateName = STATE_NAMES[state];
      if (!countryName || !stateName) continue;
      cityRoutes.push({
        url: `${BASE_URL}/directory/${slug}?country=${encodeURIComponent(countryName)}&state=${encodeURIComponent(stateName)}`,
        lastModified: now, changeFrequency: 'weekly', priority: 0.75,
      });
    }
  }

  return [
    ...staticRoutes,
    ...staffingRoutes,
    ...staticBlogRoutes,
    ...dbBlogRoutes,
    ...companyRoutes,
    ...categoryRoutes,
    ...searchRoutes,
    ...stateRoutes,
    ...cityRoutes,
  ];
}
