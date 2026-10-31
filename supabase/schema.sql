-- ARC Field Manual — Supabase schema.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run.

-- Contribution requests sent from /contribute
create table if not exists public.requests (
  id             text primary key,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  kind           text not null check (kind in ('new_item', 'correction', 'report')),
  status         text not null default 'new' check (status in ('new', 'in_review', 'accepted', 'done', 'rejected')),
  item_id        text,
  item_name      text,
  field          text,
  current_value  text,
  proposed_value text,
  details        text not null,
  source_url     text,
  contact        text,
  admin_notes    text,
  history        jsonb not null default '[]'::jsonb
);
create index if not exists requests_created_at_idx on public.requests (created_at desc);

-- Editor changes to items. One row per item:
--   is_new = false → `data` is a partial patch applied over the imported dataset item
--   is_new = true  → `data` is a complete item that does not exist in the dataset
create table if not exists public.item_edits (
  item_id    text primary key,
  is_new     boolean not null default false,
  data       jsonb not null,
  note       text,
  updated_at timestamptz not null default now()
);

-- Lock both tables down: Row Level Security on with no policies means the public
-- (anon) key can read or write nothing. The site's server uses the secret/service-role key.
alter table public.requests enable row level security;
alter table public.item_edits enable row level security;

-- Public bucket for item images uploaded from the back office (read-only for the public).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('item-images', 'item-images', true, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
