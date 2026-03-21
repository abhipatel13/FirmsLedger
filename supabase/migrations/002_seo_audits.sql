-- =============================================================
-- FirmsLedger: seo_audits table (Module 2 — Daily SEO Audit)
-- =============================================================

create table if not exists seo_audits (
  id         uuid      primary key default gen_random_uuid(),
  page_url   text      not null,
  checks     jsonb     not null default '{}',  -- map of check_name -> { passed, value, detail }
  score      numeric   not null default 0 check (score >= 0 and score <= 100),
  issues     jsonb     not null default '[]',  -- array of { check, message, severity }
  audited_at timestamptz not null default now()
);

-- index for dashboard queries
create index if not exists seo_audits_page_url_idx   on seo_audits(page_url, audited_at desc);
create index if not exists seo_audits_audited_at_idx on seo_audits(audited_at desc);
create index if not exists seo_audits_score_idx      on seo_audits(score);

-- Row Level Security
alter table seo_audits enable row level security;

-- only service role can read/write audit data (admin-only)
create policy "Service role full access to seo_audits"
  on seo_audits for all
  using (auth.role() = 'service_role');
