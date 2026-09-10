import { NextResponse } from 'next/server';
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
      })
      .from(users)
      .where(and(eq(users.email, email), eq(users.is_admin, true)))
      .limit(1);

    // One message for every failure: wrong password, no such account, and "that
    // account exists but is not an admin" must be indistinguishable, or this
    // endpoint becomes a way to enumerate which accounts have admin.
    // verifyPassword is scrypt, so a wrong password still costs real CPU —
    // that is what makes guessing slow.
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
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
