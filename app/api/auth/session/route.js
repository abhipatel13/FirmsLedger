import { NextResponse } from 'next/server';
import { getUserFromCookie } from '@/lib/user-auth';

export async function GET() {
  const user = await getUserFromCookie();
  return NextResponse.json({ user: user || null });
}
