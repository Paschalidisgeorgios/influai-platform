"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { HD_EXPORT_CREDIT_COST } from "@/config/models";
import { useUiStore } from "@/stores/uiStore";
import { useUserStore } from "@/stores/userStore";

export default function MicroPaywallOverlay() {
  const open = useUiStore((s) => s.paywallOpen);
  const context = useUiStore((s) => s.paywallContext);
  const closePaywall = useUiStore((s) => s.closePaywall);
  const credits = useUserStore((s) => s.credits);
  const deductCredits = useUserStore((s) => s.deductCredits);

  const isHd = context === "hd_export";
  const cost = isHd ? HD_EXPORT_CREDIT_COST : 1;
  const canAfford = credits >= cost;

  function handleConfirm() {
    if (!canAfford) return;
    deductCredits(cost);
    closePaywall();
    // Placeholder: trigger HD export pipeline
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
          onClick={closePaywall}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-amber-500/30 bg-neutral-950 p-6 shadow-[0_0_60px_rgba(245,158,11,0.12)]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-500">
              {isHd ? "HD Export" : "Credits required"}
            </p>
            <h3 className="mt-2 text-xl font-bold text-white">
              {isHd
                ? "Export in full resolution"
                : "Add credits to continue"}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">
              {isHd
                ? `HD export uses ${cost} credits. You always see the cost before rendering.`
                : "This action needs more credits. Buy a pack to keep creating."}
            </p>

            <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
              <span className="text-neutral-500">Your balance</span>
              <span className="font-bold text-amber-300">{credits} credits</span>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              {canAfford ? (
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 rounded-xl bg-amber-500 py-3 text-sm font-bold text-black hover:bg-amber-400"
                >
                  {isHd ? `Export HD (${cost} credits)` : "Continue"}
                </button>
              ) : (
                <Link
                  href="/dashboard/credits"
                  className="flex-1 rounded-xl bg-amber-500 py-3 text-center text-sm font-bold text-black hover:bg-amber-400"
                >
                  Buy credits
                </Link>
              )}
              <button
                type="button"
                onClick={closePaywall}
                className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-semibold text-neutral-400 hover:text-white"
              >
                Not now
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
