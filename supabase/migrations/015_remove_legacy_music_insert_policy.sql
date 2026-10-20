-- Close a permissive legacy policy that survived the music publication guard.
-- RLS policies for the same command are permissive by default (OR semantics).
-- Migration 003 created tracks_insert_artist, while migration 009 tightened the
-- separate tracks_artist_insert policy. Leaving the legacy policy would allow an
-- artist to bypass the required draft status on first insert.
drop policy if exists tracks_insert_artist on public.tracks;

-- Reassert the intended insert rule in one canonical policy.
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

-- This migration must be applied after 009_music_insert_publication_guard.sql.
