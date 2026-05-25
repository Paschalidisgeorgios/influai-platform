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
