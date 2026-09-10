-- Brute-force throttle for the admin login.
--
-- Nothing rate-limited /api/admin/login before this: an attacker who knew the
-- admin email could guess passwords indefinitely. scrypt made each attempt cost
-- real CPU, which slows guessing, but never stops it — and the signup password
-- minimum is only 8 characters, so the two weaknesses compounded.
--
-- Counted on the account rather than the caller's IP: IPs rotate freely behind
-- proxies and VPNs, and this is a single-admin site, so the account is the thing
-- worth protecting. The trade-off is that an attacker can deliberately lock the
-- admin out; the window is kept short (15 minutes) so that is an annoyance
-- rather than a lockout, and it clears itself.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS failed_login_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until timestamptz;
