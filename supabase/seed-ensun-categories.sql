-- =============================================================================
-- FirmsLedger: 43 New Categories from ensun.io research (2026-03-29)
-- Grouped under relevant parent categories
-- Run: psql or Supabase SQL editor
-- Safe to re-run (ON CONFLICT DO NOTHING)
-- =============================================================================

-- ── HEALTHCARE & MEDICAL ─────────────────────────────────────────────────────

-- Parent: Healthcare & Medical
INSERT INTO categories (name, slug, description, is_parent, "order") VALUES
  ('Healthcare & Medical', 'healthcare-medical', 'Healthcare, medical devices, dental, pharmaceutical, and biotech companies worldwide.', true, 100)
ON CONFLICT (slug) DO NOTHING;

-- Children
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT v.name, v.slug, v.description, false, c.id, v.ord
FROM (VALUES
  ('Dental', 'dental', 'Dental equipment manufacturers, dental care providers, and dental technology companies.', 1),
  ('Pharmaceutical', 'pharmaceutical', 'Pharmaceutical companies including drug manufacturers, biotech firms, and pharma distributors.', 2),
  ('Stent', 'stent', 'Stent manufacturers and cardiovascular medical device companies.', 3),
  ('Vitamin', 'vitamin', 'Vitamin and dietary supplement manufacturers and distributors.', 4),
  ('Neurotechnology', 'neurotechnology', 'Neurotechnology companies specializing in brain-computer interfaces, neuromodulation, and neural analytics.', 5)
) v(name, slug, description, ord)
CROSS JOIN categories c WHERE c.slug = 'healthcare-medical'
ON CONFLICT (slug) DO NOTHING;


-- ── MANUFACTURING & INDUSTRIAL ───────────────────────────────────────────────

INSERT INTO categories (name, slug, description, is_parent, "order") VALUES
  ('Manufacturing & Industrial', 'manufacturing-industrial', 'Industrial manufacturing including forging, molding, pipes, transformers, and heavy equipment.', true, 110)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT v.name, v.slug, v.description, false, c.id, v.ord
FROM (VALUES
  ('Forging', 'forging', 'Forging companies specializing in metal forming, die forging, and precision forged components.', 1),
  ('Rotational Molding', 'rotational-molding', 'Rotational molding manufacturers producing plastic tanks, containers, and custom molded products.', 2),
  ('Pipe', 'pipe', 'Pipe manufacturers including steel pipes, PVC pipes, composite pipes, and pipeline solutions.', 3),
  ('Transformer', 'transformer', 'Electrical transformer manufacturers including power transformers, distribution transformers, and custom solutions.', 4),
  ('Gas Cylinder', 'gas-cylinder', 'Gas cylinder manufacturers producing high-pressure cylinders for industrial, medical, and specialty gases.', 5),
  ('Automotive Glass', 'automotive-glass', 'Automotive glass manufacturers specializing in windshields, tempered glass, and vehicle glass repair.', 6),
  ('Loudspeaker', 'loudspeaker', 'Loudspeaker and audio equipment manufacturers including professional audio, PA systems, and consumer speakers.', 7)
) v(name, slug, description, ord)
CROSS JOIN categories c WHERE c.slug = 'manufacturing-industrial'
ON CONFLICT (slug) DO NOTHING;


-- ── ENERGY & UTILITIES ───────────────────────────────────────────────────────

INSERT INTO categories (name, slug, description, is_parent, "order") VALUES
  ('Energy & Utilities', 'energy-utilities', 'Energy generation, electricity distribution, propane, biochar, and pyrolysis companies.', true, 120)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT v.name, v.slug, v.description, false, c.id, v.ord
FROM (VALUES
  ('Electricity', 'electricity', 'Electricity generation, distribution, and retail companies including renewable energy providers.', 1),
  ('Propane', 'propane', 'Propane gas suppliers, distributors, and LPG energy companies.', 2),
  ('Biochar', 'biochar', 'Biochar producers using pyrolysis to convert organic waste into carbon-sequestering soil amendments.', 3),
  ('Pyrolysis', 'pyrolysis', 'Pyrolysis technology companies specializing in thermal decomposition for waste-to-energy and material recovery.', 4)
) v(name, slug, description, ord)
CROSS JOIN categories c WHERE c.slug = 'energy-utilities'
ON CONFLICT (slug) DO NOTHING;


-- ── ELECTRONICS & TECHNOLOGY ─────────────────────────────────────────────────

INSERT INTO categories (name, slug, description, is_parent, "order") VALUES
  ('Electronics & Technology', 'electronics-technology', 'Semiconductor, computer, printer, satellite, quantum security, and consumer electronics companies.', true, 130)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT v.name, v.slug, v.description, false, c.id, v.ord
FROM (VALUES
  ('Semiconductor', 'semiconductor', 'Semiconductor companies including chip designers, foundries, and semiconductor equipment makers.', 1),
  ('Computer', 'computer', 'Computer manufacturers, IT hardware companies, and computing technology providers.', 2),
  ('Printer', 'printer', 'Printer manufacturers including laser, inkjet, 3D printers, and managed print service providers.', 3),
  ('Satellite', 'satellite', 'Satellite companies including satellite operators, earth observation, and space-based communication providers.', 4),
  ('Quantum Security', 'quantum-security', 'Quantum security and post-quantum cryptography companies protecting against quantum computing threats.', 5),
  ('ATM', 'atm', 'ATM manufacturers, banking automation, and self-service kiosk companies.', 6)
) v(name, slug, description, ord)
CROSS JOIN categories c WHERE c.slug = 'electronics-technology'
ON CONFLICT (slug) DO NOTHING;


-- ── CONSTRUCTION & INFRASTRUCTURE ────────────────────────────────────────────

INSERT INTO categories (name, slug, description, is_parent, "order") VALUES
  ('Construction & Infrastructure', 'construction-infrastructure', 'Construction companies, elevator manufacturers, and infrastructure development firms.', true, 140)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT v.name, v.slug, v.description, false, c.id, v.ord
FROM (VALUES
  ('Construction', 'construction', 'Construction companies specializing in commercial, residential, and infrastructure projects.', 1),
  ('Elevator', 'elevator', 'Elevator and escalator manufacturers, installers, and maintenance service providers.', 2)
) v(name, slug, description, ord)
CROSS JOIN categories c WHERE c.slug = 'construction-infrastructure'
ON CONFLICT (slug) DO NOTHING;


-- ── CHEMICALS & MATERIALS ────────────────────────────────────────────────────

INSERT INTO categories (name, slug, description, is_parent, "order") VALUES
  ('Chemicals & Materials', 'chemicals-materials', 'Chemical manufacturers, resin producers, lactose suppliers, and biostimulant companies.', true, 150)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT v.name, v.slug, v.description, false, c.id, v.ord
FROM (VALUES
  ('Resin', 'resin', 'Resin manufacturers including epoxy, polyester, thermoplastic elastomers, and specialty resins.', 1),
  ('Lactose', 'lactose', 'Lactose manufacturers and dairy ingredient suppliers for food and pharmaceutical industries.', 2),
  ('Biostimulant', 'biostimulant', 'Biostimulant companies producing biological crop enhancement products for sustainable agriculture.', 3),
  ('Cosmetics', 'cosmetics', 'Cosmetics manufacturers including skincare, makeup, haircare, and personal care product companies.', 4)
) v(name, slug, description, ord)
CROSS JOIN categories c WHERE c.slug = 'chemicals-materials'
ON CONFLICT (slug) DO NOTHING;


-- ── AGRICULTURE & FARMING ────────────────────────────────────────────────────

INSERT INTO categories (name, slug, description, is_parent, "order") VALUES
  ('Agriculture & Farming', 'agriculture-farming', 'Agriculture companies, fertilizer manufacturers, and agrochemical producers.', true, 160)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT v.name, v.slug, v.description, false, c.id, v.ord
FROM (VALUES
  ('Agriculture', 'agriculture', 'Agricultural companies including farming equipment, crop management, and agribusiness firms.', 1),
  ('Fertilizer', 'fertilizer', 'Fertilizer manufacturers producing nitrogen, phosphate, potash, and organic fertilizers.', 2),
  ('Agrochemical', 'agrochemical', 'Agrochemical companies producing pesticides, herbicides, fungicides, and crop protection solutions.', 3)
) v(name, slug, description, ord)
CROSS JOIN categories c WHERE c.slug = 'agriculture-farming'
ON CONFLICT (slug) DO NOTHING;


-- ── TEXTILES & APPAREL ───────────────────────────────────────────────────────

INSERT INTO categories (name, slug, description, is_parent, "order") VALUES
  ('Textiles & Apparel', 'textiles-apparel', 'Clothing, hosiery, and textile manufacturing companies.', true, 170)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT v.name, v.slug, v.description, false, c.id, v.ord
FROM (VALUES
  ('Clothing', 'clothing', 'Clothing manufacturers and fashion companies including apparel brands and garment exporters.', 1),
  ('Hosiery', 'hosiery', 'Hosiery manufacturers producing socks, stockings, tights, and shapewear.', 2)
) v(name, slug, description, ord)
CROSS JOIN categories c WHERE c.slug = 'textiles-apparel'
ON CONFLICT (slug) DO NOTHING;


-- ── AEROSPACE & DEFENSE ──────────────────────────────────────────────────────

INSERT INTO categories (name, slug, description, is_parent, "order") VALUES
  ('Aerospace & Defense', 'aerospace-defense', 'Aerospace, defense, ammunition, and military technology companies.', true, 180)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT v.name, v.slug, v.description, false, c.id, v.ord
FROM (VALUES
  ('Aerospace', 'aerospace', 'Aerospace companies including aircraft maintenance, space technology, and aviation services.', 1),
  ('Ammunition', 'ammunition', 'Ammunition manufacturers and defense ordnance companies.', 2),
  ('Gunpowder', 'gunpowder', 'Gunpowder and commercial explosives manufacturers for mining, demolition, and defense.', 3)
) v(name, slug, description, ord)
CROSS JOIN categories c WHERE c.slug = 'aerospace-defense'
ON CONFLICT (slug) DO NOTHING;


-- ── TRANSPORTATION & LOGISTICS ───────────────────────────────────────────────

INSERT INTO categories (name, slug, description, is_parent, "order") VALUES
  ('Transportation & Logistics', 'transportation-logistics', 'Maritime, shipping, delivery drone, and logistics companies.', true, 190)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT v.name, v.slug, v.description, false, c.id, v.ord
FROM (VALUES
  ('Maritime', 'maritime', 'Maritime companies including shipping lines, port operators, and marine logistics providers.', 1),
  ('Shipping', 'shipping', 'Shipping and freight companies including ocean freight, air freight, and last-mile delivery.', 2),
  ('Delivery Drone', 'delivery-drone', 'Delivery drone companies building autonomous aerial delivery systems for cargo and packages.', 3)
) v(name, slug, description, ord)
CROSS JOIN categories c WHERE c.slug = 'transportation-logistics'
ON CONFLICT (slug) DO NOTHING;


-- ── HOME & LIFESTYLE ─────────────────────────────────────────────────────────

INSERT INTO categories (name, slug, description, is_parent, "order") VALUES
  ('Home & Lifestyle', 'home-lifestyle', 'Lighting, refrigerator, mattress, and home appliance companies.', true, 200)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT v.name, v.slug, v.description, false, c.id, v.ord
FROM (VALUES
  ('Lighting', 'lighting', 'Lighting manufacturers including LED, architectural lighting, smart lighting, and industrial lighting.', 1),
  ('Refrigerator', 'refrigerator', 'Refrigerator and cooling equipment manufacturers for residential, commercial, and industrial use.', 2),
  ('Mattress', 'mattress', 'Mattress manufacturers and sleep technology companies.', 3)
) v(name, slug, description, ord)
CROSS JOIN categories c WHERE c.slug = 'home-lifestyle'
ON CONFLICT (slug) DO NOTHING;


-- ── FINANCIAL SERVICES ───────────────────────────────────────────────────────

INSERT INTO categories (name, slug, description, is_parent, "order") VALUES
  ('Financial Services', 'financial-services', 'Funding, banking technology, and financial service providers.', true, 210)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT v.name, v.slug, v.description, false, c.id, v.ord
FROM (VALUES
  ('Funding', 'funding', 'Funding companies including venture capital, microfinance, loans, and crowdfunding platforms.', 1)
) v(name, slug, description, ord)
CROSS JOIN categories c WHERE c.slug = 'financial-services'
ON CONFLICT (slug) DO NOTHING;


-- =============================================================================
-- SUMMARY: 43 new categories added under 12 parent groups
-- Parents: healthcare-medical, manufacturing-industrial, energy-utilities,
--   electronics-technology, construction-infrastructure, chemicals-materials,
--   agriculture-farming, textiles-apparel, aerospace-defense,
--   transportation-logistics, home-lifestyle, financial-services
-- =============================================================================
