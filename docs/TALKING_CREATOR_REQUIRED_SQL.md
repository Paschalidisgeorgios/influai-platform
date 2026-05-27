# Talking Creator Required SQL

Use these statements to ensure the `generations` table supports Talking Creator and Lip Sync metadata.
Run in Supabase SQL editor when needed. These statements are idempotent.

```sql
alter table generations add column if not exists source_image_url text;
alter table generations add column if not exists source_video_url text;
alter table generations add column if not exists audio_url text;
alter table generations add column if not exists script_text text;
alter table generations add column if not exists voice_key text;
alter table generations add column if not exists voice_id text;
alter table generations add column if not exists voice_style text;
alter table generations add column if not exists video_url text;
alter table generations add column if not exists duration_seconds integer;
alter table generations add column if not exists provider_job_id text;
```

## Notes

- Application code is written to tolerate missing optional columns and avoid crashes.
- If a column is missing, some metadata may not persist, but generation jobs should still complete.
- Required storage buckets for full Talking Creator/Lip Sync flow:
  - `reference-sources`
  - `lip-sync-audio`
  - `generation-videos`
