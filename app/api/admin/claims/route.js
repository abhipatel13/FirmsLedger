import { NextResponse } from 'next/server';
import { and, desc, eq, ne } from 'drizzle-orm';
import { db } from '@/db/client';
import { claims, companies, users } from '@/db/schema';
import { getAdminFromCookie } from '@/lib/admin-auth';

const ACTIONS = { approve: 'approved', reject: 'rejected' };

export async function GET() {
  try {
    const adminEmail = await getAdminFromCookie();
    if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await db
      .select({
        id: claims.id,
        status: claims.status,
        verification: claims.verification,
        role: claims.role,
        contact_name: claims.contact_name,
        contact_email: claims.contact_email,
        phone: claims.phone,
        review_note: claims.review_note,
        reviewed_at: claims.reviewed_at,
        created_at: claims.created_at,
        company_name: companies.name,
        company_slug: companies.slug,
        company_website: companies.website,
        company_contact_email: companies.contact_email,
        account_email: users.email,
      })
      .from(claims)
      .innerJoin(companies, eq(claims.company_id, companies.id))
      .innerJoin(users, eq(claims.user_id, users.id))
      .orderBy(desc(claims.created_at))
      .limit(200);

    return NextResponse.json({ data: data ?? [] });
  } catch (err) {
    console.error('[admin/claims] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const adminEmail = await getAdminFromCookie();
    if (!adminEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, action, note } = await request.json().catch(() => ({}));
    const status = ACTIONS[action];
    if (!id || !status) {
      return NextResponse.json({ error: 'id and a valid action are required' }, { status: 400 });
    }

    const [claim] = await db
      .select({ id: claims.id, company_id: claims.company_id })
      .from(claims)
      .where(eq(claims.id, id))
      .limit(1);
    if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 });

    // Block a second owner before the DB has to. claims_one_approved_per_company
    // is still the real guarantee — this just gives a readable error.
    if (status === 'approved') {
      const [taken] = await db
        .select({ id: claims.id })
        .from(claims)
        .where(and(
          eq(claims.company_id, claim.company_id),
          eq(claims.status, 'approved'),
          ne(claims.id, claim.id),
        ))
        .limit(1);
      if (taken) {
        return NextResponse.json(
          { error: 'Another claim on this company is already approved.' },
          { status: 409 }
        );
      }
    }

    await db
      .update(claims)
      .set({
        status,
        review_note: typeof note === 'string' ? note.trim().slice(0, 500) || null : null,
        reviewed_at: new Date(),
      })
      .where(eq(claims.id, id));

    return NextResponse.json({ success: true, status });
  } catch (err) {
    // Unique-index violation: someone approved a competing claim concurrently.
    if (String(err?.message || '').includes('claims_one_approved_per_company')) {
      return NextResponse.json(
        { error: 'Another claim on this company was just approved.' },
        { status: 409 }
      );
    }
    console.error('[admin/claims] Review error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
