-- FirmsLedger: Lean Category Seed
-- Purpose: replace all current categories with a focused, storage-light set
-- Excludes IT / Web Services for now

BEGIN;

-- Remove category links first to satisfy foreign keys
DELETE FROM agency_categories
WHERE category_id IN (SELECT id FROM categories);

-- Remove all current categories
DELETE FROM categories;

-- Staffing & Recruiting
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order") VALUES ('Staffing & Recruiting', 'staffing-recruiting', 'Staffing & Recruiting companies listed on FirmsLedger. Compare verified providers, check reviews, and find trusted partners.', true, NULL, 1);
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Healthcare Staffing', 'healthcare-staffing', 'Healthcare Staffing companies in Staffing & Recruiting. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 1
FROM categories c WHERE c.slug = 'staffing-recruiting';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Industrial Staffing', 'industrial-staffing', 'Industrial Staffing companies in Staffing & Recruiting. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 2
FROM categories c WHERE c.slug = 'staffing-recruiting';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Executive Search', 'executive-search', 'Executive Search companies in Staffing & Recruiting. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 3
FROM categories c WHERE c.slug = 'staffing-recruiting';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Temporary Staffing', 'temporary-staffing', 'Temporary Staffing companies in Staffing & Recruiting. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 4
FROM categories c WHERE c.slug = 'staffing-recruiting';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Permanent Staffing', 'permanent-staffing', 'Permanent Staffing companies in Staffing & Recruiting. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 5
FROM categories c WHERE c.slug = 'staffing-recruiting';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Remote Staffing', 'remote-staffing', 'Remote Staffing companies in Staffing & Recruiting. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 6
FROM categories c WHERE c.slug = 'staffing-recruiting';

-- Construction
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order") VALUES ('Construction', 'construction', 'Construction companies listed on FirmsLedger. Compare verified providers, check reviews, and find trusted partners.', true, NULL, 2);
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Commercial Construction', 'commercial-construction', 'Commercial Construction companies in Construction. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 1
FROM categories c WHERE c.slug = 'construction';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Residential Construction', 'residential-construction', 'Residential Construction companies in Construction. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 2
FROM categories c WHERE c.slug = 'construction';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Civil Contractors', 'civil-contractors', 'Civil Contractors companies in Construction. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 3
FROM categories c WHERE c.slug = 'construction';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'MEP Contractors', 'mep-contractors', 'MEP Contractors companies in Construction. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 4
FROM categories c WHERE c.slug = 'construction';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Interior Fit Out', 'interior-fit-out', 'Interior Fit Out companies in Construction. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 5
FROM categories c WHERE c.slug = 'construction';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Construction Equipment Rental', 'construction-equipment-rental', 'Construction Equipment Rental companies in Construction. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 6
FROM categories c WHERE c.slug = 'construction';

-- Healthcare
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order") VALUES ('Healthcare', 'healthcare', 'Healthcare companies listed on FirmsLedger. Compare verified providers, check reviews, and find trusted partners.', true, NULL, 3);
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Hospitals', 'hospitals', 'Hospitals companies in Healthcare. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 1
FROM categories c WHERE c.slug = 'healthcare';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Clinics', 'clinics', 'Clinics companies in Healthcare. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 2
FROM categories c WHERE c.slug = 'healthcare';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Diagnostic Centers', 'diagnostic-centers', 'Diagnostic Centers companies in Healthcare. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 3
FROM categories c WHERE c.slug = 'healthcare';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Medical Devices', 'medical-devices', 'Medical Devices companies in Healthcare. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 4
FROM categories c WHERE c.slug = 'healthcare';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Pharmaceutical Manufacturers', 'pharmaceutical-manufacturers', 'Pharmaceutical Manufacturers companies in Healthcare. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 5
FROM categories c WHERE c.slug = 'healthcare';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Telemedicine', 'telemedicine', 'Telemedicine companies in Healthcare. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 6
FROM categories c WHERE c.slug = 'healthcare';

-- Finance & Accounting
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order") VALUES ('Finance & Accounting', 'finance-accounting', 'Finance & Accounting companies listed on FirmsLedger. Compare verified providers, check reviews, and find trusted partners.', true, NULL, 4);
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Accounting Firms', 'accounting-firms', 'Accounting Firms companies in Finance & Accounting. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 1
FROM categories c WHERE c.slug = 'finance-accounting';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Tax Consultants', 'tax-consultants', 'Tax Consultants companies in Finance & Accounting. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 2
FROM categories c WHERE c.slug = 'finance-accounting';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Audit Services', 'audit-services', 'Audit Services companies in Finance & Accounting. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 3
FROM categories c WHERE c.slug = 'finance-accounting';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Payroll Services', 'payroll-services', 'Payroll Services companies in Finance & Accounting. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 4
FROM categories c WHERE c.slug = 'finance-accounting';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Bookkeeping', 'bookkeeping', 'Bookkeeping companies in Finance & Accounting. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 5
FROM categories c WHERE c.slug = 'finance-accounting';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'CFO Advisory', 'cfo-advisory', 'CFO Advisory companies in Finance & Accounting. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 6
FROM categories c WHERE c.slug = 'finance-accounting';

-- Legal Services
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order") VALUES ('Legal Services', 'legal-services', 'Legal Services companies listed on FirmsLedger. Compare verified providers, check reviews, and find trusted partners.', true, NULL, 5);
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Corporate Law Firms', 'corporate-law-firms', 'Corporate Law Firms companies in Legal Services. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 1
FROM categories c WHERE c.slug = 'legal-services';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Litigation Firms', 'litigation-firms', 'Litigation Firms companies in Legal Services. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 2
FROM categories c WHERE c.slug = 'legal-services';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'IP Law Firms', 'ip-law-firms', 'IP Law Firms companies in Legal Services. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 3
FROM categories c WHERE c.slug = 'legal-services';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Contract Management', 'contract-management', 'Contract Management companies in Legal Services. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 4
FROM categories c WHERE c.slug = 'legal-services';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Compliance Consulting', 'compliance-consulting', 'Compliance Consulting companies in Legal Services. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 5
FROM categories c WHERE c.slug = 'legal-services';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Trademark Services', 'trademark-services', 'Trademark Services companies in Legal Services. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 6
FROM categories c WHERE c.slug = 'legal-services';

-- Marketing & Advertising
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order") VALUES ('Marketing & Advertising', 'marketing-advertising', 'Marketing & Advertising companies listed on FirmsLedger. Compare verified providers, check reviews, and find trusted partners.', true, NULL, 6);
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Digital Marketing', 'digital-marketing', 'Digital Marketing companies in Marketing & Advertising. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 1
FROM categories c WHERE c.slug = 'marketing-advertising';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'SEO Services', 'seo-services', 'SEO Services companies in Marketing & Advertising. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 2
FROM categories c WHERE c.slug = 'marketing-advertising';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Performance Marketing', 'performance-marketing', 'Performance Marketing companies in Marketing & Advertising. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 3
FROM categories c WHERE c.slug = 'marketing-advertising';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Branding Agencies', 'branding-agencies', 'Branding Agencies companies in Marketing & Advertising. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 4
FROM categories c WHERE c.slug = 'marketing-advertising';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Social Media Marketing', 'social-media-marketing', 'Social Media Marketing companies in Marketing & Advertising. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 5
FROM categories c WHERE c.slug = 'marketing-advertising';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Content Marketing', 'content-marketing', 'Content Marketing companies in Marketing & Advertising. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 6
FROM categories c WHERE c.slug = 'marketing-advertising';

-- Logistics & Transportation
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order") VALUES ('Logistics & Transportation', 'logistics-transportation', 'Logistics & Transportation companies listed on FirmsLedger. Compare verified providers, check reviews, and find trusted partners.', true, NULL, 7);
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Freight Forwarding', 'freight-forwarding', 'Freight Forwarding companies in Logistics & Transportation. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 1
FROM categories c WHERE c.slug = 'logistics-transportation';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Warehousing', 'warehousing', 'Warehousing companies in Logistics & Transportation. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 2
FROM categories c WHERE c.slug = 'logistics-transportation';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Last Mile Delivery', 'last-mile-delivery', 'Last Mile Delivery companies in Logistics & Transportation. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 3
FROM categories c WHERE c.slug = 'logistics-transportation';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Cold Chain Logistics', 'cold-chain-logistics', 'Cold Chain Logistics companies in Logistics & Transportation. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 4
FROM categories c WHERE c.slug = 'logistics-transportation';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Customs Clearance', 'customs-clearance', 'Customs Clearance companies in Logistics & Transportation. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 5
FROM categories c WHERE c.slug = 'logistics-transportation';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT '3PL Services', '3pl-services', '3PL Services companies in Logistics & Transportation. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 6
FROM categories c WHERE c.slug = 'logistics-transportation';

-- Real Estate
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order") VALUES ('Real Estate', 'real-estate', 'Real Estate companies listed on FirmsLedger. Compare verified providers, check reviews, and find trusted partners.', true, NULL, 8);
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Residential Brokerage', 'residential-brokerage', 'Residential Brokerage companies in Real Estate. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 1
FROM categories c WHERE c.slug = 'real-estate';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Commercial Brokerage', 'commercial-brokerage', 'Commercial Brokerage companies in Real Estate. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 2
FROM categories c WHERE c.slug = 'real-estate';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Property Management', 'property-management', 'Property Management companies in Real Estate. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 3
FROM categories c WHERE c.slug = 'real-estate';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Facility Management', 'facility-management', 'Facility Management companies in Real Estate. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 4
FROM categories c WHERE c.slug = 'real-estate';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Real Estate Developers', 'real-estate-developers', 'Real Estate Developers companies in Real Estate. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 5
FROM categories c WHERE c.slug = 'real-estate';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Valuation Services', 'valuation-services', 'Valuation Services companies in Real Estate. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 6
FROM categories c WHERE c.slug = 'real-estate';

-- Manufacturing
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order") VALUES ('Manufacturing', 'manufacturing', 'Manufacturing companies listed on FirmsLedger. Compare verified providers, check reviews, and find trusted partners.', true, NULL, 9);
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Industrial Manufacturing', 'industrial-manufacturing', 'Industrial Manufacturing companies in Manufacturing. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 1
FROM categories c WHERE c.slug = 'manufacturing';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'CNC Manufacturing', 'cnc-manufacturing', 'CNC Manufacturing companies in Manufacturing. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 2
FROM categories c WHERE c.slug = 'manufacturing';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Metal Fabrication', 'metal-fabrication', 'Metal Fabrication companies in Manufacturing. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 3
FROM categories c WHERE c.slug = 'manufacturing';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Plastic Components', 'plastic-components', 'Plastic Components companies in Manufacturing. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 4
FROM categories c WHERE c.slug = 'manufacturing';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Automotive Components', 'automotive-components', 'Automotive Components companies in Manufacturing. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 5
FROM categories c WHERE c.slug = 'manufacturing';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Contract Manufacturing', 'contract-manufacturing', 'Contract Manufacturing companies in Manufacturing. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 6
FROM categories c WHERE c.slug = 'manufacturing';

-- Machinery & Equipment
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order") VALUES ('Machinery & Equipment', 'machinery-equipment', 'Machinery & Equipment companies listed on FirmsLedger. Compare verified providers, check reviews, and find trusted partners.', true, NULL, 10);
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'CNC Machines', 'cnc-machines', 'CNC Machines companies in Machinery & Equipment. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 1
FROM categories c WHERE c.slug = 'machinery-equipment';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Milling Machines', 'milling-machines', 'Milling Machines companies in Machinery & Equipment. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 2
FROM categories c WHERE c.slug = 'machinery-equipment';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Drilling Machines', 'drilling-machines', 'Drilling Machines companies in Machinery & Equipment. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 3
FROM categories c WHERE c.slug = 'machinery-equipment';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Welding Equipment', 'welding-equipment', 'Welding Equipment companies in Machinery & Equipment. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 4
FROM categories c WHERE c.slug = 'machinery-equipment';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Packaging Machinery', 'packaging-machinery', 'Packaging Machinery companies in Machinery & Equipment. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 5
FROM categories c WHERE c.slug = 'machinery-equipment';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Material Handling Equipment', 'material-handling-equipment', 'Material Handling Equipment companies in Machinery & Equipment. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 6
FROM categories c WHERE c.slug = 'machinery-equipment';

-- Chemicals & Materials
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order") VALUES ('Chemicals & Materials', 'chemicals-materials', 'Chemicals & Materials companies listed on FirmsLedger. Compare verified providers, check reviews, and find trusted partners.', true, NULL, 11);
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Specialty Chemicals', 'specialty-chemicals', 'Specialty Chemicals companies in Chemicals & Materials. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 1
FROM categories c WHERE c.slug = 'chemicals-materials';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Industrial Chemicals', 'industrial-chemicals', 'Industrial Chemicals companies in Chemicals & Materials. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 2
FROM categories c WHERE c.slug = 'chemicals-materials';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Polymers', 'polymers', 'Polymers companies in Chemicals & Materials. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 3
FROM categories c WHERE c.slug = 'chemicals-materials';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Coatings', 'coatings', 'Coatings companies in Chemicals & Materials. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 4
FROM categories c WHERE c.slug = 'chemicals-materials';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Adhesives & Sealants', 'adhesives-sealants', 'Adhesives & Sealants companies in Chemicals & Materials. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 5
FROM categories c WHERE c.slug = 'chemicals-materials';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Water Treatment Chemicals', 'water-treatment-chemicals', 'Water Treatment Chemicals companies in Chemicals & Materials. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 6
FROM categories c WHERE c.slug = 'chemicals-materials';

-- Retail & E-commerce
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order") VALUES ('Retail & E-commerce', 'retail-e-commerce', 'Retail & E-commerce companies listed on FirmsLedger. Compare verified providers, check reviews, and find trusted partners.', true, NULL, 12);
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'D2C Brands', 'd2c-brands', 'D2C Brands companies in Retail & E-commerce. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 1
FROM categories c WHERE c.slug = 'retail-e-commerce';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Online Marketplaces', 'online-marketplaces', 'Online Marketplaces companies in Retail & E-commerce. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 2
FROM categories c WHERE c.slug = 'retail-e-commerce';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'B2B E-commerce', 'b2b-e-commerce', 'B2B E-commerce companies in Retail & E-commerce. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 3
FROM categories c WHERE c.slug = 'retail-e-commerce';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Retail Chains', 'retail-chains', 'Retail Chains companies in Retail & E-commerce. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 4
FROM categories c WHERE c.slug = 'retail-e-commerce';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'E-commerce Fulfillment', 'e-commerce-fulfillment', 'E-commerce Fulfillment companies in Retail & E-commerce. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 5
FROM categories c WHERE c.slug = 'retail-e-commerce';
INSERT INTO categories (name, slug, description, is_parent, parent_id, "order")
SELECT 'Marketplace Operations', 'marketplace-operations', 'Marketplace Operations companies in Retail & E-commerce. Browse verified providers and shortlist the right partner on FirmsLedger.', false, c.id, 6
FROM categories c WHERE c.slug = 'retail-e-commerce';

COMMIT;
