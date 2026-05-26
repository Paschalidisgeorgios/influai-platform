# Video Studio — required Supabase columns

Run in the **Supabase SQL Editor** before enabling Video Studio in production.

```sql
alter table generations add column if not exists video_url text;
alter table generations add column if not exists duration_seconds integer;
alter table generations add column if not exists source_image_url text;
alter table generations add column if not exists provider_job_id text;
```

The application uses graceful fallbacks when optional columns are missing, but **video playback requires `video_url`**. `source_image_url` is required for the image-to-video worker to read the uploaded frame.

Verify:

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
