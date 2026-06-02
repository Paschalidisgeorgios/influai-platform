"use client";

import { useEffect, useMemo, useState } from "react";
import { Package, Sparkles } from "lucide-react";
import { SOCIAL_ASSET_PACK_SHOWCASE_DEMO } from "@/app/lib/showcase/social-asset-pack-showcase-demo";
import {
  SHOWCASE_EMBEDDED_CLASS,
  SHOWCASE_EMBEDDED_SCROLL_CLASS,
  SHOWCASE_LANDING_CLASS,
  SHOWCASE_LANDING_SCROLL_CLASS,
  SHOWCASE_THEATRE_CLASS,
} from "@/lib/studio/stable-panel-layout";
import PackAssemblyTimeline from "./PackAssemblyTimeline";
import PackAssetGrid from "./PackAssetGrid";
import PackExportPanel from "./PackExportPanel";
import PackExportCTA from "./PackExportCTA";
import PackScoreReveal from "./PackScoreReveal";
import StableRevealSlot from "./StableRevealSlot";
import {
  demoShowcaseData,
  previewToShowcaseData,
  renderToShowcaseData,
  renderingShowcaseData,
} from "./pack-showcase-data";
import {
  PACK_ASSEMBLY_STEPS,
  type PackAssemblyStepId,
  type PackShowcaseProps,
  stepIndex,
} from "./pack-showcase-types";
import { usePackMotion } from "./use-pack-motion";
import { ParallaxDepthLayers } from "@/app/components/motion/ParallaxDepthBackdrop";
import { useSubtleParallax } from "@/lib/motion/use-subtle-parallax";

function useDemoAssembly(
  language: "en" | "de",
  enabled: boolean,
  onStepChange?: (step: PackAssemblyStepId) => void
) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const { reduceMotion } = usePackMotion();

  useEffect(() => {
    if (!enabled) return;

    setStepIndex(0);
    setProgress(0);

    if (reduceMotion) {
      const finalIndex = PACK_ASSEMBLY_STEPS.length - 1;
      setStepIndex(finalIndex);
      setProgress(100);
      onStepChange?.(PACK_ASSEMBLY_STEPS[finalIndex] ?? "export");
      return;
    }

    const stepDuration = 480;
    const timers = PACK_ASSEMBLY_STEPS.map((_, index) =>
      window.setTimeout(() => {
        setStepIndex(index);
        onStepChange?.(PACK_ASSEMBLY_STEPS[index] ?? "export");
      }, 180 + index * stepDuration)
    );

    const progressTimer = window.setTimeout(() => {
      const start = performance.now();
      const duration = 180 + (PACK_ASSEMBLY_STEPS.length - 1) * stepDuration + 400;
      const tick = (now: number) => {
        const next = Math.min(100, ((now - start) / duration) * 100);
        setProgress(next);
        if (next < 100) window.requestAnimationFrame(tick);
      };
      window.requestAnimationFrame(tick);
    }, 350);

    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(progressTimer);
    };
  }, [enabled, language, onStepChange, reduceMotion]);

  const activeStep = PACK_ASSEMBLY_STEPS[stepIndex] ?? "export";
  return { activeStep, progress, stepIndex };
}

export default function SocialAssetPackShowcase(props: PackShowcaseProps) {
  const language = props.language === "de" ? "de" : "en";
  const { containerRef, getLayerStyle, enabled } = useSubtleParallax<HTMLDivElement>({
    maxPx: 8,
  });
  const demoCopy = SOCIAL_ASSET_PACK_SHOWCASE_DEMO[language];
  const embedded = Boolean(props.hideWorkflow);

  const demoAssembly = useDemoAssembly(
    language,
    props.mode === "demo",
    props.mode === "demo" ? props.onDemoAssemblyStepChange : undefined
  );

  const { data, activeStep, progress, packReady, primaryCta } = useMemo(() => {
    if (props.mode === "demo") {
      return {
        data: demoShowcaseData(language),
        activeStep: demoAssembly.activeStep,
        progress: demoAssembly.progress,
        packReady: demoAssembly.stepIndex >= PACK_ASSEMBLY_STEPS.indexOf("export"),
        primaryCta: demoCopy.cta,
      };
    }

    if (props.mode === "preview") {
      return {
        data: previewToShowcaseData(props.preview, props.prompt, language),
        activeStep: "export" as PackAssemblyStepId,
        progress: 0,
        packReady: false,
        primaryCta: props.renderCtaLabel ?? demoCopy.cta,
      };
    }

    if (props.mode === "rendering") {
      return {
        data: renderingShowcaseData(props.prompt, props.improvedPrompt, language),
        activeStep: props.activeStep,
        progress: props.assemblyProgress ?? 40,
        packReady: false,
        primaryCta: props.renderCtaLabel ?? demoCopy.cta,
      };
    }

    const resultData = renderToShowcaseData(props.result, language);
    return {
      data: resultData,
      activeStep: "export" as PackAssemblyStepId,
      progress: 100,
      packReady: props.result.status !== "failed",
      primaryCta: language === "de" ? "Creator Gallery öffnen" : "Open Creator Gallery",
    };
  }, [props, language, demoCopy, demoAssembly]);

  const hasGeneratedAssets =
    props.mode === "result" &&
    props.result.assets.images.length + props.result.assets.videos.length > 0;

  const exportPanelReady =
    props.mode === "demo"
      ? packReady
      : props.mode === "result"
        ? hasGeneratedAssets
        : props.mode === "rendering"
          ? stepIndex(activeStep) >= stepIndex("export")
          : false;

  const showIdea =
    props.mode !== "demo" ||
    demoAssembly.stepIndex >= PACK_ASSEMBLY_STEPS.indexOf("idea");

  const showImprovedPrompt =
    props.mode === "preview" ||
    props.mode === "result" ||
    (props.mode === "demo" &&
      demoAssembly.stepIndex >= PACK_ASSEMBLY_STEPS.indexOf("prompt_assist")) ||
    (props.mode === "rendering" &&
      Boolean(data.improvedPrompt && data.improvedPrompt !== data.idea));

  const shellClass = embedded
    ? SHOWCASE_EMBEDDED_CLASS
    : props.theatreLayout
      ? SHOWCASE_THEATRE_CLASS
      : SHOWCASE_LANDING_CLASS;
  const scrollClass = embedded
    ? SHOWCASE_EMBEDDED_SCROLL_CLASS
    : SHOWCASE_LANDING_SCROLL_CLASS;

  const showcaseBody = (
  <>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      <header className="mb-3 shrink-0 space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-200/90">
          <Sparkles className="h-3 w-3 text-amber-400" aria-hidden />
          {data.badgeLabel}
        </span>

        {props.mode === "demo" && demoCopy.previewBillingNote ? (
          <p className="text-xs leading-relaxed text-white/55 sm:text-sm">
            {demoCopy.previewBillingNote}
          </p>
        ) : null}

        <div className="flex items-start gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-800/80 bg-neutral-950/60 text-amber-400">
            <Package className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-white sm:text-lg">{data.title}</h2>
            <p className="mt-1 text-xs leading-relaxed text-neutral-400 sm:text-sm">
              {data.subtitle}
            </p>
          </div>
        </div>

        <p className="break-words font-mono text-[10px] uppercase tracking-[0.1em] text-neutral-500 sm:text-[11px] sm:tracking-[0.14em]">
          {data.labels.proofLine}
        </p>
      </header>

      {!props.hideWorkflow ? (
        <PackAssemblyTimeline
          language={language}
          mode={props.mode}
          activeStep={activeStep}
          progress={progress}
          progressLabel={data.labels.progressLabel}
          className="mb-3 shrink-0"
        />
      ) : null}

      <StableRevealSlot
        visible={showIdea}
        reserveMinHeight={props.mode === "demo" ? "min-h-[4.5rem]" : undefined}
        className="mb-3 shrink-0"
      >
        <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/50 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
            {data.labels.ideaLabel}
          </p>
          <p className="mt-1 text-xs text-neutral-200 sm:text-sm">
            &ldquo;{data.idea}&rdquo;
          </p>
          {showImprovedPrompt &&
          data.improvedPrompt &&
          data.improvedPrompt !== data.idea ? (
            <p className="mt-2 border-t border-neutral-800/80 pt-2 text-[10px] leading-relaxed text-neutral-500">
              <span className="font-semibold uppercase tracking-wide text-neutral-600">
                {language === "de" ? "Verbesserter Prompt" : "Improved prompt"}
              </span>
              <span className="mt-1 block text-neutral-400">{data.improvedPrompt}</span>
            </p>
          ) : null}
        </div>
      </StableRevealSlot>

      <PackAssetGrid
        data={data}
        language={language}
        mode={props.mode}
        activeStep={activeStep}
        className="mb-3"
      />

      <div className="min-w-0 shrink-0 border-t border-neutral-800/80 pt-2.5">
        <PackScoreReveal
          language={language}
          mode={props.mode}
          activeStep={activeStep}
          score={data.scoreValue}
          scoreHint={data.scoreHint}
          scoreLabel={data.labels.outputs.creativeScore}
          scoreDimensions={data.scoreDimensions}
          weakestDimensionId={data.weakestDimensionId}
          scorePreview={data.scorePreview}
        />
        <div className="mt-3">
          <PackExportPanel
            language={language}
            mode={props.mode}
            packReady={exportPanelReady}
            hasGeneratedAssets={hasGeneratedAssets}
            formatSuggestions={data.formatSuggestions}
            studioHref={props.studioHref}
          />
        </div>
      </div>

      {props.mode === "demo" ? (
        <div className="mt-4 shrink-0">
          <PackExportCTA
            language={language}
            label={primaryCta}
            packReady={packReady}
            href={props.studioHref ?? "/auth?next=/dashboard"}
            variant="primary"
          />
        </div>
      ) : null}
  </>
  );

  return (
    <div
      ref={containerRef}
      className={`${shellClass} ${props.className ?? ""}`}
      aria-label={data.title}
    >
      <ParallaxDepthLayers
        variant="pack-showcase"
        getLayerStyle={getLayerStyle}
        enabled={enabled}
      />
      <div className={`relative z-[2] flex min-h-0 flex-1 flex-col overflow-hidden ${scrollClass}`}>
        {showcaseBody}
      </div>
    </div>
  );
}
