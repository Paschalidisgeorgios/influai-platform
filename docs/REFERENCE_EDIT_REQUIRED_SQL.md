# Reference Edit — optional `generations` columns

Apply manually in **Supabase → SQL Editor** if Reference Edit should persist dedicated source/instruction fields.  
The API falls back to `reference_image_url` and `prompt` / `final_prompt` when these columns are missing.

```sql
alter table public.generations add column if not exists source_image_url text;
alter table public.generations add column if not exists edit_instruction text;
alter table public.generations add column if not exists parent_generation_id uuid;
alter table public.generations add column if not exists provider_job_id text;
```

Related: [REFERENCE_SOURCES_BUCKET_SQL.md](./REFERENCE_SOURCES_BUCKET_SQL.md), [reference-edit-sql.md](./reference-edit-sql.md)
