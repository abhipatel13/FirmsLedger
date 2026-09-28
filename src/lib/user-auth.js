/**
 * Server-side only. Public user account sessions (users/sessions tables via Drizzle).
 * Cookie: fl_session = raw session token (opaque, random). Only its SHA-256 hash
 * is stored in the DB, so a leaked DB row can't be replayed as a cookie.
 */
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users, sessions } from '@/db/schema';

const COOKIE_NAME = 'fl_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = (stored || '').split(':');
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64).toString('hex');
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(candidate, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createUserSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);
  await db.insert(sessions).values({
    user_id: userId,
    token_hash: hashToken(token),
    expires_at: expiresAt,
  });
  return token;
}

export async function getUserFromToken(token) {
  if (!token) return null;
  const rows = await db
    .select({ user: users, session: sessions })
    .from(sessions)
    .innerJoin(users, eq(sessions.user_id, users.id))
    .where(eq(sessions.token_hash, hashToken(token)))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  if (row.session.expires_at < new Date()) return null;
  const { password_hash, ...user } = row.user;
  return user;
}

export async function deleteUserSession(token) {
  if (!token) return;
  await db.delete(sessions).where(eq(sessions.token_hash, hashToken(token)));
}

export async function getUserFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return getUserFromToken(token);
}

export function getUserSessionCookie(token) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  };
}

export function clearUserSessionCookie() {
  return {
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  };
}

export { COOKIE_NAME };
