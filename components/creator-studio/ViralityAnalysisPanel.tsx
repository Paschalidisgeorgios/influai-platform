"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useUiStore } from "@/stores/uiStore";

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-neutral-400">{label}</span>
        <span className="font-mono text-amber-300">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-neutral-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

export default function ViralityAnalysisPanel() {
  const open = useUiStore((s) => s.viralityPanelOpen);
  const result = useUiStore((s) => s.viralityResult);
  const closeViralityPanel = useUiStore((s) => s.closeViralityPanel);

  return (
    <AnimatePresence>
      {open && result ? (
        <>
          <motion.button
            type="button"
            aria-label="Close panel backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeViralityPanel}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-amber-500/20 bg-[#0a0a0a] shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-500/80">
                  Creative Score
                </p>
                <h2 className="text-lg font-bold text-white">
                  Creative Score
                </h2>
              </div>
              <button
                type="button"
                onClick={closeViralityPanel}
                className="rounded-lg p-2 text-neutral-500 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-center">
                <p className="text-5xl font-black text-amber-400">
                  {result.score}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Practical guidance — not a performance guarantee
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <ScoreBar label="Hook strength" value={result.hookStrength} />
                <ScoreBar label="Clarity" value={result.clarity} />
                <ScoreBar label="Composition" value={result.composition} />
                <ScoreBar
                  label="Social readiness"
                  value={result.socialReadiness}
                />
              </div>

              <p className="mt-6 text-sm leading-relaxed text-neutral-400">
                {result.summary}
              </p>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
