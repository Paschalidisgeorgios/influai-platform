"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Clapperboard,
  Coins,
  Download,
  ImageIcon,
  LayoutGrid,
  MessageSquare,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  NARRATIVE_STAGE_COPY,
  NARRATIVE_VISUAL_HEIGHT,
  type NarrativeStepId,
} from "@/lib/landing/motion-narrative-content";
import {
  SHOWCASE_VARIATION_IMAGES,
  SHOWCASE_VARIATION_IMAGE_FALLBACK,
} from "@/app/lib/showcase/social-asset-pack-showcase-demo";
import type { LandingLanguage } from "./magnificContent";
import { PREMIUM_CLASSES } from "@/lib/obsidian/premium-tokens";

type Props = {
  stepId: NarrativeStepId;
  language: LandingLanguage;
};

const SHELL =
  "relative overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_40px_rgba(0,0,0,0.35)]";

export default function NarrativeVisualStage({ stepId, language }: Props) {
  const lang = language === "de" ? "de" : "en";
  const copy = NARRATIVE_STAGE_COPY[lang];
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={`${SHELL} ${NARRATIVE_VISUAL_HEIGHT} w-full`}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d8ad5f]/35 to-transparent" />
      <span className="absolute right-3 top-3 z-10 rounded-full border border-white/[0.1] bg-black/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-neutral-400">
        {copy.demoBadge}
      </span>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={stepId}
          initial={reduceMotion ? false : { opacity: 0, filter: "blur(6px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={
            reduceMotion
              ? undefined
              : { opacity: 0, filter: "blur(4px)" }
          }
          transition={{ duration: reduceMotion ? 0 : 0.32, ease: "easeOut" }}
          className="absolute inset-0 flex flex-col p-4 sm:p-5"
        >
          {stepId === "idea" ? <IdeaVisual copy={copy} /> : null}
          {stepId === "prompt_assist" ? <PromptAssistVisual copy={copy} /> : null}
          {stepId === "asset_plan" ? <AssetPlanVisual language={lang} /> : null}
          {stepId === "render" ? <RenderVisual copy={copy} language={lang} /> : null}
          {stepId === "creative_score" ? <ScoreVisual copy={copy} language={lang} /> : null}
          {stepId === "export" ? <ExportVisual copy={copy} /> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

type StageCopy = (typeof NARRATIVE_STAGE_COPY)["en"] | (typeof NARRATIVE_STAGE_COPY)["de"];

function IdeaVisual({ copy }: { copy: StageCopy }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center">
      <p className={PREMIUM_CLASSES.mono}>Your idea</p>
      <div className="mt-3 rounded-xl border border-white/[0.08] bg-[#0a0a0a]/70 p-4">
        <p className="font-mono text-sm leading-relaxed text-[#f5e6c8]/90 sm:text-base">
          {copy.roughIdea}
        </p>
      </div>
    </div>
  );
}

function PromptAssistVisual({ copy }: { copy: StageCopy }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center gap-3">
      <div className="flex items-center gap-2 text-[#d8ad5f]">
        <Wand2 className="h-4 w-4" aria-hidden />
        <span className="text-xs font-semibold text-white">Prompt Assist</span>
      </div>
      <div className="rounded-lg border border-dashed border-white/15 bg-[#0a0a0a]/50 px-3 py-2.5">
        <p className="text-[11px] text-neutral-500 line-through decoration-neutral-600">
          {copy.roughIdea}
        </p>
      </div>
      <div className="rounded-xl border border-[#d8ad5f]/25 bg-[#d8ad5f]/8 px-3 py-2.5">
        <p className="text-xs leading-relaxed text-[#faf3e3]/90 sm:text-sm">
          {copy.enhancedPrompt}
        </p>
      </div>
    </div>
  );
}

function AssetPlanVisual({ language }: { language: "en" | "de" }) {
  const isDe = language === "de";
  const items = [
    { icon: ImageIcon, label: isDe ? "3 Bildvarianten" : "3 image variations" },
    { icon: Clapperboard, label: isDe ? "1 Motion-Clip" : "1 motion clip" },
    { icon: MessageSquare, label: isDe ? "Hooks & Captions" : "Hooks & captions" },
    { icon: LayoutGrid, label: isDe ? "Export-Formate" : "Export formats" },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center">
      <p className={PREMIUM_CLASSES.mono}>
        {isDe ? "Content-Plan" : "Content plan"}
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-2">
        {items.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#111827]/60 px-3 py-2.5"
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-[#d8ad5f]/90" aria-hidden />
            <span className="text-[11px] font-semibold text-neutral-200">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RenderVisual({
  copy,
  language,
}: {
  copy: StageCopy;
  language: "en" | "de";
}) {
  const isDe = language === "de";
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center gap-4">
      <div className="grid grid-cols-3 gap-1.5">
        {SHOWCASE_VARIATION_IMAGES.map((src, index) => (
          <div
            key={src}
            className="relative aspect-[4/5] overflow-hidden rounded-lg border border-white/[0.08] bg-[#0a0a0a] opacity-90"
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes="100px"
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.src.includes(SHOWCASE_VARIATION_IMAGE_FALLBACK)) {
                  img.src = SHOWCASE_VARIATION_IMAGE_FALLBACK;
                }
              }}
            />
            {index === 0 ? (
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-[9px] font-bold uppercase tracking-wide text-[#f0d4a8]">
                {isDe ? "Rendert…" : "Rendering…"}
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-xl border border-[#d8ad5f]/30 bg-[#d8ad5f]/10 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-[#efc777]" aria-hidden />
          <span className="text-xs font-semibold text-[#f5e6c8]">{copy.creditsLabel}</span>
        </div>
        <span className="text-sm font-bold tabular-nums text-[#f0d4a8]">
          {copy.creditsValue}
        </span>
      </div>
    </div>
  );
}

function ScoreVisual({
  copy,
  language,
}: {
  copy: StageCopy;
  language: "en" | "de";
}) {
  const isDe = language === "de";
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center gap-4">
      <div className="flex items-center justify-between rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#C4B5FD]" aria-hidden />
          <span className="text-sm font-semibold text-white">Creative Score</span>
        </div>
        <p className="text-3xl font-black tabular-nums text-[#C4B5FD]">
          {copy.scoreValue}
          <span className="text-base font-semibold text-white/35">/100</span>
        </p>
      </div>
      <ul className="space-y-1.5 text-[11px] text-neutral-400">
        <li>• {isDe ? "Hook-Klarheit" : "Hook clarity"}</li>
        <li>• {isDe ? "Format-Fit" : "Format fit"}</li>
        <li>• {isDe ? "Social-Tauglichkeit" : "Social readiness"}</li>
      </ul>
    </div>
  );
}

function ExportVisual({ copy }: { copy: StageCopy }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center gap-4">
      <div className="flex items-center gap-2">
        <Download className="h-4 w-4 text-[#efc777]" aria-hidden />
        <span className="text-sm font-bold uppercase tracking-wide text-[#f5e6c8]">
          Export Pack
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {copy.formats.map((format) => (
          <span
            key={format}
            className="rounded-lg border border-white/[0.1] bg-[#111827]/80 px-3 py-2 text-xs font-semibold text-white"
          >
            {format}
          </span>
        ))}
      </div>
      <p className="text-[11px] text-neutral-500">{copy.demoNote}</p>
    </div>
  );
}
