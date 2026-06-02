# Post-Launch Roadmap — InfluExAI

This roadmap describes a **sensible activation order** after the MVP launch (validated image + text-to-video). It is not a commitment date plan — each item still requires validation, cost control, storage, and job tracking before going live.

Current launch truth: [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md).  
Tool taxonomy: [ADVANCED_CREATOR_TOOLS.md](./ADVANCED_CREATOR_TOOLS.md).  
Inventory rules: [MODEL_INVENTORY.md](./MODEL_INVENTORY.md).

## MVP baseline (shipped)

- Text-to-image via four active image modes (Auto, Fast Draft, Premium, Realtime).  
- Text-to-video via Auto Video and Cinematic Video.  
- Prompt Assist, Creative Score, Style Variant, Export.  
- Internal model inventory + admin validators; user-facing **Models & Quality** drawer with locked **Coming soon** rows.

## Phase 1 — High-demand motion & polish

Likely order (adjust based on validation cost and creator feedback):

| Priority | Capability | Mode / tool ids | Prerequisites |
|----------|------------|-------------------|---------------|
| 1 | Image-to-video | `animate_image` | `fal_kling_v3_i2v` validation, balance, `enableImageToVideo`, upload + job status |
| 2 | Upscale | `upscale_image` | Enhance pipeline, storage, credit tier |
| 3 | Enhance / cleanup | `enhance_asset` | Same as upscale; distinct UX from upscale |
| 4 | Background remove | `background_remove` | Input image upload, output asset save |

**Gate for each:** engine `active` + inventory `passed` + action/mode `active` + launch flag + drawer copy updated (remove Coming soon).

## Phase 2 — Reference & edit (not training)

| Capability | Mode ids | Notes |
|------------|----------|-------|
| Reference-guided create | `use_reference_image` | Reference upload bucket, source URL on generation row |
| Instructional edit | `edit_image` | Edit instruction field; distinct from style variant |
| Style match from reference | `match_style` | May share infra with reference create |

Activate `enableReferenceImage` / `enableReferenceEdit` only after E2E tests.  
**Do not** label these as training; they do not produce reusable LoRA/style models.

## Phase 3 — Talking video

| Capability | Mode ids | Notes |
|------------|----------|-------|
| LipSync | `lipsync_creator` | Audio + video upload, fal sync validation |
| AI Avatar | `ai_avatar` | Avatar script + render; higher credit band |

Depends on lip-sync storage buckets and longer-running jobs (see existing `docs/LIP_SYNC_*` plans).

## Phase 4 — Motion & audio

| Capability | Mode ids | Notes |
|------------|----------|-------|
| Motion transfer | `motion_transfer` | Reference video + subject image; prior 422 validation must be cleared |
| Audio sound design | `audio_sound_design` | Provider TTS/SFX choice; clip attachment to video workflow |

## Phase 5 — Training (reusable styles / models)

| Capability | Mode ids | Notes |
|------------|----------|-------|
| Train Creator Style | `train_creator_style` | Dataset upload, training job, model registry |
| Train Brand Kit | `train_brand_kit` | Brand asset guidelines |
| Train Product Model | `train_product_model` | Product consistency |
| Train Creator Identity | `train_creator_identity` | Approved image set |

**Training activation checklist (all required):**

- Dataset upload + consent/storage policy  
- Async training job with status API and failure refunds  
- Saved model/style id usable from image modes  
- Credit range (e.g. 100–300) enforced server-side  
- User copy uses “Train …” labels, not raw “LoRA” as the primary name  

Enable `enableTraining` / `enableLoRA` only when the full pipeline exists — metadata-only registration is already in place for the drawer.

## Phase 6 — 3D

| Capability | Mode ids | Notes |
|------------|----------|-------|
| 3D Object | `object_3d` | Mesh/output preview, fal 3D validation |

## Cross-cutting work (every phase)

1. **Validation** — live tests, reports in `tmp/` or admin validate routes.  
2. **Cost control** — `credit-costs.ts`, monetization rules, refund on failure.  
3. **Storage** — Supabase buckets + RLS per workflow.  
4. **Job tracking** — `generations` (and training tables when applicable), cron/process routes.  
5. **UX** — unlock drawer row, update [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md), support macros.  
6. **No provider leakage** — keep `showProviderNamesToUsers: false` unless product explicitly changes.

## What we intentionally defer

- Activating locked modes from the drawer without server-side guards (already blocked in code).  
- Exposing validation status strings or endpoint ids to creators.  
- Charging credits for Coming soon tools (actions are `cost: 0` while locked).

## Related docs

- [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md)  
- [ADVANCED_CREATOR_TOOLS.md](./ADVANCED_CREATOR_TOOLS.md)  
- [ENGINE_VALIDATION_RUNBOOK.md](./ENGINE_VALIDATION_RUNBOOK.md)  
- [ROADMAP_IMAGE_VIDEO_MODES.md](./ROADMAP_IMAGE_VIDEO_MODES.md) (historical mode planning)
