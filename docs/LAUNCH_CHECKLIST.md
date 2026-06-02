# InfluExAI — Launch Checklist (MVP)

**Product:** The Content Engine — Creator Workflow System for images, motion clips and social-ready assets.  
**Strategic lock:** See [LAUNCH_PRIORITY_LOCK.md](./LAUNCH_PRIORITY_LOCK.md) before changing scope.  
**Use before launch and after deploys that touch user-facing flows.**  
Do not paste secrets into this document.

Mark each item **Pass** / **Fail** / **N/A** with date and tester initials.

---

## Core creation flows

| # | Check | Pass |
|---|--------|------|
| 1 | **Create Image** works end-to-end (Krea image route) | ☐ |
| 2 | **Create Video** works end-to-end (`fal_kling_v3_t2v` only active fal engine) | ☐ |
| 3 | **Prompt Assist** returns improved copy or safe fallback (no crash) | ☐ |
| 4 | **Creative Score** opens from canvas; hooks/captions/hashtags copy works | ☐ |
| 5 | **Create Style Variant** creates a new gallery asset without overwriting original | ☐ |
| 6 | **Export** / download works for image and video assets | ☐ |

---

## Gallery & canvas

| # | Check | Pass |
|---|--------|------|
| 7 | **Creator Gallery** lists completed images and videos | ☐ |
| 8 | Gallery empty state shows creator-friendly copy | ☐ |
| 9 | Gallery detail opens **Creator Canvas** with action menu | ☐ |
| 10 | Videos render with controls and do not break layout | ☐ |
| 11 | Long prompts wrap; action buttons do not overflow (mobile + laptop) | ☐ |

---

## Credits & billing

| # | Check | Pass |
|---|--------|------|
| 12 | **Estimated cost** visible before generation | ☐ |
| 13 | **Credits checked before generation** (402 / insufficient credits blocked) | ☐ |
| 14 | Insufficient credits shows **Buy credits** / **Upgrade** — not silent failure | ☐ |
| 15 | **Failed jobs refund once** (generation errors mention refund when applicable) | ☐ |
| 16 | Stripe checkout still works (existing flow — no webhook changes in this release) | ☐ |
| 17 | Low-credits state shows friendly upsell copy | ☐ |

---

## Security & policy

| # | Check | Pass |
|---|--------|------|
| 18 | **`FAL_KEY` server-only** — never in client bundle or UI | ☐ |
| 19 | **Stripe webhook untouched** and credits still apply after payment | ☐ |
| 20 | **Supabase auth** login/logout/session still works | ☐ |
| 21 | **Inactive actions hidden** from primary UI (Animate Image, LipSync, Avatar, etc.) | ☐ |
| 22 | **Provider/model names hidden** from normal user UI | ☐ |
| 23 | **Raw model IDs** not shown to normal users | ☐ |

---

## Copy & positioning

| # | Check | Pass |
|---|--------|------|
| 24 | Product reads as **AI Creator Studio** (not Campaign Studio) | ☐ |
| 25 | Nav: **Create · Gallery · Credits · Settings** | ☐ |
| 26 | No **Viral Chance** or guaranteed virality claims | ☐ |
| 27 | Creative Score uses **Scroll-stop potential** framing | ☐ |
| 28 | Error messages are calm and non-technical (no stack traces) | ☐ |

---

## Build & deploy

| # | Check | Pass |
|---|--------|------|
| 29 | `npm run build` passes | ☐ |
| 30 | Production smoke test on main flows after deploy | ☐ |

---

## Sign-off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Product | | | ☐ |
| Engineering | | | ☐ |

**Notes:**

---
