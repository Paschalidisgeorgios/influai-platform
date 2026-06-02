# InfluExAi — UX Flow Analysis

**Goal:** First finished Social Asset Pack in **≤ 5 clicks** after sign-in.

**Analyzed:** `DashboardToolHome.tsx`, `AgentPackGeneratorPanel.tsx`, `AgentWorkflowPanel.tsx`, `GalleryAssetCard.tsx` (June 2026).

---

## Ideal path (5 clicks)

| Step | Screen | Action | Clicks |
|------|--------|--------|--------|
| 0 | Landing `/` | **Create Free Pack** → auth | 1 |
| 1 | Auth `/auth` | Sign in / Google | 2 |
| 2 | Dashboard `/dashboard` | Select **Social Asset Pack** (or chip with draft idea) | 3 |
| 3 | Pack panel | **Preview Pack** (free, no credits) | 4 |
| 4 | Pack panel | **Render Pack** (credits shown before click) | 5 |
| **Done** | Same panel | Pack assets + download / gallery | — |

**Post-pack (optional):** Download asset, open Gallery, copy hook — not counted toward first pack.

---

## Current path (typical)

1. **Landing** → CTA to `/auth?next=/dashboard`
2. **Auth** → session → redirect dashboard
3. **Dashboard** (`DashboardToolHome` or studio shell) → choose tool, enter idea
4. **Social Asset Pack** (`AgentPackGeneratorPanel`) → preview → render
5. **Result** → `PackGalleryGroup`, link to `/dashboard/gallery`

**Click count after login:** ~3–4 for pack only; **6–7** if user browses categories or navigates to `/dashboard/image` first.

**Friction:**

- Overlay mode hides preview/render in panel; CTAs live in bottom bar (extra discovery).
- No single “one button” pack — preview is mandatory before render (good for trust, +1 click).
- Gallery download is per-asset via actions, not one obvious “Download pack” on success.

---

## Component roles

| File | Role |
|------|------|
| `DashboardToolHome.tsx` | Category chips → `onSelectTool` (generator / navigate / detail). No `fetch`. |
| `AgentPackGeneratorPanel.tsx` | **Main pack API** — preview + render `fetch`, state machine, gallery embed. |
| `AgentWorkflowPanel.tsx` | Visual step list only (no API). Progress UI during preview/render. |
| `GalleryAssetCard.tsx` | Masonry card, actions grid, delete. |

---

## Loading states

| Location | Status |
|----------|--------|
| `AgentPackGeneratorPanel` | ✅ `preview_loading`, `credit_checking`, `rendering` + spinners on buttons |
| `PromptAssistControls` | ✅ `loading` + `Loader2` |
| `HooksCaptionsPanel` | ✅ `loading` |
| `CreativeScorePanel` | ✅ `loading` |
| `ExportPackPanel` | ✅ `assetsLoading`, `loading` on prepare |
| `CreativeScoreImproveLoop` | ✅ fetch via helper |
| `DashboardToolHome` | N/A (no fetch) |
| `AgentWorkflowPanel` | N/A (display only) |

---

## Error states

| Location | Status |
|----------|--------|
| Pack preview/render | ✅ `error` text, `insufficient_credits`, `failed_refunded` |
| Pack API | ✅ 402 / `INSUFFICIENT_CREDITS` → credits panel |
| Gallery card actions | Via parent `busy` + notices |
| Auth | ✅ `AuthWorkspace` error messages |

**Gaps:**

- Some tool routes rely on toast only (studio overlay).
- Export pack asset load failure is silent empty list.

---

## After generation

1. Panel state → `completed` / `partial_success`
2. `SocialAssetPackShowcase` mode `result`
3. `PackGalleryGroup` — images, videos, hooks, captions, hashtags
4. Links: **Open Creator Gallery**, **Preview another pack**
5. Credits footer note

**Improved (this sprint):** `PackResultActions` — Download, Copy Hook, Variation, New Pack.

---

## Download path

| Asset type | How |
|------------|-----|
| Pack image | `PackResultActions` → open `assetUrl` in new tab |
| Pack video | Same or video URL from `result.assets.videos[0]` |
| Gallery | Card hover → **Export** / **View** actions |
| Export ZIP | `ExportPackPanel` / pack export manifest (separate tool) |

---

## Recommendations (backlog)

1. Default dashboard to **Social Asset Pack** when `?tool=pack` or first visit.
2. Combine preview + render into “Create Pack” with inline cost (optional A/B).
3. Surface `CreditCostPreview` on every generator with `fetch`.
4. Add `creative_score` to `/api/generations` list for gallery badges.
5. Touch targets ≥ 44px on all dashboard chips (mobile).

---

## Target metrics

- Time to first pack: **< 10 min** (including auth)
- Clicks after login: **≤ 5**
- Credit cost visible **before** every paid render
- Refund message visible on failure
