"use client";

import { Film, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { CREATOR_TOOL_DETAILS } from "@/app/lib/tools/creator-tools";
import {
  isCreatorToolChipInteractive,
  resolveCreatorToolChipVisualVariant,
} from "@/lib/studio/creator-tool-chip-interaction";
import type { StudioCategoryToolView } from "@/app/lib/studio/studio-categories";
import {
  resolveToolStatusMetadata,
  type PublicToolStatus,
} from "@/app/lib/tools/tool-status";
import { CREATOR_TOOL_ICONS } from "@/lib/studio/creator-tool-icons";
import type { CreatorToolId } from "@/app/lib/tools/creator-tools";
import {
  CONTEXT_ACTION_BUTTON_BASE,
  CONTEXT_ACTION_BUTTON_GLASS,
  CONTEXT_ACTION_BUTTON_LIVE,
  CONTEXT_ACTION_BUTTON_LIVE_SELECTED,
  CONTEXT_ACTION_BUTTON_MUTED,
  CONTEXT_ACTION_ICON_GLASS,
  CONTEXT_ACTION_ICON_LIVE,
  CONTEXT_ACTION_ICON_MUTED,
} from "@/lib/studio/context-action-tokens";
import { A11Y } from "@/lib/obsidian/a11y-tokens";
import { studioDashboardStatusBadgeClass } from "@/lib/obsidian/status-badge-classes";
import { PREMIUM_SPRING } from "@/lib/obsidian/premium-tokens";

function ContextActionButtonIcon({
  toolId,
  className,
}: {
  toolId: CreatorToolId;
  className?: string;
}) {
  const Icon = CREATOR_TOOL_ICONS[toolId] ?? Film;
  return <Icon className={className} aria-hidden />;
}

type Props = {
  view: StudioCategoryToolView;
  language?: "en" | "de";
  selected?: boolean;
  /** Staggered fade-in — off in ContextActionBar to avoid category-switch motion. */
  animateEntrance?: boolean;
  index?: number;
  onClick: () => void;
};

function resolveVisualVariant(view: StudioCategoryToolView) {
  return resolveCreatorToolChipVisualVariant(view);
}

function isInteractive(view: StudioCategoryToolView): boolean {
  return isCreatorToolChipInteractive(view);
}

function statusBadgeClass(publicStatus: PublicToolStatus): string {
  return studioDashboardStatusBadgeClass(publicStatus);
}

function formatCreditsLine(
  view: StudioCategoryToolView,
  language: "en" | "de"
): string | null {
  const isDe = language === "de";
  const locale = isDe ? "de-DE" : "en-US";
  const detail = CREATOR_TOOL_DETAILS[view.id];

  if (view.canRun && view.status === "live") {
    if (view.estimatedCredits != null && view.estimatedCredits > 0) {
      const n = view.estimatedCredits.toLocaleString(locale);
      return view.estimatedCredits === 1
        ? isDe
          ? "1 Credit"
          : "1 credit"
        : isDe
          ? `${n} Credits`
          : `${n} credits`;
    }
    if (view.estimatedCredits === 0) {
      return isDe ? "Kostenlos" : "Free";
    }
    return null;
  }

  const estimateLabel = isDe
    ? detail?.creditsEstimateDe
    : detail?.creditsEstimateEn;

  if (estimateLabel?.trim()) {
    return estimateLabel.trim();
  }

  if (view.estimatedCredits != null && view.estimatedCredits > 0) {
    const prefix = isDe ? "ca." : "est.";
    const n = view.estimatedCredits.toLocaleString(locale);
    return `${prefix} ${n} ${isDe ? "Credits" : "credits"}`;
  }

  if (
    view.status === "preview" ||
    view.status === "request_access" ||
    view.status === "coming_soon" ||
    view.status === "blocked"
  ) {
    if (detail?.estimatedCredits === 0) {
      return isDe ? "Keine Credits in der Vorschau" : "No credits in preview";
    }
    return isDe ? "Keine Credits bis Freischaltung" : "No credits until live";
  }

  return null;
}

export default function ContextActionButton({
  view,
  language = "en",
  selected = false,
  animateEntrance = true,
  index = 0,
  onClick,
}: Props) {
  const isDe = language === "de";
  const variant = resolveVisualVariant(view);
  const interactive = isInteractive(view);
  const meta = resolveToolStatusMetadata({
    status: view.resolved.status,
    canRun: view.canRun,
    canPreview: view.canPreview,
    canShowToUser: view.resolved.canShowToUser,
    requiresCredits: view.resolved.requiresCredits,
  });
  const statusLabel = isDe ? meta.labelDe : meta.labelEn;
  const creditsLine = formatCreditsLine(view, language);
  const showLock = view.status === "pro_locked";

  const variantClasses =
    variant === "live"
      ? `${CONTEXT_ACTION_BUTTON_LIVE} ${selected ? CONTEXT_ACTION_BUTTON_LIVE_SELECTED : ""}`
      : variant === "glass"
        ? CONTEXT_ACTION_BUTTON_GLASS
        : CONTEXT_ACTION_BUTTON_MUTED;

  const iconClasses =
    variant === "live"
      ? CONTEXT_ACTION_ICON_LIVE
      : variant === "glass"
        ? CONTEXT_ACTION_ICON_GLASS
        : CONTEXT_ACTION_ICON_MUTED;

  const badgeClass = statusBadgeClass(meta.publicStatus);

  return (
    <motion.button
      type="button"
      initial={animateEntrance ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={
        animateEntrance
          ? { ...PREMIUM_SPRING, delay: index * 0.03 }
          : { duration: 0 }
      }
      disabled={!interactive}
      onClick={interactive ? onClick : undefined}
      title={view.description}
      aria-disabled={!interactive}
      aria-pressed={variant === "live" && selected ? true : undefined}
      aria-label={`${view.label} — ${statusLabel}${creditsLine ? ` — ${creditsLine}` : ""}`}
      className={`${CONTEXT_ACTION_BUTTON_BASE} ${variantClasses} ${
        interactive ? A11Y.focusRing : ""
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${iconClasses}`}
        >
          {showLock ? (
            <Lock className="h-4 w-4" aria-hidden />
          ) : (
            <ContextActionButtonIcon toolId={view.id} className="h-4 w-4" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p
              className={`text-sm font-semibold leading-tight ${
                variant === "muted" ? "text-neutral-500" : "text-[#F9FAFB]"
              }`}
            >
              {view.label}
            </p>
            <span className={badgeClass}>
              {statusLabel}
            </span>
          </div>

          <p
            className={`mt-1 line-clamp-2 text-[11px] leading-relaxed ${
              variant === "muted" ? "text-neutral-600" : "text-neutral-400"
            }`}
          >
            {view.description}
          </p>

          {creditsLine ? (
            <p
              className={`mt-1.5 text-[10px] font-semibold uppercase tracking-wide ${
                variant === "live"
                  ? "text-amber-300/90"
                  : variant === "glass"
                    ? "text-neutral-500"
                    : "text-neutral-600"
              }`}
            >
              {creditsLine}
            </p>
          ) : null}
        </div>
      </div>
    </motion.button>
  );
}
