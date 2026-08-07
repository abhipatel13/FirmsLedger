/**
 * SEO copy generation utility for FirmsLedger.
 * Provides deterministic, data-driven, domain-specific meta descriptions,
 * above-the-fold copy, on-page descriptions, FAQs, and regional state links.
 */

export const CATEGORY_DOMAINS = {
  'electrical-components': {
    products: 'wiring systems, power distribution transformers, switchgear assemblies, control panels, and custom relays',
    focus: 'stringent UL, NEC, and IEC compliance',
    certifications: 'UL, CE, and ISO 9001 certifications',
    procurement: 'critical voltage ratings and lead times'
  },
  'mechanical-components': {
    products: 'CNC-machined parts, high-tolerance gears, bearings, precision shafts, custom springs, and mechanical subassemblies',
    focus: 'micron-level tolerances and contract capacity',
    certifications: 'ISO 9001 and AS9100 aerospace quality standards',
    procurement: 'material traceability and prototype-to-volume scalability'
  },
  'plastics-packaging': {
    products: 'injection-molded plastics, blow-molded containers, extruded profiles, thermoformed trays, and flexible packaging',
    focus: 'material grade specifications and high-speed tooling efficiency',
    certifications: 'FDA food-contact compliance and ISO 13485 medical device standards',
    procurement: 'tooling costs and production cycle times'
  },
  'metal-fabrication': {
    products: 'laser and waterjet cut parts, precision sheet metal shapes, structural steel components, aluminum assemblies, and powder-coated finishes',
    focus: 'dimensional accuracy, weld strength, and protective coatings',
    certifications: 'AWS welding certs and ISO 9001 quality systems',
    procurement: 'project turnaround and material grades'
  },
  'electronics-semiconductor': {
    products: 'printed circuit board assemblies (PCBA), SMT and cable harnesses, power converters, industrial electronics, and semiconductor packaging',
    focus: 'signal integrity, thermal management, and reliable component sourcing',
    certifications: 'IPC-A-610 class 2/3 and ISO 9001 standard compliance',
    procurement: 'supply chain transparency and surface-mount technology capabilities'
  },
  'automotive-parts': {
    products: 'OEM engine parts, brake assemblies, steering linkages, suspension kits, transmission units, and EV battery harnesses',
    focus: 'rigorous vehicle fit/form/function, durability testing, and Tier 1 supply integration',
    certifications: 'IATF 16949 automotive standards and ISO 9001',
    procurement: 'just-in-time logistics and OEM design specs'
  },
  'textile-apparel': {
    products: 'woven fabrics, technical performance textiles, customized sportswear, protective workwear, uniforms, and knit garments',
    focus: 'fabric tensile strength, colorfastness, and eco-friendly manufacturing',
    certifications: 'Oeko-Tex certification and ISO 9001 systems',
    procurement: 'minimum order quantities (MOQ) and dye lot consistency'
  },
  'furniture-woodworking': {
    products: 'office workstations, custom cabinetry, residential furniture, architectural millwork, wooden doors, and MDF board products',
    focus: 'premium material grading, custom carpentry detailing, and durable finishes',
    certifications: 'FSC wood sourcing certifications and ISO 9001 compliance',
    procurement: 'customization lead times and wood grade specs'
  },
  'food-beverage-processing': {
    products: 'stainless steel processing vessels, sanitizing conveyors, high-speed filling machines, capping heads, and packaging systems',
    focus: 'sanitary design, CIP (clean-in-place) functionality, and high-throughput reliability',
    certifications: '3-A Sanitary Standards, USDA approval, and FDA compliance',
    procurement: 'washdown durability and equipment footprint'
  },
  'medical-devices': {
    products: 'surgical instruments, diagnostic monitors, lab test machinery, sterile medical packaging, and implantable orthopedic hardware',
    focus: 'strict biocompatibility, risk mitigation, and zero-defect quality controls',
    certifications: 'FDA 510(k) clearances and ISO 13485 medical device quality systems',
    procurement: 'cleanroom assembly environments and process validation'
  }
};

const CENSUS_REGIONS = {
  northeast: ['new-york', 'pennsylvania', 'new-jersey', 'massachusetts', 'connecticut', 'maryland', 'maine', 'new-hampshire', 'vermont', 'rhode-island', 'delaware'],
  midwest: ['illinois', 'ohio', 'michigan', 'wisconsin', 'indiana', 'minnesota', 'missouri', 'iowa', 'kansas', 'nebraska', 'south-dakota', 'north-dakota'],
  south: ['texas', 'florida', 'georgia', 'north-carolina', 'virginia', 'tennessee', 'alabama', 'kentucky', 'south-carolina', 'louisiana', 'oklahoma', 'mississippi', 'arkansas', 'west-virginia'],
  west: ['california', 'washington', 'colorado', 'arizona', 'oregon', 'utah', 'nevada', 'new-mexico', 'idaho', 'hawaii', 'montana', 'alaska', 'wyoming']
};

const STATE_NAME_MAP = {
  'alabama': 'Alabama', 'alaska': 'Alaska', 'arizona': 'Arizona', 'arkansas': 'Arkansas',
  'california': 'California', 'colorado': 'Colorado', 'connecticut': 'Connecticut',
  'delaware': 'Delaware', 'florida': 'Florida', 'georgia': 'Georgia', 'hawaii': 'Hawaii',
  'idaho': 'Idaho', 'illinois': 'Illinois', 'indiana': 'Indiana', 'iowa': 'Iowa',
  'kansas': 'Kansas', 'kentucky': 'Kentucky', 'louisiana': 'Louisiana', 'maine': 'Maine',
  'maryland': 'Maryland', 'massachusetts': 'Massachusetts', 'michigan': 'Michigan',
  'minnesota': 'Minnesota', 'mississippi': 'Mississippi', 'missouri': 'Missouri',
  'montana': 'Montana', 'nebraska': 'Nebraska', 'nevada': 'Nevada', 'new-hampshire': 'New Hampshire',
  'new-jersey': 'New Jersey', 'new-mexico': 'New Mexico', 'new-york': 'New York',
  'north-carolina': 'North Carolina', 'north-dakota': 'North Dakota', 'ohio': 'Ohio',
  'oklahoma': 'Oklahoma', 'oregon': 'Oregon', 'pennsylvania': 'Pennsylvania',
  'rhode-island': 'Rhode Island', 'south-carolina': 'South Carolina', 'south-dakota': 'South Dakota',
  'tennessee': 'Tennessee', 'texas': 'Texas', 'utah': 'Utah', 'vermont': 'Vermont',
  'virginia': 'Virginia', 'washington': 'Washington', 'west-virginia': 'West Virginia',
  'wisconsin': 'Wisconsin', 'wyoming': 'Wyoming'
};

/** Deterministic hash for templates */
function getDeterministicIndex(seed, max) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % max;
}

/** Generates meta description: target 120-160 characters */
export function generateDynamicCategoryStateMetaDescription({ categorySlug, categoryName, stateSlug, stateName, totalCount }) {
  const domain = CATEGORY_DOMAINS[categorySlug] || { products: 'manufacturing services' };
  const cleanCat = categoryName.replace(' Manufacturers', '').replace(' & Machining', '');
  
  const hashSeed = `${categorySlug}-${stateSlug}`;
  const templateIdx = getDeterministicIndex(hashSeed, 3);

  let desc = '';
  if (templateIdx === 0) {
    desc = `Compare ${totalCount} verified ${cleanCat.toLowerCase()} manufacturers in ${stateName}. Explore capabilities, certifications, and local facilities.`;
  } else if (templateIdx === 1) {
    desc = `Find top ${cleanCat.toLowerCase()} shops in ${stateName}. Review ${totalCount} suppliers for ${domain.products.split(', ').slice(0, 2).join(' and ')}.`;
  } else {
    desc = `Source from ${totalCount} ${cleanCat.toLowerCase()} firms in ${stateName}. Compare verified reviews, specialized products, and local capacities.`;
  }

  // Ensure it fits the 120-160 character limit. If over, truncate gracefully.
  if (desc.length > 160) {
    desc = desc.substring(0, 157) + '...';
  } else if (desc.length < 120) {
    // Pad to meet minimum SEO depth
    desc += ' No paid placements.';
  }
  return desc.substring(0, 160);
}

/** Generates dynamic above-fold copy: target ~120-160 characters */
export function generateDynamicCategoryStateAboveFoldText({ categorySlug, categoryName, stateSlug, stateName, totalCount }) {
  const domain = CATEGORY_DOMAINS[categorySlug] || { products: 'manufacturing services' };
  const cleanCat = categoryName.replace(' Manufacturers', '').replace(' & Machining', '');
  
  const hashSeed = `${stateSlug}-${categorySlug}`;
  const templateIdx = getDeterministicIndex(hashSeed, 3);

  if (templateIdx === 0) {
    return `Directory of ${totalCount} audited ${cleanCat.toLowerCase()} facilities in ${stateName} providing ${domain.products.split(', ').slice(0, 3).join(', ')}.`;
  } else if (templateIdx === 1) {
    return `Browse ${totalCount} top-rated ${cleanCat.toLowerCase()} companies in ${stateName} specialized in ${domain.products.split(', ').slice(0, 2).join(' and ')}.`;
  } else {
    return `Connect with ${totalCount} verified local ${cleanCat.toLowerCase()} suppliers across ${stateName}. Compare capabilities, certifications, and response times.`;
  }
}

/** Generates dynamic bottom-page description: target ~40-60 words (250-350 characters) */
export function generateDynamicCategoryStateOnPageText({ categorySlug, categoryName, stateSlug, stateName, totalCount, verifiedCount, medianRating, topSpecialties = [], subcategories = [] }) {
  const domain = CATEGORY_DOMAINS[categorySlug] || { products: 'manufacturing services', focus: 'high-quality standards', certifications: 'key compliance standards', procurement: 'specifications' };
  const cleanCat = categoryName.replace(' Manufacturers', '').replace(' & Machining', '');
  
  const hashSeed = `${categorySlug}-${stateSlug}-page`;
  const idx = getDeterministicIndex(hashSeed, 4);

  const statsPart = verifiedCount > 0 && medianRating 
    ? `Currently, ${verifiedCount} of these firms have completed our verification audit, boasting a median rating of ${medianRating} out of 5 stars.`
    : `Every local listing is manually audited to confirm operating status, location, and key capabilities.`;

  const specPart = topSpecialties.length > 0
    ? ` Local shops frequently hold ${topSpecialties.join(' or ')} certifications to meet strict engineering requirements.`
    : ` Buyers typically evaluate these facilities on their ${domain.certifications} and lead times.`;

  const subList = subcategories.length > 0
    ? subcategories.slice(0, 2).map(s => s.name).join(' and ')
    : 'specialty services';

  const paragraphs = [
    `Sourcing ${domain.products} in ${stateName} requires vetting local partners on their ability to meet ${domain.focus}. ${statsPart}${specPart} Contact listed shops directly for custom ${subList} projects.`,
    `${stateName} supports a strong base of ${totalCount} ${cleanCat.toLowerCase()} suppliers equipped for both custom runs and high-volume delivery. ${statsPart} Sourcing teams prioritize these companies for their focus on ${domain.procurement}.${specPart}`,
    `For engineering teams procuring ${domain.products} within ${stateName}, finding a supplier certified to ${domain.certifications} is critical. This directory lists ${totalCount} local options. ${statsPart} Select partners based on verified ${subList} capacity.`,
    `This directory profiles ${totalCount} certified ${cleanCat.toLowerCase()} shops in ${stateName} to support local supply chain resilience. Suppliers here excel in ${domain.products}. ${statsPart}${specPart} Compare profiles to find the right partner.`
  ];

  return paragraphs[idx];
}

/** Generates FAQ Q&A content */
export function generateCategoryStateFAQs({ categorySlug, categoryName, stateSlug, stateName, totalCount, verifiedCount, medianRating, topSpecialties }) {
  const domain = CATEGORY_DOMAINS[categorySlug] || { products: 'manufacturing services', focus: 'industry standards', certifications: 'industry standards' };
  const cleanCat = categoryName.replace(' Manufacturers', '').replace(' & Machining', '');

  const list = [
    {
      q: `How do I find verified ${cleanCat.toLowerCase()} manufacturers in ${stateName}?`,
      a: `FirmsLedger lists ${totalCount} local ${cleanCat.toLowerCase()} suppliers in ${stateName}. You can identify top-rated options by looking for the "Verified" badge, which indicates the company has passed our manual credentials and operations verification.`
    },
    {
      q: `What certifications should I look for in ${stateName} ${cleanCat.toLowerCase()} shops?`,
      a: `Depending on your industry, look for facilities holding ${topSpecialties.length > 0 ? topSpecialties.join(' or ') : domain.certifications}. These standards ensure the supplier meets strict quality management and process controls for producing ${domain.products}.`
    }
  ];

  if (verifiedCount > 0 && medianRating) {
    list.push({
      q: `What is the average rating of ${cleanCat.toLowerCase()} companies in ${stateName}?`,
      a: `Verified suppliers in the state maintain a strong median rating of ${medianRating} out of 5 stars. Ratings are aggregated from verified client reviews across verified project scopes.`
    });
  }

  return list;
}

/** US Census-based regional neighboring states mapping */
export function getNeighboringStates(stateSlug) {
  let regionKey = null;
  for (const [key, states] of Object.entries(CENSUS_REGIONS)) {
    if (states.includes(stateSlug)) {
      regionKey = key;
      break;
    }
  }

  if (!regionKey) return [];

  // Filter out current state, take next 4 deterministic neighbors
  const listInRegion = CENSUS_REGIONS[regionKey].filter(s => s !== stateSlug);
  const hashSeed = stateSlug;
  const startIdx = getDeterministicIndex(hashSeed, Math.max(1, listInRegion.length - 4));
  const neighbors = listInRegion.slice(startIdx, startIdx + 4);

  return neighbors.map(slug => ({
    slug,
    name: STATE_NAME_MAP[slug] || slug.replace('-', ' ')
  }));
}
