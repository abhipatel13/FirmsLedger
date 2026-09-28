import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config({ path: './.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

const companyUpdates = [
  {
    slug: 's-k-electronics-inc',
    name: 'S&K Electronics, Inc.',
    website: 'https://skecorp.com/',
    logo_url: null, // Removed logo per request
    logo_status: null,
    logo_original_url: null,
    phone: '+14068836241',
    contact_email: 'info@skecorp.com',
    address: '56301 Highway 93, Ronan, MT 59864, United States',
    hq_city: 'Ronan',
    hq_state_label: 'Montana',
    state_slug: 'montana',
    founded_year: 1984,
    employee_count: '51-200',
    certifications: [
      'ISO 9001:2015 Compliant',
      'AS9100D Aerospace Certified',
      'ITAR Registered',
      'IPC-A-610 Class 3 Certified',
      'IPC/WHMA-A-620 Class 3 Certified',
      'IPC J-STD-001 Certified Trainers & Operators',
      'HUBZone Certified Small Disadvantaged Business',
      'GIDEP Member',
      'ERAI Member'
    ],
    capabilities: [
      'Surface Mount Technology (SMT) Assembly',
      'Through-Hole PCB Assembly & Mixed Technology',
      'Custom Cable & Wire Harness Assembly',
      'Electromechanical Box Build & System Integration',
      'Automated Optical Inspection (AOI)',
      'Flying Probe & Functional In-Circuit Testing',
      '2D / 3D X-Ray Inspection',
      'Conformal Coating & Potting Services',
      'In-House Precision Machine Shop & Tooling',
      'Engineering & DFM Design Support (Altium, NI LabVIEW, SolidWorks)',
      'High-Mix / Low-to-High Volume Turnkey Production'
    ],
    products: [
      'Printed Circuit Board Assemblies (PCBA)',
      'Custom Molded Cable Assemblies',
      'Military & Aerospace Wire Harnesses',
      'Electromechanical Sub-Systems & Enclosures',
      'Turnkey Electronic Control Modules',
      'Precision Machined Components & Fixtures'
    ],
    industries_served: [
      'Aerospace & Defense / Military',
      'Industrial Automation & Controls',
      'Medical Equipment',
      'Telecommunications & Networking',
      'Energy & Power Systems',
      'Commercial OEM Electronics'
    ],
    description: `S&K Electronics, Inc. is a premier, tribally-owned electronics contract manufacturer founded in 1984 by the Confederated Salish and Kootenai Tribes (CSKT), operating from a modern 42,000-square-foot facility in Ronan, Montana on the Flathead Indian Reservation. Specializing in high-reliability circuit card assembly (SMT and Through-Hole), custom wire harnesses, and electromechanical box builds, S&K Electronics serves mission-critical aerospace, defense, medical, and industrial sectors. Certified to AS9100D, ISO 9001 compliant, and ITAR registered with IPC-A-610 Class 3 workmanship standards, the company delivers end-to-end manufacturing solutions from prototyping and precision machining to automated testing, conformal coating, and turnkey production.`,
    category_slugs: [
      'electronics-semiconductor',
      'pcb-assembly',
      'pcb-manufacturing',
      'wiring-harness',
      'contract-manufacturing'
    ]
  },
  {
    slug: 'dakota-metal-solutions-llc',
    name: 'Dakota Metal Solutions LLC',
    website: 'https://www.dakotametalsolutions.com/',
    logo_url: null, // Removed logo per request
    logo_status: null,
    logo_original_url: null,
    phone: '+16059244200',
    contact_email: 'info@dakotametalsolutions.com',
    address: '45425 152nd St, Summit, SD 57266, United States',
    hq_city: 'Summit',
    hq_state_label: 'South Dakota',
    state_slug: 'south-dakota',
    founded_year: 2018,
    employee_count: '11-50',
    certifications: [
      'AWS Certified Welding Standards',
      'OEM Production Quality Protocols',
      'Automated Repeatability Standards'
    ],
    capabilities: [
      'High-Powered Fiber Laser Cutting (Sheet & Plate up to 1" Thick)',
      'Precision Tube Laser Cutting',
      'Automated Lights-Out Press Brake Forming & Bending',
      'CNC Milling & Precision Turning',
      'Integrated Multi-Axis Robotic Welding Cells',
      'Manual MIG & TIG Welding',
      'Engineered Production Fixturing & Tooling',
      'Flat Finishing & Automated Deburring',
      'Collaborative Design for Manufacturability (DFM)',
      'ERP-Driven Production Scheduling & Assembly Integration'
    ],
    products: [
      'OEM Precision Sheet Metal & Structural Components',
      'Robotic Production Weldments & Assemblies',
      'Laser Cut & Formed Brackets, Chassis & Enclosures',
      'Precision CNC Milled & Turned Metal Parts',
      'Heavy Equipment & Agricultural Machinery Sub-Assemblies',
      'Heavy Duty In-House Steel Products (Chip Hoppers, Hose Holders, Bolt Bins)'
    ],
    industries_served: [
      'OEM Equipment Manufacturers',
      'Agricultural Machinery & Implements',
      'Heavy Industrial Equipment',
      'Construction & Infrastructure',
      'Commercial Metal Fabrication',
      'Transportation & Material Handling'
    ],
    description: `Dakota Metal Solutions LLC is a high-precision metal fabrication and automated contract manufacturing company based in Summit, South Dakota, serving OEMs across the Upper Midwest. Equipped with advanced Bystronic 6kW/8kW fiber lasers, automated TRUMPF press brakes, Okuma CNC machining centers, and integrated multi-axis robotic welding cells, Dakota Metal Solutions specializes in scalable, lights-out production for sheet metal, tube, and heavy plate up to 1 inch thick. From collaborative DFM engineering and custom fixture fabrication to structural weldments and turnkey assembly, the company delivers exceptional repeatability, tight tolerances, and cost-effective OEM manufacturing solutions.`,
    category_slugs: [
      'metal-fabrication',
      'laser-cutting',
      'sheet-metal-fabrication',
      'cnc-machining',
      'welding',
      'contract-manufacturing'
    ]
  },
  {
    slug: 'county-auto-salvage-llc',
    name: 'County Auto Salvage LLC',
    website: 'https://countyautosalvage.com/',
    logo_url: null, // Removed logo per request
    logo_status: null,
    logo_original_url: null,
    phone: '+13024023131',
    contact_email: 'sales@countyautosalvage.com',
    address: '2093A Philadelphia Pike Suite #327, Claymont, DE 19703, United States',
    hq_city: 'Claymont',
    hq_state_label: 'Delaware',
    state_slug: 'delaware',
    founded_year: 2020,
    employee_count: '11-50',
    certifications: [
      'ARA (Automotive Recyclers Association) Certified Supplier Network',
      'OEM Quality Replacement Standards',
      'Pre-Inspection & Verification Protocols'
    ],
    capabilities: [
      'Nationwide OEM Recycled Auto Parts Sourcing',
      'Direct VIN Matching & Fitment Verification',
      'Rigorous Multi-Point Part Inspection & Compression Testing',
      'Nationwide LTL & Freight Shipping with Tracking',
      '30-Day Limited Parts Replacement Warranty',
      'Dedicated Automotive Parts Specialist Customer Support',
      'E-Commerce Salvage Parts Distribution'
    ],
    products: [
      'Used OEM Complete Engines & Long Blocks',
      'Automatic & Manual Transmissions / Transaxles',
      'Drivetrain Components (Transfer Cases, Axle Assemblies, Differentials)',
      'Auto Body Panels (Doors, Fenders, Hoods, Trunk Lids, Tailgates)',
      'Front & Rear Bumper Assemblies & Grilles',
      'Headlights, Tail Lights, Mirrors & Electrical Modules (ECU/ECM)',
      'Suspension Systems (Struts, Control Arms, Steering Columns, Racks)',
      'OEM Wheels, Rims & Brake Assemblies',
      'AC Compressors, Alternators & Starters',
      'Interior Components, Instrument Clusters & Seating'
    ],
    industries_served: [
      'Automotive Repair & Service Shops',
      'Collision & Auto Body Centers',
      'Fleet Maintenance & Commercial Vehicles',
      'Automotive Enthusiasts & DIY Restorers',
      'Insurance Claim Replacement'
    ],
    description: `County Auto Salvage LLC is a trusted supplier and nationwide distributor of quality used OEM automotive parts, based in Claymont, Delaware. Partnering with a vetted network of over 200 Automotive Recyclers Association (ARA) certified salvage yards across the United States and Canada, County Auto Salvage provides vehicle owners, repair shops, and fleet managers with cost-effective, reliable replacement parts. From complete engines, transmissions, and transfer cases to body panels, lighting, suspension components, and electronic modules, every part is thoroughly inspected, VIN-matched for accurate fitment, backed by a 30-day warranty, and shipped directly to customers nationwide.`,
    category_slugs: [
      'automotive-parts',
      'transmission',
      'steering',
      'suspension'
    ]
  },
  {
    slug: 'spinnaker-contract-manufacturing-inc',
    name: 'Spinnaker Contract Manufacturing, Inc.',
    website: 'https://www.spinnakercontract.com/',
    logo_url: null, // Removed logo per request
    logo_status: null,
    logo_original_url: null,
    phone: '+16032864366',
    contact_email: 'sales@spinnakercontract.com',
    address: '95 Business Park Dr, Tilton, NH 03276, United States',
    hq_city: 'Tilton',
    hq_state_label: 'New Hampshire',
    state_slug: 'new-hampshire',
    founded_year: 1976,
    employee_count: '51-200',
    certifications: [
      'ISO 9001:2015 Certified',
      'ISO 13485:2016 Certified (Medical Devices)',
      'ITAR Registered',
      'IPC-A-610 Class 2 & Class 3 Certified',
      'IPC/WHMA-A-620 Cable & Wire Harness Certified',
      'UL / CSA Approved Facility',
      'RoHS & Lead-Free Compliant'
    ],
    capabilities: [
      'Printed Circuit Board Assembly (PCBA - SMT & Through-Hole)',
      'High-Speed Surface Mount Technology (4 SMT Lines down to 01005)',
      'Custom Cable & Wire Harness Assembly (Schleuniger automated crimp/strip)',
      'Electro-Mechanical Assembly & Full Box-Build Integration',
      'Automated Optical Inspection (AOI) & In-Line Solder Paste Inspection (SPI)',
      '2D & 3D X-Ray Inspection (Dage Quadra 3)',
      'Flying Probe Testing (SPEA 4060S2) & Functional Testing',
      'Cable & Harness Continuity / Hi-Pot Testing (Cirris systems)',
      'Conformal Coating, Potting & Enclosure Assembly',
      'Turnkey Supply Chain Management, NPI & Direct Fulfillment',
      'Laser Engraving, Precision Marking & Enclosure Customization'
    ],
    products: [
      'High-Density Printed Circuit Board Assemblies',
      'Custom Industrial & Military Wire Harnesses',
      'Complete Electromechanical Box Builds & Rack Systems',
      'Medical Device Electronics & Diagnostic Assemblies',
      'Telecommunications & Power Switching Enclosures',
      'Semiconductor Equipment Sub-Modules & Control Panels'
    ],
    industries_served: [
      'Medical Devices & Healthcare Technology',
      'Defense & Homeland Security',
      'Telecommunications & Networking',
      'Industrial Automation, Robotics & Controls',
      'Semiconductor & Capital Equipment',
      'Commercial Electronics & Renewable Energy'
    ],
    description: `Spinnaker Contract Manufacturing, Inc. is a premier New England electronics contract manufacturer founded in 1976 and headquartered in Tilton, New Hampshire. Operating from a modern 30,000-square-foot facility with a dedicated 15,000 sq. ft. electro-mechanical assembly area, Spinnaker provides complete turnkey manufacturing services including high-speed Surface Mount Technology (SMT) with 4 production lines, through-hole PCB assembly, custom wire harnesses, and complex box-build system integration. Certified to ISO 9001:2015 and ISO 13485:2016 for medical devices, ITAR registered, and adhering to IPC-A-610/IPC-WHMA-A-620 Class 3 workmanship, Spinnaker offers advanced testing solutions—including SPEA flying probe and Dage Quadra 3 X-ray inspection—to support mission-critical medical, defense, telecom, and industrial OEMs.`,
    category_slugs: [
      'electronics-semiconductor',
      'pcb-assembly',
      'pcb-manufacturing',
      'smt-assembly',
      'wiring-harness',
      'contract-manufacturing',
      'medical-electronics',
      'industrial-electronics'
    ]
  }
];

async function updateCompanies() {
  console.log('Beginning company updates in database (logos removed, descriptions enriched)...');

  for (const comp of companyUpdates) {
    console.log(`\n--------------------------------------------`);
    console.log(`Updating: ${comp.name} (${comp.slug})`);

    // 1. Resolve State ID
    const stateRows = await sql`
      SELECT id FROM states WHERE slug = ${comp.state_slug} LIMIT 1
    `;
    const stateId = stateRows[0]?.id || null;

    // 2. Update company record
    const [updatedCompany] = await sql`
      UPDATE companies
      SET 
        name = ${comp.name},
        website = ${comp.website},
        logo_url = NULL,
        logo_status = NULL,
        logo_original_url = NULL,
        phone = ${comp.phone},
        contact_email = ${comp.contact_email || null},
        address = ${comp.address},
        hq_city = ${comp.hq_city},
        hq_state_label = ${comp.hq_state_label},
        hq_state_id = ${stateId},
        country = 'United States',
        founded_year = ${comp.founded_year},
        employee_count = ${comp.employee_count},
        certifications = ${comp.certifications},
        capabilities = ${comp.capabilities},
        products = ${comp.products},
        industries_served = ${comp.industries_served},
        description = ${comp.description},
        approved = true,
        is_verified = true,
        updated_at = NOW()
      WHERE slug = ${comp.slug}
      RETURNING id, name, slug, approved, is_verified, logo_url
    `;

    if (!updatedCompany) {
      console.error(`ERROR: Company with slug ${comp.slug} not found!`);
      continue;
    }

    console.log(`Updated company ID: ${updatedCompany.id}, logo_url: ${updatedCompany.logo_url}`);

    // 3. Clear old category associations and insert new ones
    await sql`
      DELETE FROM company_categories WHERE company_id = ${updatedCompany.id}
    `;

    const catRows = await sql`
      SELECT id, name, slug FROM categories WHERE slug = ANY(${comp.category_slugs})
    `;

    console.log(`Resolved ${catRows.length} categories:`, catRows.map(c => c.name));

    for (const cat of catRows) {
      await sql`
        INSERT INTO company_categories (company_id, category_id)
        VALUES (${updatedCompany.id}, ${cat.id})
        ON CONFLICT DO NOTHING
      `;
    }

    console.log(`Successfully updated and categorized ${comp.name}`);
  }

  console.log('\n============================================');
  console.log('All company enrichments completed successfully!');
}

updateCompanies().then(() => process.exit(0)).catch(err => {
  console.error('Update failed:', err);
  process.exit(1);
});
