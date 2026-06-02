# InfluExAI — Launch Priority Lock

**Product:** The Content Engine — a Creator Workflow System, not another AI generator.  
**Audience:** Product, engineering, design, and launch QA.  
**Status:** Active lock for MVP launch. Changes require explicit review.

---

## North-star workflow

InfluExAI must feel like a **Creator Workflow System**:

```text
Idea → Prompt Assist → Social Asset Pack → Creative Score → Improve → Export → Gallery → Reuse
```

Every launch decision should strengthen this loop — not add disconnected generators.

---

## Positioning lock

| Do | Don't |
|----|--------|
| Lead with **Social Asset Pack** as the differentiator | Lead with “generate an image” like every other AI app |
| Frame **Creative Score** as improvement + next-step guidance | Promise virality, guaranteed reach, or “Viral Chance” |
| Show **credit cost before render** on every paid action | Surprise charges, hidden upscale, or post-hoc billing |
| Show **locked tools as workflows** (Preview / Request access / Pro) | Hide the roadmap or expose raw engines |
| Use **creator language** (pack, clip, hook, export) | Expose provider names, model IDs, or internal registry keys |
| Keep **Gallery → Reuse** as the retention loop | Treat outputs as one-off downloads |

---

## Launch priorities (ordered — do not invert)

### 1. Social Asset Pack is the primary differentiator

- **Hero workflow:** one idea → images + motion clip + hooks + captions + formats.
- **Free preview** (no credits, no image/video provider calls).
- **Paid render:** 45 Credits, shown before render; partial refunds on failure.
- **Default Create tab** when user opens the studio.
- **First card** in the dashboard action grid.

**Source of truth:** `app/lib/packs/social-asset-pack.ts`, `enableSocialAssetPack`.

---

### 2. Creative Score is the improvement / revenue loop

- **Free** score on generated assets (no provider calls for scoring).
- Surfaces **Improve this asset** with credit cost shown before any paid variant.
- Post-generation panel and gallery must route to score → improve → re-render or export.
- Score copy uses **scroll-stop potential** framing — no guaranteed performance claims.

**Source of truth:** `app/lib/creative-score/`, `enableCreativeScore`, `revenue-next-actions.ts`.

---

### 3. Credit packages are consistent everywhere

Single package table — **do not duplicate prices in UI copy**:

| Key | Label | Credits | Price |
|-----|-------|---------|-------|
| `starter` | Starter | 100 | €9 |
| `professional` | Creator | 500 | €29 |
| `ultimate` | Pro | 2,000 | €79 |

- Landing, dashboard credits, credits modal, and checkout use `CREDIT_PACKAGES` (`app/lib/billing/credit-packages.ts`).
- Larger packs must always show better per-credit value vs Starter.
- Custom top-up (€0.10/credit) is optional flex — packages remain the recommended path.
- **Stripe webhooks are out of scope** for feature work — never modify without a dedicated billing task.

---

### 4. Dashboard prioritizes three primary actions

**Order (left → right, first = default):**

1. **Social Asset Pack**
2. **Create Image**
3. **Create Motion Video** (25 Credits)

Secondary optimize flows (Hooks & Captions, Export Pack) live in **Creator Toolbox**, not the primary grid.

**Source of truth:** `LAUNCH_PRIMARY_DASHBOARD_ACTIONS` in `app/lib/config/launch.ts`, `getLaunchHomeEngines()`.

---

### 5. Creator Toolbox is secondary but visible

- Grouped tools below the primary Create surface.
- Runnable today: style variant, creative score, hooks/captions, export pack, export asset.
- Locked tools stay **visible** with honest status badges — never removed from the registry.

---

### 6. Locked tools are visible workflows — not runnable

| Status | Meaning | Credits |
|--------|---------|---------|
| **Available / Credits required** | Runnable after credit check | Actual cost before render |
| **Preview** | Plan + detail panel only | Estimated future cost in panel only |
| **Request access** | Waitlist / early access | No charge |
| **Pro workflow** | Plan-gated | Estimated future cost in panel only |

- `assertToolCanRun` must pass before any credit consumption or provider call.
- Experimental **module routes** (`/dashboard/train`, `/dashboard/lipsync`, etc.) stay disabled via `launch.ts` module flags + `guardLaunchModule`.
- Reference / edit workflows may stay **preview-visible** while their module flags remain enabled for UX — they still cannot render until validated.

**Never activate unvalidated tools for production rendering.**

---

### 7. Trust and rights copy

Required user-facing themes (EN + DE):

- Credits are shown **before** rendering; failed paid jobs refund per policy.
- **Export/download** of already-generated assets is free; HD upscale is a separate paid action.
- **Training / identity** tools: user must own or have rights to training assets; no public figures or third-party likenesses.
- Prompt Assist improves wording — it does not bypass credit gates or provider validation.
- No fake social proof, guaranteed virality, or “unlimited” generation claims.

**Copy hubs:** `lib/copy/launch-user-copy.ts`, `app/lib/tools/creator-tools.ts` (detail panels), landing `magnificContent.ts`.

---

### 8. No dev / debug UI in production

| Surface | Launch rule |
|---------|-------------|
| `/internal` admin console | Admin email allowlist only — never linked from user nav |
| Engine / action validation APIs | Internal auth only |
| Provider names, registry IDs, raw model paths | Never in user UI |
| `showUnvalidatedFeatures` | `false` in production |
| `showProviderNamesToUsers` | `false` always |

---

### 9. No expensive generation before credit validation

Mandatory order on every paid path:

```text
auth → tool gate (assertToolCanRun) → credit balance check → consume credits → provider call
```

- Unified generate, pack render, krea image, engine generate, motion transfer — all gated.
- Open proxies (`/api/studio/fal`, `/api/krea/generate`) must not bypass the gate.
- Preview endpoints (pack preview, export manifest, hooks/captions, creative score) never call `consume_user_credits`.

---

### 10. Build must pass

```bash
npm run build
```

Required before merge or deploy for any launch-priority change.

---

## MVP feature matrix

| Capability | Launch flag | Runnable | Notes |
|------------|-------------|----------|-------|
| Social Asset Pack | `enableSocialAssetPack` | Yes | Primary differentiator |
| Create Image | `enableImageGeneration` | Yes | Modes show cost before render |
| Create Motion Video | `enableTextToVideo` | Yes | 25 Credits |
| Prompt Assist | `enablePromptAssist` | Yes | Free assist, no provider render |
| Creative Score | `enableCreativeScore` | Yes | Free; drives improve loop |
| Hooks & Captions | (toolbox) | Yes | Free copy generation |
| Export Pack | `enableGallery` | Yes | Free manifest / download |
| Gallery | `enableGallery` | Yes | Reuse loop |
| Credits / checkout | `enableCredits` | Yes | Packages from single source |
| Style variant | — | Yes | Paid, gated |
| Reference / Edit / Enhance | module preview flags | **No** | Preview panel only |
| Animate / LipSync / Avatar / 3D / Motion / Audio / Training | module flags **off** | **No** | Visible in toolbox; routes blocked |

---

## Explicit non-goals (launch lock)

- Do **not** add broad new features under this lock.
- Do **not** touch **Stripe webhooks**.
- Do **not** change **provider routing** or engine catalog mappings.
- Do **not** activate **unvalidated** tools for rendering.
- Do **not** expose **provider or model names** to users.
- Do **not** expose **raw model IDs** in UI.

---

## File map

| Concern | Location |
|---------|----------|
| Launch flags & priority order | `app/lib/config/launch.ts` |
| Create page engine list | `app/lib/config/launch-nav.ts` |
| Tool run gate | `app/lib/tools/assert-tool-can-run.ts` |
| Credit packages | `app/lib/billing/credit-packages.ts` |
| Pack credits | `app/lib/packs/social-asset-pack.ts` |
| Post-gen revenue loop | `app/lib/studio/revenue-next-actions.ts` |
| Creator tools registry | `app/lib/tools/creator-tools.ts` |
| QA checklist | `docs/LAUNCH_CHECKLIST.md` |

---

## Change control

1. Propose change against a numbered priority above.
2. Confirm no non-goals are violated.
3. Run `npm run build`.
4. Update this doc if priority order or MVP matrix changes.

**Lock version:** `1` (see `LAUNCH_PRIORITY_LOCK_VERSION` in `launch.ts`).

---

## Sign-off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Product | | | ☐ |
| Engineering | | | ☐ |
