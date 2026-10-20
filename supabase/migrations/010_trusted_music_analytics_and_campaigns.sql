-- Prevent client-authored listening analytics and campaign-state manipulation.
-- Playback events and campaign delivery metrics must be recorded by trusted
-- server-side functions that validate playback/session context.

drop policy if exists music_play_events_insert_self_or_anon on public.music_play_events;
revoke insert, update, delete, truncate, references, trigger
  on public.music_play_events from anon, authenticated;

-- Artists may edit campaign configuration only while it remains a draft.
-- A trusted server controls pending_payment, scheduled, active, paused, completed,
-- and rejected states after payment verification and delivery checks.
drop policy if exists push_link_campaigns_update_own_draft on public.push_link_campaigns;
create policy push_link_campaigns_update_own_draft on public.push_link_campaigns
  for update using (
    artist_id = auth.uid()
    and status = 'draft'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.kind = 'artist')
  )
  with check (
    artist_id = auth.uid()
    and status = 'draft'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.kind = 'artist')
  );

-- This migration only defines protections in source. Apply and test it against
-- the dedicated Supabase project before relying on these policies in production.
