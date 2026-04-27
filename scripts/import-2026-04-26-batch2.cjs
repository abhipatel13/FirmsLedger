/**
 * Bulk import — second batch (2026-04-26).
 * 33 new directories. Idempotent: skips companies whose slug already exists
 * and skips agency_categories rows that already link the same pair.
 *
 *   node scripts/import-2026-04-26-batch2.cjs            # dry-run
 *   node scripts/import-2026-04-26-batch2.cjs --commit
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const COMMIT = process.argv.includes('--commit');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// ─── New categories to create (existing slugs are reused) ─────────────────────

const NEW_CATEGORIES = [
  { name: 'Food Processing',                slug: 'food-processing',           parent: 'food-beverage' },
  { name: 'Root Beer',                      slug: 'root-beer',                 parent: 'food-beverage' },
  { name: 'PEX Pipe',                       slug: 'pex-pipe',                  parent: 'construction-real-estate' },
  { name: 'Automotive Manufacturing',       slug: 'automotive-manufacturing',  parent: 'automotive' },
  { name: 'Hockey Tape',                    slug: 'hockey-tape',               parent: 'sports-fitness' },
  { name: 'Solar Lights',                   slug: 'solar-lights',              parent: 'renewable-energy' },
  { name: 'Online Event Ticketing',         slug: 'online-event-ticketing',    parent: 'events-entertainment' },
  { name: 'Composite Siding',               slug: 'composite-siding',          parent: 'construction-real-estate' },
  { name: 'Chemical Manufacturing',         slug: 'chemical-manufacturing',    parent: 'chemicals-petrochemicals' },
  { name: 'Vacuum Service Trucks',          slug: 'vacuum-service-trucks',     parent: 'industrial-equipment-supplies' },
  { name: 'Proton Exchange Membranes',      slug: 'proton-exchange-membranes', parent: 'renewable-energy' },
  { name: 'Gas Stations',                   slug: 'gas-stations',              parent: 'energy' },
  { name: 'Ski Manufacturers',              slug: 'ski-manufacturers',         parent: 'sports-fitness' },
  { name: 'End User Computing',             slug: 'end-user-computing',        parent: 'information-technology' },
  { name: 'Cigars',                         slug: 'cigars',                    parent: 'consumer-goods' },
  { name: 'Acting Companies',               slug: 'acting',                    parent: 'events-entertainment' },
];

function describe(name, categoryName, country, city) {
  const where = city ? `${city}, ${country}` : country;
  return `${name} is a leading ${categoryName} company based in ${where}. They serve clients across the region with proven expertise in ${categoryName.toLowerCase()}.`;
}

// ─── Companies per directory ──────────────────────────────────────────────────

const DIRECTORIES = [
  // 1. Food Processing in Mexico (10)
  { categorySlug: 'food-processing', categoryName: 'Food Processing', companies: [
    { name: 'Grupo Bimbo',              website: 'https://www.grupobimbo.com',     country: 'Mexico', state: 'Mexico City',   city: 'Mexico City',          founded: 1945 },
    { name: 'Sigma Alimentos',          website: 'https://www.sigma-alimentos.com', country: 'Mexico', state: 'Nuevo León',    city: 'San Pedro Garza García', founded: 1980 },
    { name: 'Gruma',                    website: 'https://www.gruma.com',          country: 'Mexico', state: 'Nuevo León',    city: 'San Pedro Garza García', founded: 1949 },
    { name: 'Industrias Bachoco',       website: 'https://www.bachoco.com.mx',     country: 'Mexico', state: 'Guanajuato',    city: 'Celaya',               founded: 1952 },
    { name: 'Grupo Lala',               website: 'https://www.lala.com.mx',        country: 'Mexico', state: 'Coahuila',      city: 'Torreón',              founded: 1949 },
    { name: 'Grupo Herdez',             website: 'https://www.grupoherdez.com.mx', country: 'Mexico', state: 'Mexico City',   city: 'Mexico City',          founded: 1914 },
    { name: 'La Costeña',               website: 'https://www.lacostena.com.mx',   country: 'Mexico', state: 'México',        city: 'Ecatepec',             founded: 1923 },
    { name: 'Grupo Minsa',              website: 'https://www.minsa.com',          country: 'Mexico', state: 'Mexico City',   city: 'Mexico City',          founded: 1949 },
    { name: 'Grupo Bafar',              website: 'https://www.bafar.com.mx',       country: 'Mexico', state: 'Chihuahua',     city: 'Chihuahua',            founded: 1983 },
    { name: 'SuKarne',                  website: 'https://www.sukarne.com',        country: 'Mexico', state: 'Sinaloa',       city: 'Culiacán',             founded: 1969 },
  ]},
  // 2. Seasoning in Greece (5)
  { categorySlug: 'seasoning', categoryName: 'Seasoning', companies: [
    { name: 'Yiotis SA',                website: 'https://www.yiotis.gr',          country: 'Greece', state: 'Attica',        city: 'Athens',               founded: 1930 },
    { name: 'Mediterra (Mastihashop)',  website: 'https://www.mastihashop.com',    country: 'Greece', state: 'North Aegean',  city: 'Chios',                founded: 2002 },
    { name: 'Misko (Barilla Hellas)',   website: 'https://www.misko.gr',           country: 'Greece', state: 'Attica',        city: 'Athens',               founded: 1927 },
    { name: 'ELAIS-Unilever Hellas',    website: 'https://www.unilever.com',       country: 'Greece', state: 'Attica',        city: 'Piraeus',              founded: 1920 },
    { name: 'Mavridis Brothers SA',     website: 'https://www.mavridis.gr',        country: 'Greece', state: 'Central Macedonia', city: 'Thessaloniki',     founded: 1974 },
  ]},
  // 3. Root Beer Companies (10) - global
  { categorySlug: 'root-beer', categoryName: 'Root Beer', companies: [
    { name: 'A&W Root Beer',            website: 'https://www.awrestaurants.com',  country: 'United States', state: 'Kentucky', city: 'Lexington',           founded: 1919 },
    { name: 'Mug Root Beer (PepsiCo)',  website: 'https://www.pepsico.com',        country: 'United States', state: 'New York', city: 'Purchase',            founded: 1940 },
    { name: 'Barq\'s (Coca-Cola)',      website: 'https://www.coca-colacompany.com', country: 'United States', state: 'Georgia', city: 'Atlanta',           founded: 1898 },
    { name: 'Dad\'s Root Beer',         website: 'https://www.dadsrootbeer.com',   country: 'United States', state: 'Illinois', city: 'Jasper',              founded: 1937 },
    { name: 'IBC Root Beer (Keurig Dr Pepper)', website: 'https://www.keurigdrpepper.com', country: 'United States', state: 'Texas', city: 'Plano',           founded: 1919 },
    { name: 'Boylan Bottling Co.',      website: 'https://www.boylanbottling.com', country: 'United States', state: 'New Jersey', city: 'Teterboro',         founded: 1891 },
    { name: 'Sprecher Brewery',         website: 'https://www.sprecherbrewery.com', country: 'United States', state: 'Wisconsin', city: 'Milwaukee',         founded: 1985 },
    { name: 'Frostie Root Beer (Intrastate Distributors)', website: 'https://www.intrastate.com', country: 'United States', state: 'Michigan', city: 'Detroit', founded: 1939 },
    { name: 'Hires Root Beer (Keurig Dr Pepper)', website: 'https://www.keurigdrpepper.com', country: 'United States', state: 'Texas', city: 'Plano',         founded: 1876 },
    { name: 'Virgil\'s Root Beer (Reed\'s)', website: 'https://www.drinkvirgils.com', country: 'United States', state: 'California', city: 'Norwalk',         founded: 1994 },
  ]},
  // 4. HVAC in US (10)
  { categorySlug: 'hvac', categoryName: 'HVAC', companies: [
    { name: 'Carrier Global',           website: 'https://www.carrier.com',        country: 'United States', state: 'Florida',     city: 'Palm Beach Gardens', founded: 1915 },
    { name: 'Trane Technologies',       website: 'https://www.tranetechnologies.com', country: 'United States', state: 'North Carolina', city: 'Davidson',     founded: 1885 },
    { name: 'Lennox International',     website: 'https://www.lennox.com',         country: 'United States', state: 'Texas',       city: 'Richardson',         founded: 1895 },
    { name: 'Goodman Manufacturing',    website: 'https://www.goodmanmfg.com',     country: 'United States', state: 'Texas',       city: 'Houston',            founded: 1975 },
    { name: 'Rheem Manufacturing',      website: 'https://www.rheem.com',          country: 'United States', state: 'Georgia',     city: 'Atlanta',            founded: 1925 },
    { name: 'York (Johnson Controls)',  website: 'https://www.york.com',           country: 'United States', state: 'Pennsylvania', city: 'York',              founded: 1874 },
    { name: 'American Standard Heating & Air Conditioning', website: 'https://www.americanstandardair.com', country: 'United States', state: 'North Carolina', city: 'Davidson', founded: 1875 },
    { name: 'Bryant Heating & Cooling Systems', website: 'https://www.bryant.com', country: 'United States', state: 'Indiana',     city: 'Indianapolis',       founded: 1904 },
    { name: 'Daikin Comfort Technologies (US)', website: 'https://www.daikincomfort.com', country: 'United States', state: 'Texas', city: 'Waller',           founded: 1924 },
    { name: 'WaterFurnace International', website: 'https://www.waterfurnace.com', country: 'United States', state: 'Indiana',     city: 'Fort Wayne',         founded: 1983 },
  ]},
  // 5. ERP Software (10) - global
  { categorySlug: 'erp-software', categoryName: 'ERP Software', companies: [
    { name: 'SAP SE',                   website: 'https://www.sap.com',            country: 'Germany',       state: 'Baden-Württemberg', city: 'Walldorf',     founded: 1972 },
    { name: 'Oracle Corporation',       website: 'https://www.oracle.com',         country: 'United States', state: 'Texas',           city: 'Austin',          founded: 1977 },
    { name: 'Microsoft Dynamics',       website: 'https://dynamics.microsoft.com', country: 'United States', state: 'Washington',      city: 'Redmond',         founded: 1975 },
    { name: 'Workday',                  website: 'https://www.workday.com',        country: 'United States', state: 'California',      city: 'Pleasanton',      founded: 2005 },
    { name: 'Infor',                    website: 'https://www.infor.com',          country: 'United States', state: 'New York',        city: 'New York',        founded: 2002 },
    { name: 'NetSuite (Oracle)',        website: 'https://www.netsuite.com',       country: 'United States', state: 'California',      city: 'Austin',          founded: 1998 },
    { name: 'Epicor Software',          website: 'https://www.epicor.com',         country: 'United States', state: 'Texas',           city: 'Austin',          founded: 1972 },
    { name: 'IFS World',                website: 'https://www.ifs.com',            country: 'Sweden',        state: 'Östergötland',    city: 'Linköping',       founded: 1983 },
    { name: 'Sage Group',               website: 'https://www.sage.com',           country: 'United Kingdom', state: 'England',        city: 'Newcastle upon Tyne', founded: 1981 },
    { name: 'Acumatica',                website: 'https://www.acumatica.com',      country: 'United States', state: 'Washington',      city: 'Bellevue',        founded: 2008 },
  ]},
  // 6. Dental Implants in US (10)
  { categorySlug: 'dental-implants', categoryName: 'Dental Implant', companies: [
    { name: 'Nobel Biocare USA',        website: 'https://www.nobelbiocare.com',   country: 'United States', state: 'California',      city: 'Yorba Linda',     founded: 1981 },
    { name: 'Straumann USA',            website: 'https://www.straumann.com',      country: 'United States', state: 'Massachusetts',   city: 'Andover',         founded: 1954 },
    { name: 'Zimmer Biomet Dental',     website: 'https://www.zimmerbiometdental.com', country: 'United States', state: 'Florida',     city: 'Palm Beach Gardens', founded: 1927 },
    { name: 'Dentsply Sirona Implants', website: 'https://www.dentsplysirona.com', country: 'United States', state: 'North Carolina', city: 'Charlotte',        founded: 1899 },
    { name: 'BioHorizons',              website: 'https://www.biohorizons.com',    country: 'United States', state: 'Alabama',         city: 'Birmingham',      founded: 1994 },
    { name: 'Glidewell Dental',         website: 'https://www.glidewelldental.com', country: 'United States', state: 'California',     city: 'Newport Beach',   founded: 1970 },
    { name: 'Implant Direct',           website: 'https://www.implantdirect.com',  country: 'United States', state: 'Nevada',          city: 'Las Vegas',       founded: 2006 },
    { name: 'Hiossen Implant',          website: 'https://www.hiossen.com',        country: 'United States', state: 'Pennsylvania',    city: 'Fairless Hills',  founded: 2006 },
    { name: 'Keystone Dental',          website: 'https://www.keystonedental.com', country: 'United States', state: 'Massachusetts',   city: 'Burlington',      founded: 2003 },
    { name: 'Neoss Inc.',               website: 'https://www.neoss.com',          country: 'United States', state: 'Illinois',        city: 'Buffalo Grove',   founded: 2000 },
  ]},
  // 7. PEX Pipe in US (10)
  { categorySlug: 'pex-pipe', categoryName: 'PEX Pipe', companies: [
    { name: 'Uponor North America',     website: 'https://www.uponor-usa.com',     country: 'United States', state: 'Minnesota',       city: 'Apple Valley',    founded: 1990 },
    { name: 'Viega LLC',                website: 'https://www.viega.us',           country: 'United States', state: 'Kansas',          city: 'Broomfield',      founded: 1899 },
    { name: 'Rehau Inc.',               website: 'https://www.rehau.com',          country: 'United States', state: 'Virginia',        city: 'Leesburg',        founded: 1948 },
    { name: 'Watts Water Technologies', website: 'https://www.watts.com',          country: 'United States', state: 'Massachusetts',   city: 'North Andover',   founded: 1874 },
    { name: 'NIBCO',                    website: 'https://www.nibco.com',          country: 'United States', state: 'Indiana',         city: 'Elkhart',         founded: 1904 },
    { name: 'Mr. PEX Systems',          website: 'https://www.mrpexsystems.com',   country: 'United States', state: 'Minnesota',       city: 'St. Cloud',       founded: 1996 },
    { name: 'SharkBite (RWC)',          website: 'https://www.sharkbite.com',      country: 'United States', state: 'Georgia',         city: 'Atlanta',         founded: 1949 },
    { name: 'Sioux Chief Manufacturing', website: 'https://www.siouxchief.com',    country: 'United States', state: 'Missouri',        city: 'Peculiar',        founded: 1957 },
    { name: 'Apollo Valves (Conbraco)', website: 'https://www.apollovalves.com',   country: 'United States', state: 'North Carolina', city: 'Matthews',         founded: 1928 },
    { name: 'Zurn Elkay Water Solutions', website: 'https://www.zurn.com',         country: 'United States', state: 'Wisconsin',       city: 'Milwaukee',       founded: 1900 },
  ]},
  // 8. Professional Services (10) - global
  { categorySlug: 'professional-services', categoryName: 'Professional Services', companies: [
    { name: 'Deloitte',                 website: 'https://www2.deloitte.com',      country: 'United Kingdom', state: 'England',        city: 'London',          founded: 1845 },
    { name: 'PwC',                      website: 'https://www.pwc.com',            country: 'United Kingdom', state: 'England',        city: 'London',          founded: 1849 },
    { name: 'EY (Ernst & Young)',       website: 'https://www.ey.com',             country: 'United Kingdom', state: 'England',        city: 'London',          founded: 1989 },
    { name: 'KPMG',                     website: 'https://kpmg.com',               country: 'Netherlands',    state: 'North Holland',  city: 'Amstelveen',      founded: 1987 },
    { name: 'Accenture',                website: 'https://www.accenture.com',      country: 'Ireland',        state: 'Leinster',       city: 'Dublin',          founded: 1989 },
    { name: 'McKinsey & Company',       website: 'https://www.mckinsey.com',       country: 'United States',  state: 'New York',       city: 'New York',        founded: 1926 },
    { name: 'Boston Consulting Group',  website: 'https://www.bcg.com',            country: 'United States',  state: 'Massachusetts',  city: 'Boston',          founded: 1963 },
    { name: 'Bain & Company',           website: 'https://www.bain.com',           country: 'United States',  state: 'Massachusetts',  city: 'Boston',          founded: 1973 },
    { name: 'IBM Consulting',           website: 'https://www.ibm.com/consulting', country: 'United States',  state: 'New York',       city: 'Armonk',          founded: 1911 },
    { name: 'Booz Allen Hamilton',      website: 'https://www.boozallen.com',      country: 'United States',  state: 'Virginia',       city: 'McLean',          founded: 1914 },
  ]},
  // 9. Automotive Manufacturing in Kenya (10)
  { categorySlug: 'automotive-manufacturing', categoryName: 'Automotive Manufacturing', companies: [
    { name: 'Isuzu East Africa',        website: 'https://www.isuzu.co.ke',        country: 'Kenya',         state: 'Nairobi',         city: 'Nairobi',         founded: 1977 },
    { name: 'Kenya Vehicle Manufacturers (KVM)', website: 'https://www.kvm.co.ke', country: 'Kenya',         state: 'Uasin Gishu',     city: 'Eldoret',         founded: 1976 },
    { name: 'Associated Vehicle Assemblers (AVA)', website: 'https://www.simbacolt.com', country: 'Kenya',  state: 'Mombasa',         city: 'Mombasa',         founded: 1976 },
    { name: 'Toyota Kenya',             website: 'https://www.toyotakenya.com',    country: 'Kenya',         state: 'Nairobi',         city: 'Nairobi',         founded: 1968 },
    { name: 'CMC Motors Group',         website: 'https://www.cmcmotors.com',      country: 'Kenya',         state: 'Nairobi',         city: 'Nairobi',         founded: 1948 },
    { name: 'Simba Corp',               website: 'https://www.simbacorp.com',      country: 'Kenya',         state: 'Nairobi',         city: 'Nairobi',         founded: 1948 },
    { name: 'DT Dobie',                 website: 'https://www.dtdobie.co.ke',      country: 'Kenya',         state: 'Nairobi',         city: 'Nairobi',         founded: 1948 },
    { name: 'Mobius Motors',            website: 'https://www.mobiusmotors.com',   country: 'Kenya',         state: 'Nairobi',         city: 'Nairobi',         founded: 2009 },
    { name: 'Tata Africa Holdings',     website: 'https://www.tata.com',           country: 'Kenya',         state: 'Nairobi',         city: 'Nairobi',         founded: 1977 },
    { name: 'Honda Motorcycle Kenya (Honda Kenya)', website: 'https://www.honda.co.ke', country: 'Kenya',  state: 'Nairobi',         city: 'Nairobi',         founded: 2003 },
  ]},
  // 10. Hockey Tape Manufacturers (10)
  { categorySlug: 'hockey-tape', categoryName: 'Hockey Tape', companies: [
    { name: 'Renfrew Pro',              website: 'https://www.renfrewpro.com',     country: 'Canada',        state: 'Quebec',          city: 'Montreal',        founded: 1959 },
    { name: 'Howies Hockey Tape',       website: 'https://www.howieshockeytape.com', country: 'United States', state: 'Minnesota',     city: 'Mankato',         founded: 2002 },
    { name: 'A&R Sports (Comp-O-Stik)', website: 'https://www.arsports.com',       country: 'United States', state: 'Pennsylvania',    city: 'Pittston',        founded: 1980 },
    { name: 'Sportstape',               website: 'https://www.sportstape.com',     country: 'Canada',        state: 'British Columbia', city: 'Burnaby',        founded: 2005 },
    { name: 'Lizard Skins',             website: 'https://www.lizardskins.com',    country: 'United States', state: 'Utah',            city: 'West Valley City', founded: 1993 },
    { name: 'Bauer Hockey',             website: 'https://www.bauer.com',          country: 'United States', state: 'New Hampshire',   city: 'Exeter',          founded: 1927 },
    { name: 'CCM Hockey',               website: 'https://www.ccmhockey.com',      country: 'Canada',        state: 'Quebec',          city: 'Saint-Jean-sur-Richelieu', founded: 1899 },
    { name: 'Tapis ProBlade',           website: 'https://www.problade.com',       country: 'Canada',        state: 'Ontario',         city: 'Toronto',         founded: 2010 },
    { name: 'Buffalo Hockey Tape',      website: 'https://www.buffalohockeytape.com', country: 'United States', state: 'New York',     city: 'Buffalo',         founded: 2014 },
    { name: 'Tron Hockey',              website: 'https://www.tronhockey.com',     country: 'United States', state: 'Pennsylvania',    city: 'King of Prussia', founded: 1995 },
  ]},
  // 11. Solar Lights in China (10)
  { categorySlug: 'solar-lights', categoryName: 'Solar Light', companies: [
    { name: 'Yingli Solar',             website: 'https://www.yinglisolar.com',    country: 'China',         state: 'Hebei',           city: 'Baoding',         founded: 1998 },
    { name: 'JinkoSolar',               website: 'https://www.jinkosolar.com',     country: 'China',         state: 'Jiangxi',         city: 'Shangrao',        founded: 2006 },
    { name: 'Trina Solar',              website: 'https://www.trinasolar.com',     country: 'China',         state: 'Jiangsu',         city: 'Changzhou',       founded: 1997 },
    { name: 'JA Solar',                 website: 'https://www.jasolar.com',        country: 'China',         state: 'Beijing',         city: 'Beijing',         founded: 2005 },
    { name: 'LONGi Green Energy',       website: 'https://www.longi.com',          country: 'China',         state: 'Shaanxi',         city: 'Xi\'an',          founded: 2000 },
    { name: 'Risen Energy',             website: 'https://www.risenenergy.com',    country: 'China',         state: 'Zhejiang',        city: 'Ninghai',         founded: 1986 },
    { name: 'Shenzhen Power Solution',  website: 'https://www.powersolution.com.cn', country: 'China',       state: 'Guangdong',       city: 'Shenzhen',        founded: 2006 },
    { name: 'Xindun Power',             website: 'https://www.xindunpower.com',    country: 'China',         state: 'Guangdong',       city: 'Foshan',          founded: 2007 },
    { name: 'Coollight Industry',       website: 'https://www.coollight.com.cn',   country: 'China',         state: 'Guangdong',       city: 'Shenzhen',        founded: 2002 },
    { name: 'Goal Zero Sun (Sunco Lighting)', website: 'https://www.suncolighting.com', country: 'China',   state: 'Guangdong',       city: 'Shenzhen',        founded: 2010 },
  ]},
  // 12. Cashew Nut Manufacturers (10) — uses existing 'cashews' slug
  { categorySlug: 'cashews', categoryName: 'Cashew Nut', companies: [
    { name: 'Olam International',       website: 'https://www.olamgroup.com',      country: 'Singapore',     state: '',                city: 'Singapore',       founded: 1989 },
    { name: 'Vinacas (Vietnam Cashew Association)', website: 'https://vinacas.com.vn', country: 'Vietnam',  state: 'Ho Chi Minh',     city: 'Ho Chi Minh City', founded: 1990 },
    { name: 'Long Son JSC',             website: 'https://www.longsonvn.com',      country: 'Vietnam',       state: 'Bình Phước',      city: 'Bình Phước',      founded: 1995 },
    { name: 'Kalbavi Cashew',           website: 'https://www.kalbavicashew.com',  country: 'India',         state: 'Karnataka',       city: 'Mangalore',       founded: 1987 },
    { name: 'KPR Agro Mills',           website: 'https://www.kpragromills.com',   country: 'India',         state: 'Kerala',          city: 'Kollam',          founded: 1956 },
    { name: 'Achal Cashew',             website: 'https://www.achalcashew.com',    country: 'India',         state: 'Karnataka',       city: 'Mangalore',       founded: 1985 },
    { name: 'Itc Limited (ITC Foods)',  website: 'https://www.itcportal.com',      country: 'India',         state: 'West Bengal',     city: 'Kolkata',         founded: 1910 },
    { name: 'CashewCo Africa',          website: 'https://www.cashewco.com',       country: 'Nigeria',       state: 'Lagos',           city: 'Lagos',           founded: 2003 },
    { name: 'Anacardes do Brasil',      website: 'https://www.anacardesdobrasil.com.br', country: 'Brazil', state: 'Ceará',           city: 'Fortaleza',       founded: 1980 },
    { name: 'Trang An Group',           website: 'https://www.trangangroup.com.vn', country: 'Vietnam',      state: 'Hanoi',           city: 'Hanoi',           founded: 1996 },
  ]},
  // 13. Influencer Marketing in Germany (10)
  { categorySlug: 'influencer-marketing', categoryName: 'Influencer Marketing', companies: [
    { name: 'BuzzBird',                 website: 'https://www.buzzbird.de',        country: 'Germany',       state: 'Berlin',          city: 'Berlin',          founded: 2014 },
    { name: 'Reachbird Solutions',      website: 'https://www.reachbird.io',       country: 'Germany',       state: 'Bavaria',         city: 'Munich',          founded: 2015 },
    { name: 'OneToExceed',              website: 'https://www.onetoexceed.com',    country: 'Germany',       state: 'Hamburg',         city: 'Hamburg',         founded: 2017 },
    { name: 'Hashtag Inc.',             website: 'https://www.hashtag-inc.com',    country: 'Germany',       state: 'Berlin',          city: 'Berlin',          founded: 2014 },
    { name: 'Webguerillas (Territory Influence)', website: 'https://www.territory-influence.com', country: 'Germany', state: 'North Rhine-Westphalia', city: 'Cologne', founded: 2000 },
    { name: 'Hitchon',                  website: 'https://www.hitchon.de',         country: 'Germany',       state: 'Berlin',          city: 'Berlin',          founded: 2017 },
    { name: 'Influry',                  website: 'https://www.influry.com',        country: 'Germany',       state: 'Bavaria',         city: 'Munich',          founded: 2018 },
    { name: 'Stylink Social Media',     website: 'https://www.stylink.com',        country: 'Germany',       state: 'Bavaria',         city: 'Munich',          founded: 2015 },
    { name: 'Pulse Advertising',        website: 'https://www.pulseadvertising.com', country: 'Germany',     state: 'Hamburg',         city: 'Hamburg',         founded: 2014 },
    { name: 'Brandnew IO',              website: 'https://www.brandnew.io',        country: 'Germany',       state: 'Berlin',          city: 'Berlin',          founded: 2014 },
  ]},
  // 14. Online Event Ticketing in Italy (10)
  { categorySlug: 'online-event-ticketing', categoryName: 'Online Event Ticketing', companies: [
    { name: 'TicketOne',                website: 'https://www.ticketone.it',       country: 'Italy',         state: 'Lombardy',        city: 'Milan',           founded: 2000 },
    { name: 'Vivaticket',               website: 'https://www.vivaticket.com',     country: 'Italy',         state: 'Emilia-Romagna',  city: 'Bologna',         founded: 1969 },
    { name: 'Mailticket',               website: 'https://www.mailticket.it',      country: 'Italy',         state: 'Emilia-Romagna',  city: 'Bologna',         founded: 2001 },
    { name: 'DICE FM Italia',           website: 'https://www.dice.fm',            country: 'Italy',         state: 'Lazio',           city: 'Rome',            founded: 2014 },
    { name: 'Ticketmaster Italia',      website: 'https://www.ticketmaster.it',    country: 'Italy',         state: 'Lombardy',        city: 'Milan',           founded: 2009 },
    { name: 'Boxol',                    website: 'https://www.boxol.it',           country: 'Italy',         state: 'Lazio',           city: 'Rome',            founded: 2013 },
    { name: 'Ciao Tickets',             website: 'https://www.ciaotickets.com',    country: 'Italy',         state: 'Tuscany',         city: 'Florence',        founded: 2002 },
    { name: 'Etes',                     website: 'https://www.etes.it',            country: 'Italy',         state: 'Lazio',           city: 'Rome',            founded: 2010 },
    { name: 'Postoriservato',           website: 'https://www.postoriservato.it',  country: 'Italy',         state: 'Veneto',          city: 'Verona',          founded: 2007 },
    { name: 'Viva Ticket Box Office',   website: 'https://www.boxofficelazio.it',  country: 'Italy',         state: 'Lazio',           city: 'Rome',            founded: 1998 },
  ]},
  // 15. Specialty Chemicals in Spain (7)
  { categorySlug: 'specialty-chemicals', categoryName: 'Specialty Chemicals', companies: [
    { name: 'Ercros',                   website: 'https://www.ercros.es',          country: 'Spain',         state: 'Catalonia',       city: 'Barcelona',       founded: 1989 },
    { name: 'Fertiberia',               website: 'https://www.fertiberia.com',     country: 'Spain',         state: 'Community of Madrid', city: 'Madrid',     founded: 1977 },
    { name: 'Kemira Iberica',           website: 'https://www.kemira.com',         country: 'Spain',         state: 'Catalonia',       city: 'Barcelona',       founded: 1920 },
    { name: 'Productos Aditivos SA',    website: 'https://www.productosaditivos.com', country: 'Spain',     state: 'Catalonia',       city: 'Sant Cugat',      founded: 1965 },
    { name: 'Industrias Químicas del Ebro (IQE)', website: 'https://www.iqe.es',   country: 'Spain',         state: 'Aragon',          city: 'Zaragoza',        founded: 1942 },
    { name: 'Lubrizol Advanced Materials Spain', website: 'https://www.lubrizol.com', country: 'Spain',     state: 'Catalonia',       city: 'Barcelona',       founded: 1928 },
    { name: 'Carburos Metálicos (Air Products)', website: 'https://www.carburos.com', country: 'Spain',    state: 'Catalonia',       city: 'Barcelona',       founded: 1897 },
  ]},
  // 16. Sportswear in Italy (10)
  { categorySlug: 'sportswear', categoryName: 'Sportswear', companies: [
    { name: 'Kappa (BasicNet)',         website: 'https://www.kappa.com',          country: 'Italy',         state: 'Piedmont',        city: 'Turin',           founded: 1916 },
    { name: 'Diadora',                  website: 'https://www.diadora.com',        country: 'Italy',         state: 'Veneto',          city: 'Caerano di San Marco', founded: 1948 },
    { name: 'Lotto Sport Italia',       website: 'https://www.lottosport.com',     country: 'Italy',         state: 'Veneto',          city: 'Trevignano',      founded: 1973 },
    { name: 'Fila',                     website: 'https://www.fila.com',           country: 'Italy',         state: 'Piedmont',        city: 'Biella',          founded: 1911 },
    { name: 'Macron',                   website: 'https://www.macron.com',         country: 'Italy',         state: 'Emilia-Romagna',  city: 'Crespellano',     founded: 1971 },
    { name: 'Errea Sport',              website: 'https://www.errea.com',          country: 'Italy',         state: 'Emilia-Romagna',  city: 'Torrile',         founded: 1988 },
    { name: 'Robe di Kappa',            website: 'https://www.basicnet.com',       country: 'Italy',         state: 'Piedmont',        city: 'Turin',           founded: 1969 },
    { name: 'Sportful (Manifattura Valcismon)', website: 'https://www.sportful.com', country: 'Italy',      state: 'Veneto',          city: 'Fonzaso',         founded: 1972 },
    { name: 'Castelli Cycling',         website: 'https://www.castelli-cycling.com', country: 'Italy',      state: 'Veneto',          city: 'Fonzaso',         founded: 1876 },
    { name: 'Colmar',                   website: 'https://www.colmar.it',          country: 'Italy',         state: 'Lombardy',        city: 'Monza',           founded: 1923 },
  ]},
  // 17. Composite Siding in US (10)
  { categorySlug: 'composite-siding', categoryName: 'Composite Siding', companies: [
    { name: 'James Hardie Building Products', website: 'https://www.jameshardie.com', country: 'United States', state: 'Illinois',    city: 'Chicago',         founded: 1888 },
    { name: 'LP Building Solutions',    website: 'https://www.lpcorp.com',         country: 'United States', state: 'Tennessee',       city: 'Nashville',       founded: 1973 },
    { name: 'Boral Composites',         website: 'https://www.boralamerica.com',   country: 'United States', state: 'Georgia',         city: 'Atlanta',         founded: 1946 },
    { name: 'CertainTeed (Saint-Gobain)', website: 'https://www.certainteed.com',  country: 'United States', state: 'Pennsylvania',    city: 'Malvern',         founded: 1904 },
    { name: 'Allura USA',               website: 'https://www.allurausa.com',      country: 'United States', state: 'Texas',           city: 'Houston',         founded: 1959 },
    { name: 'Nichiha USA',              website: 'https://www.nichiha.com',        country: 'United States', state: 'Georgia',         city: 'Norcross',        founded: 1956 },
    { name: 'TruGrain by Resysta',      website: 'https://www.trugrain.com',       country: 'United States', state: 'California',      city: 'San Diego',       founded: 2009 },
    { name: 'Everlast Composite Siding', website: 'https://www.everlastsiding.com', country: 'United States', state: 'Pennsylvania',   city: 'Boyertown',       founded: 2007 },
    { name: 'Diamond Kote Building Products', website: 'https://www.diamondkote.com', country: 'United States', state: 'Wisconsin',  city: 'Marshfield',         founded: 1990 },
    { name: 'TruWood (Collins Companies)', website: 'https://www.collinsco.com',   country: 'United States', state: 'Oregon',         city: 'Portland',        founded: 1855 },
  ]},
  // 18. Chemical Manufacturing in Malaysia (10)
  { categorySlug: 'chemical-manufacturing', categoryName: 'Chemical Manufacturing', companies: [
    { name: 'Petronas Chemicals Group', website: 'https://www.petronaschemicals.com.my', country: 'Malaysia', state: 'Kuala Lumpur', city: 'Kuala Lumpur',     founded: 1997 },
    { name: 'Lotte Chemical Titan',     website: 'https://www.lottechem.my',       country: 'Malaysia',      state: 'Selangor',        city: 'Petaling Jaya',   founded: 1989 },
    { name: 'Chemical Company of Malaysia (CCM)', website: 'https://www.ccm.com.my', country: 'Malaysia',   state: 'Selangor',        city: 'Shah Alam',       founded: 1963 },
    { name: 'Sime Darby Plantation',    website: 'https://www.simedarbyplantation.com', country: 'Malaysia', state: 'Selangor',       city: 'Petaling Jaya',   founded: 1910 },
    { name: 'Halex Industries',         website: 'https://www.halexgroup.com',     country: 'Malaysia',      state: 'Penang',          city: 'Bukit Mertajam',  founded: 1971 },
    { name: 'Polyplastics Asia Pacific Sdn Bhd', website: 'https://www.polyplastics.com', country: 'Malaysia', state: 'Selangor',     city: 'Kuala Lumpur',    founded: 1995 },
    { name: 'BASF Petronas Chemicals',  website: 'https://www.basf.com',           country: 'Malaysia',      state: 'Pahang',          city: 'Kuantan',         founded: 1997 },
    { name: 'Eastman Chemical Malaysia', website: 'https://www.eastman.com',       country: 'Malaysia',      state: 'Selangor',        city: 'Kuala Lumpur',    founded: 1920 },
    { name: 'Hap Seng Consolidated',    website: 'https://www.hapseng.com.my',     country: 'Malaysia',      state: 'Kuala Lumpur',    city: 'Kuala Lumpur',    founded: 1909 },
    { name: 'Sumitomo Chemical Asia (Malaysia)', website: 'https://www.sumitomo-chem.com.my', country: 'Malaysia', state: 'Selangor', city: 'Petaling Jaya',   founded: 1995 },
  ]},
  // 19. Sensor Manufacturers in Finland (10)
  { categorySlug: 'sensors', categoryName: 'Sensor', companies: [
    { name: 'Vaisala',                  website: 'https://www.vaisala.com',        country: 'Finland',       state: 'Uusimaa',         city: 'Vantaa',          founded: 1936 },
    { name: 'Murata Electronics Oy',    website: 'https://www.murata.com',         country: 'Finland',       state: 'Uusimaa',         city: 'Vantaa',          founded: 1991 },
    { name: 'Teknoware',                website: 'https://www.teknoware.com',      country: 'Finland',       state: 'Päijät-Häme',     city: 'Lahti',           founded: 1972 },
    { name: 'Beneq',                    website: 'https://www.beneq.com',          country: 'Finland',       state: 'Uusimaa',         city: 'Espoo',           founded: 2005 },
    { name: 'Pulsedeon',                website: 'https://www.pulsedeon.fi',       country: 'Finland',       state: 'Uusimaa',         city: 'Espoo',           founded: 2010 },
    { name: 'Picosun',                  website: 'https://www.picosun.com',        country: 'Finland',       state: 'Uusimaa',         city: 'Espoo',           founded: 2004 },
    { name: 'Bittium',                  website: 'https://www.bittium.com',        country: 'Finland',       state: 'North Ostrobothnia', city: 'Oulu',         founded: 1985 },
    { name: 'Modulight',                website: 'https://www.modulight.com',      country: 'Finland',       state: 'Pirkanmaa',       city: 'Tampere',         founded: 2000 },
    { name: 'Spinverse Innovation',     website: 'https://www.spinverse.com',      country: 'Finland',       state: 'Uusimaa',         city: 'Espoo',           founded: 2003 },
    { name: 'Okmetic',                  website: 'https://www.okmetic.com',        country: 'Finland',       state: 'Uusimaa',         city: 'Vantaa',          founded: 1985 },
  ]},
  // 20. Lead Generation in US (10)
  { categorySlug: 'lead-generation', categoryName: 'Lead Generation', companies: [
    { name: 'ZoomInfo Technologies',    website: 'https://www.zoominfo.com',       country: 'United States', state: 'Washington',      city: 'Vancouver',       founded: 2000 },
    { name: 'Cognism US',               website: 'https://www.cognism.com',        country: 'United States', state: 'New York',        city: 'New York',        founded: 2015 },
    { name: 'Leadfeeder',               website: 'https://www.leadfeeder.com',     country: 'United States', state: 'Delaware',        city: 'Wilmington',      founded: 2012 },
    { name: 'CIENCE Technologies',      website: 'https://www.cience.com',         country: 'United States', state: 'California',      city: 'Los Angeles',     founded: 2015 },
    { name: 'Belkins',                  website: 'https://www.belkins.io',         country: 'United States', state: 'Delaware',        city: 'Dover',           founded: 2017 },
    { name: 'Callbox',                  website: 'https://www.callboxinc.com',     country: 'United States', state: 'California',      city: 'Encino',          founded: 2004 },
    { name: 'Salespanel',               website: 'https://www.salespanel.io',      country: 'United States', state: 'Delaware',        city: 'Wilmington',      founded: 2017 },
    { name: 'Strategic Sales & Marketing (SSM)', website: 'https://www.ssmlead.com', country: 'United States', state: 'Connecticut',  city: 'Farmington',      founded: 1989 },
    { name: 'Martal Group',             website: 'https://www.martalgroup.com',    country: 'United States', state: 'New York',        city: 'New York',        founded: 2009 },
    { name: 'SalesRoads',               website: 'https://www.salesroads.com',     country: 'United States', state: 'Florida',         city: 'Coral Springs',   founded: 2007 },
  ]},
  // 21. Vacuum Service Truck Manufacturers (10)
  { categorySlug: 'vacuum-service-trucks', categoryName: 'Vacuum Service Truck', companies: [
    { name: 'Vactor Manufacturing',     website: 'https://www.vactor.com',         country: 'United States', state: 'Illinois',        city: 'Streator',        founded: 1911 },
    { name: 'Vac-Con',                  website: 'https://www.vac-con.com',        country: 'United States', state: 'Florida',         city: 'Green Cove Springs', founded: 1986 },
    { name: 'Super Products LLC',       website: 'https://www.superproductsllc.com', country: 'United States', state: 'Wisconsin',     city: 'Mukwonago',       founded: 1973 },
    { name: 'GapVax',                   website: 'https://www.gapvax.com',         country: 'United States', state: 'Pennsylvania',    city: 'Johnstown',       founded: 1989 },
    { name: 'Hi-Vac Corporation',       website: 'https://www.hi-vac.com',         country: 'United States', state: 'Ohio',            city: 'Marietta',        founded: 1969 },
    { name: 'Guzzler Manufacturing',    website: 'https://www.guzzler.com',        country: 'United States', state: 'Illinois',        city: 'Streator',        founded: 1969 },
    { name: 'Ledwell',                  website: 'https://www.ledwell.com',        country: 'United States', state: 'Texas',           city: 'Texarkana',       founded: 1946 },
    { name: 'Cusco Industries (Wastequip)', website: 'https://www.cuscovac.com',   country: 'United States', state: 'Iowa',            city: 'Decorah',         founded: 1972 },
    { name: 'KeeVac Industries',        website: 'https://www.keevac.com',         country: 'United States', state: 'Colorado',        city: 'Denver',          founded: 2002 },
    { name: 'Westmoor Manufacturing',   website: 'https://www.westmoorltd.com',    country: 'United States', state: 'New York',        city: 'Hagaman',         founded: 1968 },
  ]},
  // 22. Proton Exchange Membrane Manufacturers (11)
  { categorySlug: 'proton-exchange-membranes', categoryName: 'Proton Exchange Membrane', companies: [
    { name: 'Chemours (Nafion)',        website: 'https://www.nafion.com',         country: 'United States', state: 'Delaware',        city: 'Wilmington',      founded: 2015 },
    { name: 'Gore Fuel Cell Technologies', website: 'https://www.gore.com',        country: 'United States', state: 'Maryland',        city: 'Newark',          founded: 1958 },
    { name: 'Ballard Power Systems',    website: 'https://www.ballard.com',        country: 'Canada',        state: 'British Columbia', city: 'Burnaby',        founded: 1979 },
    { name: 'Plug Power',               website: 'https://www.plugpower.com',      country: 'United States', state: 'New York',        city: 'Latham',          founded: 1997 },
    { name: 'Nel Hydrogen',             website: 'https://www.nelhydrogen.com',    country: 'Norway',        state: 'Oslo',            city: 'Oslo',            founded: 1927 },
    { name: 'ITM Power',                website: 'https://www.itm-power.com',      country: 'United Kingdom', state: 'England',        city: 'Sheffield',       founded: 2000 },
    { name: 'Toray Industries',         website: 'https://www.toray.com',          country: 'Japan',         state: 'Tokyo',           city: 'Tokyo',           founded: 1926 },
    { name: 'AGC Inc. (Flemion)',       website: 'https://www.agc.com',            country: 'Japan',         state: 'Tokyo',           city: 'Tokyo',           founded: 1907 },
    { name: 'Solvay Specialty Polymers (Aquivion)', website: 'https://www.solvay.com', country: 'Belgium',  state: 'Brussels',        city: 'Brussels',        founded: 1863 },
    { name: 'Cummins (Hydrogenics)',    website: 'https://www.cummins.com',        country: 'United States', state: 'Indiana',         city: 'Columbus',        founded: 1919 },
    { name: 'Hyzon Motors',             website: 'https://www.hyzonmotors.com',    country: 'United States', state: 'New York',        city: 'Honeoye Falls',   founded: 2020 },
  ]},
  // 23. Gas Stations in US (9)
  { categorySlug: 'gas-stations', categoryName: 'Gas Station', companies: [
    { name: 'Shell USA',                website: 'https://www.shell.us',           country: 'United States', state: 'Texas',           city: 'Houston',         founded: 1929 },
    { name: 'ExxonMobil',               website: 'https://www.exxonmobil.com',     country: 'United States', state: 'Texas',           city: 'Spring',          founded: 1999 },
    { name: 'Chevron Corporation',      website: 'https://www.chevron.com',        country: 'United States', state: 'Texas',           city: 'Houston',         founded: 1879 },
    { name: 'BP America',               website: 'https://www.bp.com',             country: 'United States', state: 'Illinois',        city: 'Chicago',         founded: 1865 },
    { name: 'Marathon Petroleum',       website: 'https://www.marathonpetroleum.com', country: 'United States', state: 'Ohio',         city: 'Findlay',         founded: 1887 },
    { name: '7-Eleven (Speedway)',      website: 'https://www.7-eleven.com',       country: 'United States', state: 'Texas',           city: 'Irving',          founded: 1927 },
    { name: 'Circle K (Alimentation Couche-Tard)', website: 'https://www.circlek.com', country: 'United States', state: 'Arizona',     city: 'Tempe',           founded: 1951 },
    { name: 'Wawa Inc.',                website: 'https://www.wawa.com',           country: 'United States', state: 'Pennsylvania',    city: 'Wawa',            founded: 1964 },
    { name: 'Sheetz',                   website: 'https://www.sheetz.com',         country: 'United States', state: 'Pennsylvania',    city: 'Altoona',         founded: 1952 },
  ]},
  // 24. Ski Companies (8) - global, mostly Europe
  { categorySlug: 'ski-manufacturers', categoryName: 'Ski', companies: [
    { name: 'Atomic',                   website: 'https://www.atomic.com',         country: 'Austria',       state: 'Salzburg',        city: 'Altenmarkt im Pongau', founded: 1955 },
    { name: 'Rossignol',                website: 'https://www.rossignol.com',      country: 'France',        state: 'Auvergne-Rhône-Alpes', city: 'Saint-Jean-de-Moirans', founded: 1907 },
    { name: 'Salomon',                  website: 'https://www.salomon.com',        country: 'France',        state: 'Auvergne-Rhône-Alpes', city: 'Annecy',     founded: 1947 },
    { name: 'Head Sport',               website: 'https://www.head.com',           country: 'Austria',       state: 'Tyrol',           city: 'Kennelbach',      founded: 1950 },
    { name: 'Fischer Sports',           website: 'https://www.fischersports.com',  country: 'Austria',       state: 'Upper Austria',   city: 'Ried im Innkreis', founded: 1924 },
    { name: 'Volkl',                    website: 'https://www.voelkl.com',         country: 'Germany',       state: 'Bavaria',         city: 'Straubing',       founded: 1923 },
    { name: 'Nordica',                  website: 'https://www.nordica.com',        country: 'Italy',         state: 'Trentino-Alto Adige', city: 'Trevignano',  founded: 1939 },
    { name: 'K2 Skis',                  website: 'https://www.k2skis.com',         country: 'United States', state: 'Washington',      city: 'Seattle',         founded: 1962 },
  ]},
  // 25. End User Computing (EUC) (9)
  { categorySlug: 'end-user-computing', categoryName: 'End User Computing', companies: [
    { name: 'VMware (Omnissa)',         website: 'https://www.omnissa.com',        country: 'United States', state: 'California',      city: 'Palo Alto',       founded: 1998 },
    { name: 'Citrix Systems (Cloud Software Group)', website: 'https://www.citrix.com', country: 'United States', state: 'Florida',  city: 'Fort Lauderdale', founded: 1989 },
    { name: 'Microsoft Azure Virtual Desktop', website: 'https://azure.microsoft.com', country: 'United States', state: 'Washington', city: 'Redmond',        founded: 1975 },
    { name: 'Amazon WorkSpaces',        website: 'https://aws.amazon.com/workspaces', country: 'United States', state: 'Washington', city: 'Seattle',          founded: 2006 },
    { name: 'Nutanix',                  website: 'https://www.nutanix.com',        country: 'United States', state: 'California',      city: 'San Jose',        founded: 2009 },
    { name: 'Parallels (Alludo)',       website: 'https://www.parallels.com',      country: 'United States', state: 'Washington',      city: 'Bellevue',        founded: 1999 },
    { name: 'Workspot',                 website: 'https://www.workspot.com',       country: 'United States', state: 'California',      city: 'Campbell',        founded: 2012 },
    { name: 'Liquidware',               website: 'https://www.liquidware.com',     country: 'United States', state: 'Georgia',         city: 'Alpharetta',      founded: 2009 },
    { name: 'IGEL Technology',          website: 'https://www.igel.com',           country: 'Germany',       state: 'Bremen',          city: 'Bremen',          founded: 2001 },
  ]},
  // 26. Automotive Manufacturing in Italy (5) - reuses slug
  { categorySlug: 'automotive-manufacturing', categoryName: 'Automotive Manufacturing', companies: [
    { name: 'Stellantis Italy (FCA Italy)', website: 'https://www.stellantis.com', country: 'Italy',         state: 'Piedmont',        city: 'Turin',           founded: 1899 },
    { name: 'Ferrari',                  website: 'https://www.ferrari.com',        country: 'Italy',         state: 'Emilia-Romagna',  city: 'Maranello',       founded: 1939 },
    { name: 'Lamborghini',              website: 'https://www.lamborghini.com',    country: 'Italy',         state: 'Emilia-Romagna',  city: 'Sant\'Agata Bolognese', founded: 1963 },
    { name: 'Maserati',                 website: 'https://www.maserati.com',       country: 'Italy',         state: 'Emilia-Romagna',  city: 'Modena',          founded: 1914 },
    { name: 'Iveco Group',              website: 'https://www.iveco.com',          country: 'Italy',         state: 'Piedmont',        city: 'Turin',           founded: 1975 },
  ]},
  // 27. Real Estate Development in Spain (5)
  { categorySlug: 'real-estate-development', categoryName: 'Real Estate Development', companies: [
    { name: 'Metrovacesa',              website: 'https://www.metrovacesa.com',    country: 'Spain',         state: 'Community of Madrid', city: 'Madrid',     founded: 1918 },
    { name: 'Aedas Homes',              website: 'https://www.aedashomes.com',     country: 'Spain',         state: 'Community of Madrid', city: 'Madrid',     founded: 2017 },
    { name: 'Neinor Homes',             website: 'https://www.neinorhomes.com',    country: 'Spain',         state: 'Basque Country',  city: 'Bilbao',          founded: 2015 },
    { name: 'Vía Célere',               website: 'https://www.viacelere.com',      country: 'Spain',         state: 'Community of Madrid', city: 'Madrid',     founded: 2007 },
    { name: 'Inmobiliaria Colonial',    website: 'https://www.inmocolonial.com',   country: 'Spain',         state: 'Community of Madrid', city: 'Madrid',     founded: 1946 },
  ]},
  // 28. Cigar Companies (7)
  { categorySlug: 'cigars', categoryName: 'Cigar', companies: [
    { name: 'Habanos S.A.',             website: 'https://www.habanos.com',        country: 'Cuba',          state: 'Havana',          city: 'Havana',          founded: 1994 },
    { name: 'Altadis USA (Tabacalera USA)', website: 'https://www.altadisusa.com', country: 'United States', state: 'Florida',         city: 'Fort Lauderdale', founded: 1999 },
    { name: 'General Cigar Company',    website: 'https://www.generalcigar.com',   country: 'United States', state: 'Virginia',        city: 'Richmond',        founded: 1906 },
    { name: 'Davidoff of Geneva',       website: 'https://www.davidoff.com',       country: 'Switzerland',   state: 'Basel-Landschaft', city: 'Basel',          founded: 1911 },
    { name: 'Arturo Fuente',            website: 'https://www.arturofuente.com',   country: 'Dominican Republic', state: 'Santiago',   city: 'Santiago',        founded: 1912 },
    { name: 'Padrón Cigars',            website: 'https://www.padron.com',         country: 'United States', state: 'Florida',         city: 'Miami',           founded: 1964 },
    { name: 'Oettinger Davidoff',       website: 'https://www.davidoff.com',       country: 'Switzerland',   state: 'Basel-Landschaft', city: 'Basel',          founded: 1875 },
  ]},
  // 29. Accounting Software in Kenya (9)
  { categorySlug: 'accounting-software', categoryName: 'Accounting Software', companies: [
    { name: 'QuickBooks Kenya (Intuit Reseller)', website: 'https://www.intuit.com', country: 'Kenya',      state: 'Nairobi',         city: 'Nairobi',         founded: 1983 },
    { name: 'Sage East Africa',         website: 'https://www.sage.com',           country: 'Kenya',         state: 'Nairobi',         city: 'Nairobi',         founded: 1981 },
    { name: 'Pastel Kenya (Sage)',      website: 'https://www.sage.com',           country: 'Kenya',         state: 'Nairobi',         city: 'Nairobi',         founded: 1989 },
    { name: 'Xero East Africa Partners', website: 'https://www.xero.com',          country: 'Kenya',         state: 'Nairobi',         city: 'Nairobi',         founded: 2006 },
    { name: 'Tally Solutions Kenya',    website: 'https://www.tallysolutions.com', country: 'Kenya',         state: 'Nairobi',         city: 'Nairobi',         founded: 1986 },
    { name: 'Zoho East Africa',         website: 'https://www.zoho.com',           country: 'Kenya',         state: 'Nairobi',         city: 'Nairobi',         founded: 1996 },
    { name: 'SAP East Africa',          website: 'https://www.sap.com',            country: 'Kenya',         state: 'Nairobi',         city: 'Nairobi',         founded: 1972 },
    { name: 'Odoo Kenya Partners',      website: 'https://www.odoo.com',           country: 'Kenya',         state: 'Nairobi',         city: 'Nairobi',         founded: 2005 },
    { name: 'Wingubox',                 website: 'https://www.wingubox.com',       country: 'Kenya',         state: 'Nairobi',         city: 'Nairobi',         founded: 2014 },
  ]},
  // 30. Pretzels in US (4)
  { categorySlug: 'pretzels', categoryName: 'Pretzel', companies: [
    { name: 'Snyder\'s of Hanover (Campbell\'s)', website: 'https://www.snydersofhanover.com', country: 'United States', state: 'Pennsylvania', city: 'Hanover', founded: 1909 },
    { name: 'Auntie Anne\'s',           website: 'https://www.auntieannes.com',    country: 'United States', state: 'Georgia',         city: 'Atlanta',         founded: 1988 },
    { name: 'Utz Quality Foods',        website: 'https://www.utzsnacks.com',      country: 'United States', state: 'Pennsylvania',    city: 'Hanover',         founded: 1921 },
    { name: 'Herr\'s Foods',            website: 'https://www.herrs.com',          country: 'United States', state: 'Pennsylvania',    city: 'Nottingham',      founded: 1946 },
  ]},
  // 31. Acting Companies in Turkey (8)
  { categorySlug: 'acting', categoryName: 'Acting', companies: [
    { name: 'Şehir Tiyatroları (Istanbul Municipality Theatres)', website: 'https://www.sehirtiyatrolari.ibb.istanbul', country: 'Turkey', state: 'Istanbul', city: 'Istanbul', founded: 1914 },
    { name: 'Devlet Tiyatroları',       website: 'https://www.devtiyatro.gov.tr',  country: 'Turkey',        state: 'Ankara',          city: 'Ankara',          founded: 1949 },
    { name: 'Tiyatro Kumbaracı 50',     website: 'https://www.kumbaraci50.com',    country: 'Turkey',        state: 'Istanbul',         city: 'Istanbul',        founded: 2010 },
    { name: 'DOT Tiyatro',              website: 'https://www.dottiyatro.com',     country: 'Turkey',        state: 'Istanbul',         city: 'Istanbul',        founded: 2005 },
    { name: 'Kenter Tiyatrosu',         website: 'https://www.kentertiyatrosu.com', country: 'Turkey',       state: 'Istanbul',         city: 'Istanbul',        founded: 1968 },
    { name: 'Bakırköy Belediye Tiyatrosu', website: 'https://www.bakirkoy.bel.tr', country: 'Turkey',       state: 'Istanbul',         city: 'Istanbul',        founded: 1990 },
    { name: 'Tiyatrokare',              website: 'https://www.tiyatrokare.com',    country: 'Turkey',        state: 'Istanbul',         city: 'Istanbul',        founded: 1999 },
    { name: 'Trabzon Devlet Tiyatrosu', website: 'https://www.devtiyatro.gov.tr',  country: 'Turkey',        state: 'Trabzon',          city: 'Trabzon',         founded: 2005 },
  ]},
  // 32. MRO Companies (5) - global
  { categorySlug: 'mro', categoryName: 'MRO', companies: [
    { name: 'W. W. Grainger',           website: 'https://www.grainger.com',       country: 'United States', state: 'Illinois',         city: 'Lake Forest',     founded: 1927 },
    { name: 'Fastenal',                 website: 'https://www.fastenal.com',       country: 'United States', state: 'Minnesota',        city: 'Winona',          founded: 1967 },
    { name: 'MSC Industrial Direct',    website: 'https://www.mscdirect.com',      country: 'United States', state: 'New York',         city: 'Melville',        founded: 1941 },
    { name: 'HD Supply (Home Depot)',   website: 'https://www.hdsupply.com',       country: 'United States', state: 'Georgia',          city: 'Atlanta',         founded: 1974 },
    { name: 'RS Group (RS Components)', website: 'https://www.rsgroup.com',        country: 'United Kingdom', state: 'England',         city: 'London',          founded: 1937 },
  ]},
  // 33. Paint Manufacturers in US (10)
  { categorySlug: 'paints', categoryName: 'Paint', companies: [
    { name: 'Sherwin-Williams',         website: 'https://www.sherwin-williams.com', country: 'United States', state: 'Ohio',           city: 'Cleveland',       founded: 1866 },
    { name: 'PPG Industries',           website: 'https://www.ppg.com',            country: 'United States', state: 'Pennsylvania',     city: 'Pittsburgh',      founded: 1883 },
    { name: 'Benjamin Moore',           website: 'https://www.benjaminmoore.com',  country: 'United States', state: 'New Jersey',       city: 'Montvale',        founded: 1883 },
    { name: 'Behr Paint Company',       website: 'https://www.behr.com',           country: 'United States', state: 'California',       city: 'Santa Ana',       founded: 1947 },
    { name: 'Valspar (Sherwin-Williams)', website: 'https://www.valsparpaint.com', country: 'United States', state: 'Minnesota',        city: 'Minneapolis',     founded: 1806 },
    { name: 'Dunn-Edwards',             website: 'https://www.dunnedwards.com',    country: 'United States', state: 'California',       city: 'Los Angeles',     founded: 1925 },
    { name: 'Kelly-Moore Paints',       website: 'https://www.kellymoore.com',     country: 'United States', state: 'California',       city: 'San Carlos',      founded: 1946 },
    { name: 'Glidden (PPG)',            website: 'https://www.glidden.com',        country: 'United States', state: 'Ohio',             city: 'Cleveland',       founded: 1875 },
    { name: 'Rust-Oleum',               website: 'https://www.rustoleum.com',      country: 'United States', state: 'Illinois',         city: 'Vernon Hills',    founded: 1921 },
    { name: 'Diamond Vogel Paints',     website: 'https://www.diamondvogel.com',   country: 'United States', state: 'Iowa',             city: 'Orange City',     founded: 1926 },
  ]},
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

(async () => {
  console.log(COMMIT ? '⚡ COMMIT MODE' : '🔍 DRY RUN');

  // 1) Resolve parents and create new categories
  const parentSlugs = [...new Set(NEW_CATEGORIES.map(c => c.parent))];
  const { data: parentRows, error: pe } = await sb.from('categories').select('id,slug').in('slug', parentSlugs);
  if (pe) throw pe;
  const parentIdBySlug = Object.fromEntries(parentRows.map(r => [r.slug, r.id]));
  for (const ps of parentSlugs) {
    if (!parentIdBySlug[ps]) throw new Error(`parent missing: ${ps}`);
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

  // 2) Resolve all needed category ids
  const allSlugs = [...new Set(DIRECTORIES.map(d => d.categorySlug))];
  const { data: catRows } = await sb.from('categories').select('id,slug').in('slug', allSlugs);
  const catIdBySlug = Object.fromEntries((catRows || []).map(r => [r.slug, r.id]));
  for (const s of allSlugs) {
    if (!catIdBySlug[s] && !COMMIT) catIdBySlug[s] = '<new>';
  }

  // 3) Insert companies + links (idempotent on slug)
  let stats = { created: 0, existing: 0, linked: 0, alreadyLinked: 0, slugClash: 0 };

  for (const dir of DIRECTORIES) {
    console.log(`\n▸ ${dir.categorySlug} (${dir.companies.length})`);
    const catId = catIdBySlug[dir.categorySlug];

    for (const co of dir.companies) {
      let slug = slugify(co.name);
      let agencyId = null;

      const { data: existing } = await sb.from('agencies').select('id,name,hq_country').eq('slug', slug).maybeSingle();
      if (existing) {
        if (existing.name === co.name && existing.hq_country === co.country) {
          agencyId = existing.id;
          stats.existing++;
          console.log(`    · exists: ${co.name}`);
        } else {
          slug = slugify(co.name + ' ' + co.country);
          stats.slugClash++;
          console.log(`    ⚠ slug clash, using ${slug}`);
        }
      }

      if (!agencyId) {
        const row = {
          name: co.name,
          slug,
          description: `${co.name} is a leading ${dir.categoryName} company based in ${co.city ? co.city + ', ' : ''}${co.country}. They serve clients across the region with proven expertise in ${dir.categoryName.toLowerCase()}.`,
          website: co.website,
          logo_url: null,
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
            // probably a slug clash from a different category — fall back with country suffix
            if (error.code === '23505') {
              row.slug = slugify(co.name + ' ' + co.country);
              const { data: ins2, error: e2 } = await sb.from('agencies').insert(row).select('id').single();
              if (e2) { console.log(`    ✗ retry failed: ${co.name} — ${e2.message}`); continue; }
              agencyId = ins2.id;
              stats.created++;
              console.log(`    ✓ created (retry): ${co.name}`);
            } else {
              console.log(`    ✗ insert failed: ${co.name} — ${error.message}`);
              continue;
            }
          } else {
            agencyId = ins.id;
            stats.created++;
            console.log(`    ✓ created: ${co.name}`);
          }
        } else {
          console.log(`    + would create: ${co.name} (${slug})`);
        }
      }

      if (COMMIT && agencyId && catId !== '<new>') {
        const { data: existingLink } = await sb.from('agency_categories').select('id').eq('agency_id', agencyId).eq('category_id', catId).maybeSingle();
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
  console.log(`  slug-clash retries : ${stats.slugClash}`);
  console.log(COMMIT ? '\nDone.' : '\nDry run only — re-run with --commit to write.');
})();
