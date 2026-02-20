-- FirmsLedger – run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- Categories (from Category_export)
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

-- Agencies (companies listed on the directory)
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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(slug)
);

-- Agency–Category links
CREATE TABLE IF NOT EXISTS agency_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(agency_id, category_id)
);

-- Reviews
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

-- Leads (proposal requests)
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

-- Invites: send a link to companies so they can add their listing
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agencies_approved ON agencies(approved);
CREATE INDEX IF NOT EXISTS idx_agencies_slug ON agencies(slug);
CREATE INDEX IF NOT EXISTS idx_agency_categories_agency ON agency_categories(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_categories_category ON agency_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_reviews_agency ON reviews(agency_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);
CREATE INDEX IF NOT EXISTS idx_company_invites_token ON company_invites(token);
CREATE INDEX IF NOT EXISTS idx_company_invites_email ON company_invites(email);

-- RLS: allow public read for approved/listed data; allow insert for agencies (listing request) and leads
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_invites ENABLE ROW LEVEL SECURITY;

-- Public read for categories
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

-- Agencies: everyone can read approved; anyone can insert (list your company)
CREATE POLICY "Approved agencies are viewable by everyone" ON agencies FOR SELECT USING (approved = true);
CREATE POLICY "Anyone can submit a listing request" ON agencies FOR INSERT WITH CHECK (true);
-- UPDATE/DELETE: use Supabase Dashboard or service role (server); anon cannot update/delete.

-- Agency categories: public read
CREATE POLICY "Agency categories are viewable by everyone" ON agency_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can insert agency_category" ON agency_categories FOR INSERT WITH CHECK (true);

-- Reviews: public read approved
CREATE POLICY "Approved reviews are viewable by everyone" ON reviews FOR SELECT USING (approved = true);
CREATE POLICY "Anyone can insert a review" ON reviews FOR INSERT WITH CHECK (true);

-- Leads: insert only (form submission); read/update via service or dashboard
CREATE POLICY "Anyone can submit a lead" ON leads FOR INSERT WITH CHECK (true);

-- Invites: read by token (for join page)
CREATE POLICY "Invites are viewable by token" ON company_invites FOR SELECT USING (true);
CREATE POLICY "Join page can update invite when used" ON company_invites FOR UPDATE USING (true);
CREATE POLICY "Admins create invites" ON company_invites FOR INSERT WITH CHECK (true);
