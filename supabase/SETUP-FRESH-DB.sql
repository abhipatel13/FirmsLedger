-- ============================================================================
-- FirmsLedger — FRESH DATABASE SETUP (paste all of this into Supabase SQL Editor)
-- Target: https://ewxgflpheyxjunthfpcl.supabase.co/project/_/sql
--
-- Safe to re-run. All CREATE / ALTER / INSERT use IF NOT EXISTS / ON CONFLICT.
-- ============================================================================


-- ── 1. CORE SCHEMA ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES categories(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  "order" INT DEFAULT 0,
  is_parent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  founded_year INT,
  team_size TEXT,
  hq_country TEXT,
  hq_state TEXT,
  hq_city TEXT,
  pricing_model TEXT,
  min_project_size TEXT,
  remote_support BOOLEAN DEFAULT false,
  services_offered TEXT[],
  industries_served TEXT[],
  verified BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT false,
  owner_user_id TEXT,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  contact_email TEXT,
  phone TEXT,
  hourly_rate TEXT,
  address TEXT,
  tagline TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  service_focus JSONB DEFAULT '[]',
  industry_focus JSONB DEFAULT '[]',
  client_focus JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(slug)
);

CREATE TABLE IF NOT EXISTS agency_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(agency_id, category_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id TEXT,
  rating_overall NUMERIC(2,1) NOT NULL,
  rating_quality NUMERIC(2,1),
  rating_communication NUMERIC(2,1),
  rating_value NUMERIC(2,1),
  rating_timeliness NUMERIC(2,1),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  work_duration TEXT,
  role_hired TEXT,
  company_name TEXT,
  verified BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT false,
  agency_response TEXT,
  agency_response_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  company_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  role TEXT NOT NULL,
  number_of_hires INT NOT NULL,
  timeline TEXT NOT NULL,
  budget_range TEXT,
  country TEXT,
  state TEXT,
  city TEXT,
  remote_allowed BOOLEAN DEFAULT false,
  description TEXT,
  status TEXT DEFAULT 'Open',
  agencies_contacted UUID[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS company_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  company_name TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  agency_id UUID REFERENCES agencies(id),
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ── 2. BLOG AUTOMATION TABLES ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS blog_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  slug TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  image_url TEXT,
  image_alt TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  read_time TEXT NOT NULL DEFAULT '10 min read',
  content JSONB NOT NULL,
  published BOOLEAN NOT NULL DEFAULT true,
  indexed_at TIMESTAMPTZ,
  topic_id UUID REFERENCES blog_topics(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  meta_description TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  tags TEXT[] NOT NULL DEFAULT '{}',
  target_country TEXT NOT NULL DEFAULT 'Global',
  published_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  topic_id UUID REFERENCES blog_topics(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seo_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL,
  checks JSONB NOT NULL DEFAULT '{}',
  score NUMERIC NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  issues JSONB NOT NULL DEFAULT '[]',
  audited_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS submission_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  platform TEXT NOT NULL,
  status TEXT NOT NULL,
  response JSONB,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ── 3. INDEXES ──────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_agencies_approved      ON agencies(approved);
CREATE INDEX IF NOT EXISTS idx_agencies_slug          ON agencies(slug);
CREATE INDEX IF NOT EXISTS idx_agency_cats_agency     ON agency_categories(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_cats_category   ON agency_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_reviews_agency         ON reviews(agency_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved       ON reviews(approved);
CREATE INDEX IF NOT EXISTS idx_invites_token          ON company_invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_email          ON company_invites(email);
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx        ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS blog_posts_published_idx   ON blog_posts(published, created_at DESC);
CREATE INDEX IF NOT EXISTS blogs_slug_idx             ON blogs(slug);
CREATE INDEX IF NOT EXISTS blogs_status_idx           ON blogs(status, published_at DESC);
CREATE INDEX IF NOT EXISTS seo_audits_url_idx         ON seo_audits(page_url, audited_at DESC);
CREATE INDEX IF NOT EXISTS submission_logs_url_idx    ON submission_logs(url, submitted_at DESC);


-- ── 4. TRIGGERS ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS blog_posts_updated_at ON blog_posts;
CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ── 5. ROW LEVEL SECURITY ───────────────────────────────────────────────────

ALTER TABLE categories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies           ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews            ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads              ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_invites    ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_topics        ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_audits         ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_logs    ENABLE ROW LEVEL SECURITY;

-- Drop + recreate policies (CREATE POLICY has no IF NOT EXISTS)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
  DROP POLICY IF EXISTS "Approved agencies are viewable by everyone" ON agencies;
  DROP POLICY IF EXISTS "Anyone can submit a listing request" ON agencies;
  DROP POLICY IF EXISTS "Agency categories are viewable by everyone" ON agency_categories;
  DROP POLICY IF EXISTS "Anyone can insert agency_category" ON agency_categories;
  DROP POLICY IF EXISTS "Approved reviews are viewable by everyone" ON reviews;
  DROP POLICY IF EXISTS "Anyone can insert a review" ON reviews;
  DROP POLICY IF EXISTS "Anyone can submit a lead" ON leads;
  DROP POLICY IF EXISTS "Invites are viewable by token" ON company_invites;
  DROP POLICY IF EXISTS "Join page can update invite when used" ON company_invites;
  DROP POLICY IF EXISTS "Admins create invites" ON company_invites;
  DROP POLICY IF EXISTS "Public read published posts" ON blog_posts;
  DROP POLICY IF EXISTS "Service role full access to blog_posts" ON blog_posts;
  DROP POLICY IF EXISTS "Service role full access to blog_topics" ON blog_topics;
  DROP POLICY IF EXISTS "Public can read published blogs" ON blogs;
  DROP POLICY IF EXISTS "Service role full access to blogs" ON blogs;
  DROP POLICY IF EXISTS "Service role full access to seo_audits" ON seo_audits;
  DROP POLICY IF EXISTS "Service role full access to submission_logs" ON submission_logs;
END $$;

CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

CREATE POLICY "Approved agencies are viewable by everyone" ON agencies FOR SELECT USING (approved = true);
CREATE POLICY "Anyone can submit a listing request" ON agencies FOR INSERT WITH CHECK (true);

CREATE POLICY "Agency categories are viewable by everyone" ON agency_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can insert agency_category" ON agency_categories FOR INSERT WITH CHECK (true);

CREATE POLICY "Approved reviews are viewable by everyone" ON reviews FOR SELECT USING (approved = true);
CREATE POLICY "Anyone can insert a review" ON reviews FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can submit a lead" ON leads FOR INSERT WITH CHECK (true);

CREATE POLICY "Invites are viewable by token" ON company_invites FOR SELECT USING (true);
CREATE POLICY "Join page can update invite when used" ON company_invites FOR UPDATE USING (true);
CREATE POLICY "Admins create invites" ON company_invites FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read published posts" ON blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Service role full access to blog_posts" ON blog_posts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to blog_topics" ON blog_topics FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can read published blogs" ON blogs FOR SELECT USING (status = 'published');
CREATE POLICY "Service role full access to blogs" ON blogs FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to seo_audits" ON seo_audits FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to submission_logs" ON submission_logs FOR ALL USING (auth.role() = 'service_role');


-- ── 6. SEED: 15 PARENT CATEGORIES ACROSS ALL INDUSTRIES ─────────────────────

INSERT INTO categories (parent_id, name, slug, description, icon, "order", is_parent) VALUES
  (NULL, 'Staffing & Recruiting',         'staffing-recruiting',         'Verified staffing and recruitment firms across every specialization.',            'users',          1,  true),
  (NULL, 'IT & Technology',               'it-technology',               'Software development, cloud, cybersecurity, and technology services companies.',  'cpu',            2,  true),
  (NULL, 'Healthcare',                    'healthcare',                  'Hospitals, clinics, telehealth, medical device makers, and healthcare services.', 'heart-pulse',    3,  true),
  (NULL, 'Travel & Cruises',              'travel-cruises',              'Cruise lines, travel agencies, tour operators, and hospitality providers.',       'ship',           4,  true),
  (NULL, 'Education',                     'education',                   'Schools, universities, online learning platforms, and edtech companies.',         'graduation-cap', 5,  true),
  (NULL, 'Marketing & Advertising',       'marketing-advertising',       'Digital marketing, SEO, branding, and advertising agencies.',                     'megaphone',      6,  true),
  (NULL, 'Finance & Accounting',          'finance-accounting',          'Accounting firms, CPAs, wealth managers, and financial service providers.',       'briefcase',      7,  true),
  (NULL, 'Legal Services',                'legal',                       'Law firms, legal consulting, and legal process outsourcing providers.',           'scale',          8,  true),
  (NULL, 'Construction',                  'construction',                'Builders, contractors, and construction service providers.',                     'hard-hat',       9,  true),
  (NULL, 'Real Estate',                   'real-estate',                 'Real estate agencies, property managers, and commercial brokers.',                'home',           10, true),
  (NULL, 'Retail & E-commerce',           'retail-ecommerce',            'Retailers, e-commerce platforms, and direct-to-consumer brands.',                 'shopping-bag',   11, true),
  (NULL, 'Design & Creative',             'design-creative',             'Design studios, UX agencies, and creative production houses.',                    'palette',        12, true),
  (NULL, 'Engineering',                   'engineering',                 'Engineering consultants, mechanical, civil, and electrical firms.',               'zap',            13, true),
  (NULL, 'Logistics & Transportation',    'logistics-transportation',    'Freight, shipping, warehousing, and supply chain providers.',                     'truck',          14, true),
  (NULL, 'Aviation & Aerospace',          'aviation-aerospace',          'Airlines, aviation services, and aerospace manufacturers.',                       'plane',          15, true),
  (NULL, 'Machinery & Equipment',         'machinery-equipment',         'Industrial machinery, heavy equipment, CNC, robotics, and automation manufacturers.', 'cog',         16, true),
  (NULL, 'Chemicals & Materials',         'chemicals-materials',         'Chemical producers, specialty materials, polymers, coatings, and industrial suppliers.', 'flask-conical', 17, true),
  (NULL, 'Manufacturing',                 'manufacturing',               'Factories, industrial producers, and precision machining.',                       'factory',        18, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- DONE. Verify:  SELECT count(*) FROM categories;   -- expect 18
-- ============================================================================
