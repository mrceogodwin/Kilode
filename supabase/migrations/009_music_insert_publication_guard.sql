-- Close a client-side publication bypass on first insert.
-- Earlier artist INSERT policies checked ownership/account kind but did not
-- require draft status, so an authenticated artist could attempt to insert a
-- release or track already marked published. Publication must be trusted-server-only.

drop policy if exists music_releases_artist_insert on public.music_releases;
create policy music_releases_artist_insert on public.music_releases
  for insert with check (
    artist_id = auth.uid()
    and status = 'draft'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.kind = 'artist'
    )
  );

drop policy if exists tracks_artist_insert on public.tracks;
create policy tracks_artist_insert on public.tracks
  for insert with check (
    artist_id = auth.uid()
    and status = 'draft'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.kind = 'artist'
    )
  );

-- This migration changes database policy definitions only. It must be applied
-- to the dedicated Supabase project before the protection is active.
