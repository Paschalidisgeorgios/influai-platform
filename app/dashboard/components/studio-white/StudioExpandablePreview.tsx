"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { PREMIUM_CLASSES, PREMIUM_SPRING } from "@/lib/obsidian/premium-tokens";
import type { WorkspacePreviewState } from "@/app/dashboard/hooks/useWorkspaceGeneration";
import CreatorCanvas from "@/app/components/studio/CreatorCanvas";
import type { CreatorCanvasAsset } from "@/app/components/studio/canvas-types";
import { canvasAssetFromPreview } from "@/lib/dashboard/studio-white/preview";

type Props = {
  open: boolean;
  onClose?: () => void;
  previewState: WorkspacePreviewState;
  isDe?: boolean;
  expansionSlot?: ReactNode;
  errorMessage?: string | null;
  sourceStudio?: "image" | "video";
  getToken?: () => Promise<string | null>;
  onCreditsUsed?: (payload?: { creditsAfter?: number | null }) => void;
  canvasAsset?: CreatorCanvasAsset | null;
  onCanvasAssetChange?: (asset: CreatorCanvasAsset) => void;
  variantNotice?: string | null;
  onVariantNotice?: (message: string | null) => void;
  modelModeId?: string | null;
  creditsUsed?: number;
  creditBalance?: number;
  onRegenerateWithMode?: (modelModeId: string, prompt: string) => void;
  onBuyCredits?: () => void;
  onUpgrade?: () => void;
  /** Always visible workspace (create page) — no slide-in panel chrome */
  persistent?: boolean;
  canvasInitialAction?: "variant" | "score" | null;
};

export default function StudioExpandablePreview({
  open,
  onClose,
  previewState,
  isDe = false,
  expansionSlot,
  errorMessage,
  sourceStudio = "image",
  getToken,
  onCreditsUsed,
  canvasAsset,
  onCanvasAssetChange,
  variantNotice,
  onVariantNotice,
  modelModeId,
  creditsUsed,
  creditBalance = 0,
  onRegenerateWithMode,
  onBuyCredits,
  onUpgrade,
  persistent = false,
  canvasInitialAction = null,
}: Props) {
  const isLoading = previewState.status === "loading";
  const isError = previewState.status === "error" || Boolean(errorMessage);
  const displayError =
    errorMessage ??
    (previewState.status === "error" ? previewState.message : null);

  const derivedAsset =
    canvasAsset ?? canvasAssetFromPreview(previewState, sourceStudio);

  const showTextResult =
    previewState.status === "success" && previewState.result?.type === "text";

  const tokenFn =
    getToken ??
    (async () => {
      return null;
    });

  const panelBody = (
    <>
      {!persistent ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9CA3AF]">
            {isDe ? "Studio" : "Studio"}
          </p>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label={isDe ? "Canvas schließen" : "Close canvas"}
              className="rounded-lg border border-white/[0.08] p-1.5 text-[#9CA3AF] transition hover:border-[#8B5CF6]/40 hover:text-[#F9FAFB]"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ) : null}

      <div
        className={`mb-4 overflow-hidden transition-[max-height,opacity] duration-200 ${
          isError && displayError ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {isError && displayError ? (
          <div
            role="alert"
            className="rounded-xl border border-[#EF4444]/25 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#FCA5A5]"
          >
            {displayError}
          </div>
        ) : null}
      </div>

      <p
        className={`mb-4 min-h-[1.25rem] text-center text-xs text-emerald-400/90 ${
          variantNotice ? "" : "invisible"
        }`}
        role="status"
      >
        {variantNotice ?? "\u00a0"}
      </p>

      {showTextResult ? (
            <div className={`${PREMIUM_CLASSES.glassCard} max-h-[50vh] overflow-y-auto p-4`}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#9CA3AF]">
                {previewState.result?.type === "text"
                  ? previewState.result.content
                  : ""}
              </p>
            </div>
          ) : (
            <CreatorCanvas
              asset={derivedAsset}
              modelModeId={modelModeId ?? derivedAsset?.modelModeId}
              creditsUsed={creditsUsed ?? derivedAsset?.creditsUsed}
              creditBalance={creditBalance}
              isDe={isDe}
              loading={isLoading}
              loadingMessage={
                previewState.status === "loading"
                  ? previewState.message
                  : undefined
              }
              getToken={tokenFn}
              onCreditsUsed={onCreditsUsed}
              onAssetCreated={onCanvasAssetChange}
              onVariantNotice={onVariantNotice}
              onRegenerateWithMode={onRegenerateWithMode}
              onBuyCredits={onBuyCredits}
              onUpgrade={onUpgrade}
              initialAction={canvasInitialAction}
            />
          )}

      {previewState.status === "success" && expansionSlot ? (
        <div className="-mx-1 mt-4">{expansionSlot}</div>
      ) : null}
    </>
  );

  if (persistent) {
    return (
      <section
        id="creator-canvas"
        aria-label={isDe ? "Creator Canvas" : "Creator Canvas"}
        className="relative mx-auto mt-6 w-full scroll-mt-24 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111827]/60 p-4 sm:p-5"
      >
        {panelBody}
      </section>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {open ? (
        <motion.section
          key="preview-panel"
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={PREMIUM_SPRING}
          aria-label={isDe ? "Creator Canvas" : "Creator Canvas"}
          className={`mx-auto mt-8 w-full max-w-5xl overflow-hidden p-5 ${PREMIUM_CLASSES.glass} shadow-2xl shadow-black/40`}
        >
          {panelBody}
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
