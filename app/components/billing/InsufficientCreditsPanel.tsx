"use client";

import Link from "next/link";
import { getInsufficientCreditsCopy } from "@/app/lib/billing/monetization-rules";
import { CREDITS_PAGE } from "@/lib/copy/launch-user-copy";
import ObsidianButton from "@/app/components/shared/ObsidianButton";
import { obsidianButtonClass } from "@/lib/obsidian/button-tokens";

type Props = {
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

export default function InsufficientCreditsPanel({
  requiredCredits,
  balance,
  missingCredits,
  language = "en",
  modelModeLabel,
  onBuyCredits,
  onUpgrade,
  compact = false,
  className = "",
}: Props) {
  const lang = language === "de" ? "de" : "en";
  const copy = getInsufficientCreditsCopy(requiredCredits, balance, language);

  const primaryClass = obsidianButtonClass("primary", { size: "md" });
  const secondaryClass = obsidianButtonClass("secondary", { size: "md" });

  return (
    <div
      className={`rounded-2xl border border-red-500/25 bg-red-500/5 ${
        compact ? "p-3" : "p-5"
      } ${className}`}
    >
      <h3 className={`font-bold text-red-300 ${compact ? "text-sm" : "text-base"}`}>
        {copy.headline}
      </h3>
      <p className="mt-1 text-xs text-neutral-400">{copy.detail}</p>
      {modelModeLabel ? (
        <p className="mt-2 text-xs text-neutral-500">
          {lang === "de" ? "Modus" : "Mode"}: {modelModeLabel} · {requiredCredits}{" "}
          {lang === "de" ? "Credits" : "credits"}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {onBuyCredits ? (
          <button type="button" onClick={onBuyCredits} className={primaryClass}>
            {CREDITS_PAGE.buyCredits[lang]}
          </button>
        ) : (
          <Link href="/dashboard/credits" className={primaryClass}>
            {CREDITS_PAGE.buyCredits[lang]}
          </Link>
        )}
        {onUpgrade ? (
          <button type="button" onClick={onUpgrade} className={secondaryClass}>
            {CREDITS_PAGE.upgradePlan[lang]}
          </button>
        ) : (
          <Link href="/pricing" className={secondaryClass}>
            {CREDITS_PAGE.upgradePlan[lang]}
          </Link>
        )}
      </div>

      {!compact ? (
        <p className="mt-3 text-center text-[11px] text-neutral-500">
          {CREDITS_PAGE.footerNote[lang]}
        </p>
      ) : null}
    </div>
  );
}
