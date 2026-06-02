"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { PROMPT_ASSIST } from "@/lib/copy/launch-user-copy";
import { PREMIUM_CLASSES, PREMIUM_SPRING } from "@/lib/obsidian/premium-tokens";

type Props = {
  prompt: string;
  modelModeId: string;
  actionId?: "create_image" | "create_video";
  presetId?: string | null;
  language?: "en" | "de";
  disabled?: boolean;
  onUseImproved: (improved: string) => void;
  className?: string;
};

export default function PromptAssistControls({
  prompt,
  modelModeId,
  actionId,
  presetId,
  language = "en",
  disabled = false,
  onUseImproved,
  className = "",
}: Props) {
  const isDe = language === "de";
  const [loading, setLoading] = useState(false);
  const [improved, setImproved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAssist() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    setImproved(null);

    try {
      const res = await fetch("/api/prompt-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          modelModeId,
          actionId,
          presetId: presetId ?? undefined,
        }),
      });
      const data = (await res.json()) as {
        enhanced?: string;
        fallback?: boolean;
        error?: string;
      };

      if (!res.ok || !data.enhanced) {
        setError(
          data.error ??
            (isDe ? PROMPT_ASSIST.failure.de : PROMPT_ASSIST.failure.en)
        );
        return;
      }

      setImproved(data.enhanced);
    } catch {
      setError(isDe ? PROMPT_ASSIST.failure.de : PROMPT_ASSIST.failure.en);
    } finally {
      setLoading(false);
    }
  }

  const canAssist = prompt.trim().length >= 4 && !disabled;
  const note =
    actionId === "create_video"
      ? isDe
        ? PROMPT_ASSIST.improvedNoteVideo.de
        : PROMPT_ASSIST.improvedNoteVideo.en
      : isDe
        ? PROMPT_ASSIST.improvedNoteImage.de
        : PROMPT_ASSIST.improvedNoteImage.en;

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void runAssist()}
          disabled={!canAssist || loading}
          className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
            loading
              ? "border-[#8B5CF6]/40 bg-[#8B5CF6]/15 text-[#C4B5FD]"
              : "border-white/[0.08] bg-[#111827]/60 text-[#9CA3AF] hover:text-white hover:ring-1 hover:ring-[#8B5CF6]/30 disabled:opacity-40"
          }`}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#8B5CF6]" />
          ) : (
            <Sparkles className="h-3.5 w-3.5 text-[#8B5CF6]" />
          )}
          {isDe ? PROMPT_ASSIST.tagline.de : PROMPT_ASSIST.tagline.en}
        </button>
        <span
          className="inline-flex min-w-[7.5rem] items-center"
          aria-live="polite"
        >
          {loading ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-flex items-center gap-1 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-2 py-0.5 text-[10px] font-medium text-[#C4B5FD]"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#8B5CF6]" />
              {isDe ? "Wird verbessert …" : "Improving …"}
            </motion.span>
          ) : null}
        </span>
      </div>

      <div className="relative mt-3 min-h-[5.25rem]">
        <AnimatePresence>
          {improved ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={PREMIUM_SPRING}
              className={`${PREMIUM_CLASSES.glassCard} border-[#8B5CF6]/25 p-3`}
            >
              <p className="flex items-center gap-1.5 text-xs text-[#C4B5FD]">
                <span aria-hidden>✨</span>
                {note}
              </p>
              <button
                type="button"
                onClick={() => onUseImproved(improved)}
                className="mt-3 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
              >
                {isDe ? PROMPT_ASSIST.useImproved.de : PROMPT_ASSIST.useImproved.en}
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <p className="mt-2 min-h-[1rem] text-xs text-[#EF4444]/90" role="status">
        {error ?? "\u00a0"}
      </p>
    </div>
  );
}
