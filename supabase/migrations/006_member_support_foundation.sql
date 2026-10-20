-- Kilode member-to-member support foundation.
-- This is a ledger schema only: no payment provider is connected by this migration.
-- Clients must never be allowed to mark a contribution paid or write provider references.

create table if not exists public.support_pages (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 2 and 100),
  message text not null default '' check (char_length(message) <= 500),
  goal_amount_minor bigint check (goal_amount_minor is null or goal_amount_minor > 0),
  currency text not null default 'NGN' check (currency ~ '^[A-Z]{3}$'),
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_pages_recipient_created_idx
  on public.support_pages (recipient_id, created_at desc);
create index if not exists support_pages_active_created_idx
  on public.support_pages (created_at desc) where status = 'active';

alter table public.support_pages enable row level security;

drop policy if exists support_pages_read_active_or_own on public.support_pages;
create policy support_pages_read_active_or_own on public.support_pages
  for select using (status = 'active' or recipient_id = auth.uid());

drop policy if exists support_pages_insert_own on public.support_pages;
create policy support_pages_insert_own on public.support_pages
  for insert with check (
    recipient_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid())
  );

drop policy if exists support_pages_update_own on public.support_pages;
create policy support_pages_update_own on public.support_pages
  for update using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

-- Append-only from the app's point of view. A trusted server-side payment
-- webhook/Edge Function must create and update these rows after provider checks.
create table if not exists public.support_contributions (
  id uuid primary key default gen_random_uuid(),
  support_page_id uuid not null references public.support_pages(id) on delete restrict,
  supporter_id uuid references public.profiles(id) on delete set null,
  recipient_id uuid not null references public.profiles(id) on delete restrict,
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  provider text,
  provider_reference text unique,
  idempotency_key text unique,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  refunded_at timestamptz,
  constraint support_contribution_not_self check (supporter_id is null or supporter_id <> recipient_id)
);

create index if not exists support_contributions_recipient_created_idx
  on public.support_contributions (recipient_id, created_at desc);
create index if not exists support_contributions_supporter_created_idx
  on public.support_contributions (supporter_id, created_at desc);
create index if not exists support_contributions_page_status_idx
  on public.support_contributions (support_page_id, status);

alter table public.support_contributions enable row level security;

drop policy if exists support_contributions_read_participants on public.support_contributions;
create policy support_contributions_read_participants on public.support_contributions
  for select using (supporter_id = auth.uid() or recipient_id = auth.uid());

-- Explicitly deny direct client writes even if default table grants are broad.
revoke insert, update, delete, truncate, references, trigger
  on public.support_contributions from anon, authenticated;

-- Amounts use integer minor units (for example, kobo), never floating point.
-- Do not add wallet balances or permit self-reported payment success here.
