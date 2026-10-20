-- Restrict support pages to artist accounts. Members can discover active pages,
-- but only the artist who owns a page can create or edit it.
drop policy if exists support_pages_read_active_or_own on public.support_pages;
create policy support_pages_read_active_or_own on public.support_pages
  for select using (
    (status = 'active' and exists (
      select 1 from public.profiles p
      where p.id = recipient_id and p.kind = 'artist'
    ))
    or recipient_id = auth.uid()
  );

drop policy if exists support_pages_insert_own on public.support_pages;
create policy support_pages_insert_own on public.support_pages
  for insert with check (
    recipient_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.kind = 'artist'
    )
  );

drop policy if exists support_pages_update_own on public.support_pages;
create policy support_pages_update_own on public.support_pages
  for update using (
    recipient_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.kind = 'artist'
    )
  )
  with check (
    recipient_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.kind = 'artist'
    )
  );

-- Contributions remain readable only by the supporter or recipient. No client
-- insert/update/delete grants are added: trusted payment webhooks own the ledger.
drop policy if exists support_contributions_read_participants on public.support_contributions;
create policy support_contributions_read_participants on public.support_contributions
  for select using (supporter_id = auth.uid() or recipient_id = auth.uid());

revoke insert, update, delete, truncate, references, trigger
  on public.support_contributions from anon, authenticated;
