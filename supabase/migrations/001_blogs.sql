-- =============================================================
-- FirmsLedger: blogs table (markdown content, Module 1)
-- Run in Supabase SQL Editor — Dashboard > SQL Editor
-- =============================================================

create table if not exists blogs (
  id               uuid primary key default gen_random_uuid(),
  title            text        not null,
  slug             text        not null unique,
  meta_description text        not null,
  content          text        not null,  -- full markdown body
  category         text        not null default 'General',
  tags             text[]      not null default '{}',
  target_country   text        not null default 'Australia',
  published_at     timestamptz,
  status           text        not null default 'draft'
                     check (status in ('draft', 'published')),
  topic_id         uuid references blog_topics(id) on delete set null,
  created_at       timestamptz not null default now()
);

-- fast slug + status lookups
create index if not exists blogs_slug_idx     on blogs(slug);
create index if not exists blogs_status_idx   on blogs(status, published_at desc);
create index if not exists blogs_topic_id_idx on blogs(topic_id);

-- Row Level Security
alter table blogs enable row level security;

create policy "Public can read published blogs"
  on blogs for select
  using (status = 'published');

create policy "Service role full access to blogs"
  on blogs for all
  using (auth.role() = 'service_role');
