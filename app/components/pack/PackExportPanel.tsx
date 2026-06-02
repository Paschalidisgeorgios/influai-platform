"use client";

import Link from "next/link";
import { ArrowRight, Download, Layers3, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import {
  formatHdExportCta,
  getDefaultHdExportCredits,
  PACK_EXPORT_COPY,
} from "@/app/lib/packs/pack-export-copy";
import type { PackShowcaseMode } from "./pack-showcase-types";
import { PACK_SHOWCASE_STYLES, usePackMotion } from "./use-pack-motion";
import { obsidianButtonClass } from "@/lib/obsidian/button-tokens";

type Props = {
  language: "en" | "de";
  mode: PackShowcaseMode;
  packReady: boolean;
  /** True when render completed and media assets exist (paid generation done). */
  hasGeneratedAssets?: boolean;
  formatSuggestions?: readonly string[];
  studioHref?: string;
  galleryHref?: string;
  hdUpscaleCredits?: number;
  className?: string;
};

const DEFAULT_FORMATS = ["TikTok", "Reels", "Story", "Feed"] as const;

export default function PackExportPanel({
  language,
  mode,
  packReady,
  hasGeneratedAssets = false,
  formatSuggestions = DEFAULT_FORMATS,
  studioHref = "/auth?next=/dashboard",
  galleryHref = "/dashboard/gallery",
  hdUpscaleCredits = getDefaultHdExportCredits(),
  className = "",
}: Props) {
  const { fadeIn, reduceMotion, revealAt, exportGlow } = usePackMotion();
  const copy = PACK_EXPORT_COPY[language];
  const formats = formatSuggestions.length > 0 ? formatSuggestions : DEFAULT_FORMATS;
  const hdCtaLabel = formatHdExportCta(hdUpscaleCredits, language);

  const showExportIncluded = hasGeneratedAssets && (mode === "result" || packReady);
  const isPreview = mode === "preview";
  const isRendering = mode === "rendering";
  const isDemo = mode === "demo";
  const isResult = mode === "result";

  const statusNote = (() => {
    if (showExportIncluded) return copy.freeExportNote;
    if (isPreview) return copy.previewNote;
    if (isRendering) return copy.buildingNote;
    if (isDemo && !packReady) return copy.includedInRenderNote;
    if (isResult && !hasGeneratedAssets) return copy.buildingNote;
    return copy.includedInRenderNote;
  })();

  const primaryLabel = showExportIncluded ? copy.exportIncluded : copy.cta;

  const primaryHref = (() => {
    if (showExportIncluded) return galleryHref;
    if (isDemo && packReady) return studioHref;
    return undefined;
  })();

  const primaryDisabled =
    isRendering ||
    isPreview ||
    (isDemo && !packReady) ||
    (isResult && !hasGeneratedAssets);

  /** Glow only when export is actionable (demo pack ready or post-render). */
  const exportCtaReady = Boolean(primaryHref && !primaryDisabled);

  const ctaVariant = showExportIncluded ? "success" : exportCtaReady ? "primary" : "locked";

  const ctaButton = primaryHref && !primaryDisabled ? (
    <Link
      href={primaryHref}
      className={obsidianButtonClass(ctaVariant, {
        size: "md",
        fullWidth: true,
        className: "relative z-[1] sm:min-h-0",
      })}
    >
      {showExportIncluded ? (
        <Download className="h-4 w-4" aria-hidden />
      ) : (
        <Sparkles className="h-4 w-4" aria-hidden />
      )}
      {primaryLabel}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  ) : (
    <button
      type="button"
      disabled
      className={obsidianButtonClass("locked", {
        size: "md",
        fullWidth: true,
        className: "sm:min-h-0",
      })}
    >
      <Download className="h-4 w-4 opacity-60" aria-hidden />
      {primaryLabel}
    </button>
  );

  return (
    <motion.div
      {...fadeIn}
      className={`${PACK_SHOWCASE_STYLES.exportShell} ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/35 to-transparent"
        aria-hidden
      />

      <div className="relative flex items-start gap-3">
        <motion.span
          {...revealAt(0)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.12)]"
        >
          <Layers3 className="h-4 w-4" aria-hidden />
        </motion.span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-white">{copy.title}</h3>
            {showExportIncluded ? (
              <motion.span
                initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-300 shadow-[0_0_12px_rgba(34,197,94,0.15)]"
              >
                <Download className="h-3 w-3" aria-hidden />
                {copy.exportIncluded}
              </motion.span>
            ) : packReady && isDemo ? (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-300">
                {language === "de" ? "Im Pack enthalten" : "Included in pack"}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-neutral-400">
            {copy.description}
          </p>
        </div>
      </div>

      <div className="relative mt-3">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-neutral-500">
          {copy.formatsLabel}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {formats.map((format, index) => (
            <motion.span
              key={format}
              {...revealAt(index + 1)}
              className={`rounded-full border px-2 py-0.5 text-[9px] font-medium transition-colors ${
                packReady || isPreview || isResult
                  ? "border-white/[0.1] bg-neutral-900/70 text-neutral-300 hover:border-amber-500/25"
                  : "border-neutral-800/80 bg-neutral-900/40 text-neutral-500"
              }`}
            >
              {format}
            </motion.span>
          ))}
        </div>
      </div>

      <p className="relative mt-3 text-[10px] leading-relaxed text-neutral-500">
        {statusNote}
      </p>

      <div className="relative mt-3 space-y-2">
        {exportCtaReady ? (
          <motion.div
            className="w-full rounded-xl"
            {...exportGlow}
          >
            {ctaButton}
          </motion.div>
        ) : (
          ctaButton
        )}

        {showExportIncluded ? (
          <motion.div
            {...revealAt(5)}
            className="rounded-lg border border-white/[0.08] bg-neutral-900/35 px-3 py-2.5"
          >
            <p className="text-[10px] leading-relaxed text-neutral-500">
              {copy.hdUpscaleNote}
            </p>
            <Link
              href="/dashboard/enhancer"
              className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-400/90 transition hover:text-amber-300"
            >
              {hdCtaLabel}
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          </motion.div>
        ) : null}
      </div>
    </motion.div>
  );
}
