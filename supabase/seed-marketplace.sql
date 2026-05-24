-- Marketplace seed data — run in Supabase SQL Editor

-- ── RFQs (Buyers) ────────────────────────────────────────────────────────────

INSERT INTO marketplace_rfqs (
  title, product_name, specifications, quantity, unit, budget_range,
  payment_terms, delivery_deadline, category, contact_name, contact_email,
  company_name, country, status
) VALUES

(
  'Air Fryer 2400W 6.5L Extra Large Capacity',
  'Air Fryer',
  'Extra Large Capacity, 2,400 Watts / 6.5L, digital touch panel, non-stick basket, ETL/UL certified, packaging: retail box with color print. Long-term partnership preferred.',
  1500, 'units', '$45–$65 per unit',
  'Net 30', 'Within 60 days',
  'Electronics & Components',
  'Chris Brant', 'purchasing@dotfoods.us',
  'Dot Foods Inc.', 'United States', 'open'
),

(
  'Magnesium Stearate Pharma Grade',
  'Magnesium Stearate',
  'Pharmaceutical grade, USP/EP compliant, particle size D90 < 50 micron, moisture < 6%, heavy metals < 10 ppm. Certificate of Analysis required with each batch.',
  5000, 'kg', '$3.50–$5.00/kg',
  'Net 60', 'Within 30 days',
  'Pharmaceuticals & Health',
  'David Kim', 'procurement@sunrisepharma.com',
  'Sunrise Pharmaceuticals Ltd.', 'United States', 'open'
),

(
  'HDPE Pipes 110mm PN16',
  'HDPE Pipes',
  'Diameter: 110mm, Pressure rating: PN16, Length: 6m per stick, ISO 4427 compliant, black with blue stripe, suitable for potable water.',
  800, 'pcs', '$18–$26 per piece',
  'Letter of Credit (LC)', 'Within 45 days',
  'Industrial Equipment',
  'Ahmed Al-Rashid', 'supply@gulfinfraworks.ae',
  'Gulf Infra Works LLC', 'United Arab Emirates', 'open'
),

(
  'Nitrile Examination Gloves Powder-Free',
  'Nitrile Gloves',
  'Powder-free, AQL 1.5, sizes S/M/L/XL (mixed), EN 455 & ASTM D6319 certified, 100 pcs/box, 10 boxes/carton. FDA 510(k) clearance preferred.',
  500000, 'pcs', '$0.04–$0.07 per piece',
  'Net 30', 'Within 21 days',
  'Medical Devices',
  'Sandra Müller', 's.muller@medicaresupply.de',
  'Medicare Supply GmbH', 'Germany', 'open'
),

(
  'Virgin Coconut Oil Cold Pressed',
  'Virgin Coconut Oil',
  'Cold-pressed, unrefined, moisture < 0.1%, FFA < 0.1%, USDA Organic certified, food grade, packaging in 200L drums or 1L glass bottles (both options needed).',
  20000, 'liters', '$1.80–$2.40/liter',
  'Prepayment', 'Within 30 days',
  'Food & Beverages',
  'James Okonkwo', 'james@tropicalfoodsng.com',
  'Tropical Foods Nigeria Ltd.', 'Nigeria', 'open'
),

(
  'Industrial Diesel Generator 500 kVA',
  'Diesel Generator',
  'Standby rating: 500 kVA / 400 kW, 3-phase, 50Hz, 415V, Perkins or Cummins engine, IP23 enclosure, AMF panel included, ISO 8528 compliant.',
  3, 'units', '$28,000–$38,000 per unit',
  'Letter of Credit (LC)', 'Within 90 days',
  'Industrial Equipment',
  'Priya Nair', 'procurement@buildtech.in',
  'BuildTech Infrastructure Pvt Ltd', 'India', 'open'
),

(
  'Polyester Yarn 150D/48F',
  'Polyester Yarn',
  'Semi-dull, 150 Denier / 48 Filament, FDY, tenacity ≥ 3.5 g/d, elongation 25–35%, on 4.5kg paper cone, OEKO-TEX Standard 100 certified.',
  50000, 'kg', '$1.20–$1.60/kg',
  'Net 30', 'Within 45 days',
  'Textiles & Apparel',
  'Liu Wei', 'purchasing@shanghaitextile.cn',
  'Shanghai Textile Trading Co.', 'China', 'open'
),

(
  'Automotive Brake Pads OEM Compatible',
  'Brake Pads',
  'Compatible with Toyota Camry 2018–2023, Honda Accord 2017–2022, Nissan Altima 2019–2023. ECE R90 certified, ceramic compound, low dust, with shims.',
  10000, 'sets', '$8–$14 per set',
  'Net 60', 'Within 30 days',
  'Automotive Parts',
  'Marco Rossi', 'm.rossi@autoparteurope.it',
  'AutoPart Europe SRL', 'Italy', 'open'
),

(
  'Kraft Paper Brown 80gsm',
  'Kraft Paper',
  '80 GSM, width 900mm, roll diameter max 1200mm, core 76mm, burst factor ≥ 20, tensile strength MD ≥ 5.0 kN/m. For secondary packaging use.',
  100, 'MT', '$520–$620/MT',
  'Net 30', 'Within 21 days',
  'Packaging & Paper',
  'Anna Petrov', 'supply@packagingplus.ru',
  'Packaging Plus LLC', 'Russia', 'open'
),

(
  'Activated Carbon 12x40 Mesh Coal-Based',
  'Activated Carbon',
  'Coal-based, 12x40 mesh, iodine number ≥ 1000 mg/g, moisture < 5%, ash < 12%, hardness > 90%, for water treatment application. AWWA B604 compliant.',
  30000, 'kg', '$0.80–$1.20/kg',
  'Net 45', 'Within 60 days',
  'Chemicals & Materials',
  'Robert Chen', 'procurement@cleanwatertech.com',
  'Clean Water Technologies Inc.', 'Canada', 'open'
),

(
  'Surgical N95 Respirator Masks NIOSH',
  'N95 Respirator Masks',
  'NIOSH approved, TC approval number required, ≥95% filtration efficiency, adjustable nose clip, latex-free, individually wrapped, 20 pcs/box.',
  200000, 'pcs', '$0.55–$0.85 per piece',
  'Prepayment', 'Within 14 days',
  'Medical Devices',
  'Dr. Sarah Thompson', 'supply@regionalhealth.org',
  'Regional Health Network', 'United States', 'open'
),

(
  'Whey Protein Concentrate WPC 80',
  'Whey Protein Concentrate',
  'WPC 80%, protein content ≥ 80% (dry basis), moisture < 5%, fat < 8%, lactose < 8%, unflavored, HACCP + ISO 22000 certified, 25kg paper bags.',
  10000, 'kg', '$3.20–$4.50/kg',
  'Net 30', 'Within 30 days',
  'Food & Beverages',
  'Tom Bradley', 'sourcing@nutritionhub.co.uk',
  'Nutrition Hub UK Ltd.', 'United Kingdom', 'open'
);


-- ── Suppliers ────────────────────────────────────────────────────────────────

INSERT INTO marketplace_suppliers (
  company_name, product_name, description, certifications, min_order_qty,
  lead_time, price_range, category, contact_name, contact_email,
  website, country, patents, status
) VALUES

(
  'Lianyungang Jinkang Hexin Pharmaceutical Co.',
  'Magnafolate® C (6S)-5-Methyltetrahydrofolate Calcium',
  'Global leading manufacturer of Magnafolate® (6S-5-Methyltetrahydrofolate Calcium), a patented active folic acid with superior bioavailability and stability. Maintains good stability under high temperature and high humidity. Shelf life 48 months at room temperature. Purity > 99%, strictly controls harmful impurities (JK12A), no formaldehyde or heavy metals. Suitable for pregnant women, infants, and functional foods.',
  ARRAY['GRAS','FDA','ISO22000','ISO9001','ISO14001','Halal','KOSHER','HACCP'],
  '100g', '7–14 days', '$80–$200/kg',
  'Pharmaceuticals & Health',
  'Rosie Li', 'rosie@magnafolate.com',
  'https://magnafolate.com', 'China',
  'Applied for 100+ global patents, holds 40+ granted patents',
  'active'
),

(
  'Guangdong Midea Group Co. Ltd.',
  'Air Fryers & Small Kitchen Appliances',
  'OEM/ODM manufacturer of consumer electronics and kitchen appliances. Air fryers 2L–10L capacity, 1200W–2400W, digital and analog models. ETL, UL, CE, CB, RoHS certified. Annual capacity 5M+ units. 15+ years export experience. Custom branding available.',
  ARRAY['UL','ETL','CE','CB','RoHS','ISO9001','ISO14001'],
  '500 units', '30–45 days', '$18–$65/unit',
  'Electronics & Components',
  'Kevin Zhang', 'export@midea-oem.com',
  'https://midea.com', 'China',
  NULL,
  'active'
),

(
  'BASF SE — Nutrition & Health Division',
  'Vitamins, Carotenoids & Nutritional Ingredients',
  'World's leading supplier of nutritional ingredients for food, beverage, dietary supplement, and pharmaceutical applications. Products include Vitamin A, C, D3, E, B-complex, omega-3, carotenoids, and specialty ingredients. GMP certified, full regulatory support available for all major markets.',
  ARRAY['GMP','HACCP','ISO22000','Halal','KOSHER','Non-GMO','FAMI-QS'],
  '25 kg', '14–21 days', 'On request',
  'Pharmaceuticals & Health',
  'Ingrid Weber', 'nutrition.sales@basf.com',
  'https://basf.com', 'Germany',
  '500+ active patents in nutritional chemistry',
  'active'
),

(
  'Shandong Deshi Chemical Co. Ltd.',
  'Activated Carbon — Coal & Coconut Shell Based',
  'Manufacturer of coal-based and coconut shell-based activated carbon for water treatment, air purification, and gold recovery. Products: granular (GAC), powdered (PAC), pellet, and extruded forms. Iodine number 800–1200 mg/g. ISO 9001 certified. 20,000 MT annual capacity. Bulk shipments via container.',
  ARRAY['ISO9001','AWWA B604','NSF/ANSI 61','REACH'],
  '1,000 kg', '15–25 days', '$0.70–$1.50/kg',
  'Chemicals & Materials',
  'Michael Wang', 'sales@deshi-carbon.com',
  'https://deshi-carbon.com', 'China',
  NULL,
  'active'
),

(
  'Sri Biotech Laboratories India Pvt Ltd',
  'Virgin Coconut Oil — Cold Pressed Organic',
  'Cold-pressed, unrefined virgin coconut oil from certified organic farms in Kerala. USDA Organic, EU Organic, India Organic certified. FFA < 0.08%, moisture < 0.1%, peroxide value < 5. Available in bulk drums (200L), jerry cans (20L), and retail (1L, 500ml glass/HDPE). Kosher and Halal certified.',
  ARRAY['USDA Organic','EU Organic','FSSAI','Halal','KOSHER','ISO22000','HACCP'],
  '200 liters', '10–14 days', '$1.60–$2.20/liter',
  'Food & Beverages',
  'Anitha Krishnan', 'export@sribiotech.in',
  'https://sribiotech.in', 'India',
  NULL,
  'active'
),

(
  'Cummins Inc. — Power Systems Division',
  'Industrial Diesel Generators 20kVA–3000kVA',
  'World's leading diesel and natural gas generator manufacturer. Standby, prime, and continuous power ratings available. Cummins QSB, QSL, QSX, and KTA engine series. ISO 8528 compliant. Digital PowerCommand controllers, remote monitoring. Authorized distributors in 190 countries. Parts and service globally available.',
  ARRAY['ISO8528','CE','UL','CSA','EPA Tier 4','CPCB IV+'],
  '1 unit', '45–90 days', '$8,000–$450,000/unit',
  'Industrial Equipment',
  'John Hargreaves', 'power.sales@cummins.com',
  'https://cummins.com', 'United States',
  '1,000+ patents across power generation technology',
  'active'
),

(
  'Yiwu Jinlong Textile Co. Ltd.',
  'Polyester FDY/DTY Yarn 50D–600D',
  'Manufacturer of polyester FDY, DTY, and POY yarns. Semi-dull, full-dull, and bright lusters available. Range: 50D to 600D. OEKO-TEX Standard 100, GRS (Global Recycled Standard) certified. Recycled polyester options available. 8,000 MT monthly capacity. Direct export to 50+ countries.',
  ARRAY['OEKO-TEX 100','GRS','ISO9001','Bluesign'],
  '500 kg', '20–30 days', '$0.95–$1.80/kg',
  'Textiles & Apparel',
  'Sophie Chen', 'export@jinlongtextile.com',
  'https://jinlongtextile.com', 'China',
  NULL,
  'active'
),

(
  'Supermax Healthcare Sdn Bhd',
  'Nitrile & Latex Examination Gloves',
  'Top-5 global glove manufacturer. Nitrile powder-free, latex, and vinyl examination gloves. AQL 1.5 standard. EN 455, ASTM D6319, FDA 510(k) cleared. ISO 13485 certified manufacturing. Annual capacity 20 billion gloves. Custom packaging and private label available. US, EU, Middle East regulatory compliant.',
  ARRAY['FDA 510(k)','CE','EN455','ASTM D6319','ISO13485','ISO9001','Halal'],
  '100,000 pcs', '21–35 days', '$0.035–$0.08/piece',
  'Medical Devices',
  'Raj Kumar', 'export@supermax.com.my',
  'https://supermax.com.my', 'Malaysia',
  '12 patents in glove manufacturing technology',
  'active'
),

(
  'Mondi Group — Industrial Kraft Papers',
  'Kraft Paper & Packaging Materials',
  'European leader in kraft paper production. Brown and white kraft paper 60–150 GSM. MG (machine glazed), MF (machine finished), and SCK (sack kraft) grades. FSC and PEFC certified sustainable sourcing. BRC/IoP food contact approved. Roll and sheet formats. Consistent quality, weekly shipments from European mills.',
  ARRAY['FSC','PEFC','ISO9001','ISO14001','BRC/IoP','REACH'],
  '5 MT', '14–21 days', '$480–$780/MT',
  'Packaging & Paper',
  'Klaus Weber', 'paper.sales@mondi.com',
  'https://mondi.com', 'Austria',
  NULL,
  'active'
),

(
  'Lactalis Ingredients',
  'Whey Protein Concentrate & Dairy Ingredients',
  'Global dairy ingredient supplier, part of Lactalis Group (world #1 dairy company). WPC 35, WPC 80, WPC 85, WPI 90. Sweet whey powder, demineralized whey. All products HACCP, ISO 22000, Halal, Kosher certified. GMP pharmaceutical grade available. Traceability from farm to finished product. EU compliant.',
  ARRAY['HACCP','ISO22000','GMP','Halal','KOSHER','Non-GMO','EU Organic'],
  '1,000 kg', '21–30 days', '$2.80–$5.50/kg',
  'Food & Beverages',
  'Pierre Dubois', 'ingredients@lactalis.fr',
  'https://lactalis-ingredients.com', 'France',
  NULL,
  'active'
),

(
  'Wavin Group',
  'HDPE & PVC Pipes — Water & Gas Systems',
  'Europe's largest plastic pipe manufacturer. HDPE pipes DN20–DN1200, PE80 and PE100, PN6 to PN20. PVC pressure and drainage systems. ISO 4427, EN 12201, ISO 1452 compliant. 50-year design life. Potable water and gas grade. Available in straight lengths and coils. Technical support and design assistance.',
  ARRAY['ISO4427','EN12201','ISO1452','CE','WRAS','NSF/ANSI 61','Kiwa'],
  '50 pcs', '14–30 days', '$12–$85/piece',
  'Industrial Equipment',
  'Emma Janssen', 'export@wavin.com',
  'https://wavin.com', 'Netherlands',
  '200+ patents in pipe systems',
  'active'
),

(
  'Brembo S.p.A.',
  'OEM Brake Pads & Brake Systems',
  'World's leading manufacturer of braking systems for automotive OEM and aftermarket. Ceramic, semi-metallic, and organic brake pad compounds. Compatible with 3,000+ vehicle applications. ECE R90, ABE, TÜV certified. Low dust, low noise formulations. OEM supplier to BMW, Ferrari, Porsche. Aftermarket kits with hardware.',
  ARRAY['ECE R90','ABE','TÜV','ISO9001','IATF16949','ISO14001'],
  '100 sets', '21–35 days', '$6–$45/set',
  'Automotive Parts',
  'Luca Ferrari', 'aftermarket@brembo.com',
  'https://brembo.com', 'Italy',
  '500+ active patents in braking technology',
  'active'
);
