-- Kilode native — enforce catalogue write permissions in Postgres, not only UI.
-- Apply after 001_kilode_core.sql and 002_auth_profile_bootstrap.sql.
-- This migration tightens the existing broad owner-only INSERT checks.

drop policy if exists market_insert_own on public.market_listings;
drop policy if exists jobs_insert_own on public.jobs;
drop policy if exists market_update_own on public.market_listings;
drop policy if exists market_delete_own on public.market_listings;
drop policy if exists jobs_update_own on public.jobs;
drop policy if exists jobs_delete_own on public.jobs;

create policy market_insert_own on public.market_listings
  for insert
  with check (
    auth.uid() = seller_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.kind in ('vendor', 'brand')
    )
  );

create policy market_update_own on public.market_listings
  for update
  using (
    auth.uid() = seller_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.kind in ('vendor', 'brand')
    )
  )
  with check (
    auth.uid() = seller_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.kind in ('vendor', 'brand')
    )
  );

create policy market_delete_own on public.market_listings
  for delete
  using (
    auth.uid() = seller_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.kind in ('vendor', 'brand')
    )
  );

create policy jobs_insert_own on public.jobs
  for insert
  with check (
    auth.uid() = poster_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.kind = 'job_poster'
    )
  );

create policy jobs_update_own on public.jobs
  for update
  using (
    auth.uid() = poster_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.kind = 'job_poster'
    )
  )
  with check (
    auth.uid() = poster_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.kind = 'job_poster'
    )
  );

create policy jobs_delete_own on public.jobs
  for delete
  using (
    auth.uid() = poster_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.kind = 'job_poster'
    )
  );
