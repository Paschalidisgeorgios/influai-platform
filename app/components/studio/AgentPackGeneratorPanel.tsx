"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ChevronDown,
  Download,
  ImageIcon,
  Loader2,
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
  className?: string;
  controlSurface?: "inline" | "overlay";
  onPackControlStateChange?: (state: PackOverlayControlState) => void;
};

const COPY = {
  en: {
    placeholder: "Describe your idea…",
    previewCta: "Preview",
    renderCta: (credits: number) => `Render · ${credits} credits`,
    previewing: "Previewing…",
    rendering: "Rendering pack…",
    checking: "Checking credits…",
    previewFailed: "Preview failed.",
    renderFailed: "Pack rendering failed.",
    signInAgain: "Please sign in again.",
    notEnoughCredits: "Not enough credits.",
    creditsBadge: (cost: number, balance: number) =>
      `${cost} credits · ${balance} available`,
    hooks: "Hooks",
    captions: "Captions",
    hashtags: "Hashtags",
    emptyImages: "Images appear after preview or render",
    download: "Download",
  },
  de: {
    placeholder: "Beschreibe deine Idee…",
    previewCta: "Vorschau",
    renderCta: (credits: number) => `Rendern · ${credits} Credits`,
    previewing: "Vorschau…",
    rendering: "Pack wird gerendert…",
    checking: "Prüfe Credits…",
    previewFailed: "Vorschau fehlgeschlagen.",
    renderFailed: "Pack-Rendering fehlgeschlagen.",
    signInAgain: "Bitte erneut anmelden.",
    notEnoughCredits: "Nicht genug Credits.",
    creditsBadge: (cost: number, balance: number) =>
      `${cost} Credits · ${balance} verfügbar`,
    hooks: "Hooks",
    captions: "Captions",
    hashtags: "Hashtags",
    emptyImages: "Bilder erscheinen nach Vorschau oder Render",
    download: "Herunterladen",
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

const RENDER_ASSEMBLY_STEPS: PackAssemblyStepId[] = [
  "idea",
  "prompt_assist",
  "images",
  "motion",
  "score",
  "export",
];

function timelineActiveIndex(
  panelState: SocialAssetPackPanelState,
  assemblyStep: PackAssemblyStepId
): number {
  if (panelState === "idle") return 0;
  if (panelState === "preview_loading") return 1;
  if (panelState === "preview_ready" || panelState === "insufficient_credits") {
    return 2;
  }
  if (panelState === "credit_checking") return 2;
  if (panelState === "rendering") {
    const idx = TIMELINE_STEPS.findIndex((s) => s.id === assemblyStep);
    return idx >= 0 ? idx : 3;
  }
  if (isTerminalRenderState(panelState)) return TIMELINE_STEPS.length;
  return 0;
}

function PackTimeline({
  language,
  activeThrough,
  busy,
}: {
  language: Language;
  activeThrough: number;
  busy: boolean;
}) {
  const isDe = language === "de";
  return (
    <ol className="flex w-full items-start justify-between gap-1">
      {TIMELINE_STEPS.map((step, index) => {
        const done = index < activeThrough;
        const active = index === activeThrough && busy;
        const reached = index <= activeThrough;
        return (
          <li
            key={step.id}
            className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold transition ${
                done
                  ? "border-[#d8ad5f]/50 bg-[#d8ad5f]/20 text-[#efc777]"
                  : active
                    ? "border-[#d8ad5f] bg-[#d8ad5f]/30 text-white"
                    : reached
                      ? "border-white/20 bg-white/10 text-white/70"
                      : "border-white/10 bg-white/[0.03] text-white/30"
              }`}
            >
              {done ? "✓" : index + 1}
            </span>
            <span className="max-w-[4.5rem] truncate text-center text-[9px] font-medium text-white/45">
              {isDe ? step.labelDe : step.labelEn}
            </span>
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
}: {
  url: string | null;
  alt: string;
  language: Language;
  onDownload?: () => void;
}) {
  const t = COPY[language];
  if (!url) {
    return (
      <div className="flex h-full min-h-[7rem] flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.02] text-white/30">
        <ImageIcon className="mb-2 h-8 w-8" aria-hidden />
        <p className="px-2 text-center text-[10px]">{t.emptyImages}</p>
      </div>
    );
  }

  return (
    <div className="group relative h-full min-h-[7rem] overflow-hidden rounded-xl border border-white/10 bg-black/40">
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
          className="absolute right-2 top-2 flex min-h-9 items-center gap-1 rounded-lg bg-[#d8ad5f] px-2.5 py-1.5 text-[10px] font-bold text-black opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100"
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          {t.download}
        </button>
      ) : null}
    </div>
  );
}

function PackCollapsible({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="group rounded-xl border border-white/10 bg-white/[0.02]"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-sm font-semibold text-white/80 [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown
          className="h-4 w-4 shrink-0 text-white/40 transition group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="border-t border-white/10 px-3 py-2.5 text-xs leading-relaxed text-white/55">
        {children}
      </div>
    </details>
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
      className = "",
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
    const [assemblyStep, setAssemblyStep] =
      useState<PackAssemblyStepId>("idea");
    const previewedPromptRef = useRef<string | null>(null);

    const trimmedPrompt = prompt.trim();
    const balance = creditBalance ?? 0;

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
      const stepTimers = RENDER_ASSEMBLY_STEPS.map((step, index) =>
        window.setTimeout(() => {
          setAssemblyStep(step);
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

    const activeTimeline = timelineActiveIndex(panelState, assemblyStep);
    const previewLoading = panelState === "preview_loading";
    const renderLoading =
      panelState === "rendering" || panelState === "credit_checking";

    const primaryDownloadUrl =
      result?.assets.images[0]?.assetUrl ??
      result?.assets.videos[0]?.assetUrl ??
      null;

    return (
      <section
        id="social-asset-pack-panel"
        className={`flex min-h-0 flex-col overflow-hidden bg-[#0A0A0B] lg:min-h-[min(100dvh,920px)] ${className}`}
        data-panel-state={panelState}
      >
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* Left — input & controls (40%) */}
          <div className="flex w-full shrink-0 flex-col border-b border-white/10 p-4 lg:w-[40%] lg:border-b-0 lg:border-r lg:p-6">
            <textarea
              value={prompt}
              onChange={(e) => onPromptChange?.(e.target.value)}
              disabled={disabled || packBusy}
              rows={5}
              placeholder={t.placeholder}
              className="min-h-[140px] w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-white placeholder:text-white/35 focus:border-[#d8ad5f]/40 focus:outline-none focus:ring-2 focus:ring-[#d8ad5f]/20 disabled:opacity-50"
            />

            <p className="mt-4 rounded-xl border border-[#d8ad5f]/25 bg-[#d8ad5f]/10 px-3 py-2 text-center text-xs font-medium text-[#efc777]">
              {t.creditsBadge(packCredits, balance)}
            </p>

            <div className="mt-5">
              <PackTimeline
                language={lang}
                activeThrough={activeTimeline}
                busy={packBusy}
              />
            </div>

            {error ? (
              <p className="mt-4 text-xs text-red-400" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-auto flex flex-col gap-2 pt-6 sm:flex-row">
              <button
                type="button"
                onClick={() => void runPreview()}
                disabled={!canPreview || previewLoading}
                className="min-h-11 flex-1 rounded-2xl border border-white/15 bg-transparent px-4 py-3 text-sm font-semibold text-white transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
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
                className="min-h-11 flex-1 rounded-2xl bg-[#d8ad5f] px-4 py-3 text-sm font-bold text-black transition hover:bg-[#efc777] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {renderLoading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    {panelState === "rendering" ? t.rendering : t.checking}
                  </span>
                ) : (
                  t.renderCta(packCredits)
                )}
              </button>
            </div>
          </div>

          {/* Right — output (60%) */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-4 lg:p-6">
            <div className="grid min-h-[220px] shrink-0 grid-cols-2 grid-rows-2 gap-3 lg:min-h-[280px] lg:flex-[2]">
              <div className="row-span-2 min-h-0">
                <PackImageSlot
                  url={imageUrls[0] ?? null}
                  alt={lang === "de" ? "Pack Bild 1" : "Pack image 1"}
                  language={lang}
                  onDownload={
                    imageUrls[0]
                      ? () =>
                          window.open(imageUrls[0], "_blank", "noopener,noreferrer")
                      : undefined
                  }
                />
              </div>
              <div className="min-h-0">
                <PackImageSlot
                  url={imageUrls[1] ?? null}
                  alt={lang === "de" ? "Pack Bild 2" : "Pack image 2"}
                  language={lang}
                  onDownload={
                    imageUrls[1]
                      ? () =>
                          window.open(imageUrls[1], "_blank", "noopener,noreferrer")
                      : undefined
                  }
                />
              </div>
              <div className="min-h-0">
                <PackImageSlot
                  url={imageUrls[2] ?? null}
                  alt={lang === "de" ? "Pack Bild 3" : "Pack image 3"}
                  language={lang}
                  onDownload={
                    imageUrls[2]
                      ? () =>
                          window.open(imageUrls[2], "_blank", "noopener,noreferrer")
                      : undefined
                  }
                />
              </div>
            </div>

            <div className="mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
              {hooks.length > 0 ? (
                <PackCollapsible title={t.hooks} defaultOpen>
                  <ul className="space-y-1">
                    {hooks.map((hook) => (
                      <li key={hook}>{hook}</li>
                    ))}
                  </ul>
                </PackCollapsible>
              ) : null}
              {captions.length > 0 ? (
                <PackCollapsible title={t.captions}>
                  <ul className="space-y-2">
                    {captions.map((cap) => (
                      <li key={cap}>{cap}</li>
                    ))}
                  </ul>
                </PackCollapsible>
              ) : null}
              {hashtags.length > 0 ? (
                <PackCollapsible title={t.hashtags}>
                  <p>{hashtags.join(" ")}</p>
                </PackCollapsible>
              ) : null}

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
                  className="mt-1 shrink-0"
                />
              ) : null}
            </div>
          </div>
        </div>
      </section>
    );
  }
);

export default AgentPackGeneratorPanel;
