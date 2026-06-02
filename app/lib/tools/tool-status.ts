/**
 * Unified creator tool status — safe launch states for every workflow.
 */

import type { AccessTier } from "@/app/lib/model-modes/types";
import type { ToolActivationBlocker } from "./tool-activation";

export type ToolStatus =
  | "live"
  | "available"
  | "credit_gated"
  | "preview"
  | "request_access"
  | "coming_soon"
  | "pro_locked"
  | "disabled"
  | "blocked_missing_env"
  | "blocked_provider_failed"
  | "blocked_missing_handler"
  | "blocked_missing_credits"
  | "blocked_storage_missing"
  | "blocked_missing_infrastructure";

/** Activation blockers surfaced when launch gates pass but the tool cannot run yet. */
export type ToolActivationBlockerStatus = Extract<
  ToolStatus,
  | "blocked_missing_env"
  | "blocked_provider_failed"
  | "blocked_missing_handler"
  | "blocked_missing_credits"
  | "blocked_storage_missing"
  | "blocked_missing_infrastructure"
>;

export const TOOL_ACTIVATION_BLOCKER_STATUSES: readonly ToolActivationBlockerStatus[] =
  [
    "blocked_missing_env",
    "blocked_provider_failed",
    "blocked_missing_handler",
    "blocked_missing_credits",
    "blocked_storage_missing",
    "blocked_missing_infrastructure",
  ] as const;

/** User-safe one-line reasons — never expose env keys or provider model ids. */
export const TOOL_ACTIVATION_BLOCKER_REASONS: Record<
  ToolActivationBlockerStatus,
  { en: string; de: string }
> = {
  blocked_missing_env: {
    en: "Server configuration for this workflow is still being finalized.",
    de: "Die Server-Konfiguration für diesen Workflow wird noch finalisiert.",
  },
  blocked_provider_failed: {
    en: "The generation provider for this workflow has not passed validation yet.",
    de: "Der Generierungs-Provider für diesen Workflow hat die Validierung noch nicht bestanden.",
  },
  blocked_missing_handler: {
    en: "The server route for this workflow is not wired yet.",
    de: "Die Server-Route für diesen Workflow ist noch nicht angebunden.",
  },
  blocked_missing_credits: {
    en: "Credit pricing for this workflow is not configured yet.",
    de: "Die Credit-Preise für diesen Workflow sind noch nicht konfiguriert.",
  },
  blocked_storage_missing: {
    en: "Gallery storage for outputs is not configured yet.",
    de: "Die Galerie-Speicherung für Outputs ist noch nicht konfiguriert.",
  },
  blocked_missing_infrastructure: {
    en: "Training and job infrastructure for this workflow is not live yet.",
    de: "Training- und Job-Infrastruktur für diesen Workflow ist noch nicht live.",
  },
};

export function isToolActivationBlockerStatus(
  status: ToolStatus
): status is ToolActivationBlockerStatus {
  return (TOOL_ACTIVATION_BLOCKER_STATUSES as readonly string[]).includes(status);
}

export function getToolActivationBlockerReason(
  status: ToolActivationBlockerStatus,
  language: "en" | "de" = "en"
): string {
  return TOOL_ACTIVATION_BLOCKER_REASONS[status][language === "de" ? "de" : "en"];
}

export type PublicToolStatus =
  | "live"
  | "preview"
  | "request_access"
  | "coming_soon"
  | "pro_locked"
  | "disabled"
  | "blocked";

export type ToolCapabilityFlags = {
  canShowToUser: boolean;
  canRun: boolean;
  canPreview: boolean;
  requiresCredits: boolean;
};

export type ResolvedCreatorToolAccess = {
  canShowToUser: boolean;
  canRun: boolean;
  canPreview: boolean;
  requiresCredits: boolean;
  requiredCredits: number;
  accessTier: AccessTier;
  reasonIfUnavailable: string | null;
};

const RUNNABLE_STATUSES: ReadonlySet<ToolStatus> = new Set(["live"]);

const BLOCKED_STATUSES: ReadonlySet<ToolStatus> = new Set([
  "blocked_missing_env",
  "blocked_provider_failed",
  "blocked_missing_handler",
  "blocked_missing_credits",
  "blocked_storage_missing",
  "blocked_missing_infrastructure",
]);

export const FRIENDLY_TOOL_UNAVAILABLE_COPY = {
  preview: {
    en: "Preview mode — plan your workflow without using credits.",
    de: "Vorschau — plane deinen Workflow ohne Credits zu verbrauchen.",
  },
  request_access: {
    en: "Request access to join the early rollout for this workflow.",
    de: "Fordere Zugang an, um an der Early Rollout-Phase teilzunehmen.",
  },
  coming_soon: {
    en: "This workflow is coming soon to InfluExAI.",
    de: "Dieser Workflow kommt bald zu InfluExAI.",
  },
  pro_locked: {
    en: "Upgrade your plan to unlock this pro workflow.",
    de: "Upgrade deinen Plan, um diesen Pro-Workflow freizuschalten.",
  },
  disabled: {
    en: "This workflow is not available right now.",
    de: "Dieser Workflow ist derzeit nicht verfügbar.",
  },
  blocked: {
    en: "We are finishing setup for this workflow — check back soon.",
    de: "Wir finalisieren diesen Workflow — schau bald wieder vorbei.",
  },
  blocked_missing_env: {
    en: "This workflow is in preparation and not ready to render yet.",
    de: "Dieser Workflow wird vorbereitet und ist noch nicht renderbereit.",
  },
  blocked_provider_failed: {
    en: "This workflow is being validated before it goes live.",
    de: "Dieser Workflow wird validiert, bevor er live geht.",
  },
  blocked_missing_handler: {
    en: "This workflow is being wired into the studio.",
    de: "Dieser Workflow wird gerade ins Studio integriert.",
  },
  blocked_missing_credits: {
    en: "Credit pricing for this workflow is being finalized.",
    de: "Die Credit-Preise für diesen Workflow werden finalisiert.",
  },
  blocked_storage_missing: {
    en: "Gallery storage for this workflow is being configured.",
    de: "Die Galerie-Speicherung für diesen Workflow wird eingerichtet.",
  },
  blocked_missing_infrastructure: {
    en: "Training and advanced infrastructure for this workflow is not live yet.",
    de: "Training und erweiterte Infrastruktur für diesen Workflow sind noch nicht live.",
  },
} as const;

const INTERNAL_BLOCKER_PATTERNS = [
  /api[_-]?key/i,
  /fal[_-]?key/i,
  /krea/i,
  /provider/i,
  /endpoint/i,
  /handler/i,
  /env/i,
  /supabase/i,
  /stripe/i,
  /blocked_/i,
  /missing_/i,
];

export function looksLikeInternalBlockerText(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return INTERNAL_BLOCKER_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function getInternalToolBlockerForLogs(input: {
  status: ToolStatus;
  blocker?: ToolActivationBlocker | null;
  internalDetail?: string | null;
}): string {
  const parts = [
    `status=${input.status}`,
    input.blocker ? `blocker=${input.blocker}` : null,
    input.internalDetail?.trim() ? `detail=${input.internalDetail.trim()}` : null,
  ].filter(Boolean);
  return parts.join(" | ");
}

export function isRunnableToolStatus(status: ToolStatus): boolean {
  return RUNNABLE_STATUSES.has(status);
}

export function isBlockedToolStatus(status: ToolStatus): boolean {
  return BLOCKED_STATUSES.has(status);
}

export function blockerFromStatus(
  status: ToolStatus
): ToolActivationBlocker | null {
  if (status === "blocked_missing_env") return "blocked_missing_env";
  if (status === "blocked_provider_failed") return "blocked_provider_failed";
  if (status === "blocked_missing_handler") return "blocked_missing_handler";
  if (status === "blocked_missing_credits") return "blocked_missing_credits";
  if (status === "blocked_storage_missing") return "blocked_storage_missing";
  if (status === "blocked_missing_infrastructure") {
    return "blocked_missing_infrastructure";
  }
  return null;
}

export function normalizePublicToolStatus(status: ToolStatus): PublicToolStatus {
  if (status === "live") return "live";
  if (status === "preview") return "preview";
  if (status === "request_access") return "request_access";
  if (status === "coming_soon") return "coming_soon";
  if (status === "pro_locked") return "pro_locked";
  if (status === "disabled") return "disabled";
  if (isBlockedToolStatus(status)) return "blocked";
  return "coming_soon";
}

export function resolveToolCapabilityFlags(
  status: ToolStatus,
  options: {
    allowsPreview?: boolean;
    providerValidated: boolean;
    chargesCredits: boolean;
  }
): ToolCapabilityFlags {
  if (status === "disabled") {
    return {
      canShowToUser: false,
      canRun: false,
      canPreview: false,
      requiresCredits: false,
    };
  }

  if (status === "live") {
    return {
      canShowToUser: true,
      canRun: options.providerValidated,
      canPreview: options.allowsPreview === true,
      requiresCredits: options.chargesCredits && options.providerValidated,
    };
  }

  if (status === "preview") {
    return {
      canShowToUser: true,
      canRun: false,
      canPreview: true,
      requiresCredits: false,
    };
  }

  if (status === "request_access" || status === "pro_locked") {
    return {
      canShowToUser: true,
      canRun: false,
      canPreview: false,
      requiresCredits: false,
    };
  }

  if (status === "coming_soon" || isBlockedToolStatus(status)) {
    return {
      canShowToUser: true,
      canRun: false,
      canPreview: options.allowsPreview === true && status !== "coming_soon",
      requiresCredits: false,
    };
  }

  return {
    canShowToUser: true,
    canRun: false,
    canPreview: false,
    requiresCredits: false,
  };
}

export function getFriendlyToolUnavailableReason(input: {
  status: ToolStatus;
  blocker?: ToolActivationBlocker | null;
  internalDetail?: string | null;
  language?: "en" | "de";
}): string | null {
  const language = input.language === "de" ? "de" : "en";
  const publicStatus = normalizePublicToolStatus(input.status);

  if (publicStatus === "live") return null;

  if (publicStatus === "blocked") {
    const key =
      input.status in FRIENDLY_TOOL_UNAVAILABLE_COPY
        ? (input.status as keyof typeof FRIENDLY_TOOL_UNAVAILABLE_COPY)
        : "blocked";
    return FRIENDLY_TOOL_UNAVAILABLE_COPY[key][language];
  }

  if (publicStatus in FRIENDLY_TOOL_UNAVAILABLE_COPY) {
    return FRIENDLY_TOOL_UNAVAILABLE_COPY[
      publicStatus as keyof typeof FRIENDLY_TOOL_UNAVAILABLE_COPY
    ][language];
  }

  return FRIENDLY_TOOL_UNAVAILABLE_COPY.coming_soon[language];
}

const STATUS_LABELS: Record<ToolStatus, { en: string; de: string }> = {
  live: { en: "Live", de: "Live" },
  available: { en: "Available", de: "Verfügbar" },
  credit_gated: { en: "Credits required", de: "Credits erforderlich" },
  preview: { en: "Preview", de: "Vorschau" },
  request_access: { en: "Request access", de: "Zugang anfragen" },
  coming_soon: { en: "Coming soon", de: "Demnächst" },
  pro_locked: { en: "Pro workflow", de: "Pro-Workflow" },
  disabled: { en: "Disabled", de: "Deaktiviert" },
  blocked_missing_env: { en: "In preparation", de: "Wird vorbereitet" },
  blocked_provider_failed: { en: "In preparation", de: "Wird vorbereitet" },
  blocked_missing_handler: { en: "In preparation", de: "Wird vorbereitet" },
  blocked_missing_credits: { en: "In preparation", de: "Wird vorbereitet" },
  blocked_storage_missing: { en: "In preparation", de: "Wird vorbereitet" },
  blocked_missing_infrastructure: { en: "In preparation", de: "Wird vorbereitet" },
};

const PUBLIC_STATUS_LABELS: Record<
  PublicToolStatus,
  { en: string; de: string }
> = {
  live: { en: "Live", de: "Live" },
  preview: { en: "Preview", de: "Vorschau" },
  request_access: { en: "Request access", de: "Zugang anfragen" },
  coming_soon: { en: "Coming soon", de: "Demnächst" },
  pro_locked: { en: "Pro workflow", de: "Pro-Workflow" },
  disabled: { en: "Disabled", de: "Deaktiviert" },
  blocked: { en: "In preparation", de: "Wird vorbereitet" },
};

export function getToolStatusLabel(
  status: ToolStatus,
  language: "en" | "de" = "en"
): string {
  return STATUS_LABELS[status][language];
}

export function getPublicToolStatusLabel(
  publicStatus: PublicToolStatus,
  language: "en" | "de" = "en"
): string {
  return PUBLIC_STATUS_LABELS[publicStatus][language];
}

export function resolveToolStatusMetadata(input: {
  status: ToolStatus;
  canRun: boolean;
  canPreview: boolean;
  canShowToUser: boolean;
  requiresCredits: boolean;
}): {
  publicStatus: PublicToolStatus;
  labelEn: string;
  labelDe: string;
  canRun: boolean;
  canPreview: boolean;
  canShowToUser: boolean;
  requiresCredits: boolean;
} {
  const publicStatus = input.canRun
    ? "live"
    : normalizePublicToolStatus(input.status);
  const labels = PUBLIC_STATUS_LABELS[publicStatus];

  return {
    publicStatus,
    labelEn: labels.en,
    labelDe: labels.de,
    canRun: input.canRun,
    canPreview: input.canPreview,
    canShowToUser: input.canShowToUser,
    requiresCredits: input.requiresCredits,
  };
}
