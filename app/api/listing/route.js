import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function slugify(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

/**
 * POST /api/listing
 * Submit a listing request (List your company / Join form).
 * Uses service role so the insert bypasses RLS and always succeeds.
 */
export async function POST(request) {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Server not configured (Supabase service role required for listing submission)' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const name = body.company_name || body.name || '';
    const slug = body.slug || slugify(name) || 'listing';
    const description = body.message || body.description || '';
    const website = body.website || null;
    const contact_email = body.email || null;
    const hq_city = body.hq_city || null;
    const hq_state = body.hq_state || null;
    const hq_country = body.hq_country || 'India';
    const team_size = body.team_size || null;
    const categoryIds = Array.isArray(body.category_ids) ? body.category_ids : [];
    const inviteId = body.invite_id || null;

    if (!name.trim()) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    let baseSlug = (slug.trim() || slugify(name) || 'listing').slice(0, 200);
    const { data: existing } = await supabase.from('agencies').select('id').eq('slug', baseSlug).maybeSingle();
    const finalSlug = existing ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

    const agencyRow = {
      name: name.trim(),
      slug: finalSlug,
      description: description.trim() || null,
      website: website?.trim() || null,
      contact_email: contact_email?.trim() || null,
      hq_city: hq_city?.trim() || null,
      hq_state: hq_state?.trim() || null,
      hq_country: (hq_country || 'India').trim(),
      team_size: team_size?.trim() || null,
      approved: false,
    };

    const { data: agency, error: insertError } = await supabase
      .from('agencies')
      .insert(agencyRow)
      .select('id, name, slug, created_at')
      .single();

    if (insertError) {
      console.error('Listing insert error:', insertError);
      return NextResponse.json({ error: insertError.message || 'Failed to create listing' }, { status: 500 });
    }

    for (const categoryId of categoryIds) {
      if (categoryId) {
        await supabase.from('agency_categories').insert({ agency_id: agency.id, category_id: categoryId });
      }
    }

    if (inviteId) {
      await supabase
        .from('company_invites')
        .update({ used_at: new Date().toISOString(), agency_id: agency.id })
        .eq('id', inviteId);
    }

    return NextResponse.json({ id: agency.id, ...agency });
  } catch (err) {
    console.error('Listing API error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
