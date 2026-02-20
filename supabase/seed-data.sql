-- FirmsLedger – seed data for Supabase
-- Run this in Supabase Dashboard → SQL Editor → New query (after you've run schema.sql)
-- Run in order: categories first, then agencies, then agency_categories, then reviews.

-- ========== CATEGORIES ==========
INSERT INTO categories (name, slug, description, icon, "order", is_parent, parent_id)
VALUES
  ('Staffing Companies', 'staffing-companies', 'Recruitment and staffing services', 'users', 1, true, NULL)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, icon, "order", is_parent, parent_id)
VALUES
  ('Healthcare Staffing', 'healthcare-staffing', 'Healthcare and medical staffing agencies', '', 1, false, NULL),
  ('IT Staffing', 'it-staffing', 'Information technology staffing agencies', '', 2, false, NULL),
  ('Temporary Staffing', 'temporary-staffing', 'Temporary and short-term staffing solutions', '', 3, false, NULL),
  ('Permanent Staffing', 'permanent-staffing', 'Permanent placement and hiring services', '', 4, false, NULL),
  ('Executive Search', 'executive-search', 'Executive and leadership recruitment', '', 5, false, NULL),
  ('Remote Staffing', 'remote-staffing', 'Remote and distributed team staffing', '', 6, false, NULL),
  ('Contract Staffing', 'contract-staffing', 'Contract and project-based staffing', '', 7, false, NULL),
  ('HR & Recruitment Services', 'hr-recruitment-services', 'HR outsourcing and recruitment services', '', 8, false, NULL),
  ('Technical Staffing', 'technical-staffing', 'Technical and engineering staffing', '', 9, false, NULL),
  ('Industrial Staffing', 'industrial-staffing', 'Industrial and manufacturing staffing', '', 10, false, NULL)
ON CONFLICT (slug) DO NOTHING;

-- Link subcategories to Staffing Companies parent (so Find Services dropdown shows them)
UPDATE categories
SET parent_id = (SELECT id FROM categories WHERE slug = 'staffing-companies' LIMIT 1)
WHERE slug IN (
  'healthcare-staffing', 'it-staffing', 'temporary-staffing', 'permanent-staffing',
  'executive-search', 'remote-staffing', 'contract-staffing', 'hr-recruitment-services',
  'technical-staffing', 'industrial-staffing'
)
AND parent_id IS NULL;

-- ========== AGENCIES ==========
INSERT INTO agencies (name, slug, description, website, logo_url, hq_city, hq_state, hq_country, team_size, founded_year, pricing_model, remote_support, approved, featured, verified, avg_rating, review_count)
VALUES
  ('NextEdge Talent', 'nextedge-talent', 'Executive search and fractional HR leadership to growing companies.', 'https://nextedge.in', 'https://ui-avatars.com/api/?name=NextEdge&background=4F46E5&color=fff', 'Mumbai', 'Maharashtra', 'India', '1-10', 2016, 'Hourly Rate', true, true, true, false, 4.5, 3),
  ('CielHR Boutique Division', 'cielhr-boutique-division', 'Senior hiring and retention strategies for tech startups.', 'https://cielhrboutique.in', 'https://ui-avatars.com/api/?name=CielHR&background=7C3AED&color=fff', 'Bengaluru', 'Karnataka', 'India', '1-10', 2019, 'Hourly Rate', false, true, false, false, 4.2, 2),
  ('TalentBridge Consulting', 'talentbridge-consulting', 'Recruiting consultancy for CXO and senior leadership hires for mid-sized firms.', 'https://talentbridge.in', 'https://ui-avatars.com/api/?name=TalentBridge&background=2563EB&color=fff', 'Pune', 'Maharashtra', 'India', '1-10', 2017, 'Hourly Rate', true, true, true, false, 4.8, 5),
  ('Strategic Hiring Solutions', 'strategic-hiring-solutions', 'Confidential searches for senior roles and board advisors.', 'https://strategichiring.in', 'https://ui-avatars.com/api/?name=Strategic&background=059669&color=fff', 'Gurgaon', 'Haryana', 'India', '1-10', 2014, 'Hourly Rate', false, true, false, true, 4.6, 4),
  ('Wisemonk', 'wisemonk', 'Remote staffing, EOR and HR-as-a-service for startups and small distributed teams.', 'https://wisemonk.io', 'https://ui-avatars.com/api/?name=Wisemonk&background=DC2626&color=fff', 'Bengaluru', 'Karnataka', 'India', '1-10', 2016, 'Hourly Rate', true, true, true, true, 4.9, 8),
  ('RemoteWorks India', 'remoteworks-india', 'Remote developers and support staff for international clients.', 'https://remoteworks.in', 'https://ui-avatars.com/api/?name=RemoteWorks&background=EA580C&color=fff', 'Bengaluru', 'Karnataka', 'India', '1-10', 2018, 'Hourly Rate', true, true, false, false, 4.3, 6),
  ('StaffDomain India', 'staffdomain-india', 'Hire remote teams across India for product and growth roles.', 'https://staffdomain.in', 'https://ui-avatars.com/api/?name=StaffDomain&background=4F46E5&color=fff', 'Mumbai', 'Maharashtra', 'India', '1-10', 2017, 'Hourly Rate', true, true, false, false, 4.4, 4),
  ('Virtalent India', 'virtalent-india', 'Virtual assistants, remote ops and admin staff for SMEs.', 'https://virtalent.in', 'https://ui-avatars.com/api/?name=Virtalent&background=4F46E5&color=fff', 'New Delhi', 'Delhi', 'India', '1-10', 2016, 'Hourly Rate', true, true, false, false, 4.1, 3),
  ('TalentPod Global', 'talentpod-global', 'Remote pods of engineers and product staff on contract for startups.', 'https://talentpod.in', 'https://ui-avatars.com/api/?name=TalentPod&background=7C3AED&color=fff', 'Pune', 'Maharashtra', 'India', '1-10', 2019, 'Hourly Rate', true, true, false, false, 4.5, 5),
  ('ContractHire Solutions', 'contracthire-solutions', 'Project-based contract staff for IT and non-IT initiatives.', 'https://contracthire.in', 'https://ui-avatars.com/api/?name=ContractHire&background=2563EB&color=fff', 'Noida', 'Uttar Pradesh', 'India', '1-10', 2015, 'Hourly Rate', false, true, false, false, 4.0, 4),
  ('Agile Staffing Services', 'agile-staffing-services', 'Contract resources for short-term sprints and product pushes.', 'https://agilestaffing.in', 'https://ui-avatars.com/api/?name=Agile&background=DC2626&color=fff', 'Pune', 'Maharashtra', 'India', '1-10', 2014, 'Hourly Rate', true, true, false, false, 4.2, 3),
  ('PeopleFlex HR', 'peopleflex-hr', 'Contract employees for supply chain and operations projects.', 'https://peopleflex.in', 'https://ui-avatars.com/api/?name=PeopleFlex&background=EA580C&color=fff', 'New Delhi', 'Delhi', 'India', '1-10', 2017, 'Hourly Rate', false, true, false, false, 4.3, 2)
ON CONFLICT (slug) DO NOTHING;

-- ========== AGENCY_CATEGORIES (link agencies to categories by slug) ==========
INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'nextedge-talent' AND c.slug = 'executive-search'
ON CONFLICT (agency_id, category_id) DO NOTHING;

INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'cielhr-boutique-division' AND c.slug = 'executive-search'
ON CONFLICT (agency_id, category_id) DO NOTHING;

INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'talentbridge-consulting' AND c.slug = 'executive-search'
ON CONFLICT (agency_id, category_id) DO NOTHING;

INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'strategic-hiring-solutions' AND c.slug = 'executive-search'
ON CONFLICT (agency_id, category_id) DO NOTHING;

INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'wisemonk' AND c.slug = 'remote-staffing'
ON CONFLICT (agency_id, category_id) DO NOTHING;

INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'remoteworks-india' AND c.slug IN ('remote-staffing', 'it-staffing')
ON CONFLICT (agency_id, category_id) DO NOTHING;

INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'staffdomain-india' AND c.slug = 'remote-staffing'
ON CONFLICT (agency_id, category_id) DO NOTHING;

INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'virtalent-india' AND c.slug = 'remote-staffing'
ON CONFLICT (agency_id, category_id) DO NOTHING;

INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'talentpod-global' AND c.slug IN ('remote-staffing', 'contract-staffing')
ON CONFLICT (agency_id, category_id) DO NOTHING;

INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'contracthire-solutions' AND c.slug = 'contract-staffing'
ON CONFLICT (agency_id, category_id) DO NOTHING;

INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'agile-staffing-services' AND c.slug = 'contract-staffing'
ON CONFLICT (agency_id, category_id) DO NOTHING;

INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'peopleflex-hr' AND c.slug = 'contract-staffing'
ON CONFLICT (agency_id, category_id) DO NOTHING;

-- ========== REVIEWS (approved reviews for seeded agencies) ==========
INSERT INTO reviews (agency_id, user_id, rating_overall, rating_quality, rating_communication, rating_value, rating_timeliness, title, body, work_duration, role_hired, company_name, verified, approved)
SELECT a.id, 'seed-user', 5, 5, 5, 5, 5,
  'Exceptional executive search',
  'NextEdge found us a perfect fractional CHRO. Professional and fast.',
  '6 months', 'Fractional CHRO', 'Tech Startup', true, true
FROM agencies a WHERE a.slug = 'nextedge-talent' LIMIT 1;

INSERT INTO reviews (agency_id, user_id, rating_overall, rating_quality, rating_communication, rating_value, rating_timeliness, title, body, work_duration, role_hired, company_name, verified, approved)
SELECT a.id, 'seed-user', 4.5, 5, 4, 5, 5,
  'Great leadership hire',
  'TalentBridge placed our VP Engineering. Strong process and follow-up.',
  '8 months', 'VP Engineering', 'SMB', true, true
FROM agencies a WHERE a.slug = 'talentbridge-consulting' LIMIT 1;

INSERT INTO reviews (agency_id, user_id, rating_overall, rating_quality, rating_communication, rating_value, rating_timeliness, title, body, work_duration, role_hired, company_name, verified, approved)
SELECT a.id, 'seed-user', 5, 5, 5, 5, 5,
  'Smooth remote team setup',
  'Wisemonk helped us set up our India team. EOR and payroll were hassle-free.',
  '1 year', 'Remote developers', 'SaaS Co', true, true
FROM agencies a WHERE a.slug = 'wisemonk' LIMIT 1;

INSERT INTO reviews (agency_id, user_id, rating_overall, rating_quality, rating_communication, rating_value, rating_timeliness, title, body, work_duration, role_hired, company_name, verified, approved)
SELECT a.id, 'seed-user', 4, 4, 4, 4, 5,
  'Good contract developers',
  'RemoteWorks supplied two developers for our project. Delivered on time.',
  '4 months', 'Full Stack Developer', 'E-commerce', false, true
FROM agencies a WHERE a.slug = 'remoteworks-india' LIMIT 1;

INSERT INTO reviews (agency_id, user_id, rating_overall, rating_quality, rating_communication, rating_value, rating_timeliness, title, body, work_duration, role_hired, company_name, verified, approved)
SELECT a.id, 'seed-user', 4.8, 5, 5, 4.5, 5,
  'Confidential board search',
  'Strategic Hiring found us an independent director. Discreet and thorough.',
  '3 months', 'Board Director', 'Enterprise', true, true
FROM agencies a WHERE a.slug = 'strategic-hiring-solutions' LIMIT 1;

-- ========== OPTIONAL: UPDATE agency review_count and avg_rating ==========
-- Run after reviews are inserted so directory shows correct counts
UPDATE agencies SET
  review_count = (SELECT COUNT(*) FROM reviews r WHERE r.agency_id = agencies.id AND r.approved = true),
  avg_rating = (SELECT ROUND(AVG(r.rating_overall)::numeric, 2) FROM reviews r WHERE r.agency_id = agencies.id AND r.approved = true)
WHERE id IN (SELECT DISTINCT agency_id FROM reviews);
