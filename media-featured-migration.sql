-- Featured Video support for the Media Library
alter table public.media_items
  add column if not exists featured boolean not null default false;

create unique index if not exists media_items_single_featured_video_idx
  on public.media_items (featured)
  where featured = true and type = 'video';
