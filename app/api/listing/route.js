import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { listing_requests } from '@/db/schema';

/**
 * POST /api/listing
 * Submit a "List Your Company" request — saves to listing_requests table.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const company_name = (body.company_name || body.name || '').trim();
    const contact_email = (body.email || body.contact_email || '').trim();
    const contact_phone = (body.phone || body.contact_phone || '').trim() || null;
    const website = (body.website || '').trim() || null;
    const hq_state = (body.hq_state || '').trim() || null;
    const hq_city = (body.hq_city || '').trim() || null;
    const category_slug = (body.category_slug || '').trim() || null;
    const description = (body.description || body.message || '').trim() || null;

    if (!company_name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }
    if (!contact_email) {
      return NextResponse.json({ error: 'Contact email is required' }, { status: 400 });
    }

    const [row] = await db.insert(listing_requests).values({
      company_name,
      contact_email,
      contact_phone,
      website,
      hq_state,
      hq_city,
      category_slug,
      description,
      status: 'pending',
    }).returning();

    return NextResponse.json({ id: row.id, success: true });
  } catch (err) {
    console.error('Listing API error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
