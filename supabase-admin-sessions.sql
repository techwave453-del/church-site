-- Persistent Express admin sessions for Render/Supabase.
-- Run once in the Supabase SQL Editor.
create table if not exists public.admin_sessions (
  sid text primary key,
  sess jsonb not null,
  expire timestamptz not null
);

create index if not exists admin_sessions_expire_idx
  on public.admin_sessions (expire);

-- This table is accessed by the server with the Supabase service-role key.
-- Keep client access disabled; do not expose it through the browser.
alter table public.admin_sessions enable row level security;

-- Remove expired sessions automatically when this SQL is run manually.
delete from public.admin_sessions
where expire <= now();
