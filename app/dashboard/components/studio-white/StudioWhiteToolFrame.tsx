"use client";

import type { ReactNode } from "react";
import type { WorkspacePreviewState } from "@/app/dashboard/hooks/useWorkspaceGeneration";
import { CREATE_PAGE } from "@/lib/copy/launch-user-copy";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";
import CommandBar from "../obsidian/CommandBar";
import StudioExpandablePreview from "./StudioExpandablePreview";
import StudioStableShell from "./StudioStableShell";

type Pill = { id: string; label: string };

type Props = {
  previewState: WorkspacePreviewState;
  isPreviewOpen?: boolean;
  onPreviewClose?: () => void;
  fallbackPreviewSrc?: string | null;
  fallbackPreviewKind?: "image" | "video";
  showIdleFallback?: boolean;
  prompt?: string;
  onPromptChange?: (value: string) => void;
  onSubmit?: () => void;
  pills?: Pill[];
  loading?: boolean;
  disabled?: boolean;
  showCommandBar?: boolean;
  submitLabel?: string;
  engineGrid?: ReactNode;
  formatGrid?: ReactNode;
  durationRow?: ReactNode;
  steps?: ReactNode;
  creditMeter?: ReactNode;
  /** Shown under command box when preview closed (not duplicate with preview panel) */
  inlineError?: string | null;
  promptPlacement?: "top" | "bottom";
  layout?: "default" | "guided";
  greetingSlot?: ReactNode;
  /** Above prompt inside stable shell (e.g. page headline) */
  headerSlot?: ReactNode;
  commandBox?: ReactNode;
  /** Action type cards (image / video) — shown after prompt */
  actionCardsSlot?: ReactNode;
  intentHintSlot?: ReactNode;
  expansionSlot?: ReactNode;
  /** Hint when preview is closed */
  showPreviewClosedHint?: boolean;
  sourceStudio?: "image" | "video";
  getToken?: () => Promise<string | null>;
  onCreditsUsed?: (payload?: { creditsAfter?: number | null }) => void;
  canvasAsset?: import("@/app/components/studio/canvas-types").CreatorCanvasAsset | null;
  onCanvasAssetChange?: (
    asset: import("@/app/components/studio/canvas-types").CreatorCanvasAsset
  ) => void;
  variantNotice?: string | null;
  onVariantNotice?: (message: string | null) => void;
  modelModeId?: string | null;
  creditsUsed?: number;
  creditBalance?: number;
  onRegenerateWithMode?: (modelModeId: string, prompt: string) => void;
  onBuyCredits?: () => void;
  onUpgrade?: () => void;
  /** Create page — canvas always visible */
  persistentPreview?: boolean;
  /** Open variant composer or Creative Score when canvas mounts */
  canvasInitialAction?: "variant" | "score" | null;
  /** Docked credit/action bar inside the stable studio window */
  stickyFooter?: ReactNode;
  className?: string;
};

export default function StudioWhiteToolFrame({
  previewState,
  isPreviewOpen = false,
  onPreviewClose,
  fallbackPreviewSrc,
  fallbackPreviewKind = "video",
  showIdleFallback = false,
  prompt,
  onPromptChange,
  onSubmit,
  pills = [],
  loading = false,
  disabled = false,
  showCommandBar = true,
  submitLabel,
  engineGrid,
  formatGrid,
  durationRow,
  steps,
  creditMeter,
  inlineError,
  promptPlacement = "bottom",
  layout = "default",
  greetingSlot,
  headerSlot,
  commandBox,
  actionCardsSlot,
  intentHintSlot,
  expansionSlot,
  showPreviewClosedHint = true,
  sourceStudio = "image",
  getToken,
  onCreditsUsed,
  canvasAsset,
  onCanvasAssetChange,
  variantNotice,
  onVariantNotice,
  modelModeId,
  creditsUsed,
  creditBalance,
  onRegenerateWithMode,
  onBuyCredits,
  onUpgrade,
  persistentPreview = false,
  canvasInitialAction = null,
  stickyFooter,
  className = "",
}: Props) {
  const { language } = useDashboardLanguage();
  const isDe = language === "de";
  const promptFirst = promptPlacement === "top";
  const guided = layout === "guided" && promptFirst;

  const previewError =
    previewState.status === "error" ? previewState.message : inlineError ?? null;

  const commandBar = showCommandBar && !commandBox ? (
    <CommandBar
      value={prompt ?? ""}
      onChange={onPromptChange ?? (() => {})}
      onSubmit={onSubmit ?? (() => {})}
      pills={pills}
      loading={loading}
      disabled={disabled}
      submitLabel={submitLabel}
      floating={!promptFirst}
    />
  ) : null;

  const closedHint =
    showPreviewClosedHint && !isPreviewOpen ? (
      <p className="mx-auto mt-6 max-w-md text-center text-xs text-neutral-500">
        {isDe ? CREATE_PAGE.canvasEmpty.de : CREATE_PAGE.canvasEmpty.en}
      </p>
    ) : null;

  const previewPanel = (
    <>
      <StudioExpandablePreview
        open={persistentPreview || isPreviewOpen}
        onClose={persistentPreview ? undefined : onPreviewClose}
        previewState={previewState}
        isDe={isDe}
        errorMessage={previewError}
        expansionSlot={expansionSlot}
        sourceStudio={sourceStudio}
        getToken={getToken}
        onCreditsUsed={onCreditsUsed}
        canvasAsset={canvasAsset}
        onCanvasAssetChange={onCanvasAssetChange}
        variantNotice={variantNotice}
        onVariantNotice={onVariantNotice}
        modelModeId={modelModeId}
        creditsUsed={creditsUsed}
        creditBalance={creditBalance}
        onRegenerateWithMode={onRegenerateWithMode}
        onBuyCredits={onBuyCredits}
        onUpgrade={onUpgrade}
        persistent={persistentPreview}
        canvasInitialAction={canvasInitialAction}
      />
      {!persistentPreview && !isPreviewOpen ? closedHint : null}
    </>
  );

  const isGenerating = previewState.status === "loading";

  const guidedContent = (
    <div className="flex flex-col items-center">
      {headerSlot ? (
        <section className="w-full text-center">{headerSlot}</section>
      ) : null}
      {greetingSlot ? (
        <section className="w-full text-center">{greetingSlot}</section>
      ) : null}

      {creditMeter ? <div className="mt-4 w-full">{creditMeter}</div> : null}

      {commandBox ? (
        <section
          id="create-prompt"
          aria-label={isDe ? "Prompt" : "Prompt"}
          className="mt-5 w-full scroll-mt-24"
        >
          {commandBox}
        </section>
      ) : showCommandBar ? (
        <section aria-label={isDe ? "Prompt" : "Prompt"} className="mt-5 w-full">
          {commandBar}
        </section>
      ) : null}

      {intentHintSlot ? <div className="w-full">{intentHintSlot}</div> : null}

      {actionCardsSlot ? (
        <section
          aria-label={isDe ? "Erstellungstyp" : "Creation type"}
          className="mt-6 w-full"
        >
          {actionCardsSlot}
        </section>
      ) : null}

      {engineGrid ? (
        <section aria-label={isDe ? "Modus" : "Mode"} className="mt-6 w-full">
          {engineGrid}
        </section>
      ) : null}

      {formatGrid ? (
        <section aria-label={isDe ? "Format" : "Format"} className="mt-6 w-full">
          {formatGrid}
        </section>
      ) : null}

      <div className="mt-6 w-full min-h-[4.75rem]">{durationRow}</div>
      {steps ? <div className="mt-6 w-full max-w-4xl space-y-4">{steps}</div> : null}

      <section className="w-full">{previewPanel}</section>
    </div>
  );

  if (guided) {
    return (
      <div className={className}>
        <StudioStableShell isGenerating={isGenerating} footer={stickyFooter}>
          {guidedContent}
        </StudioStableShell>
      </div>
    );
  }

  if (promptFirst) {
    return (
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-2 pb-10 sm:px-4">
        {creditMeter ? <div className="w-full">{creditMeter}</div> : null}

        {showCommandBar ? (
          <section aria-label={isDe ? "Prompt" : "Prompt"} className="mt-5 w-full">
            {commandBar}
          </section>
        ) : null}

        {engineGrid ? (
          <section aria-label={isDe ? "Engine" : "Engine"} className="mt-8 w-full">
            {engineGrid}
          </section>
        ) : null}

        {formatGrid ? (
          <section aria-label={isDe ? "Format" : "Format"} className="mt-6 w-full">
            {formatGrid}
          </section>
        ) : null}

        {durationRow ? <div className="mt-6 w-full">{durationRow}</div> : null}
        {steps ? <div className="mt-6 w-full max-w-4xl space-y-4">{steps}</div> : null}

        <section className="mt-6 w-full">{previewPanel}</section>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-5xl flex-col items-center px-2 pb-28 sm:px-4 sm:pb-10">
      {creditMeter ? <div className="mb-4 w-full">{creditMeter}</div> : null}

      {isPreviewOpen || showIdleFallback ? (
        <StudioExpandablePreview
          open={isPreviewOpen}
          onClose={onPreviewClose}
          previewState={previewState}
          isDe={isDe}
          errorMessage={previewError}
          expansionSlot={expansionSlot}
          sourceStudio={sourceStudio}
          getToken={getToken}
          onCreditsUsed={onCreditsUsed}
          canvasAsset={canvasAsset}
          onCanvasAssetChange={onCanvasAssetChange}
          variantNotice={variantNotice}
          onVariantNotice={onVariantNotice}
          modelModeId={modelModeId}
          creditsUsed={creditsUsed}
          creditBalance={creditBalance}
          onRegenerateWithMode={onRegenerateWithMode}
          onBuyCredits={onBuyCredits}
        />
      ) : (
        closedHint
      )}

      {engineGrid ? <div className="mt-4 w-full">{engineGrid}</div> : null}
      {formatGrid ? <div className="mt-4 w-full">{formatGrid}</div> : null}
      {durationRow ? <div className="mt-4 w-full">{durationRow}</div> : null}
      {steps ? <div className="mt-4 w-full max-w-4xl space-y-4">{steps}</div> : null}

      {showCommandBar ? (
        <div className="mt-auto w-full pt-6">
          {commandBar}
        </div>
      ) : null}
    </div>
  );
}
