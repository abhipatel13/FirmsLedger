import { createClient } from '@supabase/supabase-js';

const url = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : '';
const anonKey = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : '';

export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export const hasSupabase = () => !!supabase;
