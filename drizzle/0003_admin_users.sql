-- Move admin auth into the database.
--
-- Before this, ADMIN_EMAIL/ADMIN_PASSWORD were plaintext env vars AND
-- ADMIN_PASSWORD doubled as the HMAC key for the admin session cookie, so
-- knowing that one string let anyone forge an admin session without logging in.
-- Admin now uses the same scrypt hash + hashed-session-token machinery as
-- public accounts, gated on this flag.
--
-- ADDITIVE. One ADD COLUMN with a default, no data rewritten, no DROP.

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Only ever a handful of admins, so a partial index keeps it tiny.
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users (is_admin) WHERE is_admin = true;
