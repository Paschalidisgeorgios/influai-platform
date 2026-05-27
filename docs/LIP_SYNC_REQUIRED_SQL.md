# Lip Sync Studio — required Supabase columns

Run in the **Supabase SQL Editor** before enabling Lip Sync in production.
Do **not** execute automatically from app code unless your project uses migrations.

```sql
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

Verify:

```sql
select column_name, data_type
from information_schema.columns
where table_name = 'generations'
  and column_name in (
    'source_video_url',
    'audio_url',
    'script_text',
    'voice_key',
    'voice_id',
    'voice_style',
    'video_url',
    'duration_seconds',
    'provider_job_id'
  );
```
