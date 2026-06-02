/**
 * Social Asset Pack dashboard panel — explicit UI state machine.
 * Prevents provider calls / credit charges outside allowed phases.
 */

import type { SocialAssetPackRenderResponse } from "./types";

export type SocialAssetPackPanelState =
  | "idle"
  | "preview_loading"
  | "preview_ready"
  | "credit_checking"
  | "insufficient_credits"
  | "rendering"
  | "partial_success"
  | "completed"
  | "failed_refunded";

/** @deprecated Use SocialAssetPackPanelState */
export type AgentPackPanelState = SocialAssetPackPanelState;

export type PackPanelTransitionContext = {
  hasPreview: boolean;
  creditBalance?: number;
  packCredits: number;
  previewLoading: boolean;
  creditChecking: boolean;
  rendering: boolean;
  result: SocialAssetPackRenderResponse | null;
  previewError: boolean;
};

export function canStartPreview(state: SocialAssetPackPanelState): boolean {
  return (
    state === "idle" ||
    state === "preview_ready" ||
    state === "insufficient_credits" ||
    state === "completed" ||
    state === "partial_success" ||
    state === "failed_refunded"
  );
}

export function canStartRender(state: SocialAssetPackPanelState): boolean {
  return state === "preview_ready";
}

export function isTerminalRenderState(state: SocialAssetPackPanelState): boolean {
  return (
    state === "completed" ||
    state === "partial_success" ||
    state === "failed_refunded"
  );
}

export function blocksProviderWork(state: SocialAssetPackPanelState): boolean {
  return (
    state === "idle" ||
    state === "preview_loading" ||
    state === "preview_ready" ||
    state === "credit_checking" ||
    state === "insufficient_credits"
  );
}

export function resolvePreviewReadyState(
  creditBalance: number | undefined,
  packCredits: number
): "preview_ready" | "insufficient_credits" {
  if (typeof creditBalance === "number" && creditBalance < packCredits) {
    return "insufficient_credits";
  }
  return "preview_ready";
}

export function resolveRenderOutcomeState(
  result: SocialAssetPackRenderResponse
): "partial_success" | "completed" | "failed_refunded" {
  if (result.status === "completed") return "completed";
  if (result.status === "partial") return "partial_success";
  return "failed_refunded";
}

export function derivePackPanelState(
  ctx: PackPanelTransitionContext
): SocialAssetPackPanelState {
  if (ctx.result) {
    return resolveRenderOutcomeState(ctx.result);
  }
  if (ctx.rendering) return "rendering";
  if (ctx.creditChecking) return "credit_checking";
  if (ctx.previewLoading) return "preview_loading";
  if (ctx.hasPreview) {
    return resolvePreviewReadyState(ctx.creditBalance, ctx.packCredits);
  }
  if (ctx.previewError) return "idle";
  return "idle";
}

export const PACK_PANEL_STATE_COPY = {
  en: {
    creditChecking: "Checking your credit balance before rendering…",
    rendering: "Rendering your Social Asset Pack…",
    partialSuccess: "Pack partially saved — failed portions were refunded.",
    completed: "Pack saved to your Creator Gallery.",
    failedRefunded: "Rendering could not finish. Refunded credits are back in your balance.",
    previewLoading: "Assembling your free pack preview…",
    insufficientCredits: "Not enough credits to render this pack.",
  },
  de: {
    creditChecking: "Credit-Guthaben wird vor dem Rendern geprüft…",
    rendering: "Social Asset Pack wird gerendert…",
    partialSuccess: "Pack teilweise gespeichert — fehlgeschlagene Teile wurden erstattet.",
    completed: "Pack in deiner Creator Gallery gespeichert.",
    failedRefunded:
      "Rendering konnte nicht abgeschlossen werden. Erstattete Credits sind wieder verfügbar.",
    previewLoading: "Kostenlose Pack-Vorschau wird erstellt…",
    insufficientCredits: "Nicht genug Credits zum Rendern dieses Packs.",
  },
} as const;
