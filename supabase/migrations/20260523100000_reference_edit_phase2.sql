-- InfluExAi — Reference Edit Phase 2 (schema + storage)
-- Status: PREPARE ONLY — run manually in Supabase SQL Editor when approved.
-- Does NOT activate Reference Edit in the application.
--
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT DO NOTHING where applicable.
-- Does NOT drop tables or columns. Does NOT modify existing RLS on public.generations.

-- ---------------------------------------------------------------------------
-- 1. generations — Reference Edit metadata columns
-- ---------------------------------------------------------------------------

alter table public.generations
  add column if not exists source_image_url text;

alter table public.generations
  add column if not exists edit_instruction text;

alter table public.generations
  add column if not exists parent_generation_id uuid;

alter table public.generations
  add column if not exists provider_job_id text;

-- Optional FK: link edit output to source generation (Gallery lineage).
-- Skip if parent_generation_id already has a constraint with another name.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'generations_parent_generation_id_fkey'
  ) then
    alter table public.generations
      add constraint generations_parent_generation_id_fkey
      foreign key (parent_generation_id)
      references public.generations (id)
      on delete set null;
  end if;
end $$;

comment on column public.generations.source_image_url is
  'Reference Edit: user upload or Gallery source image URL (not character style reference).';

comment on column public.generations.edit_instruction is
  'Reference Edit: user transformation brief for the edit provider.';

comment on column public.generations.parent_generation_id is
  'Reference Edit: optional link to source generations row when editing from Gallery.';

comment on column public.generations.provider_job_id is
  'External async provider job id (fal queue, etc.) for support and polling.';

-- workflow column already exists — use workflow = ''reference_edit'' for edit jobs.
-- Do NOT overload reference_image_url (reserved for Style Profile / character_id).

create index if not exists generations_parent_generation_id_idx
  on public.generations (parent_generation_id)
  where parent_generation_id is not null;

create index if not exists generations_workflow_reference_edit_idx
  on public.generations (workflow)
  where workflow = 'reference_edit';

-- ---------------------------------------------------------------------------
-- 2. Storage bucket: reference-sources (source uploads only)
-- ---------------------------------------------------------------------------
-- Results remain in existing bucket: generations (worker unchanged for outputs).
-- MVP: public read; uploads via service role in API routes only (no client INSERT policy).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'reference-sources',
  'reference-sources',
  true,
  15728640,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read for source images (same pattern as generations bucket for outputs).
drop policy if exists "reference_sources_public_read" on storage.objects;

create policy "reference_sources_public_read"
on storage.objects
for select
to public
using (bucket_id = 'reference-sources');

-- No INSERT/UPDATE/DELETE policies for anon or authenticated on reference-sources.
-- Application uploads with SUPABASE_SERVICE_ROLE_KEY bypass RLS.

-- Suggested object path: {user_id}/{uuid}.png
