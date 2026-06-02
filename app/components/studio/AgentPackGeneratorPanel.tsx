"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { Loader2, Package, Sparkles } from "lucide-react";
import SocialAssetPackShowcase from "@/app/components/pack/SocialAssetPackShowcase";
import AgentWorkflowPanel from "@/app/components/studio/AgentWorkflowPanel";
import type { PackAssemblyStepId } from "@/app/components/pack/pack-showcase-types";
import PackGalleryGroup from "@/app/components/gallery/PackGalleryGroup";
import CreditCostPreview from "@/app/components/billing/CreditCostPreview";
import PackResultActions from "@/app/components/studio/PackResultActions";
import {
  formatPackRenderCta,
  getSocialAssetPackBuyCreditsLabel,
  getSocialAssetPackCopy,
  getSocialAssetPackTotalCredits,
} from "@/app/lib/packs/social-asset-pack";
import {
  canStartPreview,
  canStartRender,
  isTerminalRenderState,
  PACK_PANEL_STATE_COPY,
  resolvePreviewReadyState,
  resolveRenderOutcomeState,
  type SocialAssetPackPanelState,
} from "@/app/lib/packs/pack-panel-state-machine";
import type {
  SocialAssetPackPreviewResponse,
  SocialAssetPackRenderResponse,
} from "@/app/lib/packs/types";
import { sanitizeUserFacingApiError } from "@/lib/env/user-facing-errors";
import { CREDITS_PAGE } from "@/lib/copy/launch-user-copy";
import { ParallaxDepthLayers } from "@/app/components/motion/ParallaxDepthBackdrop";
import { useSubtleParallax } from "@/lib/motion/use-subtle-parallax";
import { useAgentVisualEffectsEnabled } from "@/lib/studio/agent-visual-effects-context";
import { obsidianButtonClass } from "@/lib/obsidian/button-tokens";
import {
  AGENT_STUDIO_SCROLL_CLASS,
  AGENT_STUDIO_WINDOW_CLASS,
  PACK_STATUS_BANNER_SLOT_CLASS,
} from "@/lib/studio/stable-panel-layout";
import type {
  AgentPackGeneratorPanelHandle,
  PackOverlayControlState,
} from "@/lib/studio/pack-overlay-control";

export type { SocialAssetPackPanelState as AgentPackPanelState } from "@/app/lib/packs/pack-panel-state-machine";
export type {
  AgentPackGeneratorPanelHandle,
  PackOverlayControlState,
} from "@/lib/studio/pack-overlay-control";

type Props = {
  prompt: string;
  language?: "en" | "de";
  disabled?: boolean;
  creditBalance?: number;
  getAccessToken: () => Promise<string | null>;
  onUseImprovedPrompt?: (improved: string) => void;
  onInsufficientCredits?: () => void;
  onRenderComplete?: () => void;
  showHeader?: boolean;
  className?: string;
  /** Overlay footer owns preview/render CTAs — hide duplicate buttons in panel. */
  controlSurface?: "inline" | "overlay";
  onPackControlStateChange?: (state: PackOverlayControlState) => void;
};

const AGENT_COPY = {
  en: {
    title: "Social Asset Pack Agent",
    subtitle:
      "InfluExAI assembles images, motion, hooks, captions, hashtags and export formats from one idea.",
    previewCta: "Preview Pack",
    estimatedCost: "Estimated render cost",
    renderingLabel: "Rendering pack…",
    previewFailed: "Preview failed.",
    renderFailed: "Pack rendering failed.",
    signInAgain: "Please sign in again.",
    notEnoughCredits: "Not enough credits.",
    openGallery: "Open Creator Gallery",
    previewAgain: "Preview another pack",
  },
  de: {
    title: "Social Asset Pack Agent",
    subtitle:
      "InfluExAI stellt aus einer Idee Bilder, Motion, Hooks, Captions, Hashtags und Export-Formate zusammen.",
    previewCta: "Pack-Vorschau",
    estimatedCost: "Geschätzte Render-Kosten",
    renderingLabel: "Pack wird gerendert…",
    previewFailed: "Vorschau fehlgeschlagen.",
    renderFailed: "Pack-Rendering fehlgeschlagen.",
    signInAgain: "Bitte erneut anmelden.",
    notEnoughCredits: "Nicht genug Credits.",
    openGallery: "Creator Gallery öffnen",
    previewAgain: "Weiteres Pack previewen",
  },
} as const;

const RENDER_ASSEMBLY_STEPS: PackAssemblyStepId[] = [
  "idea",
  "prompt_assist",
  "images",
  "motion",
  "copy",
  "score",
  "export",
];

function PackStateBanner({
  state,
  language,
  message,
}: {
  state: SocialAssetPackPanelState;
  language: "en" | "de";
  message?: string;
}) {
  const stateCopy = PACK_PANEL_STATE_COPY[language];

  const banner = (() => {
    switch (state) {
      case "preview_loading":
        return {
          tone: "neutral" as const,
          text: stateCopy.previewLoading,
          spin: true,
        };
      case "credit_checking":
        return {
          tone: "amber" as const,
          text: stateCopy.creditChecking,
          spin: true,
        };
      case "rendering":
        return {
          tone: "amber" as const,
          text: stateCopy.rendering,
          spin: true,
        };
      case "partial_success":
        return {
          tone: "amber" as const,
          text: message ?? stateCopy.partialSuccess,
          spin: false,
        };
      case "completed":
        return {
          tone: "success" as const,
          text: message ?? stateCopy.completed,
          spin: false,
        };
      case "failed_refunded":
        return {
          tone: "calm" as const,
          text: message ?? stateCopy.failedRefunded,
          spin: false,
        };
      default:
        return null;
    }
  })();

  if (!banner) return null;

  const toneClass =
    banner.tone === "success"
      ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-200"
      : banner.tone === "amber"
        ? "border-amber-500/25 bg-amber-500/5 text-amber-200"
        : banner.tone === "calm"
          ? "border-neutral-700/80 bg-neutral-950/50 text-neutral-300"
          : "border-neutral-800/80 bg-neutral-950/40 text-neutral-400";

  return (
    <div
      className={`flex w-full items-center gap-2 rounded-xl border px-4 py-2.5 text-xs ${toneClass}`}
      role="status"
      aria-live="polite"
    >
      {banner.spin ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-amber-400" aria-hidden />
      ) : null}
      <span>{banner.text}</span>
    </div>
  );
}

const AgentPackGeneratorPanel = forwardRef<
  AgentPackGeneratorPanelHandle,
  Props
>(function AgentPackGeneratorPanel(
  {
    prompt,
    language = "en",
    disabled = false,
    creditBalance,
    getAccessToken,
    onUseImprovedPrompt,
    onInsufficientCredits,
    onRenderComplete,
    showHeader = true,
    className = "",
    controlSurface = "inline",
    onPackControlStateChange,
  },
  ref
) {
  const lang = language === "de" ? "de" : "en";
  const copy = AGENT_COPY[lang];
  const packCopy = getSocialAssetPackCopy(lang);
  const packCredits = getSocialAssetPackTotalCredits();
  const renderCtaLabel = formatPackRenderCta(packCredits, lang);
  const buyCreditsLabel = getSocialAssetPackBuyCreditsLabel(lang);

  const [panelState, setPanelState] = useState<SocialAssetPackPanelState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<SocialAssetPackPreviewResponse | null>(null);
  const [result, setResult] = useState<SocialAssetPackRenderResponse | null>(null);
  const [assemblyStep, setAssemblyStep] = useState<PackAssemblyStepId>("idea");
  const [assemblyProgress, setAssemblyProgress] = useState(0);
  const previewedPromptRef = useRef<string | null>(null);
  const agentEffects =
    useAgentVisualEffectsEnabled() && controlSurface !== "overlay";
  const { containerRef, getLayerStyle, enabled } = useSubtleParallax<HTMLElement>({
    maxPx: 8,
    disabled: !agentEffects,
  });

  const trimmedPrompt = prompt.trim();

  useEffect(() => {
    if (
      preview &&
      previewedPromptRef.current &&
      trimmedPrompt !== previewedPromptRef.current &&
      !isTerminalRenderState(panelState)
    ) {
      setPreview(null);
      setResult(null);
      setError(null);
      previewedPromptRef.current = null;
      setPanelState("idle");
    }
  }, [trimmedPrompt, preview, panelState]);

  useEffect(() => {
    if (
      preview &&
      (panelState === "preview_ready" || panelState === "insufficient_credits")
    ) {
      setPanelState(resolvePreviewReadyState(creditBalance, packCredits));
    }
  }, [creditBalance, packCredits, preview, panelState]);

  useEffect(() => {
    if (panelState !== "rendering") return;

    setAssemblyStep("idea");
    setAssemblyProgress(8);

    const stepTimers = RENDER_ASSEMBLY_STEPS.map((step, index) =>
      window.setTimeout(() => {
        setAssemblyStep(step);
        setAssemblyProgress(Math.min(92, 12 + index * 13));
      }, 400 + index * 850)
    );

    return () => {
      stepTimers.forEach(window.clearTimeout);
    };
  }, [panelState]);

  const canPreview =
    trimmedPrompt.length >= 3 &&
    !disabled &&
    canStartPreview(panelState) &&
    panelState !== "preview_loading" &&
    panelState !== "credit_checking" &&
    panelState !== "rendering";

  const canRender =
    canStartRender(panelState) &&
    trimmedPrompt.length >= 3 &&
    !disabled &&
    typeof creditBalance === "number" &&
    creditBalance >= packCredits;

  const packBusy =
    panelState === "preview_loading" ||
    panelState === "credit_checking" ||
    panelState === "rendering";

  useEffect(() => {
    onPackControlStateChange?.({
      canPreview,
      canRender,
      panelState,
      busy: packBusy,
    });
  }, [
    canPreview,
    canRender,
    panelState,
    packBusy,
    onPackControlStateChange,
  ]);

  const runPreview = useCallback(async () => {
    if (!canPreview) return;

    setPanelState("preview_loading");
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/packs/social-asset-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmedPrompt, language: lang }),
      });
      const data = (await res.json()) as SocialAssetPackPreviewResponse & {
        error?: string;
      };

      if (!res.ok || data.error) {
        setError(
          sanitizeUserFacingApiError(data.error, copy.previewFailed, lang)
        );
        setPreview(null);
        setPanelState("idle");
        return;
      }

      setPreview(data);
      previewedPromptRef.current = trimmedPrompt;
      onUseImprovedPrompt?.(data.improvedPrompt);
      setPanelState(resolvePreviewReadyState(creditBalance, packCredits));
    } catch {
      setError(copy.previewFailed);
      setPreview(null);
      setPanelState("idle");
    }
  }, [
    canPreview,
    trimmedPrompt,
    lang,
    copy.previewFailed,
    creditBalance,
    packCredits,
    onUseImprovedPrompt,
  ]);

  const runRender = useCallback(async () => {
    if (!preview) return;

    if (panelState === "insufficient_credits") {
      onInsufficientCredits?.();
      return;
    }

    if (!canStartRender(panelState)) return;

    if (typeof creditBalance !== "number" || creditBalance < packCredits) {
      setPanelState("insufficient_credits");
      onInsufficientCredits?.();
      return;
    }

    setPanelState("credit_checking");
    setError(null);
    setResult(null);

    try {
      const token = await getAccessToken();
      if (!token) {
        setError(copy.signInAgain);
        setPanelState(resolvePreviewReadyState(creditBalance, packCredits));
        return;
      }

      if (typeof creditBalance !== "number" || creditBalance < packCredits) {
        setPanelState("insufficient_credits");
        onInsufficientCredits?.();
        return;
      }

      setPanelState("rendering");

      const res = await fetch("/api/packs/social-asset-render", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: trimmedPrompt,
          language: lang,
          improvedPrompt: preview.improvedPrompt?.trim() || undefined,
        }),
      });

      const data = (await res.json()) as SocialAssetPackRenderResponse & {
        error?: string;
        code?: string;
      };

      if (data.code === "INSUFFICIENT_CREDITS" || res.status === 402) {
        onInsufficientCredits?.();
        setError(copy.notEnoughCredits);
        setPanelState("insufficient_credits");
        return;
      }

      if (!data.packJobId) {
        setError(data.error ?? data.message ?? copy.renderFailed);
        setPanelState(
          data.creditsRefunded && data.creditsRefunded > 0
            ? "failed_refunded"
            : resolvePreviewReadyState(creditBalance, packCredits)
        );
        return;
      }

      setResult(data);
      setPanelState(resolveRenderOutcomeState(data));
      onRenderComplete?.();
    } catch {
      setError(copy.renderFailed);
      setPanelState(resolvePreviewReadyState(creditBalance, packCredits));
    }
  }, [
    preview,
    panelState,
    creditBalance,
    packCredits,
    copy,
    getAccessToken,
    lang,
    onInsufficientCredits,
    onRenderComplete,
    trimmedPrompt,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      runPreview: () => {
        void runPreview();
      },
      runRender: () => {
        void runRender();
      },
    }),
    [runPreview, runRender]
  );

  const showPreviewPlan =
    preview &&
    (panelState === "preview_ready" ||
      panelState === "insufficient_credits" ||
      panelState === "credit_checking");

  const workflowMode =
    panelState === "preview_loading"
      ? ("planning" as const)
      : panelState === "rendering"
        ? ("rendering" as const)
        : isTerminalRenderState(panelState)
          ? ("complete" as const)
          : preview
            ? ("preview" as const)
            : ("idle" as const);

  const showcaseMode = showPreviewPlan
    ? ("preview" as const)
    : panelState === "rendering"
      ? ("rendering" as const)
      : result && isTerminalRenderState(panelState)
        ? ("result" as const)
        : null;

  const idleWindowCopy =
    controlSurface === "overlay"
      ? null
      : lang === "de"
        ? "Pack-Vorschau starten, um die Zusammenstellung im Fenster zu sehen."
        : "Run a pack preview to see assembly inside the window.";

  const studioWindowClass =
    controlSurface === "overlay"
      ? "mt-0 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border-0 bg-transparent"
      : AGENT_STUDIO_WINDOW_CLASS;

  const previewLoading = panelState === "preview_loading";
  const renderLoading =
    panelState === "rendering" || panelState === "credit_checking";

  const previewButton = (
    <button
      type="button"
      onClick={() => void runPreview()}
      disabled={!canPreview || previewLoading}
      className={`${obsidianButtonClass("secondary", { size: "sm" })} min-h-11 gap-2 border-[#8B5CF6]/35 bg-[#8B5CF6]/10 text-[#C4B5FD] hover:border-[#8B5CF6]/45 hover:bg-[#8B5CF6]/20 hover:text-[#DDD6FE] ${
        previewLoading ? "cursor-not-allowed opacity-60" : ""
      }`}
    >
      {previewLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {lang === "de" ? "Vorschau…" : "Previewing…"}
        </span>
      ) : (
        <>
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          {isTerminalRenderState(panelState) ? copy.previewAgain : copy.previewCta}
        </>
      )}
    </button>
  );

  const renderButton = (
    <button
      type="button"
      onClick={() => void runRender()}
      disabled={!canRender || renderLoading}
      title={
        panelState === "insufficient_credits"
          ? lang === "de"
            ? "Nicht genug Credits"
            : "Not enough credits"
          : !preview
            ? lang === "de"
              ? "Zuerst kostenlose Pack-Vorschau anzeigen"
              : "Run the free pack preview first"
            : undefined
      }
      className={`${obsidianButtonClass("primary", { size: "sm" })} min-h-11 gap-2 ${
        renderLoading ? "cursor-not-allowed opacity-60" : ""
      }`}
    >
      {renderLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {panelState === "rendering"
            ? copy.renderingLabel
            : lang === "de"
              ? "Prüfe Credits…"
              : "Checking credits…"}
        </span>
      ) : (
        <>
          <Package className="h-3.5 w-3.5" aria-hidden />
          {renderCtaLabel}
        </>
      )}
    </button>
  );

  const resetPackState = useCallback(() => {
    setResult(null);
    setPreview(null);
    setError(null);
    previewedPromptRef.current = null;
    setPanelState("idle");
  }, []);

  const primaryResultDownloadUrl =
    result?.assets.images[0]?.assetUrl ??
    result?.assets.videos[0]?.assetUrl ??
    null;

  return (
    <section
      ref={containerRef}
      id="social-asset-pack-panel"
      className={`relative isolate min-w-0 overflow-x-hidden rounded-2xl border border-white/[0.08] bg-[#111827]/50 p-4 sm:p-5 ${
        controlSurface === "overlay" ? "flex h-full min-h-0 flex-col" : ""
      } ${className}`}
      aria-labelledby={showHeader ? "agent-pack-title" : undefined}
      data-panel-state={panelState}
    >
      {agentEffects ? (
        <ParallaxDepthLayers
          variant="agent-panel"
          getLayerStyle={getLayerStyle}
          enabled={enabled}
        />
      ) : null}
      <div
        className={
          controlSurface === "overlay"
            ? "relative z-[1] flex min-h-0 flex-1 flex-col"
            : "relative z-[1]"
        }
      >
      {showHeader ? (
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-400">
            <Package className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                id="agent-pack-title"
                className="text-sm font-semibold text-[#F9FAFB]"
              >
                {copy.title}
              </h3>
              <span className="rounded-full border border-neutral-600/40 bg-neutral-800/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-neutral-300">
                {lang === "de" ? "Kostenlose Vorschau" : "Free preview"}
              </span>
              <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                {packCredits.toLocaleString(lang === "de" ? "de-DE" : "en-US")}{" "}
                {lang === "de" ? "Credits" : "Credits"}
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-[#9CA3AF]">
              {copy.subtitle}
            </p>
          </div>
        </div>
      ) : controlSurface !== "overlay" ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#0E1220]/50 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[#F9FAFB]">{copy.title}</p>
            <span className="rounded-full border border-neutral-600/40 bg-neutral-800/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-neutral-300">
              {lang === "de" ? "Kostenlose Vorschau" : "Free preview"}
            </span>
            <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
              {packCredits.toLocaleString(lang === "de" ? "de-DE" : "en-US")}{" "}
              {lang === "de" ? "Credits" : "Credits"}
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-[#9CA3AF]">{copy.subtitle}</p>
        </div>
      ) : null}

      {controlSurface !== "overlay" ? (
        <div className="mt-3 space-y-1 text-[11px] leading-relaxed text-neutral-500">
          <p>{packCopy.previewFreeNote}</p>
          <p>{packCopy.costNote}</p>
          <p>{packCopy.partialRefundNote}</p>
        </div>
      ) : null}

      {controlSurface === "inline" &&
      preview &&
      (panelState === "preview_ready" ||
        panelState === "insufficient_credits") ? (
        <div className="mt-4">
          <CreditCostPreview
            creditCost={preview.estimatedCredits ?? packCredits}
            balance={creditBalance ?? 0}
            language={lang}
            showSummaryLine
            showPolicyNote={false}
            onBuyCredits={() => onInsufficientCredits?.()}
            onUpgrade={() => onInsufficientCredits?.()}
          />
        </div>
      ) : null}

      {controlSurface === "inline" ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(panelState === "idle" ||
            panelState === "preview_loading" ||
            isTerminalRenderState(panelState)) && (
            previewButton
          )}
          {(panelState === "preview_ready" ||
            panelState === "insufficient_credits") && (
            <>
              {previewButton}
              {renderButton}
            </>
          )}
        </div>
      ) : null}

      {panelState === "insufficient_credits" ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p className="text-xs font-medium text-amber-400/90" role="status">
            {PACK_PANEL_STATE_COPY[lang].insufficientCredits}{" "}
            {lang === "de"
              ? `(${renderCtaLabel} erfordert ${packCredits.toLocaleString("de-DE")} Credits.)`
              : `(${renderCtaLabel} requires ${packCredits.toLocaleString("en-US")} credits.)`}
          </p>
          <Link
            href="/dashboard/credits"
            onClick={() => onInsufficientCredits?.()}
            className={obsidianButtonClass("primary", { size: "sm" })}
          >
            {buyCreditsLabel}
          </Link>
        </div>
      ) : null}

      {error && panelState !== "failed_refunded" ? (
        <p className="mt-3 text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <div className={studioWindowClass} aria-label={copy.title}>
        <div className="shrink-0 border-b border-white/[0.06]">
          <AgentWorkflowPanel
            language={lang}
            mode={workflowMode}
            activeStep={panelState === "rendering" ? assemblyStep : undefined}
            progress={panelState === "rendering" ? assemblyProgress : undefined}
            progressLabel={
              panelState === "preview_loading"
                ? PACK_PANEL_STATE_COPY[lang].previewLoading
                : panelState === "rendering"
                  ? copy.renderingLabel
                  : undefined
            }
            showHeader={false}
            className="rounded-none border-0 bg-transparent"
          />
        </div>

        <div className={PACK_STATUS_BANNER_SLOT_CLASS}>
          <PackStateBanner
            state={panelState}
            language={lang}
            message={result?.message}
          />
        </div>

        <div className={AGENT_STUDIO_SCROLL_CLASS}>
          {showPreviewPlan && preview ? (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-800/80 bg-neutral-950/40 px-3 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                {copy.estimatedCost}
              </span>
              <span className="text-sm font-bold text-amber-400">
                {preview.estimatedCredits.toLocaleString(lang === "de" ? "de-DE" : "en-US")}{" "}
                {lang === "de" ? "Credits" : "Credits"}
              </span>
            </div>
          ) : null}

          {showcaseMode === "preview" && preview ? (
            <SocialAssetPackShowcase
              mode="preview"
              language={lang}
              preview={preview}
              prompt={trimmedPrompt}
              hideWorkflow
            />
          ) : showcaseMode === "rendering" ? (
            <SocialAssetPackShowcase
              mode="rendering"
              language={lang}
              prompt={trimmedPrompt}
              improvedPrompt={preview?.improvedPrompt}
              activeStep={assemblyStep}
              assemblyProgress={assemblyProgress}
              hideWorkflow
            />
          ) : showcaseMode === "result" && result ? (
            <div className="space-y-4">
              <SocialAssetPackShowcase
                mode="result"
                language={lang}
                result={result}
                hideWorkflow
              />

              {result.creditsRefunded > 0 ? (
                <p className="text-xs text-neutral-400">
                  {lang === "de" ? "Erstattet" : "Refunded"}: {result.creditsRefunded}{" "}
                  {lang === "de" ? "Credits" : "credits"}
                </p>
              ) : null}

              {(panelState === "completed" || panelState === "partial_success") &&
              result.assets.images.length + result.assets.videos.length > 0 ? (
                <PackGalleryGroup
                  packJobId={result.packJobId}
                  packName={result.packName}
                  images={result.assets.images}
                  videos={result.assets.videos}
                  hooks={result.hooks}
                  captions={result.captions}
                  hashtags={result.hashtags}
                  formatSuggestions={result.formatSuggestions}
                  language={lang}
                />
              ) : null}

              <PackResultActions
                language={lang}
                downloadUrl={primaryResultDownloadUrl}
                hooks={result.hooks}
                onCreateVariation={() => {
                  setResult(null);
                  setError(null);
                  void runRender();
                }}
                onNewPack={resetPackState}
              />

              <div className="flex justify-center">
                <Link
                  href="/dashboard/gallery"
                  className={`${obsidianButtonClass("ghost", { size: "sm" })} min-h-11`}
                >
                  {copy.openGallery}
                </Link>
              </div>

              <p className="text-center text-[11px] text-neutral-500">
                {CREDITS_PAGE.footerNote[lang]}
              </p>
            </div>
          ) : panelState === "preview_loading" ? (
            <div
              className="flex h-full min-h-[12rem] flex-col items-center justify-center gap-2 px-4 text-center"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="h-6 w-6 animate-spin text-amber-400" aria-hidden />
              <p className="max-w-xs text-xs leading-relaxed text-neutral-500">
                {PACK_PANEL_STATE_COPY[lang].previewLoading}
              </p>
            </div>
          ) : idleWindowCopy ? (
            <div className="flex h-full min-h-[12rem] items-center justify-center px-4 text-center">
              <p className="max-w-xs text-xs leading-relaxed text-neutral-500">
                {idleWindowCopy}
              </p>
            </div>
          ) : (
            <div className="flex h-full min-h-[12rem] items-center justify-center px-4 text-center">
              <p className="max-w-xs text-xs leading-relaxed text-neutral-500">
                {lang === "de"
                  ? "Pack-Vorschau und Render findest du in der Leiste unten."
                  : "Use the bar below for free pack preview and render."}
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </section>
  );
});

export default AgentPackGeneratorPanel;
