-- Kilode native — enforce catalogue write permissions in Postgres, not only UI.
-- Apply after 001_kilode_core.sql and 002_auth_profile_bootstrap.sql.
-- This migration tightens the existing broad owner-only INSERT checks.

drop policy if exists market_insert_own on public.market_listings;
drop policy if exists jobs_insert_own on public.jobs;
drop policy if exists market_update_own on public.market_listings;
drop policy if exists market_delete_own on public.market_listings;
drop policy if exists jobs_update_own on public.jobs;
drop policy if exists jobs_delete_own on public.jobs;

create policy market_insert_own on public.market_listings
  for insert
  with check (
    auth.uid() = seller_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.kind = 'vendor'
    )
  );

create policy market_update_own on public.market_listings
  for update
  using (
    auth.uid() = seller_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.kind = 'vendor'
    )
  )
  with check (
    auth.uid() = seller_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.kind = 'vendor'
    )
  );

create policy market_delete_own on public.market_listings
  for delete
  using (
    auth.uid() = seller_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.kind = 'vendor'
    )
  );

create policy jobs_insert_own on public.jobs
  for insert
  with check (
    auth.uid() = poster_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.kind = 'job_poster'
    )
  );

create policy jobs_update_own on public.jobs
  for update
  using (
    auth.uid() = poster_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.kind = 'job_poster'
    )
  )
  with check (
    auth.uid() = poster_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.kind = 'job_poster'
    )
  );

create policy jobs_delete_own on public.jobs
  for delete
  using (
    auth.uid() = poster_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.kind = 'job_poster'
    )
  );

-- Writers can publish Media articles only as themselves.
drop policy if exists articles_insert_writer on public.articles;
create policy articles_insert_writer on public.articles
  for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.kind = 'writer'
    )
  );

-- Artists can add tracks only under their own artist profile.
drop policy if exists tracks_insert_artist on public.tracks;
create policy tracks_insert_artist on public.tracks
  for insert
  with check (
    artist_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.kind = 'artist'
    )
  );

-- Events intentionally remain read-only until Kilode defines which account
-- type is allowed to publish/organize them.
