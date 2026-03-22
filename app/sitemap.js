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
const TOP_CITIES_BY_COUNTRY = {
  'india': ['mumbai','delhi','bangalore','hyderabad','chennai','pune','kolkata','ahmedabad','surat','jaipur'],
  'united-states': ['new-york','los-angeles','chicago','houston','phoenix','san-francisco','seattle','miami','dallas','boston'],
  'united-kingdom': ['london','birmingham','manchester','leeds','glasgow','bristol','edinburgh','liverpool'],
  'australia': ['sydney','melbourne','brisbane','perth','adelaide','gold-coast','canberra'],
  'canada': ['toronto','montreal','vancouver','calgary','edmonton','ottawa','winnipeg'],
  'germany': ['berlin','hamburg','munich','cologne','frankfurt','stuttgart','dusseldorf'],
  'france': ['paris','marseille','lyon','toulouse','nice','nantes','bordeaux'],
  'uae': ['dubai','abu-dhabi','sharjah'],
  'singapore': ['singapore'],
  'south-africa': ['johannesburg','cape-town','durban','pretoria'],
  'netherlands': ['amsterdam','rotterdam','the-hague','utrecht','eindhoven'],
  'brazil': ['sao-paulo','rio-de-janeiro','brasilia','salvador','belo-horizonte'],
  'mexico': ['mexico-city','guadalajara','monterrey','puebla','tijuana'],
  'japan': ['tokyo','yokohama','osaka','nagoya','fukuoka','kyoto'],
  'new-zealand': ['auckland','wellington','christchurch'],
  'italy': ['rome','milan','naples','turin','florence'],
  'spain': ['madrid','barcelona','valencia','seville','bilbao'],
  'china': ['shanghai','beijing','guangzhou','shenzhen','chengdu'],
  'south-korea': ['seoul','busan','incheon','daegu'],
  'malaysia': ['kuala-lumpur','george-town','johor-bahru'],
  'indonesia': ['jakarta','surabaya','bandung'],
  'thailand': ['bangkok','chiang-mai','pattaya'],
  'saudi-arabia': ['riyadh','jeddah','mecca'],
  'turkey': ['istanbul','ankara','izmir'],
  'poland': ['warsaw','krakow','wroclaw'],
};

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
  const searchRoutes = [];
  for (const slug of categorySlugs) {
    for (const country of TARGET_COUNTRIES) {
      searchRoutes.push({
        url: `${BASE_URL}/search/${slug}/${country}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  // Programmatic SEO: /search/[industry]/[country]/[state] and /[state]/[city] — India focus
  const STATE_SITEMAP = {
    india: {
      gujarat: ['ahmedabad','surat','vadodara','rajkot','bhavnagar','jamnagar','junagadh','gandhinagar','anand','nadiad','morbi','surendranagar','mehsana','bharuch','navsari','valsad','porbandar','amreli','botad','dahod','patan','palanpur','godhra','ankleshwar','veraval','dwarka','bhuj','gandhinagar','gandhidham'],
      maharashtra: ['mumbai','pune','nagpur','nashik','aurangabad','solapur','thane','navi-mumbai','pimpri-chinchwad','kolhapur'],
      karnataka: ['bangalore','mysuru','mangalore','hubli','belgaum','davanagere','bellary'],
      'tamil-nadu': ['chennai','coimbatore','madurai','tiruchirappalli','salem','tiruppur','vellore'],
      'andhra-pradesh': ['visakhapatnam','vijayawada','guntur','nellore','tirupati'],
      telangana: ['hyderabad','warangal','karimnagar','khammam'],
      rajasthan: ['jaipur','jodhpur','kota','udaipur','ajmer','bikaner'],
      'madhya-pradesh': ['bhopal','indore','jabalpur','gwalior','ujjain'],
      'uttar-pradesh': ['lucknow','kanpur','agra','varanasi','prayagraj','ghaziabad','noida','meerut'],
      delhi: ['new-delhi','central-delhi','north-delhi','south-delhi','east-delhi','west-delhi','dwarka','rohini'],
      punjab: ['ludhiana','amritsar','jalandhar','patiala','chandigarh'],
      haryana: ['faridabad','gurgaon','panipat','rohtak','hisar'],
      kerala: ['kochi','thiruvananthapuram','kozhikode','thrissur','kollam'],
      'west-bengal': ['kolkata','howrah','durgapur','asansol','siliguri'],
    },
    'united-states': {
      california: ['los-angeles','san-francisco','san-diego','san-jose','sacramento','fresno'],
      texas: ['houston','dallas','san-antonio','austin','fort-worth','el-paso'],
      'new-york': ['new-york-city','buffalo','rochester','albany','syracuse'],
      florida: ['miami','orlando','tampa','jacksonville','fort-lauderdale'],
      illinois: ['chicago','aurora','naperville','rockford','joliet'],
    },
    'united-kingdom': {
      england: ['london','birmingham','manchester','leeds','liverpool','bristol','sheffield'],
      scotland: ['glasgow','edinburgh','aberdeen','dundee'],
      wales: ['cardiff','swansea','newport'],
    },
    australia: {
      'new-south-wales': ['sydney','newcastle','wollongong','parramatta'],
      victoria: ['melbourne','geelong','ballarat','bendigo'],
      queensland: ['brisbane','gold-coast','cairns','townsville'],
      'western-australia': ['perth','bunbury','mandurah'],
    },
  };

  const stateRoutes = [];
  for (const slug of categorySlugs.slice(0, 100)) {
    for (const [countrySlug, stateMap] of Object.entries(STATE_SITEMAP)) {
      for (const [stateSlug, cities] of Object.entries(stateMap)) {
        stateRoutes.push({
          url: `${BASE_URL}/search/${slug}/${countrySlug}/${stateSlug}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.78,
        });
        for (const city of cities) {
          stateRoutes.push({
            url: `${BASE_URL}/search/${slug}/${countrySlug}/${stateSlug}/${city}`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.76,
          });
        }
      }
    }
  }

  // Programmatic SEO: /search/[industry]/[country]/[city] — top cities only for sitemap
  // Google will crawl remaining city pages via internal links on country pages
  const cityRoutes = [];
  for (const slug of categorySlugs.slice(0, 200)) { // top 200 categories in sitemap
    for (const [country, cities] of Object.entries(TOP_CITIES_BY_COUNTRY)) {
      for (const city of cities) {
        cityRoutes.push({
          url: `${BASE_URL}/search/${slug}/${country}/${city}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.75,
        });
      }
    }
  }

  return [...staticRoutes, ...staffingRoutes, ...blogRoutes, ...dbBlogRoutes, ...categoryRoutes, ...searchRoutes, ...stateRoutes, ...cityRoutes];
}
