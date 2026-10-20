-- Persistent artist follows. Followers can manage their own relationships;
-- artists can read their follower rows, but no client can forge another user's follow.
create table if not exists public.artist_follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  artist_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, artist_id),
  constraint artist_follows_not_self check (follower_id <> artist_id)
);

create index if not exists artist_follows_artist_created_idx
  on public.artist_follows (artist_id, created_at desc);

alter table public.artist_follows enable row level security;

drop policy if exists artist_follows_read_participants on public.artist_follows;
create policy artist_follows_read_participants on public.artist_follows
  for select to authenticated
  using (
    follower_id = auth.uid()
    or artist_id = auth.uid()
  );

drop policy if exists artist_follows_insert_own_member on public.artist_follows;
create policy artist_follows_insert_own_member on public.artist_follows
  for insert to authenticated
  with check (
    follower_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = artist_id and p.kind = 'artist'
    )
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.kind in ('member','artist','writer','advertiser','cinema','job_poster','job_seeker','vendor','renter','brand')
    )
  );

drop policy if exists artist_follows_delete_own on public.artist_follows;
create policy artist_follows_delete_own on public.artist_follows
  for delete to authenticated
  using (follower_id = auth.uid());
