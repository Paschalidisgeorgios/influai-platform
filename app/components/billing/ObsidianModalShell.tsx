"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { A11Y } from "@/lib/obsidian/a11y-tokens";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  titleId?: string;
  children: ReactNode;
  className?: string;
  /** Wider modal for pricing grid */
  size?: "md" | "lg";
};

export default function ObsidianModalShell({
  open,
  onClose,
  title,
  titleId = "obsidian-modal-title",
  children,
  className = "",
  size = "md",
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxWidth = size === "lg" ? "max-w-4xl" : "max-w-md";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative z-[101] flex max-h-[min(92dvh,900px)] w-full flex-col overflow-hidden rounded-t-2xl border border-neutral-800/80 bg-neutral-900/40 shadow-[0_0_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:rounded-2xl ${maxWidth} ${className}`}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-800/80 px-4 py-3 sm:px-5">
          <h2
            id={titleId}
            className="text-sm font-bold uppercase tracking-wide text-white sm:text-base"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-800/80 bg-neutral-950/60 text-neutral-400 transition hover:border-amber-500/40 hover:text-amber-300 ${A11Y.focusRing}`}
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
