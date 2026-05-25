# InfluExAi — Launch Checklist

**Purpose:** Pre-launch and post-deploy verification for the InfluExAi MVP.  
**Production URL:** `https://influai-platform.vercel.app`  
**Scope:** Standard Image generation, Credits, Stripe, Dashboard — no video/lip-sync live modes.

Use this checklist before announcing launch and after every production deploy that touches user-facing flows.

---

## How to use

- Mark each item **Pass** / **Fail** / **N/A** with date and tester initials.
- Failures block launch until resolved or explicitly accepted with a documented workaround.
- Do not paste secrets into this document.

---

## 1. Landing page

| # | Check | Pass |
|---|--------|------|
| 1.1 | Home loads without console errors (desktop) | ☐ |
| 1.2 | Hero images visible; faces not badly cropped | ☐ |
| 1.3 | CTAs work: Open Studio / Start creating / Explore features → login or dashboard path | ☐ |
| 1.4 | Gold hover states on links and buttons | ☐ |
| 1.5 | Pricing visible: Starter €9 / 100, Professional €29 / 500 (Recommended), Ultimate €79 / 2000 | ☐ |
| 1.6 | Copy states: **1 standard image = 1 credit** | ☐ |
| 1.7 | Roadmap section shows Coming soon / Planned modules — not as Live | ☐ |
| 1.8 | No live promises for Face Pro, LoRA, Replicate, fal.ai, video generation | ☐ |
| 1.9 | EN / DE language toggle works (landing) | ☐ |
| 1.10 | Mobile layout: header, hero, pricing readable | ☐ |

---

## 2. Login & auth

| # | Check | Pass |
|---|--------|------|
| 2.1 | `/login` loads; branding shows **InfluExAi** | ☐ |
| 2.2 | Valid user can sign in and reach `/dashboard` | ☐ |
| 2.3 | Invalid credentials show clear error (no stack trace) | ☐ |
| 2.4 | Session persists on refresh | ☐ |
| 2.5 | Logout returns to safe state | ☐ |
| 2.6 | No Face/LoRA/video live claims on login page | ☐ |

---

## 3. Dashboard shell

| # | Check | Pass |
|---|--------|------|
| 3.1 | Sidebar: AI Agent, Asset Gallery, Style Profiles, Credits | ☐ |
| 3.2 | Expansion modules visible, **disabled**, badges (Coming soon / Planned / Roadmap) | ☐ |
| 3.3 | Credits badge top-right shows balance | ☐ |
| 3.4 | Language selector EN/DE works; persists after reload | ☐ |
| 3.5 | Mobile header: menu, credits, language — no overlap | ☐ |
| 3.6 | No layout breaks on iPhone-width viewport | ☐ |

---

## 4. Credits

| # | Check | Pass |
|---|--------|------|
| 4.1 | Credits view shows current balance | ☐ |
| 4.2 | Packages: Starter / Professional / Ultimate with correct EUR and credit counts | ☐ |
| 4.3 | Professional marked Recommended | ☐ |
| 4.4 | Watermarked Promo shown as **Planned** — no purchase button | ☐ |
| 4.5 | Refresh balance works | ☐ |

---

## 5. Stripe checkout

| # | Check | Pass |
|---|--------|------|
| 5.1 | Buy Starter opens Stripe Checkout (test or live per environment) | ☐ |
| 5.2 | Successful payment redirects with `?checkout=success` | ☐ |
| 5.3 | Cancelled payment redirects with `?checkout=cancelled` | ☐ |
| 5.4 | Credits increase after successful payment (webhook) | ☐ |
| 5.5 | `packageKey` unchanged: `starter`, `professional`, `ultimate` | ☐ |

---

## 6. Standard generation (AI Agent)

| # | Check | Pass |
|---|--------|------|
| 6.1 | Image Mode: only **Standard Image** selectable; others Planned/disabled | ☐ |
| 6.2 | Enter submits; Shift+Enter adds newline | ☐ |
| 6.3 | Processing visible immediately after submit | ☐ |
| 6.4 | Completed image appears in Agent result panel | ☐ |
| 6.5 | Open image works | ☐ |
| 6.6 | View in Gallery switches to gallery with asset | ☐ |
| 6.7 | Create another clears result state appropriately | ☐ |
| 6.8 | Social format selection works (keys unchanged: `square`, `tiktok`, etc.) | ☐ |
| 6.9 | Style profile optional selection works | ☐ |
| 6.10 | Failed generation shows error; credits refunded per policy | ☐ |

---

## 7. Asset gallery

| # | Check | Pass |
|---|--------|------|
| 7.1 | Gallery lists generations | ☐ |
| 7.2 | Status badges: Processing / Completed / Failed (localized if DE) | ☐ |
| 7.3 | Favorite toggle works | ☐ |
| 7.4 | Delete works with confirmation | ☐ |
| 7.5 | Regenerate loads prompt back into Agent | ☐ |
| 7.6 | Broken image state + “Open image directly” when URL fails | ☐ |
| 7.7 | Mobile filters usable | ☐ |

---

## 8. Style profiles

| # | Check | Pass |
|---|--------|------|
| 8.1 | Create style profile | ☐ |
| 8.2 | Upload visual reference; cover reference set | ☐ |
| 8.3 | Disclaimer: not fixed identity models | ☐ |
| 8.4 | No training / Face Pro / LoRA promises in UI | ☐ |
| 8.5 | Delete profile works | ☐ |
| 8.6 | Generate with profile selected in Agent | ☐ |

---

## 9. Localization

| # | Check | Pass |
|---|--------|------|
| 9.1 | Dashboard DE: sidebar, agent, gallery, credits readable | ☐ |
| 9.2 | User prompts **not** auto-translated | ☐ |
| 9.3 | `packageKey` and `outputFormat` keys not translated in API payloads | ☐ |

---

## 10. Vercel production

| # | Check | Pass |
|---|--------|------|
| 10.1 | `npm run build` passes locally on `main` | ☐ |
| 10.2 | Production deploy succeeds (`npx vercel --prod`) | ☐ |
| 10.3 | Aliased URL loads: `https://influai-platform.vercel.app` | ☐ |
| 10.4 | Env vars set in Vercel project (see `ENVIRONMENT_VARIABLES.md`) | ☐ |
| 10.5 | No missing env errors in Vercel runtime logs after smoke test | ☐ |

---

## 11. Git & release hygiene

| # | Check | Pass |
|---|--------|------|
| 11.1 | `git status` clean on release branch | ☐ |
| 11.2 | `main` pushed to origin | ☐ |
| 11.3 | No `.env.local` or secrets committed | ☐ |
| 11.4 | Internal roadmap docs present (`docs/ROADMAP_*.md`) | ☐ |

---

## 12. Launch sign-off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Product | | | ☐ |
| Engineering | | | ☐ |
| Operations | | | ☐ |

**Notes:**

---
