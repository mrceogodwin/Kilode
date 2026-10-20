-- Bind private audio objects to an owned draft release.
-- The initial bucket policies checked only the artist folder, allowing an artist
-- to upload orphaned files and mutate/delete audio after a release was submitted.
-- Replace (not supplement) the permissive policies because RLS policies OR together.

drop policy if exists music_audio_owner_upload on storage.objects;
drop policy if exists music_audio_owner_update on storage.objects;
drop policy if exists music_audio_owner_delete on storage.objects;

create policy music_audio_draft_release_upload on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'kilode-music-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1
      from public.music_releases r
      join public.profiles p on p.id = r.artist_id
      where r.id::text = (storage.foldername(name))[2]
        and r.artist_id = auth.uid()
        and r.status = 'draft'
        and p.kind = 'artist'
    )
  );

create policy music_audio_draft_release_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'kilode-music-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.music_releases r
      where r.id::text = (storage.foldername(name))[2]
        and r.artist_id = auth.uid()
        and r.status = 'draft'
    )
  )
  with check (
    bucket_id = 'kilode-music-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.music_releases r
      where r.id::text = (storage.foldername(name))[2]
        and r.artist_id = auth.uid()
        and r.status = 'draft'
    )
  );

create policy music_audio_draft_release_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'kilode-music-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.music_releases r
      where r.id::text = (storage.foldername(name))[2]
        and r.artist_id = auth.uid()
        and r.status = 'draft'
    )
  );

-- The owner-read policy remains in place so artists can manage their own
-- private audio. Public streaming must use an approved server-side playback path.
