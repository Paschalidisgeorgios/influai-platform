/**
 * Tool detail panel — user-facing view model (no provider ids, no internal blockers).
 */

import { studioToolRequiresAsset } from "@/app/lib/studio/studio-categories";
import {
  getCreatorToolDetailForPanel,
  getCreatorToolLabel,
  getToolDetailPanelPrimaryCtaLabel,
  isSocialAssetPackDeploymentReady,
  resolveToolDetailPanelPrimaryCta,
  TOOL_DETAIL_PANEL_COPY,
  type CreatorToolId,
  type ToolDetailPanelPrimaryCta,
} from "./creator-tools";
import type { ResolvedCreatorTool } from "./resolve-tool";
import {
  getPublicToolStatusLabel,
  looksLikeInternalBlockerText,
  resolveToolStatusMetadata,
  type PublicToolStatus,
} from "./tool-status";

export type ToolDetailCtaAction =
  | "launch"
  | "preview"
  | "request_access"
  | "notify"
  | "upgrade";

export type ToolDetailCtaVariant =
  | "primary"
  | "secondary"
  | "preview"
  | "ghost"
  | "success";

export type ToolDetailCta = {
  action: ToolDetailCtaAction;
  label: string;
  variant: ToolDetailCtaVariant;
};

export type ToolDetailPanelView = {
  toolId: CreatorToolId;
  toolName: string;
  benefit: string;
  whatItDoes: string;
  creditsDisplay: string;
  statusLabel: string;
  publicStatus: PublicToolStatus;
  requirements: string[];
  ctas: ToolDetailCta[];
  legacyPrimaryCta: ToolDetailPanelPrimaryCta | null;
  showNonLiveNote: boolean;
  contextMessage: string | null;
  canRun: boolean;
};

const LIVE_CTA_LABELS: Partial<
  Record<
    CreatorToolId,
    { preview?: { en: string; de: string }; launch: { en: string; de: string } }
  >
> = {
  social_asset_pack: {
    preview: { en: "Preview Pack", de: "Pack-Vorschau" },
    launch: { en: "Render Pack", de: "Pack rendern" },
  },
  create_video: {
    launch: { en: "Render Motion Video", de: "Motion-Video rendern" },
  },
  create_image: {
    launch: { en: "Create Image", de: "Bild erstellen" },
  },
  hooks_captions: {
    launch: { en: "Open Hooks & Captions", de: "Hooks & Captions öffnen" },
  },
  export_pack: {
    launch: { en: "Open Export Pack", de: "Export-Paket öffnen" },
  },
  check_creative_score: {
    launch: { en: "Open Creative Score", de: "Creative Score öffnen" },
  },
};

function formatCreditsDisplay(
  estimatedCredits: number,
  language: "en" | "de",
  customLabel?: string
): string {
  const isDe = language === "de";
  if (customLabel?.trim()) {
    return customLabel.trim();
  }
  if (estimatedCredits <= 0) {
    return isDe
      ? TOOL_DETAIL_PANEL_COPY.creditsFree.de
      : TOOL_DETAIL_PANEL_COPY.creditsFree.en;
  }
  const locale = isDe ? "de-DE" : "en-US";
  const formatted = estimatedCredits.toLocaleString(locale);
  if (estimatedCredits === 1) {
    return isDe ? "1 Credit" : "1 credit";
  }
  return isDe ? `${formatted} Credits` : `${formatted} credits`;
}

function resolveRequirements(
  resolved: ResolvedCreatorTool,
  language: "en" | "de"
): string[] {
  const isDe = language === "de";
  const lines: string[] = [];
  const meta = resolveToolStatusMetadata({
    status: resolved.status,
    canRun: resolved.canRun,
    canPreview: resolved.canPreview,
    canShowToUser: resolved.canShowToUser,
    requiresCredits: resolved.requiresCredits,
  });

  if (studioToolRequiresAsset(resolved.tool.id)) {
    lines.push(
      isDe
        ? "Referenz- oder Gallery-Asset erforderlich"
        : "Reference or Gallery asset required"
    );
  }

  if (meta.publicStatus === "preview" || resolved.canPreview) {
    lines.push(
      isDe
        ? "Vorschau verbraucht keine Credits"
        : "Preview uses no credits"
    );
  }

  if (!resolved.canRun) {
    lines.push(
      isDe
        ? "Keine Provider-Calls bis zur Freischaltung"
        : "No provider calls until this workflow is live"
    );
  } else if (resolved.requiresCredits && resolved.requiredCredits > 0) {
    lines.push(
      isDe
        ? "Credits werden vor dem Rendern angezeigt und abgebucht"
        : "Credits are shown upfront and charged before render"
    );
  }

  if (meta.publicStatus === "pro_locked") {
    lines.push(
      isDe ? "Pro-Plan erforderlich" : "Pro plan required"
    );
  }

  return lines;
}

function resolveLiveCtas(
  toolId: CreatorToolId,
  language: "en" | "de"
): ToolDetailCta[] {
  const isDe = language === "de";
  const labels = LIVE_CTA_LABELS[toolId];
  if (!labels) {
    return [
      {
        action: "launch",
        label: isDe ? "Im Studio öffnen" : "Open in studio",
        variant: "primary",
      },
    ];
  }

  const ctas: ToolDetailCta[] = [];
  if (labels.preview) {
    ctas.push({
      action: "preview",
      label: isDe ? labels.preview.de : labels.preview.en,
      variant: "preview",
    });
  }
  if (labels.launch) {
    ctas.push({
      action: "launch",
      label: isDe ? labels.launch.de : labels.launch.en,
      variant: labels.preview ? "secondary" : "primary",
    });
  }
  return ctas;
}

/** Generator overlay — request access / upgrade only (no preview → studio). */
function resolveNonLiveOverlayCtas(
  resolved: ResolvedCreatorTool,
  language: "en" | "de",
  legacyCta: ToolDetailPanelPrimaryCta | null
): ToolDetailCta[] {
  const isDe = language === "de";
  const meta = resolveToolStatusMetadata({
    status: resolved.status,
    canRun: resolved.canRun,
    canPreview: resolved.canPreview,
    canShowToUser: resolved.canShowToUser,
    requiresCredits: resolved.requiresCredits,
  });

  if (meta.publicStatus === "pro_locked") {
    return [
      {
        action: "upgrade",
        label: isDe ? "Upgrade ansehen" : "View upgrade",
        variant: "primary",
      },
    ];
  }

  if (
    legacyCta === "request_access" ||
    legacyCta === "notify_me"
  ) {
    const label = isDe ? "Zugang anfragen" : "Request access";
    return [
      {
        action: legacyCta === "notify_me" ? "notify" : "request_access",
        label,
        variant: "primary",
      },
    ];
  }

  return [];
}

function resolveNonLiveCtas(
  resolved: ResolvedCreatorTool,
  language: "en" | "de",
  legacyCta: ToolDetailPanelPrimaryCta | null
): ToolDetailCta[] {
  const isDe = language === "de";
  const meta = resolveToolStatusMetadata({
    status: resolved.status,
    canRun: resolved.canRun,
    canPreview: resolved.canPreview,
    canShowToUser: resolved.canShowToUser,
    requiresCredits: resolved.requiresCredits,
  });

  if (meta.publicStatus === "pro_locked") {
    return [{ action: "upgrade", label: isDe ? "Upgrade ansehen" : "View upgrade", variant: "primary" }];
  }

  if (!legacyCta) return [];

  const label = getToolDetailPanelPrimaryCtaLabel(legacyCta, language);
  const action: ToolDetailCtaAction =
    legacyCta === "preview_workflow"
      ? "preview"
      : legacyCta === "notify_me"
        ? "notify"
        : "request_access";

  return [{ action, label, variant: "preview" }];
}

function sanitizeContextMessage(
  message: string | null | undefined,
  language: "en" | "de"
): string | null {
  if (!message?.trim()) return null;
  if (looksLikeInternalBlockerText(message)) {
    return language === "de"
      ? "Dieser Workflow wird gerade vorbereitet. Schau bald wieder vorbei."
      : "This workflow is being prepared. Check back soon.";
  }
  return message.trim();
}

export function resolveToolDetailPanelView(
  resolved: ResolvedCreatorTool,
  language: "en" | "de" = "en",
  launchContext?: string | null,
  options?: { simpleOverlay?: boolean }
): ToolDetailPanelView {
  const simpleOverlay = options?.simpleOverlay === true;

  if (
    resolved.tool.id === "social_asset_pack" &&
    isSocialAssetPackDeploymentReady()
  ) {
    const detail = getCreatorToolDetailForPanel(resolved.tool, language);
    return {
      toolId: resolved.tool.id,
      toolName: getCreatorToolLabel(resolved.tool, language),
      benefit: detail.benefit,
      whatItDoes: detail.whatItDoes,
      creditsDisplay: formatCreditsDisplay(
        detail.estimatedCredits,
        language,
        detail.creditsEstimateLabel
      ),
      statusLabel: getPublicToolStatusLabel("live", language),
      publicStatus: "live",
      requirements: resolveRequirements(
        { ...resolved, status: "live", canRun: true, canPreview: true },
        language
      ),
      ctas: resolveLiveCtas(resolved.tool.id, language),
      legacyPrimaryCta: null,
      showNonLiveNote: false,
      contextMessage: sanitizeContextMessage(launchContext, language),
      canRun: true,
    };
  }

  const detail = getCreatorToolDetailForPanel(resolved.tool, language);
  const statusMeta = resolveToolStatusMetadata({
    status: resolved.status,
    canRun: resolved.canRun,
    canPreview: resolved.canPreview,
    canShowToUser: resolved.canShowToUser,
    requiresCredits: resolved.requiresCredits,
  });

  const legacyPrimaryCta = resolveToolDetailPanelPrimaryCta({
    publicStatus: statusMeta.publicStatus,
    audience: resolved.tool.audience,
  });

  const ctas =
    resolved.canRun && statusMeta.publicStatus === "live"
      ? resolveLiveCtas(resolved.tool.id, language)
      : simpleOverlay
        ? resolveNonLiveOverlayCtas(resolved, language, legacyPrimaryCta)
        : resolveNonLiveCtas(resolved, language, legacyPrimaryCta);

  const contextMessage = sanitizeContextMessage(
    launchContext ?? resolved.reasonIfUnavailable,
    language
  );

  return {
    toolId: resolved.tool.id,
    toolName: getCreatorToolLabel(resolved.tool, language),
    benefit: detail.benefit,
    whatItDoes: detail.whatItDoes,
    creditsDisplay: formatCreditsDisplay(
      detail.estimatedCredits,
      language,
      detail.creditsEstimateLabel
    ),
    statusLabel: getPublicToolStatusLabel(statusMeta.publicStatus, language),
    publicStatus: statusMeta.publicStatus,
    requirements: resolveRequirements(resolved, language),
    ctas,
    legacyPrimaryCta,
    showNonLiveNote: !resolved.canRun,
    contextMessage,
    canRun: resolved.canRun,
  };
}
