-- Stripe subscription billing tables

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stripe_subscription_id text not null unique,
  stripe_customer_id text,
  plan_key text not null,
  status text not null,
  credits_per_month integer not null default 0,
  current_period_start timestamptz,
  current_period_end timestamptz,
  last_credit_grant timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_subscriptions_user_id_idx
  on public.user_subscriptions (user_id);

alter table public.user_profiles enable row level security;
alter table public.user_subscriptions enable row level security;
