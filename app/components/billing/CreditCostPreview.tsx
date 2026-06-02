"use client";

import Link from "next/link";
import {
  canAffordGeneration,
  getMissingCredits,
} from "@/app/lib/billing/monetization-rules";
import { CREDITS_PAGE } from "@/lib/copy/launch-user-copy";
import CreditBalanceBadge from "./CreditBalanceBadge";
import InsufficientCreditsPanel from "./InsufficientCreditsPanel";
import { A11Y } from "@/lib/obsidian/a11y-tokens";

type Props = {
  creditCost: number;
  balance: number;
  loading?: boolean;
  error?: boolean;
  language?: "en" | "de";
  costLabel?: string;
  showPolicyNote?: boolean;
  /** One-line summary above the grid (generator panels). */
  showSummaryLine?: boolean;
  onBuyCredits?: () => void;
  onUpgrade?: () => void;
  onRetryCredits?: () => void;
  className?: string;
};

export default function CreditCostPreview({
  creditCost,
  balance,
  loading = false,
  error = false,
  language = "en",
  costLabel,
  showPolicyNote = true,
  showSummaryLine = false,
  onBuyCredits,
  onUpgrade,
  onRetryCredits,
  className = "",
}: Props) {
  const isDe = language === "de";
  const lang = isDe ? "de" : "en";
  const locale = isDe ? "de-DE" : "en-US";
  const creditsConfirmed = !loading && !error;
  const canAfford = creditsConfirmed && canAffordGeneration(creditCost, balance);
  const missing = getMissingCredits(creditCost, balance);
  const after = Math.max(0, balance - creditCost);

  const costHeading = costLabel
    ? `${CREDITS_PAGE.estimatedCost[lang]} (${costLabel})`
    : CREDITS_PAGE.estimatedCost[lang];

  const summaryLine = creditsConfirmed
    ? canAfford
      ? isDe
        ? `Dieses Pack kostet ${creditCost.toLocaleString(locale)} Credits · Du hast ${balance.toLocaleString(locale)} Credits`
        : `This pack uses ${creditCost.toLocaleString(locale)} credits · You have ${balance.toLocaleString(locale)} credits`
      : isDe
        ? `Nicht genug Credits · Mehr kaufen →`
        : `Not enough credits · Buy more →`
    : "";

  return (
    <div className={`space-y-3 ${className}`}>
      {showSummaryLine ? (
        <p
          className={`text-center text-sm font-medium ${
            canAfford ? "text-white/70" : "text-red-400"
          }`}
          role="status"
        >
          {canAfford ? (
            summaryLine
          ) : (
            <Link
              href="/dashboard/credits"
              onClick={(e) => {
                if (onBuyCredits) {
                  e.preventDefault();
                  onBuyCredits();
                }
              }}
              className="text-red-400 underline-offset-2 hover:underline"
            >
              {summaryLine}
            </Link>
          )}
        </p>
      ) : null}

      <div
        className={`grid grid-cols-2 gap-3 rounded-2xl border px-4 py-3 sm:grid-cols-3 ${
          canAfford
            ? "border-[#d8ad5f]/20 bg-[#d8ad5f]/5"
            : "border-red-500/25 bg-red-500/5"
        }`}
      >
        <div>
          <p className={A11Y.mutedLabel}>{costHeading}</p>
          <p className="mt-0.5 text-sm font-bold text-white">
            {creditCost.toLocaleString(locale)} {isDe ? "Credits" : "credits"}
          </p>
        </div>
        <div>
          <p className={A11Y.mutedLabel}>{CREDITS_PAGE.afterRender[lang]}</p>
          <p
            className={`mt-0.5 text-sm font-bold ${canAfford ? "text-neutral-200" : "text-red-300"}`}
          >
            {after.toLocaleString(locale)}
          </p>
        </div>
        <div className="col-span-2 flex items-center sm:col-span-1 sm:justify-end">
          <CreditBalanceBadge
            balance={balance}
            loading={loading}
            error={error}
            language={language}
            low={creditsConfirmed && !canAfford}
            onRetry={onRetryCredits}
          />
        </div>
      </div>

      {showPolicyNote ? (
        <p className={`text-center ${A11Y.mutedCaption}`}>
          {CREDITS_PAGE.footerNote[lang]}
        </p>
      ) : null}

      {!canAfford && creditsConfirmed ? (
        <InsufficientCreditsPanel
          requiredCredits={creditCost}
          balance={balance}
          missingCredits={missing}
          language={language}
          onBuyCredits={onBuyCredits}
          onUpgrade={onUpgrade}
        />
      ) : null}
    </div>
  );
}
