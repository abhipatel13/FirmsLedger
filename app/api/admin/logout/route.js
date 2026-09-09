import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  deleteUserSession, clearUserSessionCookie, COOKIE_NAME,
} from '@/lib/user-auth';

/**
 * Admin logout. Deletes the session ROW, not just the cookie — the previous
 * version only dropped the cookie, which left the session valid for anyone who
 * had captured it.
 */
export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  await deleteUserSession(token);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(clearUserSessionCookie());
  // The old scheme's cookie, in case a browser still holds one.
  response.cookies.delete('admin_session');
  return response;
}
