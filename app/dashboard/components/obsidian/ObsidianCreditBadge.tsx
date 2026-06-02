"use client";

import Link from "next/link";
import CreditBalanceBadge from "@/app/components/billing/CreditBalanceBadge";
import { useCreativeSuite } from "../creative-suite/CreativeSuiteProvider";
import { useLanguage } from "@/hooks/useLanguage";
import { CREDITS_LOW } from "@/lib/copy/launch-user-copy";
import { areCreditsConfirmed } from "@/lib/billing/credit-ui-state";
import { A11Y } from "@/lib/obsidian/a11y-tokens";

export default function ObsidianCreditBadge() {
  const { credits, creditsLoading, creditsError, refreshCredits } =
    useCreativeSuite();
  const { language } = useLanguage();
  const lang = language === "de" ? "de" : "en";
  const creditsConfirmed = areCreditsConfirmed(creditsLoading, creditsError);

  const lowCredits = creditsConfirmed && credits > 0 && credits <= 10;

  return (
    <div className="space-y-1">
      {creditsError ? (
        <CreditBalanceBadge
          balance={credits}
          error
          language={lang}
          onRetry={refreshCredits}
          className="w-full justify-center py-2 text-sm"
        />
      ) : (
        <Link
          href="/dashboard/credits"
          className={`block w-full ${A11Y.focusRing} rounded-full`}
        >
          <CreditBalanceBadge
            balance={credits}
            loading={creditsLoading}
            language={lang}
            low={lowCredits}
            className="w-full justify-center py-2 text-sm"
          />
        </Link>
      )}
      {lowCredits ? (
        <p className="px-1 text-center text-[11px] leading-snug text-amber-300/95">
          {CREDITS_LOW[lang]}
        </p>
      ) : null}
    </div>
  );
}
