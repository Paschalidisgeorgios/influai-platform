# InfluExAi — Production QA Script

**Purpose:** Repeatable end-to-end test on production (or staging with production-like config).  
**Estimated time:** 25–40 minutes  
**Prerequisites:** Test user account, known starting credit balance, browser (Chrome recommended), optional mobile device.

**Production URL:** `https://influai-platform.vercel.app`

Record: tester name, date, environment, starting credits, ending credits.

---

## Before you start

1. Open an incognito window (clean session).
2. Note starting credits: ________
3. Confirm you are **not** using a production card unless intentional — use Stripe test mode if configured.

---

## 1. Authentication

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 1.1 | Open `/login` | Login page loads; InfluExAi branding | ☐ |
| 1.2 | Sign in with test user | Redirect to `/dashboard` | ☐ |
| 1.3 | Refresh dashboard | Still authenticated | ☐ |

---

## 2. Credits (baseline)

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 2.1 | Check credits badge (header) | Number matches account | ☐ |
| 2.2 | Open **Credits** in sidebar | Balance and packages visible | ☐ |
| 2.3 | Click refresh on credits | Balance reloads without error | ☐ |

**Starting credits recorded:** ________

---

## 3. Standard image generation (AI Agent)

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 3.1 | Open **AI Agent** | Agent UI loads; Image Mode visible | ☐ |
| 3.2 | Confirm only **Standard Image** is Live; other modes disabled | Planned badges on Fast Draft / Premium / Reference Edit | ☐ |
| 3.3 | Enter prompt, e.g. `Premium product photo, soft studio lighting, no text` | Prompt in textarea | ☐ |
| 3.4 | Press **Enter** (not Shift+Enter) | Generation starts; no page navigation | ☐ |
| 3.5 | Observe immediately after submit | Processing state visible in Agent | ☐ |
| 3.6 | Wait for completion | Status becomes completed; image visible in result panel | ☐ |
| 3.7 | Click **Open image** | Image opens in new tab or viewer | ☐ |
| 3.8 | Check credits badge | Credits decreased by **1** | ☐ |

**Credits after generation:** ________ (expect starting − 1)

---

## 4. Gallery integration

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 4.1 | Click **View in Gallery** from Agent result | Gallery view opens | ☐ |
| 4.2 | Find the new generation | Card shows completed status; image renders | ☐ |
| 4.3 | Open detail / modal if available | Prompt and metadata visible | ☐ |

---

## 5. Favorite

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 5.1 | Toggle **Favorite** on the generation | Favorite state updates (icon/badge) | ☐ |
| 5.2 | Filter or verify favorites list | Item appears under favorites filter | ☐ |
| 5.3 | Toggle favorite off | State reverts | ☐ |

---

## 6. Regenerate

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 6.1 | Click **Regenerate** on a completed item | Agent opens with prompt prefilled | ☐ |
| 6.2 | Submit again (Enter) | New processing job; new result (credits −1 again) | ☐ |

---

## 7. Delete

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 7.1 | Delete a **test** generation (not your only asset) | Confirm dialog; item removed from gallery | ☐ |
| 7.2 | Refresh gallery | Deleted item does not return | ☐ |

---

## 8. Style profile

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 8.1 | Open **Style Profiles** | Manager loads | ☐ |
| 8.2 | Create profile with name + short creative direction | Profile saved | ☐ |
| 8.3 | Upload one visual reference image | Reference appears; cover if first upload | ☐ |
| 8.4 | Return to **AI Agent**; select profile in dropdown | Profile name shown | ☐ |
| 8.5 | Generate with short prompt + profile | Completes; uses profile flow (still standard workflow) | ☐ |

---

## 9. Social format (smoke)

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 9.1 | Select **YouTube Thumbnail** (or TikTok) format | Format label updates; ratio shown | ☐ |
| 9.2 | Generate short prompt, e.g. `youtube thumbnail luxury cars city at night` | Completes; wide or vertical per format | ☐ |

---

## 10. Localization (optional)

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 10.1 | Switch language to **Deutsch** | Dashboard strings in German | ☐ |
| 10.2 | Reload page | Language persists (`localStorage`) | ☐ |
| 10.3 | Switch back to **English** | UI returns to English | ☐ |

---

## 11. Stripe checkout (optional — uses real payment in live mode)

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 11.1 | Open **Credits** | Buy buttons visible | ☐ |
| 11.2 | Click **Buy Starter** (or Professional) | Redirect to Stripe Checkout | ☐ |
| 11.3 | Complete or cancel payment | Success → credits increase; cancel → no charge | ☐ |
| 11.4 | Return to dashboard `?checkout=success` or `cancelled` | Status message appropriate | ☐ |

**Credits after checkout:** ________

---

## 12. Mobile smoke (optional)

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 12.1 | Repeat steps 3.3–3.6 on phone | Prompt usable; result visible | ☐ |
| 12.2 | Gallery scroll and filters | Usable without horizontal overflow | ☐ |

---

## 13. Failure and refund smoke (optional)

Use only on a test account. Temporarily misconfigure a non-production worker flag or use an invalid reference source to force a provider failure after credits are debited.

| Step | Action | Expected result | Pass |
|------|--------|-----------------|------|
| 13.1 | Note credits before failed job | Balance recorded | ☐ |
| 13.2 | Trigger a generation that fails in the worker | Agent/Gallery show **Generation failed** and **Credits were refunded** | ☐ |
| 13.3 | Check credits badge | Balance matches pre-job (no net debit) | ☐ |
| 13.4 | In Supabase: `generations` row | `status = failed`, `credits_used = 0`, `error_message` set | ☐ |
| 13.5 | In Supabase: `credit_transactions` | One `refund` with `source = generation_worker_failure` | ☐ |
| 13.6 | Retry worker manually on same `generationId` (engineering) | No second refund; row stays `failed` | ☐ |

See `docs/OPERATIONS_RUNBOOK.md` §10 for SQL queries.

---

## 14. MVP stability acceptance

Run on a test account with sufficient credits. Record starting balance: ________

### Image modes (one smoke each if flags enabled)

| Mode | Credits | Step | Expected | Pass |
|------|---------|------|----------|------|
| Standard Image | 1 | Submit short prompt via Enter | Processing → completed; image in Agent + Gallery | ☐ |
| Fast Draft | 1 | Select Fast Draft (Beta), generate | Completes; credits −1 | ☐ |
| Premium Image | 3 | Select Premium (Beta), generate | Completes; credits −3 | ☐ |
| Reference Edit | 5 | Upload source + instruction, generate | Completes; credits −5 | ☐ |
| Brand Assets | 4 | Select Brand Assets (Beta), product prompt | Completes; credits −4; minimal fake text on packaging | ☐ |

### Insufficient credits

| Step | Action | Expected | Pass |
|------|--------|----------|------|
| 14.1 | Reduce balance below mode cost (or use account with 0 credits) | — | ☐ |
| 14.2 | Submit generation | Agent shows **Not enough credits**; mode cost shown; **Buy Credits** / **Open Credits** visible | ☐ |
| 14.3 | API response | HTTP **402**, `reason: insufficient_credits`, correct `requiredCredits` | ☐ |
| 14.4 | Credits badge | No debit occurred | ☐ |

### Active generation limit

| Step | Action | Expected | Pass |
|------|--------|----------|------|
| 14.5 | Start 2 generations without waiting for completion | Both enter `processing` | ☐ |
| 14.6 | Start a 3rd generation | HTTP **429**, `reason: active_generation_limit`; Agent shows wait message; **no credit debit** | ☐ |
| 14.7 | Rapid double-click / Enter spam on single job | Only one job queued | ☐ |

### Refund / failure check

| Step | Action | Expected | Pass |
|------|--------|----------|------|
| 14.8 | Force provider failure (optional, test env) | `generations.status = failed`, `credits_used = 0` | ☐ |
| 14.9 | Supabase `credit_transactions` | One refund with `source = generation_worker_failure` | ☐ |
| 14.10 | Gallery failed card | Error message + credits refunded hint | ☐ |

---

## 15. Lip Sync Studio (Beta, flags required)

Prerequisites: `ENABLE_FAL_LIP_SYNC=true`, `NEXT_PUBLIC_ENABLE_FAL_LIP_SYNC=true`, `FAL_KEY` set, buckets from `LIP_SYNC_STORAGE_SQL.md`, columns from `LIP_SYNC_REQUIRED_SQL.md`.

| Step | Action | Expected | Pass |
|------|--------|----------|------|
| 15.1 | Open AI Agent → Lip Sync tab | Tab visible; Coming soon when flags off | ☐ |
| 15.2 | Generate without source media | Blocked in UI; API 400 if forced | ☐ |
| 15.3 | Generate without audio | Blocked in UI; API 400 if forced | ☐ |
| 15.4 | Upload source + audio, submit | 30 credits debited; `workflow = lip_sync` | ☐ |
| 15.5 | Completed job | `video_url` set; Agent + Gallery play `<video>` | ☐ |
| 15.6 | Provider failure (test env) | `failed`, refund, `credits_used = 0` | ☐ |
| 15.7 | Cinema / Omni / Social chips | Roadmap only — not clickable, no API | ☐ |

---

## 16. Studio Suite navigation (UI only)

| Step | Action | Expected | Pass |
|------|--------|----------|------|
| 16.1 | Open Dashboard sidebar | **Live Studio**, **Creative Modes**, **Expansion / Planned** groups visible | ☐ |
| 16.2 | Creative Modes list | Each mode shows status badge + credit cost + short “best for” | ☐ |
| 16.3 | AI Agent → Studio Modes overview | Table/cards list all modes with Live/Beta/Planned | ☐ |
| 16.4 | Credits view | Workflow cost list + “Credits are charged based on the selected workflow.” | ☐ |
| 16.5 | Planned sidebar rows | Cinema, Omni, Social Planner, Brand Safety, Watermarked Promo — disabled, lock icon | ☐ |

---

## Failure log

| Step | What failed | Screenshot / log | Ticket |
|------|-------------|------------------|--------|
| | | | |

---

## Sign-off

| Result | |
|--------|--|
| **Overall** | Pass ☐ / Fail ☐ |
| Tester | |
| Date | |
