import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminFromCookie } from '@/lib/admin-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET() {
  const adminEmail = await getAdminFromCookie();
  if (!adminEmail) {
    return NextResponse.json({ error: 'Admin login required' }, { status: 401 });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Admin API requires SUPABASE_SERVICE_ROLE_KEY in .env.local' },
      { status: 501 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from('agencies')
      .select('id, name, slug, contact_email, approved, created_at, hq_city, hq_country')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Admin agencies error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error('Admin agencies error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
