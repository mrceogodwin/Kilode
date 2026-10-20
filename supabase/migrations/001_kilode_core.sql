-- Kilode native — dedicated database schema (Supabase / Postgres)
-- Apply to a NEW Supabase project owned by Kilode mobile — not the web-only hosts.
-- RLS is required before any production traffic.

-- Account kinds (match lib/accountKinds.ts)
create type public.account_kind as enum (
  'member',
  'artist',
  'writer',
  'advertiser',
  'cinema',
  'job_poster',
  'job_seeker',
  'vendor',
  'renter',
  'brand'
);

create type public.app_role as enum (
  'user',
  'moderator',
  'super_admin'
);

-- Profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  handle text unique not null,
  display_name text not null,
  kind public.account_kind not null default 'member',
  role public.app_role not null default 'user',
  bio text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint handle_format check (char_length(handle) >= 3)
);

-- Socials takes / posts
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  media_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.post_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- Media articles (editorial)
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles (id) on delete set null,
  title text not null,
  kicker text,
  body text,
  image_url text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

-- Music catalogue (metadata; audio URLs must respect rights)
create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references public.profiles (id) on delete set null,
  title text not null,
  artist_name text not null,
  cover_url text,
  audio_url text,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid references public.profiles (id) on delete set null,
  title text not null,
  venue text,
  starts_at timestamptz,
  price_label text,
  created_at timestamptz not null default now()
);

create table public.market_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  category text,
  price_label text,
  created_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  poster_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  location_label text,
  salary_label text,
  created_at timestamptz not null default now()
);

-- Moderation
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles (id) on delete set null,
  target_type text not null,
  target_id text not null,
  reason text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table public.blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

-- Admin audit (server-only writes preferred via service role / edge function)
create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  meta jsonb,
  created_at timestamptz not null default now()
);

-- New auth user → profile (kind from signup metadata when provided)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, handle, display_name, kind)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'handle', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'kind')::public.account_kind, 'member')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_replies enable row level security;
alter table public.articles enable row level security;
alter table public.tracks enable row level security;
alter table public.events enable row level security;
alter table public.market_listings enable row level security;
alter table public.jobs enable row level security;
alter table public.reports enable row level security;
alter table public.blocks enable row level security;
alter table public.admin_audit_log enable row level security;

-- Profiles: public read; owner update
create policy profiles_select_all on public.profiles for select using (true);
create policy profiles_update_own on public.profiles for update using (auth.uid() = id);

-- Posts: public read; author write
create policy posts_select_all on public.posts for select using (true);
create policy posts_insert_auth on public.posts for insert with check (auth.uid() = author_id);
create policy posts_update_own on public.posts for update using (auth.uid() = author_id);
create policy posts_delete_own on public.posts for delete using (auth.uid() = author_id);

-- Likes / replies
create policy likes_select on public.post_likes for select using (true);
create policy likes_insert on public.post_likes for insert with check (auth.uid() = user_id);
create policy likes_delete on public.post_likes for delete using (auth.uid() = user_id);

create policy replies_select on public.post_replies for select using (true);
create policy replies_insert on public.post_replies for insert with check (auth.uid() = author_id);

-- Catalogue tables: public read; create restricted by kind checks in app + tighter policies later
create policy articles_select on public.articles for select using (true);
create policy tracks_select on public.tracks for select using (true);
create policy events_select on public.events for select using (true);
create policy market_select on public.market_listings for select using (true);
create policy jobs_select on public.jobs for select using (true);

create policy market_insert_own on public.market_listings for insert with check (auth.uid() = seller_id);
create policy jobs_insert_own on public.jobs for insert with check (auth.uid() = poster_id);

-- Reports: authenticated insert; no public read of others' reports
create policy reports_insert on public.reports for insert with check (auth.uid() = reporter_id);
create policy reports_select_own on public.reports for select using (auth.uid() = reporter_id);

create policy blocks_all_own on public.blocks for all using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);

-- Admin audit: no client access by default (service role / edge only)
create policy admin_audit_deny on public.admin_audit_log for all using (false);

-- Helper: super_admin check (use in future policies / edge functions)
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'super_admin'
  );
$$;

-- NOTE: Granting super_admin must be done manually in the SQL editor by a project owner.
-- Never expose a public "register as admin" path.

-- Prevent self-service privilege escalation through profiles_update_own.
-- Account kind and app role are authorization fields; change them only through
-- a trusted admin/server workflow, never through ordinary client profile updates.
create or replace function public.protect_profile_authority_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null
     and not public.is_super_admin()
     and (
       new.role is distinct from old.role
       or new.kind is distinct from old.kind
     ) then
    raise exception 'Account kind and role can only be changed by an authorized administrator';
  end if;
  return new;
end;
$$;

create trigger protect_profile_authority_fields_before_update
  before update on public.profiles
  for each row execute function public.protect_profile_authority_fields();
