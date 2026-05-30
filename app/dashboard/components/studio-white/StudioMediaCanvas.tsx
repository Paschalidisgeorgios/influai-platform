"use client";

import Link from "next/link";
import { Download, ImageIcon, LayoutGrid } from "lucide-react";
import { OBS } from "@/lib/obsidian/dashboard-tokens";

type Props = {
  src?: string | null;
  kind?: "image" | "video";
  label?: string;
  emptyLabel?: string;
  emptySubtext?: string;
  isDe?: boolean;
  /** Show download + assets links when media is present */
  showResultActions?: boolean;
};

const PREVIEW_SHELL =
  "relative mx-auto mb-6 flex w-full max-w-4xl overflow-hidden rounded-2xl border border-neutral-800/60 bg-neutral-950/40 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl";

export default function StudioMediaCanvas({
  src,
  kind = "image",
  label,
  emptyLabel = "Your preview will appear here.",
  emptySubtext = "Enter a prompt, choose an engine and format, then start generation.",
  isDe = false,
  showResultActions = true,
}: Props) {
  if (src) {
    return (
      <div className={`${PREVIEW_SHELL} min-h-[40vh] max-h-[55vh]`}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"
        />
        {kind === "video" ? (
          <video
            src={src}
            autoPlay
            loop
            muted
            playsInline
            className="h-full min-h-[40vh] w-full object-cover object-center"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={label ?? (isDe ? "Generiertes Bild" : "Generated image")}
            className="h-full min-h-[40vh] w-full object-cover object-center"
          />
        )}
        {showResultActions && kind === "image" ? (
          <div className="absolute bottom-4 right-4 z-20 flex gap-2">
            <a
              href={src}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700/80 bg-neutral-950/80 px-3 py-1.5 text-[11px] font-semibold text-neutral-200 backdrop-blur-md transition hover:border-amber-500/40 hover:text-amber-400"
            >
              <Download className="h-3.5 w-3.5" />
              {isDe ? "Download" : "Download"}
            </a>
            <Link
              href="/dashboard/assets"
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700/80 bg-neutral-950/80 px-3 py-1.5 text-[11px] font-semibold text-neutral-200 backdrop-blur-md transition hover:border-amber-500/40 hover:text-amber-400"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              {isDe ? "Assets" : "Assets"}
            </Link>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`${PREVIEW_SHELL} ${OBS.glass} flex min-h-[40vh] flex-col items-center justify-center px-6 py-10 text-center`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,158,11,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.35) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"
      />

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-800/80 bg-neutral-950/60">
          <ImageIcon className="h-5 w-5 text-amber-500/70" strokeWidth={1.5} />
        </div>
        <p className={`${OBS.mono} text-amber-500/60`}>
          {isDe ? "Vorschau" : "Preview"}
        </p>
        <p className="mt-3 max-w-sm text-base font-semibold text-white/90">{emptyLabel}</p>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-500">{emptySubtext}</p>
      </div>
    </div>
  );
}
