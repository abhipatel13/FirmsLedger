import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import {
  verifyPassword, createUserSession, getUserSessionCookie,
} from '@/lib/user-auth';

/**
 * Admin login, backed by the database.
 *
 * REWRITTEN 2026-09-09. The previous version compared against plaintext
 * ADMIN_EMAIL/ADMIN_PASSWORD env vars, and ADMIN_PASSWORD was also the HMAC key
 * for the session cookie — so the password alone was enough to forge an admin
 * session without ever calling this route. Worse, the literal password and
 * email were hardcoded in four debug strings in this file.
 *
 * Admin is now `users.is_admin` on a real account: scrypt-hashed password,
 * random session token stored only as a SHA-256 hash. Nothing here reads a
 * secret from the environment.
 */

/** Diagnostic: is any admin account set up? Reveals no credentials. */
export async function GET() {
  try {
    const rows = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.is_admin, true))
      .limit(1);
    const configured = rows.length > 0;
    return NextResponse.json({
      configured,
      hint: configured
        ? undefined
        : 'No account has is_admin = true. Run drizzle/0003_admin_users.sql and flag an account.',
    });
  } catch (err) {
    console.error('Admin config check failed:', err);
    return NextResponse.json({ configured: false, hint: 'Database unreachable.' }, { status: 500 });
  }
}

// After MAX_ATTEMPTS consecutive failures the account is refused for
// LOCKOUT_MS without the password even being checked. An attacker can use this
// to lock the admin out deliberately, so the window is short and self-clearing:
// a 15-minute wait is a far smaller problem than unlimited guessing.
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

// A real scrypt hash of a value nobody knows, verified when the email matches no
// admin account. Without it, "no such admin" returns in ~1ms while a wrong
// password takes the full scrypt cost, and that timing difference tells an
// attacker which emails have admin — the exact thing the shared error message
// exists to hide.
const DECOY_HASH = (() => {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${crypto.scryptSync(crypto.randomBytes(32).toString('hex'), salt, 64).toString('hex')}`;
})();

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        password_hash: users.password_hash,
        is_admin: users.is_admin,
        failed_login_attempts: users.failed_login_attempts,
        locked_until: users.locked_until,
      })
      .from(users)
      .where(and(eq(users.email, email), eq(users.is_admin, true)))
      .limit(1);

    // One message for every failure: wrong password, no such account, "that
    // account exists but is not an admin", and "locked out" must all be
    // indistinguishable, or this endpoint becomes a way to enumerate which
    // accounts have admin — or to confirm one by tripping its lockout.
    const INVALID = NextResponse.json(
      { error: 'Invalid email or password.' },
      { status: 401 },
    );

    if (!user) {
      // Burn the same scrypt cost a real account would, so the response time
      // does not reveal whether this email has admin.
      verifyPassword(password, DECOY_HASH);
      return INVALID;
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      // Refuse before hashing. This is also what makes the lockout worth having:
      // once tripped, further guesses cost the server nothing.
      return INVALID;
    }

    if (!verifyPassword(password, user.password_hash)) {
      const attempts = (user.failed_login_attempts || 0) + 1;
      const locked = attempts >= MAX_ATTEMPTS;
      await db
        .update(users)
        .set({
          // Reset the counter when locking, so the next lockout needs another
          // full MAX_ATTEMPTS rather than tripping on the first later attempt.
          failed_login_attempts: locked ? 0 : attempts,
          locked_until: locked ? new Date(Date.now() + LOCKOUT_MS) : user.locked_until,
        })
        .where(eq(users.id, user.id));
      return INVALID;
    }

    // Successful login clears the throttle.
    if (user.failed_login_attempts > 0 || user.locked_until) {
      await db
        .update(users)
        .set({ failed_login_attempts: 0, locked_until: null })
        .where(eq(users.id, user.id));
    }

    const token = await createUserSession(user.id);
    const response = NextResponse.json({ ok: true, email: user.email });
    response.cookies.set(getUserSessionCookie(token));
    return response;
  } catch (err) {
    console.error('Admin login error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
