-- Kilode native authentication profile registry.
-- Apply after schema/001–003 on the dedicated Kilode Supabase project only.
-- Supabase Auth owns credentials and sessions; this table owns username and account kind.

create table if not exists public.kilode_user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username = lower(username) and username ~ '^[a-z0-9_.]{3,30}$'),
  display_name text not null check (length(trim(display_name)) between 1 and 80),
  account_kind text not null default 'member'
    check (account_kind in ('member','artist','writer','advertiser','cinema','job_poster','job_seeker','vendor','renter','brand')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.kilode_user_profiles enable row level security;
revoke all on table public.kilode_user_profiles from public, anon, authenticated;
grant select on table public.kilode_user_profiles to authenticated;
drop policy if exists "Users can read their own Kilode profile" on public.kilode_user_profiles;
create policy "Users can read their own Kilode profile" on public.kilode_user_profiles for select to authenticated using (auth.uid() = id);

create or replace function public.handle_new_kilode_user_profile()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare normalized_username text; normalized_kind text; normalized_name text;
begin
  normalized_username := lower(trim(coalesce(new.raw_user_meta_data ->> 'username', '')));
  if normalized_username !~ '^[a-z0-9_.]{3,30}$' then raise exception 'A valid Kilode username is required'; end if;
  normalized_kind := coalesce(new.raw_user_meta_data ->> 'account_kind', 'member');
  if normalized_kind not in ('member','artist','writer','advertiser','cinema','job_poster','job_seeker','vendor','renter','brand') then normalized_kind := 'member'; end if;
  normalized_name := trim(coalesce(new.raw_user_meta_data ->> 'display_name', ''));
  if normalized_name = '' then normalized_name := normalized_username; end if;
  if length(normalized_name) > 80 then normalized_name := left(normalized_name, 80); end if;
  insert into public.kilode_user_profiles (id, username, display_name, account_kind) values (new.id, normalized_username, normalized_name, normalized_kind);
  return new;
end;
$$;
revoke all on function public.handle_new_kilode_user_profile() from public, anon, authenticated;
drop trigger if exists on_kilode_auth_user_created on auth.users;
create trigger on_kilode_auth_user_created after insert on auth.users for each row execute function public.handle_new_kilode_user_profile();

create or replace function public.set_kilode_user_profile_updated_at()
returns trigger language plpgsql set search_path = ''
as $$ begin new.updated_at := now(); return new; end; $$;
revoke all on function public.set_kilode_user_profile_updated_at() from public, anon, authenticated;
drop trigger if exists kilode_user_profiles_set_updated_at on public.kilode_user_profiles;
create trigger kilode_user_profiles_set_updated_at before update on public.kilode_user_profiles for each row execute function public.set_kilode_user_profile_updated_at();
