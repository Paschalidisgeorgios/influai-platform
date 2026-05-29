# InfluExAi — Provider Migration Plan (Krea AI + Creatify AI)

**Status:** Planning + POC foundation (OpenAI / fal.ai / ElevenLabs remain active).  
**Last updated:** 2026-05-28  
**Do not remove legacy providers until each row is verified in staging/production.**

---

## Phase 1 — Existing provider audit

### Infrastructure (keep)

| Area | Location | Notes |
|------|----------|--------|
| Auth | Supabase Auth | Unchanged |
| DB | `generations`, `credit_transactions`, RPCs | Unchanged |
| Storage | `generations`, `generation-videos`, `lip-sync-audio`, `lip-sync-sources` | Unchanged |
| Credits | `consume_user_credits`, `refund_user_credits` | Unchanged |
| Stripe | `app/api/stripe/*` | Unchanged |
| Gallery | `app/dashboard/GenerationGallery.tsx` | Uses `image_url` / `video_url` generically |
| Worker queue | `app/api/generate/route.ts` → `app/api/generate/process/route.ts` | Legacy path |

### Legacy generation entry points

| Provider | Primary files |
|----------|----------------|
| **OpenAI** | `app/api/generate/process/route.ts` (`openai.images.generate`, `gpt-image-1`) |
| **fal.ai** | `app/api/generate/process/route.ts` (`@fal-ai/client`, flux/kling/lip sync/nano-banana) |
| **ElevenLabs** | `app/api/generate/process/route.ts` (`synthesizeElevenLabsAudio`), `lib/lip-sync/elevenlabs-voices.ts` |
| **Queue** | `app/api/generate/route.ts` |
| **Uploads** | `app/api/lip-sync/upload/route.ts`, `app/api/lip-sync/audio-upload/route.ts` |
| **Prompt enhance** | `app/api/enhance-prompt/route.ts` |
| **Replicate (legacy)** | `app/lib/replicate.ts` (not main path) |

### Current workflows (as implemented)

| # | Workflow key | Provider | Model (stored) | Credits | Queue route | Worker |
|---|--------------|----------|----------------|---------|-------------|--------|
| 1 | `standard` | openai | `gpt-image-1` | 1 | `/api/generate` | Yes |
| 2 | `fast_draft` | fal | `fal-ai/flux/schnell` | 1 | `/api/generate` | Yes |
| 3 | `ugc_look` | openai | `gpt-image-1` | 2 | `/api/generate` | Yes |
| 4 | `premium_image` | fal | `fal-ai/flux/dev` | 3 | `/api/generate` | Yes |
| 5 | `brand_assets` | fal | `fal-ai/flux/dev` | 4 | `/api/generate` | Yes |
| 6 | `reference_edit` | fal | `fal-ai/nano-banana-pro/edit` | 5 | `/api/generate` | Yes |
| 7 | `video_image_to_video` | fal | `fal-ai/kling-video/v2.1/standard/image-to-video` | 25 | `/api/generate` | Yes |
| 8 | `lip_sync` | fal | `fal-ai/sync-lipsync/v2/pro` | 30 / 35 | `/api/generate` | Yes (+ ElevenLabs TTS) |
| 9 | `talking_creator` | fal | `talking_creator_pipeline` | 60 | `/api/generate` | Yes (+ ElevenLabs) |
| 10 | `creator_video` | fal | `creator_video_pipeline` | 40 | `/api/generate` | Yes |

**Note:** User docs mentioned `fal-ai/recraft/v4.1/text-to-image` for brand assets; code uses **FLUX Dev** (`fal-ai/flux/dev`) after Recraft 422 issues — do not revert without testing.

### Feature flags (legacy)

See `.env.example` — all `ENABLE_FAL_*`, `ENABLE_ELEVENLABS_TTS`, `ENABLE_UGC_LOOK`, etc.

---

## Phase 2 — Migration matrix

Legend:

- **replace_with_krea** — target Krea API after POC + QA  
- **replace_with_creatify** — target Creatify API after POC + QA  
- **keep_existing_for_now** — no swap until verified replacement  
- **remove_after_verified** — delete legacy only after new path ships  
- **needs_manual_api_confirmation** — check Krea/Creatify docs + account access  

| Workflow | Current | Classification | Proposed provider | Proposed workflow | Credits (keep) | Risk | Inputs | Output | Gallery | Credits system |
|----------|---------|----------------|-------------------|-------------------|----------------|------|--------|--------|---------|----------------|
| standard | openai / gpt-image-1 | replace_with_krea | krea | `krea_standard_image` | 1 | Med | prompt, format | image_url | Yes | Yes |
| fast_draft | fal / flux schnell | replace_with_krea | krea | `krea_fast_draft` | 1 | Low | prompt | image_url | Yes | Yes |
| ugc_look | openai / gpt-image-1 | replace_with_krea | krea | `krea_ugc_look` | 2 | Med | prompt + UGC prompt blocks | image_url | Yes | Yes |
| premium_image | fal / flux dev | replace_with_krea | krea | `krea_premium_image` | 3 | Low | prompt, size | image_url | Yes | Yes |
| brand_assets | fal / flux dev | replace_with_krea | krea | `krea_brand_assets` | 4 | Med | prompt, brand prompts | image_url | Yes | Yes |
| reference_edit | fal / nano-banana edit | replace_with_krea | krea | `krea_reference_edit` | 5 | High | source image + instruction | image_url | Yes | Yes |
| video_image_to_video | fal / kling i2v | replace_with_krea **or** creatify | krea or creatify | `krea_image_to_video` / `creatify_video_ad` | 25 | High | image + motion prompt | video_url | Yes | Yes |
| lip_sync | fal lipsync + ElevenLabs | keep_existing_for_now | fal (+ ElevenLabs) | `lip_sync` | 30/35 | High | video + audio/script | video_url | Yes | Yes |
| talking_creator | fal + ElevenLabs | replace_with_creatify | creatify | `creatify_avatar_video` | 60 | High | image + script + voice | video_url | Yes | Yes |
| creator_video | fal pipeline | replace_with_creatify | creatify | `creatify_creator_video` | 40 | High | image + prompt | video_url | Yes | Yes |
| **POC** krea_premium_image | — | replace_with_krea | krea | `krea_premium_image` | 3 | Low | prompt | image_url | Yes | Yes |
| **POC** creatify_ad_video | — | replace_with_creatify | creatify | `creatify_ad_video` | 40 | Med | prompt | video_url | Yes | Yes |

### Capability fit (high level)

**Krea AI API** ([docs](https://docs.krea.ai/)) — likely covers:

- Text-to-image (async jobs, poll `/jobs/{id}`)
- Multiple image models (Flux, Imagen, etc.)
- Image editing / img2img (confirm model paths per account)
- Upscale / enhance (confirm endpoints)
- Video generation (model-specific; confirm lip-sync availability)

**Creatify AI API** ([docs](https://docs.creatify.ai/)) — likely covers:

- Asset Generator (`POST /api/asset_generator/`, poll `GET /api/asset_generator/{id}/`)
- Product / URL-to-video, UGC-style ads, avatar videos (separate endpoints)
- Marketing video automation (templates, product-to-video)
- Voice/avatar pipelines may reduce ElevenLabs dependency **only after** voice parity testing

### Keep until verified

| Capability | Why keep legacy |
|------------|-----------------|
| **Lip Sync** (`fal-ai/sync-lipsync/v2/pro`) | No confirmed Krea/Creatify drop-in; ElevenLabs TTS for system voice |
| **ElevenLabs TTS** | 21-voice library + env mapping; Creatify voices differ |
| **Reference Edit** | Needs Krea edit/img2img parity with nano-banana |
| **Video Studio (Kling i2v)** | Needs Krea video or Creatify asset generator QA |
| **OpenAI Standard/UGC** | Keep until Krea quality + unit economics verified |
| **Worker architecture** | New providers can plug into worker later; POC routes are synchronous/parallel |

---

## Phase 3 — Environment variables

### Server-only (never `NEXT_PUBLIC_`)

```env
KREA_API_KEY=
KREA_API_BASE_URL=https://api.krea.ai
KREA_IMAGE_MODEL_PATH=bfl/flux-1-dev

CREATIFY_API_ID=
CREATIFY_API_KEY=
CREATIFY_API_BASE_URL=https://api.creatify.ai
CREATIFY_AD_VIDEO_MODEL=kling-video/v1.6/image-to-video
```

Creatify uses **X-API-ID** + **X-API-KEY** headers — both required.

### Feature flags

```env
ENABLE_KREA_PROVIDER=false
NEXT_PUBLIC_ENABLE_KREA_PROVIDER=false

ENABLE_CREATIFY_PROVIDER=false
NEXT_PUBLIC_ENABLE_CREATIFY_PROVIDER=false
```

Missing keys at **runtime** → clear JSON error from POC routes; **build must not crash** (no module-level client init).

---

## Phase 4 — Provider abstraction (added)

```
lib/providers/
  provider-types.ts   # normalized result types
  flags.ts            # ENABLE_* checks
  krea.ts             # create + poll Krea jobs
  creatify.ts         # create + poll Creatify jobs
  legacy.ts           # pointers to existing routes
  index.ts
lib/generation/
  poc-shared.ts       # refund, storage upload, complete/fail helpers
```

Legacy routes **not modified** except new isolated POC APIs.

---

## Phase 5 — Krea POC

**Route:** `POST /api/krea/image/generate`  
**Workflow:** `krea_premium_image`  
**Credits:** 3  

Flow: auth → flag → deduct credits → insert `generations` → Krea job → poll → download → `generations` bucket → mark completed.

**Frontend:** Not wired to Image Studio yet — call via API client or future flag in studio. Use `NEXT_PUBLIC_ENABLE_KREA_PROVIDER` when UI is added.

---

## Phase 6 — Creatify POC

**Routes:**

- `POST /api/creatify/ad-video/generate` — queue job, store `provider_job_id`, return `queued: true`
- `GET /api/creatify/ad-video/status?generationId=` — poll Creatify, set `video_url`, refund on failure

**Workflow:** `creatify_ad_video`  
**Credits:** 40  

**Important:** Confirm `CREATIFY_AD_VIDEO_MODEL` and `input_params` via `GET /api/asset_generator/schemas/` for your account before production.

---

## Phase 7 — Do not delete (checklist)

- [ ] `app/api/generate/route.ts`
- [ ] `app/api/generate/process/route.ts`
- [ ] `lib/lip-sync/*`
- [ ] ElevenLabs env voice IDs
- [ ] fal lip sync / kling / flux paths
- [ ] OpenAI image path
- [ ] DB columns (`provider`, `model`, `workflow`, `provider_job_id`, …)
- [ ] Storage buckets

---

## Phase 8 — UI strategy (future)

User-facing modes (internal `workflow` stays explicit):

| User-facing | Internal examples |
|-------------|-------------------|
| Campaign Visuals | krea_standard_image, krea_premium_image |
| Product Ads | creatify_ad_video |
| Creator Ads | creatify_creator_video |
| Video Ads | krea_image_to_video |
| Image Edit | krea_reference_edit |
| Lip Sync | lip_sync (legacy until replaced) |

Hide legacy provider names in UI; show only when `ENABLE_*` flags enable new modes.

---

## Phase 9 — Safety

Unchanged: Supabase Auth/DB/Storage, Stripe, credits RPCs, Gallery schema, i18n, domain config.

Replace generation **provider calls** only after:

1. Staging POC pass  
2. Credit cost validation  
3. Output quality sign-off  
4. Refund path tested  
5. Gallery smoke test  

---

## Phase 10 — Next recommended step

1. Set `KREA_API_KEY`, `ENABLE_KREA_PROVIDER=true` in `.env.local`.  
2. `POST /api/krea/image/generate` with Bearer token — confirm Gallery shows image.  
3. Set Creatify `CREATIFY_API_ID`, `CREATIFY_API_KEY`, flags.  
4. Run `GET /api/asset_generator/schemas/` — set `CREATIFY_AD_VIDEO_MODEL` + `input_params`.  
5. Wire **one** Krea mode into Image Studio behind `NEXT_PUBLIC_ENABLE_KREA_PROVIDER`.  
6. Add `krea_premium_image` branch to worker (optional) to avoid long HTTP request in serverless.  
7. Only then migrate `premium_image` / `fast_draft` off fal in `resolveGenerationJobConfig`.

---

## Risks before removing old providers

| Risk | Mitigation |
|------|------------|
| Krea/Creatify async timeouts on Vercel | Move polling to worker or cron |
| Creatify schema drift | Discover schemas per env; version input_params |
| Lip sync no replacement | Keep fal + ElevenLabs until API confirmed |
| Credit unit cost mismatch | Compare Krea CU vs Creatify credits vs current pricing |
| Gallery labels for new workflows | Add i18n badges when modes go public |
| Dual provider maintenance | Feature flags per workflow, not big-bang cutover |
