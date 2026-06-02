"use client";

import { ImageIcon, Layers, Sparkles } from "lucide-react";
import type { LandingLanguage } from "./magnificContent";
import ImageVariantCard from "./ImageVariantCard";
import VideoPreviewCard from "./VideoPreviewCard";
import {
  getLandingMediaCategoryLabel,
  LANDING_MEDIA_PROOF_TILES,
  type LandingMediaProofLanguage,
  type LandingMediaProofTile,
} from "@/lib/landing/landing-media-proof";

type Props = {
  language: LandingLanguage;
  className?: string;
};

function lang(language: LandingLanguage): LandingMediaProofLanguage {
  return language === "de" ? "de" : "en";
}

function CategoryChip({
  categoryId,
  language,
}: {
  categoryId: LandingMediaProofTile["categoryId"];
  language: LandingMediaProofLanguage;
}) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-neutral-400">
      {getLandingMediaCategoryLabel(categoryId, language)}
    </span>
  );
}

function PackPreviewTile({
  tile,
  language,
}: {
  tile: Extract<LandingMediaProofTile, { type: "pack_preview" }>;
  language: LandingMediaProofLanguage;
}) {
  const isDe = language === "de";
  const title = isDe ? tile.labelDe : tile.labelEn;
  const idea = isDe ? tile.ideaDe : tile.ideaEn;
  const labels = isDe ? tile.variationLabelsDe : tile.variationLabelsEn;

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-amber-500/20 bg-neutral-900/40 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-white">
            <Sparkles className="h-3 w-3 shrink-0 text-amber-400" aria-hidden />
            {title}
          </p>
          <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-neutral-500">
            {idea}
          </p>
        </div>
        <CategoryChip categoryId={tile.categoryId} language={language} />
      </div>

      <p className="mb-1.5 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-neutral-500">
        <ImageIcon className="h-3 w-3 text-amber-400/80" aria-hidden />
        {isDe ? "3 Bildvarianten" : "3 image variations"}
      </p>
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-1.5">
        {tile.variationSrcs.map((src, index) => (
          <ImageVariantCard
            key={`${tile.id}-var-${index}`}
            src={src}
            alt={labels[index] ?? `Variation ${index + 1}`}
            label={labels[index]}
            aspectRatio="4/5"
            sizes="100px"
            className="h-full min-h-0"
          />
        ))}
      </div>

      <div className="mt-2 min-h-0 flex-[0.45]">
        <VideoPreviewCard
          posterSrc={tile.motionPosterSrc}
          alt={isDe ? "Motion-Vorschau" : "Motion preview"}
          title={isDe ? "Motion-Clip" : "Motion clip"}
          hint={isDe ? "Illustrative Vorschau" : "Illustrative preview"}
          aspectRatio="16/9"
          className="h-full max-h-[88px] w-full"
        />
      </div>
    </div>
  );
}

function GalleryTile({
  tile,
  language,
}: {
  tile: Extract<LandingMediaProofTile, { type: "gallery" }>;
  language: LandingMediaProofLanguage;
}) {
  const isDe = language === "de";
  const title = isDe ? tile.labelDe : tile.labelEn;

  return (
    <div className="flex h-full flex-col rounded-xl border border-white/[0.08] bg-[#0c0f14]/80 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[11px] font-bold text-white">
          <Layers className="h-3 w-3 text-amber-400/90" aria-hidden />
          {title}
        </p>
        <CategoryChip categoryId={tile.categoryId} language={language} />
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-1.5">
        {tile.images.map((image, index) => (
          <ImageVariantCard
            key={`${tile.id}-${index}`}
            src={image.src}
            alt={isDe ? image.altDe : image.altEn}
            aspectRatio="1/1"
            sizes="120px"
          />
        ))}
      </div>
    </div>
  );
}

function BeforeAfterTile({
  tile,
  language,
}: {
  tile: Extract<LandingMediaProofTile, { type: "before_after" }>;
  language: LandingMediaProofLanguage;
}) {
  const isDe = language === "de";
  const title = isDe ? tile.labelDe : tile.labelEn;
  const prompt = isDe ? tile.promptDe : tile.promptEn;

  return (
    <div className="flex h-full flex-col rounded-xl border border-white/[0.08] bg-[#0c0f14]/80 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold text-white">{title}</p>
        <CategoryChip categoryId={tile.categoryId} language={language} />
      </div>
      <p className="mb-2 line-clamp-2 font-mono text-[9px] leading-relaxed text-amber-200/70">
        {prompt}
      </p>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-1.5">
        <ImageVariantCard
          src={tile.beforeSrc}
          alt={isDe ? "Vorher" : "Before"}
          label={isDe ? "Vorher" : "Before"}
          aspectRatio="4/5"
          sizes="140px"
        />
        <ImageVariantCard
          src={tile.afterSrc}
          alt={isDe ? "Nachher" : "After"}
          label={isDe ? "Nachher" : "After"}
          aspectRatio="4/5"
          sizes="140px"
        />
      </div>
    </div>
  );
}

function renderTile(tile: LandingMediaProofTile, language: LandingMediaProofLanguage) {
  const gridClass = tile.gridClass ?? "";

  switch (tile.type) {
    case "pack_preview":
      return (
        <div key={tile.id} className={`min-h-[280px] sm:min-h-[320px] ${gridClass}`}>
          <PackPreviewTile tile={tile} language={language} />
        </div>
      );
    case "motion_preview":
      return (
        <div key={tile.id} className={`min-h-[200px] ${gridClass}`}>
          <VideoPreviewCard
            posterSrc={tile.posterSrc}
            videoSrc={tile.videoSrc}
            alt={language === "de" ? tile.labelDe : tile.labelEn}
            title={language === "de" ? tile.labelDe : tile.labelEn}
            hint={language === "de" ? tile.hintDe : tile.hintEn}
            className="h-full min-h-[200px] w-full"
          />
          <div className="mt-1.5 flex justify-end">
            <CategoryChip categoryId={tile.categoryId} language={language} />
          </div>
        </div>
      );
    case "gallery":
      return (
        <div key={tile.id} className={`min-h-[220px] ${gridClass}`}>
          <GalleryTile tile={tile} language={language} />
        </div>
      );
    case "before_after":
      return (
        <div key={tile.id} className={`min-h-[220px] ${gridClass}`}>
          <BeforeAfterTile tile={tile} language={language} />
        </div>
      );
    case "image_variant":
      return (
        <div key={tile.id} className={gridClass}>
          <ImageVariantCard
            src={tile.src}
            alt={language === "de" ? tile.labelDe : tile.labelEn}
            label={language === "de" ? tile.labelDe : tile.labelEn}
            aspectRatio={tile.aspectRatio ?? "4/5"}
            className="w-full"
          />
          <div className="mt-1.5 flex justify-end">
            <CategoryChip categoryId={tile.categoryId} language={language} />
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default function MediaProofGrid({ language, className = "" }: Props) {
  const l = lang(language);

  return (
    <div
      className={`grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 ${className}`}
      role="list"
      aria-label={
        language === "de"
          ? "Illustrative Medien-Beispiele"
          : "Illustrative media examples"
      }
    >
      {LANDING_MEDIA_PROOF_TILES.map((tile) => renderTile(tile, l))}
    </div>
  );
}
