-- Keep artist-created support pages private until a trusted review/moderation action activates them.
-- The client may edit page copy, but cannot activate, pause, or close a page itself.

drop policy if exists support_pages_insert_own on public.support_pages;
create policy support_pages_insert_own on public.support_pages
  for insert with check (
    recipient_id = auth.uid()
    and status = 'draft'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.kind = 'artist'
    )
  );

create or replace function public.guard_support_page_status_change()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if new.status is distinct from old.status
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Support page status can only be changed by Kilode trusted services'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists support_page_status_trusted_only on public.support_pages;
create trigger support_page_status_trusted_only
  before update of status on public.support_pages
  for each row execute function public.guard_support_page_status_change();

-- This is intentionally not a payment integration. A trusted moderation/payment service
-- must be deployed and reviewed before pages can be activated or contributions accepted.
