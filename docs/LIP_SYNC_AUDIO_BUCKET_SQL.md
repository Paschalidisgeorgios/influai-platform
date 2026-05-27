# Lip Sync Studio — `lip-sync-audio` storage bucket

**Purpose:** Supabase Storage bucket for Lip Sync audio uploads.  
**Rule:** Do **not** run automatically. Execute in the Supabase SQL editor.

```sql
insert into storage.buckets (id, name, public)
values ('lip-sync-audio', 'lip-sync-audio', true)
on conflict (id)
do update set public = true;

drop policy if exists "Public read lip sync audio" on storage.objects;
drop policy if exists "Service role upload lip sync audio" on storage.objects;
drop policy if exists "Service role update lip sync audio" on storage.objects;
drop policy if exists "Service role delete lip sync audio" on storage.objects;

create policy "Public read lip sync audio"
on storage.objects
for select
using (bucket_id = 'lip-sync-audio');

create policy "Service role upload lip sync audio"
on storage.objects
for insert
with check (bucket_id = 'lip-sync-audio');

create policy "Service role update lip sync audio"
on storage.objects
for update
using (bucket_id = 'lip-sync-audio');

create policy "Service role delete lip sync audio"
on storage.objects
for delete
using (bucket_id = 'lip-sync-audio');
```

