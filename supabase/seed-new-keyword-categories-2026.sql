-- =============================================================================
-- FirmsLedger: New Keyword-Targeted Categories (April 2026)
-- Based on high-volume search keyword research
-- Safe to re-run: all inserts use ON CONFLICT (slug) DO NOTHING
-- Run in: Supabase SQL Editor
-- =============================================================================


-- ── TELECOM: Prepaid, Satellite TV, SIP ──────────────────────────────────────

INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT v.name, v.slug, v.description, false, c.id, v.ord
FROM (VALUES
  ('Prepaid Wireless',        'prepaid-wireless',       'Prepaid wireless carriers and no-contract mobile phone service providers. Compare prepaid plans, MVNO operators, and budget mobile carriers worldwide on FirmsLedger.', 101),
  ('Prepaid Phone',           'prepaid-phone',          'Prepaid phone companies offering pay-as-you-go and monthly prepaid mobile services. Find verified prepaid carriers, SIM-only plans, and budget phone providers.', 102),
  ('Phone Companies',         'phone-companies',        'Mobile and landline phone companies including telecom operators, wireless carriers, and communications service providers. Browse verified phone companies worldwide on FirmsLedger.', 103),
  ('Satellite Television',    'satellite-television',   'Satellite television service providers offering direct-broadcast satellite TV, pay-TV packages, and DTH services. Compare verified satellite TV operators and content distributors.', 104),
  ('SIP & VoIP Providers',    'sip-voip-providers',     'SIP and VoIP providers offering Session Initiation Protocol telephony, cloud PBX, and business phone systems. Find verified SIP trunking and hosted VoIP companies.', 105)
) v(name, slug, description, ord)
CROSS JOIN categories c WHERE c.slug = 'telecom'
ON CONFLICT (slug) DO NOTHING;


-- ── HEALTHCARE: Medical Ventilators ──────────────────────────────────────────

INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT v.name, v.slug, v.description, false, c.id, v.ord
FROM (VALUES
  ('Medical Ventilators', 'medical-ventilators', 'Medical ventilator manufacturers and respiratory care device companies. Compare ICU ventilators, transport ventilators, home care ventilators, and non-invasive ventilation (NIV) device makers worldwide.', 91)
) v(name, slug, description, ord)
CROSS JOIN categories c WHERE c.slug = 'healthcare-medical'
ON CONFLICT (slug) DO NOTHING;


-- ── MANUFACTURING: ATE, EMS, Hyperbaric Welding, Coating Labs ────────────────

INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT v.name, v.slug, v.description, false, c.id, v.ord
FROM (VALUES
  ('Automatic Test Equipment',          'automatic-test-equipment',          'Automatic test equipment (ATE) manufacturers and test & measurement companies. Find verified ATE vendors for semiconductor, PCB, defense, and electronics production testing.', 91),
  ('Electronic Manufacturing Services', 'electronic-manufacturing-services',  'Electronic manufacturing services (EMS) and contract electronics manufacturers (CEM). Compare PCB assembly, box build, supply chain management, and design-for-manufacture service providers.', 92),
  ('Coating Labs',                       'coating-labs',                       'Coating laboratory companies providing industrial coating testing, surface analysis, quality assurance, and coating application services for aerospace, automotive, and industrial clients.', 93),
  ('Hyperbaric Welding',                'hyperbaric-welding',                  'Hyperbaric welding companies providing underwater and pressure-vessel welding services for offshore oil & gas pipelines, marine structures, and subsea infrastructure.', 94)
) v(name, slug, description, ord)
CROSS JOIN categories c WHERE c.slug = 'manufacturing-industrial'
ON CONFLICT (slug) DO NOTHING;


-- ── FINANCIAL SERVICES: Home Warranty, Workers Comp ─────────────────────────

INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT v.name, v.slug, v.description, false, c.id, v.ord
FROM (VALUES
  ('Home Warranty',                'homeowners-warranty',       'Home warranty companies offering coverage plans for home systems and appliances. Compare verified homeowners warranty providers, service contracts, and home protection plan companies.', 91),
  ('Workers Compensation Insurance','workers-comp-insurance',    'Workers compensation insurance providers offering employer liability coverage for workplace injuries. Find verified workers comp insurers, self-insurance administrators, and occupational accident carriers.', 92)
) v(name, slug, description, ord)
CROSS JOIN categories c WHERE c.slug = 'financial-services'
ON CONFLICT (slug) DO NOTHING;


-- ── PROFESSIONAL SERVICES: Resume Writing, Virtual Assistants, Direct Sales ──

INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT v.name, v.slug, v.description, false, c.id, v.ord
FROM (VALUES
  ('Resume Writing Services', 'resume-writing-services', 'Professional resume writing services, CV preparation companies, and career coaching firms. Find verified resume writers, LinkedIn profile optimizers, and executive resume service providers worldwide.', 91),
  ('Virtual Assistants',      'virtual-assistants',      'Virtual assistant service providers offering remote administrative, executive, and operational support. Compare VA agencies, freelance virtual assistant platforms, and outsourced business support companies.', 92),
  ('Direct Sales',            'direct-sales',            'Direct sales companies, MLM organizations, and independent distribution networks. Browse verified direct selling companies, network marketing firms, and home-based business opportunity providers.', 93)
) v(name, slug, description, ord)
CROSS JOIN categories c WHERE c.slug = 'professional-services'
ON CONFLICT (slug) DO NOTHING;


-- ── CONSTRUCTION: Construction Materials ─────────────────────────────────────

INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT v.name, v.slug, v.description, false, c.id, v.ord
FROM (VALUES
  ('Construction Materials', 'construction-materials', 'Construction materials suppliers and building materials companies. Find verified suppliers of cement, steel, lumber, aggregates, insulation, roofing, and specialty construction materials worldwide.', 91)
) v(name, slug, description, ord)
CROSS JOIN categories c WHERE c.slug = 'construction-infrastructure'
ON CONFLICT (slug) DO NOTHING;


-- ── SPORTS & FITNESS: Outdoor Recreation ─────────────────────────────────────

INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT v.name, v.slug, v.description, false, c.id, v.ord
FROM (VALUES
  ('Outdoor Recreation', 'outdoor-recreation', 'Outdoor recreation brands and companies manufacturing camping, hiking, climbing, cycling, water sports, and adventure equipment. Compare verified outdoor gear makers and recreational equipment suppliers worldwide.', 91)
) v(name, slug, description, ord)
CROSS JOIN categories c WHERE c.slug = 'sports-fitness'
ON CONFLICT (slug) DO NOTHING;


-- ── FOOD SERVICES: Online Food Delivery ──────────────────────────────────────

INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT v.name, v.slug, v.description, false, c.id, v.ord
FROM (VALUES
  ('Online Food Delivery', 'online-food-delivery', 'Online food delivery platforms and app-based delivery companies. Compare food delivery services, third-party aggregators, cloud kitchen operators, and last-mile food logistics providers worldwide.', 91)
) v(name, slug, description, ord)
CROSS JOIN categories c WHERE c.slug = 'food-services-restaurant'
ON CONFLICT (slug) DO NOTHING;


-- =============================================================================
-- SUMMARY — 16 new categories added:
--
-- TELECOM (5):          prepaid-wireless, prepaid-phone, phone-companies,
--                       satellite-television, sip-voip-providers
-- HEALTHCARE (1):       medical-ventilators
-- MANUFACTURING (4):    automatic-test-equipment, electronic-manufacturing-services,
--                       coating-labs, hyperbaric-welding
-- FINANCIAL (2):        homeowners-warranty, workers-comp-insurance
-- PROFESSIONAL (3):     resume-writing-services, virtual-assistants, direct-sales
-- CONSTRUCTION (1):     construction-materials
-- SPORTS (1):           outdoor-recreation
-- FOOD SERVICES (1):    online-food-delivery
--
-- Already existed (no action needed):
--   vodka, ice-cream, breakfast-cereals, pharmaceutical, solar-energy,
--   augmented-reality, virtual-reality, health-insurance, life-insurance,
--   money-transfer, airlines, cruise-ships, car-rental, aerospace,
--   food-delivery, oil-gas, generators, paints-coatings, aftermarket-parts
-- =============================================================================
