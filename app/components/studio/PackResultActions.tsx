"use client";

import { useCallback, useState } from "react";
import { Copy, Download, Package, RefreshCw } from "lucide-react";
import { obsidianButtonClass } from "@/lib/obsidian/button-tokens";

type Props = {
  language: "en" | "de";
  downloadUrl?: string | null;
  hooks?: string[];
  onCreateVariation: () => void;
  onNewPack: () => void;
  className?: string;
};

const COPY = {
  en: {
    download: "Download",
    copyHook: "Copy Hook",
    copied: "Copied!",
    variation: "Create Variation",
    newPack: "New Pack",
  },
  de: {
    download: "Herunterladen",
    copyHook: "Hook kopieren",
    copied: "Kopiert!",
    variation: "Variante erstellen",
    newPack: "Neues Pack",
  },
} as const;

export default function PackResultActions({
  language,
  downloadUrl,
  hooks = [],
  onCreateVariation,
  onNewPack,
  className = "",
}: Props) {
  const t = COPY[language];
  const [copied, setCopied] = useState(false);

  const handleDownload = useCallback(() => {
    if (!downloadUrl) return;
    window.open(downloadUrl, "_blank", "noopener,noreferrer");
  }, [downloadUrl]);

  const handleCopyHook = useCallback(async () => {
    const hook = hooks[0]?.trim();
    if (!hook) return;
    try {
      await navigator.clipboard.writeText(hook);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard denied */
    }
  }, [hooks]);

  const hasHook = Boolean(hooks[0]?.trim());

  return (
    <div
      className={`flex flex-col gap-2 rounded-2xl border border-white/10 bg-[#0A0A0B]/80 p-3 sm:flex-row sm:flex-wrap sm:items-center ${className}`}
    >
      <button
        type="button"
        onClick={handleDownload}
        disabled={!downloadUrl}
        className={`${obsidianButtonClass("primary", { size: "md" })} min-h-11 w-full gap-2 bg-[#d8ad5f] text-black hover:bg-[#efc777] sm:w-auto`}
      >
        <Download className="h-4 w-4 shrink-0" aria-hidden />
        {t.download}
      </button>

      {hasHook ? (
        <button
          type="button"
          onClick={() => void handleCopyHook()}
          className={`${obsidianButtonClass("secondary", { size: "md" })} min-h-11 w-full gap-2 sm:w-auto`}
        >
          <Copy className="h-4 w-4 shrink-0" aria-hidden />
          {copied ? t.copied : t.copyHook}
        </button>
      ) : null}

      <button
        type="button"
        onClick={onCreateVariation}
        className={`${obsidianButtonClass("secondary", { size: "md" })} min-h-11 w-full gap-2 sm:w-auto`}
      >
        <RefreshCw className="h-4 w-4 shrink-0" aria-hidden />
        {t.variation}
      </button>

      <button
        type="button"
        onClick={onNewPack}
        className={`${obsidianButtonClass("ghost", { size: "md" })} min-h-11 w-full gap-2 sm:w-auto`}
      >
        <Package className="h-4 w-4 shrink-0" aria-hidden />
        {t.newPack}
      </button>
    </div>
  );
}
