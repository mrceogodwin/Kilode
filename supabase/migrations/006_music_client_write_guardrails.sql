-- Tighten client-side music writes. RLS policies are permissive by default,
-- so remove earlier broad policies rather than adding a second policy beside them.
drop policy if exists music_releases_artist_update on public.music_releases;
create policy music_releases_artist_update on public.music_releases
  for update using (
    artist_id = auth.uid()
    and status = 'draft'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.kind = 'artist')
  )
  with check (
    artist_id = auth.uid()
    and status in ('draft', 'submitted')
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.kind = 'artist')
  );

drop policy if exists tracks_artist_update on public.tracks;
create policy tracks_artist_update on public.tracks
  for update using (
    artist_id = auth.uid()
    and status in ('draft', 'processing', 'submitted')
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.kind = 'artist')
  )
  with check (
    artist_id = auth.uid()
    and status in ('draft', 'processing', 'submitted')
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.kind = 'artist')
  );

-- Submission is allowed, but client users cannot publish tracks or releases.
-- Publication must be performed by a trusted review/admin workflow.
