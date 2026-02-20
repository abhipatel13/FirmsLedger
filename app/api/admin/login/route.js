import { NextResponse } from 'next/server';
import { createAdminSession, getAdminSessionCookie } from '@/lib/admin-auth';

// Normalize env value: trim, strip \r, strip surrounding quotes (env loaders may keep them).
// Use double quotes in .env.local for passwords with $ e.g. ADMIN_PASSWORD="Abhi1234$1" so $1 isn't expanded.
function stripEnvValue(s) {
  if (s == null || typeof s !== 'string') return '';
  let v = s.replace(/\r/g, '').trim().split('\n')[0].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

function getAdminCreds() {
  const rawEmail = process.env.ADMIN_EMAIL;
  const rawPassword = process.env.ADMIN_PASSWORD;
  const email = stripEnvValue(rawEmail).toLowerCase().replace(/\s+/g, ' ').split('\n')[0].trim();
  const password = stripEnvValue(rawPassword);
  return { email, password };
}

// GET: check if admin is configured (for debugging login issues). Does not reveal secrets.
export async function GET() {
  const { email, password } = getAdminCreds();
  const configured = !!(email && password);
  return NextResponse.json({
    configured,
    hint: configured
      ? undefined
      : 'Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local, then restart the dev server.',
    passwordLength: configured ? password.length : 0, // so you can verify $ wasn't stripped (e.g. 10 for Abhi1234$1)
  });
}

export async function POST(request) {
  const { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } = getAdminCreds();

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: 'Admin login not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local' },
      { status: 501 }
    );
  }

  try {
    const body = await request.json();
    const email = (body.email || '').toLowerCase().trim();
    const password = typeof body.password === 'string' ? body.password.trim() : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      const dev = process.env.NODE_ENV === 'development';
      let debug;
      if (dev) {
        const emailOk = email === ADMIN_EMAIL;
        const passwordLen = ADMIN_PASSWORD.length;
        if (!emailOk) {
          debug = 'Email did not match. Check ADMIN_EMAIL in .env.local (exactly abhipatel8675@gmail.com).';
        } else if (passwordLen === 8 && password.length === 10) {
          debug = `Password length mismatch: server has 8 chars (likely $1 was stripped). In .env.local use: ADMIN_PASSWORD="Abhi1234$1" (with double quotes) and restart the dev server.`;
        } else {
          debug = `Server password length is ${passwordLen} (expected 10 for Abhi1234$1). Use ADMIN_PASSWORD="Abhi1234$1" in .env.local and restart.`;
        }
      }
      return NextResponse.json(
        { error: 'Invalid email or password', debug },
        { status: 401 }
      );
    }

    const token = createAdminSession(email);
    const response = NextResponse.json({ ok: true, email });
    response.cookies.set(getAdminSessionCookie(token));
    return response;
  } catch (err) {
    console.error('Admin login error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
