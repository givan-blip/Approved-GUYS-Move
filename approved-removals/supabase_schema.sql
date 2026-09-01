-- ============================================================
-- Approved Removals — Step 1 database (leads + bookings)
-- Run this in Supabase: Dashboard -> SQL Editor -> New query -> Run.
-- Safe to run more than once.
-- ============================================================

-- 1) LEADS: every email/phone captured at the "reveal price" step,
--    even if the customer doesn't finish booking. This is your marketing list.
create table if not exists public.removal_leads (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  phone       text,
  quote_total numeric,
  route       text,
  volume      numeric,
  created_at  timestamptz not null default now()
);

-- 2) BOOKINGS: every completed booking. The whole job (route, items,
--    inventory, proofs, extras) lives in the "data" JSON column; a few
--    columns are pulled out so they're easy to read and export.
create table if not exists public.removal_bookings (
  id             uuid primary key default gen_random_uuid(),
  ref            text unique not null,
  pkg            text,
  price          numeric,
  status         text default 'scheduled',
  customer_name  text,
  customer_email text,
  customer_phone text,
  data           jsonb not null,
  created_at     timestamptz not null default now()
);

-- Turn on row-level security (Supabase best practice).
alter table public.removal_leads    enable row level security;
alter table public.removal_bookings enable row level security;

-- ------------------------------------------------------------
-- STEP 1 policies — get running fast.
-- These let the website's public key read + write both tables.
--
-- ⚠️  NOTE: this means anyone who extracts the public key from the site
--     could read customer details. That's fine for launching and testing,
--     but in the NEXT step we add an owner/driver login and lock reads down.
-- ------------------------------------------------------------
drop policy if exists "leads_anon_all"    on public.removal_leads;
drop policy if exists "bookings_anon_all" on public.removal_bookings;

create policy "leads_anon_all"    on public.removal_leads
  for all to anon using (true) with check (true);

create policy "bookings_anon_all" on public.removal_bookings
  for all to anon using (true) with check (true);

-- ------------------------------------------------------------
-- LATER (Step 2, recommended) — replace the two policies above with:
--   * anon can only INSERT (public can create a lead/booking)
--   * only logged-in owner/driver can SELECT/UPDATE (see customer data)
-- We'll do this together when we add the login. Keep this here for reference:
--
--   drop policy "leads_anon_all"    on public.removal_leads;
--   drop policy "bookings_anon_all" on public.removal_bookings;
--   create policy "leads_insert_anon"      on public.removal_leads    for insert to anon          with check (true);
--   create policy "leads_read_auth"        on public.removal_leads    for select to authenticated using (true);
--   create policy "bookings_insert_anon"   on public.removal_bookings for insert to anon          with check (true);
--   create policy "bookings_rw_auth"       on public.removal_bookings for all    to authenticated using (true) with check (true);
-- ------------------------------------------------------------
