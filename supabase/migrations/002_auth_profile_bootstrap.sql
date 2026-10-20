-- Kilode native — create the public profile when Supabase Auth creates a user.
-- Apply after 001_kilode_core.sql in the dedicated Kilode Supabase project.
-- Runs as a database trigger; the mobile client never receives elevated credentials.

create or replace function public.handle_new_kilode_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_handle text;
  safe_handle text;
  display_name_value text;
  kind_value public.account_kind := 'member';
begin
  requested_handle := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'handle'), ''),
    split_part(coalesce(new.email, 'member'), '@', 1),
    'member'
  );
  safe_handle := lower(regexp_replace(requested_handle, '[^a-zA-Z0-9_]', '', 'g'));
  if char_length(safe_handle) < 3 then
    safe_handle := 'user';
  end if;

  -- Add a short stable suffix so two sign-ups choosing the same handle cannot
  -- break account creation or accidentally claim another user's profile.
  safe_handle := left(safe_handle, 24) || '_' || left(replace(new.id::text, '-', ''), 6);
  display_name_value := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    requested_handle,
    'Kilode member'
  );

  begin
    kind_value := coalesce(nullif(new.raw_user_meta_data ->> 'kind', ''), 'member')::public.account_kind;
  exception when invalid_text_representation then
    kind_value := 'member';
  end;

  insert into public.profiles (id, handle, display_name, kind, role)
  values (new.id, safe_handle, display_name_value, kind_value, 'user')
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_kilode_profile on auth.users;
create trigger on_auth_user_created_kilode_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_kilode_user();

-- Backfill any existing auth users that lack profiles. Existing profiles are
-- untouched; all backfilled accounts receive the least-privileged member role.
insert into public.profiles (id, handle, display_name, kind, role)
select
  u.id,
  left(
    lower(regexp_replace(
      coalesce(nullif(trim(u.raw_user_meta_data ->> 'handle'), ''), split_part(coalesce(u.email, 'member'), '@', 1), 'member'),
      '[^a-zA-Z0-9_]', '', 'g'
    )),
    24
  ) || '_' || left(replace(u.id::text, '-', ''), 6),
  coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''),
    split_part(coalesce(u.email, 'Kilode member'), '@', 1),
    'Kilode member'
  ),
  case
    when coalesce(u.raw_user_meta_data ->> 'kind', 'member') in (
      'member', 'artist', 'writer', 'advertiser', 'cinema',
      'job_poster', 'job_seeker', 'vendor', 'renter', 'brand'
    )
    then coalesce(u.raw_user_meta_data ->> 'kind', 'member')::public.account_kind
    else 'member'::public.account_kind
  end,
  'user'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
