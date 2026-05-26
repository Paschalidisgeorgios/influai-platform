# Lip Sync Studio — required Supabase columns

Run in the **Supabase SQL Editor** before enabling Lip Sync in production.

```sql
alter table generations add column if not exists video_url text;
alter table generations add column if not exists source_image_url text;
alter table generations add column if not exists source_video_url text;
alter table generations add column if not exists audio_url text;
alter table generations add column if not exists duration_seconds integer;
alter table generations add column if not exists provider_job_id text;
```

Verify:

```sql
select column_name, data_type
from information_schema.columns
where table_name = 'generations'
  and column_name in (
    'video_url',
    'source_image_url',
    'source_video_url',
    'audio_url',
    'duration_seconds',
    'provider_job_id'
  );
```
