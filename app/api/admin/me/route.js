import { NextResponse } from 'next/server';
import { getAdminFromCookie } from '@/lib/admin-auth';

export async function GET() {
  try {
    const email = await getAdminFromCookie();
    if (!email) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }
    return NextResponse.json({ ok: true, email });
  } catch {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }
}
