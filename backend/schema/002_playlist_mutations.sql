-- Kilode playlist mutation RPCs.
-- Apply only to the dedicated Kilode Supabase project after reviewing its target.
-- Invoked using the caller's JWT; RLS and auth.uid() remain authoritative.

create or replace function public.reorder_music_playlist_tracks(
  p_playlist_id uuid,
  p_track_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  existing_count integer;
  max_position integer;
  shift_by integer;
  distinct_requested integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if p_playlist_id is null
     or p_track_ids is null
     or cardinality(p_track_ids) < 1
     or cardinality(p_track_ids) > 500 then
    raise exception 'Playlist ID and between 1 and 500 track IDs are required'
      using errcode = '22023';
  end if;

  select count(distinct requested.track_id)::integer
    into distinct_requested
  from unnest(p_track_ids) as requested(track_id);

  if distinct_requested <> cardinality(p_track_ids) then
    raise exception 'Track IDs must be unique' using errcode = '22023';
  end if;

  -- RLS also hides playlists the caller does not own.
  if not exists (
    select 1
    from public.music_playlists p
    where p.id = p_playlist_id
      and p.user_id = auth.uid()
  ) then
    raise exception 'Playlist not found' using errcode = 'P0002';
  end if;

  select count(*)::integer, coalesce(max(pt.position), -1)
    into existing_count, max_position
  from public.music_playlist_tracks pt
  where pt.playlist_id = p_playlist_id;

  if existing_count <> cardinality(p_track_ids) then
    raise exception 'Track IDs must include every playlist track exactly once'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from unnest(p_track_ids) as requested(track_id)
    left join public.music_playlist_tracks existing
      on existing.playlist_id = p_playlist_id
     and existing.track_id = requested.track_id
    where existing.track_id is null
  ) then
    raise exception 'Every track ID must already belong to this playlist'
      using errcode = '22023';
  end if;

  -- Move all rows above the current range first, freeing positions 0..N-1.
  -- This avoids transient collisions with UNIQUE (playlist_id, position).
  shift_by := max_position + existing_count + 1;
  update public.music_playlist_tracks
     set position = position + shift_by
   where playlist_id = p_playlist_id;

  update public.music_playlist_tracks as target
     set position = requested.ordinality::integer - 1
    from unnest(p_track_ids) with ordinality as requested(track_id, ordinality)
   where target.playlist_id = p_playlist_id
     and target.track_id = requested.track_id;

  update public.music_playlists
     set updated_at = now()
   where id = p_playlist_id
     and user_id = auth.uid();
end;
$$;

revoke all on function public.reorder_music_playlist_tracks(uuid, uuid[]) from public, anon;
grant execute on function public.reorder_music_playlist_tracks(uuid, uuid[]) to authenticated;

-- Keep playlist recency accurate for renames and other updates.
create or replace function public.set_music_playlist_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists music_playlists_set_updated_at on public.music_playlists;
create trigger music_playlists_set_updated_at
before update on public.music_playlists
for each row execute function public.set_music_playlist_updated_at();
