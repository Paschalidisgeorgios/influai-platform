# InfluExAi — Operations Runbook

**Purpose:** Incident response and routine operations for the InfluExAi MVP.  
**Audience:** On-call engineer / founder-operator  
**Production:** `https://influai-platform.vercel.app`

Do not paste production secrets into tickets. Use Vercel and Supabase dashboards with least privilege.

---

## Severity guide

| Level | Examples | Target response |
|-------|----------|----------------|
| **P1** | No generations complete; payments broken; auth down | Immediate |
| **P2** | Intermittent failures; gallery broken; credits wrong | Same day |
| **P3** | UI copy; non-critical mobile glitch | Next business day |

---

## 1. OpenAI API key invalid or missing

### Symptoms

- Generations fail quickly with generic error in Agent.
- Vercel logs: OpenAI 401 / 403 / `Incorrect API key`.
- `generations.status = failed` with error message mentioning provider.

### Checks

1. Vercel → Environment Variables → `OPENAI_API_KEY` exists on **Production**.
2. Key active in OpenAI dashboard; billing funded.
3. Redeploy after any env change.

### Fix

1. Replace `OPENAI_API_KEY` with valid key in Vercel.
2. Trigger **Redeploy** (production).
3. Run one test generation (`PRODUCTION_QA.md` §3).

### Credits

Failed jobs should refund via existing refund RPC on failure paths — verify `credit_transactions` for `refund` if user reports double charge.

---

## 2. Stripe checkout — price missing or invalid

### Symptoms

- Clicking Buy Starter/Professional/Ultimate shows error toast.
- API log: missing price ID or Stripe `No such price`.

### Checks

1. Env vars set and non-empty:
   - `STRIPE_PRICE_STARTER`
   - `STRIPE_PRICE_PROFESSIONAL`
   - `STRIPE_PRICE_ULTIMATE`
2. Price IDs match **same Stripe mode** as `STRIPE_SECRET_KEY` (test vs live).
3. `STRIPE_SECRET_KEY` valid.

### Fix

1. Copy correct Price IDs from Stripe Dashboard → Products.
2. Update Vercel env → redeploy.
3. Test checkout in matching mode (test card vs live).

---

## 3. Webhook — credits not added after payment

### Symptoms

- Stripe payment succeeds; user returns to dashboard; balance unchanged.
- Stripe Dashboard → Webhooks shows failed deliveries.

### Checks

1. Webhook endpoint URL: `https://<production-domain>/api/stripe/webhook`
2. `STRIPE_WEBHOOK_SECRET` matches endpoint signing secret in Stripe.
3. Vercel function logs for webhook route (500 errors).
4. Supabase: `credit_transactions` for new `purchase` rows.

### Fix

1. Re-send failed events from Stripe Dashboard (webhook → event → resend).
2. Align `STRIPE_WEBHOOK_SECRET` → redeploy.
3. Manual credit grant (last resort, service role):

```sql
-- EXAMPLE ONLY — adjust user_id and amount; run in Supabase SQL Editor
-- Verify user UUID first
select id, email from auth.users where email = '<user@example.com>';

-- Inspect balance
select credits from user_credits where user_id = '<user-uuid>';

-- Manual adjustment should use your app's RPC if available; otherwise escalate to engineering
```

Prefer fixing webhook over manual SQL.

---

## 4. `image_url` null on completed generation

### Symptoms

- Job shows **completed** but no image in Agent or Gallery.
- DB: `generations.image_url` is null.

### Checks

1. Worker logs for storage upload failure.
2. Supabase Storage bucket exists and policy allows service role upload.
3. OpenAI returned valid image bytes (worker error before upload).

### Fix

1. See **§9 Storage bucket** below.
2. Mark broken row failed if needed (see **§10 SQL**).
3. User can regenerate from gallery.

---

## 5. Gallery shows broken image

### Symptoms

- Thumbnail broken; “Image could not load” or empty card.
- `image_url` present but 403/404 in browser.

### Checks

1. Open **Open image directly** link — does URL load?
2. Bucket public vs signed URL policy.
3. CORS / hotlink blocking (rare).

### Fix

1. Fix storage public access or URL generation in worker (engineering).
2. If URL expired (signed URLs): may need regeneration.
3. Delete orphan failed assets for user clarity.

---

## 6. Credits not decreasing on generation

### Symptoms

- Images complete but balance unchanged.
- Or balance goes negative / RPC errors in logs.

### Checks

1. `/api/generate` calls `consume_user_credits` RPC.
2. Supabase logs for RPC failures.
3. `user_credits` row exists for user.

### Fix

1. Repair RPC / DB constraint (engineering + Supabase).
2. Do not hand-edit credits without audit trail — use `credit_transactions` pattern.

---

## 7. Worker not processing (stuck in Processing)

### Symptoms

- Agent stuck on Processing indefinitely.
- DB: `generations.status = processing` for >10 minutes.

### Checks

1. `GENERATION_WORKER_SECRET` matches between generate route and process route.
2. Vercel logs: worker trigger 401/500.
3. Cron `/api/cron/process-generations` if used as backup (project-specific).

### Fix

1. Align worker secret → redeploy.
2. Manually POST to process endpoint (engineering only, with secret header) OR re-trigger from admin tooling.
3. Fail stale jobs (SQL §10) and refund credits.

---

## 8. Vercel env changed but not redeployed

### Symptoms

- “Fixed” key in dashboard but behavior unchanged.
- Old errors persist.

### Fix

```bash
# From project root, with Vercel CLI authenticated
npx vercel --prod
```

Or Vercel Dashboard → Deployments → Redeploy production.

**Rule:** Any Production env change requires a new deployment.

---

## 9. Supabase Storage bucket not public (or wrong bucket)

### Symptoms

- Upload succeeds in logs but browser cannot load `image_url`.
- 403 on storage URL.

### Checks

1. Supabase → Storage → bucket used by worker (confirm name in code).
2. Policies: public read for generated assets **or** app uses signed URLs correctly.
3. Service role can `insert` on upload path.

### Fix

1. Adjust bucket policies per security review (engineering).
2. Re-upload not automatic — user regenerates images.

---

## 10. Failed generations — cleanup SQL

### Active generation limit

The API enforces a maximum of **2 parallel `processing` jobs** per user (`ACTIVE_GENERATION_LIMIT = 2` in `app/api/generate/route.ts`).

| HTTP | `reason` | Credits debited? | User action |
|------|----------|------------------|-------------|
| **429** | `active_generation_limit` | **No** — check runs before `consume_user_credits` | Wait for an in-flight job to complete or fail |

Completed and failed generations do not count toward the limit.

Verify active jobs for a user:

```sql
select id, status, workflow, created_at, started_at
from generations
where user_id = '<user-uuid>'
  and status = 'processing'
order by created_at desc;
```

Run in **Supabase SQL Editor** only after understanding impact. Prefer refunds via application RPC when possible.

### List stuck processing jobs (older than 30 minutes)

```sql
select id, user_id, status, created_at, started_at, error_message
from generations
where status = 'processing'
  and created_at < now() - interval '30 minutes'
order by created_at desc
limit 50;
```

### Mark stuck jobs as failed (manual)

```sql
-- Review IDs from query above first
update generations
set
  status = 'failed',
  error_message = 'Timed out — marked failed during operations cleanup',
  completed_at = now()
where id in (
  '<generation-uuid-1>',
  '<generation-uuid-2>'
)
  and status = 'processing';
```

### List recent failures for a user

```sql
select id, status, error_message, credits_used, created_at
from generations
where user_id = '<user-uuid>'
order by created_at desc
limit 20;
```

### Refund note

Credit refunds should go through `refund_user_credits` RPC + `credit_transactions` for audit. If bulk cleanup is needed, coordinate with engineering — do not only UPDATE `user_credits` without transaction log.

The generation worker (`app/api/generate/process/route.ts`) refunds idempotently:

1. Only processes rows with `status = 'processing'`.
2. Atomically sets `status = 'failed'`, `credits_used = 0`, `error_message`, and `failed_at` with `.eq('status', 'processing')`.
3. Refunds only when the update claims the row (no second refund if the worker retries).
4. Skips refund when `credits_used` is already `0`.
5. Logs a `credit_transactions` row with `type = 'refund'` and `source = 'generation_worker_failure'`.

### Verify a failed generation and refund (single job)

Replace `<generation-uuid>` and `<user-uuid>`:

```sql
-- Generation row
select id, status, error_message, credits_used, failed_at, created_at
from generations
where id = '<generation-uuid>';

-- Expect: status = failed, credits_used = 0, error_message set, failed_at not null

-- Refund transaction (at most one per worker failure)
select id, user_id, amount, type, source, created_at
from credit_transactions
where user_id = '<user-uuid>'
  and type = 'refund'
  and source = 'generation_worker_failure'
order by created_at desc
limit 10;

-- Current balance
select user_id, credits
from user_credits
where user_id = '<user-uuid>';
```

### Detect duplicate refunds (should return zero rows)

```sql
select user_id, count(*) as refund_count, sum(amount) as total_refunded
from credit_transactions
where type = 'refund'
  and source = 'generation_worker_failure'
  and created_at > now() - interval '7 days'
group by user_id, date_trunc('minute', created_at), amount
having count(*) > 1;
```

If duplicates appear, stop manual refunds and inspect Vercel worker logs for repeated `POST /api/generate/process` on the same `generationId`.

---

## 10b. Lip Sync Studio (Beta)

| Item | Value |
|------|--------|
| Flags | `ENABLE_FAL_LIP_SYNC`, `NEXT_PUBLIC_ENABLE_FAL_LIP_SYNC` |
| Credits | 30 per job |
| Upload API | `POST /api/lip-sync/upload` (`type=source` \| `audio`) |
| Generate | `imageMode: lip_sync`, `sourceMediaUrl`, `audioUrl`, `sourceMediaType` |
| Worker | `workflow === lip_sync` → fal image (`fal-ai/ai-avatar`) or video (`fal-ai/sync-lipsync/v2/pro`) |
| Output | `generations.video_url` |
| Refund | Same idempotent `markFailedAndRefund` as other modes |

**Enable checklist:** run `LIP_SYNC_REQUIRED_SQL.md` + `LIP_SYNC_STORAGE_SQL.md`, set flags on Vercel, redeploy, run `PRODUCTION_QA.md` §15.

**Planned-only modules (no ops action):** Cinema Agent, Omni Campaign Agent, Social Planner, Brand Safety — UI roadmap chips only.

---

## 11. Standard operating procedures

### Deploy production

1. `git pull` / merge to `main`
2. `npm run build` locally — must pass
3. `npx vercel --prod`
4. Run `PRODUCTION_QA.md` smoke (§1–§4 minimum)
5. Monitor Vercel logs 15 minutes

### Rollback

1. Vercel → Deployments → previous stable deployment → **Promote to Production**
2. Do not revert env vars separately without matching deployment
3. Announce if user-facing regression occurred

### Communicate incident

- User-facing: brief status (no internal provider names unless necessary)
- Internal: root cause, fix, prevention in GitHub issue

---

## 12. Escalation matrix

| Area | First check | Escalate when |
|------|-------------|---------------|
| Auth / login | Supabase Auth status | Widespread 401 |
| Payments | Stripe status + webhook | All checkouts fail |
| Images | OpenAI status + key | All gens fail >15 min |
| Storage | Supabase status | All URLs 403 |
| Frontend | Vercel deployment | Site 5xx |

---

## Related documentation

| Doc | Use |
|-----|-----|
| `ENVIRONMENT_VARIABLES.md` | Config reference |
| `PRODUCTION_QA.md` | Verification script |
| `LAUNCH_CHECKLIST.md` | Launch gates |
| `ROADMAP_IMAGE_VIDEO_MODES.md` | Future modes (internal) |
