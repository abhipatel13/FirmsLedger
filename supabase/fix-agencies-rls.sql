-- Fix: "new row violates row-level security policy for table agencies"
-- Run this in Supabase Dashboard → SQL Editor → New query
-- This ensures anyone (e.g. List your company / Join form) can INSERT into agencies.

-- Remove existing policy if it exists (in case it was created with different rules)
DROP POLICY IF EXISTS "Anyone can submit a listing request" ON agencies;

-- Allow anonymous inserts so the public form and join page can create listing requests
CREATE POLICY "Anyone can submit a listing request" ON agencies FOR INSERT WITH CHECK (true);
