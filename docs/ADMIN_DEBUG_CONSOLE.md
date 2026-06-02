# Admin Debug Console — InfluExAI

Internal launch monitoring for authorized operators. Normal users never see this page or its metadata.

Route: **`/internal`**  
Implementation: `app/internal/page.tsx`, `app/lib/admin/guards.ts`, `app/components/admin/*`

## Access

1. Sign in with a Supabase account (same auth as the creator studio).
2. Your email must appear in the server-only **`ADMIN_EMAILS`** allowlist.

```env
ADMIN_EMAILS=you@company.com,teammate@company.com
```

- Comma-separated, case-insensitive.
- **`ADMIN_EMAILS` is never sent to the browser.**
- Unauthenticated visitors are redirected to `/auth?next=/internal`.
- Authenticated users not on the list see a calm **Access denied** page (not the registry data).

There is no separate admin role in Supabase yet — this is a temporary launch allowlist.

## Required env vars

| Variable | Purpose |
|----------|---------|
| `ADMIN_EMAILS` | Who may open `/internal` |
| `NEXT_PUBLIC_SUPABASE_URL` | Session check |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Session check |
| `SUPABASE_SERVICE_ROLE_KEY` | Read generations + credit_transactions (server only) |

Optional (for dry validation button):

- Existing engine catalog + smoke test modules — no extra secret required when invoked via server action.

## Sections

### Engine Registry

Full launch catalog for debugging:

| Column | Meaning |
|--------|---------|
| Engine | Studio engine id (copy button) |
| Group | Catalog group (image, video, etc.) |
| Provider | `krea`, `fal`, or `internal` |
| Output | `image`, `video`, … |
| Status | `active`, `mapped_but_unvalidated`, `validation_blocked_insufficient_balance`, … |
| Credits | Per-run credit cost |
| Validation | `passed`, `not_tested`, `blocked`, `failed` |
| User / Run | `canShowToUser` / `canRunGeneration` flags |
| Env vars | **Names only** — e.g. `FAL_KEY`, never values |
| Model ID | Internal registry / endpoint id |

**Filters:** All · Active only · Inactive only

### Action Registry

| Column | Meaning |
|--------|---------|
| Action | Action id (copy button) |
| Label | User-facing label |
| Output | Result type |
| Status | `active`, `mapped_but_unvalidated`, … |
| Default engine | Resolved default |
| Allowed engines | MVP bindings |
| Est. credits | Minimum / fixed cost |
| Visible | Shown to users when active |

**Filters:** All · Active only · Inactive only

### Generation Jobs

Last 50 rows from **`generations`**:

| Column | Meaning |
|--------|---------|
| Created | Job timestamp |
| User | Masked email or truncated user id |
| Action / Engine | Inferred from workflow + model (best effort) |
| Output | `image`, `video`, or `other` |
| Status | `processing`, `completed`, `failed` |
| Charged | `credits_used` |
| Refunded | Matched refund tx when status is `failed` (heuristic) |
| Asset | Whether `image_url` or `video_url` exists |
| Error | Short internal message — provider names redacted |

**Filters:** All · Failed · Image · Video

No raw provider payloads or API keys are shown.

### Credits & Refunds

Last 50 rows from **`credit_transactions`**:

| Column | Meaning |
|--------|---------|
| Amount | Positive = purchase/refund credit; negative = usage |
| Type | `purchase`, `usage`, `refund`, … |
| Reason | `source` field (truncated) |
| Generation | UUID extracted from source when present |

## Safe admin actions (MVP)

| Action | Description |
|--------|-------------|
| Re-run dry catalog validation | Server action — catalog policy + engine/action smoke tests (dry only) |
| Copy engine / action id | Clipboard helper |

**Not included (by design):**

- Manual credit editing
- Billing / Stripe changes
- Provider key editing
- Destructive deletes

## What normal users see vs admins

| Data | Normal user UI | Admin console |
|------|----------------|---------------|
| Provider names | Hidden | Visible |
| Raw model / endpoint IDs | Hidden | Visible |
| Engine validation status | Hidden | Visible |
| Internal provider errors | Generic copy only | Short sanitized error |
| Env var values | Never | Never |
| `ADMIN_EMAILS` | Never | Never |
| Credit ledger | Own balance only | Recent events (masked users) |

User-facing studio copy lives in `lib/copy/launch-user-copy.ts` and generation error helpers — those remain white-label.

## Launch monitoring checklist

Before go-live, open `/internal` as an allowlisted admin:

- [ ] All MVP engines show `status: active` and `validation: passed`
- [ ] No unexpected engine is `active` without validation
- [ ] `create_image`, `create_video`, and helper actions are `active`
- [ ] Dry catalog validation passes (button on console)
- [ ] Recent generation jobs: low `failed` rate, assets present on `completed`
- [ ] Credit events: purchases from Stripe webhook, usage/refunds align with failures
- [ ] Blocked engines (e.g. `fal_kling_v3_i2v`) remain inactive — `validation_blocked_insufficient_balance`, not `failed_validation`

Related docs:

- `docs/ENGINE_VALIDATION_RUNBOOK.md` — smoke tests and promotion workflow
- `docs/ENGINE_VALIDATION_POLICY.md` — status model
- `docs/LAUNCH_CHECKLIST.md` — full launch gate

## Security notes

- Page is server-rendered; registry queries run on the server with service role where needed.
- Session is validated via Supabase cookies + `getUser()` (not client-trusted JWT alone).
- Do not link `/internal` from public navigation.
- Rotate `ADMIN_EMAILS` when team access changes.
