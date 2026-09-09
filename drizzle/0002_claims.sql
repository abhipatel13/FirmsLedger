-- Listing claims: a business owner taking ownership of an existing companies row.
--
-- PURELY ADDITIVE. No ALTER, no DROP, no UPDATE, no DELETE. Nothing here can
-- touch the existing ~12,800 companies. Every statement is IF NOT EXISTS, so
-- re-running the file is a no-op.
--
-- Ownership lives in THIS table, not in companies.owner_user_id — that column
-- is a dead Supabase-era leftover (text, 0 rows populated) and is left alone
-- on purpose so this migration never rewrites the companies table.

CREATE TABLE IF NOT EXISTS claims (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
  status        text NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
  verification  text,                             -- domain_match | manual
  role          text,
  contact_name  text,
  contact_email text,
  phone         text,
  review_note   text,
  reviewed_at   timestamptz,
  created_at    timestamptz DEFAULT now()
);

-- One approved owner per company, enforced by the database rather than trusted
-- to application logic. A second approval attempt fails at the driver.
CREATE UNIQUE INDEX IF NOT EXISTS claims_one_approved_per_company
  ON claims (company_id) WHERE status = 'approved';

-- One claim per user per company: re-submitting updates, never duplicates.
CREATE UNIQUE INDEX IF NOT EXISTS claims_user_company_unique
  ON claims (user_id, company_id);

CREATE INDEX IF NOT EXISTS idx_claims_status ON claims (status);
