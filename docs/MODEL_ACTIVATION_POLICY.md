# Model Activation Policy — InfluExAI

How internal inventory entries, engines, model modes, and actions stay in sync — and how to promote a capability from **mapped** to **active** without exposing raw models to users.

Implementation:

- `app/lib/engines/model-status.ts`
- `app/lib/engines/model-inventory.ts`
- `app/lib/engines/model-inventory-validator.ts`
- `app/lib/engines/validate-engine-catalog.ts`

## Principles

1. **Inventory is internal** — complete list for operators; never rendered in normal studio UI.
2. **Modes are external** — users pick quality/speed presets, not provider endpoints.
3. **Engines execute** — server resolves mode → action → engine → provider call.
4. **Validation before activation** — no credits on unvalidated paths.
5. **Placeholders never go live** — `providerModelId: null` ⇒ cannot be `active`.

## Status model

| Status | Runnable | User-visible mode | Meaning |
|--------|----------|-------------------|---------|
| `active` | Yes* | Yes (via mode/action) | Live in product |
| `mapped_but_unvalidated` | No | Locked / hidden | Endpoint mapped, not promoted |
| `validation_blocked_insufficient_balance` | No | Locked | Provider balance blocked test |
| `unavailable_plan_limited` | No | Hidden | Provider plan limit (e.g. Krea) |
| `failed_validation` | No | Hidden | Technical validation failure |
| `disabled` | No | Hidden | Intentionally off |

\*Runnable only when `validationStatus: "passed"`, engine handler exists, and `canRunGeneration: true`.

## Validation status

| validationStatus | Meaning |
|------------------|---------|
| `passed` | Live test succeeded |
| `not_tested` | No live test yet |
| `blocked` | Blocked (often balance), not a code failure |
| `failed` | Schema/output/API failure |

## Activation checklist

Use this when promoting any inventory item:

### 1. Confirm the provider contract

- [ ] `providerModelId` set (not null)
- [ ] Input types documented (`text`, `image`, `audio`, …)
- [ ] Output type matches product expectation
- [ ] Credit estimate aligned with `credit-costs` / engine row

### 2. Validate live

- [ ] Run engine smoke tests (`app/lib/validation/engine-smoke-tests.ts`)
- [ ] Or POST `/api/internal/validate-engines` with internal secret
- [ ] For fal: confirm handler in `FAL_MVP_GENERATION_HANDLERS` / fal router
- [ ] For Krea: confirm `ENABLE_KREA_PROVIDER` and registry id

### 3. Update engine registry

- [ ] Set `status: "active"` in `fal-catalog.ts` or `catalog.ts`
- [ ] Set `validation.validationStatus: "passed"` with reason + timestamp
- [ ] Ensure `canShowToUser: true` and `canRunGeneration: true` **only** when active

### 4. Wire user-facing surface

Choose at least one:

- [ ] **Model mode** — add or set `status: "active"`, `canRunGeneration: true` in `model-modes.ts`
- [ ] **Action** — set `status: "active"` in `action-registry.ts` with `defaultEngine`

Map inventory:

- [ ] `mappedEngineId` matches engine id
- [ ] `mappedModelModeId` matches active mode (if applicable)

### 5. Verify guards

- [ ] `resolveEngineForGeneration()` rejects old status
- [ ] `resolveModelModeForGeneration()` rejects locked modes
- [ ] Dev throw: `assertModelInventoryValidInDevelopment()`
- [ ] Dev throw: `assertEngineCatalogValidInDevelopment()`
- [ ] `npm run build` passes

## MVP active set (must stay stable)

| Engine | Model mode(s) |
|--------|----------------|
| `smart_auto_pilot` | `auto_image` |
| `krea_flux_fast_draft` | `fast_draft_image` |
| `krea_flux_11_pro_ultra` | `premium_image` |
| `krea_nano_realtime` | `realtime_image` |
| `fal_kling_v3_t2v` | `auto_video`, `cinematic_text_video` |

Exactly **one** active fal generation engine in MVP: `fal_kling_v3_t2v`.

## Deactivation / rollback

1. Set engine `status` back to `mapped_but_unvalidated` or `disabled`.
2. Set model mode `status: "locked"` and `canRunGeneration: false`.
3. Inventory row auto-reflects engine on next build (derived from registry).
4. In-flight generations: existing refund-on-failure behavior unchanged.

## Development validator rules

`validateModelInventory()` enforces:

- Required active ids present and runnable
- Placeholders cannot be active
- Inactive rows cannot have `canRunGeneration: true`
- Active rows map to active engines
- Active rows map to at least one active model mode or action
- Unknown model mode ids rejected

In development, violations throw with readable `[inventoryId] message` lines.

## What users should never see

- Provider names in primary studio UI (Krea, fal.ai, OpenAI)
- Raw `providerModelId` strings
- Full `MODEL_INVENTORY` array
- Inactive engines as runnable options

Admin `/internal` may show masked provider refs for debugging.

## Related

- [MODEL_INVENTORY.md](./MODEL_INVENTORY.md)
- [ENGINE_VALIDATION_POLICY.md](./ENGINE_VALIDATION_POLICY.md)
