import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminFromCookie } from '@/lib/admin-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function db() {
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

function slugify(text) {
  return String(text).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

async function requireAdmin() {
  const admin = await getAdminFromCookie();
  if (!admin) return null;
  if (!supabaseUrl || !serviceRoleKey) return null;
  return admin;
}

// GET /api/admin/agencies — list all agencies
export async function GET() {
  try {
    if (!await requireAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { data, error } = await db()
      .from('agencies')
      .select('id, name, slug, contact_email, website, hq_city, hq_country, approved, verified, featured, avg_rating, review_count, created_at')
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (err) {
    console.error('GET /api/admin/agencies error:', err);
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 });
  }
}

// POST /api/admin/agencies — create a new agency
export async function POST(request) {
  try {
    if (!await requireAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const {
      name, contact_email, phone, website, logo_url,
      tagline, description, address,
      hq_city, hq_state, hq_country, team_size, founded_year,
      hourly_rate, pricing_model, min_project_size, remote_support,
      industries_served, approved, verified, featured,
      linkedin_url, twitter_url, facebook_url, instagram_url,
      service_focus, industry_focus, client_focus,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Agency name is required' }, { status: 400 });
    }

    const slug = slugify(name);

    const row = {
      name: name.trim(),
      slug,
      contact_email: contact_email?.trim() || null,
      phone: phone?.trim() || null,
      website: website?.trim() || null,
      logo_url: logo_url?.trim() || null,
      tagline: tagline?.trim() || null,
      description: description?.trim() || null,
      address: address?.trim() || null,
      hq_city: hq_city?.trim() || null,
      hq_state: hq_state?.trim() || null,
      hq_country: hq_country?.trim() || null,
      team_size: team_size?.trim() || null,
      founded_year: founded_year ? parseInt(founded_year, 10) : null,
      hourly_rate: hourly_rate?.trim() || null,
      pricing_model: pricing_model?.trim() || null,
      min_project_size: min_project_size?.trim() || null,
      remote_support: remote_support === true || remote_support === 'true',
      industries_served: Array.isArray(industries_served) ? industries_served.filter(Boolean) : [],
      approved: approved === true || approved === 'true',
      verified: verified === true || verified === 'true',
      featured: featured === true || featured === 'true',
      linkedin_url: linkedin_url?.trim() || null,
      twitter_url: twitter_url?.trim() || null,
      facebook_url: facebook_url?.trim() || null,
      instagram_url: instagram_url?.trim() || null,
      service_focus: Array.isArray(service_focus) ? service_focus : [],
      industry_focus: Array.isArray(industry_focus) ? industry_focus : [],
      client_focus: (client_focus && typeof client_focus === 'object' && !Array.isArray(client_focus)) ? client_focus : {},
    };

    const { data, error } = await db().from('agencies').insert(row).select('*').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Create agency error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// PUT /api/admin/agencies — full agency update
export async function PUT(request) {
  try {
    if (!await requireAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { id, ...fields } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const {
      name, contact_email, phone, website, logo_url,
      tagline, description, address,
      hq_city, hq_state, hq_country, team_size, founded_year,
      hourly_rate, pricing_model, min_project_size, remote_support,
      industries_served, approved, verified, featured,
      linkedin_url, twitter_url, facebook_url, instagram_url,
      service_focus, industry_focus, client_focus,
    } = fields;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Agency name is required' }, { status: 400 });
    }

    const updates = {
      name: name.trim(),
      slug: slugify(name),
      contact_email: contact_email?.trim() || null,
      phone: phone?.trim() || null,
      website: website?.trim() || null,
      logo_url: logo_url?.trim() || null,
      tagline: tagline?.trim() || null,
      description: description?.trim() || null,
      address: address?.trim() || null,
      hq_city: hq_city?.trim() || null,
      hq_state: hq_state?.trim() || null,
      hq_country: hq_country?.trim() || null,
      team_size: team_size?.trim() || null,
      founded_year: founded_year ? parseInt(founded_year, 10) : null,
      hourly_rate: hourly_rate?.trim() || null,
      pricing_model: pricing_model?.trim() || null,
      min_project_size: min_project_size?.trim() || null,
      remote_support: remote_support === true || remote_support === 'true',
      industries_served: Array.isArray(industries_served) ? industries_served.filter(Boolean) : [],
      approved: approved === true || approved === 'true',
      verified: verified === true || verified === 'true',
      featured: featured === true || featured === 'true',
      linkedin_url: linkedin_url?.trim() || null,
      twitter_url: twitter_url?.trim() || null,
      facebook_url: facebook_url?.trim() || null,
      instagram_url: instagram_url?.trim() || null,
      service_focus: Array.isArray(service_focus) ? service_focus : [],
      industry_focus: Array.isArray(industry_focus) ? industry_focus : [],
      client_focus: (client_focus && typeof client_focus === 'object' && !Array.isArray(client_focus)) ? client_focus : {},
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await db()
      .from('agencies')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    console.error('PUT /api/admin/agencies error:', err);
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 });
  }
}

// PATCH /api/admin/agencies — update a field (approve/verify/feature/delete)
export async function PATCH(request) {
  try {
    if (!await requireAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id, action, ...fields } = await request.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    if (action === 'delete') {
      const { error } = await db().from('agencies').delete().eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    // toggle or set fields: approved, verified, featured
    const allowed = ['approved', 'verified', 'featured'];
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([k]) => allowed.includes(k))
    );
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const { data, error } = await db()
      .from('agencies')
      .update(updates)
      .eq('id', id)
      .select('id, name, approved, verified, featured')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
