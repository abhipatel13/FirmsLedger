const EQUIPMENT = /equipment|machiner|restaurant supply|supplies|conveyor/i;

export const SEO_OVERRIDES = {
  '/states/texas': {
    label: 'Manufacturers in Texas',
    title: 'Manufacturers in Texas: {N} Companies by Industry',
    h1: 'Manufacturers in Texas',
    meta_description: 'Browse {N} Texas manufacturers by industry and city, from plastics and food processing to auto parts. Free contact details, no sign-up.',
    intro_md: [
      'FirmsLedger lists {N} manufacturers headquartered in Texas, grouped by what they make: {categoryLinks}.',
      'Most are based in {cities}. Every company profile shows its city, website and phone number for free, with no sign-up and no paid placements, so you contact the manufacturer directly.',
      'Each industry card above shows its first three companies and links to the full Texas list for that industry.',
    ],
    faqs: [
      { q: 'Which industries have the most manufacturers in Texas?', a: 'On FirmsLedger, the largest Texas industries are {topCategories}.' },
      { q: 'Which Texas cities have the most manufacturers?', a: 'The cities with the most listed Texas manufacturers are {cities}.' },
      { q: 'How do I contact a Texas manufacturer directly?', a: 'Open any company profile from the lists on this page to see its website and phone number. FirmsLedger shows contact details for free, without a login, and you deal with the company directly.' },
    ],
  },
  '/plastics-packaging/texas': {
    label: 'Plastic manufacturers in Texas',
    title: '{N} Plastic Manufacturers in Texas (2026)',
    h1: 'Plastic Manufacturers in Texas',
    meta_description: 'Compare {N} Texas plastic manufacturers: injection molding, extrusion, packaging and more. See city, specialty and direct contact details.',
    intro_md: [
      'Texas is the largest plastics-producing state in the US: its plastics manufacturers shipped $61.5 billion of goods in 2024 across 840 facilities, according to the American Chemistry Council ([BIC Magazine](https://www.bicmagazine.com/industry/refining-petrochem/texas-plastics-industry-sets-pace-with-61-5-billion)).',
      ['FirmsLedger lists {N} plastic and packaging manufacturers headquartered in Texas.', 'The biggest clusters are in {cities}.'],
      ['By process, the Texas list includes {subcategoryLinks}.', 'Specialties that come up most in these listings are {specialties}.'],
      'The list above shows every company with its city, specialty, phone number and website. No company pays to appear or to rank higher.',
    ],
    faqs: [
      { q: 'What kinds of plastic manufacturing happen in Texas?', a: ['The Texas companies listed here cover {subcategoryNames}.', 'The most common specialties in their listings are {specialties}.'] },
      { q: 'Where are most Texas plastic manufacturers located?', a: 'Most of the {N} listed Texas plastic manufacturers are in {cities}.' },
      { q: 'How do I find an injection molder in Texas?', a: 'See the [injection molding companies in Texas](/plastics-packaging/injection-molding/texas) list, which compares {n_injection_molding} Texas molders by city and specialty.' },
    ],
  },
  '/plastics-packaging/injection-molding/texas': {
    label: 'Injection molding companies in Texas',
    title: '{N} Injection Molding Companies in Texas',
    h1: 'Injection Molding Companies in Texas',
    meta_description: '{N} Texas injection molders, compared by city and specialty: custom molding, medical, automotive and more. Contact each company directly.',
    keywords: { medical: /medical/i, automotive: /automotive|vehicle/i },
    intro_md: [
      ['FirmsLedger lists {N} injection molding companies headquartered in Texas.', 'Most are in {cities}.'],
      ['Specialties that come up most often in these listings are {specialties}.', 'Certifications they list include {certs}.'],
      ['Listings that mention medical work include {kw_medical}.', 'Listings that mention automotive work include {kw_automotive}.'],
      'This list is part of [all plastic manufacturers in Texas](/plastics-packaging/texas). Compare the molders above and contact them directly; FirmsLedger does not charge for quotes or take a cut.',
    ],
    faqs: [
      { q: 'How many injection molding companies are in Texas?', a: ['FirmsLedger lists {N} injection molding companies headquartered in Texas.', 'Most are in {cities}.'] },
      { q: 'Which Texas molders handle medical or automotive parts?', a: ['Listings that mention medical work: {kw_medical}.', 'Listings that mention automotive work: {kw_automotive}.'] },
      { q: 'What should I send a molder to get a quote?', a: 'Send a 3D CAD file (STEP or IGES) and a 2D drawing with tolerances, the resin or material grade, annual volume, and whether you need a new mold or will supply one. Most molders quote tooling and per-part cost separately.' },
    ],
  },
  '/food-beverage-processing/texas': {
    label: 'Food manufacturers in Texas',
    title: '{N} Food Manufacturers in Texas (2026)',
    h1: 'Food & Beverage Manufacturers in Texas',
    meta_description: '{N} Texas food and beverage manufacturers by city and product: snacks, meat, beverages, co-packing. Free contact details for each company.',
    keywords: { copack: /co-?pack|private.label/i, meat: { match: /meat|jerky|sausage|beef|poultry/i, exclude: EQUIPMENT }, beverage: { match: /beverage|brew|drink|juice|coffee|tea\b/i, exclude: EQUIPMENT }, equipment: EQUIPMENT },
    intro_md: [
      ['FirmsLedger lists {N} food and beverage companies headquartered in Texas.', 'They are concentrated in {cities}.'],
      ['Listings that mention meat products include {kw_meat}.', 'Listings that mention beverages include {kw_beverage}.', 'The list also includes processing-equipment and supply companies such as {kw_equipment}.'],
      'Co-packers and private-label makers in this list include {kw_copack}. Compare them above and contact each company directly.',
    ],
    faqs: [
      { q: 'Which Texas food manufacturers offer co-packing or private label?', a: 'Listings that mention co-packing or private label include {kw_copack}.' },
      { q: 'Which cities have the most food manufacturers in Texas?', a: 'Most of the listed Texas food and beverage companies are in {cities}.' },
      { q: 'What should I ask a co-packer first?', a: 'Ask for their minimum run size, their food-safety certification (for example SQF or BRCGS) and FDA facility registration, which allergens they handle, their lead time, and whether you supply ingredients and packaging or they source them.' },
    ],
  },
  '/automotive-parts/texas': {
    label: 'Auto parts manufacturers in Texas',
    title: '{N} Auto Parts Manufacturers in Texas',
    h1: 'Automotive Parts Manufacturers in Texas',
    meta_description: '{N} Texas automotive parts manufacturers and suppliers, compared by city and part type. Direct contact details, free to browse.',
    keywords: { trailer: /trailer/i, aftermarket: /aftermarket|performance|restoration|accessor/i, oem: /\boem\b|tier 1|original equipment/i },
    intro_md: [
      ['FirmsLedger lists {N} automotive parts manufacturers and suppliers headquartered in Texas.', 'Most are in {cities}.'],
      ['Part types and services in these listings include {specialties}.', 'Listings that mention trailers include {kw_trailer}.', 'Listings that mention aftermarket or performance parts include {kw_aftermarket}.', 'Listings that mention OEM or Tier 1 work include {kw_oem}.'],
      'Compare every company above by city and specialty, then contact them directly.',
    ],
    faqs: [
      { q: 'What auto parts are made in Texas?', a: ['The Texas companies listed here make or supply {specialties}.', 'Listings that mention trailers include {kw_trailer}.'] },
      { q: 'Which Texas suppliers serve OEMs vs aftermarket?', a: ['Listings that mention OEM or Tier 1 work: {kw_oem}.', 'Listings that mention aftermarket or performance parts: {kw_aftermarket}.'] },
      { q: 'Where are Texas auto parts makers clustered?', a: 'Most of the {N} listed Texas automotive parts companies are in {cities}.' },
    ],
  },
  '/furniture-woodworking/texas': {
    label: 'Furniture manufacturers in Texas',
    title: '{N} Furniture Manufacturers in Texas (2026)',
    h1: 'Furniture Manufacturers & Woodworkers in Texas',
    meta_description: '{N} Texas furniture makers and woodworking shops: custom, commercial, cabinetry and millwork. Compare by city and contact directly.',
    keywords: { commercial: /commercial|contract|hospitality|office/i, custom: /custom|handcraft|handmade|bespoke/i, cabinet: /cabinet|millwork/i },
    intro_md: [
      ['FirmsLedger lists {N} furniture makers and woodworking shops headquartered in Texas.', 'Most are in {cities}.'],
      ['Listings that mention commercial, contract or hospitality work include {kw_commercial}.', 'Listings that mention custom or handcrafted pieces include {kw_custom}.', 'Listings that mention cabinetry or millwork include {kw_cabinet}.'],
      'Compare them above and contact each shop directly.',
    ],
    faqs: [
      { q: 'Which Texas furniture makers do commercial or contract work?', a: 'Listings that mention commercial, contract or hospitality work include {kw_commercial}.' },
      { q: 'Which Texas furniture makers build custom residential pieces?', a: 'Listings that mention custom or handcrafted furniture include {kw_custom}.' },
      { q: 'Which Texas cities have the most furniture makers?', a: 'Most of the listed Texas furniture makers and woodworkers are in {cities}.' },
    ],
  },
  '/food-beverage-processing/louisiana': {
    label: 'Food manufacturers in Louisiana',
    title: '{N} Food Manufacturers in Louisiana',
    h1: 'Food Manufacturers in Louisiana',
    meta_description: '{N} Louisiana food and beverage manufacturers, from seafood and sauces to beverages. Compare by city and contact each company directly.',
    keywords: { seafood: { match: /seafood|shrimp|crawfish|oyster|\bfish/i, exclude: EQUIPMENT }, sauce: { match: /sauce|season|spice|cajun|creole/i, exclude: EQUIPMENT }, rice: { match: /\brice\b/i, exclude: EQUIPMENT }, beverage: { match: /beverage|coffee|brew|drink|juice/i, exclude: EQUIPMENT }, copack: /co-?pack|private.label/i, equipment: EQUIPMENT },
    intro_md: [
      ['FirmsLedger lists {N} food and beverage companies headquartered in Louisiana.', 'Most are in {cities}.'],
      ['Listings that mention seafood include {kw_seafood}.', 'Listings that mention sauces, seasonings or spices include {kw_sauce}.', 'Listings that mention rice include {kw_rice}.', 'Listings that mention beverages include {kw_beverage}.'],
      ['The list also includes processing-equipment and supply companies such as {kw_equipment}.', 'Compare every company above and contact them directly.'],
    ],
    faqs: [
      { q: 'What foods are manufactured in Louisiana?', a: ['Listings that mention seafood: {kw_seafood}.', 'Sauces and seasonings: {kw_sauce}.', 'Rice: {kw_rice}.', 'Beverages: {kw_beverage}.'] },
      { q: 'Which Louisiana companies offer co-packing?', a: 'Listings that mention co-packing or private label include {kw_copack}.' },
      { q: 'Where are most Louisiana food manufacturers?', a: 'Most of the {N} listed Louisiana food and beverage companies are in {cities}.' },
    ],
  },
  '/medical-devices/minnesota': {
    label: 'Medical device companies in Minnesota',
    title: '{N} Medical Device Companies in Minnesota',
    h1: 'Medical Device Manufacturers in Minnesota',
    meta_description: '{N} Minnesota medical device manufacturers and contract makers, by city and device type. Compare and contact each company directly.',
    keywords: { contract: /contract manufactur|\bcmo\b|\bcdmo\b|outsourc/i, iso13485: /13485/ },
    intro_md: [
      ['FirmsLedger lists {N} medical device manufacturers headquartered in Minnesota, the core of the Twin Cities medtech cluster.', 'Most are in {cities}.'],
      ['Listings that mention contract or outsourced manufacturing include {kw_contract}.', 'Listings that mention ISO 13485 include {kw_iso13485}.'],
      'Compare every company above by city and specialty, then contact them directly.',
    ],
    faqs: [
      { q: 'Which Minnesota companies offer contract medical device manufacturing?', a: 'Listings that mention contract or outsourced manufacturing include {kw_contract}.' },
      { q: 'Which Minnesota cities have the most medtech companies?', a: 'Most of the {N} listed Minnesota medical device companies are in {cities}.' },
      { q: 'Which Minnesota medical device firms are ISO 13485 certified?', a: 'Companies whose listings mention ISO 13485 include {kw_iso13485}. Confirm current certification with the company before you order.' },
    ],
  },
  '/electronics-semiconductor/california': {
    label: 'Electronics manufacturers in California',
    title: '{N} Electronics Manufacturers in California',
    h1: 'Electronics Manufacturers in California',
    meta_description: '{N} California electronics manufacturers: PCB assembly, components, semiconductors. Compare by city and specialty, with direct contacts.',
    keywords: { pcb: /\bpcb|circuit board|surface mount|\bsmt\b/i, semi: /semiconductor|wafer|\bchip/i },
    regions: {
      bay: ['san jose', 'santa clara', 'sunnyvale', 'fremont', 'milpitas', 'san francisco', 'oakland', 'hayward', 'mountain view', 'palo alto', 'redwood city', 'san mateo', 'union city', 'newark', 'livermore', 'pleasanton', 'menlo park', 'south san francisco', 'campbell', 'los gatos', 'morgan hill', 'gilroy', 'berkeley', 'richmond', 'concord', 'san leandro', 'san carlos', 'burlingame', 'dublin', 'cupertino', 'scotts valley', 'santa cruz', 'petaluma', 'santa rosa'],
      socal: ['los angeles', 'san diego', 'irvine', 'anaheim', 'santa ana', 'orange', 'garden grove', 'torrance', 'carlsbad', 'temecula', 'riverside', 'ontario', 'chatsworth', 'valencia', 'santa clarita', 'simi valley', 'camarillo', 'oxnard', 'ventura', 'thousand oaks', 'gardena', 'long beach', 'huntington beach', 'fullerton', 'brea', 'costa mesa', 'newport beach', 'tustin', 'lake forest', 'mission viejo', 'poway', 'escondido', 'oceanside', 'vista', 'san marcos', 'el cajon', 'chula vista', 'rancho cucamonga', 'fontana', 'corona', 'pomona', 'city of industry', 'el segundo', 'hawthorne', 'burbank', 'glendale', 'pasadena', 'sylmar', 'van nuys', 'cerritos', 'cypress', 'buena park', 'santa fe springs', 'whittier', 'carson', 'rancho santa margarita', 'aliso viejo', 'laguna hills', 'westlake village', 'moorpark', 'murrieta'],
    },
    intro_md: [
      'California is the #1 state for electronics manufacturing in the US, according to [IPC](https://www.electronics.org/blog/icymi-electronics-manufacturing-huge-california).',
      ['FirmsLedger lists {N} electronics and semiconductor manufacturers headquartered there: {region_bay} in the Bay Area and {region_socal} in Southern California.', 'The biggest single clusters are {cities}.'],
      ['Listings that mention PCB or surface-mount assembly include {kw_pcb}.', 'Listings that mention semiconductors include {kw_semi}.'],
      'Compare all of them above by city and specialty, then contact them directly.',
    ],
    faqs: [
      { q: 'Which California companies do PCB assembly?', a: 'Listings that mention PCB or surface-mount assembly include {kw_pcb}.' },
      { q: 'Bay Area or Southern California: where are most electronics makers?', a: ['Of the {N} California electronics manufacturers listed here, {region_bay} are in the Bay Area and {region_socal} are in Southern California.', 'The largest cities are {cities}.'] },
      { q: 'How do I pick a contract electronics manufacturer?', a: 'Check that they build to IPC-A-610 at the class you need, ask for SMT line capacity and typical lot sizes, confirm how they source and trace components, and ask what testing they run (AOI, X-ray, functional). Then compare quotes from two or three shops listed above.' },
    ],
  },
  '/metal-fabrication/california': {
    label: 'Metal fabrication companies in California',
    title: '{N} Metal Fabrication Companies in California',
    h1: 'Metal Fabrication Companies in California',
    meta_description: '{N} California metal fabricators: sheet metal, welding, CNC and structural steel. Compare by city and capability and contact directly.',
    keywords: { sheet: /sheet metal/i, structural: /structural|steel erect|\bbeams?\b/i, cnc: /\bcnc\b|machin/i, welding: /weld/i },
    intro_md: [
      ['FirmsLedger lists {N} metal fabrication and machining companies headquartered in California.', 'Most are in {cities}.'],
      ['Listings that mention sheet metal include {kw_sheet}.', 'Listings that mention structural steel include {kw_structural}.', 'Listings that mention CNC machining include {kw_cnc}.', 'Listings that mention welding include {kw_welding}.'],
      'Compare every shop above by city and specialty, then contact them directly.',
    ],
    faqs: [
      { q: 'Which California fabricators do sheet metal vs structural steel?', a: ['Sheet metal: {kw_sheet}.', 'Structural steel: {kw_structural}.'] },
      { q: 'Which California cities have the most metal fabricators?', a: 'Most of the {N} listed California metal fabrication companies are in {cities}.' },
      { q: 'What files do fabricators need for a quote?', a: 'Send a STEP or DXF file with a dimensioned PDF drawing, the material and thickness, the finish (for example powder coat or galvanizing), quantity and delivery date. For structural work, include stamped engineering drawings and any AWS welding requirements.' },
    ],
  },
};

export const TARGET_PAGES = Object.entries(SEO_OVERRIDES).map(([path, o]) => ({ path, label: o.label }));

export const joinList = (items) =>
  items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

export const stripLinks = (text) => text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

const LINK_HOSTS = new Set(['www.bicmagazine.com', 'www.electronics.org']);

export const safeHref = (href) => {
  if (/^\/(?!\/)/.test(href)) return href;
  try {
    const url = new URL(href);
    return url.protocol === 'https:' && LINK_HOSTS.has(url.hostname) ? href : null;
  } catch {
    return null;
  }
};

export const noLinks = (s) => String(s ?? '').replace(/[[\]]/g, '');
const plain = noLinks;

export function fillPlaceholders(text, vars) {
  let missing = false;
  const out = text.replace(/\{(\w+)\}/g, (_, key) => {
    const v = vars[key];
    if (v === undefined || v === null || v === '') missing = true;
    return missing ? '' : String(v);
  });
  return missing ? null : out;
}

export function fillAll(parts, vars) {
  const filled = [].concat(parts).map((p) => fillPlaceholders(p, vars)).filter(Boolean);
  return filled.length ? filled.join(' ').replace(/\.\.(?=\s|$)/g, '.') : null;
}

export function resolveOverride(override, vars) {
  if (!override) return null;
  return {
    title: fillAll(override.title, vars),
    h1: fillAll(override.h1, vars),
    description: fillAll(override.meta_description, vars),
    intro: (override.intro_md || []).map((p) => fillAll(p, vars)).filter(Boolean),
    faqs: (override.faqs || []).map((f) => ({ q: fillAll(f.q, vars), a: fillAll(f.a, vars) })).filter((f) => f.q && f.a),
  };
}

const topCities = (cities) => {
  const multi = cities.filter((c) => c.count >= 2);
  return (multi.length >= 2 ? multi : cities).slice(0, 4);
};

const haystack = (c) =>
  [c.name, c.description, ...(c.capabilities || []), ...(c.products || []), ...(c.certifications || [])].join(' ');

export function listingVars({ facts, companies = [], stateName, stateSlug, override = {}, cat, subCounts = {} }) {
  const vars = {
    N: facts.count,
    state: stateName,
    cities: joinList(topCities(facts.cities).map((c) => `${plain(c.name)} (${c.count})`)),
    topCity: plain(facts.cities[0]?.name),
    specialties: joinList(facts.specialties.slice(0, 4).map((s) => plain(s.name).toLowerCase())),
    certs: joinList(facts.certifications.slice(0, 3).map((c) => plain(c.name))),
    withWebsite: facts.withWebsite,
  };
  for (const [key, rule] of Object.entries(override.keywords || {})) {
    const { match, exclude } = rule instanceof RegExp ? { match: rule } : rule;
    vars[`kw_${key}`] = joinList(companies.filter((c) => match.test(haystack(c)) && !exclude?.test(haystack(c))).slice(0, 5).map((c) => plain(c.name)));
  }
  for (const [key, cities] of Object.entries(override.regions || {})) {
    const set = new Set(cities);
    vars[`region_${key}`] = companies.filter((c) => set.has(String(c.hq_city || '').trim().toLowerCase())).length;
  }
  const subs = (cat?.subcategories || []).filter((s) => (subCounts[s.slug] || 0) >= 5);
  for (const s of cat?.subcategories || []) vars[`n_${s.slug.replace(/-/g, '_')}`] = subCounts[s.slug] || null;
  vars.subcategoryLinks = joinList(subs.map((s) => `[${s.name.toLowerCase()} in ${stateName}](/${cat.slug}/${s.slug}/${stateSlug}) (${subCounts[s.slug]})`));
  vars.subcategoryNames = joinList(subs.map((s) => s.name.toLowerCase()));
  return vars;
}

export function stateHubVars({ stateName, stateSlug, totalCount, topCities = [], topCategories = [], categories = [] }) {
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const listed = topCategories.filter((t) => bySlug.has(t.slug) && t.count >= 5);
  return {
    N: totalCount,
    state: stateName,
    cities: joinList(topCities.slice(0, 5).map((c) => `${plain(c.city)} (${c.count})`)),
    topCategories: joinList(listed.slice(0, 3).map((t) => `${bySlug.get(t.slug).titleNoun.toLowerCase()} (${t.count})`)),
    categoryLinks: joinList(listed.map((t) => `[${bySlug.get(t.slug).titleNoun.toLowerCase()} in ${stateName}](/${t.slug}/${stateSlug}) (${t.count})`)),
  };
}
