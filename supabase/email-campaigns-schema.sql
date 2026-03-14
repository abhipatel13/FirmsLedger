-- FirmsLedger – Email Campaigns schema
-- Run in Supabase Dashboard → SQL Editor → New query

-- Bulk email campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  subject         TEXT NOT NULL,
  body_html       TEXT NOT NULL,
  audience        TEXT DEFAULT 'all_with_email',
  -- 'all_with_email' | 'approved' | 'pending' | 'custom'
  custom_emails   TEXT[] DEFAULT '{}',
  status          TEXT DEFAULT 'draft',
  -- 'draft' | 'sending' | 'sent' | 'failed'
  total_recipients INT DEFAULT 0,
  sent_count       INT DEFAULT 0,
  delivered_count  INT DEFAULT 0,
  opened_count     INT DEFAULT 0,
  clicked_count    INT DEFAULT 0,
  bounced_count    INT DEFAULT 0,
  failed_count     INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  sent_at         TIMESTAMPTZ
);

-- Per-recipient email log (one row per email sent)
CREATE TABLE IF NOT EXISTS email_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  agency_id       UUID REFERENCES agencies(id),
  agency_name     TEXT,
  resend_id       TEXT UNIQUE,
  -- status: sent | delivered | opened | clicked | bounced | failed
  status          TEXT DEFAULT 'sent',
  opened_at       TIMESTAMPTZ,
  clicked_at      TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  bounced_at      TIMESTAMPTZ,
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_campaign   ON email_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_resend_id  ON email_logs(resend_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);

-- RLS (service role manages these; no public access needed)
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs      ENABLE ROW LEVEL SECURITY;
-- No policies = only service_role key can access (which is correct for admin-only data)
