/**
 * Seed script — inserts all categories and companies from the deep-research files.
 * Run: node scripts/seed-companies.js
 * Safe to re-run: uses ON CONFLICT DO NOTHING on slug.
 */

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Categories ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'Electrical Manufacturers',                slug: 'electrical-manufacturers',               description: 'Wiring, switchgear & electrical components',          order: 2 },
  { name: 'Mechanical Manufacturers',                slug: 'mechanical-manufacturers',               description: 'CNC machining & precision parts',                     order: 3 },
  { name: 'Plastics & Packaging Manufacturers',      slug: 'plastics-packaging-manufacturers',       description: 'Injection molding & packaging',                       order: 4 },
  { name: 'Metal Fabrication & Machining',           slug: 'metal-fabrication-machining',            description: 'Sheet metal, welding & stamping',                     order: 5 },
  { name: 'Electronics & Semiconductor Manufacturers', slug: 'electronics-semiconductor-manufacturers', description: 'PCBs, chips & assemblies',                         order: 6 },
  { name: 'Automotive Parts Manufacturers',          slug: 'automotive-parts-manufacturers',         description: 'OEM & aftermarket components',                        order: 7 },
  { name: 'Textile & Apparel Manufacturers',         slug: 'textile-apparel-manufacturers',          description: 'Fabric & garment manufacturing',                      order: 8 },
  { name: 'Furniture & Woodworking Manufacturers',   slug: 'furniture-woodworking-manufacturers',    description: 'Custom furniture & cabinetry',                        order: 9 },
  { name: 'Food & Beverage Processing',              slug: 'food-beverage-processing',               description: 'Processing & packaging lines',                        order: 10 },
  { name: 'Medical Device Manufacturers',            slug: 'medical-device-manufacturers',           description: 'Diagnostic & surgical equipment',                     order: 11 },
];

// ── Company data ─────────────────────────────────────────────────────────────
// category: slug of the category to link
// state:    slug matching the states table

const COMPANIES = [

  // ── Electrical Manufacturers — California (switchgear / PDF1) ──────────────

  {
    name: 'Trayer Engineering Corporation',
    website: 'https://trayer.com',
    phone: '415-285-7770',
    address: '1569 Alvarado St, San Leandro, CA 94577',
    city: 'San Leandro', state: 'california',
    products: ['Medium-voltage switchgear', 'Solid-dielectric MV switchgear', 'Automatic transfer switches', 'Switchgear control and automation'],
    industries_served: ['Electric utilities', 'Telecommunications', 'Oil & gas', 'Industrial power distribution'],
    certifications: ['ISO 9001:2015'],
    description: 'Trayer Engineering (a Siemens company) manufactures high-reliability medium-voltage electrical switchgear (padmount, submersible, vaultmount) and related control equipment. Products are custom-built for utility, industrial and communications power applications. ISO 9001:2015 certified; switchgear is UL-listed (UL 891).',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Industrial Electric Manufacturing (IEMFG)',
    website: 'https://iemfg.com',
    phone: '510-656-1600',
    address: '48205 Warm Springs Blvd, Fremont, CA 94539',
    city: 'Fremont', state: 'california',
    products: ['Custom low-voltage switchboards and switchgear', 'Medium-voltage metal-clad switchgear', 'Automatic transfer switches (ATS)', 'Power distribution units (PDUs) and substations'],
    industries_served: ['Commercial real estate', 'Energy & utilities', 'Healthcare', 'Industrial manufacturing', 'Infrastructure & public services', 'Technology & data centers'],
    certifications: ['UL 891', 'UL 1558', 'UL 1008', 'ISO 9001:2015'],
    description: 'IEM designs and fabricates custom power distribution systems – including low-voltage switchboards, metal-clad switchgear, transfer switchgear, and PDUs – for data centers, healthcare, commercial and industrial facilities. Equipment is UL-certified and serves a broad range of sectors.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Yaskawa America — Drives & Motion Division',
    website: 'https://www.yaskawa.com',
    phone: '408-748-4400',
    address: '4101 Burton Drive, Santa Clara, CA 95054',
    city: 'Santa Clara', state: 'california',
    products: ['Medium-voltage switchgear (padmount and Gas Rotary-Arc)', 'Low-voltage switchgear', 'Variable frequency drives and motor controllers', 'Electric motors and robotics'],
    industries_served: ['Utilities', 'Industrial manufacturing', 'Data centers', 'Commercial buildings'],
    certifications: ['ISO 9001:2008'],
    description: "Yaskawa America's Drives & Motion Division produces medium-voltage switchgear (including padmounted gas-insulated switchgear) and low-voltage switchgear, as well as motor drives and controls. Designed for high-reliability power distribution in utilities, manufacturing, data center and commercial applications.",
    category: 'electrical-manufacturers',
  },
  {
    name: 'L3Harris Power Paragon',
    website: 'https://powerparagon.com',
    phone: '714-956-0000',
    address: '901 E Ball Rd, Anaheim, CA 92805',
    city: 'Anaheim', state: 'california',
    products: ['Custom low-voltage and medium-voltage switchgear', 'Power distribution control centers', 'Automatic transfer switchgear (paralleling systems)', 'DC switchgear and bus systems'],
    industries_served: ['Commercial construction', 'Utility and power generation', 'Government/military', 'Data centers'],
    certifications: ['ISO 9001:2000'],
    description: 'L3Harris Power Paragon designs and manufactures engineered power distribution solutions. Specialty is custom switchgear – including low-, medium-, and high-voltage switchgear, DC power systems and automated transfer switchgear – for commercial, utility and government power systems.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Bay City Electric Works',
    website: 'https://www.bcew.com',
    phone: '1-866-938-8200',
    address: '13625 Danielson St, Poway, CA 92064',
    city: 'Poway', state: 'california',
    products: ['Emergency standby generators (Kohler)', 'Automatic transfer switches (ATS)', 'Paralleling switchgear', 'Backup power rental equipment'],
    industries_served: ['Commercial and residential backup power', 'Healthcare facilities', 'Data centers', 'Municipal and industrial'],
    certifications: [],
    description: 'Bay City Electric Works is a leading generator distributor in California. Specializes in Kohler emergency generator systems along with automatic transfer switches and paralleling switchgear. Provides complete backup-power solutions (sales, service and rentals) for commercial, industrial and residential customers.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Power Plus',
    website: 'https://powerplus.com',
    phone: '714-685-8600',
    address: '220 E Sequoia Ave, Anaheim, CA 92801',
    city: 'Anaheim', state: 'california',
    founded_year: 1987,
    employee_count: '500-999',
    products: ['Power Distribution Switchgear', 'Temporary Power Equipment', 'Generators', 'Emergency power solutions'],
    industries_served: ['Construction', 'Oil & gas', 'Mining', 'Disaster response', 'Agriculture'],
    certifications: [],
    description: 'Power Plus is a California power solutions provider focused on rental and turnkey power systems. Offers generators, temporary power switchgear and distribution (including ATS and transformers) for construction sites, industrial projects and emergency power needs. Operates 24/7.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Steven Engineering',
    website: 'https://www.stevenengineering.com',
    phone: '(800) 258-9200',
    address: '2801 W 6th St, Corona, CA 92881',
    city: 'Corona', state: 'california',
    founded_year: 1975,
    employee_count: '100-199',
    products: ['Arc Resistant Switchgear', 'Generator Control Switchgear', 'High Current Switchgear', 'Low Voltage Switchgear', 'Power Distribution Switchgear'],
    industries_served: ['Industrial', 'Commercial', 'Mechanical', 'Marine', 'Oil & Gas'],
    certifications: ['ISO 9001', 'UL Listed'],
    description: 'Steven Engineering is a distributor and custom manufacturer of switchgear. Offers arc resistant, generator control, high-current, low-voltage, and power distribution switchgear suitable for industrial, commercial, mechanical and marine applications.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Waukesha-Pearce Industries (WPI)',
    website: 'https://www.wpi.com',
    phone: '(800) 225-1437',
    address: '2008 Standard Avenue, Bakersfield, CA 93308',
    city: 'Bakersfield', state: 'california',
    founded_year: 1924,
    employee_count: '200-499',
    products: ['Low Voltage Switchgear', 'Medium Voltage Switchgear', 'Generator Accessories', 'Power Generation Parts'],
    industries_served: ['Power Generation', 'Oil & Gas', 'Industrial', 'Utilities'],
    certifications: [],
    description: 'Waukesha-Pearce Industries is a custom manufacturer and distributor of power generation equipment and parts, including low- and medium-voltage switchgear. Serves utility and industrial power generation markets; offers repair and maintenance of switchgear.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Quinn Power Systems',
    website: 'https://www.quinncompany.com',
    phone: '(800) 692-7846',
    address: '220 South Wallace Avenue, City of Industry, CA 90601',
    city: 'City of Industry', state: 'california',
    founded_year: 1972,
    employee_count: '1000+',
    products: ['Power Systems', 'Switchgear', 'Generator Sets', 'Caterpillar diesel and gas generator sets', 'Automatic transfer switches (ATS)'],
    industries_served: ['Power Generation', 'Construction', 'Industrial', 'Municipal/government', 'Industrial and telecom'],
    certifications: [],
    description: 'Quinn Power Systems is an authorized Caterpillar dealer providing Cat power generation equipment – including diesel/gas generator sets, paralleling switchgear and transfer switches – for large-scale projects. Serves construction, municipal, telecom and industrial customers.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Western Energy Systems',
    website: 'https://nes-wes.com',
    phone: '(949) 829-5900',
    address: '1441 Vollmer Road, Brea, CA 92821',
    city: 'Brea', state: 'california',
    founded_year: 1964,
    employee_count: '200-499',
    products: ['Distributed Generation Systems', 'Combined Heat & Power', 'Switchgear'],
    industries_served: ['Energy', 'Utilities', 'Industrial', 'Commercial'],
    certifications: [],
    description: 'Western Energy Systems is a distributor and systems integrator of combined heat and power (CHP) and distributed generation solutions, including switchgear. Offers fuel gas compressors, battery storage and other power systems, serving utility, commercial and industrial clients.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Aggreko',
    website: 'https://www.aggreko.com',
    phone: '(949) 336-2202',
    address: '12641 E. Washington Blvd, Suite A, Whittier, CA 90601',
    city: 'Whittier', state: 'california',
    founded_year: 1962,
    employee_count: '1000+',
    products: ['Temporary Power Equipment', 'Switchgear', 'Generators'],
    industries_served: ['Construction', 'Oil & Gas', 'Mining', 'Telecom', 'Events'],
    certifications: ['UL Listed', 'NEMA Rated'],
    description: 'Aggreko provides rental power equipment and temporary power solutions, including mobile switchgear systems. Serves construction, mining, oil & gas, telecommunication, automotive and renewable energy industries. Maintains UL- and NEMA-rated equipment.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'DEI Power Solutions',
    website: 'https://deipowersolutions.com',
    phone: '(909) 605-1224',
    address: '1707 East 6th Street, Ontario, CA 91764',
    city: 'Ontario', state: 'california',
    founded_year: 1999,
    employee_count: '10-49',
    products: ['Custom-built low-voltage switchgear (UL 891 panelboards)', 'Integrated power distribution panels', 'Custom busbar systems', 'Switchgear design and retrofit services'],
    industries_served: ['Data Centers', 'Manufacturing plants', 'Commercial buildings', 'Critical infrastructure', 'Utilities', 'Industrial'],
    certifications: ['UL 891'],
    description: 'DEI Power Solutions is a California-based OEM specializing in custom switchgear and panelboards. As a UL 891-certified manufacturer and Siemens Approved OEM, produces engineered power distribution gear (switchboards, panelboards, paralleled switchgear) for data centers, manufacturing facilities and commercial buildings.',
    category: 'electrical-manufacturers',
  },

  // ── Electrical Manufacturers — California (Solar) ─────────────────────────

  {
    name: 'SunPower Corporation',
    website: 'https://www.sunpower.com',
    phone: '(408) 240-5500',
    address: '77 Rio Robles, San Jose, CA 95134',
    city: 'San Jose', state: 'california',
    founded_year: 1985,
    employee_count: '500-999',
    products: ['Monocrystalline Solar Panels', 'PV Systems'],
    industries_served: ['Residential', 'Commercial', 'Utility'],
    certifications: [],
    description: 'SunPower is a leading solar energy company headquartered in California. Designs and manufactures high-efficiency monocrystalline solar panels and provides complete solar power systems for residential, commercial and utility applications.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Enphase Energy',
    website: 'https://www.enphase.com',
    phone: '(877) 797-4743',
    address: '1420 N McCarthy Blvd, Milpitas, CA 95035',
    city: 'Milpitas', state: 'california',
    founded_year: 2006,
    employee_count: '1000+',
    products: ['Solar Microinverters', 'Energy Storage Systems', 'Energy management software'],
    industries_served: ['Residential', 'Commercial', 'Utility'],
    certifications: [],
    description: 'Enphase Energy is headquartered in California and known for its microinverter technology for solar panels, as well as energy storage and management systems. Products are used in residential and commercial PV installations.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Q Cells USA',
    website: 'https://www.qcells.com',
    phone: '(949) 654-0620',
    address: '380 S Melrose Dr, Placentia, CA 92870',
    city: 'Placentia', state: 'california',
    founded_year: 1999,
    employee_count: '100-499',
    products: ['Bifacial Solar Panels', 'Solar Modules', 'BMS and Inverters'],
    industries_served: ['Commercial', 'Utility', 'Industrial'],
    certifications: [],
    description: 'Q Cells is a solar panel manufacturer and energy solutions provider. Products include bifacial solar modules, energy storage systems and power electronics, suitable for utility and commercial solar installations.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Unbound Solar',
    website: 'https://www.unboundsolar.com',
    phone: '(866) 310-7133',
    address: '451 N Berry St, Fullerton, CA 92832',
    city: 'Fullerton', state: 'california',
    founded_year: 2004,
    employee_count: '10-49',
    products: ['Solar Panels', 'Solar Kits', 'Solar Inverters'],
    industries_served: ['Residential', 'Commercial'],
    certifications: [],
    description: 'Unbound Solar is a distributor of solar equipment. Offers a wide range of solar panels and complete solar kits for residential and commercial installations.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Renogy',
    website: 'https://www.renogy.com',
    phone: '(909) 481-3918',
    address: '8098 Edison Pl, Chino, CA 91710',
    city: 'Chino', state: 'california',
    founded_year: 2009,
    employee_count: '200-499',
    products: ['Solar Panels', 'Charge Controllers', 'Battery Systems'],
    industries_served: ['Recreational Vehicles', 'Commercial', 'Off-Grid'],
    certifications: [],
    description: 'Renogy is a solar energy product manufacturer based in California. Produces monocrystalline and flexible solar panels, along with charge controllers, battery systems and other solar components for RV, marine and off-grid applications.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Growatt USA',
    website: 'https://us.growatt.com',
    phone: '(866) 514-3445',
    address: '908 West McFadden Ave, Santa Ana, CA 92707',
    city: 'Santa Ana', state: 'california',
    founded_year: 2011,
    employee_count: '1000+',
    products: ['PV Inverters', 'Energy Storage Systems', 'EV Chargers'],
    industries_served: ['Residential', 'Commercial', 'Utility', 'Transportation'],
    certifications: [],
    description: 'Growatt USA specializes in solar inverter and energy storage solutions. Provides on-grid photovoltaic inverters, battery storage systems, EV chargers and monitoring equipment for residential and commercial solar projects.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'SunSpark Technology',
    website: 'https://sunsparkusa.com',
    phone: '(951) 279-1913',
    address: '1100 W Florida Ave, Hemet, CA 92543',
    city: 'Hemet', state: 'california',
    founded_year: 2008,
    employee_count: '10-49',
    products: ['Monocrystalline PV Panels', 'Polycrystalline PV Panels'],
    industries_served: ['Commercial', 'Industrial', 'Military', 'Government'],
    certifications: [],
    description: 'SunSpark Technology manufactures thin-film photovoltaic panels using cadmium telluride technology. Solar modules, built with tempered glass and anodized aluminum, serve commercial, government, military and industrial clients.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Lamb Energy',
    website: 'https://www.lambenergy.com',
    phone: '(951) 279-4276',
    address: '5700 Canyon Crest Dr Suite D, Riverside, CA 92507',
    city: 'Riverside', state: 'california',
    founded_year: 2009,
    employee_count: '1-9',
    products: ['Solar Panels', 'Inverters', 'Lighting', 'Monitoring Systems'],
    industries_served: ['Commercial', 'Industrial'],
    certifications: [],
    description: 'Lamb Energy is a solar installer and systems integrator based in California. Designs and installs solar power systems for commercial and industrial clients, offering panels, inverters, lighting and monitoring solutions.',
    category: 'electrical-manufacturers',
  },

  // ── Electrical Manufacturers — Texas (Switchgear) ─────────────────────────

  {
    name: 'Siemens Corporation',
    website: 'https://www.siemens.com',
    phone: '(713) 290-7700',
    address: '100 Technology Dr, Houston, TX 77095',
    city: 'Houston', state: 'texas',
    founded_year: 1847,
    employee_count: '1000+',
    products: ['Medium Voltage Switchgear', 'High Voltage GIS', 'Circuit Breakers', 'Control Systems'],
    industries_served: ['Power Generation', 'Industrial', 'Oil & Gas', 'Commercial'],
    certifications: [],
    description: 'Siemens Corporation manufactures and supplies switchgear for power distribution. Products include medium-voltage and high-voltage (gas-insulated) switchgear, solid-shield switchgear and circuit breakers, serving utilities and industrial facilities worldwide.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Depco Power Systems',
    website: 'https://www.depco.com',
    phone: '(713) 681-3000',
    address: '10700 Jackrabbit Rd, Houston, TX 77066',
    city: 'Houston', state: 'texas',
    founded_year: 1973,
    employee_count: '10-49',
    products: ['Switchgear', 'Generator Controls', 'Power Systems'],
    industries_served: ['Defense', 'Mining', 'Telecommunications', 'Oil & Gas'],
    certifications: [],
    description: 'Depco Power Systems distributes switchgear for defense, mining, telecommunications and oil & gas industries. Switchgear units meet military specifications and are used in power generation and standby applications.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Oakwell Inc.',
    website: 'https://www.oakwellinc.com',
    phone: '(800) 467-0260',
    address: '6305 Sue Barnett Dr, Rosenberg, TX 77471',
    city: 'Rosenberg', state: 'texas',
    founded_year: 1987,
    employee_count: '10-49',
    products: ['Switchgear', 'Electrical Controls'],
    industries_served: ['Oil & Gas', 'Utilities', 'Military'],
    certifications: ['ISO 9001:2000'],
    description: 'Oakwell is a stocking distributor and custom manufacturer of switchgear, including indoor and outdoor LV/MV distribution and generator switchgear. Equipment meets military specifications and features automatic controls for generator paralleling, load shedding, soft loading/unloading and PLC integration.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Schneider Electric',
    website: 'https://www.se.com',
    phone: '(800) 613-1131',
    address: '901 Marquette Ave #200, Austin, TX 78701',
    city: 'Austin', state: 'texas',
    founded_year: 1836,
    employee_count: '1000+',
    products: ['Power Distribution Switchgear', 'Circuit Breakers', 'Energy Management Systems'],
    industries_served: ['Data Centers', 'Mining', 'Healthcare', 'Utilities', 'Construction'],
    certifications: [],
    description: 'Schneider Electric manufactures power distribution switchgear and related equipment. Offerings include solid-shield, air-insulated and gas-insulated switchgear, suitable for healthcare, data center, water treatment, mining and other applications.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Powell Industries',
    website: 'https://www.powellind.com',
    phone: '(713) 860-0404',
    address: '8500 Freeport Pkwy, Irving, TX 75063',
    city: 'Houston', state: 'texas',
    founded_year: 1947,
    employee_count: '1000+',
    products: ['Switchgear', 'Motor Control Centers', 'Transformers', 'Power Control Rooms'],
    industries_served: ['Power Utilities', 'Industrial', 'Commercial'],
    certifications: [],
    description: 'Powell Industries is a manufacturer and integrator of electrical power equipment. Product line includes low- and medium-voltage switchgear, motor control centers, transformers and power control rooms.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'R. Stahl Inc.',
    website: 'https://www.rstahl.com',
    phone: '(281) 274-3310',
    address: '1101 W Sam Houston Pkwy N #100, Houston, TX 77013',
    city: 'Houston', state: 'texas',
    founded_year: 1979,
    employee_count: '1000+',
    products: ['Lockable Load Switchgear', 'Motor Switchgear', 'Control Cabinets'],
    industries_served: ['Food & Beverage', 'Electronics', 'Chemical', 'Pharmaceutical'],
    certifications: ['ISO 9001', 'ISO 14001'],
    description: 'R. Stahl manufactures lockable load and motor switchgear made from glass-fiber reinforced polyester. Switchgear operates up to 690 VAC and is rated for -20°C to +40°C ambient, providing corrosion-resistant protection (IP65) for industrial applications.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Spike Electric Controls',
    website: 'https://spikeelectric.com',
    phone: '(832) 429-8444',
    address: '10675 Bellaire Blvd #200, Houston, TX 77072',
    city: 'Houston', state: 'texas',
    founded_year: 1965,
    employee_count: '500-999',
    products: ['Low Voltage Switchgear', 'Medium Voltage Switchgear', 'Arc Resistant Switchgear'],
    industries_served: ['Commercial', 'Industrial', 'Power Utilities'],
    certifications: ['UL 1558'],
    description: 'Spike Electric designs and manufactures low- and medium-voltage switchgear, including arc-resistant models. Custom switchgear features include arc flash mitigation, reinforced enclosures, cycloaliphatic insulation and copper-chrome contacts.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Toshiba International Corporation',
    website: 'https://www.toshiba.com',
    phone: '(281) 272-7100',
    address: '13131 West Little York Rd, Houston, TX 77041',
    city: 'Houston', state: 'texas',
    founded_year: 1975,
    employee_count: '500-999',
    products: ['Low and Medium Voltage Motors', 'Switchgear', 'Drives'],
    industries_served: ['Power', 'Industrial', 'Energy'],
    certifications: [],
    description: 'Toshiba International Corporation manufactures a wide range of electrical equipment, including low- and medium-voltage switchgear, motors, drives and controllers. Switchgear products are used in power distribution and control applications.',
    category: 'electrical-manufacturers',
  },

  // ── Electrical Manufacturers — Texas (Solar) ──────────────────────────────

  {
    name: 'Mission Solar Energy',
    website: 'https://www.missionsolar.com',
    phone: '(210) 654-4250',
    address: '1706 Lipa Way, San Antonio, TX 78211',
    city: 'San Antonio', state: 'texas',
    founded_year: 2011,
    employee_count: '200-499',
    products: ['Commercial Solar Modules', 'String Inverters', 'PV Mounting Systems'],
    industries_served: ['Commercial', 'Industrial', 'Residential'],
    certifications: ['UL Listed'],
    description: 'Mission Solar Energy is an American solar panel manufacturer based in Texas. Produces commercial and industrial solar modules (panels) in its San Antonio facility, along with inverters and mounting systems.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Canadian Solar USA',
    website: 'https://www.canadiansolar.com',
    phone: '(972) 240-7100',
    address: '400 South Plano Rd, Richardson, TX 75081',
    city: 'Richardson', state: 'texas',
    founded_year: 2001,
    employee_count: '10000+',
    products: ['Crystalline Silicon PV Modules', 'Inverters', 'BIPV Systems'],
    industries_served: ['Utility', 'Commercial', 'Industrial'],
    certifications: ['UL Listed', 'IEC'],
    description: 'Canadian Solar is a global solar manufacturer with a large U.S. manufacturing presence in Texas. Produces crystalline silicon solar panels and energy solutions for utility and commercial applications.',
    category: 'electrical-manufacturers',
  },

  // ── Electrical Manufacturers — Texas (Wire & Cable) ──────────────────────

  {
    name: 'Houston Wire & Cable',
    website: 'https://www.hwc.com',
    phone: '(713) 659-1800',
    address: '815 Parker St, Houston, TX 77002',
    city: 'Houston', state: 'texas',
    founded_year: 1906,
    employee_count: '1000+',
    products: ['Electrical Wire', 'Cables', 'Power Cords', 'Cable Assemblies'],
    industries_served: ['Energy', 'Industrial', 'Commercial'],
    certifications: ['UL Listed'],
    description: 'Houston Wire & Cable is a manufacturer of electrical wire and cable. Product range includes power cables, communication cables and custom cable assemblies for energy, industrial and commercial applications.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Encore Wire Corporation',
    website: 'https://www.encorewire.com',
    phone: '(972) 542-2677',
    address: '1320 Yellowjacket Lane, McKinney, TX 75069',
    city: 'McKinney', state: 'texas',
    founded_year: 1989,
    employee_count: '1000+',
    products: ['Building Wire', 'Copper Cable'],
    industries_served: ['Residential', 'Commercial', 'Industrial'],
    certifications: [],
    description: 'Encore Wire is a Texas-based manufacturer of building wire and copper cable. Products serve the residential, commercial and industrial construction markets, offering various types of UL-rated copper electrical wire.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Prysmian Group USA',
    website: 'https://www.prysmiangroup.com',
    phone: '(713) 462-5000',
    address: '600 Brickell Ave #3500, Miami, FL 33131',
    city: 'Houston', state: 'texas',
    founded_year: 2005,
    employee_count: '15000+',
    products: ['Power Cables', 'Data Cables', 'Telecommunication Cables'],
    industries_served: ['Utilities', 'Oil & Gas', 'Telecom', 'Data Centers'],
    certifications: [],
    description: 'Prysmian Group is a global cable manufacturer. In the U.S., produces power and specialty cables for electrical utilities, telecom and industrial applications. Operates manufacturing facilities in Texas among other states.',
    category: 'electrical-manufacturers',
  },

  // ── Electrical Manufacturers — New York (Switchgear) ─────────────────────

  {
    name: 'Schmersal Inc.',
    website: 'https://www.schmersal.com',
    phone: '(914) 345-9300',
    address: '2 Sidewood Ave, Hawthorne, NY 10532',
    city: 'Hawthorne', state: 'new-york',
    founded_year: 1945,
    employee_count: '1000+',
    products: ['Safety Switchgear', 'Control Switches', 'Interlock Systems'],
    industries_served: ['Industrial Automation', 'Manufacturing'],
    certifications: [],
    description: 'Schmersal is a manufacturer of safety-related switchgear and control components. Products include wireless safety switches and industrial safety systems used in factory automation and material handling applications.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Hudson Electric Sales Corp.',
    website: 'https://www.hescorp.com',
    phone: '(201) 262-2818',
    address: '83 Beaver Ave, Hawthorne, NY 10532',
    city: 'Hawthorne', state: 'new-york',
    founded_year: 1972,
    employee_count: '50-99',
    products: ['Industrial Switchgear', 'Power Distribution Equipment'],
    industries_served: ['Industrial', 'Commercial'],
    certifications: [],
    description: 'Hudson Electric Sales is a supplier of industrial switchgear and power distribution equipment. Provides electrical control systems and switchgear for commercial, industrial and institutional applications.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Nu-Source Technologies',
    website: 'https://nu-source.com',
    phone: '(631) 460-0351',
    address: '196A Williams St, Shirley, NY 11967',
    city: 'Shirley', state: 'new-york',
    founded_year: 1990,
    employee_count: '10-49',
    products: ['Switchgear', 'Power Distribution Panels', 'Control Panels'],
    industries_served: ['Telecom', 'Energy', 'Industrial'],
    certifications: [],
    description: 'Nu-Source Technologies fabricates electrical switchgear and distribution panels. Its turnkey solutions serve the telecom, energy and industrial sectors.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Bruce Electric Equipment Corp.',
    website: 'https://www.bruceelectric.com',
    phone: '(631) 584-4700',
    address: '1995 Independence Blvd, Holbrook, NY 11741',
    city: 'Holbrook', state: 'new-york',
    founded_year: 1944,
    employee_count: '200-499',
    products: ['Substation Switchgear', 'Power Distribution'],
    industries_served: ['Utilities', 'Industrial'],
    certifications: [],
    description: 'Bruce Electric is a manufacturer of power distribution switchgear. Offers medium- and high-voltage switchgear solutions for utility and industrial power systems.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'H.O. Penn Machinery Company',
    website: 'https://www.hopenn.com',
    phone: '(800) 796-7272',
    address: '14 Garnsey Rd, Pittsford, NY 14534',
    city: 'Pittsford', state: 'new-york',
    founded_year: 1970,
    employee_count: '500-999',
    products: ['Electrical Switchgear', 'Generator Sets'],
    industries_served: ['Construction', 'Mining', 'Agriculture'],
    certifications: [],
    description: 'H.O. Penn Machinery is an equipment distributor and rental provider. Supplies electrical distribution equipment, including switchgear and transfer switches, to construction, mining and agriculture customers.',
    category: 'electrical-manufacturers',
  },

  // ── Electrical Manufacturers — New York (Wire & Cable) ───────────────────

  {
    name: 'Okonite Company',
    website: 'https://www.okonite.com',
    phone: '(212) 897-3000',
    address: '1185 Avenue of the Americas, New York, NY 10036',
    city: 'New York', state: 'new-york',
    founded_year: 1878,
    employee_count: '500-999',
    products: ['Power Cable', 'Instrumentation Cable', 'Control Cable'],
    industries_served: ['Utilities', 'Industrial', 'Commercial'],
    certifications: ['UL Listed', 'ICEA Standards'],
    description: 'Okonite is a New York-based manufacturer of rubber-insulated power and control cables. Cables are used in industrial facilities, power plants and utility distribution, built to UL and ICEA specifications.',
    category: 'electrical-manufacturers',
  },
  {
    name: 'Champlain Cable Corporation',
    website: 'https://www.champlaincable.com',
    phone: '(315) 768-3937',
    address: '205 Division St, Plattsburgh, NY 12901',
    city: 'Plattsburgh', state: 'new-york',
    founded_year: 1946,
    employee_count: '50-199',
    products: ['Copper & Aluminum Wire', 'Copper Tubing'],
    industries_served: ['HVAC', 'Plumbing', 'Electrical'],
    certifications: [],
    description: 'Champlain Cable manufactures copper and aluminum wire and tubing. Based in upstate New York, products include building wire, refrigerant tubing and electrical construction materials serving HVAC and construction industries.',
    category: 'electrical-manufacturers',
  },

  // ── Electrical Manufacturers — Indiana ───────────────────────────────────

  {
    name: 'Cummins Inc.',
    website: 'https://www.cummins.com',
    phone: '(800) CUMMINS',
    address: '500 Jackson St, Columbus, IN 47201',
    city: 'Columbus', state: 'indiana',
    founded_year: 1919,
    employee_count: '1000+',
    products: ['Engines', 'Generators', 'Transfer Switches', 'Switchgear'],
    industries_served: ['Construction', 'Power Generation', 'Marine', 'Industrial'],
    certifications: [],
    description: "Cummins Inc. is a global power solutions company that, among other products, offers transfer switches and switchgear for generator power systems. Equipment is used in construction, industrial and backup power applications.",
    category: 'electrical-manufacturers',
  },

  // ── Electronics & Semiconductor — California ──────────────────────────────

  {
    name: 'Intel Corporation',
    website: 'https://www.intel.com',
    phone: '(408) 765-8080',
    address: '2200 Mission College Blvd, Santa Clara, CA 95054',
    city: 'Santa Clara', state: 'california',
    founded_year: 1968,
    employee_count: '1000+',
    products: ['Microprocessors', 'Chipsets', 'Memory', 'FPGA'],
    industries_served: ['Computing', 'Data Centers', 'IoT', 'Automotive'],
    certifications: [],
    description: 'Intel is a leading semiconductor company based in California. Designs and manufactures microprocessors, chipsets, memory and FPGA products for computing, communications and data center markets.',
    category: 'electronics-semiconductor-manufacturers',
  },
  {
    name: 'NVIDIA Corporation',
    website: 'https://www.nvidia.com',
    phone: '(408) 486-2000',
    address: '2788 San Tomas Expressway, Santa Clara, CA 95051',
    city: 'Santa Clara', state: 'california',
    founded_year: 1993,
    employee_count: '1000+',
    products: ['GPUs', 'AI Accelerators', 'Embedded Systems'],
    industries_served: ['Gaming', 'AI', 'Automotive', 'Cloud Computing'],
    certifications: [],
    description: 'NVIDIA is a semiconductor company specializing in graphics processing units (GPUs) and AI accelerators. Based in California, its chips power gaming, professional visualization, data center and automotive AI platforms.',
    category: 'electronics-semiconductor-manufacturers',
  },
  {
    name: 'AMD (Advanced Micro Devices)',
    website: 'https://www.amd.com',
    phone: '(408) 749-4000',
    address: '2485 Augustine Dr, Santa Clara, CA 95054',
    city: 'Santa Clara', state: 'california',
    founded_year: 1969,
    employee_count: '2000-4999',
    products: ['CPUs', 'GPUs', 'APUs'],
    industries_served: ['PC', 'Gaming', 'Data Center'],
    certifications: [],
    description: 'AMD is a California-based semiconductor designer and manufacturer. Produces CPUs, GPUs and APUs (combined CPU/GPU chips) for PCs, servers and gaming consoles.',
    category: 'electronics-semiconductor-manufacturers',
  },
  {
    name: 'Qualcomm Technologies',
    website: 'https://www.qualcomm.com',
    phone: '(858) 587-1121',
    address: '5775 Morehouse Dr, San Diego, CA 92121',
    city: 'San Diego', state: 'california',
    founded_year: 1985,
    employee_count: '1000+',
    products: ['Mobile SoCs', 'Modems', 'RF Transceivers'],
    industries_served: ['Mobile Devices', 'Automotive', 'IoT'],
    certifications: [],
    description: 'Qualcomm is a semiconductor and telecommunications equipment company based in California. Designs and supplies chips and modems for mobile phones and wireless devices, as well as automotive and IoT applications.',
    category: 'electronics-semiconductor-manufacturers',
  },
  {
    name: 'Broadcom Inc.',
    website: 'https://www.broadcom.com',
    phone: '(949) 926-5000',
    address: '1320 Ridder Park Dr, San Jose, CA 95131',
    city: 'San Jose', state: 'california',
    founded_year: 1961,
    employee_count: '10000+',
    products: ['Semiconductor Solutions', 'Network Processors', 'Wireless Chips'],
    industries_served: ['Enterprise Networking', 'Broadband', 'Storage'],
    certifications: [],
    description: 'Broadcom is a California-based semiconductor company known for its wide portfolio of semiconductor solutions including network processors, broadband access chips and storage controllers. Products serve enterprise, mobile and storage markets.',
    category: 'electronics-semiconductor-manufacturers',
  },
  {
    name: 'Marvell Technology',
    website: 'https://www.marvell.com',
    phone: '(408) 222-2500',
    address: '3380 Scott Blvd, Santa Clara, CA 95054',
    city: 'Santa Clara', state: 'california',
    founded_year: 1995,
    employee_count: '5000-9999',
    products: ['Storage Controllers', 'Networking Processors', 'Wi-Fi Chips'],
    industries_served: ['Data Centers', 'Mobile', 'Automotive'],
    certifications: [],
    description: 'Marvell is a semiconductor company based in California that designs and produces a variety of chips, including storage controllers, networking processors and wireless connectivity solutions used in data centers, mobile devices and automotive systems.',
    category: 'electronics-semiconductor-manufacturers',
  },
  {
    name: 'Skyworks Solutions',
    website: 'https://www.skyworksinc.com',
    phone: '(949) 231-1100',
    address: '4650 Cushing Pkwy, Fremont, CA 94538',
    city: 'Irvine', state: 'california',
    founded_year: 1962,
    employee_count: '5000-9999',
    products: ['RF Semiconductors', 'Amplifiers', 'Filter Components'],
    industries_served: ['Wireless Communications', 'IoT', 'Automotive'],
    certifications: [],
    description: 'Skyworks Solutions is a semiconductor company that designs and manufactures RF and analog semiconductors. Based in California, products include amplifiers, switches and filters used in wireless communications and IoT devices.',
    category: 'electronics-semiconductor-manufacturers',
  },
  {
    name: 'Western Digital Corporation',
    website: 'https://www.westerndigital.com',
    phone: '(949) 672-7000',
    address: '5601 Great Oaks Pkwy, San Jose, CA 95119',
    city: 'San Jose', state: 'california',
    founded_year: 1970,
    employee_count: '10000+',
    products: ['Hard Drives', 'Flash Memory', 'SSD Controllers'],
    industries_served: ['Data Storage', 'Enterprise', 'Consumer'],
    certifications: [],
    description: 'Western Digital is a data storage company headquartered in California. Develops and manufactures hard drives, solid-state drives and flash memory controllers for consumer, enterprise and industrial markets.',
    category: 'electronics-semiconductor-manufacturers',
  },

  // ── Electronics & Semiconductor — North Carolina ──────────────────────────

  {
    name: 'Qorvo Inc.',
    website: 'https://www.qorvo.com',
    phone: '(800) 803-6143',
    address: '7628 Thorndike Rd, Greensboro, NC 27409',
    city: 'Greensboro', state: 'north-carolina',
    founded_year: 2015,
    employee_count: '5000-9999',
    products: ['RF Solutions', 'Wireless Chipsets', 'Switches'],
    industries_served: ['Mobile', 'RF Communications', 'Aerospace'],
    certifications: [],
    description: 'Qorvo is a wireless semiconductor company based in North Carolina. Produces RF solutions and wireless chipsets used in mobile devices, infrastructure and aerospace/defense markets.',
    category: 'electronics-semiconductor-manufacturers',
  },

  // ── Electronics & Semiconductor — Texas ───────────────────────────────────

  {
    name: 'Texas Instruments',
    website: 'https://www.ti.com',
    phone: '(972) 995-3773',
    address: '12500 TI Blvd, Dallas, TX 75243',
    city: 'Dallas', state: 'texas',
    founded_year: 1951,
    employee_count: '10000+',
    products: ['Analog ICs', 'Embedded Processors', 'Wireless Transceivers'],
    industries_served: ['Automotive', 'Industrial', 'Consumer Electronics', 'Communication'],
    certifications: [],
    description: 'Texas Instruments (TI) is a semiconductor manufacturer headquartered in Texas. Produces analog and embedded processing chips used in a wide range of applications including automotive, industrial controls and consumer electronics.',
    category: 'electronics-semiconductor-manufacturers',
  },
  {
    name: 'NXP Semiconductors USA',
    website: 'https://www.nxp.com',
    phone: '(512) 336-7500',
    address: '2700 NE Innovation Ave, Allen, TX 75013',
    city: 'Allen', state: 'texas',
    founded_year: 2006,
    employee_count: '15000+',
    products: ['Microcontrollers', 'RFID Chips', 'Automotive ICs'],
    industries_served: ['Automotive', 'IoT', 'Mobile'],
    certifications: [],
    description: 'NXP is a global semiconductor company with significant U.S. operations in Texas. Designs and manufactures chips for automotive, industrial and IoT applications, including microcontrollers and secure identification ICs.',
    category: 'electronics-semiconductor-manufacturers',
  },
  {
    name: 'Samsung Austin Semiconductor',
    website: 'https://www.samsung.com',
    phone: '(512) 602-6900',
    address: '12100 Samsung Blvd, Austin, TX 78754',
    city: 'Austin', state: 'texas',
    founded_year: 1997,
    employee_count: '1000-4999',
    products: ['DRAM Memory', 'Solid State Drives', 'Semiconductor Foundry Services'],
    industries_served: ['Memory', 'Data Storage', 'Smartphones'],
    certifications: [],
    description: 'Samsung Austin Semiconductor is a major memory chip fabrication facility located in Texas. Manufactures DRAM and flash memory products for Samsung global electronics business and also offers foundry services.',
    category: 'electronics-semiconductor-manufacturers',
  },
  {
    name: 'Infineon Technologies Americas',
    website: 'https://www.infineon.com',
    phone: '(512) 879-3300',
    address: '5325 Hellyer Ave, San Jose, CA 95138',
    city: 'Austin', state: 'texas',
    founded_year: 1999,
    employee_count: '3000-9999',
    products: ['Power Semiconductors', 'Microcontrollers', 'Security ICs'],
    industries_served: ['Automotive', 'Industrial', 'IoT'],
    certifications: [],
    description: 'Infineon is a semiconductor manufacturer with a U.S. design center in Texas. Specializes in power and security semiconductors, including power management ICs and microcontrollers for automotive and industrial applications.',
    category: 'electronics-semiconductor-manufacturers',
  },
  {
    name: 'Analog Devices Inc.',
    website: 'https://www.analog.com',
    phone: '(603) 316-2600',
    address: '12500 TI Blvd, Dallas, TX 75243',
    city: 'Austin', state: 'texas',
    founded_year: 1965,
    employee_count: '10000+',
    products: ['Analog ICs', 'Mixed-Signal Processors', 'Data Converters'],
    industries_served: ['Industrial', 'Healthcare', 'Automotive'],
    certifications: [],
    description: 'Analog Devices is a semiconductor company specializing in analog, mixed-signal and digital signal processing technologies. Has U.S. operations in Texas and designs chips for industrial, instrumentation and automotive markets.',
    category: 'electronics-semiconductor-manufacturers',
  },

  // ── Electronics & Semiconductor — New York ────────────────────────────────

  {
    name: 'GlobalFoundries',
    website: 'https://www.globalfoundries.com',
    phone: '(518) 327-8400',
    address: '400 Stonebreak Rd, Malta, NY 12020',
    city: 'Malta', state: 'new-york',
    founded_year: 2009,
    employee_count: '5000-9999',
    products: ['Semiconductor Foundry Services', 'CMOS Chips', 'Specialty ICs'],
    industries_served: ['Microelectronics', 'Wireless', 'IoT'],
    certifications: [],
    description: "GlobalFoundries operates the world's largest semiconductor fabrication plant in Malta, NY. Provides foundry manufacturing services for a variety of integrated circuits, serving customers in microelectronics, mobile, IoT and automotive markets.",
    category: 'electronics-semiconductor-manufacturers',
  },
  {
    name: 'IBM Microelectronics',
    website: 'https://www.ibm.com',
    phone: '(914) 499-1900',
    address: '207 Satillo Cir, East Fishkill, NY 12533',
    city: 'East Fishkill', state: 'new-york',
    founded_year: 1951,
    employee_count: '1000-4999',
    products: ['Custom ICs', 'Microprocessors', 'CMOS Logic'],
    industries_served: ['Technology', 'Aerospace', 'Defense'],
    certifications: [],
    description: 'IBM Microelectronics operates semiconductor research and manufacturing facilities in East Fishkill, New York. Develops advanced CMOS processes and fabricates custom integrated circuits for technology, aerospace and defense applications.',
    category: 'electronics-semiconductor-manufacturers',
  },

  // ── Mechanical Manufacturers — California (CNC) ───────────────────────────

  {
    name: "M.A.R.'s Engineering Company",
    website: 'https://www.marseng.com',
    phone: '(510) 483-0541',
    address: '2928 Janice Way, San Leandro, CA 94577',
    city: 'San Leandro', state: 'california',
    founded_year: 1964,
    employee_count: '50-99',
    products: ['Precision Screw Machine Parts', 'Machined Components'],
    industries_served: ['Aerospace', 'Medical', 'Electronics'],
    certifications: ['ISO 9001'],
    description: "M.A.R.'s Engineering is a precision machining company offering screw machining and CNC services. Since 1964 has produced high-accuracy turned components for aerospace, medical and electronic industries.",
    category: 'mechanical-manufacturers',
  },
  {
    name: 'Pacific West America',
    website: 'https://www.pacificwestamerica.com',
    phone: '(866) 317-0208',
    address: '22287 Mulholland Hwy, Unit 184, Calabasas, CA 91302',
    city: 'Calabasas', state: 'california',
    founded_year: 1995,
    employee_count: '50-99',
    products: ['Precision Machined Parts', 'Membrane Switches', 'PCBs'],
    industries_served: ['Electronics', 'Defense', 'Medical'],
    certifications: [],
    description: 'Pacific West America is a precision manufacturing company specializing in CNC machining and Swiss screw machining of small, intricate parts for the electronics and defense industries. Also offers PCB fabrication and assembly services.',
    category: 'mechanical-manufacturers',
  },
  {
    name: 'Aaero Swiss',
    website: 'https://aaeroswiss.com',
    phone: '(714) 575-8990',
    address: '1011 E Central Ave, Anaheim, CA 92805',
    city: 'Anaheim', state: 'california',
    founded_year: 2001,
    employee_count: '10-49',
    products: ['Precision Medical Components', 'Machine Parts'],
    industries_served: ['Medical', 'Aerospace', 'Defense', 'Automotive'],
    certifications: [],
    description: 'Aaero Swiss provides precision CNC machining services using Swiss screw machines. Produces high-quality small-diameter parts for industries including medical, dental, aerospace, defense and automotive.',
    category: 'mechanical-manufacturers',
  },
  {
    name: 'Advanced Machining Techniques',
    website: 'https://www.amtcal.com',
    phone: '(408) 778-4500',
    address: '9335 Business Park Dr, Morgan Hill, CA 95037',
    city: 'Morgan Hill', state: 'california',
    founded_year: 1986,
    employee_count: '50-99',
    products: ['CNC Machined Components', 'Sheet Metal Fabrications'],
    industries_served: ['Aerospace', 'Defense', 'Clean Tech'],
    certifications: ['ISO 9001', 'AS9100'],
    description: 'Advanced Machining Techniques is a California machine shop providing vertical/horizontal CNC milling, turning, screw machining, sheetmetal fabrication, welding and cleanroom assembly services. Founded in 1986, serves aerospace and industrial customers.',
    category: 'mechanical-manufacturers',
  },
  {
    name: 'Aspex Corporation',
    website: 'https://www.aspex.us',
    phone: '(858) 735-5145',
    address: '9457 Ridgehaven Ct, San Diego, CA 92123',
    city: 'San Diego', state: 'california',
    founded_year: 1970,
    employee_count: '200-499',
    products: ['CNC Machined Parts', 'Automated Assembly Machines'],
    industries_served: ['Automation', 'Semiconductor', 'Medical'],
    certifications: [],
    description: 'Aspex Corporation offers precision CNC machining and custom manufacturing solutions. In addition to machined parts, provides automated assembly and packaging machines for semiconductor and medical device industries.',
    category: 'mechanical-manufacturers',
  },
  {
    name: 'Dangar Engineering & Mfg.',
    website: 'https://www.dangar.com',
    phone: '(805) 376-2974',
    address: '1746F S Victoria Ave #351, Ventura, CA 93003',
    city: 'Ventura', state: 'california',
    founded_year: 1954,
    employee_count: '50-99',
    products: ['Large Precision CNC Parts', 'Tooling', 'Prototypes'],
    industries_served: ['Aerospace', 'Automotive', 'Commercial', 'Medical', 'Marine'],
    certifications: [],
    description: 'Dangar Engineering specializes in large precision CNC machining, including 5-axis milling of complex parts and tooling. Products serve aerospace, automotive, medical and commercial industries.',
    category: 'mechanical-manufacturers',
  },
  {
    name: 'Edward Koehn Co.',
    website: 'https://ekmfg.com',
    phone: '(800) 666-6256',
    address: '820 Folger Avenue, Berkeley, CA 94710',
    city: 'Berkeley', state: 'california',
    founded_year: 1943,
    employee_count: '50-99',
    products: ['Swiss Machined Components', 'Screw Machine Parts'],
    industries_served: ['Biomedical', 'Energy', 'Electrical', 'Industrial'],
    certifications: ['ISO 9001:2015'],
    description: 'Edward Koehn Co. produces precision-turned components using Swiss CNC machining and other methods. Since 1943 has served biomedical, industrial, electrical and energy sectors, focusing on quality and ISO-certified processes.',
    category: 'mechanical-manufacturers',
  },
  {
    name: 'JACO Machine Works',
    website: 'https://www.jacomachineworks.com',
    phone: '(877) 429-8175',
    address: '719 Industrial Blvd, Santa Clara, CA 95054',
    city: 'Santa Clara', state: 'california',
    founded_year: 1990,
    employee_count: '10-49',
    products: ['Precision Machined Components'],
    industries_served: ['Aerospace', 'Defense', 'Medical'],
    certifications: [],
    description: 'JACO Machine Works specializes in precision Swiss-type CNC machining and small-part manufacturing for aerospace, defense and medical customers.',
    category: 'mechanical-manufacturers',
  },
  {
    name: 'Norck Inc.',
    website: 'https://www.norck.com',
    phone: '(949) 232-0251',
    address: '7 Steeplechase, Irvine, CA 92618',
    city: 'Irvine', state: 'california',
    founded_year: 1984,
    employee_count: '10-49',
    products: ['Turned Parts', 'CNC Machined Components'],
    industries_served: ['Medical', 'Aerospace', 'Defense'],
    certifications: [],
    description: 'Norck is a precision machine shop offering screw machining and CNC services. Manufactures precision-turned parts and machined components for medical, aerospace and defense industries.',
    category: 'mechanical-manufacturers',
  },
  {
    name: 'Radian Machining',
    website: 'https://www.radianmachining.com',
    phone: '(408) 663-6353',
    address: '1338 Franklin St #142, Santa Clara, CA 95054',
    city: 'Santa Clara', state: 'california',
    founded_year: 1996,
    employee_count: '10-49',
    products: ['CNC Machined Components', 'Prototypes'],
    industries_served: ['Technology', 'Industrial', 'Medical'],
    certifications: [],
    description: 'Radian Machining provides CNC milling and turning services, specializing in prototype and short-run production parts. Serves technology and industrial customers.',
    category: 'mechanical-manufacturers',
  },
];

// ── State UUID map (from DB) ──────────────────────────────────────────────────
const STATE_IDS = {
  'california':    'bf447ef5-f4ec-4a44-aee8-cc537c7a20cd',
  'texas':         '6408cf3f-8fe4-43fd-8742-c123eeb38a59',
  'new-york':      'd93539f2-5f5a-46a5-a94c-88983ec350ed',
  'north-carolina':'a4efdb11-cce6-4fc4-9354-d54e083a7694',
  'indiana':       '771b815f-60b3-43a2-b1f0-dc46c14d8225',
};

const STATE_LABELS = {
  'california': 'California', 'texas': 'Texas', 'new-york': 'New York',
  'north-carolina': 'North Carolina', 'indiana': 'Indiana',
};

// ── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  console.log('🚀 Starting seed...\n');

  // 1. Insert categories
  console.log('📂 Inserting categories...');
  for (const cat of CATEGORIES) {
    await sql`
      INSERT INTO categories (name, slug, description, "order")
      VALUES (${cat.name}, ${cat.slug}, ${cat.description}, ${cat.order})
      ON CONFLICT (slug) DO NOTHING
    `;
  }
  console.log(`   ✓ ${CATEGORIES.length} categories upserted`);

  // 2. Get category ID map
  const catRows = await sql`SELECT id, slug FROM categories`;
  const catIds = Object.fromEntries(catRows.map(r => [r.slug, r.id]));

  // 3. Get existing company slugs to skip dupes
  const existing = await sql`SELECT slug FROM companies`;
  const existingSlugs = new Set(existing.map(r => r.slug));
  console.log(`\n🔍 ${existingSlugs.size} companies already in DB`);

  // 4. Deduplicate within our insert set (by normalized name)
  const seenNames = new Set();
  const toInsert = [];
  for (const co of COMPANIES) {
    const normalized = co.name.toLowerCase().replace(/\s+/g, ' ').trim();
    if (seenNames.has(normalized)) {
      console.log(`   ⚠ Skipping duplicate (in file): ${co.name}`);
      continue;
    }
    seenNames.add(normalized);
    const slug = slugify(co.name);
    if (existingSlugs.has(slug)) {
      console.log(`   ⚠ Skipping already in DB: ${co.name}`);
      continue;
    }
    toInsert.push({ ...co, slug });
  }

  // 5. Insert companies + category links
  console.log(`\n🏭 Inserting ${toInsert.length} companies...`);
  let inserted = 0, skipped = 0;

  for (const co of toInsert) {
    const stateId = STATE_IDS[co.state];
    if (!stateId) {
      console.log(`   ⚠ Unknown state "${co.state}" for ${co.name} — skipping`);
      skipped++;
      continue;
    }

    const catId = catIds[co.category];
    if (!catId) {
      console.log(`   ⚠ Unknown category "${co.category}" for ${co.name} — skipping`);
      skipped++;
      continue;
    }

    // Insert company
    const [row] = await sql`
      INSERT INTO companies (
        name, slug, description, website, phone, address,
        hq_city, hq_state_id, hq_state_label, country,
        products, industries_served, certifications,
        founded_year, employee_count,
        data_source, approved, is_verified
      ) VALUES (
        ${co.name}, ${co.slug}, ${co.description || null}, ${co.website || null},
        ${co.phone || null}, ${co.address || null},
        ${co.city || null}, ${stateId}, ${STATE_LABELS[co.state]},
        ${'United States'},
        ${co.products || []}, ${co.industries_served || []}, ${co.certifications || []},
        ${co.founded_year || null}, ${co.employee_count || null},
        ${'deep-research'}, ${true}, ${false}
      )
      ON CONFLICT (slug) DO NOTHING
      RETURNING id
    `;

    if (!row) { skipped++; continue; }

    // Insert category link
    await sql`
      INSERT INTO company_categories (company_id, category_id)
      VALUES (${row.id}, ${catId})
      ON CONFLICT DO NOTHING
    `;

    inserted++;
    if (inserted % 10 === 0) process.stdout.write(`   ${inserted}/${toInsert.length}...\r`);
  }

  console.log(`\n\n✅ Done!`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Skipped:  ${skipped}`);
  console.log(`   Total companies in list: ${COMPANIES.length}`);
})().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
