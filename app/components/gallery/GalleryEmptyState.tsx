"use client";

import { ImageIcon, LayoutGrid, Sparkles, Video } from "lucide-react";
import ObsidianButton from "@/app/components/shared/ObsidianButton";
import { GALLERY_EMPTY } from "@/lib/copy/launch-user-copy";
import { GALLERY_EMPTY_ACTIONS, GALLERY_FILTER_EMPTY } from "@/lib/copy/gallery-copy";
import { OBS } from "@/lib/obsidian/dashboard-tokens";

type Props = {
  isDe?: boolean;
  variant?: "empty" | "filtered";
  onClearFilters?: () => void;
};

export default function GalleryEmptyState({
  isDe = false,
  variant = "empty",
  onClearFilters,
}: Props) {
  const isFiltered = variant === "filtered";
  const message = isFiltered
    ? isDe
      ? GALLERY_FILTER_EMPTY.de
      : GALLERY_FILTER_EMPTY.en
    : isDe
      ? GALLERY_EMPTY.de
      : GALLERY_EMPTY.en;

  return (
    <div
      className={`flex flex-col items-center justify-center px-6 py-16 text-center ${OBS.glassPad}`}
    >
      <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/5">
        <LayoutGrid className="h-7 w-7 text-amber-400/90" aria-hidden />
        <Sparkles
          className="absolute -right-1 -top-1 h-4 w-4 text-amber-500/70"
          aria-hidden
        />
      </div>

      <h2 className="max-w-md text-lg font-bold text-white">
        {isDe ? "Creator Gallery" : "Creator Gallery"}
      </h2>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-neutral-400">
        {message}
      </p>

      {isFiltered ? (
        <ObsidianButton
          type="button"
          variant="secondary"
          size="md"
          onClick={onClearFilters}
          className="mt-6"
        >
          {isDe ? GALLERY_EMPTY_ACTIONS.clearFilters.de : GALLERY_EMPTY_ACTIONS.clearFilters.en}
        </ObsidianButton>
      ) : (
        <div className="mt-8 flex w-full max-w-xl flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
          <ObsidianButton
            href="/dashboard/image"
            variant="primary"
            size="md"
            className="gap-2"
          >
            <ImageIcon className="h-4 w-4" aria-hidden />
            {isDe ? GALLERY_EMPTY_ACTIONS.createImage.de : GALLERY_EMPTY_ACTIONS.createImage.en}
          </ObsidianButton>
          <ObsidianButton
            href="/dashboard/video"
            variant="secondary"
            size="md"
            className="gap-2"
          >
            <Video className="h-4 w-4" aria-hidden />
            {isDe ? GALLERY_EMPTY_ACTIONS.createVideo.de : GALLERY_EMPTY_ACTIONS.createVideo.en}
          </ObsidianButton>
          <ObsidianButton
            href="/dashboard"
            variant="secondary"
            size="md"
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            {isDe ? GALLERY_EMPTY_ACTIONS.createPack.de : GALLERY_EMPTY_ACTIONS.createPack.en}
          </ObsidianButton>
        </div>
      )}
    </div>
  );
}
