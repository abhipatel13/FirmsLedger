/**
 * Server-side only. Admin access control.
 *
 * REPLACED 2026-09-09. The previous scheme kept the admin password in
 * ADMIN_PASSWORD as plaintext and ALSO used that same string as the HMAC key
 * for the admin_session cookie:
 *
 *     admin_session = base64url({email, exp}) + '.' + HMAC(payload, ADMIN_PASSWORD)
 *
 * So anyone who learned the password could mint a valid admin cookie and skip
 * the login form entirely — no rate limit, nothing to brute force. The literal
 * password was also hardcoded in four debug strings in
 * app/api/admin/login/route.js.
 *
 * Admin is now a flag on a real account: `users.is_admin`. Credentials are
 * scrypt hashes in the database, sessions are random tokens stored only as
 * SHA-256 hashes, and admin status is re-read from the database on every
 * request. There is no shared secret left to leak.
 */
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { getUserFromCookie } from '@/lib/user-auth';

/**
 * The signed-in admin's email, or null.
 *
 * Deliberately re-reads `is_admin` from the database rather than trusting
 * anything in the cookie, so revoking admin takes effect on the next request
 * instead of when the session happens to expire.
 */
export async function getAdminFromCookie() {
  const user = await getUserFromCookie();
  if (!user) return null;

  const [row] = await db
    .select({ is_admin: users.is_admin })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  return row?.is_admin ? user.email : null;
}

/** Same check, but returns the whole user. */
export async function getAdminUser() {
  const user = await getUserFromCookie();
  if (!user) return null;
  const [row] = await db
    .select({ is_admin: users.is_admin })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  return row?.is_admin ? user : null;
}
