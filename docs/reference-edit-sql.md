# Reference Edit — Phase 2 SQL & Storage Plan

**Status:** Prepare only — **not applied automatically**, **no provider activation**  
**Last updated:** 2026-05-23  
**Migration file:** [../supabase/migrations/20260523100000_reference_edit_phase2.sql](../supabase/migrations/20260523100000_reference_edit_phase2.sql)  
**Backend spec:** [REFERENCE_EDIT_BACKEND_PLAN.md](./REFERENCE_EDIT_BACKEND_PLAN.md)

Run this phase **after** UI Phase 1 is shipped and **before** enabling `ENABLE_FAL_REFERENCE_EDIT` in the API.

---

## 1. Field requirements (review)

| Field | Required | Notes |
|-------|----------|--------|
| `workflow` | Yes (existing) | Value `reference_edit` — discriminates worker branch |
| `source_image_url` | **New** | Upload URL or Gallery `image_url` copy |
| `edit_instruction` | **New** | User edit brief (separate from `prompt` / `final_prompt`) |
| `parent_generation_id` | **New** | Optional UUID → `generations.id` when source is Gallery row |
| `provider_job_id` | **New (optional)** | fal async job id |
| `provider`, `model`, `credits_used`, `image_url` | Existing | Same as other image modes |
| `reference_image_url` | Existing | **Keep** for Style Profile only — do not use as edit source |

**Not required for v1:** separate `mode` column if `workflow = reference_edit` is sufficient.

**Planned credits (not in schema):** 3–5 credits via `getCreditCostForImageMode` when mode goes Live.

---

## 2. Bucket strategy

| Bucket | Purpose | MVP access |
|--------|---------|------------|
| **`generations`** | **Output** images (all modes including Reference Edit result) | Public read (existing worker pattern) |
| **`reference-sources`** | **Input** images for Reference Edit uploads | Public read; **upload via service role only** |

**Why not reuse `generations` for sources?**

- Clear separation of inputs vs outputs  
- Easier lifecycle/cleanup rules later  
- Avoids path collisions with `{userId}/{uuid}.png` result files  

**Why not `reference-edits`?**

- Name implies outputs; use `reference-sources` for inputs only.

Gallery-selected sources may **reuse** existing `generations.image_url` without re-uploading to `reference-sources`; still set `parent_generation_id`.

---

## 3. How to apply (Supabase Dashboard)

1. Supabase project → **SQL Editor**  
2. Paste contents of `supabase/migrations/20260523100000_reference_edit_phase2.sql`  
3. Run and verify no errors  
4. Storage → confirm bucket **`reference-sources`** exists and is public  
5. **Do not** enable app feature flags until API + worker Phase 3+ are deployed  

### Verification queries

```sql
-- Columns exist
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'generations'
  and column_name in (
    'source_image_url',
    'edit_instruction',
    'parent_generation_id',
    'provider_job_id',
    'workflow'
  )
order by column_name;

-- Bucket exists
select id, name, public, file_size_limit
from storage.buckets
where id in ('generations', 'reference-sources');
```

---

## 4. Rollback (if needed before any Reference Edit rows exist)

```sql
-- Only if Phase 2 must be reverted and no production dependency on new columns

drop policy if exists "reference_sources_public_read" on storage.objects;

delete from storage.buckets where id = 'reference-sources';

alter table public.generations drop constraint if exists generations_parent_generation_id_fkey;

alter table public.generations drop column if exists provider_job_id;
alter table public.generations drop column if exists parent_generation_id;
alter table public.generations drop column if exists edit_instruction;
alter table public.generations drop column if exists source_image_url;

drop index if exists generations_workflow_reference_edit_idx;
drop index if exists generations_parent_generation_id_idx;
```

Review storage objects in `reference-sources` before deleting the bucket.

---

## 5. What this does NOT do

- Does not enable Reference Edit in `app/api/generate` or worker  
- Does not change Stripe, credits RPC, or auth  
- Does not modify RLS policies on `public.generations` (existing policies unchanged)  
- Does not drop or alter Standard / Fast Draft / Premium data  

---

## 6. Next implementation steps (after SQL)

See [REFERENCE_EDIT_BACKEND_PLAN.md](./REFERENCE_EDIT_BACKEND_PLAN.md) §11:

| Phase | Work |
|-------|------|
| **2** | Storage upload API + validate paths (**this SQL**) |
| **3** | Insert rows with `source_image_url` / `edit_instruction` |
| **4** | Provider test (flag off in prod) |
| **5–7** | Refund, admin, public |

**Owner:** Platform engineering
