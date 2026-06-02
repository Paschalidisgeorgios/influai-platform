"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, X } from "lucide-react";
import {
  CREDIT_PACKAGES,
  getBestPackageForMissingCredits,
  startCreditPackageCheckout,
  type PackageKey,
} from "@/app/lib/billing/credit-packages";
import {
  canAffordGeneration,
  getInsufficientCreditsCopy,
  getMissingCredits,
} from "@/app/lib/billing/monetization-rules";
import CreditPackCard from "@/app/components/billing/CreditPackCard";
import CreditModeCostReference from "@/app/components/billing/CreditModeCostReference";
import { CREDITS_PAGE } from "@/lib/copy/launch-user-copy";
import { A11Y } from "@/lib/obsidian/a11y-tokens";

export type CreditsModalContext = {
  requiredCredits?: number;
  balance?: number;
  modelModeLabel?: string;
  isPremium?: boolean;
};

/** @deprecated Use CreditsModalContext */
export type UpgradeOrBuyCreditsContext = CreditsModalContext;

type Props = {
  open: boolean;
  onClose: () => void;
  language?: "en" | "de";
  context?: CreditsModalContext;
};

export default function CreditsModal({
  open,
  onClose,
  language = "en",
  context = {},
}: Props) {
  const isDe = language === "de";
  const lang = isDe ? "de" : "en";
  const locale = isDe ? "de-DE" : "en-US";
  const [loadingKey, setLoadingKey] = useState<PackageKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const required = context.requiredCredits ?? 0;
  const balance = context.balance ?? 0;
  const showCost = required > 0;
  const missing = showCost ? getMissingCredits(required, balance) : 0;
  const canAfford = showCost ? canAffordGeneration(required, balance) : true;
  const recommended = getBestPackageForMissingCredits(missing || required || 25);
  const insufficientCopy = showCost
    ? getInsufficientCreditsCopy(required, balance, language)
    : null;

  async function checkoutRecommended() {
    setError(null);
    setLoadingKey(recommended.key);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        window.location.href = `/login?package=${recommended.key}`;
        return;
      }

      const result = await startCreditPackageCheckout(
        recommended.key,
        session.access_token,
        window.location.origin
      );

      if (!result.url) {
        setError(result.error ?? (isDe ? "Checkout fehlgeschlagen." : "Checkout failed."));
        setLoadingKey(null);
        return;
      }

      window.location.href = result.url;
    } catch {
      setError(isDe ? "Checkout fehlgeschlagen." : "Checkout failed.");
      setLoadingKey(null);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="credits-modal-title"
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-neutral-800/80 bg-neutral-900/95 p-6 shadow-2xl backdrop-blur-xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-800 hover:text-white"
          aria-label={isDe ? "Schließen" : "Close"}
        >
          <X className="h-5 w-5" />
        </button>

        <h2 id="credits-modal-title" className="text-xl font-extrabold tracking-tight text-white">
          {CREDITS_PAGE.title[lang]}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-400">
          {CREDITS_PAGE.subtitle[lang]}
        </p>

        <div
          className={`mt-5 grid gap-3 rounded-2xl border px-4 py-3 ${
            showCost && !canAfford
              ? "border-red-500/25 bg-red-500/5"
              : "border-amber-500/20 bg-amber-500/5"
          } ${showCost ? "grid-cols-2" : "grid-cols-1"}`}
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              {CREDITS_PAGE.balance[lang]}
            </p>
            <p className="mt-0.5 text-lg font-bold text-amber-300">
              {balance.toLocaleString(locale)}
              <span className="ml-1 text-sm font-semibold text-neutral-400">
                {isDe ? "Credits" : "credits"}
              </span>
            </p>
          </div>
          {showCost ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                {CREDITS_PAGE.estimatedCost[lang]}
              </p>
              <p className="mt-0.5 text-lg font-bold text-white">
                {required.toLocaleString(locale)}
                <span className="ml-1 text-sm font-semibold text-neutral-400">
                  {isDe ? "Credits" : "credits"}
                </span>
              </p>
            </div>
          ) : null}
        </div>

        {showCost && !canAfford && insufficientCopy ? (
          <div className="mt-4 rounded-2xl border border-red-500/25 bg-red-500/5 p-4">
            <p className="text-sm font-bold text-red-300">{insufficientCopy.headline}</p>
            <p className="mt-1 text-xs text-neutral-400">{insufficientCopy.detail}</p>
            {context.modelModeLabel ? (
              <p className="mt-2 text-xs text-neutral-500">
                {isDe ? "Modus" : "Mode"}: {context.modelModeLabel}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            {CREDITS_PAGE.creditPacks[lang]}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {CREDIT_PACKAGES.map((pkg) => (
              <CreditPackCard
                key={pkg.key}
                pkg={pkg}
                language={lang}
                appearance="compact"
                disabled={loadingKey !== null}
                fallbackHref="/dashboard/credits"
              />
            ))}
          </div>
          <div className="mt-4">
            <CreditModeCostReference language={lang} compact />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-neutral-800 pt-4">
          <button
            type="button"
            disabled={loadingKey !== null}
            onClick={() => void checkoutRecommended()}
            className={`${A11Y.primaryCta} disabled:opacity-60`}
          >
            {loadingKey === recommended.key ? (
              <Loader2 className="inline h-4 w-4 animate-spin" />
            ) : (
              recommended.ctaLabel[lang]
            )}
          </button>
          <Link
            href="/pricing"
            onClick={onClose}
            className={A11Y.secondaryCta}
          >
            {CREDITS_PAGE.upgradePlan[lang]}
          </Link>
          <Link
            href="/dashboard/credits"
            onClick={onClose}
            className="ml-auto text-sm font-semibold text-neutral-500 hover:text-amber-400"
          >
            {isDe ? "Alle Optionen" : "All options"}
          </Link>
        </div>

        <p className="mt-4 text-center text-[11px] text-neutral-500">
          {CREDITS_PAGE.footerNote[lang]}
        </p>

        {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}
      </div>
    </div>
  );
}
