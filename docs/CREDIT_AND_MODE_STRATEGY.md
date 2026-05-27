# InfluExAi — Credit & Mode Strategy

**Document type:** Product and engineering strategy  
**Audience:** Product, engineering, operations, finance  
**Status:** Planning reference — does not change runtime behavior  
**Last updated:** 2026-05-22  
**Related:** [ROADMAP_IMAGE_VIDEO_MODES.md](./ROADMAP_IMAGE_VIDEO_MODES.md), [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)

This document defines how InfluExAi should price and roll out image, video, lip-sync, and promotional modes. It is the authoritative reference for **credit costs**, **rollout order**, and **safety rules** before any new provider is activated.

Modes are enabled per environment via feature flags. The dashboard **Studio Suite** surfaces status (Live / Beta / Planned) and credit cost without changing billing logic.

### Studio Suite — credit costs (user-facing)

| Tool | Status (typical) | Credits |
|------|------------------|---------|
| Standard Image | Live | 1 |
| UGC Look | Beta (flag) | 2 |
| Fast Draft | Beta (flag) | 1 |
| Premium Image | Beta (flag) | 3 |
| Reference Edit | Beta (flag) | 5 |
| Brand Assets | Beta (flag) | 4 |
| Video Studio | Beta (flag) | 25 |
| Lip Sync Studio | Beta (flag) | 30 (upload audio) / 35 (system voice) |
| Talking Creator | Beta (flag) | 60 |

### Planned modules (no generation API)

Cinema Agent, Omni Campaign Agent, Social Planner, Brand Safety / Compliance, Watermarked Promo Package — roadmap UI only.

---

## 1. Current live mode

| Field | Value |
|-------|--------|
| **Mode** | Standard Image |
| **Provider** | OpenAI |
| **Model** | `gpt-image-1` |
| **Credit cost** | 1 credit per image |
| **Status** | Live |
| **Purpose** | Reliable campaign visuals, social assets, creator images |

Standard Image is the production default and fallback. All planned modes must be additive; they must not degrade or replace Standard until independently production-tested.

---

## 1b. UGC Look mode (Beta)

| Field | Value |
|-------|--------|
| **Mode key** | `ugc_look` |
| **Credit cost** | **2 credits** per image |
| **Workflow** | `ugc_look` |
| **Purpose** | Authentic smartphone-style creator visuals for TikTok, Reels and organic social ads |
| **Provider** | Standard image provider initially (OpenAI `gpt-image-1`, same pipeline as Standard Image) |
| **Status** | **Beta** when `ENABLE_UGC_LOOK=true` and `NEXT_PUBLIC_ENABLE_UGC_LOOK=true` |

UGC Look is intentionally **not a separate provider yet**. It uses the existing Standard/OpenAI image pipeline and storage path, with **prompt-driven** UGC-specific building:

- Positive rules: phone-shot framing, natural everyday light, candid creator environments, vertical short-form cues, context blocks (car, gym, beauty, product-in-hand).
- Negative rules: no studio/editorial lighting, no luxury campaign sets, no hyper-polished ad layouts, no plastic skin or fake text/logos.
- Quality bar: high-quality but believable organic content — not intentionally low-res or sloppy.

UI shows **UGC Look · 2 Credits**; gallery workflow badge: **UGC Look** (not Standard).

---

## 2. Planned Fast Draft mode

| Field | Value |
|-------|--------|
| **Future provider candidate** | FLUX Schnell |
| **Suggested credit cost** | 1 credit |
| **Purpose** | Cheaper/faster visual exploration, iteration before final renders |
| **Status** | Planned |

**Important:** Fast Draft must **not** replace Standard Image as the default until it passes the full provider checklist (timeouts, refunds, storage, gallery, production COGS). Standard remains the quality baseline for paid campaigns.

**Implementation spec:** [FAST_DRAFT_IMPLEMENTATION_PLAN.md](./FAST_DRAFT_IMPLEMENTATION_PLAN.md) (FLUX Schnell / fal.ai — planning only, not active).

---

## 3. Planned Premium Image mode

| Field | Value |
|-------|--------|
| **Future provider candidates** | FLUX Dev, FLUX Pro, Nano Banana Pro |
| **Credit cost (live)** | **3 credits** per image |
| **Suggested range (planning)** | Was 2–3; locked at **3** for MVP Premium |
| **Purpose** | Higher-end visuals, advanced campaign quality, stronger prompt following |
| **Status** | Live when `ENABLE_FAL_PREMIUM_IMAGE` + public flag set |

Premium is positioned above Standard for hero assets and high-stakes creatives—not for every draft.

**Implementation spec:** [PREMIUM_IMAGE_IMPLEMENTATION_PLAN.md](./PREMIUM_IMAGE_IMPLEMENTATION_PLAN.md). Billing uses **`getCreditCostForImageMode`** → **3 credits**.

---

## 4. Planned Reference Edit mode

| Field | Value |
|-------|--------|
| **Future provider candidates** | Nano Banana, FLUX Kontext |
| **Suggested credit cost** | **3–5 credits** per job (planned, not active) |
| **Purpose** | Image editing, reference-guided workflows, product/creator refinements |
| **Status** | Planned |

Requires `source_image_url` (or equivalent) in the data model before activation. Credit cost should scale with edit type once COGS are known.

**Implementation spec:** [REFERENCE_EDIT_IMPLEMENTATION_PLAN.md](./REFERENCE_EDIT_IMPLEMENTATION_PLAN.md) (UI/product). **Backend plan:** [REFERENCE_EDIT_BACKEND_PLAN.md](./REFERENCE_EDIT_BACKEND_PLAN.md) (storage, API, worker, DB). Not active — no activation without storage test, backend, and cost monitoring. Planned tier: **3–5 credits**.

---

## 5. Brand Assets mode (Beta)

| Field | Value |
|-------|--------|
| **Mode key** | `brand_assets` |
| **Provider** | fal.ai / FLUX Dev (`fal-ai/flux/dev`) — brand-focused prompts; Recraft deferred (422 on v3 input) |
| **Model endpoint** | `fal-ai/flux/dev` |
| **Credit cost** | **4 credits** per job |
| **Workflow** | `brand_assets` |
| **Purpose** | Brand-ready ad creatives, product campaign assets, brand visuals, thumbnails, social layouts |
| **Status** | **Beta** — requires `ENABLE_FAL_BRAND_ASSETS=true` and `NEXT_PUBLIC_ENABLE_FAL_BRAND_ASSETS=true` |

**Use cases:** ad creatives, product campaign assets, brand visuals, thumbnails, social marketing layouts.

**Not active when flags are off** — UI shows Planned; API returns 400.

Video, Lip Sync, LoRA, Face Consistency, Character Pro, and Replicate remain **not** activated.

---

## 6. Video Studio (Beta)

| Field | Value |
|-------|--------|
| **Provider / model** | fal.ai / `fal-ai/kling-video/v2.1/standard/image-to-video` |
| **Workflow** | `video_image_to_video` |
| **Cost model (MVP)** | **25 credits** per clip |
| **Purpose** | Text-to-video, image-to-video, creator ads, product videos |
| **Status** | Beta (feature-flagged) |

Video Studio is currently image-to-video only and feature-flagged with:

- `ENABLE_FAL_VIDEO_STUDIO=true`
- `NEXT_PUBLIC_ENABLE_FAL_VIDEO_STUDIO=true`

Required DB columns are documented in `docs/VIDEO_STUDIO_REQUIRED_SQL.md`.

**Implementation spec:** [VIDEO_STUDIO_IMPLEMENTATION_PLAN.md](./VIDEO_STUDIO_IMPLEMENTATION_PLAN.md) (planning only, **not Live**).

---

## 7. Lip Sync Studio (Beta)

| Field | Value |
|-------|--------|
| **Mode key** | `lip_sync` (reserved) |
| **Status** | **Beta** (`ENABLE_FAL_LIP_SYNC` + public flag) |
| **Cost** | **30 credits** (upload audio) / **35 credits** (system voice) |
| **Required inputs** | Source video + uploaded audio OR script + voice style |
| **Safety rule** | No expensive provider call without explicit user confirmation and shown estimate |

**Implementation spec:** [LIP_SYNC_IMPLEMENTATION_PLAN.md](./LIP_SYNC_IMPLEMENTATION_PLAN.md).
Voice IDs are ElevenLabs account-specific environment variables; when a selected System Voice is not configured, the job fails and refunds, while Upload Audio remains available.

---

## 8. Planned Cinema Agent

| Field | Value |
|-------|--------|
| **Module** | Cinema Agent |
| **Role** | Campaign planning — shot lists, prompts, optional video briefs (orchestration, not a media provider) |
| **Planning credits** | **Free or low-cost** text-only (e.g. 0–1 credit per plan — TBD) |
| **Generation credits** | Charged separately: images at Standard/Premium rates; video at Video Studio tiers when live |
| **Purpose** | Storyboards, pre-production, selective/batch shot generation with estimate before run |
| **Status** | Planned — **not Live** (roadmap UI only in MVP) |

**Implementation spec:** [CINEMA_AGENT_IMPLEMENTATION_PLAN.md](./CINEMA_AGENT_IMPLEMENTATION_PLAN.md). No automatic provider calls without user confirmation and credit estimate.

## 7b. Talking Creator (Beta)

| Field | Value |
|-------|--------|
| **Mode key** | `talking_creator` |
| **Status** | **Beta** (`ENABLE_TALKING_CREATOR` + public flag) |
| **Cost** | **60 credits** |
| **Required inputs** | Source image + script + voice |
| **Pipeline** | Image-to-video (Kling) + TTS (ElevenLabs) + lip sync (fal.ai) |
| **Safety rule** | Full failure path refunds credits once (no double-refund) |

---

## 9. Watermarked Promo Package

| Field | Value |
|-------|--------|
| **Concept** | Low-cost or free entry tier |
| **Behavior** | Images include InfluExAi watermark |
| **Technical requirement** | Server-side watermarking (post-generation or on export) — not client-only |
| **Upgrade path** | Paid packages → export without watermark |
| **Purpose** | Acquisition, viral sharing, brand discovery |
| **Status** | Planned |

Do not sell or auto-enable until watermark pipeline and Stripe SKU (if paid) are reviewed. UI may show as planned/non-purchasable until then.

---

## 10. Credit safety rules

These rules apply to **every** paid generation path, current and future.

1. **Define cost before provider call** — Credit debit amount must be known and applied (or reserved) before any external provider request.
2. **Refund on provider failure** — If the provider errors, times out, or storage fails after debit, credits must be refunded via the existing idempotent refund path.
3. **No silent activation** — A provider must not go Live without all of the following defined and tested:

| Gate | Requirement |
|------|-------------|
| Provider timeout handling | Max job duration, stale job cleanup |
| Failure handling | Status `failed`, user-safe message, refund trigger |
| Storage behavior | Bucket path, MIME, size limits, public URL shape |
| Gallery metadata | List/detail/regenerate/delete/favorite compatible |
| Production test | End-to-end on Vercel with real keys |
| Cost estimate | Internal COGS (USD/EUR) per job |
| Credit cost | User-facing debit documented and implemented |
| Refund behavior | When and how much to refund; no double refund on retry |

Violating any gate blocks marking the mode **Live** in UI or API.

---

## 11. Rollout order recommendation

| Phase | Scope | Notes |
|-------|--------|--------|
| **Phase 1** | Keep OpenAI Standard stable | Default path; all smoke tests green |
| **Phase 2** | Add Fast Draft (optional) | Same or lower credit; must not replace Standard as default until tested |
| **Phase 3** | Add Premium Image | **3 credits**; quality bar for campaigns |
| **Phase 4** | Add Reference Edit | Source image + edit pipeline |
| **Phase 5** | Add Brand Assets | Recraft / layout-oriented outputs |
| **Phase 6** | Add Video Studio | Video storage, 15–80 credit tiers |
| **Phase 6b** | Cinema Agent (planning) | Text-only plans; shot-to-image with confirm |
| **Phase 7** | Add Lip Sync Studio | 30/35 credits (implemented in beta) |
| **Phase 8** | Add Omni Campaign Agent | Cross-format orchestration; after video + lip sync maturity |

Watermarked Promo can ship in parallel with Phase 2–3 once server watermarking exists, or as a dedicated monetization phase—see [ROADMAP_IMAGE_VIDEO_MODES.md](./ROADMAP_IMAGE_VIDEO_MODES.md) §5 and §10.

---

## 12. Important implementation rule

**Do not activate new modes in the UI until backend support exists for:**

- Mode/workflow routing in worker and API  
- Documented **credit cost** and debit/refund behavior  
- **Failure handling** and timeouts  
- Gallery and storage metadata  

Planned cards in Image Mode and Expansion sidebar stay disabled/non-selectable until backend + pricing ship **together**. User-visible status must match reality (Planned vs Live).

---

## 13. Future fields to consider

When extending `generations` (or related tables), prefer explicit audit fields:

| Field | Purpose |
|-------|---------|
| `mode` | User-selected mode (`standard`, `fast_draft`, `premium`, …) |
| `credit_cost` | Actual credits debited for this job |
| `provider_job_id` | External async job ID for polling/webhooks |
| `source_image_url` | Reference edit, image-to-video inputs |
| `video_url` | Video output URL |
| `duration_seconds` | Video length for billing and support |
| `watermark_enabled` | Promo / watermarked export flag |

Existing columns (`provider`, `model`, `workflow`) remain required for Standard and all new modes.

---

## Summary matrix

| Mode / module | Status | Suggested credits |
|---------------|--------|-------------------|
| Standard Image | Live | 1 |
| Fast Draft | Live (flagged) | 1 |
| Premium Image | Live (flagged) | **3** |
| Reference Edit | Live (flagged) | **5** |
| Brand Assets | Beta (flagged) | **4** |
| Video Studio (short) | Planned | 15–30 |
| Video Studio (long/premium) | Planned | 40–80 |
| Lip Sync Studio (Upload Audio) | Beta (flagged) | 30 |
| Lip Sync Studio (System Voice) | Beta (flagged) | 35 |
| Talking Creator | Beta (flagged) | 60 |
| Cinema Agent (planning) | Planned | 0–1 (text-only, TBD) |
| Cinema Agent (per-shot image) | Planned | Standard/Premium rates |
| Cinema Agent (per-shot video) | Planned | Video Studio tiers when live |
| Watermarked Promo | Planned | Low / free tier (TBD) |

---

## Document maintenance

- Update suggested credit ranges when provider COGS change.  
- Cross-link PRs that touch credits RPC, worker routes, or mode UI.  
- When a mode goes Live, update this file, the roadmap, and launch/ops checklists.

**Owner:** Platform / product engineering
