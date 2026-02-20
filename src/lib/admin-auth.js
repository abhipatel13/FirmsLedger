/**
 * Server-side only. Admin session cookie helpers.
 * Cookie: admin_session = base64url(payload) + '.' + HMAC(payload, ADMIN_PASSWORD)
 */
import { cookies } from 'next/headers';
import crypto from 'crypto';

const COOKIE_NAME = 'admin_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error('ADMIN_PASSWORD not set');
  return secret;
}

function encodePayload(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

function decodePayload(str) {
  try {
    return JSON.parse(Buffer.from(str, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function sign(payloadStr) {
  return crypto.createHmac('sha256', getSecret()).update(payloadStr).digest('hex');
}

export function createAdminSession(email) {
  const exp = Date.now() + MAX_AGE * 1000;
  const payload = encodePayload({ email, exp });
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function verifyAdminSession(token) {
  if (!token || typeof token !== 'string') return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  if (sign(payload) !== sig) return null;
  const data = decodePayload(payload);
  if (!data || !data.email || data.exp < Date.now()) return null;
  return data.email;
}

export async function getAdminFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifyAdminSession(token) || null;
}

export function getAdminSessionCookie(token) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  };
}

export function clearAdminSessionCookie() {
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
