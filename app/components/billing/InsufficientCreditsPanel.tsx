"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

type Props = {
  /** @deprecated Use balance — kept for CreditCostPreview */
  requiredCredits: number;
  balance: number;
  missingCredits?: number;
  language?: "en" | "de";
  modelModeLabel?: string;
  onBuyCredits?: () => void;
  onUpgrade?: () => void;
  compact?: boolean;
  className?: string;
};

const COPY = {
  en: {
    title: "Not enough credits",
    body: (current: number, required: number) =>
      `You have ${current} credits. This pack needs ${required} credits.`,
    upgrade: "Upgrade to Pro — 60 packs/month",
    buyCredits: "Buy credits",
    trySmaller: "Try a smaller pack",
  },
  de: {
    title: "Nicht genug Credits",
    body: (current: number, required: number) =>
      `Du hast ${current} Credits. Dieses Pack benötigt ${required} Credits.`,
    upgrade: "Auf Pro upgraden — 60 Packs/Monat",
    buyCredits: "Credits kaufen",
    trySmaller: "Kleineres Pack versuchen",
  },
};

export default function InsufficientCreditsPanel({
  requiredCredits,
  balance,
  language = "en",
  modelModeLabel,
  onBuyCredits,
  onUpgrade,
  className = "",
}: Props) {
  const t = COPY[language === "de" ? "de" : "en"];
  const currentCredits = balance;

  const upgradeHref = "/dashboard/credits";
  const buyHref = "/dashboard/credits";

  return (
    <div
      className={`rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center ${className}`}
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
        <Zap className="h-6 w-6 text-red-400" aria-hidden />
      </div>
      <h3 className="mb-2 font-bold text-white">{t.title}</h3>
      <p className="mb-6 text-sm text-white/50">
        {t.body(currentCredits, requiredCredits)}
      </p>
      {modelModeLabel ? (
        <p className="mb-4 text-xs text-white/40">
          {language === "de" ? "Modus" : "Mode"}: {modelModeLabel}
        </p>
      ) : null}
      <div className="flex flex-col gap-3">
        {onUpgrade ? (
          <button
            type="button"
            onClick={onUpgrade}
            className="min-h-11 rounded-2xl bg-[#d8ad5f] py-3 text-sm font-bold text-black transition hover:bg-[#efc777]"
          >
            {t.upgrade}
          </button>
        ) : (
          <Link
            href={upgradeHref}
            className="min-h-11 rounded-2xl bg-[#d8ad5f] py-3 text-sm font-bold text-black transition hover:bg-[#efc777]"
          >
            {t.upgrade}
          </Link>
        )}
        {onBuyCredits ? (
          <button
            type="button"
            onClick={onBuyCredits}
            className="min-h-11 rounded-2xl border border-white/10 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
          >
            {t.buyCredits}
          </button>
        ) : (
          <Link
            href={buyHref}
            className="min-h-11 rounded-2xl border border-white/10 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
          >
            {t.buyCredits}
          </Link>
        )}
      </div>
    </div>
  );
}
