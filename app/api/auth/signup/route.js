import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { hashPassword, createUserSession, getUserSessionCookie } from '@/lib/user-auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 });
    }

    const [user] = await db
      .insert(users)
      .values({ email, password_hash: hashPassword(password), full_name: fullName || null })
      .returning({ id: users.id, email: users.email, full_name: users.full_name });

    const token = await createUserSession(user.id);
    const response = NextResponse.json({ user });
    response.cookies.set(getUserSessionCookie(token));
    return response;
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
