# Engine Validation Runbook — InfluExAI

Safe smoke validation for launch engines and MVP actions. Only **live-validated** engines may be promoted to `active`.

Implementation:

- `app/lib/validation/engine-smoke-tests.ts`
- `app/lib/validation/action-smoke-tests.ts`
- `app/api/internal/validate-engines`
- `app/api/internal/validate-actions`

Policy reference: `docs/ENGINE_VALIDATION_POLICY.md`

## Active launch set (MVP)

**Engines**

| Engine ID | Output |
|-----------|--------|
| `krea_flux_11_pro_ultra` | image |
| `krea_flux_fast_draft` | image |
| `krea_nano_realtime` | image |
| `smart_auto_pilot` | image |
| `fal_kling_v3_t2v` | video |

**Actions**

| Action ID | Notes |
|-----------|-------|
| `create_image` | Allowed engines must all be active |
| `create_video` | Defaults to `fal_kling_v3_t2v` |
| `improve_prompt` | Zero-cost internal |
| `check_creative_score` | Zero-cost internal |
| `create_style_variant` | Defaults to `krea_flux_fast_draft` |

Inactive engines/actions are **skipped** by default. Pass `includeInactive=true` to list them with `status: "skipped"`.

## Required environment variables

| Variable | Required for | Notes |
|----------|--------------|-------|
| `INTERNAL_VALIDATION_SECRET` | Internal routes | Shared secret for `x-internal-validation-secret` header |
| `KREA_API_KEY` | Krea dry + live tests | Never returned in API responses |
| `ENABLE_KREA_PROVIDER` | Krea image engines | Must not be `false` when Krea is launch-active |
| `FAL_KEY` | fal video dry + live tests | Checked as present/absent only — value never exposed |
| `ENABLE_FAL_PROVIDER` | fal video engine | Must not be `false` when fal T2V is launch-active |
| `RUN_REAL_PROVIDER_SMOKE_TESTS` | Live provider calls | Set to `true` only when you intend to bill provider usage |

Optional (existing admin validation):

- `ADMIN_DEV_SECRET` — separate admin model validation routes (not used by internal routes)

## Run validation locally

1. Start the dev server:

```bash
npm run dev
```

2. Set secrets in `.env.local`:

```env
INTERNAL_VALIDATION_SECRET=your-long-random-secret
KREA_API_KEY=...
FAL_KEY=...
```

3. **Dry validation** (default — no provider generation, safe before launch):

```bash
curl -s -X POST http://localhost:3000/api/internal/validate-engines \
  -H "Content-Type: application/json" \
  -H "x-internal-validation-secret: YOUR_SECRET" \
  | jq

curl -s -X POST http://localhost:3000/api/internal/validate-actions \
  -H "Content-Type: application/json" \
  -H "x-internal-validation-secret: YOUR_SECRET" \
  | jq
```

4. **Include inactive catalog entries** (skipped, not executed):

```bash
curl -s "http://localhost:3000/api/internal/validate-engines?includeInactive=true" \
  -H "x-internal-validation-secret: YOUR_SECRET" | jq
```

5. **Live provider smoke tests** (charges provider usage — run sparingly):

```bash
# In .env.local:
RUN_REAL_PROVIDER_SMOKE_TESTS=true

curl -s -X POST http://localhost:3000/api/internal/validate-engines \
  -H "Content-Type: application/json" \
  -H "x-internal-validation-secret: YOUR_SECRET" \
  -d '{"runRealProviderTests": true}' | jq
```

Or pass `runRealProviderTests=true` in the POST body without changing env.

## Dry vs live provider smoke tests

| Mode | Env | Provider API calls | Use when |
|------|-----|-------------------|----------|
| **Dry** (default) | `RUN_REAL_PROVIDER_SMOKE_TESTS` unset or not `true` | None | Pre-launch CI, daily checks, registry/router integrity |
| **Live** | `RUN_REAL_PROVIDER_SMOKE_TESTS=true` or body flag | Yes — tiny Krea image prompt; fal T2V only when explicitly enabled | Final promotion sign-off before setting `status: active` |

**Dry checks include:**

- Engine exists in registry and `status === "active"`
- Router handler / resolution path exists
- Provider keys present server-side (boolean only)
- Smart Auto-Pilot resolves only active MVP image engines
- Catalog policy validator passes (`catalogOk: true`)

**Live checks add:**

- One minimal Krea image generation per active Krea engine (via existing admin validation harness — no user credits)
- One fal T2V live test when enabled (expensive — do not run in CI by default)

## Why `fal_kling_v3_i2v` is blocked, not failed

`fal_kling_v3_i2v` uses status **`validation_blocked_insufficient_balance`**, not `failed_validation`.

| Status | Meaning |
|--------|---------|
| `failed_validation` | Technical failure — bad schema, 4xx/5xx, unusable output |
| `validation_blocked_insufficient_balance` | Provider account balance too low to run validation — **not a code defect** |

The engine remains mapped in the catalog with `canRunGeneration: false`. Smoke tests skip it by default. Do **not** promote it to `active` until balance is topped up and a live test passes.

Related action `animate_image` stays `mapped_but_unvalidated` until the engine is promoted.

## Promote `mapped_but_unvalidated` → `active`

Follow every step — do not skip dry validation or live smoke tests.

1. **Add exact model ID** — Map the studio engine to the verified provider registry id in `fal-catalog.ts` or Krea catalog (`catalog.ts`).
2. **Add provider router handler** — Register generation in `fal-router.ts` / Krea image route; ensure `FAL_MVP_GENERATION_HANDLERS` or Krea path includes the engine.
3. **Run dry validation** — `POST /api/internal/validate-engines` without live flag; confirm `ok: true` and `catalogOk: true`.
4. **Run real provider smoke test** — Set `RUN_REAL_PROVIDER_SMOKE_TESTS=true`; confirm `status: "passed"` for the engine.
5. **Confirm credits** — Verify `credits` on the catalog entry matches expected billing; run one user-path generation in staging.
6. **Confirm gallery output** — Asset appears in gallery with correct `outputType` and no provider leakage in UI.
7. **Set status `active`** — Update catalog entry: `status: "active"`, `canShowToUser: true`, `canRunGeneration: true`, validation metadata `passed`.
8. **Rebuild** — `npm run build` and re-run dry validation on the promoted engine set.

## Response shapes

**Engine result**

```json
{
  "engineId": "krea_flux_fast_draft",
  "provider": "krea",
  "outputType": "image",
  "status": "passed",
  "reason": "Dry validation passed (registry, active status, router binding).",
  "startedAt": "2026-05-29T12:00:00.000Z",
  "finishedAt": "2026-05-29T12:00:00.100Z",
  "durationMs": 100
}
```

**Action result**

```json
{
  "actionId": "create_image",
  "outputType": "image",
  "status": "passed",
  "reason": "create_image resolves; all allowed engines are active.",
  "selectedEngineId": "smart_auto_pilot",
  "estimatedCredits": 1
}
```

## Security

- Routes require header `x-internal-validation-secret` matching `INTERNAL_VALIDATION_SECRET`.
- Missing or invalid secret → **401** with generic message (secret value never echoed).
- Responses never include `FAL_KEY`, `KREA_API_KEY`, or raw provider model endpoint strings.
- End-user UI must not expose provider names or internal model IDs — smoke test JSON is internal-only.

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| 401 Unauthorized | Wrong or missing `INTERNAL_VALIDATION_SECRET` / header |
| `catalogOk: false` | Catalog policy violation — see `catalogIssueCount` and fix registry |
| Krea engine failed dry | `ENABLE_KREA_PROVIDER=false` or missing `KREA_API_KEY` |
| fal T2V failed dry | Missing `FAL_KEY` or handler not in `FAL_MVP_GENERATION_HANDLERS` |
| Auto-Pilot failed | Resolver pointed at inactive or plan-limited engine |
| Live test skipped | Provider disabled, fixture missing, or balance blocked |

## Pre-launch checklist

- [ ] Dry engine validation: all 5 MVP engines `passed`
- [ ] Dry action validation: all 5 MVP actions `passed`
- [ ] `catalogOk: true`
- [ ] Live provider tests passed for any newly promoted engine
- [ ] No inactive engine accidentally set to `active`
- [ ] `npm run build` succeeds
