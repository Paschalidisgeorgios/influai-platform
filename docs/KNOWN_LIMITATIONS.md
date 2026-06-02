# Known Limitations — InfluExAI (launch MVP)

This document states **honest, current** product limits at launch. It is aimed at operators, support, and engineering — align public marketing with what actually runs in production.

For architecture context see [MODEL_INVENTORY.md](./MODEL_INVENTORY.md). For what is planned next see [POST_LAUNCH_ROADMAP.md](./POST_LAUNCH_ROADMAP.md).

## What works today (validated MVP)

Only these **model modes** are active and can charge credits through the normal generation path:

| Mode | Capability |
|------|------------|
| Auto (`auto_image`) | Image generation |
| Fast Draft (`fast_draft_image`) | Image generation |
| Premium Image (`premium_image`) | Image generation |
| Realtime Render (`realtime_image`) | Image generation |
| Auto Video (`auto_video`) | Text-to-video |
| Cinematic Video (`cinematic_text_video`) | Text-to-video |

Also available without image/video generation:

- **Prompt Assist** (`improve_prompt`) — active, no generation credits  
- **Creative Score** (`check_creative_score`) — active, no generation credits  
- **Style Variant** (`create_style_variant`) — active on existing images (fast draft engine)  
- **Export** (`export_asset`) — active, no generation credits  

Free features and billing follow [CREDIT_AND_MODE_STRATEGY.md](./CREDIT_AND_MODE_STRATEGY.md).

## What is not active yet

The following are registered in the product (drawer, inventory, or dashboard routes) but **cannot run** and **must not consume credits** in the launch build:

### Image-to-video

- **Animate Image** (`animate_image`) is **not active**.  
- Engine `fal_kling_v3_i2v` is mapped but blocked (validation/balance); `enableImageToVideo: false` in launch config.  
- Users may see “Coming soon” in the Models & Quality drawer — selecting it does not start generation.

### Reference image & edit

- **Use Reference Image**, **Edit Image**, and **Match Style** are **not active**.  
- No reference-upload generation job, no reference-edit API route for creators at launch.  
- `enableReferenceImage: false`, `enableReferenceEdit: false`.  
- These tools are **not training**; they do not create reusable style models.

### LoRA / training

- **Train Creator Style**, **Train Brand Kit**, **Train Product Model**, and **Train Creator Identity** are **not active**.  
- No dataset upload, no training job pipeline, no reusable style activation for end users.  
- `enableTraining: false`, `enableLoRA: false`.  
- Training is a separate roadmap from reference/edit (see [ADVANCED_CREATOR_TOOLS.md](./ADVANCED_CREATOR_TOOLS.md)).

### LipSync

- **LipSync Creator** (`lipsync_creator`) is **not active**.  
- `enableLipSync: false`. Mapped fal lipsync engine remains unvalidated for launch.

### Avatar

- **AI Avatar** (`ai_avatar`) is **not active**.  
- `enableAvatar: false`.

### Enhance

- **Enhance Asset**, **Background Remove**, and **Upscale** are **not active**.  
- `enableEnhancer: false`. Legacy enhancer/upscale engines are not promoted to active MVP.

### 3D

- **3D Object** (`object_3d`) is **not active**.  
- `enable3D: false`.

### Other locked advanced tools

- **Motion Transfer** — not active (`enableMotionTransfer: false`).  
- **Audio Sound Design** — not active (no launch flag; metadata only).

## User experience limits

- **Normal users see modes and tools, not raw models** — no Krea, fal.ai, Kling, Flux, Nano, or endpoint strings in the studio UI.  
- **Models & Quality drawer** lists locked tools as **Coming soon**; they are disabled and do not call APIs.  
- **Only validated MVP modes** appear in the primary quality selector on the create flow.  
- **Experimental dashboard modules** (motion-transfer page, train page, etc.) may be gated by `guardLaunchModule()` — do not assume they match studio activation.

## Operator / internal notes

- Full inventory and validation status: `/internal` (authorized only).  
- Promoting a capability requires validation + inventory + mode + launch config — see [MODEL_ACTIVATION_POLICY.md](./MODEL_ACTIVATION_POLICY.md).  
- Do not enable a locked mode in `model-modes.ts` without completing engine validation and job/storage design.

## Related docs

- [ADVANCED_CREATOR_TOOLS.md](./ADVANCED_CREATOR_TOOLS.md)  
- [POST_LAUNCH_ROADMAP.md](./POST_LAUNCH_ROADMAP.md)  
- [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md)
