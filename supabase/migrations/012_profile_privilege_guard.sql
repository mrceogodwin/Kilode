-- Protect privileged profile attributes from self-service escalation.
-- The base owner-update policy allows profile edits, so enforce that account kind
-- and app role can only be changed by trusted server-side onboarding/admin flows.
-- Existing clients may still update ordinary profile fields.

create or replace function public.guard_profile_privilege_changes()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if (
    new.kind is distinct from old.kind
    or new.role is distinct from old.role
  ) and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Account kind and role can only be changed by Kilode trusted services'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_privilege_fields_trusted_only on public.profiles;
create trigger profiles_privilege_fields_trusted_only
  before update of kind, role on public.profiles
  for each row execute function public.guard_profile_privilege_changes();

-- This trigger must be applied to the dedicated Supabase project and tested with
-- authenticated-user and service-role sessions before production launch.
