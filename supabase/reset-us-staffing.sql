-- FirmsLedger: Reset to US Staffing Focus
-- Run in Supabase SQL Editor
-- WARNING: This deletes ALL existing data and replaces with US staffing data

-- ═══════════════════════════════════════════════════════════════════════
-- STEP 1: CLEAN ALL EXISTING DATA
-- ═══════════════════════════════════════════════════════════════════════
DELETE FROM company_invites;
DELETE FROM leads;
DELETE FROM reviews;
DELETE FROM agency_categories;
DELETE FROM agencies;
DELETE FROM categories;

-- ═══════════════════════════════════════════════════════════════════════
-- STEP 2: US STAFFING CATEGORIES
-- ═══════════════════════════════════════════════════════════════════════

-- Parent category
INSERT INTO categories (name, slug, description, icon, "order", is_parent, parent_id)
VALUES ('Staffing & Recruiting', 'staffing-recruiting', 'Find the best staffing and recruiting agencies across the United States. Compare verified staffing companies by specialization, reviews, and location.', 'users', 1, true, NULL)
ON CONFLICT (slug) DO NOTHING;

-- Subcategories
INSERT INTO categories (name, slug, description, icon, "order", is_parent, parent_id)
SELECT v.name, v.slug, v.description, '', v.ord, false, p.id
FROM (VALUES
  ('IT & Technology Staffing', 'it-technology-staffing', 'Top IT staffing agencies in the US. Find verified tech recruiters for software engineers, data scientists, cybersecurity, cloud, and DevOps roles.', 1),
  ('Healthcare Staffing', 'healthcare-staffing', 'Leading healthcare staffing companies across the US. Find travel nurses, allied health professionals, physicians, and medical staff recruiters.', 2),
  ('Industrial & Manufacturing Staffing', 'industrial-manufacturing-staffing', 'Best industrial and manufacturing staffing agencies in the US. Find skilled trades, warehouse, production, and factory workforce solutions.', 3),
  ('Construction Staffing', 'construction-staffing', 'Top construction staffing companies in the US. Find skilled tradespeople, laborers, project managers, and construction workforce solutions.', 4),
  ('Accounting & Finance Staffing', 'accounting-finance-staffing', 'Best accounting and finance staffing agencies in the US. Find CPAs, controllers, CFOs, bookkeepers, and financial analysts.', 5),
  ('Administrative & Office Staffing', 'administrative-office-staffing', 'Top administrative and office staffing agencies in the US. Find receptionists, executive assistants, office managers, and clerical staff.', 6),
  ('Executive Search & Recruiting', 'executive-search-recruiting', 'Leading executive search firms in the US. Find C-suite, VP, and director-level talent through retained and contingency search.', 7),
  ('Legal Staffing', 'legal-staffing', 'Top legal staffing agencies in the US. Find paralegals, legal assistants, contract attorneys, and law firm support staff.', 8),
  ('Engineering Staffing', 'engineering-staffing', 'Best engineering staffing companies in the US. Find mechanical, electrical, civil, chemical, and aerospace engineers.', 9),
  ('Warehouse & Logistics Staffing', 'warehouse-logistics-staffing', 'Top warehouse and logistics staffing agencies in the US. Find warehouse workers, forklift operators, drivers, and supply chain staff.', 10),
  ('Temporary Staffing', 'temporary-staffing', 'Best temporary staffing agencies in the US. Find short-term, seasonal, and temp-to-hire workforce solutions across all industries.', 11),
  ('Remote Staffing', 'remote-staffing', 'Top remote staffing companies in the US. Find distributed teams, remote workers, and virtual assistants for any role.', 12),
  ('Government & Defense Staffing', 'government-defense-staffing', 'Leading government and defense staffing agencies in the US. Security-cleared professionals for federal, state, and military contracts.', 13),
  ('Hospitality & Event Staffing', 'hospitality-event-staffing', 'Top hospitality and event staffing agencies in the US. Find servers, bartenders, event coordinators, and hotel staff.', 14),
  ('Scientific & Pharmaceutical Staffing', 'scientific-pharmaceutical-staffing', 'Best scientific and pharma staffing agencies in the US. Find lab technicians, researchers, QA specialists, and clinical trial staff.', 15)
) AS v(name, slug, description, ord)
CROSS JOIN categories p WHERE p.slug = 'staffing-recruiting'
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════
-- STEP 3: US STAFFING AGENCIES (Real companies)
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO agencies (name, slug, description, website, logo_url, hq_city, hq_state, hq_country, team_size, founded_year, pricing_model, remote_support, approved, featured, verified, avg_rating, review_count, contact_email) VALUES
-- IT & Technology Staffing
('Robert Half', 'robert-half', 'One of the largest specialized staffing firms in the US. Provides IT, finance, accounting, and administrative staffing with 300+ offices nationwide. Known for their Protiviti consulting arm and deep expertise in placing technology professionals.', 'https://www.roberthalf.com', 'https://ui-avatars.com/api/?name=RH&background=0D47A1&color=fff', 'Menlo Park', 'California', 'United States', '10,000+', 1948, 'Contingency Fee', true, true, true, true, 4.5, 12, NULL),

('TEKsystems', 'teksystems', 'A leading IT staffing and services company serving 80% of the Fortune 500. Specializes in technology talent solutions including staff augmentation, managed services, and IT project solutions across the US.', 'https://www.teksystems.com', 'https://ui-avatars.com/api/?name=TEK&background=E65100&color=fff', 'Hanover', 'Maryland', 'United States', '10,000+', 1983, 'Contingency Fee', true, true, true, true, 4.6, 18, NULL),

('Insight Global', 'insight-global', 'Fastest-growing staffing company in the US with expertise in IT, accounting, finance, engineering, and government. Known for their relationship-driven approach and high candidate quality. Over 70 offices nationwide.', 'https://www.insightglobal.com', 'https://ui-avatars.com/api/?name=IG&background=1B5E20&color=fff', 'Atlanta', 'Georgia', 'United States', '5,001-10,000', 2001, 'Contingency Fee', true, true, true, true, 4.4, 15, NULL),

('Kforce', 'kforce', 'A professional staffing firm specializing in technology and finance & accounting. With 60+ offices, Kforce connects top talent with Fortune 500 and mid-market companies for contract and permanent positions.', 'https://www.kforce.com', 'https://ui-avatars.com/api/?name=KF&background=4A148C&color=fff', 'Tampa', 'Florida', 'United States', '5,001-10,000', 1962, 'Contingency Fee', true, true, true, false, 4.3, 9, NULL),

('Apex Systems', 'apex-systems', 'A leading IT staffing firm providing technical, creative, and business talent solutions. Part of the ASGN Incorporated family, serving clients in healthcare, financial services, government, and technology sectors.', 'https://www.apexsystems.com', 'https://ui-avatars.com/api/?name=AS&background=BF360C&color=fff', 'Richmond', 'Virginia', 'United States', '5,001-10,000', 1995, 'Contingency Fee', true, true, true, false, 4.2, 11, NULL),

-- Healthcare Staffing
('AMN Healthcare', 'amn-healthcare', 'The largest healthcare staffing company in the US. Provides travel nursing, allied health, physician, and locum tenens staffing. Also offers workforce solutions, managed services, and recruitment process outsourcing for hospitals and health systems.', 'https://www.amnhealthcare.com', 'https://ui-avatars.com/api/?name=AMN&background=00695C&color=fff', 'Dallas', 'Texas', 'United States', '10,000+', 1985, 'Contract Rate', true, true, true, true, 4.5, 14, NULL),

('Aya Healthcare', 'aya-healthcare', 'A leading travel nursing and allied health staffing company. Provides per diem, local contract, travel, and permanent placement across all 50 states. Known for strong clinician support and digital-first platform.', 'https://www.ayahealthcare.com', 'https://ui-avatars.com/api/?name=AH&background=AD1457&color=fff', 'San Diego', 'California', 'United States', '5,001-10,000', 2001, 'Contract Rate', true, true, true, true, 4.6, 10, NULL),

('Cross Country Healthcare', 'cross-country-healthcare', 'One of the largest healthcare staffing companies in the US providing nurse and allied health travel staffing, per diem, and permanent placement. Serves acute care hospitals, clinics, and outpatient facilities nationwide.', 'https://www.crosscountryhealthcare.com', 'https://ui-avatars.com/api/?name=CC&background=1565C0&color=fff', 'Boca Raton', 'Florida', 'United States', '5,001-10,000', 1986, 'Contract Rate', true, true, true, false, 4.3, 8, NULL),

('Medical Solutions', 'medical-solutions', 'A top travel nursing and allied health staffing company known for outstanding recruiter-clinician relationships. Provides travel, per diem, and local contracts for RNs, therapists, and techs across the US.', 'https://www.medicalsolutions.com', 'https://ui-avatars.com/api/?name=MS&background=33691E&color=fff', 'Omaha', 'Nebraska', 'United States', '1,001-5,000', 2001, 'Contract Rate', true, true, true, false, 4.7, 7, NULL),

-- Industrial & Manufacturing Staffing
('Adecco', 'adecco-usa', 'The world''s largest staffing firm with a massive US presence. Specializes in industrial, manufacturing, logistics, and office staffing. Provides temporary, temp-to-hire, and permanent placement across all 50 states.', 'https://www.adeccousa.com', 'https://ui-avatars.com/api/?name=AD&background=D32F2F&color=fff', 'Jacksonville', 'Florida', 'United States', '10,000+', 1996, 'Hourly Mark-up', true, true, true, true, 4.2, 16, NULL),

('Randstad USA', 'randstad-usa', 'A global staffing leader with 900+ US locations. Strong in industrial, manufacturing, logistics, administrative, and professional roles. Offers staffing, outsourcing, and workforce management solutions.', 'https://www.randstadusa.com', 'https://ui-avatars.com/api/?name=RS&background=0277BD&color=fff', 'Atlanta', 'Georgia', 'United States', '10,000+', 1960, 'Hourly Mark-up', true, true, true, true, 4.3, 13, NULL),

('PeopleReady', 'peopleready', 'One of the largest industrial staffing providers in North America. Specializes in construction, manufacturing, warehousing, and logistics temporary staffing. Pioneered the JobStack app for same-day work.', 'https://www.peopleready.com', 'https://ui-avatars.com/api/?name=PR&background=E64A19&color=fff', 'Tacoma', 'Washington', 'United States', '5,001-10,000', 1987, 'Hourly Mark-up', false, true, true, false, 4.0, 9, NULL),

('Employbridge', 'employbridge', 'The largest industrial staffing company in the US with 400+ branch offices. Specializes in light industrial, skilled manufacturing, transportation, and warehouse staffing under brands like ResourceMFG, ProLogistix, and ProDrivers.', 'https://www.employbridge.com', 'https://ui-avatars.com/api/?name=EB&background=283593&color=fff', 'Atlanta', 'Georgia', 'United States', '5,001-10,000', 2014, 'Hourly Mark-up', false, true, true, false, 4.1, 7, NULL),

-- Construction Staffing
('Tradesmen International', 'tradesmen-international', 'America''s leading construction staffing company. Provides skilled tradespeople — electricians, pipefitters, welders, carpenters, HVAC techs — to commercial and industrial construction projects nationwide.', 'https://www.tradesmeninternational.com', 'https://ui-avatars.com/api/?name=TI&background=F57F17&color=fff', 'Cleveland', 'Ohio', 'United States', '5,001-10,000', 1992, 'Hourly Mark-up', false, true, true, true, 4.4, 11, NULL),

('CLP Resources', 'clp-resources', 'A top construction labor staffing provider in the US. Specializes in skilled trades, general labor, and safety personnel for commercial, industrial, and residential construction projects.', 'https://www.clpresources.com', 'https://ui-avatars.com/api/?name=CLP&background=37474F&color=fff', 'Memphis', 'Tennessee', 'United States', '1,001-5,000', 1989, 'Hourly Mark-up', false, true, false, false, 4.1, 5, NULL),

-- Executive Search
('Heidrick & Struggles', 'heidrick-struggles', 'A premier global executive search firm serving Fortune 500 companies. Specializes in C-suite and board-level searches across technology, healthcare, financial services, and industrial sectors.', 'https://www.heidrick.com', 'https://ui-avatars.com/api/?name=HS&background=1A237E&color=fff', 'Chicago', 'Illinois', 'United States', '1,001-5,000', 1953, 'Retained Fee', true, true, true, true, 4.7, 6, NULL),

('Spencer Stuart', 'spencer-stuart', 'One of the world''s leading executive search and leadership consulting firms. Advises CEOs, boards, and senior leaders on talent acquisition and succession planning across all industries.', 'https://www.spencerstuart.com', 'https://ui-avatars.com/api/?name=SS&background=004D40&color=fff', 'Chicago', 'Illinois', 'United States', '1,001-5,000', 1956, 'Retained Fee', true, true, true, true, 4.8, 5, NULL),

('Korn Ferry', 'korn-ferry', 'A global organizational consulting and executive search firm. Provides recruitment, leadership development, compensation, and talent strategy services. Serves clients in 50+ countries.', 'https://www.kornferry.com', 'https://ui-avatars.com/api/?name=KF&background=880E4F&color=fff', 'Los Angeles', 'California', 'United States', '10,000+', 1969, 'Retained Fee', true, true, true, true, 4.6, 8, NULL),

-- Accounting & Finance Staffing
('Accountemps (Robert Half)', 'accountemps', 'The largest specialized temporary staffing service for accounting, finance, and bookkeeping professionals. Part of Robert Half. Provides controllers, staff accountants, AP/AR clerks, and payroll specialists.', 'https://www.roberthalf.com/us/en/accountemps', 'https://ui-avatars.com/api/?name=AT&background=0D47A1&color=fff', 'Menlo Park', 'California', 'United States', '5,001-10,000', 1948, 'Contingency Fee', true, true, true, false, 4.4, 7, NULL),

('Vaco', 'vaco', 'A leading staffing and consulting firm specializing in accounting, finance, technology, and executive search. Operates 40+ offices across the US with a focus on mid-market and Fortune 500 clients.', 'https://www.vaco.com', 'https://ui-avatars.com/api/?name=VA&background=558B2F&color=fff', 'Nashville', 'Tennessee', 'United States', '1,001-5,000', 2002, 'Contingency Fee', true, true, true, false, 4.5, 6, NULL),

-- Warehouse & Logistics Staffing
('ProLogistix (Employbridge)', 'prologistix', 'One of the largest warehouse and logistics staffing companies in the US. Provides forklift operators, pickers, packers, shipping/receiving clerks, and warehouse supervisors to distribution centers nationwide.', 'https://www.prologistix.com', 'https://ui-avatars.com/api/?name=PL&background=E65100&color=fff', 'Atlanta', 'Georgia', 'United States', '5,001-10,000', 2003, 'Hourly Mark-up', false, true, false, false, 4.0, 5, NULL),

('Staffmark', 'staffmark', 'A national staffing company providing industrial, warehouse, manufacturing, and office staffing solutions. Part of Recruit Holdings. Serves clients through 300+ locations across the US.', 'https://www.staffmark.com', 'https://ui-avatars.com/api/?name=SM&background=6A1B9A&color=fff', 'Cincinnati', 'Ohio', 'United States', '5,001-10,000', 1976, 'Hourly Mark-up', false, true, false, false, 4.1, 6, NULL),

-- Administrative & Office Staffing
('Kelly Services', 'kelly-services', 'One of the original staffing companies in the US. Provides office, administrative, light industrial, and professional staffing. Known for "Kelly Girls" legacy, now serves Fortune 500 with workforce solutions and outsourcing.', 'https://www.kellyservices.com', 'https://ui-avatars.com/api/?name=KS&background=00838F&color=fff', 'Troy', 'Michigan', 'United States', '10,000+', 1946, 'Hourly Mark-up', true, true, true, true, 4.2, 10, NULL),

('Express Employment Professionals', 'express-employment', 'One of the top staffing companies in North America with 860+ franchise locations. Provides temporary, temp-to-hire, and permanent placement for office, industrial, and professional roles.', 'https://www.expresspros.com', 'https://ui-avatars.com/api/?name=EE&background=1B5E20&color=fff', 'Oklahoma City', 'Oklahoma', 'United States', '10,000+', 1983, 'Hourly Mark-up', false, true, true, false, 4.3, 9, NULL),

-- Engineering Staffing
('Aerotek', 'aerotek', 'One of the largest staffing companies in the US, specializing in engineering, scientific, and industrial talent. Part of Allegis Group. Provides contract, contract-to-hire, and direct placement for engineering roles across aerospace, automotive, and energy sectors.', 'https://www.aerotek.com', 'https://ui-avatars.com/api/?name=AK&background=B71C1C&color=fff', 'Hanover', 'Maryland', 'United States', '10,000+', 1983, 'Contingency Fee', true, true, true, true, 4.4, 14, NULL),

('Yoh', 'yoh-services', 'A leading talent and outsourcing company specializing in engineering, IT, healthcare, and scientific staffing. Part of Day & Zimmermann. Known for managed staffing solutions and high-security cleared talent.', 'https://www.yoh.com', 'https://ui-avatars.com/api/?name=YH&background=311B92&color=fff', 'Philadelphia', 'Pennsylvania', 'United States', '1,001-5,000', 1940, 'Contract Rate', true, true, true, false, 4.3, 6, NULL),

-- Government & Defense Staffing
('ManTech International', 'mantech', 'A leading provider of IT and technical staffing for US federal government agencies. Specializes in cybersecurity, intelligence, defense, and federal IT modernization projects requiring security clearances.', 'https://www.mantech.com', 'https://ui-avatars.com/api/?name=MT&background=0D47A1&color=fff', 'Herndon', 'Virginia', 'United States', '5,001-10,000', 1968, 'Contract Rate', true, true, true, false, 4.3, 5, NULL),

('SAIC', 'saic', 'A premier technology integrator providing IT, engineering, and mission support staffing to US government agencies including DOD, intelligence, and civilian agencies. Requires security-cleared professionals.', 'https://www.saic.com', 'https://ui-avatars.com/api/?name=SA&background=1A237E&color=fff', 'Reston', 'Virginia', 'United States', '10,000+', 1969, 'Contract Rate', true, true, true, true, 4.4, 7, NULL),

-- Scientific & Pharmaceutical Staffing
('Aston Carter', 'aston-carter', 'A leading staffing firm specializing in accounting, finance, and professional talent. Part of Allegis Group. Provides contract, contract-to-hire, and direct placement for mid-to-senior level professionals.', 'https://www.astoncarter.com', 'https://ui-avatars.com/api/?name=AC&background=4E342E&color=fff', 'Hanover', 'Maryland', 'United States', '5,001-10,000', 1997, 'Contingency Fee', true, true, true, false, 4.2, 8, NULL),

-- Hospitality Staffing
('LGC Hospitality', 'lgc-hospitality', 'A leading hospitality staffing company providing servers, bartenders, banquet staff, cooks, and event professionals to hotels, restaurants, catering companies, and event venues across major US metros.', 'https://www.lgcassociates.com', 'https://ui-avatars.com/api/?name=LGC&background=FF6F00&color=fff', 'Orlando', 'Florida', 'United States', '1,001-5,000', 2003, 'Hourly Mark-up', false, true, false, false, 4.1, 4, NULL),

-- Legal Staffing
('Robert Half Legal', 'robert-half-legal', 'The leading legal staffing agency in the US. Places paralegals, legal assistants, contract attorneys, compliance officers, and legal secretaries at law firms and corporate legal departments nationwide.', 'https://www.roberthalf.com/us/en/legal', 'https://ui-avatars.com/api/?name=RHL&background=0D47A1&color=fff', 'Menlo Park', 'California', 'United States', '1,001-5,000', 1948, 'Contingency Fee', true, true, true, false, 4.4, 5, NULL),

-- Remote Staffing
('Toptal', 'toptal', 'An elite network of top freelance software developers, designers, finance experts, and project managers. Rigorous screening process accepts only the top 3% of applicants. Ideal for companies seeking top-tier remote US talent.', 'https://www.toptal.com', 'https://ui-avatars.com/api/?name=TT&background=204ECF&color=fff', 'San Francisco', 'California', 'United States', '1,001-5,000', 2010, 'Hourly Rate', true, true, true, true, 4.7, 9, NULL),

('Upwork Enterprise', 'upwork-enterprise', 'The world''s largest freelancing and remote staffing platform. Upwork Enterprise provides managed remote teams, compliance, and payroll for US companies hiring remote professionals across all disciplines.', 'https://www.upwork.com/enterprise', 'https://ui-avatars.com/api/?name=UW&background=14A800&color=fff', 'San Francisco', 'California', 'United States', '1,001-5,000', 2015, 'Platform Fee', true, true, true, true, 4.3, 11, NULL),

-- ManpowerGroup
('ManpowerGroup', 'manpowergroup', 'One of the world''s largest staffing companies with operations across all 50 US states. Provides temporary, permanent, and outsourced staffing for industrial, office, and professional roles under Manpower, Experis, and Talent Solutions brands.', 'https://www.manpowergroup.us', 'https://ui-avatars.com/api/?name=MG&background=003B71&color=fff', 'Milwaukee', 'Wisconsin', 'United States', '10,000+', 1948, 'Hourly Mark-up', true, true, true, true, 4.3, 12, NULL),

-- Hays US
('Hays US', 'hays-us', 'A global specialist staffing firm with a growing US presence. Focuses on IT, engineering, construction, accounting, and life sciences staffing. Known for deep sector expertise and long-term client partnerships.', 'https://www.hays.com/en-us', 'https://ui-avatars.com/api/?name=HY&background=C62828&color=fff', 'New York', 'New York', 'United States', '1,001-5,000', 2000, 'Contingency Fee', true, true, true, false, 4.4, 6, NULL)

ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════
-- STEP 4: LINK AGENCIES TO CATEGORIES
-- ═══════════════════════════════════════════════════════════════════════

-- IT & Technology Staffing
INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug IN ('robert-half', 'teksystems', 'insight-global', 'kforce', 'apex-systems')
AND c.slug = 'it-technology-staffing'
ON CONFLICT (agency_id, category_id) DO NOTHING;

-- Healthcare Staffing
INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug IN ('amn-healthcare', 'aya-healthcare', 'cross-country-healthcare', 'medical-solutions')
AND c.slug = 'healthcare-staffing'
ON CONFLICT (agency_id, category_id) DO NOTHING;

-- Industrial & Manufacturing Staffing
INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug IN ('adecco-usa', 'randstad-usa', 'peopleready', 'employbridge')
AND c.slug = 'industrial-manufacturing-staffing'
ON CONFLICT (agency_id, category_id) DO NOTHING;

-- Construction Staffing
INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug IN ('tradesmen-international', 'clp-resources', 'peopleready')
AND c.slug = 'construction-staffing'
ON CONFLICT (agency_id, category_id) DO NOTHING;

-- Executive Search
INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug IN ('heidrick-struggles', 'spencer-stuart', 'korn-ferry')
AND c.slug = 'executive-search-recruiting'
ON CONFLICT (agency_id, category_id) DO NOTHING;

-- Accounting & Finance Staffing
INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug IN ('accountemps', 'vaco', 'robert-half', 'aston-carter')
AND c.slug = 'accounting-finance-staffing'
ON CONFLICT (agency_id, category_id) DO NOTHING;

-- Administrative & Office Staffing
INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug IN ('kelly-services', 'express-employment', 'adecco-usa', 'randstad-usa')
AND c.slug = 'administrative-office-staffing'
ON CONFLICT (agency_id, category_id) DO NOTHING;

-- Warehouse & Logistics Staffing
INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug IN ('prologistix', 'staffmark', 'employbridge', 'peopleready')
AND c.slug = 'warehouse-logistics-staffing'
ON CONFLICT (agency_id, category_id) DO NOTHING;

-- Engineering Staffing
INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug IN ('aerotek', 'yoh-services', 'hays-us')
AND c.slug = 'engineering-staffing'
ON CONFLICT (agency_id, category_id) DO NOTHING;

-- Government & Defense Staffing
INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug IN ('mantech', 'saic')
AND c.slug = 'government-defense-staffing'
ON CONFLICT (agency_id, category_id) DO NOTHING;

-- Temporary Staffing
INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug IN ('adecco-usa', 'randstad-usa', 'kelly-services', 'express-employment', 'manpowergroup', 'staffmark')
AND c.slug = 'temporary-staffing'
ON CONFLICT (agency_id, category_id) DO NOTHING;

-- Remote Staffing
INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug IN ('toptal', 'upwork-enterprise')
AND c.slug = 'remote-staffing'
ON CONFLICT (agency_id, category_id) DO NOTHING;

-- Legal Staffing
INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug IN ('robert-half-legal')
AND c.slug = 'legal-staffing'
ON CONFLICT (agency_id, category_id) DO NOTHING;

-- Hospitality Staffing
INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug IN ('lgc-hospitality')
AND c.slug = 'hospitality-event-staffing'
ON CONFLICT (agency_id, category_id) DO NOTHING;

-- Scientific & Pharmaceutical Staffing
INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug IN ('aston-carter', 'yoh-services')
AND c.slug = 'scientific-pharmaceutical-staffing'
ON CONFLICT (agency_id, category_id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════
-- STEP 5: SEED REVIEWS
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO reviews (agency_id, user_id, rating_overall, rating_quality, rating_communication, rating_value, rating_timeliness, title, body, work_duration, role_hired, company_name, verified, approved)
SELECT a.id, 'seed-user-1', 5, 5, 5, 4.5, 5,
  'Outstanding IT staffing partner',
  'TEKsystems provided us with 15 contract developers for our cloud migration project. Every candidate was thoroughly vetted and hit the ground running. Their account team was responsive and proactive about replacements.',
  '18 months', 'Cloud Engineers', 'Fortune 500 Bank', true, true
FROM agencies a WHERE a.slug = 'teksystems';

INSERT INTO reviews (agency_id, user_id, rating_overall, rating_quality, rating_communication, rating_value, rating_timeliness, title, body, work_duration, role_hired, company_name, verified, approved)
SELECT a.id, 'seed-user-2', 4.5, 5, 4.5, 4, 5,
  'Reliable healthcare staffing',
  'AMN Healthcare has been our go-to for travel nursing for 3 years. They consistently fill hard-to-staff positions in our ICU and ER departments. Great compliance documentation and credential verification.',
  '3 years', 'Travel Nurses (ICU/ER)', 'Regional Hospital System', true, true
FROM agencies a WHERE a.slug = 'amn-healthcare';

INSERT INTO reviews (agency_id, user_id, rating_overall, rating_quality, rating_communication, rating_value, rating_timeliness, title, body, work_duration, role_hired, company_name, verified, approved)
SELECT a.id, 'seed-user-3', 4, 4, 4, 4.5, 3.5,
  'Solid industrial staffing at scale',
  'Adecco staffed our 200-person warehouse expansion in under 6 weeks. Onboarding was smooth, safety compliance was handled well. Some turnover issues initially but their team resolved it quickly.',
  '1 year', 'Warehouse Workers & Forklift Operators', 'E-commerce Fulfillment Co', true, true
FROM agencies a WHERE a.slug = 'adecco-usa';

INSERT INTO reviews (agency_id, user_id, rating_overall, rating_quality, rating_communication, rating_value, rating_timeliness, title, body, work_duration, role_hired, company_name, verified, approved)
SELECT a.id, 'seed-user-4', 5, 5, 5, 4, 5,
  'Found our CTO in 6 weeks',
  'Heidrick & Struggles ran a flawless executive search for our Chief Technology Officer. The candidate slate was exceptional — three finalists, all perfect fits. Worth every penny of the retained fee.',
  '6 weeks', 'Chief Technology Officer', 'Series C SaaS Startup', true, true
FROM agencies a WHERE a.slug = 'heidrick-struggles';

INSERT INTO reviews (agency_id, user_id, rating_overall, rating_quality, rating_communication, rating_value, rating_timeliness, title, body, work_duration, role_hired, company_name, verified, approved)
SELECT a.id, 'seed-user-5', 4.5, 5, 4, 4.5, 5,
  'Best construction staffing in the Midwest',
  'Tradesmen International provided 40+ skilled electricians and pipefitters for our manufacturing plant expansion. Safety record was impeccable. They understand construction timelines and urgency.',
  '8 months', 'Electricians & Pipefitters', 'Industrial Manufacturer', true, true
FROM agencies a WHERE a.slug = 'tradesmen-international';

INSERT INTO reviews (agency_id, user_id, rating_overall, rating_quality, rating_communication, rating_value, rating_timeliness, title, body, work_duration, role_hired, company_name, verified, approved)
SELECT a.id, 'seed-user-6', 4.5, 5, 4.5, 4, 4.5,
  'Top-tier remote engineering talent',
  'Toptal provided us with 3 senior React engineers who integrated seamlessly with our team. The screening process is rigorous — candidates were significantly better than other platforms we tried.',
  '1 year', 'Senior React Engineers', 'FinTech Startup', true, true
FROM agencies a WHERE a.slug = 'toptal';

-- Update review counts and avg ratings
UPDATE agencies SET
  review_count = (SELECT COUNT(*) FROM reviews r WHERE r.agency_id = agencies.id AND r.approved = true),
  avg_rating = (SELECT ROUND(AVG(r.rating_overall)::numeric, 2) FROM reviews r WHERE r.agency_id = agencies.id AND r.approved = true)
WHERE id IN (SELECT DISTINCT agency_id FROM reviews);
