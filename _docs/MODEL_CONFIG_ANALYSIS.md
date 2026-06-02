# InfluExAi — Model & Provider Configuration Analysis

**Date:** June 2026  
**Sources:** `lib/krea/krea-official-catalog.ts`, `lib/dashboard/krea-model-picker-catalog.ts`, `lib/providers/krea.ts`, `lib/providers/flags.ts`, `.env.example`, `lib/ai/krea-model-registry*.ts`, `app/lib/engines/catalog.ts`

---

## Architecture overview

| Layer | Role |
|-------|------|
| `krea-official-catalog.ts` | OpenAPI-derived catalog — all official Krea `modelPath` values (image, video, enhance). |
| `krea-model-registry-data.ts` | InfluExAi registry rows (id, path, credits, availability, env overrides). |
| `krea-model-registry.ts` | Resolves workflow → model path (env + defaults). |
| `krea-model-picker-catalog.ts` | Dashboard picker UI over **engine registry** (`lib/ai/model-registry`). |
| `lib/providers/krea.ts` | HTTP client: `POST /generate/image|video|enhance/{path}`, job polling. |
| `app/lib/providers/provider-router.ts` | Runtime routing: image → Krea, MVP video T2V → **fal** `fal_kling_v3_t2v`. |
| `lib/ai/model-recommendations.ts` | Use-case → recommended paths (creator vs brand). |

---

## Environment defaults (`.env.example`)

| Variable | Default | Purpose |
|----------|---------|---------|
| `KREA_IMAGE_MODEL_PATH` | `bfl/flux-1-dev` | Standard / UGC / fast draft image fallback |
| `KREA_MODEL_REFERENCE_EDIT` | `google/nano-banana-pro` | Reference edit workflow |
| `KREA_MODEL_VIDEO` | **`kling/kling-3.0`** | Image-to-video / pack motion (Krea path) |
| `KREA_MODEL_ENHANCE` | `enhance/topaz/standard-enhance` | Topaz enhance |
| `KREA_API_KEY` | (required for Krea) | Primary provider |
| `FAL_KEY` | (optional) | Fallback / MVP text-to-video (`fal_kling_v3_t2v`) |

Optional overrides: `KREA_MODEL_FAST_DRAFT`, `KREA_MODEL_PREMIUM`, `KREA_MODEL_BRAND`, `KREA_MODEL_UGC`, `KREA_MODEL_STANDARD`.

---

## Configured model paths (registry + env)

### Image (production workflows)

| Workflow | Typical path | Credits (capability matrix) |
|----------|--------------|----------------------------|
| `standard` | `bfl/flux-1-dev` | 1 |
| `fast_draft` | `bfl/flux-1-dev` (or env) | 1 |
| `ugc_look` | `bfl/flux-1-dev` | 2 |
| `premium_image` | `bfl/flux-1.1-pro` / flux-11-pro registry id | 3 |
| `brand_assets` | `google/nano-banana-pro` or flux-11-pro | 4 |
| `reference_edit` | `google/nano-banana-pro` | 5 |
| `enhance_asset` | `topaz/standard-enhance` | 4 |

### Video

| Use case | Path | Notes |
|----------|------|-------|
| Krea I2V / pack | **`kling/kling-3.0`** | `KREA_MODEL_VIDEO`, default registry `kling-3` |
| MVP Create Video (UI) | `fal-ai/kling-video/v3/pro/text-to-video` | Engine `fal_kling_v3_t2v` — **active** in catalog |
| Legacy catalog entries | `kling/kling-2.5` … `2.6` | Still in OpenAPI snapshot; app default is **3.0** |

### Official catalog

`krea-official-endpoints.generated.ts` lists **all** Krea API endpoints (Flux, Imagen, Kling 1–3.0, Veo, Topaz, etc.). Only a subset is wired in InfluExAi launch engines.

---

## Active vs gated (flags & launch)

### Provider flags (`lib/providers/flags.ts`)

| Provider | Active when |
|----------|-------------|
| **Krea** | `KREA_API_KEY` set and `ENABLE_KREA_PROVIDER` ≠ `false` |
| **fal** | `FAL_KEY` set and `ENABLE_FAL_PROVIDER` ≠ `false` |
| **Creatify** | `ENABLE_CREATIFY_PROVIDER=true` only |

### MVP public flags (`lib/launch/public-flags.ts`) — **enabled**

- `fastDraft`, `premiumImage`, `ugcLook`, `brandAssets`, `referenceEdit`
- `videoStudio` (via `LAUNCH_CONFIG.enableTextToVideo`)
- `kreaProvider` (unless `NEXT_PUBLIC_ENABLE_KREA_PROVIDER=false`)

### **Disabled** at MVP

- `motionTransfer`, `liveAvatar`, `cinemaAgent`, `omniCampaignAgent`, `socialPlanner`, `creatifyProvider`
- `lipSync`, `talkingCreator`, `creatorVideo`, `enhance` (module off in `LAUNCH_CONFIG`)

### Launch engines (`app/lib/config/launch.ts`)

**Active model modes:** `auto_image`, `fast_draft_image`, `premium_image`, `realtime_image`, `auto_video`, `cinematic_text_video`.

**Active tools:** social asset pack, create image/video, creative score, hooks, export pack.

---

## Model paths in use (runtime)

1. **Image generation** → `lib/providers/krea.ts` → `POST /generate/image/{modelPath}`
2. **Video (Krea)** → `POST /generate/video/kling/kling-3.0` (env override)
3. **Video (MVP UI)** → fal router → `fal_kling_v3_t2v`
4. **Enhance** → `POST /generate/enhance/topaz/standard-enhance`
5. **Pack agent** → mix of image engines + fal/Krea video per `render-social-asset-pack.ts`

---

## Recommendations by audience

| Audience | Image | Video | Suggested mode |
|----------|-------|-------|----------------|
| **Creator** | `bfl/flux-1-dev` | `kling/kling-3.0` | `ugc_look` / `fast_draft_image` |
| **Brand** | `google/nano-banana-pro` | `kling/kling-3.0` | `brand_assets` |
| **Editorial** | `bfl/flux-1-dev` | `kling/kling-3.0` | `premium_image` |
| **Agency / personal** | `bfl/flux-1-dev` (default) | `kling/kling-3.0` | `standard` / `auto_image` |

Implemented in `lib/ai/model-recommendations.ts` — surfaced in `ModelModeSelector` and optional `AgentWorkflowPanel.modelModeId`.

---

## Provider fallback (`lib/providers/provider-strategy.ts`)

1. If `KREA_API_KEY` + Krea enabled → **primary: krea**
2. Else if `FAL_KEY` + fal enabled → **primary: fal**
3. Else → `getAvailableProvider()` returns `null`; `assertAnyProviderConfigured()` throws a clear error (no silent crash)

Secondary: `getFallbackProvider("krea")` → `fal` when both keys exist.

---

## Health check

`GET /api/providers/krea/health` — no auth. Returns `unconfigured` | `ok` | `error`; pings Krea API base URL with bearer token.

---

## Kling 3.0 migration (completed)

- Default fallback in `krea-model-registry.ts`: `kling/kling-3.0`
- Registry alias `kling-25` → path `kling/kling-3.0`
- `KREA_CAPABILITY_MATRIX` video endpoint updated
- `.env.example`: `KREA_MODEL_VIDEO=kling/kling-3.0`
- OpenAPI generated file still lists 2.5 for reference only

---

## Gaps / follow-ups

1. Re-validate `kling-3` registry row when Krea plan includes video (currently `failed_validation` / 402 in stored validation).
2. Align pack video step to Krea 3.0 or fal depending on `resolveProviderGenerationContext`.
3. Run `node scripts/generate-krea-official-catalog.mjs` after Krea OpenAPI updates.
