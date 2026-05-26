# Video Studio — `generation-videos` storage bucket

**Purpose:** Optional dedicated Supabase Storage bucket for Video Studio outputs.  
**Rule:** Do **not** run automatically. Execute in the Supabase SQL editor when you want videos separate from the `generations` image bucket.

## Prerequisites

- Video Studio DB columns applied — see [VIDEO_STUDIO_REQUIRED_SQL.md](./VIDEO_STUDIO_REQUIRED_SQL.md)
- Server flags: `ENABLE_FAL_VIDEO_STUDIO=true`, `NEXT_PUBLIC_ENABLE_FAL_VIDEO_STUDIO=true`
- `FAL_KEY` set for fal.ai image-to-video

## Create bucket and policies

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

## Verify

```sql
select id, name, public
from storage.buckets
where id = 'generation-videos';
```

## Runtime behavior

- The worker (`app/api/generate/process/route.ts`) uploads to `generation-videos` first.
- If the bucket is missing, it **falls back** to the existing `generations` bucket (no hard failure).
- Gallery and Agent read `generations.video_url` regardless of which bucket stored the file.

## Related docs

- [VIDEO_STUDIO_REQUIRED_SQL.md](./VIDEO_STUDIO_REQUIRED_SQL.md) — `generations` columns for video jobs
- [VIDEO_STUDIO_IMPLEMENTATION_PLAN.md](./VIDEO_STUDIO_IMPLEMENTATION_PLAN.md) — rollout and QA
- [REQUIRED_SQL_FOR_FULL_CREATOR_PLATFORM.md](./REQUIRED_SQL_FOR_FULL_CREATOR_PLATFORM.md) — full platform optional schema
