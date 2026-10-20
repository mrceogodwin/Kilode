-- Kilode Music platform foundation — apply only to the dedicated native Supabase project.
-- Payment confirmation and campaign activation must happen in a trusted Edge Function/webhook.
-- Never mark a payment successful from the client.

create table if not exists public.music_releases (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  release_type text not null default 'single' check (release_type in ('single','ep','album')),
  cover_url text,
  release_date date,
  status text not null default 'draft' check (status in ('draft','submitted','published','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tracks
  add column if not exists release_id uuid references public.music_releases(id) on delete set null,
  add column if not exists genre text,
  add column if not exists duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  add column if not exists price_minor integer check (price_minor is null or price_minor >= 0),
  add column if not exists currency text not null default 'NGN',
  add column if not exists status text not null default 'published'
    check (status in ('draft','processing','submitted','published','rejected')),
  add column if not exists updated_at timestamptz not null default now();

-- The canonical catalogue contains published tracks only for ordinary listeners.
-- Artists can read and manage their own drafts/submissions.
alter table public.music_releases enable row level security;
create policy music_releases_public_published_select on public.music_releases
  for select using (status = 'published' or artist_id = auth.uid());
create policy music_releases_artist_insert on public.music_releases
  for insert with check (
    artist_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.kind = 'artist')
  );
create policy music_releases_artist_update on public.music_releases
  for update using (artist_id = auth.uid())
  with check (
    artist_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.kind = 'artist')
  );

-- Replace the earlier broad catalogue read policy with a published-or-owner rule.
drop policy if exists tracks_select on public.tracks;
create policy tracks_published_or_owner_select on public.tracks
  for select using (status = 'published' or artist_id = auth.uid());
create policy tracks_artist_insert on public.tracks
  for insert with check (
    artist_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.kind = 'artist')
  );
create policy tracks_artist_update on public.tracks
  for update using (artist_id = auth.uid())
  with check (
    artist_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.kind = 'artist')
  );

create table if not exists public.music_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete cascade,
  payment_id uuid,
  entitlement_type text not null check (entitlement_type in ('purchase','subscription','promo')),
  created_at timestamptz not null default now(),
  unique (user_id, track_id, entitlement_type)
);
alter table public.music_entitlements enable row level security;
create policy music_entitlements_read_own on public.music_entitlements
  for select using (user_id = auth.uid());
-- No client insert/update/delete policies: trusted payment verification grants entitlements.

create table if not exists public.music_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  track_id uuid references public.tracks(id) on delete set null,
  release_id uuid references public.music_releases(id) on delete set null,
  purpose text not null check (purpose in ('track_purchase','release_purchase','subscription','push_link_campaign')),
  provider text not null,
  provider_reference text unique,
  amount_minor integer not null check (amount_minor > 0),
  currency text not null default 'NGN',
  status text not null default 'pending' check (status in ('pending','processing','succeeded','failed','refunded','cancelled')),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  check ((track_id is not null)::integer + (release_id is not null)::integer <= 1)
);
alter table public.music_payments enable row level security;
create policy music_payments_read_own on public.music_payments
  for select using (user_id = auth.uid());
create policy music_payments_insert_pending_own on public.music_payments
  for insert with check (user_id = auth.uid() and status = 'pending' and verified_at is null);
-- Payment status and provider references must be changed only by a trusted server/webhook.

create table if not exists public.push_link_campaigns (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.profiles(id) on delete cascade,
  track_id uuid references public.tracks(id) on delete set null,
  release_id uuid references public.music_releases(id) on delete set null,
  title text not null check (char_length(trim(title)) between 1 and 120),
  goal text not null check (goal in ('streams','reach','engagement','followers','pre_saves')),
  audience jsonb not null default '{}'::jsonb,
  placements text[] not null default array['music']::text[],
  budget_minor integer not null check (budget_minor > 0),
  currency text not null default 'NGN',
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'draft' check (status in ('draft','pending_payment','scheduled','active','paused','completed','rejected')),
  payment_id uuid references public.music_payments(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);
alter table public.push_link_campaigns enable row level security;
create policy push_link_campaigns_read_own on public.push_link_campaigns
  for select using (artist_id = auth.uid());
create policy push_link_campaigns_insert_own on public.push_link_campaigns
  for insert with check (
    artist_id = auth.uid()
    and status = 'draft'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.kind = 'artist')
  );
create policy push_link_campaigns_update_own_draft on public.push_link_campaigns
  for update using (artist_id = auth.uid() and status in ('draft','paused'))
  with check (artist_id = auth.uid() and status in ('draft','paused'));
-- Activation, spend, delivery and performance metrics are server-managed.

create table if not exists public.music_play_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  track_id uuid not null references public.tracks(id) on delete cascade,
  played_at timestamptz not null default now(),
  qualified_listen_seconds integer not null default 0 check (qualified_listen_seconds >= 0),
  source text not null default 'music' check (source in ('music','home','push_link','artist_profile','release')),
  session_id uuid
);
alter table public.music_play_events enable row level security;
create policy music_play_events_insert_self_or_anon on public.music_play_events
  for insert with check (user_id is null or user_id = auth.uid());
create policy music_play_events_read_own on public.music_play_events
  for select using (user_id = auth.uid());

-- Private audio storage. Store objects under <auth.uid()>/<release-id>/<filename>.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('kilode-music-audio', 'kilode-music-audio', false, 104857600,
        array['audio/mpeg','audio/mp4','audio/aac','audio/wav','audio/x-wav','audio/flac','audio/ogg'])
on conflict (id) do nothing;

create policy music_audio_owner_upload on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'kilode-music-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.kind = 'artist')
  );
create policy music_audio_owner_read on storage.objects
  for select to authenticated
  using (bucket_id = 'kilode-music-audio' and (storage.foldername(name))[1] = auth.uid()::text);
create policy music_audio_owner_update on storage.objects
  for update to authenticated
  using (bucket_id = 'kilode-music-audio' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'kilode-music-audio' and (storage.foldername(name))[1] = auth.uid()::text);
create policy music_audio_owner_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'kilode-music-audio' and (storage.foldername(name))[1] = auth.uid()::text);

-- Important product rules:
-- 1. Upload creates a private draft. It is not publicly streamable until review/publishing.
-- 2. Purchases create entitlements only after provider webhook verification.
-- 3. Push Link campaign goes draft -> pending_payment -> scheduled/active only after verification.
-- 4. Royalty accounting, provider webhook verification, signed playback URLs and analytics aggregation
--    must be implemented in trusted Edge Functions before launch.
