"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  formatEurPrice,
  formatPackageCredits,
  getCreditPackageSavingsPercent,
  startCreditPackageCheckout,
  type CreditPackage,
} from "@/app/lib/billing/credit-packages";
import { MONETIZATION_COPY } from "@/app/lib/billing/pricing-config";
import {
  creditsPageHref,
  setPendingPackage,
  syncPackageUrlParam,
} from "@/lib/billing/pending-package-checkout";
import { usePricingUiOptional } from "@/app/components/billing/PricingUiProvider";
import { A11Y } from "@/lib/obsidian/a11y-tokens";
import { obsidianButtonClass } from "@/lib/obsidian/button-tokens";

type Appearance = "light" | "dark" | "landing" | "compact";

type Props = {
  pkg: CreditPackage;
  language?: "en" | "de";
  appearance?: Appearance;
  className?: string;
  disabled?: boolean;
  /** When checkout fails (e.g. Stripe not configured), link here */
  fallbackHref?: string;
};

export default function CreditPackCard({
  pkg,
  language = "en",
  appearance = "dark",
  className = "",
  disabled = false,
  fallbackHref = "/pricing",
}: Props) {
  const isDe = language === "de";
  const lang = isDe ? "de" : "en";
  const supabase = createClient();
  const pricingUi = usePricingUiOptional();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const savings = getCreditPackageSavingsPercent(pkg);
  const ctaLabel = pkg.ctaLabel[lang];
  const usageGuide = pkg.approximateUsage[lang];
  const badge = pkg.badge?.[lang];

  const isLight = appearance === "light";
  const isLanding = appearance === "landing";
  const isCompact = appearance === "compact";

  const shell = isLight
    ? pkg.highlight
      ? "border-orange-200 bg-white shadow-md ring-1 ring-orange-100"
      : "border-gray-100 bg-white"
    : pkg.highlight
      ? "border-amber-500/40 bg-amber-500/5 ring-1 ring-amber-500/30"
      : "border-white/10 bg-white/[0.04]";

  async function handleCheckout() {
    setError(null);
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setPendingPackage(pkg.key);
        syncPackageUrlParam(pkg.key);
        if (pricingUi) {
          pricingUi.openAuthForPackage(pkg.key);
          setLoading(false);
          return;
        }
        window.location.href = `/auth?mode=register&package=${pkg.key}`;
        return;
      }

      const result = await startCreditPackageCheckout(
        pkg.key,
        session.access_token,
        window.location.origin
      );

      if (!result.url) {
        setError(result.error ?? (isDe ? "Checkout fehlgeschlagen." : "Checkout failed."));
        setLoading(false);
        return;
      }

      window.location.href = result.url;
    } catch {
      setError(isDe ? "Checkout fehlgeschlagen." : "Checkout failed.");
      setLoading(false);
    }
  }

  return (
    <article
      id={`credit-pack-${pkg.key}`}
      className={`relative flex flex-col rounded-2xl border p-4 sm:p-5 ${shell} ${className}`}
    >
      {badge ? (
        <span
          className={`mb-3 inline-flex w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
            isLight
              ? "bg-orange-500 text-white"
              : "border border-amber-500/40 bg-amber-500/15 text-amber-200"
          }`}
        >
          {badge}
        </span>
      ) : (
        <span className={isCompact ? "hidden" : "mb-3 h-5"} />
      )}

      <div className="flex-1">
        <h3
          className={`font-bold ${
            isLanding
              ? "text-xl font-black uppercase tracking-tight text-white"
              : isLight
                ? "text-xl text-slate-900"
                : "text-lg text-white"
          }`}
        >
          {pkg.label}
        </h3>

        <p
          className={`mt-3 font-black ${
            isLanding ? "text-3xl text-white" : isLight ? "text-3xl text-slate-900" : "text-2xl text-white"
          }`}
        >
          {formatEurPrice(pkg.priceEur)}
          {isLanding ? (
            <span className="ml-2 text-xs font-bold uppercase tracking-widest text-neutral-400">
              {isDe ? "einmalig" : "once"}
            </span>
          ) : null}
        </p>

        <p
          className={`mt-2 font-bold ${
            isLight ? "text-xl text-orange-600" : "text-lg text-amber-300"
          }`}
        >
          {formatPackageCredits(pkg.credits, lang)}
        </p>

        {savings !== null && savings > 0 ? (
          <p
            className={`mt-2 text-xs font-semibold ${
              isLight ? "text-emerald-700" : "text-emerald-400"
            }`}
          >
            {MONETIZATION_COPY.saveVsStarter[lang](savings)} ·{" "}
            {MONETIZATION_COPY.betterValue[lang]}
          </p>
        ) : null}

        <p
          className={`mt-4 text-sm leading-relaxed ${
            isLight ? "text-slate-600" : "text-neutral-300"
          }`}
        >
          {usageGuide}
        </p>
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={() => void handleCheckout()}
          disabled={disabled || loading}
          className={
            pkg.highlight
              ? isLanding
                ? obsidianButtonClass("primary", {
                    size: "md",
                    surface: "landing",
                    fullWidth: true,
                  })
                : isLight
                  ? "inline-flex w-full min-h-[44px] items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
                  : obsidianButtonClass("primary", { size: "md", fullWidth: true })
              : isLanding
                ? obsidianButtonClass("secondary", {
                    size: "md",
                    surface: "landing",
                    fullWidth: true,
                  })
                : isLight
                  ? "inline-flex w-full min-h-[44px] items-center justify-center rounded-xl border border-orange-100 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
                  : obsidianButtonClass("secondary", { size: "md", fullWidth: true })
          }
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            ctaLabel
          )}
        </button>

        {error ? (
          <p className="mt-2 text-xs text-red-400" role="alert">
            {error}{" "}
            <Link href={fallbackHref} className="underline hover:text-amber-400">
              {isDe ? "Preise ansehen" : "View pricing"}
            </Link>
          </p>
        ) : null}
      </div>
    </article>
  );
}
