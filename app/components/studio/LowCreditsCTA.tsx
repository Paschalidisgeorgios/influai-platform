"use client";

import Link from "next/link";
import { CREDITS_LOW, CREDITS_PAGE } from "@/lib/copy/launch-user-copy";
import { obsidianButtonClass } from "@/lib/obsidian/button-tokens";

type Props = {
  language?: "en" | "de";
  nextPaidCost?: number;
  balance?: number;
  missingCredits?: number;
  onBuyCredits?: () => void;
  onUpgrade?: () => void;
  className?: string;
};

export default function LowCreditsCTA({
  language = "en",
  nextPaidCost,
  balance,
  missingCredits,
  onBuyCredits,
  onUpgrade,
  className = "",
}: Props) {
  const lang = language === "de" ? "de" : "en";
  const locale = lang === "de" ? "de-DE" : "en-US";

  const primaryClass = obsidianButtonClass("primary", { size: "sm" });
  const secondaryClass = obsidianButtonClass("secondary", { size: "sm" });

  return (
    <div
      className={`rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 ${className}`}
    >
      <p className="text-sm font-semibold text-amber-200/90">{CREDITS_LOW[lang]}</p>
      {typeof nextPaidCost === "number" && nextPaidCost > 0 ? (
        <p className="mt-1 text-xs text-neutral-500">
          {CREDITS_PAGE.estimatedCost[lang]}: {nextPaidCost.toLocaleString(locale)}{" "}
          {lang === "de" ? "Credits" : "credits"}
          {typeof balance === "number" ? (
            <>
              {" · "}
              {CREDITS_PAGE.balance[lang]}: {balance.toLocaleString(locale)}
              {typeof missingCredits === "number" && missingCredits > 0 ? (
                <>
                  {" · "}
                  {CREDITS_PAGE.missingCredits[lang]} {missingCredits.toLocaleString(locale)}
                </>
              ) : null}
            </>
          ) : null}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
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
    </div>
  );
}
