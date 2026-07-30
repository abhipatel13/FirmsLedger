import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { listing_requests } from '@/db/schema';

const WEB3FORMS_KEY = process.env.WEB3FORMS_ACCESS_KEY || process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

/**
 * POST /api/listing
 * Submit a "List Your Company" request — saves to listing_requests table
 * and sends a notification email via Web3Forms.
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

    // Send notification email via Web3Forms
    if (WEB3FORMS_KEY) {
      const location = [hq_city, hq_state].filter(Boolean).join(', ') || '—';
      try {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject: `New Listing Request: ${company_name.slice(0, 60)}`,
            from_name: 'FirmsLedger Listings',
            company: company_name,
            email: contact_email,
            phone: contact_phone || '—',
            website: website || '—',
            location,
            category: category_slug || '—',
            message: description || '—',
          }),
        });
      } catch (err) {
        console.error('Listing notify email failed:', err);
      }
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
