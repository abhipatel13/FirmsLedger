-- FirmsLedger – Tier 2 Categories Seed (High Volume, Less Competition)
-- Categories: Legal Services, Business Consulting, GST & Tax, PR & Communications, Content Writing
-- Run AFTER seed-data.sql in Supabase Dashboard → SQL Editor

-- ============================================================
-- 1. PARENT CATEGORIES
-- ============================================================
INSERT INTO categories (name, slug, description, icon, "order", is_parent, parent_id)
VALUES
  ('Legal Services', 'legal-services', 'Law firms and legal advisory for businesses', 'scale', 2, true, NULL),
  ('Business Consulting', 'business-consulting', 'Strategy, management and operations consulting firms', 'briefcase', 3, true, NULL),
  ('GST & Tax Consultants', 'gst-tax-consultants', 'GST filing, income tax, audit and accounting services', 'calculator', 4, true, NULL),
  ('PR & Communications', 'pr-communications', 'Public relations, media and brand communications agencies', 'megaphone', 5, true, NULL),
  ('Content Writing Services', 'content-writing-services', 'Blog, SEO content, copywriting and technical writing agencies', 'pen-tool', 6, true, NULL)
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- 2. SUBCATEGORIES
-- ============================================================

-- Legal Services subcategories
INSERT INTO categories (name, slug, description, icon, "order", is_parent, parent_id)
VALUES
  ('Corporate Law', 'corporate-law', 'Corporate legal advisory and company formation', '', 1, false, NULL),
  ('Startup Legal', 'startup-legal', 'Legal services for startups — incorporation, ESOP, founders agreements', '', 2, false, NULL),
  ('IPR & Trademark', 'ipr-trademark', 'Intellectual property, trademark and patent registration', '', 3, false, NULL),
  ('Contract Drafting', 'contract-drafting', 'Business contracts, NDAs and vendor agreements', '', 4, false, NULL),
  ('Compliance & Regulatory', 'compliance-regulatory', 'RBI, SEBI, MCA compliance and regulatory filings', '', 5, false, NULL),
  ('Litigation Support', 'litigation-support', 'Commercial dispute resolution and court representation', '', 6, false, NULL)
ON CONFLICT (slug) DO NOTHING;

UPDATE categories
SET parent_id = (SELECT id FROM categories WHERE slug = 'legal-services' LIMIT 1)
WHERE slug IN ('corporate-law','startup-legal','ipr-trademark','contract-drafting','compliance-regulatory','litigation-support')
AND parent_id IS NULL;

-- Business Consulting subcategories
INSERT INTO categories (name, slug, description, icon, "order", is_parent, parent_id)
VALUES
  ('Strategy Consulting', 'strategy-consulting', 'Business strategy and growth planning', '', 1, false, NULL),
  ('Operations Consulting', 'operations-consulting', 'Process improvement and operational efficiency', '', 2, false, NULL),
  ('Financial Advisory', 'financial-advisory', 'CFO advisory, fundraising and financial planning', '', 3, false, NULL),
  ('Management Consulting', 'management-consulting', 'Organizational design and change management', '', 4, false, NULL),
  ('Startup Advisory', 'startup-advisory', 'Mentoring, pitching and early-stage business advisory', '', 5, false, NULL)
ON CONFLICT (slug) DO NOTHING;

UPDATE categories
SET parent_id = (SELECT id FROM categories WHERE slug = 'business-consulting' LIMIT 1)
WHERE slug IN ('strategy-consulting','operations-consulting','financial-advisory','management-consulting','startup-advisory')
AND parent_id IS NULL;

-- GST & Tax Consultants subcategories
INSERT INTO categories (name, slug, description, icon, "order", is_parent, parent_id)
VALUES
  ('GST Filing & Compliance', 'gst-filing-compliance', 'Monthly and annual GST return filing services', '', 1, false, NULL),
  ('Income Tax & ITR Filing', 'income-tax-itr-filing', 'Individual and business ITR filing and planning', '', 2, false, NULL),
  ('Tax Planning', 'tax-planning', 'Proactive tax optimization for businesses and HNIs', '', 3, false, NULL),
  ('Audit Services', 'audit-services', 'Statutory, tax and internal audit services', '', 4, false, NULL),
  ('Bookkeeping & Accounting', 'bookkeeping-accounting', 'Outsourced bookkeeping, payroll and MIS reporting', '', 5, false, NULL)
ON CONFLICT (slug) DO NOTHING;

UPDATE categories
SET parent_id = (SELECT id FROM categories WHERE slug = 'gst-tax-consultants' LIMIT 1)
WHERE slug IN ('gst-filing-compliance','income-tax-itr-filing','tax-planning','audit-services','bookkeeping-accounting')
AND parent_id IS NULL;

-- PR & Communications subcategories
INSERT INTO categories (name, slug, description, icon, "order", is_parent, parent_id)
VALUES
  ('Media Relations', 'media-relations', 'Press releases, journalist outreach and media coverage', '', 1, false, NULL),
  ('Digital PR', 'digital-pr', 'Online reputation, link building and digital press', '', 2, false, NULL),
  ('Crisis Management', 'crisis-management', 'Reputation protection and crisis communication', '', 3, false, NULL),
  ('Brand Communications', 'brand-communications', 'Brand storytelling and corporate communications', '', 4, false, NULL),
  ('Influencer Relations', 'influencer-relations', 'Influencer identification, outreach and campaigns', '', 5, false, NULL)
ON CONFLICT (slug) DO NOTHING;

UPDATE categories
SET parent_id = (SELECT id FROM categories WHERE slug = 'pr-communications' LIMIT 1)
WHERE slug IN ('media-relations','digital-pr','crisis-management','brand-communications','influencer-relations')
AND parent_id IS NULL;

-- Content Writing Services subcategories
INSERT INTO categories (name, slug, description, icon, "order", is_parent, parent_id)
VALUES
  ('Blog & Article Writing', 'blog-article-writing', 'Long-form blog posts and editorial content', '', 1, false, NULL),
  ('SEO Content Writing', 'seo-content-writing', 'Keyword-optimized content for search rankings', '', 2, false, NULL),
  ('Copywriting', 'copywriting', 'Website copy, ads and conversion-focused writing', '', 3, false, NULL),
  ('Technical Writing', 'technical-writing', 'Product docs, API guides and knowledge bases', '', 4, false, NULL),
  ('Social Media Content', 'social-media-content', 'Captions, scripts and posts for social platforms', '', 5, false, NULL)
ON CONFLICT (slug) DO NOTHING;

UPDATE categories
SET parent_id = (SELECT id FROM categories WHERE slug = 'content-writing-services' LIMIT 1)
WHERE slug IN ('blog-article-writing','seo-content-writing','copywriting','technical-writing','social-media-content')
AND parent_id IS NULL;


-- ============================================================
-- 3. SAMPLE AGENCIES (so pages aren't empty)
-- ============================================================
INSERT INTO agencies (name, slug, description, website, logo_url, hq_city, hq_state, hq_country, team_size, founded_year, pricing_model, remote_support, approved, featured, verified, avg_rating, review_count)
VALUES

-- Legal Services
('LexStart India', 'lexstart-india', 'Startup-focused law firm handling incorporation, ESOP, and fundraising docs for early-stage companies.', 'https://lexstart.in', 'https://ui-avatars.com/api/?name=LexStart&background=1E40AF&color=fff', 'Bengaluru', 'Karnataka', 'India', '11-50', 2018, 'Fixed Price', true, true, true, false, 4.7, 6),
('Legalwiz.in', 'legalwiz-in', 'Online legal services for trademark, GST registration, company formation and compliance.', 'https://legalwiz.in', 'https://ui-avatars.com/api/?name=Legalwiz&background=1D4ED8&color=fff', 'Ahmedabad', 'Gujarat', 'India', '51-200', 2016, 'Fixed Price', true, true, false, false, 4.5, 9),
('Vakilsearch Business', 'vakilsearch-business', 'Legal and compliance services for SMEs — registrations, contracts and filings.', 'https://vakilsearch.com', 'https://ui-avatars.com/api/?name=Vakilsearch&background=2563EB&color=fff', 'Chennai', 'Tamil Nadu', 'India', '200+', 2011, 'Fixed Price', true, true, true, true, 4.3, 14),

-- Business Consulting
('Bain Capability Center India', 'bain-capability-india', 'Strategy and analytics consulting arm supporting Bain global clients from India.', 'https://bain.com', 'https://ui-avatars.com/api/?name=Bain&background=7C3AED&color=fff', 'New Delhi', 'Delhi', 'India', '200+', 2006, 'Custom Quote', false, true, true, true, 4.8, 11),
('GrowthX Advisory', 'growthx-advisory', 'Go-to-market and growth strategy consulting for B2B startups and scale-ups.', 'https://growthx.club', 'https://ui-avatars.com/api/?name=GrowthX&background=9333EA&color=fff', 'Mumbai', 'Maharashtra', 'India', '11-50', 2020, 'Retainer', true, true, false, false, 4.6, 7),
('Avalon Consulting', 'avalon-consulting', 'Management consulting for mid-market and family businesses across India.', 'https://avalonconsulting.in', 'https://ui-avatars.com/api/?name=Avalon&background=6D28D9&color=fff', 'Mumbai', 'Maharashtra', 'India', '51-200', 1997, 'Custom Quote', false, true, false, false, 4.4, 5),

-- GST & Tax
('ClearTax Business', 'cleartax-business', 'End-to-end GST compliance, ITR filing and tax planning for businesses and individuals.', 'https://cleartax.in', 'https://ui-avatars.com/api/?name=ClearTax&background=059669&color=fff', 'Bengaluru', 'Karnataka', 'India', '200+', 2011, 'Subscription', true, true, true, true, 4.6, 22),
('Tax2Win Pro', 'tax2win-pro', 'Expert-assisted ITR filing, tax planning and refund services for salaried and business owners.', 'https://tax2win.in', 'https://ui-avatars.com/api/?name=Tax2Win&background=047857&color=fff', 'Jaipur', 'Rajasthan', 'India', '51-200', 2016, 'Fixed Price', true, true, false, false, 4.4, 13),
('Taxmann Advisory', 'taxmann-advisory', 'GST audit, tax litigation support and compliance advisory for corporates and SMEs.', 'https://taxmann.com', 'https://ui-avatars.com/api/?name=Taxmann&background=065F46&color=fff', 'New Delhi', 'Delhi', 'India', '51-200', 1962, 'Retainer', false, true, false, true, 4.7, 18),

-- PR & Communications
('Adfactors PR', 'adfactors-pr', 'India''s largest independent PR firm with expertise in financial, corporate and consumer PR.', 'https://adfactorspr.com', 'https://ui-avatars.com/api/?name=Adfactors&background=DC2626&color=fff', 'Mumbai', 'Maharashtra', 'India', '200+', 1997, 'Retainer', false, true, true, true, 4.7, 10),
('Ideosphere Communications', 'ideosphere-communications', 'Digital PR and brand communications for tech startups and consumer brands.', 'https://ideosphere.in', 'https://ui-avatars.com/api/?name=Ideosphere&background=B91C1C&color=fff', 'Bengaluru', 'Karnataka', 'India', '11-50', 2012, 'Retainer', true, true, false, false, 4.5, 6),
('PRHUB India', 'prhub-india', 'Integrated PR and media relations for technology and FMCG brands in India.', 'https://prhub.in', 'https://ui-avatars.com/api/?name=PRHUB&background=EF4444&color=fff', 'Bengaluru', 'Karnataka', 'India', '11-50', 2009, 'Retainer', false, true, false, false, 4.3, 4),

-- Content Writing
('Pepper Content', 'pepper-content', 'AI-powered content marketplace connecting brands with 70,000+ freelance writers across India.', 'https://peppercontent.io', 'https://ui-avatars.com/api/?name=Pepper&background=EA580C&color=fff', 'Mumbai', 'Maharashtra', 'India', '200+', 2017, 'Subscription', true, true, true, true, 4.6, 19),
('Scatter India', 'scatter-india', 'Content strategy and production agency for B2B SaaS and fintech brands.', 'https://scatter.in', 'https://ui-avatars.com/api/?name=Scatter&background=C2410C&color=fff', 'Mumbai', 'Maharashtra', 'India', '11-50', 2015, 'Retainer', true, true, false, false, 4.5, 8),
('Content Whale', 'content-whale', 'Bulk SEO content writing for agencies, publishers and ecommerce brands.', 'https://content-whale.com', 'https://ui-avatars.com/api/?name=ContentWhale&background=F97316&color=fff', 'Pune', 'Maharashtra', 'India', '11-50', 2018, 'Per Word', true, true, false, false, 4.2, 5)

ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- 4. LINK AGENCIES TO CATEGORIES
-- ============================================================

-- Legal Services
INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'lexstart-india' AND c.slug = 'startup-legal'
ON CONFLICT (agency_id, category_id) DO NOTHING;

INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'legalwiz-in' AND c.slug IN ('corporate-law', 'compliance-regulatory')
ON CONFLICT (agency_id, category_id) DO NOTHING;

INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'vakilsearch-business' AND c.slug IN ('corporate-law', 'ipr-trademark', 'contract-drafting')
ON CONFLICT (agency_id, category_id) DO NOTHING;

-- Business Consulting
INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'bain-capability-india' AND c.slug IN ('strategy-consulting', 'management-consulting')
ON CONFLICT (agency_id, category_id) DO NOTHING;

INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'growthx-advisory' AND c.slug IN ('strategy-consulting', 'startup-advisory')
ON CONFLICT (agency_id, category_id) DO NOTHING;

INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'avalon-consulting' AND c.slug = 'management-consulting'
ON CONFLICT (agency_id, category_id) DO NOTHING;

-- GST & Tax
INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'cleartax-business' AND c.slug IN ('gst-filing-compliance', 'income-tax-itr-filing', 'tax-planning')
ON CONFLICT (agency_id, category_id) DO NOTHING;

INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'tax2win-pro' AND c.slug IN ('income-tax-itr-filing', 'tax-planning')
ON CONFLICT (agency_id, category_id) DO NOTHING;

INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'taxmann-advisory' AND c.slug IN ('gst-filing-compliance', 'audit-services')
ON CONFLICT (agency_id, category_id) DO NOTHING;

-- PR & Communications
INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'adfactors-pr' AND c.slug IN ('media-relations', 'brand-communications', 'crisis-management')
ON CONFLICT (agency_id, category_id) DO NOTHING;

INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'ideosphere-communications' AND c.slug IN ('digital-pr', 'brand-communications')
ON CONFLICT (agency_id, category_id) DO NOTHING;

INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'prhub-india' AND c.slug = 'media-relations'
ON CONFLICT (agency_id, category_id) DO NOTHING;

-- Content Writing
INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'pepper-content' AND c.slug IN ('blog-article-writing', 'seo-content-writing', 'social-media-content')
ON CONFLICT (agency_id, category_id) DO NOTHING;

INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'scatter-india' AND c.slug IN ('blog-article-writing', 'seo-content-writing', 'copywriting')
ON CONFLICT (agency_id, category_id) DO NOTHING;

INSERT INTO agency_categories (agency_id, category_id)
SELECT a.id, c.id FROM agencies a, categories c
WHERE a.slug = 'content-whale' AND c.slug IN ('seo-content-writing', 'blog-article-writing')
ON CONFLICT (agency_id, category_id) DO NOTHING;


-- ============================================================
-- 5. REVIEWS
-- ============================================================

-- Legal Services
INSERT INTO reviews (agency_id, user_id, rating_overall, rating_quality, rating_communication, rating_value, rating_timeliness, title, body, work_duration, role_hired, company_name, verified, approved)
SELECT a.id, 'seed-user', 5, 5, 5, 5, 5,
  'Perfect startup legal partner',
  'LexStart handled our incorporation, SHA and ESOP framework end to end. Very startup-friendly team.',
  '3 months', 'Legal Advisor', 'D2C Startup', true, true
FROM agencies a WHERE a.slug = 'lexstart-india' LIMIT 1;

INSERT INTO reviews (agency_id, user_id, rating_overall, rating_quality, rating_communication, rating_value, rating_timeliness, title, body, work_duration, role_hired, company_name, verified, approved)
SELECT a.id, 'seed-user', 4.5, 5, 4, 4.5, 4.5,
  'Trademark registered in 2 weeks',
  'Vakilsearch made our trademark registration smooth. Transparent pricing and good follow-up.',
  '1 month', 'Trademark Filing', 'SME', true, true
FROM agencies a WHERE a.slug = 'vakilsearch-business' LIMIT 1;

-- Business Consulting
INSERT INTO reviews (agency_id, user_id, rating_overall, rating_quality, rating_communication, rating_value, rating_timeliness, title, body, work_duration, role_hired, company_name, verified, approved)
SELECT a.id, 'seed-user', 4.8, 5, 5, 4.5, 5,
  'Transformed our GTM strategy',
  'GrowthX helped us nail our ICP and restructure our sales motion. Revenue grew 3x in 6 months.',
  '6 months', 'Growth Consultant', 'B2B SaaS', true, true
FROM agencies a WHERE a.slug = 'growthx-advisory' LIMIT 1;

INSERT INTO reviews (agency_id, user_id, rating_overall, rating_quality, rating_communication, rating_value, rating_timeliness, title, body, work_duration, role_hired, company_name, verified, approved)
SELECT a.id, 'seed-user', 4.5, 5, 4, 4.5, 4,
  'Excellent operational overhaul',
  'Avalon mapped our entire supply chain and cut costs by 18%. Deep expertise in operations.',
  '4 months', 'Operations Consultant', 'Manufacturing Co', true, true
FROM agencies a WHERE a.slug = 'avalon-consulting' LIMIT 1;

-- GST & Tax
INSERT INTO reviews (agency_id, user_id, rating_overall, rating_quality, rating_communication, rating_value, rating_timeliness, title, body, work_duration, role_hired, company_name, verified, approved)
SELECT a.id, 'seed-user', 4.7, 5, 4.5, 5, 5,
  'GST compliance made easy',
  'ClearTax handles all our monthly GSTR filings and annual returns. Never missed a deadline.',
  '1 year', 'Tax Consultant', 'Retail Business', true, true
FROM agencies a WHERE a.slug = 'cleartax-business' LIMIT 1;

INSERT INTO reviews (agency_id, user_id, rating_overall, rating_quality, rating_communication, rating_value, rating_timeliness, title, body, work_duration, role_hired, company_name, verified, approved)
SELECT a.id, 'seed-user', 4.6, 5, 4.5, 4.5, 5,
  'Quick refund, great service',
  'Tax2Win filed my ITR and got me a higher refund than I expected. Very transparent and quick.',
  '2 weeks', 'ITR Filing', 'Individual', false, true
FROM agencies a WHERE a.slug = 'tax2win-pro' LIMIT 1;

-- PR & Communications
INSERT INTO reviews (agency_id, user_id, rating_overall, rating_quality, rating_communication, rating_value, rating_timeliness, title, body, work_duration, role_hired, company_name, verified, approved)
SELECT a.id, 'seed-user', 4.8, 5, 5, 4.5, 5,
  'Got us in ET and Business Standard',
  'Adfactors secured 12 tier-1 media placements in our first quarter. Their network is unmatched.',
  '6 months', 'PR Manager', 'Fintech Startup', true, true
FROM agencies a WHERE a.slug = 'adfactors-pr' LIMIT 1;

INSERT INTO reviews (agency_id, user_id, rating_overall, rating_quality, rating_communication, rating_value, rating_timeliness, title, body, work_duration, role_hired, company_name, verified, approved)
SELECT a.id, 'seed-user', 4.4, 4.5, 4.5, 4, 4.5,
  'Strong digital PR execution',
  'Ideosphere built great backlinks and got us featured on YourStory and Inc42. Good ROI.',
  '3 months', 'Digital PR', 'SaaS Company', true, true
FROM agencies a WHERE a.slug = 'ideosphere-communications' LIMIT 1;

-- Content Writing
INSERT INTO reviews (agency_id, user_id, rating_overall, rating_quality, rating_communication, rating_value, rating_timeliness, title, body, work_duration, role_hired, company_name, verified, approved)
SELECT a.id, 'seed-user', 4.7, 5, 4.5, 4.5, 5,
  'Scaled our content to 100 articles/month',
  'Pepper Content managed our entire content calendar. Quality is consistent and turnaround is fast.',
  '8 months', 'Content Partner', 'EdTech Platform', true, true
FROM agencies a WHERE a.slug = 'pepper-content' LIMIT 1;

INSERT INTO reviews (agency_id, user_id, rating_overall, rating_quality, rating_communication, rating_value, rating_timeliness, title, body, work_duration, role_hired, company_name, verified, approved)
SELECT a.id, 'seed-user', 4.5, 5, 4.5, 4, 5,
  'Best B2B content agency in India',
  'Scatter deeply understood our SaaS product and produced thought leadership that drove real pipeline.',
  '6 months', 'Content Strategy', 'B2B SaaS', true, true
FROM agencies a WHERE a.slug = 'scatter-india' LIMIT 1;


-- ============================================================
-- 6. UPDATE REVIEW COUNTS & RATINGS
-- ============================================================
UPDATE agencies SET
  review_count = (SELECT COUNT(*) FROM reviews r WHERE r.agency_id = agencies.id AND r.approved = true),
  avg_rating   = (SELECT ROUND(AVG(r.rating_overall)::numeric, 2) FROM reviews r WHERE r.agency_id = agencies.id AND r.approved = true)
WHERE slug IN (
  'lexstart-india','legalwiz-in','vakilsearch-business',
  'bain-capability-india','growthx-advisory','avalon-consulting',
  'cleartax-business','tax2win-pro','taxmann-advisory',
  'adfactors-pr','ideosphere-communications','prhub-india',
  'pepper-content','scatter-india','content-whale'
);
