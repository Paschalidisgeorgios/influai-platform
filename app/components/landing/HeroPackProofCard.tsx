"use client";

import Image from "next/image";
import {
  Clapperboard,
  Download,
  Hash,
  ImageIcon,
  MessageSquare,
  Package,
  Sparkles,
} from "lucide-react";
import {
  SHOWCASE_VARIATION_IMAGES,
  SHOWCASE_VARIATION_IMAGE_FALLBACK,
  SOCIAL_ASSET_PACK_SHOWCASE_DEMO,
} from "@/app/lib/showcase/social-asset-pack-showcase-demo";
import type { LandingLanguage } from "./magnificContent";
import { getKineticHeroCopy } from "@/lib/landing/kinetic-hero-content";
import { PREMIUM_CLASSES } from "@/lib/obsidian/premium-tokens";

type Props = {
  language: LandingLanguage;
  className?: string;
};

export default function HeroPackProofCard({ language, className = "" }: Props) {
  const lang = language === "de" ? "de" : "en";
  const demo = SOCIAL_ASSET_PACK_SHOWCASE_DEMO[lang];
  const hero = getKineticHeroCopy(language);
  const outputs = demo.outputs;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[#d8ad5f]/20 bg-neutral-900/50 shadow-[0_0_48px_rgba(216,173,95,0.1)] backdrop-blur-2xl ${className}`}
      aria-label={demo.title}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d8ad5f]/50 to-transparent" />

      <div className="border-b border-white/[0.06] px-4 py-3 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#d8ad5f]/35 bg-[#d8ad5f]/10 text-[#d8ad5f]">
              <Package className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white">{demo.title}</p>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-neutral-400">
                {demo.subtitle}
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-neutral-400">
            {hero.demoBadge}
          </span>
        </div>
        <p className="mt-2 truncate font-mono text-[10px] uppercase tracking-wide text-neutral-500">
          {demo.ideaLabel}: {demo.idea}
        </p>
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-neutral-300">
            <ImageIcon className="h-3 w-3 text-[#d8ad5f]/90" aria-hidden />
            {outputs.imageVariations}
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {SHOWCASE_VARIATION_IMAGES.map((src, index) => (
              <div
                key={src}
                className="relative aspect-[4/5] overflow-hidden rounded-lg border border-white/[0.08] bg-[#0a0a0a]"
              >
                <Image
                  src={src}
                  alt={demo.variationLabels[index] ?? `Variation ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="120px"
                  onError={(event) => {
                    const img = event.currentTarget;
                    if (img.src.includes(SHOWCASE_VARIATION_IMAGE_FALLBACK)) return;
                    img.src = SHOWCASE_VARIATION_IMAGE_FALLBACK;
                  }}
                />
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[8px] font-semibold text-white/80">
                  {demo.variationLabels[index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0a0a0a]/80 px-3 py-2">
          <Clapperboard className="h-4 w-4 shrink-0 text-[#d8ad5f]/90" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-neutral-200">{outputs.motionClip}</p>
            <p className="text-[10px] text-neutral-500">{demo.motionClipHint}</p>
          </div>
          <span className="rounded-md border border-[#d8ad5f]/30 bg-[#d8ad5f]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#f0d4a8]">
            5s
          </span>
        </div>

        <p className="md:hidden rounded-lg border border-white/[0.06] bg-[#111827]/50 px-2.5 py-2 text-center text-[10px] leading-relaxed text-neutral-400">
          {hero.mobilePackSummary}
        </p>

        <div className="hidden gap-2 sm:grid-cols-2 md:grid">
          <div className="rounded-lg border border-white/[0.06] bg-[#111827]/60 p-2.5">
            <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-neutral-300">
              <MessageSquare className="h-3 w-3" aria-hidden />
              {outputs.hooks}
            </p>
            <ul className="space-y-1">
              {demo.hooks.slice(0, 2).map((hook) => (
                <li
                  key={hook}
                  className="line-clamp-2 text-[10px] leading-snug text-neutral-400"
                >
                  {hook}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-[#111827]/60 p-2.5">
            <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-neutral-300">
              <MessageSquare className="h-3 w-3" aria-hidden />
              {outputs.captions}
            </p>
            <ul className="space-y-1">
              {demo.captions.slice(0, 2).map((caption) => (
                <li
                  key={caption}
                  className="line-clamp-2 text-[10px] leading-snug text-neutral-400"
                >
                  {caption}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="hidden items-start gap-1.5 text-[10px] leading-relaxed text-neutral-500 md:flex">
          <Hash className="mt-0.5 h-3 w-3 shrink-0 text-neutral-500" aria-hidden />
          <span className="line-clamp-2">{demo.hashtags}</span>
        </p>

        <div className="hidden items-center justify-between gap-3 rounded-lg border border-[#8B5CF6]/25 bg-[#8B5CF6]/8 px-3 py-2 md:flex">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[#C4B5FD]" aria-hidden />
            <span className="text-[10px] font-semibold text-white">{outputs.creativeScore}</span>
          </div>
          <p className="text-lg font-black tabular-nums text-[#C4B5FD]">
            {demo.scoreValue}
            <span className="text-xs font-semibold text-white/35">/100</span>
          </p>
        </div>

        <div className="hidden items-center justify-between gap-2 rounded-lg border border-[#d8ad5f]/25 bg-[#d8ad5f]/8 px-3 py-2 md:flex">
          <div className="flex items-center gap-2">
            <Download className="h-3.5 w-3.5 text-[#efc777]" aria-hidden />
            <span className="text-[10px] font-bold uppercase tracking-wide text-[#f5e6c8]">
              {outputs.exportPack}
            </span>
          </div>
          <span className={PREMIUM_CLASSES.mono}>4:5 · 9:16 · Feed</span>
        </div>
      </div>

      <p className="border-t border-white/[0.06] px-4 py-2 text-center text-[10px] text-neutral-600 sm:px-5">
        {hero.demoDisclaimer}
      </p>
    </div>
  );
}
