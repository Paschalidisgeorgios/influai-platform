# Video Studio — required Supabase columns

**Purpose:** Prepare `public.generations` for Video Studio (image-to-video) before enabling production flags.  
**Rule:** Do **not** run automatically. Execute in the Supabase SQL Editor when you are ready.

## Environment flags

| Flag | Scope | Required value |
|------|--------|----------------|
| `ENABLE_FAL_VIDEO_STUDIO` | Server (API + worker) | `true` |
| `NEXT_PUBLIC_ENABLE_FAL_VIDEO_STUDIO` | Client (Agent tab + Tools badge) | `true` |
| `FAL_KEY` | Server | Valid fal.ai key |

Placeholders live in `.env.example`. Set matching values in `.env.local` / Vercel — never commit real secrets.

## Required columns

```sql
alter table generations add column if not exists video_url text;
alter table generations add column if not exists duration_seconds integer;
alter table generations add column if not exists source_image_url text;
alter table generations add column if not exists provider_job_id text;
```

| Column | Role |
|--------|------|
| `video_url` | Public URL for completed video (Agent + Gallery playback) |
| `duration_seconds` | Clip length metadata (optional but recommended) |
| `source_image_url` | Uploaded frame for image-to-video worker input |
| `provider_job_id` | fal.ai request id for polling / support |

The app uses graceful fallbacks when optional columns are missing, but **video playback requires `video_url`**. **Image-to-video requires `source_image_url`.**

## Verify

```sql
select column_name, data_type
from information_schema.columns
where table_name = 'generations'
  and column_name in (
    'video_url',
    'duration_seconds',
    'source_image_url',
    'provider_job_id'
  );
```

## Optional video storage bucket

For a dedicated video bucket (recommended at scale), see [VIDEO_STORAGE_BUCKET_SQL.md](./VIDEO_STORAGE_BUCKET_SQL.md).

If `generation-videos` does not exist, the worker falls back to the `generations` storage bucket.

## Credit cost (when enabled)

- Video Studio (Kling 2.1 image-to-video): **25 credits** per job — see `docs/CREDIT_AND_MODE_STRATEGY.md`.

## Related docs

- [VIDEO_STORAGE_BUCKET_SQL.md](./VIDEO_STORAGE_BUCKET_SQL.md)
- [VIDEO_STUDIO_IMPLEMENTATION_PLAN.md](./VIDEO_STUDIO_IMPLEMENTATION_PLAN.md)
- [PRODUCTION_QA.md](./PRODUCTION_QA.md) — section 15 (Video Studio QA)
