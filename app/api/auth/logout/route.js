import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteUserSession, clearUserSessionCookie, COOKIE_NAME } from '@/lib/user-auth';

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  await deleteUserSession(token);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(clearUserSessionCookie());
  return response;
}
