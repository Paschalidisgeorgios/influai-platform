"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  CreditCard,
  GalleryVerticalEnd,
  Loader2,
  Lock,
  Sparkles,
  UserRound,
  Zap,
} from "lucide-react";
import {
  formatCredits,
  formatEurPrice,
  PRICING_PACKAGES,
  type PackageKey,
  type PricingPackage,
} from "../components/landing/pricingPackages";
import { createClient } from "@/lib/supabase/client";
import { useDashboardLanguage } from "./DashboardLanguageProvider";
import { formatCopy } from "./i18n";

type CreditsCardProps = {
  refreshKey?: number;
};

type CreditPackage = PricingPackage & {
  tagline: string;
  description: string;
  benefits: string[];
  buttonLabel: string;
};

export default function CreditsCard({ refreshKey = 0 }: CreditsCardProps) {
  const { copy } = useDashboardLanguage();
  const supabase = createClient();

  const studioFeatures = useMemo(
    () => [
      { label: copy.credits.features.aiAgent, icon: Bot },
      { label: copy.credits.features.socialFormats, icon: Sparkles },
      { label: copy.credits.features.styleProfiles, icon: UserRound },
      { label: copy.credits.features.assetGallery, icon: GalleryVerticalEnd },
    ],
    [copy]
  );

  const creditPackages: CreditPackage[] = useMemo(
    () =>
      PRICING_PACKAGES.map((pkg) => {
        const extras = copy.credits.packages[pkg.key];
        return {
          ...pkg,
          badge: pkg.badge ? copy.credits.recommended : pkg.badge,
          tagline: extras.tagline,
          description: extras.description,
          benefits: [...extras.benefits],
          buttonLabel: extras.button,
        };
      }),
    [copy]
  );

  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [checkoutPackage, setCheckoutPackage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadCredits();
  }, [refreshKey]);

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token ?? null;
  }

  async function loadCredits() {
    try {
      setLoading(true);
      setErrorMessage(null);

      const token = await getAccessToken();

      if (!token) {
        setCredits(0);
        setErrorMessage(copy.credits.sessionExpired);
        return;
      }

      const response = await fetch("/api/credits", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || copy.credits.loadFailed);
        return;
      }

      setCredits(typeof data.credits === "number" ? data.credits : 0);
    } catch (error) {
      console.error("Credits load error:", error);
      setErrorMessage(copy.credits.loadConnection);
    } finally {
      setLoading(false);
    }
  }

  async function startCheckout(packageKey: PackageKey) {
    try {
      setCheckoutPackage(packageKey);
      setErrorMessage(null);

      const token = await getAccessToken();

      if (!token) {
        setErrorMessage(copy.credits.sessionExpired);
        setCheckoutPackage(null);
        return;
      }

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          packageKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || copy.credits.checkoutFailed);
        setCheckoutPackage(null);
        return;
      }

      if (!data.url) {
        setErrorMessage(copy.credits.checkoutNoUrl);
        setCheckoutPackage(null);
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Checkout error:", error);
      setErrorMessage(copy.credits.checkoutConnection);
      setCheckoutPackage(null);
    }
  }

  const checkoutInProgress = checkoutPackage !== null;

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035] shadow-[0_20px_70px_rgba(0,0,0,0.25)] sm:rounded-[2rem]">
        <div className="relative p-4 sm:p-6">
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[#d8ad5f]/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#d8ad5f]">
                {copy.credits.accountBalance}
              </p>

              <h3 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
                {copy.credits.creditsTitle}
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">
                {copy.credits.balanceDescription}
              </p>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#d8ad5f]/25 bg-[#d8ad5f]/10 px-3 py-1.5 text-xs font-bold text-[#d8ad5f]">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                {copy.credits.oneCreditRule}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {studioFeatures.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <span
                      key={feature.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[11px] font-bold text-white/55"
                    >
                      <Icon className="h-3 w-3 shrink-0 text-[#d8ad5f]" />
                      {feature.label}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="w-full shrink-0 rounded-[1.35rem] border border-white/10 bg-black/30 p-4 sm:max-w-[240px] sm:p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
                {copy.credits.availableCredits}
              </p>

              <div className="mt-2 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#d8ad5f]/15 text-[#d8ad5f]">
                  <CreditCard className="h-5 w-5" />
                </div>

                <p className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  {loading ? "…" : formatCredits(credits)}
                </p>
              </div>

              <button
                type="button"
                onClick={loadCredits}
                disabled={loading || checkoutInProgress}
                className="mt-4 w-full rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white/60 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? copy.credits.refreshing : copy.credits.refreshBalance}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="relative z-10 mt-5 flex items-start gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="font-medium leading-6">{errorMessage}</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#d8ad5f]">
              {copy.credits.creditPackages}
            </p>
            <h4 className="mt-2 text-xl font-black text-white sm:text-2xl">
              {copy.credits.choosePlan}
            </h4>
          </div>

          <p className="flex items-center gap-2 text-xs text-white/40">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            {copy.credits.secureCheckout}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:items-stretch lg:gap-5">
          {creditPackages.map((creditPackage) => {
            const isLoading = checkoutPackage === creditPackage.key;
            const isDisabled = checkoutInProgress && !isLoading;

            return (
              <div
                key={creditPackage.key}
                className={`relative flex flex-col overflow-hidden rounded-[1.5rem] border p-5 transition sm:rounded-[2rem] sm:p-6 ${
                  creditPackage.highlight
                    ? "order-first border-[#d8ad5f]/45 bg-gradient-to-b from-[#d8ad5f]/14 to-[#d8ad5f]/[0.03] shadow-[0_24px_80px_rgba(216,173,95,0.18)] ring-1 ring-[#d8ad5f]/35 lg:order-none lg:z-10 lg:-mt-1 lg:mb-1"
                    : "border-white/10 bg-white/[0.035] shadow-[0_20px_70px_rgba(0,0,0,0.2)]"
                }`}
              >
                {creditPackage.highlight && (
                  <>
                    <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-[#d8ad5f]/20 blur-3xl" />
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d8ad5f]/60 to-transparent" />
                  </>
                )}

                <div className="relative z-10 flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                        creditPackage.highlight
                          ? "bg-[#d8ad5f] text-black"
                          : "bg-white/[0.08] text-[#d8ad5f]"
                      }`}
                    >
                      {creditPackage.highlight ? (
                        <Sparkles className="h-5 w-5" />
                      ) : creditPackage.key === "ultimate" ? (
                        <Zap className="h-5 w-5" />
                      ) : (
                        <CreditCard className="h-5 w-5" />
                      )}
                    </div>

                    {creditPackage.badge && (
                      <span className="rounded-full bg-[#d8ad5f] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-black shadow-[0_8px_24px_rgba(216,173,95,0.35)]">
                        {creditPackage.badge}
                      </span>
                    )}
                  </div>

                  <p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#d8ad5f]">
                    {creditPackage.tagline}
                  </p>

                  <h4 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                    {creditPackage.name}
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-white/45">
                    {creditPackage.description}
                  </p>

                  <div
                    className={`mt-5 rounded-2xl border p-4 sm:p-5 ${
                      creditPackage.highlight
                        ? "border-[#d8ad5f]/25 bg-black/20"
                        : "border-white/10 bg-black/25"
                    }`}
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
                      {copy.credits.price}
                    </p>
                    <p className="mt-2 text-4xl font-black tracking-tight text-[#d8ad5f] sm:text-5xl">
                      {formatEurPrice(creditPackage.priceEur)}
                    </p>

                    <p className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
                      {copy.credits.creditsIncluded}
                    </p>
                    <p className="mt-1 text-2xl font-black text-white sm:text-3xl">
                      {formatCredits(creditPackage.credits)}{" "}
                      <span className="text-lg font-bold text-white/55 sm:text-xl">
                        {copy.credits.creditsUnit}
                      </span>
                    </p>
                    <p className="mt-2 text-xs leading-5 text-white/40">
                      {formatCopy(copy.credits.standardImages, {
                        count: creditPackage.credits,
                      })}
                    </p>
                  </div>

                  <ul className="mt-5 flex-1 space-y-2.5">
                    {creditPackage.benefits.map((benefit) => (
                      <li
                        key={benefit}
                        className="flex items-start gap-2.5 text-sm leading-5 text-white/60"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#d8ad5f]" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => startCheckout(creditPackage.key)}
                    disabled={checkoutInProgress}
                    aria-busy={isLoading}
                    className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-black transition disabled:cursor-not-allowed ${
                      creditPackage.highlight
                        ? "bg-[#d8ad5f] text-black hover:bg-[#efc777] disabled:bg-[#d8ad5f]/60"
                        : "bg-white text-black hover:bg-white/85 disabled:bg-white/50"
                    } ${isDisabled ? "opacity-40" : ""}`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {copy.credits.redirecting}
                      </>
                    ) : (
                      creditPackage.buttonLabel
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-5 text-center text-xs leading-5 text-white/35">
          {copy.credits.footerNote}
        </p>
      </div>
    </section>
  );
}
