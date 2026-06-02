"use client";

import Link from "next/link";
import type {
  SocialAssetFormatSuggestion,
  SocialAssetPackAssetRef,
} from "@/app/lib/packs/types";
import { getSocialAssetPackCopy } from "@/app/lib/packs/social-asset-pack";

type Props = {
  packJobId: string;
  packName: string;
  images: SocialAssetPackAssetRef[];
  videos: SocialAssetPackAssetRef[];
  hooks: string[];
  captions: string[];
  hashtags: string[];
  formatSuggestions: SocialAssetFormatSuggestion[];
  language?: "en" | "de";
  className?: string;
};

export default function PackGalleryGroup({
  packJobId,
  packName,
  images,
  videos,
  hooks,
  captions,
  hashtags,
  formatSuggestions,
  language = "en",
  className = "",
}: Props) {
  const isDe = language === "de";
  const copy = getSocialAssetPackCopy(language);
  const assets = [...images, ...videos];

  if (assets.length === 0) {
    return null;
  }

  return (
    <section
      className={`rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5 ${className}`}
      aria-labelledby={`pack-group-${packJobId}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-500/80">
            {copy.exportSummaryLabel}
          </p>
          <h3
            id={`pack-group-${packJobId}`}
            className="text-sm font-bold text-white"
          >
            {packName}
          </h3>
          <p className="mt-0.5 font-mono text-[10px] text-neutral-500">
            {packJobId.slice(0, 8)}
          </p>
        </div>
        <Link
          href={`/dashboard/gallery?pack=${packJobId}`}
          className="text-xs font-semibold text-amber-400 hover:text-amber-300"
        >
          {isDe ? "In Gallery ansehen" : "View in Gallery"}
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {assets.map((asset) => (
          <Link
            key={asset.generationId}
            href={`/dashboard/gallery/${asset.generationId}`}
            className="group overflow-hidden rounded-xl border border-white/10 bg-black/30"
          >
            {asset.outputType === "video" ? (
              <video
                src={asset.assetUrl}
                muted
                playsInline
                className="aspect-square w-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={asset.assetUrl}
                alt=""
                className="aspect-square w-full object-cover transition group-hover:opacity-90"
              />
            )}
            <p className="px-2 py-1 text-[10px] text-neutral-500">
              {asset.outputType === "video"
                ? isDe
                  ? "Motion"
                  : "Motion"
                : isDe
                  ? "Bild"
                  : "Image"}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
            {copy.hooksLabel}
          </p>
          <ul className="mt-1.5 space-y-1">
            {hooks.slice(0, 5).map((hook) => (
              <li key={hook} className="text-xs text-neutral-400">
                {hook}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
            {copy.captionsLabel}
          </p>
          <ul className="mt-1.5 space-y-1">
            {captions.slice(0, 3).map((caption) => (
              <li key={caption} className="text-xs text-neutral-400">
                {caption}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {hashtags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 text-[10px] text-amber-400/90"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {formatSuggestions.map((format) => (
          <span
            key={format}
            className="rounded-md border border-[#22D3EE]/20 bg-[#22D3EE]/8 px-2 py-0.5 text-[10px] font-semibold text-[#67E8F9]"
          >
            {format}
          </span>
        ))}
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-neutral-500">
        {isDe
          ? "Download und Export bereits bezahlter Pack-Assets ist kostenlos."
          : "Downloading and exporting pack assets you already paid for is free."}
      </p>
    </section>
  );
}

/** Match gallery rows to a pack job via generations.workflow prefix. */
export function isGalleryRowInPack(
  workflow: string | null | undefined,
  packJobId: string
): boolean {
  return Boolean(workflow?.startsWith(`social_asset_pack:${packJobId}:`));
}
