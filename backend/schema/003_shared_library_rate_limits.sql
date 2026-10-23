-- Shared authenticated rate limiting for the Kilode Music library API.
-- Apply only to the dedicated Kilode Supabase project.
-- Public catalogue endpoints still need an edge/IP shared limiter before production.

create table if not exists public.music_api_rate_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null check (scope in ('library_read', 'library_write')),
  window_start timestamptz not null,
  request_count integer not null check (request_count >= 1),
  primary key (user_id, scope)
);

alter table public.music_api_rate_limits enable row level security;
revoke all on table public.music_api_rate_limits from public, anon, authenticated;

create or replace function public.consume_kilode_library_rate_limit(p_scope text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  caller_id uuid := auth.uid();
  request_limit integer;
  current_window timestamptz := date_trunc('minute', clock_timestamp());
  resulting_count integer;
begin
  if caller_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  case p_scope
    when 'library_read' then request_limit := 120;
    when 'library_write' then request_limit := 30;
    else raise exception 'Unsupported rate-limit scope' using errcode = '22023';
  end case;

  insert into public.music_api_rate_limits (user_id, scope, window_start, request_count)
  values (caller_id, p_scope, current_window, 1)
  on conflict (user_id, scope) do update
    set window_start = greatest(public.music_api_rate_limits.window_start, excluded.window_start),
        request_count = case
          when public.music_api_rate_limits.window_start < excluded.window_start then 1
          when public.music_api_rate_limits.window_start > excluded.window_start then public.music_api_rate_limits.request_count
          else least(public.music_api_rate_limits.request_count + 1, request_limit + 1)
        end
  returning request_count into resulting_count;

  return resulting_count <= request_limit;
end;
$$;

-- Only authenticated JWT callers can consume their own fixed scope quota.
-- Callers cannot read or directly edit the counter table to reset their quota.
revoke all on function public.consume_kilode_library_rate_limit(text) from public, anon;
grant execute on function public.consume_kilode_library_rate_limit(text) to authenticated;
