# Reference Sources Storage Bucket — SQL Reference

**Bucket id:** `reference-sources`  
**Purpose:** Source images for Reference Edit (inputs only). **Results** stay in bucket `generations`.  
**Status:** Bucket may already exist in your Supabase project — verify before re-running.

Do **not** run this automatically from the app. Apply manually in **Supabase → SQL Editor** when needed.

Related: [reference-edit-sql.md](./reference-edit-sql.md), [REFERENCE_EDIT_BACKEND_PLAN.md](./REFERENCE_EDIT_BACKEND_PLAN.md)

---

## 1. Create or update bucket

```sql
insert into storage.buckets (id, name, public)
values ('reference-sources', 'reference-sources', true)
on conflict (id)
do update set public = true;
```

Optional limits (recommended):

```sql
update storage.buckets
set
  file_size_limit = 12582912,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'reference-sources';
```

---

## 2. Storage policies

Service role (API routes) bypasses RLS. Policies below support public read and explicit service-role CRUD documentation.

```sql
drop policy if exists "Public read reference sources" on storage.objects;
drop policy if exists "Service role upload reference sources" on storage.objects;
drop policy if exists "Service role update reference sources" on storage.objects;
drop policy if exists "Service role delete reference sources" on storage.objects;

create policy "Public read reference sources"
on storage.objects
for select
using (bucket_id = 'reference-sources');

create policy "Service role upload reference sources"
on storage.objects
for insert
with check (bucket_id = 'reference-sources');

create policy "Service role update reference sources"
on storage.objects
for update
using (bucket_id = 'reference-sources');

create policy "Service role delete reference sources"
on storage.objects
for delete
using (bucket_id = 'reference-sources');
```

**MVP upload path:** `POST /api/reference-sources/upload` uses `SUPABASE_SERVICE_ROLE_KEY` — no client-side INSERT to storage.

---

## 3. Object path convention

```
{user_id}/{uuid}.png|jpg|webp
```

Example response from upload API:

```json
{
  "success": true,
  "imageUrl": "https://…/storage/v1/object/public/reference-sources/…",
  "storagePath": "user-uuid/file-uuid.jpg"
}
```

---

## 4. Verify

```sql
select id, name, public, file_size_limit
from storage.buckets
where id = 'reference-sources';
```

---

## 5. What this does NOT do

- No `generations` row created on upload  
- No credits consumed  
- No provider / edit API calls  
- Does not modify bucket `generations` or existing RLS on `public.generations`
