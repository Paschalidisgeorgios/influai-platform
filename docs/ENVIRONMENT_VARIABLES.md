# InfluExAi — Environment Variables

**Purpose:** Reference for required configuration in local `.env.local` and Vercel Production.  
**Security:** Never commit real secrets. Never paste live keys into tickets or this file.

Use placeholders below when sharing examples:

```
<your-value-here>
```

---

## Quick reference

| Variable | Required | Client-exposed | Used for |
|----------|----------|----------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes | Browser auth + RLS client |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | **No** | API routes, worker, webhooks |
| `OPENAI_API_KEY` | Yes | **No** | Standard image generation |
| `GENERATION_WORKER_SECRET` | Yes | **No** | Worker route authentication |
| `STRIPE_SECRET_KEY` | Yes | **No** | Checkout + webhook |
| `STRIPE_WEBHOOK_SECRET` | Yes | **No** | Stripe webhook signature |
| `STRIPE_PRICE_STARTER` | Yes | **No** | Stripe Price ID — Starter |
| `STRIPE_PRICE_PROFESSIONAL` | Yes | **No** | Stripe Price ID — Professional |
| `STRIPE_PRICE_ULTIMATE` | Yes | **No** | Stripe Price ID — Ultimate |
| `NEXT_PUBLIC_APP_URL` | Yes | Yes | Absolute URLs (checkout return, worker) |

---

## Supabase

### `NEXT_PUBLIC_SUPABASE_URL`

- **Example:** `https://<project-ref>.supabase.co`
- **Where:** Supabase Dashboard → Project Settings → API
- **Notes:** Must match the project used for Auth, DB, and Storage.

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.<redacted>`
- **Where:** Supabase Dashboard → Project Settings → API → `anon` `public`
- **Notes:** Safe for browser with RLS enabled. Rotate if leaked.

### `SUPABASE_SERVICE_ROLE_KEY`

- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.<redacted>`
- **Where:** Supabase Dashboard → Project Settings → API → `service_role`
- **Notes:** **Server only.** Bypasses RLS — never expose to client or `NEXT_PUBLIC_*`.

---

## OpenAI

### `OPENAI_API_KEY`

- **Example:** `sk-proj-<redacted>`
- **Where:** OpenAI Platform → API keys
- **Notes:** Powers Standard Image (`gpt-image-1`) via generate worker. Invalid key → generations fail.

---

## Generation worker

### `GENERATION_WORKER_SECRET`

- **Example:** `<long-random-string-min-32-chars>`
- **Where:** Generate locally; set identical value in Vercel and local `.env.local`
- **Notes:** Must match header `x-worker-secret` when `/api/generate` triggers `/api/generate/process`. Mismatch → jobs stuck in `processing`.

---

## Stripe

### `STRIPE_SECRET_KEY`

- **Example:** `sk_live_<redacted>` or `sk_test_<redacted>`
- **Where:** Stripe Dashboard → Developers → API keys
- **Notes:** Use test keys in preview; live keys only in production.

### `STRIPE_WEBHOOK_SECRET`

- **Example:** `whsec_<redacted>`
- **Where:** Stripe Dashboard → Developers → Webhooks → endpoint signing secret
- **Notes:** Endpoint must point to production `/api/stripe/webhook`. Wrong secret → credits not granted after payment.

### `STRIPE_PRICE_STARTER`

- **Example:** `price_<redacted>`
- **Where:** Stripe Dashboard → Products → Starter → Price ID
- **Expected credits (app logic):** 100 per successful checkout

### `STRIPE_PRICE_PROFESSIONAL`

- **Example:** `price_<redacted>`
- **Expected credits:** 500

### `STRIPE_PRICE_ULTIMATE`

- **Example:** `price_<redacted>`
- **Expected credits:** 2000

**Package keys (code, not env):** `starter`, `professional`, `ultimate` — do not rename without code + webhook update.

---

## Application URL

### `NEXT_PUBLIC_APP_URL`

- **Example (production):** `https://influai-platform.vercel.app`
- **Example (local):** `http://localhost:3000`
- **Notes:** Used for Stripe success/cancel URLs and worker callback origin. Trailing slash optional; prefer no trailing slash.

---

## Local setup

1. Copy template to `.env.local` in project root (file is gitignored).
2. Fill all required variables above.
3. Restart `npm run dev` after changes.

```env
# Example template — replace placeholders, do not commit

NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

OPENAI_API_KEY=sk-proj-<redacted>
GENERATION_WORKER_SECRET=<random-secret>

STRIPE_SECRET_KEY=sk_test_<redacted>
STRIPE_WEBHOOK_SECRET=whsec_<redacted>
STRIPE_PRICE_STARTER=price_<redacted>
STRIPE_PRICE_PROFESSIONAL=price_<redacted>
STRIPE_PRICE_ULTIMATE=price_<redacted>

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Vercel production

1. Project → **Settings** → **Environment Variables**
2. Add each variable for **Production** (and Preview if desired).
3. **Redeploy** after changing env vars — runtime does not pick up new values until redeploy.
4. Confirm `NEXT_PUBLIC_*` variables exist for Production build.

---

## Rotation checklist

| Secret | Rotate when | After rotation |
|--------|-------------|----------------|
| `OPENAI_API_KEY` | Leak / quota abuse | Redeploy Vercel |
| `SUPABASE_SERVICE_ROLE_KEY` | Leak | Redeploy; update Supabase if needed |
| `GENERATION_WORKER_SECRET` | Leak | Update Vercel + redeploy; in-flight jobs may need manual retry |
| `STRIPE_*` | Compromise | Update Stripe dashboard + Vercel + redeploy |
| `STRIPE_WEBHOOK_SECRET` | New webhook endpoint | Update Stripe webhook + Vercel |

---

## Variables not in MVP checklist (legacy / optional)

These may exist in older routes but are **not** part of the launch MVP env checklist:

- `REPLICATE_API_TOKEN` — legacy image paths
- `FAL_KEY` — character training (disabled in MVP)
- `NEXT_PUBLIC_STRIPE_PRICE_ID_*` — alternate naming in some components; canonical checkout uses `STRIPE_PRICE_*`

If build/runtime errors mention missing vars, grep the codebase before adding to Vercel.

---

## Related docs

- `LAUNCH_CHECKLIST.md` — pre-launch verification
- `PRODUCTION_QA.md` — manual test script
- `OPERATIONS_RUNBOOK.md` — incident response
- `ROADMAP_IMAGE_VIDEO_MODES.md` — future providers (internal)
