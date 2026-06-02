"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import {
  Download,
  ImageIcon,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { PackAssemblyStepId } from "@/app/components/pack/pack-showcase-types";
import PackResultActions from "@/app/components/studio/PackResultActions";
import { getSocialAssetPackTotalCredits } from "@/app/lib/packs/social-asset-pack";
import {
  canStartPreview,
  canStartRender,
  isTerminalRenderState,
  resolvePreviewReadyState,
  resolveRenderOutcomeState,
  type SocialAssetPackPanelState,
} from "@/app/lib/packs/pack-panel-state-machine";
import type {
  SocialAssetPackPreviewResponse,
  SocialAssetPackRenderResponse,
} from "@/app/lib/packs/types";
import { sanitizeUserFacingApiError } from "@/lib/env/user-facing-errors";
import type {
  AgentPackGeneratorPanelHandle,
  PackOverlayControlState,
} from "@/lib/studio/pack-overlay-control";

export type { SocialAssetPackPanelState as AgentPackPanelState } from "@/app/lib/packs/pack-panel-state-machine";
export type {
  AgentPackGeneratorPanelHandle,
  PackOverlayControlState,
} from "@/lib/studio/pack-overlay-control";

type Language = "en" | "de";

type OutputTab = "hooks" | "captions";

type Props = {
  prompt: string;
  onPromptChange?: (value: string) => void;
  language?: Language;
  disabled?: boolean;
  creditBalance?: number;
  getAccessToken: () => Promise<string | null>;
  onUseImprovedPrompt?: (improved: string) => void;
  onInsufficientCredits?: () => void;
  onRenderComplete?: () => void;
  showHeader?: boolean;
  headerTitle?: string;
  onClose?: () => void;
  className?: string;
  controlSurface?: "inline" | "overlay";
  onPackControlStateChange?: (state: PackOverlayControlState) => void;
};

const COPY = {
  en: {
    headerTitle: "Social Asset Pack",
    agentLabel: "AI AGENT",
    placeholder: "Describe your idea for the pack…",
    previewCta: "Free preview",
    renderCta: (credits: number) => `Render pack · ${credits} credits`,
    previewing: "Previewing…",
    rendering: "Rendering pack…",
    checking: "Checking credits…",
    previewFailed: "Preview failed.",
    renderFailed: "Pack rendering failed.",
    signInAgain: "Please sign in again.",
    notEnoughCredits: "Not enough credits.",
    creditsCost: (cost: number) => `${cost} credits`,
    creditsAvailable: (balance: number) => `${balance} available`,
    hooks: "Hooks",
    captions: "Captions",
    hashtags: "Hashtags",
    outputEmpty: "Appears after render",
    statusReady: "READY TO GENERATE",
    statusGenerating: "GENERATING…",
    close: "Close ×",
    download: "Download",
    generatingImage: "Generating…",
  },
  de: {
    headerTitle: "Social Asset Pack",
    agentLabel: "AI AGENT",
    placeholder: "Beschreibe deine Idee für den Pack…",
    previewCta: "Vorschau kostenlos",
    renderCta: (credits: number) => `Pack rendern · ${credits} Credits`,
    previewing: "Vorschau…",
    rendering: "Pack wird gerendert…",
    checking: "Prüfe Credits…",
    previewFailed: "Vorschau fehlgeschlagen.",
    renderFailed: "Pack-Rendering fehlgeschlagen.",
    signInAgain: "Bitte erneut anmelden.",
    notEnoughCredits: "Nicht genug Credits.",
    creditsCost: (cost: number) => `${cost} Credits`,
    creditsAvailable: (balance: number) => `${balance} verfügbar`,
    hooks: "Hooks",
    captions: "Captions",
    hashtags: "Hashtags",
    outputEmpty: "Erscheinen nach dem Render",
    statusReady: "BEREIT ZUR GENERIERUNG",
    statusGenerating: "GENERIERT…",
    close: "Schließen ×",
    download: "Herunterladen",
    generatingImage: "Wird generiert…",
  },
} as const;

const TIMELINE_STEPS: {
  id: PackAssemblyStepId;
  labelEn: string;
  labelDe: string;
}[] = [
  { id: "idea", labelEn: "Idea", labelDe: "Idee" },
  { id: "prompt_assist", labelEn: "Prompt", labelDe: "Prompt" },
  { id: "images", labelEn: "Images", labelDe: "Bilder" },
  { id: "motion", labelEn: "Motion", labelDe: "Motion" },
  { id: "score", labelEn: "Score", labelDe: "Score" },
  { id: "export", labelEn: "Export", labelDe: "Export" },
];

type PackTimelineVisual = {
  completedThrough: number;
  activeIndex: number | null;
  busy: boolean;
};

function resolvePackTimelineVisual(
  panelState: SocialAssetPackPanelState,
  renderTimelineStep: number
): PackTimelineVisual {
  const total = TIMELINE_STEPS.length;

  if (isTerminalRenderState(panelState)) {
    return { completedThrough: total, activeIndex: null, busy: false };
  }

  if (panelState === "preview_loading") {
    return { completedThrough: 0, activeIndex: 0, busy: true };
  }

  if (
    panelState === "preview_ready" ||
    panelState === "insufficient_credits"
  ) {
    return { completedThrough: 2, activeIndex: null, busy: false };
  }

  if (panelState === "credit_checking") {
    return { completedThrough: 2, activeIndex: 2, busy: true };
  }

  if (panelState === "rendering") {
    const step = Math.min(Math.max(renderTimelineStep, 0), total - 1);
    return { completedThrough: step, activeIndex: step, busy: true };
  }

  return { completedThrough: 0, activeIndex: null, busy: false };
}

function PackStudioHeader({
  title,
  closeLabel,
  onClose,
}: {
  title: string;
  closeLabel: string;
  onClose?: () => void;
}) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
      <p className="text-sm font-semibold tracking-tight text-white">{title}</p>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-medium text-white/50 transition hover:text-white/80"
        >
          {closeLabel}
        </button>
      ) : null}
    </header>
  );
}

function PackAgentTimeline({
  language,
  completedThrough,
  activeIndex,
  busy,
}: {
  language: Language;
  completedThrough: number;
  activeIndex: number | null;
  busy: boolean;
}) {
  const isDe = language === "de";

  return (
    <ol className="flex w-full items-center">
      {TIMELINE_STEPS.map((step, index) => {
        const isDone = index < completedThrough;
        const isActive = busy && activeIndex === index;

        return (
          <li key={step.id} className="flex min-w-0 flex-1 items-center">
            {index > 0 ? (
              <div
                className="h-px min-w-[6px] flex-1 bg-gradient-to-r from-[#d8ad5f]/20 to-white/[0.06]"
                aria-hidden
              />
            ) : null}
            <div className="flex shrink-0 flex-col items-center gap-1.5 px-0.5">
              <motion.span
                layout
                initial={false}
                animate={{
                  scale: isActive ? 1.08 : 1,
                  opacity: isDone || isActive ? 1 : 0.5,
                }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold ${
                  isDone
                    ? "bg-[#d8ad5f] text-black"
                    : isActive
                      ? "animate-pulse border-2 border-[#d8ad5f] bg-transparent text-[#d8ad5f]"
                      : "border border-white/20 text-white/30"
                }`}
              >
                {isDone ? "✓" : index + 1}
              </motion.span>
              <span className="max-w-[3.25rem] truncate text-center text-[9px] font-medium text-white/40">
                {isDe ? step.labelDe : step.labelEn}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function PackImageSlot({
  url,
  alt,
  language,
  onDownload,
  isLoading = false,
  loadingLabel,
  className = "",
}: {
  url: string | null;
  alt: string;
  language: Language;
  onDownload?: () => void;
  isLoading?: boolean;
  loadingLabel?: string;
  className?: string;
}) {
  const t = COPY[language];
  const label = loadingLabel ?? t.generatingImage;

  if (isLoading && !url) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0A0A0A] ${className}`}
        aria-busy="true"
        aria-label={label}
      >
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-white/[0.03] via-white/[0.07] to-white/[0.03]" />
        <p className="absolute inset-0 flex items-center justify-center text-xs text-white/20">
          {label}
        </p>
      </div>
    );
  }

  if (!url) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-[#0A0A0A] ${className}`}
      >
        <ImageIcon className="h-8 w-8 text-white/10" aria-hidden />
      </div>
    );
  }

  return (
    <motion.div
      key={url}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-black/40 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        className="h-full w-full object-cover"
        loading="lazy"
      />
      {onDownload ? (
        <button
          type="button"
          onClick={onDownload}
          className="absolute right-2 top-2 flex min-h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-black/50 px-3 py-1.5 text-[10px] font-semibold text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100 group-focus-within:opacity-100"
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          {t.download}
        </button>
      ) : null}
    </motion.div>
  );
}

function OutputTabs({
  language,
  activeTab,
  onTabChange,
  hooks,
  captions,
  hashtags,
}: {
  language: Language;
  activeTab: OutputTab;
  onTabChange: (tab: OutputTab) => void;
  hooks: string[];
  captions: string[];
  hashtags: string[];
}) {
  const t = COPY[language];
  const hasContent =
    hooks.length > 0 || captions.length > 0 || hashtags.length > 0;

  return (
    <div className="flex min-h-0 flex-col rounded-2xl border border-white/[0.06] bg-[#0D0D0F]">
      <div className="flex border-b border-white/[0.06]">
        {(["hooks", "captions"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`flex-1 px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === tab
                ? "border-b-2 border-[#d8ad5f] text-[#efc777]"
                : "text-white/35 hover:text-white/55"
            }`}
          >
            {tab === "hooks" ? t.hooks : t.captions}
          </button>
        ))}
      </div>
      <div className="max-h-[140px] overflow-y-auto overscroll-contain px-4 py-3 text-xs leading-relaxed text-white/60 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {!hasContent ? (
          <p className="text-center text-white/20">{t.outputEmpty}</p>
        ) : activeTab === "hooks" ? (
          hooks.length > 0 ? (
            <ul className="space-y-1.5">
              {hooks.map((hook) => (
                <li key={hook}>{hook}</li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-white/20">{t.outputEmpty}</p>
          )
        ) : (
          <div className="space-y-2">
            {captions.length > 0 ? (
              <ul className="space-y-2">
                {captions.map((cap) => (
                  <li key={cap}>{cap}</li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-white/20">{t.outputEmpty}</p>
            )}
            {hashtags.length > 0 ? (
              <p className="border-t border-white/[0.06] pt-2 text-white/45">
                <span className="font-semibold text-white/55">{t.hashtags}: </span>
                {hashtags.join(" ")}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function FloatingOutputOrb() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute -right-24 top-1/4 h-[400px] w-[400px] rounded-full bg-[#d8ad5f]/[0.03] blur-[100px]"
      animate={{
        x: [0, 36, -28, 0],
        y: [0, -48, 32, 0],
      }}
      transition={{
        duration: 22,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

function GeneratingProgressBar({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <motion.div
      className="absolute inset-x-0 top-0 z-20 h-0.5 overflow-hidden bg-white/[0.04]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-[#d8ad5f] to-[#efc777]"
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{
          duration: 9,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />
    </motion.div>
  );
}

const AgentPackGeneratorPanel = forwardRef<AgentPackGeneratorPanelHandle, Props>(
  function AgentPackGeneratorPanel(
    {
      prompt,
      onPromptChange,
      language = "en",
      disabled = false,
      creditBalance,
      getAccessToken,
      onUseImprovedPrompt,
      onInsufficientCredits,
      onRenderComplete,
      showHeader,
      headerTitle,
      onClose,
      className = "",
      controlSurface = "inline",
      onPackControlStateChange,
    },
    ref
  ) {
    const lang: Language = language === "de" ? "de" : "en";
    const t = COPY[lang];
    const packCredits = getSocialAssetPackTotalCredits();

    const [panelState, setPanelState] =
      useState<SocialAssetPackPanelState>("idle");
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<SocialAssetPackPreviewResponse | null>(
      null
    );
    const [result, setResult] = useState<SocialAssetPackRenderResponse | null>(
      null
    );
    const [renderTimelineStep, setRenderTimelineStep] = useState(0);
    const [outputTab, setOutputTab] = useState<OutputTab>("hooks");
    const previewedPromptRef = useRef<string | null>(null);

    const trimmedPrompt = prompt.trim();
    const balance = creditBalance ?? 0;
    const isOverlay = controlSurface === "overlay";

    const shouldShowHeader =
      showHeader === true || (showHeader !== false && (onClose != null || isOverlay));

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
      if (panelState !== "rendering") {
        if (!isTerminalRenderState(panelState)) {
          setRenderTimelineStep(0);
        }
        return;
      }

      setRenderTimelineStep(0);
      const stepTimers = [
        window.setTimeout(() => setRenderTimelineStep(1), 1000),
        window.setTimeout(() => setRenderTimelineStep(2), 1100),
        window.setTimeout(() => setRenderTimelineStep(3), 14_000),
        window.setTimeout(() => setRenderTimelineStep(4), 28_000),
      ];

      return () => {
        stepTimers.forEach(window.clearTimeout);
      };
    }, [panelState]);

    useEffect(() => {
      if (isTerminalRenderState(panelState)) {
        setRenderTimelineStep(TIMELINE_STEPS.length - 1);
      }
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
    }, [canPreview, canRender, panelState, packBusy, onPackControlStateChange]);

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
            sanitizeUserFacingApiError(data.error, t.previewFailed, lang)
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
        setError(t.previewFailed);
        setPreview(null);
        setPanelState("idle");
      }
    }, [
      canPreview,
      trimmedPrompt,
      lang,
      t.previewFailed,
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
          setError(t.signInAgain);
          setPanelState(resolvePreviewReadyState(creditBalance, packCredits));
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

        if (res.status === 401 || data.code === "UNAUTHENTICATED") {
          setError(t.signInAgain);
          setPanelState(resolvePreviewReadyState(creditBalance, packCredits));
          return;
        }

        if (data.code === "INSUFFICIENT_CREDITS" || res.status === 402) {
          onInsufficientCredits?.();
          setError(t.notEnoughCredits);
          setPanelState("insufficient_credits");
          return;
        }

        if (!res.ok && !data.packJobId) {
          setError(
            sanitizeUserFacingApiError(
              data.error,
              t.renderFailed,
              lang
            ) ?? t.renderFailed
          );
          setPanelState(resolvePreviewReadyState(creditBalance, packCredits));
          return;
        }

        if (!data.packJobId) {
          setError(data.error ?? data.message ?? t.renderFailed);
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
        setError(t.renderFailed);
        setPanelState(resolvePreviewReadyState(creditBalance, packCredits));
      }
    }, [
      preview,
      panelState,
      creditBalance,
      packCredits,
      t,
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

    const resetPackState = useCallback(() => {
      setResult(null);
      setPreview(null);
      setError(null);
      previewedPromptRef.current = null;
      setPanelState("idle");
    }, []);

    const imageUrls = result?.assets.images.map((img) => img.assetUrl) ?? [];
    const hooks = result?.hooks ?? preview?.hooks ?? [];
    const captions = result?.captions ?? preview?.captions ?? [];
    const hashtags = result?.hashtags ?? preview?.hashtags ?? [];

    const timelineVisual = resolvePackTimelineVisual(
      panelState,
      renderTimelineStep
    );
    const previewLoading = panelState === "preview_loading";
    const renderLoading =
      panelState === "rendering" || panelState === "credit_checking";
    const isGenerating = previewLoading || renderLoading;
    const imagesLoading = renderLoading;

    const primaryDownloadUrl =
      result?.assets.images[0]?.assetUrl ??
      result?.assets.videos[0]?.assetUrl ??
      null;

    const displayTitle = headerTitle ?? t.headerTitle;
    const rootHeightClass = isOverlay
      ? "h-[100dvh]"
      : "min-h-[min(100dvh,920px)]";

    return (
      <section
        id="social-asset-pack-panel"
        className={`flex min-h-0 flex-col overflow-hidden bg-[#080808] ${rootHeightClass} ${className}`}
        data-panel-state={panelState}
      >
        {shouldShowHeader ? (
          <PackStudioHeader
            title={displayTitle}
            closeLabel={t.close}
            onClose={onClose}
          />
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
          {/* Left — Agent Input */}
          <div className="flex w-full shrink-0 flex-col overflow-hidden p-5 md:w-[38%] md:border-r md:border-white/[0.05]">
            <div className="mb-3 flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#d8ad5f]"
                aria-hidden
              />
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#d8ad5f]">
                {t.agentLabel}
              </span>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => onPromptChange?.(e.target.value)}
              disabled={disabled || packBusy}
              placeholder={t.placeholder}
              className="min-h-[160px] w-full resize-none rounded-2xl border border-white/[0.08] bg-[#0D0D0F] p-5 text-sm leading-relaxed text-white placeholder:text-white/20 focus:border-[#d8ad5f]/40 focus:outline-none disabled:opacity-50"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#d8ad5f]/20 bg-[#d8ad5f]/10 px-3 py-1 text-xs font-semibold text-[#d8ad5f]">
                {t.creditsCost(packCredits)}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/50">
                {t.creditsAvailable(balance)}
              </span>
            </div>

            <div className="mt-6 shrink-0">
              <PackAgentTimeline
                language={lang}
                completedThrough={timelineVisual.completedThrough}
                activeIndex={timelineVisual.activeIndex}
                busy={timelineVisual.busy}
              />
            </div>

            {error ? (
              <p className="mt-4 shrink-0 text-xs text-red-400" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-auto flex shrink-0 flex-col gap-2.5 pt-6 sm:flex-row">
              <button
                type="button"
                onClick={() => void runPreview()}
                disabled={!canPreview || previewLoading}
                className="min-h-12 flex-1 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {previewLoading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    {t.previewing}
                  </span>
                ) : (
                  t.previewCta
                )}
              </button>
              <button
                type="button"
                onClick={() => void runRender()}
                disabled={!canRender || renderLoading}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#d8ad5f] px-6 py-3 text-sm font-bold text-black transition hover:bg-[#efc777] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {renderLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    {panelState === "rendering" ? t.rendering : t.checking}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
                    {t.renderCta(packCredits)}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right — Agent Output */}
          <div className="relative flex min-h-[60vw] min-w-0 flex-1 flex-col overflow-hidden bg-[#0D0D0F] md:min-h-0 md:w-[62%] md:border-l md:border-white/[0.05]">
            <FloatingOutputOrb />
            <GeneratingProgressBar active={isGenerating} />

            <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden p-5">
              <p
                className={`shrink-0 text-xs tracking-widest ${
                  isGenerating
                    ? "animate-pulse text-[#efc777]"
                    : "text-white/30"
                }`}
              >
                {isGenerating ? t.statusGenerating : t.statusReady}
              </p>

              <div className="mt-4 grid min-h-0 shrink-0 grid-cols-2 gap-3">
                <PackImageSlot
                  url={imageUrls[0] ?? null}
                  alt={lang === "de" ? "Pack Bild 1" : "Pack image 1"}
                  language={lang}
                  isLoading={imagesLoading}
                  className="col-span-2 min-h-[180px] md:min-h-[220px]"
                  onDownload={
                    imageUrls[0]
                      ? () =>
                          window.open(imageUrls[0], "_blank", "noopener,noreferrer")
                      : undefined
                  }
                />
                <PackImageSlot
                  url={imageUrls[1] ?? null}
                  alt={lang === "de" ? "Pack Bild 2" : "Pack image 2"}
                  language={lang}
                  isLoading={imagesLoading}
                  className="min-h-[100px] md:min-h-[120px]"
                  onDownload={
                    imageUrls[1]
                      ? () =>
                          window.open(imageUrls[1], "_blank", "noopener,noreferrer")
                      : undefined
                  }
                />
                <PackImageSlot
                  url={imageUrls[2] ?? null}
                  alt={lang === "de" ? "Pack Bild 3" : "Pack image 3"}
                  language={lang}
                  isLoading={imagesLoading}
                  className="min-h-[100px] md:min-h-[120px]"
                  onDownload={
                    imageUrls[2]
                      ? () =>
                          window.open(imageUrls[2], "_blank", "noopener,noreferrer")
                      : undefined
                  }
                />
              </div>

              <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
                <OutputTabs
                  language={lang}
                  activeTab={outputTab}
                  onTabChange={setOutputTab}
                  hooks={hooks}
                  captions={captions}
                  hashtags={hashtags}
                />

                {result && isTerminalRenderState(panelState) ? (
                  <PackResultActions
                    language={lang}
                    downloadUrl={primaryDownloadUrl}
                    hooks={hooks}
                    onCreateVariation={() => {
                      setResult(null);
                      setError(null);
                      void runRender();
                    }}
                    onNewPack={resetPackState}
                    className="shrink-0"
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
);

export default AgentPackGeneratorPanel;
