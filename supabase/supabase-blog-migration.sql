-- =============================================================
-- FirmsLedger: AI Blog Automation — Supabase Migration
-- Run this in your Supabase SQL editor (Dashboard > SQL Editor)
-- =============================================================

-- ---------------------------------------------------------------
-- 1. blog_topics: queue of prompts to turn into articles
-- ---------------------------------------------------------------
create table if not exists blog_topics (
  id          uuid primary key default gen_random_uuid(),
  prompt      text not null,                  -- e.g. "Top CNC manufacturers in Texas 2026"
  status      text not null default 'pending', -- pending | processing | done | failed
  slug        text,                            -- filled in after generation
  error       text,                            -- filled in on failure
  created_at  timestamptz not null default now(),
  processed_at timestamptz
);

-- ---------------------------------------------------------------
-- 2. blog_posts: AI-generated articles (JSON content + metadata)
-- ---------------------------------------------------------------
create table if not exists blog_posts (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  meta_description text not null,
  image_url        text,
  image_alt        text,
  category         text not null default 'Manufacturing',
  read_time        text not null default '10 min read',
  content          jsonb not null,             -- full structured article JSON
  published        boolean not null default true,
  indexed_at       timestamptz,               -- when Google indexing was pinged
  topic_id         uuid references blog_topics(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- auto-update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger blog_posts_updated_at
  before update on blog_posts
  for each row execute function update_updated_at_column();

-- index for fast slug lookups
create index if not exists blog_posts_slug_idx on blog_posts(slug);
create index if not exists blog_posts_published_idx on blog_posts(published, created_at desc);

-- ---------------------------------------------------------------
-- 3. Enable Row Level Security (RLS) — public read, service-role write
-- ---------------------------------------------------------------
alter table blog_posts  enable row level security;
alter table blog_topics enable row level security;

-- Allow anyone to read published posts (for SSR)
create policy "Public read published posts"
  on blog_posts for select
  using (published = true);

-- Allow service role to do everything (used by API routes)
create policy "Service role full access to blog_posts"
  on blog_posts for all
  using (auth.role() = 'service_role');

create policy "Service role full access to blog_topics"
  on blog_topics for all
  using (auth.role() = 'service_role');
