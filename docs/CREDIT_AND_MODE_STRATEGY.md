# InfluExAi — Credit & Mode Strategy

**Document type:** Product and engineering strategy  
**Audience:** Product, engineering, operations, finance  
**Status:** Planning reference — does not change runtime behavior  
**Last updated:** 2026-05-22  
**Related:** [ROADMAP_IMAGE_VIDEO_MODES.md](./ROADMAP_IMAGE_VIDEO_MODES.md), [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)

This document defines how InfluExAi should price and roll out image, video, lip-sync, and promotional modes. It is the authoritative reference for **credit costs**, **rollout order**, and **safety rules** before any new provider is activated.

Nothing in this file enables a mode in production. Live behavior today remains **Standard Image only** (OpenAI `gpt-image-1`, **1 credit**). All other modules (image modes, Video Studio, Lip Sync, Cinema Agent) are **planned** — no UI or API activation without backend implementation and cost monitoring ([§12](#12-important-implementation-rule)).

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

## 5. Planned Brand Assets mode

| Field | Value |
|-------|--------|
| **Future provider candidate** | Recraft |
| **Suggested credit cost** | 2–4 credits per asset |
| **Purpose** | Brand systems, ad creatives, thumbnails, product layouts |
| **Status** | Planned |

May surface under Expansion / Brand Assets in the UI when backend support exists.

---

## 6. Planned Video Studio

| Field | Value |
|-------|--------|
| **Future provider candidates** | Seedance, Kling, and other video providers (evaluate per launch) |
| **Suggested cost model** | |
| — Short clip | 15–30 credits |
| — Longer / premium clip | 40–80 credits |
| **Purpose** | Text-to-video, image-to-video, creator ads, product videos |
| **Status** | Planned |

Billing unit (per clip vs per second) must be fixed before UI goes Live. Store `video_url` and `duration_seconds` for audit and support.

**Implementation spec:** [VIDEO_STUDIO_IMPLEMENTATION_PLAN.md](./VIDEO_STUDIO_IMPLEMENTATION_PLAN.md) (planning only, **not Live**).

---

## 7. Planned Lip Sync Studio

| Field | Value |
|-------|--------|
| **Future provider candidates** | Lip-sync / talking-avatar providers |
| **Suggested cost model** | Short clip: **10–30 credits**; longer/premium: **30–60 credits** (duration, provider, quality) — variable, not active |
| **Purpose** | Talking creator clips, UGC ads, avatar content |
| **Status** | Planned — **not Live** |

Higher perceived value and COGS than still images; separate tier from Video Studio where both exist.

**Implementation spec:** [LIP_SYNC_IMPLEMENTATION_PLAN.md](./LIP_SYNC_IMPLEMENTATION_PLAN.md) (planning only, **not Live**).

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
| **Phase 7** | Add Lip Sync Studio | 10–60 credits (duration/provider tiers) |
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
| Fast Draft | Planned | 1 |
| Premium Image | Live (flagged) | **3** |
| Reference Edit | Planned | 3–5 (not active) |
| Brand Assets | Planned | 2–4 |
| Video Studio (short) | Planned | 15–30 |
| Video Studio (long/premium) | Planned | 40–80 |
| Lip Sync Studio (short) | Planned | 10–30 |
| Lip Sync Studio (long/premium) | Planned | 30–60 |
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
