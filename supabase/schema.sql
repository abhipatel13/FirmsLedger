-- FirmsLedger – Manufacturer Directory Schema
-- Run this in Neon SQL Editor (or psql) to initialize the database.
-- This replaces the old RFQ/agency marketplace schema.

-- ── Categories ────────────────────────────────────────────────────────────────
-- e.g. "Bike Manufacturers" (slug: bike-manufacturers), "Electrical Manufacturers"
CREATE TABLE IF NOT EXISTS categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id     UUID REFERENCES categories(id),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  icon          TEXT,
  "order"       INT DEFAULT 0,
  is_parent     BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ── Companies ─────────────────────────────────────────────────────────────────
-- US manufacturers listed in the directory
CREATE TABLE IF NOT EXISTS companies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  website         TEXT,
  logo_url        TEXT,
  founded_year    INT,
  employee_count  TEXT,                        -- e.g. "50-200", "500+"
  hq_state        TEXT NOT NULL,               -- e.g. "california"
  hq_state_label  TEXT,                        -- e.g. "California"
  hq_city         TEXT,
  contact_email   TEXT,
  certifications  TEXT[],                      -- e.g. ["ISO 9001", "AS9100"]
  is_verified     BOOLEAN DEFAULT false,
  featured        BOOLEAN DEFAULT false,
  approved        BOOLEAN DEFAULT false,
  owner_user_id   TEXT,
  avg_rating      NUMERIC(3,2) DEFAULT 0,
  review_count    INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── Company–Category links ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, category_id)
);

-- ── Reviews ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  reviewer_name         TEXT,
  reviewer_company      TEXT,
  user_id               TEXT,
  rating_overall        NUMERIC(2,1) NOT NULL,
  rating_quality        NUMERIC(2,1),
  rating_communication  NUMERIC(2,1),
  rating_value          NUMERIC(2,1),
  rating_timeliness     NUMERIC(2,1),
  title                 TEXT NOT NULL,
  body                  TEXT NOT NULL,
  work_duration         TEXT,
  role_hired            TEXT,
  verified              BOOLEAN DEFAULT false,
  approved              BOOLEAN DEFAULT false,
  company_response      TEXT,
  company_response_date TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- ── Listing Requests ──────────────────────────────────────────────────────────
-- Submitted via "List Your Company" form
CREATE TABLE IF NOT EXISTS listing_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name  TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website       TEXT,
  hq_state      TEXT,
  hq_city       TEXT,
  category_slug TEXT,                          -- primary category of interest
  description   TEXT,
  status        TEXT DEFAULT 'pending',        -- pending | approved | rejected
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ── Company Invites ───────────────────────────────────────────────────────────
-- Token-based invite links for companies to claim/create their listing
CREATE TABLE IF NOT EXISTS company_invites (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token         TEXT NOT NULL UNIQUE,
  email         TEXT NOT NULL,
  company_name  TEXT,
  expires_at    TIMESTAMPTZ NOT NULL,
  used_at       TIMESTAMPTZ,
  company_id    UUID REFERENCES companies(id),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_companies_approved    ON companies(approved);
CREATE INDEX IF NOT EXISTS idx_companies_slug        ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_state       ON companies(hq_state);
CREATE INDEX IF NOT EXISTS idx_companies_rating      ON companies(avg_rating DESC);
CREATE INDEX IF NOT EXISTS idx_company_cats_company  ON company_categories(company_id);
CREATE INDEX IF NOT EXISTS idx_company_cats_category ON company_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_reviews_company       ON reviews(company_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved      ON reviews(approved);
CREATE INDEX IF NOT EXISTS idx_invites_token         ON company_invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_email         ON company_invites(email);
CREATE INDEX IF NOT EXISTS idx_listing_req_status    ON listing_requests(status);
