# Lip Sync Studio — Supabase Storage buckets

Create these buckets in Supabase **Storage** (or run equivalent SQL/policy setup in your project).

## Buckets

| Bucket | Purpose | Max upload (API) |
|--------|---------|------------------|
| `lip-sync-sources` | Source images (PNG/JPEG/WebP) and videos (MP4/WebM/MOV) | 50 MB |
| `lip-sync-audio` | Audio tracks (MP3/WAV/AAC/OGG/M4A) | 25 MB |

## Suggested policies (adjust to your security model)

Allow authenticated users to upload into their own folder `{user_id}/…` and read public URLs if your app uses `getPublicUrl` (same pattern as `reference-sources`).

Example policy ideas (not auto-applied):

```sql
-- Create buckets in Dashboard: Storage → New bucket
-- lip-sync-sources (public or signed URLs per product decision)
-- lip-sync-audio (public or signed URLs per product decision)
```

For MVP, service role uploads via `app/api/lip-sync/upload/route.ts` — ensure the service role can `insert` on both bucket paths.

## Fallback

If you prefer a single bucket, you may use `reference-sources` for images only; **video + audio lip sync requires** `lip-sync-sources` and `lip-sync-audio` (or equivalent) with video/audio MIME support.
