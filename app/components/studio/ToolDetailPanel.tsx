"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import RequestAccessPanel from "./RequestAccessPanel";
import {
  TOOL_DETAIL_PANEL_COPY,
  isSocialAssetPackDeploymentReady,
  type ToolDetailPanelPrimaryCta,
} from "@/app/lib/tools/creator-tools";
import type { ResolvedCreatorTool } from "@/app/lib/tools/resolve-tool";
import {
  resolveToolDetailPanelView,
  type ToolDetailCta,
} from "@/app/lib/tools/tool-detail-panel-view";
import { studioDashboardStatusBadgeClass } from "@/lib/obsidian/status-badge-classes";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { dashboardCtaButtonClass } from "@/lib/studio/dashboard-ui-tokens";
import { PREMIUM_SPRING } from "@/lib/obsidian/premium-tokens";
import { A11Y } from "@/lib/obsidian/a11y-tokens";
import { obsidianButtonClass } from "@/lib/obsidian/button-tokens";

type PanelView = "detail" | "request";

type Props = {
  open: boolean;
  resolved: ResolvedCreatorTool;
  language?: "en" | "de";
  onClose: () => void;
  /** Routes to in-page workflow (live tools). Must not call providers for non-live tools. */
  onLaunchWorkflow?: () => void;
  /** Preview-only path — pack preview, planning panels; no paid render. */
  onPreviewWorkflow?: () => void;
  onUpgrade?: () => void;
  launchContext?: string | null;
  /** Render inline inside GeneratorOverlay (no second backdrop). */
  embedded?: boolean;
  /** Calm overlay on dashboard home — benefit, credits, status, request/back only. */
  simpleOverlay?: boolean;
};

function statusBadgeClass(publicStatus: Parameters<typeof studioDashboardStatusBadgeClass>[0]): string {
  return studioDashboardStatusBadgeClass(publicStatus);
}

function requestVariantForCta(
  cta: ToolDetailPanelPrimaryCta
): "request_access" | "notify" {
  return cta === "notify_me" ? "notify" : "request_access";
}

export default function ToolDetailPanel({
  open,
  resolved,
  language = "en",
  onClose,
  onLaunchWorkflow,
  onPreviewWorkflow,
  onUpgrade,
  launchContext = null,
  embedded = false,
  simpleOverlay = false,
}: Props) {
  const isDe = language === "de";
  const copy = TOOL_DETAIL_PANEL_COPY;
  const [view, setView] = useState<PanelView>("detail");
  const isMobileSheet = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    setView("detail");
  }, [resolved.tool.id]);

  const effectiveResolved =
    resolved.tool.id === "social_asset_pack" &&
    isSocialAssetPackDeploymentReady()
      ? {
          ...resolved,
          status: "live" as const,
          canRun: true,
          canPreview: true,
          providerValidated: true,
          reasonIfUnavailable: null,
        }
      : resolved;

  const panel = resolveToolDetailPanelView(
    effectiveResolved,
    language,
    launchContext,
    {
      simpleOverlay: simpleOverlay && !effectiveResolved.canRun,
    }
  );

  if (!open) return null;

  function handleClose() {
    setView("detail");
    onClose();
  }

  function handleCta(cta: ToolDetailCta) {
    switch (cta.action) {
      case "preview":
        if (simpleOverlay) return;
        onPreviewWorkflow?.();
        if (!embedded) handleClose();
        return;
      case "launch":
        if (simpleOverlay) return;
        onLaunchWorkflow?.();
        if (!embedded) handleClose();
        return;
      case "upgrade":
        onUpgrade?.();
        handleClose();
        return;
      case "request_access":
      case "notify":
        setView("request");
        return;
      default:
        return;
    }
  }

  const panelBody =
    view === "request" && panel.legacyPrimaryCta ? (
      <div
        className={`flex min-h-0 flex-1 flex-col overflow-y-auto p-5 ${embedded ? "pt-5" : "pt-12"}`}
      >
        <RequestAccessPanel
          tool={resolved.tool}
          language={language}
          variant={requestVariantForCta(panel.legacyPrimaryCta)}
          onBack={() => setView("detail")}
          onClose={handleClose}
        />
      </div>
    ) : simpleOverlay ? (
      <div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-5 pt-5"
        aria-labelledby="tool-detail-title"
      >
        <h2 id="tool-detail-title" className="sr-only">
          {panel.toolName}
        </h2>
        <span className={statusBadgeClass(panel.publicStatus)}>
          {panel.statusLabel}
        </span>

        <p className="mt-4 text-sm leading-relaxed text-[#E5E7EB]">
          {panel.benefit}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-neutral-800/80 bg-[#0a0a0a]/50 px-3 py-2.5">
            <p className={A11Y.mutedLabel}>
              {isDe ? copy.creditsLabel.de : copy.creditsLabel.en}
            </p>
            <p className="mt-1 text-sm font-semibold text-amber-300">
              {panel.creditsDisplay}
            </p>
          </div>
          <div className="rounded-xl border border-neutral-800/80 bg-[#0a0a0a]/50 px-3 py-2.5">
            <p className={A11Y.mutedLabel}>
              {isDe ? copy.statusLabel.de : copy.statusLabel.en}
            </p>
            <p className="mt-1 text-sm font-semibold text-neutral-200">
              {panel.statusLabel}
            </p>
          </div>
        </div>

        <div className="mt-auto space-y-2 border-t border-white/[0.06] pt-5">
          {panel.ctas.map((cta) => (
            <button
              key={`${cta.action}-${cta.label}`}
              type="button"
              onClick={() => handleCta(cta)}
              className={`w-full ${dashboardCtaButtonClass(cta.variant, { size: "md" })}`}
            >
              {cta.label}
            </button>
          ))}

          <button
            type="button"
            onClick={handleClose}
            className={`w-full ${obsidianButtonClass("ghost", { size: "md" })}`}
          >
            {isDe ? copy.back.de : copy.back.en}
          </button>
        </div>
      </div>
    ) : (
      <div
        className={`flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-5 ${embedded ? "pt-5" : "pt-12"}`}
      >
        <header className={`space-y-3 ${embedded ? "" : "pr-8"}`}>
          <span className={statusBadgeClass(panel.publicStatus)}>
            {panel.statusLabel}
          </span>
          <h2
            id="tool-detail-title"
            className="text-xl font-bold tracking-tight text-[#F9FAFB]"
          >
            {panel.toolName}
          </h2>
        </header>

        {panel.contextMessage ? (
          <p
            role="status"
            className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-sm leading-relaxed text-amber-100/90"
          >
            {panel.contextMessage}
          </p>
        ) : null}

        <dl className="mt-5 space-y-4">
          <div>
            <dt className={A11Y.mutedLabel}>
              {isDe ? copy.benefitLabel.de : copy.benefitLabel.en}
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-[#E5E7EB]">
              {panel.benefit}
            </dd>
          </div>

          <div>
            <dt className={A11Y.mutedLabel}>
              {isDe ? copy.whatItDoesLabel.de : copy.whatItDoesLabel.en}
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-neutral-400">
              {panel.whatItDoes}
            </dd>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-neutral-800/80 bg-[#0a0a0a]/50 px-3 py-2.5">
              <dt className={A11Y.mutedLabel}>
                {isDe ? copy.creditsLabel.de : copy.creditsLabel.en}
              </dt>
              <dd className="mt-1 text-sm font-semibold text-amber-300">
                {panel.creditsDisplay}
              </dd>
            </div>
            <div className="rounded-xl border border-neutral-800/80 bg-[#0a0a0a]/50 px-3 py-2.5">
              <dt className={A11Y.mutedLabel}>
                {isDe ? copy.statusLabel.de : copy.statusLabel.en}
              </dt>
              <dd className="mt-1 text-sm font-semibold text-neutral-200">
                {panel.statusLabel}
              </dd>
            </div>
          </div>

          {panel.requirements.length > 0 ? (
            <div>
              <dt className={A11Y.mutedLabel}>
                {isDe ? copy.requirementsLabel.de : copy.requirementsLabel.en}
              </dt>
              <dd className="mt-2">
                <ul className="space-y-1.5">
                  {panel.requirements.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 text-xs leading-relaxed text-neutral-400"
                    >
                      <span
                        className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500/70"
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ) : null}
        </dl>

        {panel.showNonLiveNote ? (
          <p className="mt-4 rounded-xl border border-white/[0.06] bg-[#0E1220]/50 px-3 py-2.5 text-[11px] leading-relaxed text-neutral-500">
            {isDe ? copy.noGenerationNote.de : copy.noGenerationNote.en}
          </p>
        ) : null}

        <div className="mt-auto space-y-2 border-t border-white/[0.06] pt-5">
          {panel.ctas.map((cta) => (
            <button
              key={`${cta.action}-${cta.label}`}
              type="button"
              onClick={() => handleCta(cta)}
              className={`w-full ${dashboardCtaButtonClass(cta.variant, { size: "md" })}`}
            >
              {cta.label}
            </button>
          ))}

          <button
            type="button"
            onClick={handleClose}
            className={`w-full ${obsidianButtonClass("ghost", { size: "md" })}`}
          >
            {isDe ? copy.backToToolbox.de : copy.backToToolbox.en}
          </button>
        </div>
      </div>
    );

  if (embedded) {
    return (
      <div
        className="flex min-h-[280px] w-full flex-col rounded-xl border border-white/[0.08] bg-[#0E1220]/60"
        role="region"
        aria-labelledby="tool-detail-title"
      >
        {panelBody}
      </div>
    );
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="tool-detail-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-[2px] md:items-stretch md:justify-end"
          role="presentation"
          onClick={handleClose}
        >
          <motion.aside
            initial={
              isMobileSheet
                ? { opacity: 0, y: "100%" }
                : { opacity: 0, x: 28 }
            }
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={
              isMobileSheet ? { opacity: 0, y: "100%" } : { opacity: 0, x: 20 }
            }
            transition={PREMIUM_SPRING}
            className="relative flex max-h-[min(92dvh,640px)] w-full flex-col rounded-t-2xl border border-neutral-800/80 border-b-0 bg-neutral-900/95 shadow-[0_-24px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl md:h-full md:max-h-none md:max-w-md md:rounded-none md:border-b-0 md:border-l md:shadow-[-24px_0_80px_rgba(0,0,0,0.55)] lg:max-w-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tool-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              aria-label={isDe ? "Schließen" : "Close"}
              className={`absolute right-4 top-4 z-10 rounded-lg p-1.5 text-neutral-400 transition hover:text-white ${A11Y.focusRing}`}
            >
              <X className="h-4 w-4" />
            </button>

            {panelBody}
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
