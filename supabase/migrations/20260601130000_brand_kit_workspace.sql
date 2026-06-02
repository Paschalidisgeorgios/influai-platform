-- Brand Kit (one kit per user) + Team Workspace

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users (id) on delete cascade,
  plan text not null check (plan in ('team_starter', 'team_pro')),
  shared_credits integer not null default 0,
  max_seats integer not null default 3,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workspaces_owner_id_idx on public.workspaces (owner_id);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  role text not null check (role in ('owner', 'admin', 'member')),
  status text not null default 'invited' check (status in ('invited', 'active', 'removed')),
  invite_token text unique,
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, email)
);

create index if not exists workspace_members_workspace_id_idx
  on public.workspace_members (workspace_id);

create table if not exists public.brand_kits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  workspace_id uuid references public.workspaces (id) on delete set null,
  name text not null default 'My Brand',
  primary_color text not null default '#d8ad5f',
  secondary_color text not null default '#1a1a1a',
  accent_color text not null default '#ffffff',
  font_style text not null default 'sans-serif'
    check (font_style in ('serif', 'sans-serif', 'display', 'mono')),
  tone text not null default 'professional'
    check (tone in ('luxury', 'minimal', 'bold', 'playful', 'professional', 'authentic')),
  product_style text not null default '',
  visual_rules text not null default '',
  forbidden_elements text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.brand_kits enable row level security;
