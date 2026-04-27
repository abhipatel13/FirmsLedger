/**
 * One-off bulk import for 14 country/category directories requested 2026-04-26.
 * Idempotent: re-runs safely (uses upserts on slug + skip-existing on links).
 *
 *   node scripts/import-2026-04-26-batch.cjs            # dry-run
 *   node scripts/import-2026-04-26-batch.cjs --commit   # write to DB
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const COMMIT = process.argv.includes('--commit');
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── New categories to create ─────────────────────────────────────────────────

const NEW_CATEGORIES = [
  { name: 'Slot Machines',           slug: 'slot-machines',           parent: 'events-entertainment' },
  { name: 'Beer Distribution',       slug: 'beer-distribution',       parent: 'food-beverage' },
  { name: 'Mystery Shopping',        slug: 'mystery-shopping',        parent: 'media-marketing' },
  { name: 'Beverage Manufacturers',  slug: 'beverage-manufacturers',  parent: 'food-beverage' },
  { name: 'Appraisal Management',    slug: 'appraisal-management',    parent: 'real-estate-services' },
  { name: 'ATM Companies',           slug: 'atm-companies',           parent: 'financial-services' },
  { name: 'Alternative Investments', slug: 'alternative-investments', parent: 'financial-services' },
];

// ─── Companies per directory ──────────────────────────────────────────────────

function describe(name, categoryName, country, city) {
  const where = city ? `${city}, ${country}` : country;
  return `${name} is a leading ${categoryName} company based in ${where}. They serve clients across the region with proven expertise in ${categoryName.toLowerCase()}.`;
}

// Each entry: { name, website, country, state, city, founded?, logo? }
const DIRECTORIES = [
  {
    categorySlug: 'slot-machines',
    categoryName: 'Slot Machine Manufacturer',
    companies: [
      { name: 'International Game Technology (IGT)', website: 'https://www.igt.com',           country: 'United States', state: 'Nevada',     city: 'Las Vegas',     founded: 1975 },
      { name: 'Light & Wonder',                       website: 'https://www.lnw.com',           country: 'United States', state: 'Nevada',     city: 'Las Vegas',     founded: 1973 },
      { name: 'Aristocrat Technologies',              website: 'https://www.aristocrat.com',    country: 'United States', state: 'Nevada',     city: 'Las Vegas',     founded: 1953 },
      { name: 'Konami Gaming',                        website: 'https://www.konamigaming.com',  country: 'United States', state: 'Nevada',     city: 'Las Vegas',     founded: 1973 },
      { name: 'Everi Holdings',                       website: 'https://www.everi.com',         country: 'United States', state: 'Nevada',     city: 'Las Vegas',     founded: 1998 },
      { name: 'AGS (PlayAGS)',                        website: 'https://www.playags.com',       country: 'United States', state: 'Nevada',     city: 'Las Vegas',     founded: 2005 },
      { name: 'Ainsworth Game Technology',            website: 'https://www.ainsworth.com.au',  country: 'United States', state: 'Nevada',     city: 'Las Vegas',     founded: 1995 },
      { name: 'Incredible Technologies',              website: 'https://www.itsgames.com',      country: 'United States', state: 'Illinois',   city: 'Vernon Hills',  founded: 1985 },
      { name: 'Galaxy Gaming',                        website: 'https://www.galaxygaming.com',  country: 'United States', state: 'Nevada',     city: 'Las Vegas',     founded: 1997 },
      { name: 'Acres Manufacturing Company',          website: 'https://acresmfg.com',          country: 'United States', state: 'Nevada',     city: 'Las Vegas',     founded: 2012 },
    ],
  },
  {
    categorySlug: 'beer-distribution',
    categoryName: 'Beer Distribution',
    companies: [
      { name: 'Reyes Beverage Group',         website: 'https://www.reyesbeveragegroup.com',  country: 'United States', state: 'Illinois',     city: 'Rosemont',     founded: 1976 },
      { name: 'Manhattan Beer Distributors',  website: 'https://www.manhattanbeer.com',       country: 'United States', state: 'New York',     city: 'Bronx',        founded: 1978 },
      { name: 'Andrews Distributing',         website: 'https://www.andrewsdistributing.com', country: 'United States', state: 'Texas',        city: 'Dallas',       founded: 1981 },
      { name: 'Silver Eagle Beverages',       website: 'https://www.silvereaglehouston.com',  country: 'United States', state: 'Texas',        city: 'Houston',      founded: 1979 },
      { name: 'Ben E. Keith Beverages',       website: 'https://www.benekeith.com',           country: 'United States', state: 'Texas',        city: 'Fort Worth',   founded: 1906 },
      { name: 'Columbia Distributing',        website: 'https://www.coldist.com',             country: 'United States', state: 'Oregon',       city: 'Portland',     founded: 1935 },
      { name: 'Sheehan Family Companies',     website: 'https://www.sheehanfamilycompanies.com', country: 'United States', state: 'Massachusetts', city: 'Boston',    founded: 1960 },
      { name: 'Hensley Beverage Company',     website: 'https://www.hensley.com',             country: 'United States', state: 'Arizona',      city: 'Phoenix',      founded: 1955 },
      { name: 'Glazer\'s Beer & Beverage',    website: 'https://www.glazersbeer.com',         country: 'United States', state: 'Texas',        city: 'Dallas',       founded: 1909 },
      { name: 'L. Knife & Son',               website: 'https://www.lknife.com',              country: 'United States', state: 'Massachusetts', city: 'Kingston',    founded: 1894 },
    ],
  },
  {
    categorySlug: 'cables-wires',
    categoryName: 'Wire & Cable',
    companies: [
      { name: 'Southwire Company',                website: 'https://www.southwire.com',     country: 'United States', state: 'Georgia',  city: 'Carrollton',       founded: 1950 },
      { name: 'Encore Wire',                      website: 'https://www.encorewire.com',    country: 'United States', state: 'Texas',    city: 'McKinney',         founded: 1989 },
      { name: 'Belden Inc.',                      website: 'https://www.belden.com',        country: 'United States', state: 'Missouri', city: 'St. Louis',        founded: 1902 },
      { name: 'Cerro Wire',                       website: 'https://www.cerrowire.com',     country: 'United States', state: 'Alabama',  city: 'Hartselle',        founded: 1920 },
      { name: 'Houston Wire & Cable Company',     website: 'https://www.houwire.com',       country: 'United States', state: 'Texas',    city: 'Houston',          founded: 1975 },
      { name: 'CommScope',                        website: 'https://www.commscope.com',     country: 'United States', state: 'North Carolina', city: 'Hickory',    founded: 1976 },
      { name: 'General Cable (Prysmian Group)',   website: 'https://www.prysmian.com',      country: 'United States', state: 'Kentucky', city: 'Highland Heights', founded: 1844 },
    ],
  },
  {
    categorySlug: 'aftermarket-parts',
    categoryName: 'Aftermarket Automotive Parts',
    companies: [
      { name: 'BorgWarner',               website: 'https://www.borgwarner.com',     country: 'United States', state: 'Michigan',     city: 'Auburn Hills',   founded: 1928 },
      { name: 'Tenneco Inc.',             website: 'https://www.tenneco.com',        country: 'United States', state: 'Illinois',     city: 'Lake Forest',    founded: 1940 },
      { name: 'Standard Motor Products',  website: 'https://www.smpcorp.com',        country: 'United States', state: 'New York',     city: 'Long Island City', founded: 1919 },
      { name: 'Dorman Products',          website: 'https://www.dormanproducts.com', country: 'United States', state: 'Pennsylvania', city: 'Colmar',         founded: 1918 },
      { name: 'Roush Performance',        website: 'https://www.roushperformance.com', country: 'United States', state: 'Michigan',   city: 'Livonia',        founded: 1995 },
      { name: 'Holley Performance Products', website: 'https://www.holley.com',      country: 'United States', state: 'Kentucky',     city: 'Bowling Green',  founded: 1903 },
      { name: 'Edelbrock LLC',            website: 'https://www.edelbrock.com',      country: 'United States', state: 'Mississippi',  city: 'Olive Branch',   founded: 1938 },
      { name: 'ACDelco',                  website: 'https://www.acdelco.com',        country: 'United States', state: 'Michigan',     city: 'Detroit',        founded: 1916 },
      { name: 'Bilstein of America',      website: 'https://www.bilstein.com',       country: 'United States', state: 'Ohio',         city: 'Hamilton',       founded: 1873 },
      { name: 'K&N Engineering',          website: 'https://www.knfilters.com',      country: 'United States', state: 'California',   city: 'Riverside',      founded: 1969 },
    ],
  },
  {
    categorySlug: 'mystery-shopping',
    categoryName: 'Mystery Shopping',
    companies: [
      { name: 'BARE International',         website: 'https://www.bareinternational.com', country: 'United States', state: 'Virginia',  city: 'Fairfax',     founded: 1987 },
      { name: 'IntelliShop',                website: 'https://www.intelli-shop.com',     country: 'United States', state: 'Ohio',      city: 'Perrysburg',  founded: 1999 },
      { name: 'Market Force Information',   website: 'https://www.marketforce.com',      country: 'United States', state: 'Colorado',  city: 'Louisville',  founded: 2005 },
      { name: 'A Closer Look',              website: 'https://www.acloserlookonline.com', country: 'United States', state: 'Georgia',  city: 'Atlanta',     founded: 1994 },
      { name: 'Reality Based Group',        website: 'https://www.realitybasedgroup.com', country: 'United States', state: 'Nevada',   city: 'Las Vegas',   founded: 2008 },
      { name: 'Confero',                    website: 'https://www.conferoinc.com',       country: 'United States', state: 'North Carolina', city: 'Cary',   founded: 1986 },
    ],
  },
  {
    categorySlug: 'butter',
    categoryName: 'Butter',
    companies: [
      { name: 'Mantequerías Arias',         website: 'https://www.mantequeriasarias.com', country: 'Spain', state: 'Community of Madrid', city: 'Madrid',        founded: 1848 },
      { name: 'Kaiku Corporación Alimentaria', website: 'https://www.kaiku.es',           country: 'Spain', state: 'Basque Country',     city: 'San Sebastián', founded: 1965 },
      { name: 'CAPSA Food (Central Lechera Asturiana)', website: 'https://www.capsafood.com', country: 'Spain', state: 'Asturias',        city: 'Granda',        founded: 1967 },
      { name: 'Reny Picot',                 website: 'https://www.renypicot.com',         country: 'Spain', state: 'Asturias',           city: 'Anleo',         founded: 1959 },
      { name: 'Calidad Pascual',            website: 'https://www.calidadpascual.com',    country: 'Spain', state: 'Castile and León',   city: 'Aranda de Duero', founded: 1969 },
      { name: 'Lactalis Iberia',            website: 'https://www.lactalis.es',           country: 'Spain', state: 'Community of Madrid', city: 'Madrid',       founded: 1990 },
      { name: 'Mantequerías de Soria',      website: 'https://www.mantequeriasdesoria.com', country: 'Spain', state: 'Castile and León', city: 'Soria',        founded: 1910 },
      { name: 'Lácteos Cobreros',           website: 'https://www.cobreros.es',           country: 'Spain', state: 'Castile and León',   city: 'Tábara',        founded: 1980 },
      { name: 'Iparlat',                    website: 'https://www.iparlat.com',           country: 'Spain', state: 'Basque Country',     city: 'Urnieta',       founded: 1991 },
      { name: 'Lácteas García Baquero',     website: 'https://www.garciabaquero.com',     country: 'Spain', state: 'Castilla-La Mancha', city: 'Alcázar de San Juan', founded: 1962 },
    ],
  },
  {
    categorySlug: 'networking',
    categoryName: 'Computer Networking',
    companies: [
      { name: 'Huawei Technologies',         website: 'https://www.huawei.com',     country: 'China', state: 'Guangdong', city: 'Shenzhen', founded: 1987 },
      { name: 'ZTE Corporation',             website: 'https://www.zte.com.cn',     country: 'China', state: 'Guangdong', city: 'Shenzhen', founded: 1985 },
      { name: 'New H3C Technologies',        website: 'https://www.h3c.com',        country: 'China', state: 'Zhejiang',  city: 'Hangzhou', founded: 2003 },
      { name: 'TP-Link Technologies',        website: 'https://www.tp-link.com',    country: 'China', state: 'Guangdong', city: 'Shenzhen', founded: 1996 },
      { name: 'Tenda Technology',            website: 'https://www.tendacn.com',    country: 'China', state: 'Guangdong', city: 'Shenzhen', founded: 1999 },
      { name: 'Ruijie Networks',             website: 'https://www.ruijienetworks.com', country: 'China', state: 'Fujian', city: 'Fuzhou',   founded: 2000 },
      { name: 'Inspur Group',                website: 'https://www.inspur.com',     country: 'China', state: 'Shandong',  city: 'Jinan',    founded: 1945 },
      { name: 'Lenovo Networking',           website: 'https://www.lenovo.com',     country: 'China', state: 'Beijing',   city: 'Beijing',  founded: 1984 },
      { name: 'BDCOM',                       website: 'https://www.bdcom.com',      country: 'China', state: 'Shanghai',  city: 'Shanghai', founded: 1996 },
      { name: 'Maipu Communication Technology', website: 'https://www.maipu.com',   country: 'China', state: 'Sichuan',   city: 'Chengdu',  founded: 1993 },
    ],
  },
  {
    categorySlug: 'beverage-manufacturers',
    categoryName: 'Beverage Manufacturer',
    companies: [
      { name: 'Lassonde Industries',        website: 'https://lassonde.com',         country: 'Canada', state: 'Quebec',  city: 'Rougemont',   founded: 1918 },
      { name: 'Cott Corporation (Primo Brands)', website: 'https://www.primowater.com', country: 'Canada', state: 'Ontario', city: 'Mississauga', founded: 1955 },
      { name: 'Coca-Cola Canada Bottling',  website: 'https://www.cokecanada.com',   country: 'Canada', state: 'Ontario', city: 'Toronto',     founded: 2018 },
      { name: 'PepsiCo Beverages Canada',   website: 'https://www.pepsico.ca',       country: 'Canada', state: 'Ontario', city: 'Mississauga', founded: 1934 },
      { name: 'Labatt Brewing Company',     website: 'https://www.labatt.com',       country: 'Canada', state: 'Ontario', city: 'Toronto',     founded: 1847 },
    ],
  },
  {
    categorySlug: 'appraisal-management',
    categoryName: 'Appraisal Management',
    companies: [
      { name: 'CoreLogic Valuation Solutions', website: 'https://www.corelogic.com',    country: 'United States', state: 'California',   city: 'Irvine',     founded: 1991 },
      { name: 'ServiceLink',                website: 'https://www.svclnk.com',           country: 'United States', state: 'Pennsylvania', city: 'Coraopolis', founded: 1976 },
      { name: 'Solidifi',                   website: 'https://www.solidifi.com',         country: 'United States', state: 'New York',     city: 'Buffalo',    founded: 2007 },
      { name: 'Class Valuation',            website: 'https://www.classvaluation.com',   country: 'United States', state: 'Michigan',     city: 'Troy',       founded: 2009 },
      { name: 'Clear Capital',              website: 'https://www.clearcapital.com',     country: 'United States', state: 'Nevada',       city: 'Reno',       founded: 2001 },
    ],
  },
  {
    categorySlug: 'roofing',
    categoryName: 'Roofing',
    fetchLogos: true,
    companies: [
      { name: 'Tecta America',              website: 'https://www.tectaamerica.com',    country: 'United States', state: 'Illinois',       city: 'Rosemont',     founded: 2000 },
      { name: 'CentiMark Corporation',      website: 'https://www.centimark.com',       country: 'United States', state: 'Pennsylvania',   city: 'Canonsburg',   founded: 1968 },
      { name: 'Baker Roofing Company',      website: 'https://www.bakerroofing.com',    country: 'United States', state: 'North Carolina', city: 'Raleigh',      founded: 1915 },
      { name: 'Kalkreuth Roofing & Sheet Metal', website: 'https://www.kalkreuth.com', country: 'United States', state: 'West Virginia',  city: 'Wheeling',     founded: 1947 },
      { name: 'Nations Roof',               website: 'https://www.nationsroof.com',     country: 'United States', state: 'New Jersey',     city: 'Holmdel',      founded: 2002 },
      { name: 'Latite Roofing & Sheet Metal', website: 'https://www.latite.com',        country: 'United States', state: 'Florida',        city: 'Pompano Beach', founded: 1945 },
      { name: 'Beldon Roofing Company',     website: 'https://www.beldon.com',          country: 'United States', state: 'Texas',          city: 'San Antonio',  founded: 1946 },
      { name: 'Best Roofing',               website: 'https://www.bestroofing.net',     country: 'United States', state: 'Florida',        city: 'Davie',        founded: 1979 },
    ],
  },
  {
    categorySlug: 'it-consulting',
    categoryName: 'IT Consulting',
    companies: [
      { name: 'T-Systems International',     website: 'https://www.t-systems.com',     country: 'Germany', state: 'Hesse',              city: 'Frankfurt',     founded: 2000 },
      { name: 'Bechtle AG',                  website: 'https://www.bechtle.com',       country: 'Germany', state: 'Baden-Württemberg',  city: 'Neckarsulm',    founded: 1983 },
      { name: 'Cancom SE',                   website: 'https://www.cancom.com',        country: 'Germany', state: 'Bavaria',            city: 'Munich',        founded: 1992 },
      { name: 'Computacenter Germany',       website: 'https://www.computacenter.com', country: 'Germany', state: 'North Rhine-Westphalia', city: 'Kerpen',     founded: 1981 },
      { name: 'Capgemini Deutschland',       website: 'https://www.capgemini.com',     country: 'Germany', state: 'Berlin',             city: 'Berlin',        founded: 1967 },
      { name: 'Atos Information Technology Germany', website: 'https://atos.net',     country: 'Germany', state: 'Bavaria',            city: 'Munich',        founded: 1997 },
      { name: 'Materna Information & Communications', website: 'https://www.materna.com', country: 'Germany', state: 'North Rhine-Westphalia', city: 'Dortmund', founded: 1980 },
      { name: 'Adesso SE',                   website: 'https://www.adesso.de',         country: 'Germany', state: 'North Rhine-Westphalia', city: 'Dortmund',  founded: 1997 },
      { name: 'msg systems',                 website: 'https://www.msg.group',         country: 'Germany', state: 'Bavaria',            city: 'Ismaning',      founded: 1980 },
      { name: 'All for One Group',           website: 'https://www.all-for-one.com',   country: 'Germany', state: 'Baden-Württemberg',  city: 'Filderstadt',   founded: 2005 },
    ],
  },
  {
    categorySlug: 'promotions-management',
    categoryName: 'Promotion',
    companies: [
      { name: 'Wizcraft International Entertainment', website: 'https://www.wizcraftworld.com', country: 'India', state: 'Maharashtra', city: 'Mumbai',    founded: 1988 },
      { name: '70 EMG (Seventy Event Media Group)',  website: 'https://www.70emg.com',         country: 'India', state: 'Maharashtra', city: 'Mumbai',    founded: 2007 },
      { name: 'Encompass Events',           website: 'https://www.encompassevents.in',          country: 'India', state: 'Maharashtra', city: 'Mumbai',    founded: 2003 },
      { name: 'DDB Mudra Group',            website: 'https://www.ddbmudragroup.com',           country: 'India', state: 'Maharashtra', city: 'Mumbai',    founded: 1980 },
      { name: 'Ogilvy India',               website: 'https://www.ogilvy.com',                  country: 'India', state: 'Maharashtra', city: 'Mumbai',    founded: 1928 },
      { name: 'Dentsu Webchutney',          website: 'https://www.webchutney.com',              country: 'India', state: 'Karnataka',   city: 'Bengaluru', founded: 1999 },
      { name: 'ITW Consulting',             website: 'https://www.itwconsulting.in',            country: 'India', state: 'Maharashtra', city: 'Mumbai',    founded: 2003 },
      { name: 'Touchwood Entertainment',    website: 'https://www.touchwoodonline.com',         country: 'India', state: 'Maharashtra', city: 'Mumbai',    founded: 1995 },
      { name: 'Cineyug Entertainment',      website: 'https://www.cineyug.com',                 country: 'India', state: 'Maharashtra', city: 'Mumbai',    founded: 1976 },
      { name: 'E-Factor Entertainment',     website: 'https://www.e-factor.tv',                 country: 'India', state: 'Delhi',       city: 'New Delhi', founded: 2002 },
    ],
  },
  {
    categorySlug: 'atm-companies',
    categoryName: 'ATM',
    companies: [
      { name: 'AGS Transact Technologies',  website: 'https://www.agsindia.com',        country: 'India', state: 'Maharashtra', city: 'Mumbai',    founded: 2002 },
      { name: 'CMS Info Systems',           website: 'https://www.cms.com',             country: 'India', state: 'Maharashtra', city: 'Mumbai',    founded: 2009 },
      { name: 'Hitachi Payment Services',   website: 'https://www.hitachi-payments.com', country: 'India', state: 'Maharashtra', city: 'Mumbai',    founded: 2011 },
      { name: 'Financial Software & Systems (FSS)', website: 'https://www.fsstech.com', country: 'India', state: 'Tamil Nadu',  city: 'Chennai',   founded: 1991 },
      { name: 'Tata Communications Payment Solutions', website: 'https://www.tatacommunications.com', country: 'India', state: 'Maharashtra', city: 'Mumbai', founded: 2004 },
      { name: 'NCR Corporation India',      website: 'https://www.ncr.com',             country: 'India', state: 'Telangana',   city: 'Hyderabad', founded: 1995 },
      { name: 'Diebold Nixdorf India',      website: 'https://www.dieboldnixdorf.com',  country: 'India', state: 'Maharashtra', city: 'Mumbai',    founded: 2000 },
      { name: 'Euronet Services India',     website: 'https://www.euronetworldwide.com', country: 'India', state: 'Maharashtra', city: 'Mumbai',    founded: 2004 },
      { name: 'Vakrangee',                  website: 'https://www.vakrangee.in',        country: 'India', state: 'Maharashtra', city: 'Mumbai',    founded: 1990 },
      { name: 'Writer Business Services',   website: 'https://www.writercorporation.com', country: 'India', state: 'Maharashtra', city: 'Mumbai',  founded: 1956 },
    ],
  },
  {
    categorySlug: 'alternative-investments',
    categoryName: 'Alternative Investment',
    companies: [
      { name: 'Macquarie Asset Management', website: 'https://www.macquarie.com',     country: 'Australia', state: 'New South Wales', city: 'Sydney',    founded: 1969 },
      { name: 'IFM Investors',              website: 'https://www.ifminvestors.com',  country: 'Australia', state: 'Victoria',        city: 'Melbourne', founded: 1990 },
      { name: 'QIC',                        website: 'https://www.qic.com',           country: 'Australia', state: 'Queensland',      city: 'Brisbane',  founded: 1991 },
      { name: 'HMC Capital',                website: 'https://www.hmccapital.com.au', country: 'Australia', state: 'New South Wales', city: 'Sydney',    founded: 2009 },
      { name: 'Charter Hall Group',         website: 'https://www.charterhall.com.au', country: 'Australia', state: 'New South Wales', city: 'Sydney',   founded: 1991 },
      { name: 'Pacific Equity Partners',    website: 'https://www.pep.com.au',        country: 'Australia', state: 'New South Wales', city: 'Sydney',    founded: 1998 },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function domainOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return null; }
}

function clearbitLogo(url) {
  const d = domainOf(url);
  return d ? `https://logo.clearbit.com/${d}` : null;
}

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { timeout: 6000 }, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
      res.resume();
    }).on('error', () => resolve(false)).on('timeout', () => resolve(false));
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  console.log(COMMIT ? '⚡ COMMIT MODE — writing to DB' : '🔍 DRY RUN — pass --commit to write');

  // 1) Insert new categories
  const parentSlugs = [...new Set(NEW_CATEGORIES.map(c => c.parent))];
  const { data: parentRows, error: pe } = await sb
    .from('categories').select('id,slug').in('slug', parentSlugs);
  if (pe) throw pe;
  const parentIdBySlug = Object.fromEntries(parentRows.map(r => [r.slug, r.id]));
  for (const ps of parentSlugs) {
    if (!parentIdBySlug[ps]) throw new Error(`parent category not found: ${ps}`);
  }

  for (const cat of NEW_CATEGORIES) {
    const { data: existing } = await sb.from('categories').select('id').eq('slug', cat.slug).maybeSingle();
    if (existing) {
      console.log(`  · category exists: ${cat.slug}`);
      continue;
    }
    const row = {
      name: cat.name,
      slug: cat.slug,
      description: `${cat.name} companies on FirmsLedger. Compare verified providers, check reviews, and find trusted partners.`,
      parent_id: parentIdBySlug[cat.parent],
      is_parent: false,
      order: 99,
    };
    if (COMMIT) {
      const { error } = await sb.from('categories').insert(row);
      if (error) throw error;
      console.log(`  ✓ created category: ${cat.slug}`);
    } else {
      console.log(`  + would create category: ${cat.slug} (parent=${cat.parent})`);
    }
  }

  // 2) Resolve all category IDs we need
  const allSlugs = [...new Set(DIRECTORIES.map(d => d.categorySlug))];
  const { data: catRows } = await sb.from('categories').select('id,slug').in('slug', allSlugs);
  const catIdBySlug = Object.fromEntries((catRows || []).map(r => [r.slug, r.id]));
  for (const s of allSlugs) {
    if (!catIdBySlug[s] && !COMMIT) {
      // Will exist after commit; placeholder for dry-run
      catIdBySlug[s] = '<new>';
    }
  }

  // 3) Insert companies + links
  let stats = { created: 0, existing: 0, linked: 0, alreadyLinked: 0, logos: 0 };

  for (const dir of DIRECTORIES) {
    console.log(`\n▸ ${dir.categorySlug} (${dir.companies.length} companies)`);
    const catId = catIdBySlug[dir.categorySlug];

    for (const co of dir.companies) {
      let slug = slugify(co.name);
      // Append country if needed for uniqueness in well-known global names
      const { data: clash } = await sb.from('agencies').select('id,name,hq_country').eq('slug', slug).maybeSingle();
      let agencyId = null;

      if (clash) {
        if (clash.name === co.name && clash.hq_country === co.country) {
          agencyId = clash.id;
          stats.existing++;
          console.log(`    · exists: ${co.name}`);
        } else {
          slug = slugify(co.name + ' ' + co.country);
          console.log(`    ⚠ slug clash, using ${slug}`);
        }
      }

      if (!agencyId) {
        let logoUrl = null;
        if (dir.fetchLogos) {
          const candidate = clearbitLogo(co.website);
          if (candidate && await checkUrl(candidate)) {
            logoUrl = candidate;
            stats.logos++;
          }
        }

        const row = {
          name: co.name,
          slug,
          description: describe(co.name, dir.categoryName, co.country, co.city),
          website: co.website,
          logo_url: logoUrl,
          founded_year: co.founded || null,
          hq_country: co.country,
          hq_state: co.state || null,
          hq_city: co.city || null,
          verified: false,
          featured: false,
          approved: true,
        };

        if (COMMIT) {
          const { data: ins, error } = await sb.from('agencies').insert(row).select('id').single();
          if (error) {
            console.log(`    ✗ insert failed: ${co.name} — ${error.message}`);
            continue;
          }
          agencyId = ins.id;
          stats.created++;
          console.log(`    ✓ created: ${co.name}${logoUrl ? ' [+logo]' : ''}`);
        } else {
          console.log(`    + would create: ${co.name} (${slug})${dir.fetchLogos ? ' [logo:' + clearbitLogo(co.website) + ']' : ''}`);
        }
      }

      // link
      if (COMMIT && agencyId && catId !== '<new>') {
        const { data: existingLink } = await sb
          .from('agency_categories').select('id')
          .eq('agency_id', agencyId).eq('category_id', catId).maybeSingle();
        if (existingLink) {
          stats.alreadyLinked++;
        } else {
          const { error } = await sb.from('agency_categories').insert({ agency_id: agencyId, category_id: catId });
          if (error) console.log(`    ✗ link failed: ${error.message}`);
          else stats.linked++;
        }
      }
    }
  }

  console.log('\n━━━ Summary ━━━');
  console.log(`  created agencies   : ${stats.created}`);
  console.log(`  existing agencies  : ${stats.existing}`);
  console.log(`  category links new : ${stats.linked}`);
  console.log(`  already linked     : ${stats.alreadyLinked}`);
  console.log(`  logos fetched      : ${stats.logos}`);
  console.log(COMMIT ? '\nDone.' : '\nDry run only — re-run with --commit to write.');
})();
