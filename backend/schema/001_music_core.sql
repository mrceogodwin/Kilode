-- Kilode dedicated backend — initial Music schema (Supabase/Postgres).
-- Apply only to a dedicated Kilode project after reviewing the deployment target.
-- Do not run against the legacy Kilode Nine/v2 database.

create extension if not exists pgcrypto;

create table if not exists public.music_tracks (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  title text not null check (length(trim(title)) between 1 and 200),
  artist_name text not null check (length(trim(artist_name)) between 1 and 200),
  album_name text,
  genre text,
  artwork_url text,
  audio_url text,
  duration_seconds integer check (duration_seconds is null or duration_seconds > 0),
  rights_status text not null default 'pending'
    check (rights_status in ('pending', 'verified', 'rejected', 'expired')),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists music_tracks_published_artist_idx
  on public.music_tracks (artist_name) where is_published = true and rights_status = 'verified';
create index if not exists music_tracks_published_genre_idx
  on public.music_tracks (genre) where is_published = true and rights_status = 'verified';

-- A chart period is a named window, not a hard-coded Top 50/100 array.
create table if not exists public.music_chart_entries (
  id uuid primary key default gen_random_uuid(),
  chart_key text not null check (chart_key in ('top_50', 'top_100')),
  period_start date not null,
  period_end date not null,
  rank integer not null check (rank > 0),
  track_id uuid not null references public.music_tracks(id) on delete cascade,
  source_name text not null check (length(trim(source_name)) > 0),
  source_url text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  check (period_end >= period_start),
  unique (chart_key, period_start, period_end, rank),
  unique (chart_key, period_start, period_end, track_id)
);

create index if not exists music_chart_public_lookup_idx
  on public.music_chart_entries (chart_key, period_start desc, rank)
  where verified_at is not null;

create table if not exists public.music_saved_tracks (
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id uuid not null references public.music_tracks(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, track_id)
);

create table if not exists public.music_listening_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id uuid not null references public.music_tracks(id) on delete cascade,
  played_at timestamptz not null default now()
);

create index if not exists music_history_user_played_idx
  on public.music_listening_history (user_id, played_at desc);

create table if not exists public.music_playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 48),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.music_playlist_tracks (
  playlist_id uuid not null references public.music_playlists(id) on delete cascade,
  track_id uuid not null references public.music_tracks(id) on delete cascade,
  position integer not null check (position >= 0),
  added_at timestamptz not null default now(),
  primary key (playlist_id, track_id),
  unique (playlist_id, position)
);

-- RLS is required even when requests go through the API. The API service role
-- must remain server-side; user access should use JWT-scoped clients.
alter table public.music_tracks enable row level security;
alter table public.music_chart_entries enable row level security;
alter table public.music_saved_tracks enable row level security;
alter table public.music_listening_history enable row level security;
alter table public.music_playlists enable row level security;
alter table public.music_playlist_tracks enable row level security;

drop policy if exists "Public can read verified published tracks" on public.music_tracks;
create policy "Public can read verified published tracks"
  on public.music_tracks for select
  using (is_published = true and rights_status = 'verified');

drop policy if exists "Public can read verified chart entries" on public.music_chart_entries;
create policy "Public can read verified chart entries"
  on public.music_chart_entries for select
  using (
    verified_at is not null
    and exists (
      select 1 from public.music_tracks t
      where t.id = track_id and t.is_published = true and t.rights_status = 'verified'
    )
  );

drop policy if exists "Users manage own saved tracks" on public.music_saved_tracks;
create policy "Users manage own saved tracks"
  on public.music_saved_tracks for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.music_tracks t
      where t.id = track_id and t.is_published = true and t.rights_status = 'verified'
    )
  );

drop policy if exists "Users manage own listening history" on public.music_listening_history;
create policy "Users manage own listening history"
  on public.music_listening_history for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.music_tracks t
      where t.id = track_id and t.is_published = true and t.rights_status = 'verified'
    )
  );

drop policy if exists "Users manage own playlists" on public.music_playlists;
create policy "Users manage own playlists"
  on public.music_playlists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage tracks in own playlists" on public.music_playlist_tracks;
create policy "Users manage tracks in own playlists"
  on public.music_playlist_tracks for all
  using (
    exists (select 1 from public.music_playlists p where p.id = playlist_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.music_playlists p where p.id = playlist_id and p.user_id = auth.uid())
    and exists (
      select 1 from public.music_tracks t
      where t.id = track_id and t.is_published = true and t.rights_status = 'verified'
    )
  );

-- Intentionally no INSERT/UPDATE/DELETE policy for public catalogue/chart rows.
-- Ingestion/admin workflows must be authenticated and audited separately.
