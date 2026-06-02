-- InfluExAI · Reinigungs-Marktplatz (Abo für Firmen, kostenlose Kundensuche)

create type public.cleaning_leistung_art as enum (
  'fensterreinigung',
  'bueroreinigung',
  'haushaltsreinigung',
  'grundreinigung',
  'bauendreinigung',
  'teppichreinigung',
  'sonstiges'
);

create type public.cleaning_preis_typ as enum ('stundensatz', 'pauschal');

create type public.cleaning_abo_tier as enum ('standard', 'premium');

create table if not exists public.cleaning_firms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  plz text not null check (plz ~ '^\d{5}$'),
  abo_tier public.cleaning_abo_tier not null default 'standard',
  rating_avg numeric(2, 1) not null default 4.0
    check (rating_avg >= 1 and rating_avg <= 5),
  rating_count integer not null default 0 check (rating_count >= 0),
  contact_email text,
  contact_phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cleaning_services (
  id uuid primary key default gen_random_uuid(),
  firma_id uuid not null references public.cleaning_firms (id) on delete cascade,
  leistung_art public.cleaning_leistung_art not null,
  preis numeric(10, 2) not null check (preis > 0),
  preis_typ public.cleaning_preis_typ not null,
  plz text not null check (plz ~ '^\d{5}$'),
  raw_ingest_text text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cleaning_services_search_idx
  on public.cleaning_services (leistung_art, plz, is_active);

create index if not exists cleaning_firms_plz_idx
  on public.cleaning_firms (plz, is_active);

-- RLS: Kunden lesen aktiv; Schreiben nur service role / Firmen-Auth (später)
alter table public.cleaning_firms enable row level security;
alter table public.cleaning_services enable row level security;

create policy "Public read active firms"
  on public.cleaning_firms for select
  using (is_active = true);

create policy "Public read active services"
  on public.cleaning_services for select
  using (is_active = true);
