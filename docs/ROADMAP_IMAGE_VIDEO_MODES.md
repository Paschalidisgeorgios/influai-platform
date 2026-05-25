# InfluExAi — Roadmap: Image, Video & Studio Modes

**Document type:** Internal technical roadmap  
**Audience:** Engineering, product, operations  
**Status:** Planning reference — not user-facing  
**Last updated:** 2026-05-22  

This document describes planned provider and mode expansions for InfluExAi. It does **not** authorize activation of any mode listed as Planned. Nothing in this file changes runtime behavior.

---

## 1. Current live mode

| Field | Value |
|-------|--------|
| **Mode** | Standard Image |
| **Provider** | OpenAI |
| **Model** | `gpt-image-1` |
| **Workflow** | `standard` |
| **Credit cost** | 1 credit per standard image |
| **User-visible status** | Live |
| **API exposure** | Yes — `/api/generate` (unchanged contract today) |

### Behavior today (baseline)

- Queue → worker (`/api/generate/process`) → OpenAI image generation → storage → gallery.
- Credits consumed via existing RPC before job creation; refund on job create failure.
- Gallery stores `provider`, `model`, `workflow`, prompts, format metadata.

**Rule:** All future modes must remain compatible with Standard Image. Standard Image is the production fallback and default.

---

## 2. Planned image modes

These modes are prepared in the **UI** (Image Mode selector) as disabled / Planned. They must not be activated until provider integration, credit pricing, refunds, and gallery metadata are defined and tested.

### 2.1 Fast Draft

| Field | Value |
|-------|--------|
| **Mode key (proposed)** | `fast_draft` |
| **Future provider candidate** | FLUX Schnell (e.g. via inference host — evaluate vendor at implementation time) |
| **Intended use** | Low-cost drafts, rapid prompt exploration, iteration before final render |
| **Suggested credit cost** | 1 credit, or less if unit economics allow |
| **Status** | Planned |
| **User-visible status** | Planned (not Live) |

### 2.2 Premium Image

| Field | Value |
|-------|--------|
| **Mode key (proposed)** | `premium` |
| **Future provider candidates** | FLUX Dev, FLUX Pro, Nano Banana Pro (evaluate quality/cost/latency per campaign type) |
| **Intended use** | High-quality campaign visuals, hero assets, feed posts requiring extra fidelity |
| **Suggested credit cost** | 2–3 credits per image |
| **Status** | Planned |
| **User-visible status** | Planned |

### 2.3 Reference Edit

| Field | Value |
|-------|--------|
| **Mode key (proposed)** | `reference_edit` |
| **Future provider candidates** | Nano Banana, FLUX Kontext (reference-guided edit workflows) |
| **Intended use** | Image editing, reference-guided edits, inpaint/outpaint-style campaign adjustments |
| **Suggested credit cost** | 2–4 credits per job (depends on edit complexity) |
| **Status** | Planned |
| **User-visible status** | Planned |

### 2.4 Brand Assets

| Field | Value |
|-------|--------|
| **Mode key (proposed)** | `brand_assets` |
| **Future provider candidate** | Recraft (brand/layout-oriented generation) |
| **Intended use** | Brand systems, product layouts, ad creatives, thumbnails with layout discipline |
| **Suggested credit cost** | 2–4 credits per asset |
| **Status** | Planned |
| **User-visible status** | Planned (may surface under Expansion / Brand Assets module) |

---

## 3. Planned video modes

Video capabilities are **not live**. UI modules (Video Studio, Cinema Agent) are roadmap-only.

### 3.1 Video Studio

| Field | Value |
|-------|--------|
| **Module** | Video Studio |
| **Future provider candidates** | Seedance, Kling, Runway-class providers (evaluate ToS, latency, cost, regional compliance) |
| **Intended use** | Text-to-video, image-to-video, short-form creator ads, product clips |
| **Suggested credit cost** | Separate tier — higher than 1 credit/image (define per second or per clip) |
| **Status** | Planned |
| **User-visible status** | Coming soon / Planned |

### 3.2 Cinema Agent

| Field | Value |
|-------|--------|
| **Module** | Cinema Agent |
| **Provider** | TBD — likely orchestration over Video Studio + planning layer |
| **Intended use** | Storyboard, shot lists, visual sequences before generation |
| **Suggested credit cost** | TBD — may be planning-only credits + per-shot video credits |
| **Status** | Planned |
| **User-visible status** | Planned / Roadmap |

---

## 4. Planned lip sync

### 4.1 Lip Sync Studio

| Field | Value |
|-------|--------|
| **Module** | Lip Sync Studio |
| **Future provider candidates** | Lip-sync / talking-avatar providers (evaluate quality, language support, latency) |
| **Intended use** | Talking creator clips, UGC-style ads, voice-to-video |
| **Suggested credit cost** | Separate higher credit cost (per clip or per second) |
| **Status** | Planned |
| **User-visible status** | Coming soon / Planned |

---

## 5. Monetization idea (internal)

### 5.1 Watermarked Promo Package

| Field | Value |
|-------|--------|
| **Concept** | Low-cost or promotional tier with visible InfluExAi watermark on exports |
| **Technical requirement** | Server-side watermarking pipeline (post-generation or on export) |
| **Upgrade path** | Paid packages (Starter / Professional / Ultimate) → export without watermark |
| **Stripe** | New package key only after pricing + legal review — do not reuse existing keys without migration plan |
| **Status** | Planned |
| **User-visible status** | Planned monetization module (already communicated in UI as non-purchasable) |

---

## 6. Implementation rules

Apply these rules before enabling any new mode in production.

### 6.1 Activation gates

1. **Do not activate providers** until unit cost, credit mapping, and margin are signed off.
2. **Do not expose provider or model names** in the product UI as “Live” until the integration is shipped and tested.
3. **Do not send new fields** from the client until the API contract is versioned and documented.

### 6.2 Required definition per new mode

Every new mode must document and implement:

| Requirement | Notes |
|-------------|--------|
| **provider** | Stored on `generations.provider` |
| **model** | Stored on `generations.model` |
| **workflow / mode** | Distinct from `standard` when behavior differs |
| **expected cost** | Internal COGS per job (USD/EUR) |
| **credit cost** | User-facing debit amount |
| **timeout behavior** | Worker max duration, stale job handling |
| **failure refund behavior** | When to call `refund_user_credits`; idempotent refunds |
| **storage behavior** | Bucket path, MIME, max size, CDN URL shape |
| **gallery metadata** | Status badges, format, optional `video_url`, duration, etc. |
| **user-visible status** | Live / Planned / Coming soon — must match reality |

### 6.3 Non-regression

- Standard Image generation path must remain the default.
- Existing Stripe packages (`starter`, `professional`, `ultimate`) and credit grants unchanged unless explicitly migrated.
- Worker secret and queue semantics must not break in-flight Standard jobs.
- Image Mode UI: disabled cards become active **only** after backend + pricing ship together.

---

## 7. Future database considerations

Existing columns (reference):

- `generations.provider`
- `generations.model`
- `generations.workflow`

Proposed extensions (evaluate before migration):

| Field | Purpose |
|-------|---------|
| `mode` | User-selected image/video mode (`standard`, `fast_draft`, `premium`, …) |
| `credit_cost` | Actual credits debited for this job (audit trail) |
| `provider_job_id` | External async job ID for polling webhooks |
| `source_image_url` | Reference edit / image-to-video inputs |
| `video_url` | Output for video modes |
| `duration_seconds` | Video length billing |
| `watermark_enabled` | Promo export flag |

Migration checklist when adding fields:

- Backfill defaults for historical rows.
- Index strategy for gallery filters by `mode`.
- RLS / service role access unchanged for user isolation.

---

## 8. Future UI considerations

| Area | Guidance |
|------|----------|
| **Image Mode selector** | Already prepared in `AiAgentStudio` — only Standard is selectable today. |
| **Activation** | Enable Planned cards when API accepts `mode` (or equivalent) and worker routes correctly. |
| **Pricing page** | Update Credits / landing copy before toggling Live. |
| **Disclosure** | Video and lip sync may require additional terms (synthetic media, likeness, voice rights). |
| **Provider names** | Keep internal in this doc and env config — marketing copy should say “Premium Image”, not vendor trademarks, until live. |

### Related studio modules (UI roadmap only)

- Omni Campaign Agent — orchestration across formats; depends on image + video maturity.
- Automation — batch/scheduling; after core modes stable.

---

## 9. Testing checklist for a new provider

Use this checklist before marking a mode **Live** in production.

### Generation & credits

- [ ] Local generation succeeds end-to-end
- [ ] Production generation succeeds on Vercel worker
- [ ] Correct credits deducted at queue time
- [ ] Refund on failure (provider error, timeout, storage failure)
- [ ] No double debit on retry / duplicate worker runs
- [ ] Stripe checkout and webhooks unaffected

### Storage & gallery

- [ ] Asset uploaded to storage with correct path and ACL
- [ ] Gallery list/detail shows image or video URL
- [ ] Broken/missing URL states handled in UI
- [ ] Regenerate / delete / favorite still work
- [ ] Metadata (`provider`, `model`, `workflow`, `mode`) correct in DB

### Reliability

- [ ] Provider timeout handled; job marked `failed` with safe message
- [ ] No duplicate processing for same `generationId`
- [ ] Worker secret auth unchanged and secure

### UX

- [ ] Mobile agent layout acceptable
- [ ] Processing state appears immediately after submit
- [ ] Mode badge matches backend status (Live vs Planned)
- [ ] English and German copy reviewed if user-facing strings change

### Rollback

- [ ] Feature flag or config toggle to disable new mode without redeploying Standard path
- [ ] Standard Image smoke test passes with new code deployed

---

## 10. Suggested implementation phases (internal)

| Phase | Scope | Exit criteria |
|-------|--------|----------------|
| **P0** | Standard Image hardening | Baseline checklist green in prod |
| **P1** | Fast Draft + credit model | 1-credit draft path, internal COGS tracked |
| **P2** | Premium Image | 2–3 credits, quality bar for campaigns |
| **P3** | Reference Edit | Source image upload + edit pipeline |
| **P4** | Brand Assets / Recraft | Layout/brand kits |
| **P5** | Video Studio | Video URL storage, higher credit tier |
| **P6** | Lip Sync Studio | Voice + video pipeline |
| **P7** | Cinema / Omni agents | Orchestration only after P5–P6 stable |
| **P8** | Watermarked Promo | Server watermark + package SKU |

---

## 11. Document maintenance

- Update this file when provider shortlists change or modes go Live.
- Cross-link from internal PRs that touch `generations`, worker routes, or Image Mode UI.
- Do not copy provider trademark names into user-facing marketing until implementation is complete.

**Owner:** Platform engineering  
**Related user-facing modules:** AI Agent (Image Mode), Expansion sidebar, Landing roadmap, Credits (Watermarked Promo — planned).
