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
| `FAL_KEY` | Yes (for video/lip sync) | **No** | fal.ai Video Studio and Lip Sync |
| `ELEVENLABS_API_KEY` | Optional (required for System Voice) | **No** | ElevenLabs text-to-speech for Lip Sync |
| `ENABLE_ELEVENLABS_TTS` | Optional | **No** | Server gate for System Voice mode |
| `NEXT_PUBLIC_ENABLE_ELEVENLABS_TTS` | Optional | Yes | Client gate for System Voice mode |
| `ENABLE_TALKING_CREATOR` | Optional | **No** | Server gate for Talking Creator workflow |
| `NEXT_PUBLIC_ENABLE_TALKING_CREATOR` | Optional | Yes | Client gate for Talking Creator tab |
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

## fal.ai

### `FAL_KEY`

- **Where:** fal.ai dashboard credentials
- **Notes:** Required for `video_image_to_video` and `lip_sync` worker workflows.

---

## ElevenLabs (Lip Sync System Voice)

### `ELEVENLABS_API_KEY`

- **Where:** ElevenLabs dashboard API keys
- **Notes:** Required when `lipSyncInputMode = system_voice`.

### Voice ID env variables (account-specific)

Named ElevenLabs voices (Lip Sync voice library):

- `ELEVENLABS_VOICE_ROGER`
- `ELEVENLABS_VOICE_SARAH`
- `ELEVENLABS_VOICE_LAURA`
- `ELEVENLABS_VOICE_CHARLIE`
- `ELEVENLABS_VOICE_GEORGE`
- `ELEVENLABS_VOICE_CALLUM`
- `ELEVENLABS_VOICE_RIVER`
- `ELEVENLABS_VOICE_HARRY`
- `ELEVENLABS_VOICE_LIAM`
- `ELEVENLABS_VOICE_ALICE`
- `ELEVENLABS_VOICE_MATILDA`
- `ELEVENLABS_VOICE_WILL`
- `ELEVENLABS_VOICE_JESSICA`
- `ELEVENLABS_VOICE_ERIC`
- `ELEVENLABS_VOICE_BELLA`
- `ELEVENLABS_VOICE_CHRIS`
- `ELEVENLABS_VOICE_BRIAN`
- `ELEVENLABS_VOICE_DANIEL`
- `ELEVENLABS_VOICE_LILY`
- `ELEVENLABS_VOICE_ADAM`
- `ELEVENLABS_VOICE_BILL`

Category / style presets (legacy aliases, still supported):

- `ELEVENLABS_VOICE_FEMALE_NATURAL`
- `ELEVENLABS_VOICE_FEMALE_SOFT`
- `ELEVENLABS_VOICE_FEMALE_ENERGETIC`
- `ELEVENLABS_VOICE_FEMALE_PREMIUM`
- `ELEVENLABS_VOICE_MALE_NATURAL`
- `ELEVENLABS_VOICE_MALE_DEEP`
- `ELEVENLABS_VOICE_MALE_STORYTELLING`
- `ELEVENLABS_VOICE_MALE_ENERGETIC`

### `NEXT_PUBLIC_ELEVENLABS_CONFIGURED_VOICE_KEYS` (optional)

- **Example:** `sarah,laura,liam,brian,matilda,george,female_natural`
- **Notes:** Comma-separated `voiceKey` values that are enabled in the Lip Sync UI. When set, voices not listed show as disabled (“Not configured yet”). Server-side validation still uses the `ELEVENLABS_VOICE_*` IDs above.

Voice IDs are account-dependent and must be set in Vercel per environment.
If a selected voice key has no configured voice ID, the worker fails with refund and
`Selected system voice is not configured.` Upload Audio mode stays available as fallback.

### Local voice previews (no API cost)

Place optional preview MP3 files under `public/audio/voices/` (e.g. `public/audio/voices/sarah.mp3`).
The dashboard plays these files for “Listen” — no ElevenLabs API call and no credits.
Missing files show “Preview not available yet.” in the UI.

---

## Krea AI (provider migration)

### `KREA_API_KEY`

- **Where:** Krea → Settings → API tokens
- **Notes:** Server only. Powers `POST /api/krea/image/generate` and `GET /api/providers/krea/health`.

### `ENABLE_KREA_PROVIDER` / `NEXT_PUBLIC_ENABLE_KREA_PROVIDER`

- **Notes:** Gate server/client for Krea POC. Missing key at runtime → clear API error; build does not crash.

### Optional

- `KREA_API_BASE_URL` (default `https://api.krea.ai`)
- `KREA_IMAGE_MODEL_PATH` (default `bfl/flux-1-dev`)

See `docs/provider-migration-plan.md`.

---

## Creatify AI (provider migration)

### `CREATIFY_API_ID` and `CREATIFY_API_KEY`

- **Where:** Creatify dashboard API credentials
- **Notes:** Both required (`X-API-ID` + `X-API-KEY`). Server only.

### `ENABLE_CREATIFY_PROVIDER` / `NEXT_PUBLIC_ENABLE_CREATIFY_PROVIDER`

- **Notes:** Gate Creatify POC routes.

### Optional

- `CREATIFY_API_BASE_URL` (default `https://api.creatify.ai`)
- `CREATIFY_AD_VIDEO_MODEL` — confirm via `GET /api/asset_generator/schemas/`

POC routes: `POST /api/creatify/ad-video/generate`, `GET /api/creatify/ad-video/status`.

---

## Talking Creator flags

### `ENABLE_TALKING_CREATOR`

- **Where:** Server environment (`.env.local`, Vercel)
- **Notes:** Enables server-side Talking Creator processing.

### `NEXT_PUBLIC_ENABLE_TALKING_CREATOR`

- **Where:** Client environment (`.env.local`, Vercel)
- **Notes:** Enables Talking Creator tab in AI Agent.

---

## Generation worker

### `GENERATION_WORKER_SECRET`

- **Example:** `<long-random-string-min-32-chars>`
- **Where:** Generate locally; set identical value in Vercel and local `.env.local`
- **Notes:** Must match header `x-worker-secret` when `/api/generate` triggers `/api/generate/process`. Mismatch → jobs stuck in `processing`.

### Required storage buckets

- `reference-sources`
- `lip-sync-audio`
- `generation-videos`

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
- `FAL_KEY` — required for Video Studio + Lip Sync (keep server-only)
- `NEXT_PUBLIC_STRIPE_PRICE_ID_*` — alternate naming in some components; canonical checkout uses `STRIPE_PRICE_*`

If build/runtime errors mention missing vars, grep the codebase before adding to Vercel.

---

## Related docs

- `LAUNCH_CHECKLIST.md` — pre-launch verification
- `PRODUCTION_QA.md` — manual test script
- `OPERATIONS_RUNBOOK.md` — incident response
- `ROADMAP_IMAGE_VIDEO_MODES.md` — future providers (internal)
