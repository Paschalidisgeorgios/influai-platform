"use client";

import type { ReactNode } from "react";
import { GENERATOR_OVERLAY_COPY } from "@/lib/studio/generator-overlay-copy";

type Props = {
  language?: "en" | "de";
  children?: ReactNode;
  className?: string;
};

/** Dashed visual stage card for the generator overlay body. */
export default function GeneratorOverlayVisualStage({
  language = "en",
  children,
  className = "",
}: Props) {
  const isDe = language === "de";
  const placeholder = isDe
    ? GENERATOR_OVERLAY_COPY.visualStagePlaceholder.de
    : GENERATOR_OVERLAY_COPY.visualStagePlaceholder.en;

  if (children) {
    return (
      <div
        className={`flex min-h-[12rem] min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-dashed border-white/20 bg-[#0a0a0a] ${className}`}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-[12rem] flex-1 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-[#0a0a0a] px-6 py-10 ${className}`}
      role="img"
      aria-label={placeholder}
    >
      <p className="text-center text-sm font-medium text-neutral-500">
        {placeholder}
      </p>
    </div>
  );
}
