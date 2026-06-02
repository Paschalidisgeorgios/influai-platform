# Provider & Tool Readiness Report

Last updated: 2026-05-31  
Generated from: `app/lib/config/env.ts`, `app/lib/tools/tool-activation.ts`, `app/lib/engines/fal-catalog.ts`

This report documents **which creator tools can go live today** and exact blockers. No secret values are included.

---

## MVP platform env (local audit)

Audit method: presence-only check of `.env.local` key names (values never read or printed).

| Variable | Status |
|----------|--------|
| `NEXT_PUBLIC_APP_URL` | present |
| `NEXT_PUBLIC_SUPABASE_URL` | present |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | present |
| `SUPABASE_SERVICE_ROLE_KEY` | present |
| `STRIPE_SECRET_KEY` | present |
| `STRIPE_WEBHOOK_SECRET` | present |
| `STRIPE_PRICE_STARTER` | present |
| `STRIPE_PRICE_PROFESSIONAL` | **missing** |
| `STRIPE_PRICE_ULTIMATE` | **missing** |
| `FAL_KEY` | present |
| `KREA_API_KEY` | present |
| `GENERATION_WORKER_SECRET` | present |
| `OPENAI_API_KEY` | present (optional — Prompt Assist enhancement) |
| `ELEVENLABS_API_KEY` | **missing** (optional until LipSync system voice) |
| `INTERNAL_VALIDATION_SECRET` | present |
| `ADMIN_EMAILS` | present |
| `ENABLE_FAL_PROVIDER` | present |
| `ENABLE_KREA_PROVIDER` | present |

**Platform note:** Missing Stripe price IDs block Professional/Ultimate checkout tiers only — **generation tools are not blocked**.

---

## Provider summary

| Provider | Env | Enabled | MVP engines validated |
|----------|-----|---------|------------------------|
| **Krea** | `KREA_API_KEY` | Yes (local) | `smart_auto_pilot`, `krea_flux_fast_draft`, `krea_flux_11_pro_ultra`, `krea_nano_realtime` — **passed** |
| **fal.ai** | `FAL_KEY` | Yes (local) | `fal_kling_v3_t2v` (text-to-video) — **passed** |
| **OpenAI** | `OPENAI_API_KEY` | Optional | Prompt Assist only; Creative Score uses rule-based path |
| **ElevenLabs** | `ELEVENLABS_API_KEY` | Not configured | Required only for LipSync system-voice (module off) |

---

## Tool readiness matrix

| Tool | Can activate | Env ready | Handler | Provider test | Blocker |
|------|:------------:|:---------:|:-------:|:-------------:|---------|
| **Create Image** | ✅ | ✅ | ✅ `/api/krea/image/generate` | Krea **passed** | — |
| **Create Motion Video** | ✅ | ✅ | ✅ `/api/engine/generate` | fal T2V **passed** | — |
| **Social Asset Pack** | ✅ | ✅ | ✅ preview + render routes | Krea + fal **passed** | — |
| **Use Reference Image** | ❌ | ✅ | ✅ upload + generate | fal ref edit **not_tested** | Engine `fal_reference_edit` not validated |
| **Edit Image** | ❌ | ✅ | ✅ `/api/engine/generate` | fal ref edit **not_tested** | Same + `enableReferenceEdit` module on but engine inactive |
| **Match Style** | ❌ | ✅ | ✅ `/api/engine/generate` | fal style **not_tested** | Engine `fal_style_transfer` not validated |
| **Enhance Asset** | ❌ | ✅ | ✅ `/api/engine/generate` | fal upscale **passed*** | `enableEnhancer: false` (*passed in legacy, not promoted) |
| **Background Remove** | ❌ | ✅ | ✅ `/api/engine/generate` | **not_tested** | `enableEnhancer: false` |
| **Upscale** | ❌ | ✅ | ✅ `/api/engine/generate` | fal upscale **passed*** | `enableEnhancer: false` |
| **Animate Image** | ❌ | ✅ | ✅ `/api/engine/generate` | fal i2v **blocked_balance** | `enableImageToVideo: false` + validation blocked |
| **LipSync Creator** | ❌ | ⚠️ | ✅ lip-sync + live-avatar routes | **not_tested** | `enableLipSync: false`; `ELEVENLABS_API_KEY` missing for system voice |
| **AI Avatar** | ❌ | ✅ | ✅ live-avatar routes | **not_tested** | `enableAvatar: false` |
| **Motion Transfer** | ❌ | ✅ | ✅ live-avatar routes | **failed** (422) | `enableMotionTransfer: false` + prior schema failure |
| **Train Creator Style** | ❌ | ✅ | ✅ train-lora + characters | **not_tested** | `enableTraining: false` |
| **Train Brand Kit** | ❌ | ✅ | ✅ train-lora + characters | **not_tested** | `enableTraining: false` |
| **Train Product Model** | ❌ | ✅ | ✅ train-lora + characters | **not_tested** | `enableTraining: false` |
| **Train Creator Identity** | ❌ | ✅ | ✅ characters train/upload | **not_tested** | `enableTraining: false` |
| **3D Object** | ❌ | ✅ | ✅ `/api/engine/generate` | **not_tested** | `enable3D: false` + no validated endpoint |
| **Audio Sound Design** | ❌ | ✅ | ✅ `/api/engine/generate` | **not_tested** | `enableAudio: false` + placeholder endpoint |

### Free / non-provider tools (also live)

| Tool | Can activate | Blocker |
|------|:------------:|---------|
| Improve Prompt | ✅ | — (OpenAI optional; passthrough fallback) |
| Creative Score | ✅ | — (rule-based; no OpenAI on API route) |
| Hooks & Captions | ✅ | — (local copy templates only) |
| Export Pack / Export Asset | ✅ | — |

---

## Activation checklist (per tool)

A tool is **`can activate: true`** only when:

1. ✅ Required env vars present (`getMvpEnvReadiness` + tool-specific keys)
2. ✅ Server handler route exists
3. ✅ Launch feature/module open (`app/lib/config/launch.ts`)
4. ✅ Provider engine `status: active` with validation passed
5. ✅ Supabase storage configured (when outputs go to Gallery)
6. ✅ Credit cost configured (`app/lib/billing/tool-credit-costs.ts`)

Runtime gate: `assertToolCanRun()` — non-live tools cannot charge credits or call providers.

---

## fal.ai engine validation detail

| Engine ID | Catalog status | Validation | Blocks tool |
|-----------|----------------|------------|-------------|
| `fal_kling_v3_t2v` | active | passed | — (Create Video, Pack video) |
| `fal_kling_v3_i2v` | validation_blocked_insufficient_balance | blocked | Animate Image |
| `fal_lipsync_sync_v2_pro` | mapped_but_unvalidated | not_tested | LipSync Creator |
| `fal_avatar_single_text` | mapped_but_unvalidated | not_tested | AI Avatar |
| `fal_motion_transfer` | mapped_but_unvalidated | failed (422) | Motion Transfer |
| `fal_background_removal` | mapped_but_unvalidated | not_tested | Background Remove |
| `fal_image_upscale` | mapped_but_unvalidated | passed (not promoted) | Enhance, Upscale |
| `fal_reference_edit` | mapped_but_unvalidated | not_tested | Reference, Edit |
| `fal_style_transfer` | mapped_but_unvalidated | not_tested | Match Style |
| `fal_lora_training` | mapped_but_unvalidated | not_tested | All training tools |
| `fal_object_3d` | mapped_but_unvalidated | not_tested | 3D Object |
| `fal_audio_placeholder` | mapped_but_unvalidated | not_tested | Audio Sound Design |

---

## Promoting a blocked tool

1. Run live validation (`docs/ENGINE_VALIDATION_RUNBOOK.md`, `scripts/fal-live-validation.mjs`)
2. Set engine `status: "active"` in `app/lib/engines/fal-catalog.ts`
3. Enable launch module in `app/lib/config/launch.ts`
4. Confirm env vars from table above
5. Re-run `getAllToolProviderReadiness()` or `npm run build`
6. Update this doc and `docs/MODEL_ACTIVATION_STATUS.md`

---

## Programmatic audit

```typescript
import {
  getMvpEnvReadiness,
  getAllToolProviderReadiness,
} from "@/app/lib/config/env";

const mvp = getMvpEnvReadiness();
const liveToday = getAllToolProviderReadiness().filter((t) => t.canActivate);
const blocked = getAllToolProviderReadiness().filter((t) => !t.canActivate);
```

Never log `process.env` values in production.
