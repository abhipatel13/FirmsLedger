-- =============================================================
-- FirmsLedger: submission_logs table (Module 3 — URL Submission)
-- =============================================================

create table if not exists submission_logs (
  id           uuid      primary key default gen_random_uuid(),
  url          text      not null,
  platform     text      not null,  -- 'google' | 'bing' | 'yandex' | 'pingomatic' | 'pingmyurl'
  status       text      not null,  -- 'success' | 'failed' | 'skipped'
  response     jsonb,               -- raw response body/status from the platform
  submitted_at timestamptz not null default now()
);

-- index for querying recent submissions per URL
create index if not exists submission_logs_url_idx  on submission_logs(url, submitted_at desc);
create index if not exists submission_logs_date_idx on submission_logs(submitted_at desc);

-- Row Level Security
alter table submission_logs enable row level security;

create policy "Service role full access to submission_logs"
  on submission_logs for all
  using (auth.role() = 'service_role');
