-- Add private audio-object metadata for artist release drafts.
-- Audio remains private until a trusted review/publishing workflow approves it.
alter table public.music_releases
  add column if not exists audio_path text;

-- Ensure artists can only edit their own draft metadata through client-side RLS.
drop policy if exists music_releases_artist_update on public.music_releases;
create policy music_releases_artist_update on public.music_releases
  for update using (artist_id = auth.uid() and status = 'draft')
  with check (
    artist_id = auth.uid()
    and status = 'draft'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.kind = 'artist')
  );
