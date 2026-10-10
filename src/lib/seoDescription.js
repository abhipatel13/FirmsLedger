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
    desc = `Compare ${totalCount} ${cleanCat.toLowerCase()} manufacturers in ${stateName}. Explore capabilities, certifications, and local facilities.`;
  } else if (templateIdx === 1) {
    desc = `Find top ${cleanCat.toLowerCase()} shops in ${stateName}. Review ${totalCount} suppliers for ${domain.products.split(', ').slice(0, 2).join(' and ')}.`;
  } else {
    desc = `Source from ${totalCount} ${cleanCat.toLowerCase()} firms in ${stateName}. Compare specialized products, certifications, and local capacities.`;
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
    return `Directory of ${totalCount} ${cleanCat.toLowerCase()} facilities in ${stateName} providing ${domain.products.split(', ').slice(0, 3).join(', ')}.`;
  } else if (templateIdx === 1) {
    return `Browse ${totalCount} ${cleanCat.toLowerCase()} companies in ${stateName} specialized in ${domain.products.split(', ').slice(0, 2).join(' and ')}.`;
  } else {
    return `Connect with ${totalCount} local ${cleanCat.toLowerCase()} suppliers across ${stateName}. Compare capabilities, certifications, and response times.`;
  }
}

/** Generates dynamic bottom-page description: target ~40-60 words (250-350 characters) */
export function generateDynamicCategoryStateOnPageText({ categorySlug, categoryName, stateSlug, stateName, totalCount, topSpecialties = [], subcategories = [] }) {
  const domain = CATEGORY_DOMAINS[categorySlug] || { products: 'manufacturing services', focus: 'high-quality standards', certifications: 'key compliance standards', procurement: 'specifications' };
  const cleanCat = categoryName.replace(' Manufacturers', '').replace(' & Machining', '');
  
  const hashSeed = `${categorySlug}-${stateSlug}-page`;
  const idx = getDeterministicIndex(hashSeed, 4);

  const statsPart = `Listings are compiled from public company information, and manufacturers can claim their profile to confirm and update it.`;

  const specPart = topSpecialties.length > 0
    ? ` Local shops frequently hold ${topSpecialties.join(' or ')} certifications to meet strict engineering requirements.`
    : ` Buyers typically evaluate these facilities on their ${domain.certifications} and lead times.`;

  const subList = subcategories.length > 0
    ? subcategories.slice(0, 2).map(s => s.name).join(' and ')
    : 'specialty services';

  const paragraphs = [
    `Sourcing ${domain.products} in ${stateName} requires vetting local partners on their ability to meet ${domain.focus}. ${statsPart}${specPart} Contact listed shops directly for custom ${subList} projects.`,
    `${stateName} supports a strong base of ${totalCount} ${cleanCat.toLowerCase()} suppliers equipped for both custom runs and high-volume delivery. ${statsPart} Sourcing teams prioritize these companies for their focus on ${domain.procurement}.${specPart}`,
    `For engineering teams procuring ${domain.products} within ${stateName}, finding a supplier certified to ${domain.certifications} is critical. This directory lists ${totalCount} local options. ${statsPart} Select partners based on their ${subList} capacity.`,
    `This directory profiles ${totalCount} ${cleanCat.toLowerCase()} shops in ${stateName} to support local supply chain resilience. Suppliers here excel in ${domain.products}. ${statsPart}${specPart} Compare profiles to find the right partner.`
  ];

  return paragraphs[idx];
}

/** Generates FAQ Q&A content */
export function generateCategoryStateFAQs({ categorySlug, categoryName, stateSlug, stateName, totalCount, topSpecialties }) {
  const domain = CATEGORY_DOMAINS[categorySlug] || { products: 'manufacturing services', focus: 'industry standards', certifications: 'industry standards' };
  const cleanCat = categoryName.replace(' Manufacturers', '').replace(' & Machining', '');

  const list = [
    {
      q: `How do I find ${cleanCat.toLowerCase()} manufacturers in ${stateName}?`,
      a: `FirmsLedger lists ${totalCount} local ${cleanCat.toLowerCase()} suppliers in ${stateName}. Open a profile to see its capabilities, certifications and contact details, then request a quote directly from the manufacturer.`
    },
    {
      q: `What certifications should I look for in ${stateName} ${cleanCat.toLowerCase()} shops?`,
      a: `Depending on your industry, look for facilities holding ${topSpecialties.length > 0 ? topSpecialties.join(' or ') : domain.certifications}. These standards ensure the supplier meets strict quality management and process controls for producing ${domain.products}.`
    }
  ];

  return list;
}
