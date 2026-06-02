# Model Inventory — InfluExAI

InfluExAI maintains an **internal model inventory**: a server-side catalog of capabilities, provider endpoints, validation state, and mappings to product layers. This document is for operators and engineers — **not** for end-user help copy.

## What normal users see

End users never browse the inventory. They see:

| User-facing layer | Examples | Purpose |
|-------------------|----------|---------|
| **Model modes** | Auto, Fast Draft, Premium Image, Auto Video, Cinematic Video | Quality/speed presets in the studio |
| **Actions** | Create Image, Create Video, Style Variant, Export, Creative Score | What the product does on an asset |
| **Tools (drawer)** | Grouped under Image, Video, Reference & Edit, Training, Enhance, Avatar & LipSync, 3D | “Models & Quality” — active modes selectable; locked tools show **Coming soon** |

Users do **not** see raw provider names (Krea, fal.ai, Kling, Flux, Nano), endpoint strings, engine registry ids, or validation status labels.

## Three layers (do not confuse)

```
User UI          →  model modes + actions + tools (labels only)
Server routing   →  engine registry (catalog + fal-catalog)
Internal ops     →  model inventory (validation, mapping, admin)
```

| Layer | Code | Audience |
|-------|------|----------|
| Model inventory | `app/lib/engines/model-inventory.ts` | Admin `/internal`, validators |
| Engine registry | `app/lib/engines/catalog.ts`, `fal-catalog.ts` | Generation routes (server) |
| Model modes | `app/lib/model-modes/model-modes.ts` | Studio UI |
| Actions | `app/lib/actions/action-registry.ts` | Studio + canvas |

Inventory rows are built from `ENGINE_REGISTRY` plus internal rows (OpenAI analysis, locked tool metadata, placeholders).

## Only validated engines can run

Generation is allowed only when **all** of the following hold:

1. **Engine** `status: "active"` in the registry and `canRunGeneration: true`
2. **Inventory** row is active, `validationStatus: "passed"`, and not a placeholder (`providerModelId` set where required)
3. **Model mode** `status: "active"` and `canRunGeneration: true`
4. **Action** `status: "active"`

`resolveEngineForGeneration()` and `resolveModelModeForGeneration()` reject inactive or locked entries **before** credits are charged. Locked actions use `status: "locked"` with `cost: 0` and no default engine.

## Active MVP inventory (launch)

These engine inventory ids are **active**, **validation passed**, and wired to runnable modes:

| Inventory id | Model mode(s) | User capability |
|--------------|---------------|-----------------|
| `smart_auto_pilot` | `auto_image` | Image generation |
| `krea_flux_fast_draft` | `fast_draft_image` | Image generation |
| `krea_flux_11_pro_ultra` | `premium_image` | Image generation |
| `krea_nano_realtime` | `realtime_image` | Image generation |
| `fal_kling_v3_t2v` | `auto_video`, `cinematic_text_video` | Text-to-video |

Internal analysis (active, not shown as a “model” in the drawer):

| Inventory id | Action |
|--------------|--------|
| `openai_creative_score` | `check_creative_score` |
| `openai_prompt_assist` | `improve_prompt` |

Constants: `MVP_ACTIVE_ENGINE_IDS` in `app/lib/engines/model-inventory.ts`.

## Locked inventory (coming soon)

Locked tool rows use `status: "locked"`, `provider: null`, `providerModelId: null`, `canShowToUser: true`, `canRunGeneration: false`. They exist so admin and validators stay aligned with the product roadmap without exposing endpoints to users.

Categories:

| Category | Mode ids (examples) | Not the same as |
|----------|---------------------|-----------------|
| **Reference & Edit** | `use_reference_image`, `edit_image`, `match_style` | Training — one-off edits/refs, not reusable style models |
| **Training** | `train_creator_style`, `train_brand_kit`, `train_product_model`, `train_creator_identity` | Reference tools — training produces **reusable** styles/models from asset sets |
| **Advanced / post-MVP** | `animate_image`, `lipsync_creator`, `ai_avatar`, `enhance_asset`, `background_remove`, `upscale_image`, `motion_transfer`, `audio_sound_design`, `object_3d` | See [ADVANCED_CREATOR_TOOLS.md](./ADVANCED_CREATOR_TOOLS.md) |

Future-tool engine rows (e.g. `fal_kling_v3_i2v`) may still appear in inventory for operators with `mapped_but_unvalidated` status; they are **not** user-visible and **cannot** run until promoted.

Config lists: `LOCKED_FUTURE_TOOL_MODE_IDS`, `LOCKED_REFERENCE_EDIT_*`, `LOCKED_TRAINING_*` in `app/lib/config/future-tools.ts` and `model-inventory.ts`.

## Reference vs training (product language)

| | Reference & Edit | Training |
|---|------------------|----------|
| **Goal** | Change or guide a **single** generation using a reference or edit instruction | Build a **reusable** visual style or product/creator model from many assets |
| **Output** | Image (or video) asset | Saved style/model used in later generations |
| **Launch state** | Locked — no upload job, no API | Locked — no dataset upload, no training job |
| **User label** | “Use Reference Image”, “Edit Image”, “Match Style” | “Train Creator Style”, “Train Brand Kit”, etc. (no “LoRA” as primary label) |

## Models & Quality drawer

Server helper: `getModelsQualityDrawerSections()` in `app/lib/model-modes/get-visible-model-modes.ts`.

Sections shown to users:

1. Image  
2. Video  
3. Reference & Edit  
4. Training  
5. Enhance  
6. Avatar & LipSync  
7. 3D  

Active modes: selectable, show credit estimate, update studio selection only.  
Locked modes: **Coming soon**, disabled, no API call, no credit consumption.

## Admin / validation

- Admin table: `getAdminModelInventoryRows()` — `providerModelId` masked in UI  
- Internal console: `/internal`  
- Validators: `validateModelInventory()`, `validateEngineCatalog()`, `validate-actions` smoke tests  

Do **not** expose raw inventory arrays or provider model ids from public API routes or client bundles.

## Promoting a row to active

See [MODEL_ACTIVATION_POLICY.md](./MODEL_ACTIVATION_POLICY.md) and [ENGINE_VALIDATION_RUNBOOK.md](./ENGINE_VALIDATION_RUNBOOK.md). Before activation, confirm: live validation, credit cost, storage, job tracking, and a user-facing mode — not only a registry entry.

## Related docs

- [ADVANCED_CREATOR_TOOLS.md](./ADVANCED_CREATOR_TOOLS.md) — post-MVP locked tools  
- [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md) — honest launch limits  
- [POST_LAUNCH_ROADMAP.md](./POST_LAUNCH_ROADMAP.md) — activation order after MVP  
- [ENGINE_VALIDATION_POLICY.md](./ENGINE_VALIDATION_POLICY.md)  
- [CREDIT_AND_MODE_STRATEGY.md](./CREDIT_AND_MODE_STRATEGY.md)
