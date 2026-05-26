# InfluExAi — Required SQL for full creator platform (optional)

**Purpose:** Prepare `public.generations` for video outputs and future planning metadata.  
**Rule:** Do **not** run automatically. Execute in Supabase SQL editor when you are ready.

## 1) `generations` columns

```sql
alter table generations add column if not exists video_url text;
alter table generations add column if not exists duration_seconds integer;
alter table generations add column if not exists source_image_url text;
alter table generations add column if not exists source_video_url text;
alter table generations add column if not exists provider_job_id text;
alter table generations add column if not exists script_text text;
alter table generations add column if not exists audio_url text;
alter table generations add column if not exists caption_text text;
alter table generations add column if not exists hashtags text[];
alter table generations add column if not exists watermark_enabled boolean default false;
alter table generations add column if not exists compliance_status text;
alter table generations add column if not exists campaign_id uuid;
```

## 2) Optional storage bucket for videos: `generation-videos`

If you want to keep video assets separate from the existing `generations` bucket.

```sql
insert into storage.buckets (id, name, public)
values ('generation-videos', 'generation-videos', true)
on conflict (id)
do update set public = true;

drop policy if exists "Public read generation videos" on storage.objects;
drop policy if exists "Service role upload generation videos" on storage.objects;
drop policy if exists "Service role update generation videos" on storage.objects;
drop policy if exists "Service role delete generation videos" on storage.objects;

create policy "Public read generation videos"
on storage.objects
for select
using (bucket_id = 'generation-videos');

create policy "Service role upload generation videos"
on storage.objects
for insert
with check (bucket_id = 'generation-videos');

create policy "Service role update generation videos"
on storage.objects
for update
using (bucket_id = 'generation-videos');

create policy "Service role delete generation videos"
on storage.objects
for delete
using (bucket_id = 'generation-videos');
```

## Notes

- If `generation-videos` does not exist, the worker will fall back to uploading videos into the existing `generations` bucket.
- If `video_url` (or other required columns) are missing, video/lip-sync modes should be considered unsafe to enable.
