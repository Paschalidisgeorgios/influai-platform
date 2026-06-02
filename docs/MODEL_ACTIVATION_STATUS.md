# Model & Tool Activation Status

**Last updated:** 2026-06-02  
**Code sources:** `app/lib/tools/creator-tools.ts`, `app/lib/tools/tool-activation.ts`, `app/lib/tools/resolve-tool.ts`, `app/lib/engines/model-inventory.ts` (`MODEL_CAPABILITY_AUDIT`), `app/lib/engines/catalog.ts`

This document is the launch audit for InfluExAI creator workflows. Every model/tool has a **resolved status** and, when not live, a **plain-language blocker** (no secrets, no provider model IDs in user UI).

---

## Activation rule (do not skip)

A workflow is **`live`** only when **all** checks pass:

| # | Check | Where |
|---|--------|--------|
| 1 | Launch feature + module gates | `app/lib/config/launch.ts`, `launch-tool-gate.ts` |
| 2 | Required env vars (server only) | `tool-activation.ts` → `KREA_API_KEY`, `FAL_KEY`, Supabase |
| 3 | Server handler route exists | `CREATOR_TOOL_ACTIVATION` in `tool-activation.ts` |
| 4 | Credit cost configured | `app/lib/billing/tool-credit-costs.ts` |
| 5 | Engine validated in catalog | `catalog.ts`, `fal-catalog.ts` |
| 6 | Gallery storage (if outputs persist) | Supabase URL + service role |
| 7 | Runtime guard | `assertToolCanRun()` before credits / providers |

Non-live tools **must not** call provider APIs or deduct credits for generation.

**Refund:** Paid flows use `refundGenerationOnce` / `refundPackPortionOnce` on failure after deduct.

**UI:** `showProviderNamesToUsers: false` — users see model **modes** (Auto, Fast Draft, etc.), never raw provider model IDs.

---

## Status legend

| Status | User-facing label | Can run | Can preview |
|--------|-------------------|---------|-------------|
| `live` | Live (+ credits when paid) | Yes | Optional |
| `preview` | Preview | No | Yes (planning / upload) |
| `request_access` | Request access | No | No |
| `coming_soon` | Coming soon | No | No |
| `blocked_missing_env` | In preparation | No | Maybe |
| `blocked_provider_failed` | In preparation | No | Maybe |
| `blocked_missing_handler` | In preparation | No | No |
| `blocked_missing_credits` | In preparation | No | No |
| `blocked_storage_missing` | In preparation | No | No |
| `blocked_missing_infrastructure` | In preparation | No | No |

---

## Launch whitelist (`launch.ts`)

Only these creator tools may resolve to **`live`** when env, handlers, and validation pass:

`social_asset_pack`, `create_image`, `create_video`, `check_creative_score`, `hooks_captions`, `export_pack`

Runnable model modes: `auto_image`, `fast_draft_image`, `premium_image`, `realtime_image`, `auto_video`, `cinematic_text_video`

---

## Summary: what can launch today

| Category | Live today | Preview | Coming soon / blocked |
|----------|------------|---------|------------------------|
| **Image** (4 modes) | Auto, Fast Draft, Premium, Realtime | — | — |
| **Video** | Text-to-Video / Motion Video | — | Image-to-Video / Animate Image |
| **Pack** | Preview + Render (45 credits) | — | — |
| **Optimize** | Creative Score, Hooks & Captions, Export Pack | — | — |
| **Edit** | — | Reference, Edit, Match Style | Enhance, BG Remove, Upscale |
| **Animate** | — | — | Animate, Motion Transfer, LipSync, Avatar |
| **Training** | — | — | All four training workflows |
| **Advanced** | — | — | 3D Object, Audio Sound Design |

**MVP live engine IDs:** `smart_auto_pilot`, `krea_flux_fast_draft`, `krea_flux_11_pro_ultra`, `krea_nano_realtime`, `fal_kling_v3_t2v`

---

## Image

| Capability | Model mode | Engine | Status | Credits | Blocker if not live |
|------------|------------|--------|--------|---------|---------------------|
| **Auto Image** | `auto_image` | `smart_auto_pilot` | **live** | 1 | — |
| **Fast Draft** | `fast_draft_image` | `krea_flux_fast_draft` | **live** | 1 | — |
| **Premium Image** | `premium_image` | `krea_flux_11_pro_ultra` | **live** | 3 | — |
| **Realtime Render** | `realtime_image` | `krea_nano_realtime` | **live** | 1 | — |

**Tool:** `create_image` (Bild erstellen)

| Check | Result |
|-------|--------|
| Env | `KREA_API_KEY` |
| Handlers | `/api/krea/image/generate`, `/api/generate`, `/api/engine/generate` |
| Request schema | Krea image + unified generate |
| Gallery | Yes (Supabase generations) |
| Refund on failure | Yes |
| Provider IDs in UI | No |

---

## Video

| Capability | Model mode / tool | Engine | Status | Credits | Blocker |
|------------|-------------------|--------|--------|---------|---------|
| **Text-to-Video / Motion Video** | `auto_video`, `create_video` | `fal_kling_v3_t2v` | **live** | 25 | — |
| **Image-to-Video / Animate Image** | `animate_image` | `fal_kling_v3_i2v` | **coming_soon** | 25 | `enableImageToVideo: false`; engine `validation_blocked_insufficient_balance` (not promoted) |

**Live tool:** `create_video` (Motion-Video erstellen)

| Check | Result |
|-------|--------|
| Env | `FAL_KEY` |
| Handlers | `/api/engine/generate`, `/api/generate` |
| Gallery + refund | Yes |

**Animate Image tool:** `animate_image` — launch module off; when enabled, still **blocked_provider_failed** until I2V passes validation.

---

## Pack

| Capability | Tool | Status | Credits | Notes |
|------------|------|--------|---------|-------|
| **Social Asset Pack Preview** | `social_asset_pack` | **live** (preview path) | 0 | `/api/packs/social-asset-preview` — planning only |
| **Social Asset Pack Render** | `social_asset_pack` | **live** | 45 | Charges before providers; Krea + Fal required |

| Check | Preview | Render |
|-------|---------|--------|
| Env | None required | `KREA_API_KEY` + `FAL_KEY` |
| Handler | `/api/packs/social-asset-preview` | `/api/packs/social-asset-render` |
| Gallery | No | Yes |
| Refund | N/A | Partial/full pack refund on failure |

---

## Optimize

| Tool | Status | Credits | Handler | Provider |
|------|--------|---------|---------|----------|
| **Creative Score** | **live** | 0 | `/api/creative-score` | Internal (no provider) |
| **Hooks & Captions** | **live** | 0 | `/api/hooks-captions/generate` | Internal |
| **Export Pack** | **live** | 0 | `/api/export-pack/preview` | Client planning |

Also live (not in matrix above): `improve_prompt` (0), `export_asset` (gallery download, client-only).

---

## Edit

| Tool | Status | Credits | Primary engine | Blocker |
|------|--------|---------|----------------|---------|
| **Use Reference Image** | **preview** | 5 | `fal_reference_edit` | Engine mapped; **model id null**; not validated |
| **Edit Image** | **preview** | 5 | `fal_reference_edit` | Same |
| **Match Style** | **preview** | 5 | `fal_style_transfer` | Model id null; not validated |
| **Enhance Asset** | **coming_soon** | 3 | `fal_image_upscale` | `enableEnhancer: false` |
| **Background Remove** | **coming_soon** | 2 | `fal_background_removal` | `enableEnhancer: false` |
| **Upscale** | **coming_soon** | 3 | `fal_image_upscale` | `enableEnhancer: false` |

Reference upload: `/api/reference-sources/upload` exists; generation gated by `assertToolCanRun`.

Launch flags: `enableReferenceImage: true`, `enableReferenceEdit: true` — tools visible as **preview**, not live.

---

## Animate

| Tool | Status | Credits | Engine | Blocker |
|------|--------|---------|--------|---------|
| **Animate Image** | **coming_soon** | 25 | `fal_kling_v3_i2v` | Module off + engine not active |
| **Motion Transfer** | **coming_soon** | 30–50 | `fal_motion_transfer` | `enableMotionTransfer: false`; prior 422 validation |
| **LipSync Creator** | **coming_soon** | 30–35 | `fal_lipsync_sync_v2_pro` | `enableLipSync: false`; missing fixtures |
| **AI Avatar** | **coming_soon** | 40–50 | `fal_avatar_single_text` | `enableAvatar: false`; not tested |

When modules unlock, status moves to **request_access** or **preview** until `isEngineActive()` passes.

---

## Training

| Tool | Status | Credits | Blocker |
|------|--------|---------|---------|
| **Train Creator Style** | **coming_soon** | 150–300 | `enableTraining: false`; `fal_lora_training` not validated; no prod queue |
| **Train Brand Kit** | **coming_soon** | 150–300 | Same |
| **Train Product Model** | **coming_soon** | 150–300 | Same |
| **Train Creator Identity** | **coming_soon** | 150–300 | Upload routes exist; training not validated |

Internal status when infra missing: `blocked_missing_infrastructure`.

---

## Advanced

| Tool | Status | Credits | Blocker |
|------|--------|---------|---------|
| **3D Object** | **coming_soon** | 30–60 | `enable3D: false`; `fal_object_3d` model id null |
| **Audio Sound Design** | **coming_soon** | 5–15 | `enableAudio: false`; `fal_audio_placeholder` |

---

## Required environment (MVP live)

| Variable | Used by |
|----------|---------|
| `KREA_API_KEY` | Create Image, Style Variant, Pack images |
| `FAL_KEY` | Create Motion Video, Pack video |
| `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | Gallery persistence |

Missing env → `blocked_missing_env` (user sees “In preparation”).

---

## Launch flags snapshot (`launch.ts`)

| Flag | Value | Effect |
|------|-------|--------|
| `enableImageGeneration` | true | Create Image live |
| `enableTextToVideo` | true | Motion Video live |
| `enableSocialAssetPack` | true | Pack |
| `enableHooksCaptions` | true | Hooks & Captions |
| `enableExportPack` | true | Export Pack |
| `enablePromptAssist` | true | Improve Prompt |
| `enableCreativeScore` | true | Creative Score |
| `enableGallery` | true | Export Pack |
| `enableImageToVideo` | **false** | Animate Image coming soon |
| `enableReferenceImage` / `enableReferenceEdit` | **true** | Edit tools → preview |
| `enableEnhancer` | **false** | Enhance / BG / Upscale coming soon |
| `enableTraining` | **false** | Training coming soon |
| `enableLipSync` / `enableAvatar` / `enable3D` / `enableMotionTransfer` / `enableAudio` | **false** | Animate + Advanced coming soon |

---

## Server handler registry

Central mapping: `app/lib/tools/tool-activation.ts` (`CREATOR_TOOL_ACTIVATION`)  
Unified entry: `POST /api/tools/[toolId]`  
Runtime guard: `assertToolCanRun()` in `run-generation.ts`, pack render, krea/engine routes

---

## Promoting a tool to live

1. Validate engine (`docs/ENGINE_VALIDATION_RUNBOOK.md`)
2. Set `status: "active"` + `validationStatus: "passed"` in `fal-catalog.ts` or Krea catalog
3. Enable launch module in `launch.ts`
4. Confirm handler deducts credits **before** provider call
5. Run `npm run build`
6. Update `MODEL_CAPABILITY_AUDIT` in `model-inventory.ts` and this file

**Do not activate blindly.**

---

## Related docs

- `docs/MODEL_ACTIVATION_POLICY.md`
- `docs/PROVIDER_READINESS.md`
- `docs/ENVIRONMENT.md`
