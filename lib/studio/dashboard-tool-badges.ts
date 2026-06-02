import {
  CREATOR_TOOL_DETAILS,
  type CreatorToolId,
} from "@/app/lib/tools/creator-tools";
import type { StudioCategoryToolView } from "@/app/lib/studio/studio-categories";
import {
  isCreatorToolChipInteractive,
  resolveCreatorToolChipVisualVariant,
  type CreatorToolChipVisualVariant,
} from "@/lib/studio/creator-tool-chip-interaction";
import {
  resolveToolStatusMetadata,
  type PublicToolStatus,
} from "@/app/lib/tools/tool-status";

export type DashboardToolVisualVariant = CreatorToolChipVisualVariant;

/** Home chips — scannable credit hints for primary create workflows. */
const DASHBOARD_HOME_CREDIT_LABELS: Partial<
  Record<CreatorToolId, { en: string; de: string }>
> = {
  social_asset_pack: { en: "45 Credits", de: "45 Credits" },
  create_image: { en: "from 1 Credit", de: "ab 1 Credit" },
  create_video: { en: "25 Credits", de: "25 Credits" },
};

export function getDashboardHomeCreditBadge(
  toolId: CreatorToolId,
  language: "en" | "de"
): string | null {
  const entry = DASHBOARD_HOME_CREDIT_LABELS[toolId];
  if (!entry) return null;
  return language === "de" ? entry.de : entry.en;
}

const DASHBOARD_STATUS_LABELS: Record<
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

/** Trim catalog estimate strings to scannable home badges (e.g. "ab 1 Credit", "45 Credits"). */
export function shortenCreditsEstimate(
  estimate: string,
  language: "en" | "de"
): string {
  const trimmed = estimate.trim();
  const proSplit = trimmed.split(/\s+(pro|per|für|for)\s+/i)[0]?.trim();
  const cut = proSplit && proSplit.length > 0 ? proSplit : trimmed;

  if (language === "de" && /^Ab\s+/i.test(cut)) {
    return cut.replace(/^Ab/, "ab");
  }
  if (language === "en" && /^From\s+/i.test(cut)) {
    return cut.replace(/^From/, "from");
  }

  return cut;
}

export function formatDashboardCreditsBadge(
  view: StudioCategoryToolView,
  language: "en" | "de"
): string | null {
  if (!(view.canRun && view.status === "live")) {
    return null;
  }

  const isDe = language === "de";
  const locale = isDe ? "de-DE" : "en-US";
  const detail = CREATOR_TOOL_DETAILS[view.id];
  const estimate = (
    isDe ? detail?.creditsEstimateDe : detail?.creditsEstimateEn
  )?.trim();

  if (estimate) {
    return shortenCreditsEstimate(estimate, language);
  }

  if (view.estimatedCredits != null && view.estimatedCredits > 0) {
    const n = view.estimatedCredits.toLocaleString(locale);
    if (view.estimatedCredits === 1) {
      return isDe ? "1 Credit" : "1 credit";
    }
    return isDe ? `${n} Credits` : `${n} credits`;
  }

  if (view.estimatedCredits === 0) {
    return isDe ? "Kostenlos" : "Free";
  }

  return null;
}

export function getDashboardStatusBadgeLabel(
  publicStatus: PublicToolStatus,
  language: "en" | "de"
): string {
  return DASHBOARD_STATUS_LABELS[publicStatus][language === "de" ? "de" : "en"];
}

export type DashboardToolTrailingBadge = {
  kind: "credits" | "status";
  label: string;
};

export function resolveDashboardToolTrailingBadge(
  view: StudioCategoryToolView,
  language: "en" | "de"
): DashboardToolTrailingBadge {
  const homeCredit = getDashboardHomeCreditBadge(view.id, language);
  if (homeCredit) {
    return { kind: "credits", label: homeCredit };
  }

  const credits = formatDashboardCreditsBadge(view, language);
  if (credits) {
    return { kind: "credits", label: credits };
  }

  const meta = resolveToolStatusMetadata({
    status: view.resolved.status,
    canRun: view.canRun,
    canPreview: view.canPreview,
    canShowToUser: view.resolved.canShowToUser,
    requiresCredits: view.resolved.requiresCredits,
  });

  return {
    kind: "status",
    label: getDashboardStatusBadgeLabel(meta.publicStatus, language),
  };
}

export function resolveDashboardToolVisualVariant(
  view: StudioCategoryToolView
): DashboardToolVisualVariant {
  return resolveCreatorToolChipVisualVariant(view);
}

export function isDashboardToolInteractive(
  view: StudioCategoryToolView
): boolean {
  return isCreatorToolChipInteractive(view);
}
