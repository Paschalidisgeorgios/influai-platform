"use client";

import { useEffect } from "react";
import { usePromptStore } from "@/stores/promptStore";
import { Sparkles } from "lucide-react";

type Props = {
  onGenerate?: () => void;
  disabled?: boolean;
  creditLabel?: string;
};

export default function SmartPromptInput({
  onGenerate,
  disabled = false,
  creditLabel = "1 credit",
}: Props) {
  const prompt = usePromptStore((s) => s.prompt);
  const ghostSuggestion = usePromptStore((s) => s.ghostSuggestion);
  const isOptimizing = usePromptStore((s) => s.isOptimizing);
  const setPrompt = usePromptStore((s) => s.setPrompt);
  const acceptGhost = usePromptStore((s) => s.acceptGhost);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Tab" && ghostSuggestion && !e.shiftKey) {
        const target = e.target as HTMLElement | null;
        if (target?.closest("[data-smart-prompt]")) {
          e.preventDefault();
          acceptGhost();
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [ghostSuggestion, acceptGhost]);

  const ghostTail =
    ghostSuggestion && prompt.trim().length > 0
      ? ghostSuggestion.slice(prompt.length)
      : null;

  return (
    <div
      data-smart-prompt
      className="relative rounded-2xl border border-amber-500/25 bg-neutral-950/80 p-4 shadow-[0_0_40px_rgba(245,158,11,0.06)] backdrop-blur-xl"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400/90">
          <Sparkles className="h-3.5 w-3.5" />
          Smart Prompt
        </div>
        {isOptimizing ? (
          <span className="text-[10px] text-neutral-500">Optimizing…</span>
        ) : ghostSuggestion ? (
          <span className="text-[10px] text-neutral-500">
            Tab to accept suggestion
          </span>
        ) : null}
      </div>

      <div className="relative min-h-[96px]">
        {ghostTail ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 whitespace-pre-wrap break-words p-0 text-base leading-relaxed text-neutral-600"
          >
            <span className="invisible">{prompt}</span>
            <span>{ghostTail}</span>
          </div>
        ) : null}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your next creator visual or video…"
          rows={3}
          className="relative z-10 w-full resize-none bg-transparent text-base leading-relaxed text-white caret-amber-400 placeholder:text-neutral-600 focus:outline-none"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-neutral-500">Est. {creditLabel}</span>
        <button
          type="button"
          disabled={disabled || !prompt.trim()}
          onClick={onGenerate}
          className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Generate
        </button>
      </div>
    </div>
  );
}
