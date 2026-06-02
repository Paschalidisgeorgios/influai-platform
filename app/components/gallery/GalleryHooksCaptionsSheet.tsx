"use client";

import { useEffect } from "react";
import { MessageSquareText, X } from "lucide-react";
import HooksCaptionsPanel from "@/app/components/studio/HooksCaptionsPanel";

type Props = {
  open: boolean;
  onClose: () => void;
  prompt: string;
  language?: "en" | "de";
};

export default function GalleryHooksCaptionsSheet({
  open,
  onClose,
  prompt,
  language = "en",
}: Props) {
  const isDe = language === "de";

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label={isDe ? "Panel schließen" : "Close panel"}
        className="fixed inset-0 z-[95] bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-labelledby="gallery-hooks-title"
        className="fixed inset-y-0 right-0 z-[96] flex w-full max-w-md flex-col border-l border-neutral-200/80 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
      >
        <header className="flex items-center justify-between gap-3 border-b border-neutral-200/80 px-5 py-4 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-amber-500" aria-hidden />
            <h2
              id="gallery-hooks-title"
              className="text-sm font-bold text-neutral-900 dark:text-white"
            >
              {isDe ? "Hooks & Captions" : "Hooks & Captions"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isDe ? "Schließen" : "Close"}
            className="rounded-lg border border-neutral-200 p-1.5 text-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <HooksCaptionsPanel
            prompt={prompt}
            language={language}
            showHeader={false}
            panelId="gallery-hooks-captions"
          />
        </div>
      </aside>
    </>
  );
}
