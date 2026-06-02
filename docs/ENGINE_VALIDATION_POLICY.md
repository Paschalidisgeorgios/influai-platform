# Engine Validation Policy — InfluExAI

This document defines how engines move from **mapped** to **active** in the InfluExAI Creator Studio.

Implementation: `app/lib/engines/validate-engine-catalog.ts` · `app/lib/engines/fal-catalog.ts`

## Status model

| Status | User-facing | Can run | Meaning |
|--------|-------------|---------|---------|
| `active` | Yes | Yes | Live-validated and promoted |
| `mapped_but_unvalidated` | No | No | Endpoint mapped; awaiting validation |
| `validation_blocked_insufficient_balance` | No | No | Validation blocked by provider balance — not a technical failure |
| `unavailable_plan_limited` | No | No | Krea (or other) plan limit |
| `failed_validation` | No | No | Technical validation failure (schema, 4xx/5xx, bad output) |
| `disabled` | No | No | Intentionally off |

## Validation metadata (every engine)

```ts
{
  validationStatus: "passed" | "not_tested" | "blocked" | "failed",
  validationReason?: string,
  lastValidatedAt?: string,
  canShowToUser: boolean,
  canRunGeneration: boolean
}
```

Rules:

- **`active`** → `canShowToUser: true`, `canRunGeneration: true`
- **All other statuses** → `canShowToUser: false`, `canRunGeneration: false`

Access flags are derived from status in `fal-catalog.ts` and set explicitly on Krea entries in `catalog.ts`.

## What counts as “validated”

An engine is eligible for **`active`** only when:

1. A **live generation test** completes successfully against the real provider API.
2. Input schema matches the documented fal/Krea contract.
3. Output is usable (URL or asset reference returned).
4. Required server env vars are present (`FAL_KEY` for fal, `KREA_API_KEY` for Krea).
5. A **provider router handler** is registered for fal engines.

Balance exhaustion during validation sets `validationStatus: "blocked"` and status `validation_blocked_insufficient_balance` — **not** `failed_validation`.

## Catalog validator

`validateEngineCatalog()` checks:

- Exactly **one** active fal engine: `fal_kling_v3_t2v`
- Every **active** engine has `provider`, `outputType`, `credits`, `canRunGeneration: true`
- Active fal engines have required env vars (names only — secrets never logged)
- Active fal engines have a registered handler in `FAL_MVP_GENERATION_HANDLERS`
- **Inactive** engines cannot have `canShowToUser` or `canRunGeneration` true
- Unified `ENGINE_REGISTRY` matches fal studio policy

`assertEngineCatalogValidInDevelopment()` throws readable errors in development when policy is violated. It does **not** run in production builds.

## Runtime guards (no credits on inactive engines)

1. **`resolveEngineForGeneration()`** — rejects non-active / non-runnable engines before routing.
2. **`assertFalEngineRunnable()`** — fal-router gate; inactive engines throw safe user message.
3. **`runProviderGeneration()`** — validates context before any provider call; fal path uses `runFalProviderGeneration()`.
4. **Credit charging** — remains after successful generation only (existing refund-on-failure behavior).

Inactive engines receive: *"This creation mode is not available yet. No credits were charged."*

## MVP active engines (launch)

### Krea (image)

- `krea_flux_11_pro_ultra`
- `krea_flux_fast_draft`
- `krea_nano_realtime`
- `smart_auto_pilot`

### fal.ai

- `fal_kling_v3_t2v` — **only** active fal engine

### Blocked (re-test after balance top-up)

- `fal_kling_v3_i2v` — `validation_blocked_insufficient_balance`

## UI exposure

Normal pickers filter via:

- `getActiveEngines()` / `getUserFacingEngines()` in `catalog.ts`
- `launch-engine-picker.ts` — only active launch values in model pickers
- `sanitizeUserFacingEngineText()` — hides provider names from labels

Raw fal endpoint IDs and `FAL_KEY` must never reach the client.

## Admin validation workflow

1. Ensure provider balance and `FAL_KEY` are configured.
2. Call `POST /api/admin/ai/validate-models` (or equivalent script).
3. Record result in catalog validation metadata.
4. Promote only on `passed`; update handler registration.
5. Run `npm run build` and confirm `validateEngineCatalog()` passes locally.

## Do not break

When changing validation policy, preserve:

- Krea image generation (`/api/krea/image/generate`)
- Active fal T2V (`fal_kling_v3_t2v`)
- Supabase auth, Stripe billing/webhooks, Gallery, Credits
