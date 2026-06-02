/**
 * Environment variable registry and readiness checks — server-safe only.
 * Never log or return secret values from this module.
 */

import { isFalProviderEnabled, isKreaProviderEnabled } from "@/lib/providers/flags";
import {
  CREATOR_TOOL_ACTIVATION,
  evaluateToolActivation,
  type ToolActivationEvaluation,
} from "@/app/lib/tools/tool-activation";
import { getAllCreatorTools, type CreatorToolDefinition } from "@/app/lib/tools/creator-tools";
import { isCreatorToolProviderValidated } from "@/app/lib/tools/creator-tools";
import { isCreatorToolLaunchGateOpen } from "@/app/lib/tools/launch-tool-gate";
import { getEngineById, isEngineActive } from "@/app/lib/engines/catalog";

export type EnvScope = "client" | "server" | "both";

export type EnvVarDefinition = {
  key: string;
  scope: EnvScope;
  required: "mvp" | "optional" | "conditional";
  /** Human-readable condition when required is conditional */
  when?: string;
  description: string;
};

/** Canonical env registry — placeholders only in .env.example */
export const ENV_REGISTRY: readonly EnvVarDefinition[] = [
  {
    key: "NEXT_PUBLIC_APP_URL",
    scope: "client",
    required: "mvp",
    description: "Canonical app URL for checkout return URLs and worker callbacks.",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    scope: "client",
    required: "mvp",
    description: "Supabase project URL.",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    scope: "client",
    required: "mvp",
    description: "Supabase anon key for browser auth (RLS enforced).",
  },
  {
    key: "SUPABASE_SERVICE_ROLE_KEY",
    scope: "server",
    required: "mvp",
    description: "Supabase service role — API routes, gallery writes, webhooks.",
  },
  {
    key: "STRIPE_SECRET_KEY",
    scope: "server",
    required: "mvp",
    description: "Stripe secret key for Checkout Sessions and webhooks.",
  },
  {
    key: "STRIPE_WEBHOOK_SECRET",
    scope: "server",
    required: "mvp",
    description: "Stripe webhook signing secret.",
  },
  {
    key: "STRIPE_PRICE_STARTER",
    scope: "server",
    required: "mvp",
    description: "Stripe Price ID — Starter credit package.",
  },
  {
    key: "STRIPE_PRICE_PROFESSIONAL",
    scope: "server",
    required: "mvp",
    description: "Stripe Price ID — Professional credit package.",
  },
  {
    key: "STRIPE_PRICE_ULTIMATE",
    scope: "server",
    required: "mvp",
    description: "Stripe Price ID — Ultimate credit package.",
  },
  {
    key: "FAL_KEY",
    scope: "server",
    required: "mvp",
    description: "fal.ai server key — motion video and future fal workflows.",
  },
  {
    key: "KREA_API_KEY",
    scope: "server",
    required: "mvp",
    description: "Krea API key — primary image generation path at MVP.",
  },
  {
    key: "GENERATION_WORKER_SECRET",
    scope: "server",
    required: "mvp",
    description: "Shared secret for generation worker routes.",
  },
  {
    key: "OPENAI_API_KEY",
    scope: "server",
    required: "optional",
    description:
      "Optional — enhances Prompt Assist; Creative Score API uses rule-based fallback without it.",
  },
  {
    key: "ELEVENLABS_API_KEY",
    scope: "server",
    required: "conditional",
    when: "LipSync Creator system-voice mode when enableLipSync module is on",
    description: "ElevenLabs TTS for LipSync system voice (future).",
  },
  {
    key: "INTERNAL_VALIDATION_SECRET",
    scope: "server",
    required: "optional",
    description: "Protects /api/internal/* validation routes.",
  },
  {
    key: "ADMIN_EMAILS",
    scope: "server",
    required: "optional",
    description: "Comma-separated admin emails for internal console access.",
  },
  {
    key: "ENABLE_FAL_PROVIDER",
    scope: "server",
    required: "optional",
    description: "Explicit fal provider gate (defaults true when FAL_KEY set).",
  },
  {
    key: "ENABLE_KREA_PROVIDER",
    scope: "server",
    required: "optional",
    description: "Explicit Krea provider gate (defaults true when KREA_API_KEY set).",
  },
  {
    key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    scope: "client",
    required: "optional",
    description:
      "Not used by current hosted Checkout flow — reserve for future Payment Element.",
  },
] as const;

const MVP_ENV_KEYS = ENV_REGISTRY.filter((e) => e.required === "mvp").map(
  (e) => e.key
);

export function isEnvVarPresent(key: string): boolean {
  const value = process.env[key];
  return typeof value === "string" && value.trim().length > 0;
}

export function getEnvPresence(key: string): "present" | "missing" {
  return isEnvVarPresent(key) ? "present" : "missing";
}

export type EnvPresenceReport = {
  key: string;
  scope: EnvScope;
  required: EnvVarDefinition["required"];
  status: "present" | "missing";
};

/** Returns presence only — never secret values. */
export function getEnvPresenceReport(
  keys: readonly string[] = MVP_ENV_KEYS
): EnvPresenceReport[] {
  return keys.map((key) => {
    const def =
      ENV_REGISTRY.find((entry) => entry.key === key) ??
      ({
        key,
        scope: "server" as const,
        required: "optional" as const,
        description: "",
      } satisfies EnvVarDefinition);
    return {
      key,
      scope: def.scope,
      required: def.required,
      status: getEnvPresence(key),
    };
  });
}

export type MvpEnvReadiness = {
  ready: boolean;
  missing: string[];
  present: string[];
  providerFlags: {
    kreaEnabled: boolean;
    falEnabled: boolean;
  };
};

export function getMvpEnvReadiness(): MvpEnvReadiness {
  const report = getEnvPresenceReport(MVP_ENV_KEYS);
  const missing = report.filter((r) => r.status === "missing").map((r) => r.key);
  const present = report.filter((r) => r.status === "present").map((r) => r.key);

  return {
    ready: missing.length === 0,
    missing,
    present,
    providerFlags: {
      kreaEnabled: isKreaProviderEnabled(),
      falEnabled: isFalProviderEnabled(),
    },
  };
}

export type ProviderTestStatus =
  | "passed"
  | "not_tested"
  | "failed"
  | "blocked_balance"
  | "not_applicable";

export type ToolProviderReadinessRow = {
  toolId: string;
  label: string;
  requiredEnv: readonly string[];
  envStatus: Record<string, "present" | "missing">;
  handlerPresent: boolean;
  handlerRoutes: readonly string[];
  providerTestStatus: ProviderTestStatus;
  engineId?: string;
  engineActive: boolean;
  launchGateOpen: boolean;
  canActivate: boolean;
  blockerReason: string | null;
  activation: ToolActivationEvaluation;
};

function providerTestStatusForEngine(engineId?: string): ProviderTestStatus {
  if (!engineId) return "not_applicable";
  const engine = getEngineById(engineId);
  if (!engine) return "not_tested";

  const validation = engine.validation?.validationStatus;
  if (engine.status === "active" && validation === "passed") return "passed";
  if (engine.status === "validation_blocked_insufficient_balance") {
    return "blocked_balance";
  }
  if (validation === "failed") return "failed";
  if (validation === "passed" && engine.status !== "active") return "passed";
  return "not_tested";
}

function envStatusForKeys(keys: readonly string[]): Record<string, "present" | "missing"> {
  return Object.fromEntries(keys.map((key) => [key, getEnvPresence(key)]));
}

function sharedEnvKeys(): readonly string[] {
  return [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ] as const;
}

export function getToolProviderReadiness(
  tool: CreatorToolDefinition
): ToolProviderReadinessRow {
  const meta = CREATOR_TOOL_ACTIVATION[tool.id];
  const activation = evaluateToolActivation(tool);
  const launchGateOpen = isCreatorToolLaunchGateOpen(tool);
  const providerValidated = isCreatorToolProviderValidated(tool);
  const engineId = meta.primaryEngineId ?? tool.primaryEngineId;
  const engine = engineId ? getEngineById(engineId) : null;

  const requiredEnv = [
    ...new Set([...sharedEnvKeys(), ...meta.requiredEnvVars]),
  ] as readonly string[];

  const envStatus = envStatusForKeys(requiredEnv);
  const envMissing = requiredEnv.filter((key) => envStatus[key] === "missing");
  const handlerPresent = meta.providerOptional === true || meta.apiHandlers.length > 0;

  let canActivate = launchGateOpen && activation.isLiveCapable && providerValidated;
  let blockerReason: string | null = null;

  if (!launchGateOpen) {
    blockerReason = "Launch module or feature disabled in app/lib/config/launch.ts";
    canActivate = false;
  } else if (envMissing.length > 0) {
    blockerReason = `Missing env: ${envMissing.join(", ")}`;
    canActivate = false;
  } else if (!handlerPresent) {
    blockerReason = "No server handler registered";
    canActivate = false;
  } else if (tool.callsProvider && !providerValidated) {
    blockerReason =
      activation.blockerDetail ??
      (engine
        ? `Engine ${engine.id} status=${engine.status}`
        : "Provider engine not validated");
    canActivate = false;
  } else if (activation.blocker) {
    blockerReason = activation.blockerDetail ?? activation.blocker;
    canActivate = false;
  }

  return {
    toolId: tool.id,
    label: tool.labelEn,
    requiredEnv,
    envStatus,
    handlerPresent,
    handlerRoutes: meta.apiHandlers,
    providerTestStatus: tool.callsProvider
      ? providerTestStatusForEngine(engineId)
      : "not_applicable",
    engineId,
    engineActive: Boolean(engine && isEngineActive(engine)),
    launchGateOpen,
    canActivate,
    blockerReason,
    activation,
  };
}

/** All audited creator tools — presence-only env data, no secrets. */
export function getAllToolProviderReadiness(): ToolProviderReadinessRow[] {
  return getAllCreatorTools().map(getToolProviderReadiness);
}

/** Throws if a server-only key is incorrectly prefixed (build/CI guard). */
export function assertNoPublicServerSecrets(): void {
  const forbiddenPublic = [
    "NEXT_PUBLIC_FAL_KEY",
    "NEXT_PUBLIC_STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_KREA_API_KEY",
    "NEXT_PUBLIC_OPENAI_API_KEY",
  ];
  for (const key of forbiddenPublic) {
    if (isEnvVarPresent(key)) {
      throw new Error(`Server secret must not use NEXT_PUBLIC prefix: ${key}`);
    }
  }
}

export function getClientSafeEnvKeys(): string[] {
  return ENV_REGISTRY.filter((e) => e.scope === "client" || e.scope === "both").map(
    (e) => e.key
  );
}

export function getServerOnlyEnvKeys(): string[] {
  return ENV_REGISTRY.filter((e) => e.scope === "server").map((e) => e.key);
}
