# InfluExAI — Environment Configuration

Last updated: 2026-05-31  
Canonical registry: `app/lib/config/env.ts`  
Placeholders: `.env.example` (never commit real secrets)

## Security rules

1. **Server-only keys** must never use the `NEXT_PUBLIC_` prefix:
   - `FAL_KEY`, `KREA_API_KEY`, `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`
   - `GENERATION_WORKER_SECRET`, `INTERNAL_VALIDATION_SECRET`
2. **Client-safe keys** (`NEXT_PUBLIC_*`) may appear in browser bundles.
3. Never print secret values in logs, docs, or API responses.
4. Stripe webhooks: configure `STRIPE_WEBHOOK_SECRET` only on the server route.

## MVP required (production launch)

| Variable | Scope | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_APP_URL` | Client | Checkout return URLs, absolute links |
| `NEXT_PUBLIC_SUPABASE_URL` | Client | Auth + client Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client | Browser Supabase (RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server** | API routes, gallery, credits, webhooks |
| `STRIPE_SECRET_KEY` | **Server** | Checkout Sessions |
| `STRIPE_WEBHOOK_SECRET` | **Server** | Webhook signature verification |
| `STRIPE_PRICE_STARTER` | **Server** | Starter package Price ID |
| `STRIPE_PRICE_PROFESSIONAL` | **Server** | Professional package Price ID |
| `STRIPE_PRICE_ULTIMATE` | **Server** | Ultimate package Price ID |
| `FAL_KEY` | **Server** | Text-to-video (Create Motion Video, pack video) |
| `KREA_API_KEY` | **Server** | Image generation (Create Image, pack images) |
| `GENERATION_WORKER_SECRET` | **Server** | Generation worker auth |

> **Note:** This project uses **hosted Stripe Checkout** (server-created sessions).  
> `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is **not used** today — reserve for a future Payment Element integration.

## Optional / conditional

| Variable | When needed |
|----------|-------------|
| `OPENAI_API_KEY` | Richer Prompt Assist (`/api/prompt-assist`); falls back to passthrough without key. Creative Score API is rule-based and does **not** require OpenAI. |
| `ELEVENLABS_API_KEY` | LipSync **system voice** when `enableLipSync` module is enabled |
| `INTERNAL_VALIDATION_SECRET` | `/api/internal/validate-*` routes |
| `ADMIN_EMAILS` | Admin debug console access |
| `ENABLE_FAL_PROVIDER` | Force fal on/off (defaults: on when `FAL_KEY` set) |
| `ENABLE_KREA_PROVIDER` | Force Krea on/off (defaults: on when `KREA_API_KEY` set) |

## Provider flags

| Flag | Default behavior |
|------|------------------|
| `ENABLE_KREA_PROVIDER` | `false` if unset and no key; `true` if `KREA_API_KEY` present |
| `ENABLE_FAL_PROVIDER` | `false` if unset and no key; `true` if `FAL_KEY` present |
| `ENABLE_KREA_ENHANCE` | Krea enhance path (legacy; enhancer module off at MVP) |
| `ENABLE_MOTION_TRANSFER` | Server override for motion transfer routes |
| `ENABLE_LIVE_AVATAR` | Server override for avatar/lipsync upload routes |

Launch **module** gates (reference edit, training, lipsync, etc.) live in `app/lib/config/launch.ts` — not env vars.

## Local setup

```bash
cp .env.example .env.local
# Fill MVP keys from Supabase, Stripe, fal.ai, Krea dashboards
npm run dev
```

## Readiness check (no secrets printed)

```typescript
import { getMvpEnvReadiness, getAllToolProviderReadiness } from "@/app/lib/config/env";

const mvp = getMvpEnvReadiness();
// mvp.ready, mvp.missing, mvp.present — names only

const tools = getAllToolProviderReadiness();
// tools[].canActivate, tools[].blockerReason
```

## Related docs

- [PROVIDER_READINESS.md](./PROVIDER_READINESS.md) — per-tool activation matrix
- [MODEL_ACTIVATION_STATUS.md](./MODEL_ACTIVATION_STATUS.md) — tool status summary
- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) — extended legacy reference
