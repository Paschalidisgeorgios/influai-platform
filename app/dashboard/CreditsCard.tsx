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
  Tag,
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
  const [packagesFocused, setPackagesFocused] = useState(false);

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
  const [customCredits, setCustomCredits] = useState<string>("100");
  const [customSubmitting, setCustomSubmitting] = useState(false);

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

  const parsedCustomCredits = (() => {
    const value = parseInt(customCredits, 10);
    if (!Number.isFinite(value) || Number.isNaN(value)) return NaN;
    return value;
  })();

  const customCreditsValid =
    Number.isFinite(parsedCustomCredits) &&
    parsedCustomCredits >= 100 &&
    parsedCustomCredits <= 10000;

  const customPriceEur = customCreditsValid
    ? (parsedCustomCredits * 0.1).toFixed(2)
    : "0.00";

  const customPriceDisplay = `€${customPriceEur}`;

  const showCustomMinError =
    customCredits.trim() !== "" &&
    (!Number.isFinite(parsedCustomCredits) || parsedCustomCredits < 100);

  const showCustomMaxError =
    Number.isFinite(parsedCustomCredits) && parsedCustomCredits > 10000;

  const quickTopUpAmounts = [100, 250, 500, 1000];

  async function startCustomCheckout() {
    const amount = parsedCustomCredits;

    if (!Number.isFinite(amount) || amount < 100 || amount > 10000) {
      setErrorMessage(
        amount > 10000
          ? copy.credits.customTopUpMaxError
          : copy.credits.customTopUpMinError
      );
      return;
    }

    try {
      setCustomSubmitting(true);
      setErrorMessage(null);

      const token = await getAccessToken();

      if (!token) {
        setErrorMessage(copy.credits.sessionExpired);
        setCustomSubmitting(false);
        return;
      }

      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_APP_URL;

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(origin ? { "x-origin": origin } : {}),
        },
        body: JSON.stringify({
          customCredits: amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || copy.credits.checkoutFailed);
        setCustomSubmitting(false);
        return;
      }

      if (!data.url) {
        setErrorMessage(copy.credits.checkoutNoUrl);
        setCustomSubmitting(false);
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Custom checkout error:", error);
      setErrorMessage(copy.credits.checkoutConnection);
      setCustomSubmitting(false);
    }
  }

  return (
    <section className="space-y-4 sm:space-y-6">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm sm:rounded-3xl">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-orange-600">
                {copy.credits.accountBalance}
              </p>
              <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-800 sm:text-xl">
                {copy.credits.availableCredits}
              </h3>
              <p className="mt-1.5 text-sm leading-5 text-slate-600">
                {copy.credits.oneCreditRule}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {loading ? "…" : formatCredits(credits)}
                </p>
              </div>

              <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-1">
                <button
                  type="button"
                  onClick={loadCredits}
                  disabled={loading || checkoutInProgress}
                  className="min-h-[44px] w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? copy.credits.refreshing : copy.credits.refreshBalance}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPackagesFocused(true);
                    window.setTimeout(() => setPackagesFocused(false), 1600);
                    document
                      .getElementById("custom-credit-top-up")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  disabled={checkoutInProgress}
                  className="min-h-[44px] w-full rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {credits === 0 ? copy.credits.buyCreditsCta : copy.credits.upgradeCreditsCta}
                </button>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="font-medium leading-6">{errorMessage}</p>
            </div>
          )}
        </div>
      </div>

      <div
        id="custom-credit-top-up"
        className={`scroll-mt-24 rounded-2xl border bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6 ${
          packagesFocused
            ? "border-orange-300 ring-2 ring-orange-100"
            : "border-gray-200"
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-orange-600">
                {copy.credits.customTopUpTitle}
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-800 sm:text-base">
                {copy.credits.customTopUpIntro}
              </p>
              <p className="mt-1.5 text-sm leading-6 text-slate-600">
                {copy.credits.customTopUpPricePerCredit}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                {copy.credits.customTopUpExamples}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {copy.credits.customTopUpPackageHint}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-stretch gap-3 sm:w-[min(100%,17rem)]">
              <label className="block">
                <span className="text-sm font-semibold text-slate-800">
                  {copy.credits.customTopUpLabel}
                </span>
                <input
                  type="number"
                  min={100}
                  max={10000}
                  step={50}
                  inputMode="numeric"
                  placeholder={copy.credits.customTopUpPlaceholder}
                  value={customCredits}
                  onChange={(event) => setCustomCredits(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-xl font-bold tracking-tight text-slate-900 outline-none placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </label>

              <div className="grid grid-cols-4 gap-1.5">
                {quickTopUpAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setCustomCredits(String(amount))}
                    className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                  >
                    {amount}
                  </button>
                ))}
              </div>

              {showCustomMinError && (
                <p className="text-xs font-semibold text-red-600" role="status">
                  {copy.credits.customTopUpMinError}
                </p>
              )}
              {showCustomMaxError && (
                <p className="text-xs font-semibold text-red-600" role="status">
                  {copy.credits.customTopUpMaxError}
                </p>
              )}

              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-center shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  {copy.credits.price}
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-orange-600 sm:text-3xl">
                  {customPriceDisplay}
                </p>
              </div>

              <button
                type="button"
                onClick={startCustomCheckout}
                disabled={
                  !customCreditsValid || customSubmitting || checkoutInProgress
                }
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {customSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {copy.credits.redirecting}
                  </>
                ) : (
                  copy.credits.customTopUpBuy
                )}
              </button>
            </div>
          </div>
      </div>

      <div>
        <div
          id="credit-packages"
          className={`mb-4 flex scroll-mt-24 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between ${
            packagesFocused ? "rounded-2xl ring-2 ring-orange-100" : ""
          }`}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-orange-600">
              {copy.credits.creditPackages}
            </p>
            <h4 className="mt-1.5 text-lg font-semibold text-slate-900 sm:text-xl">
              {copy.credits.choosePlan}
            </h4>
          </div>

          <p className="flex items-center gap-2 text-xs text-slate-500">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            {copy.credits.secureCheckout}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:items-stretch">
          {creditPackages.map((creditPackage) => {
            const isLoading = checkoutPackage === creditPackage.key;
            const isDisabled = checkoutInProgress && !isLoading;
            const shownCredits = creditPackage.displayCredits;

            return (
              <div
                key={creditPackage.key}
                className={`relative flex flex-col overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition ${
                  creditPackage.highlight
                    ? "order-first border-orange-200 shadow-md ring-1 ring-orange-100 lg:order-none"
                    : "border-gray-100"
                }`}
              >
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                      {creditPackage.highlight ? (
                        <Sparkles className="h-5 w-5" />
                      ) : creditPackage.key === "ultimate" ? (
                        <Zap className="h-5 w-5" />
                      ) : (
                        <CreditCard className="h-5 w-5" />
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {creditPackage.badge && (
                        <span className="rounded-full bg-orange-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                          {creditPackage.badge}
                        </span>
                      )}
                      {creditPackage.key === "professional" ? (
                        <span className="rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-orange-700">
                          {copy.credits.mostPopular}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-orange-600">
                    {creditPackage.tagline}
                  </p>

                  <h4 className="mt-1.5 text-xl font-bold text-slate-900 sm:text-2xl">
                    {creditPackage.name}
                  </h4>

                  <p className="mt-1.5 text-sm leading-5 text-slate-600">
                    {creditPackage.description}
                  </p>

                  <div className="mt-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      {copy.credits.price}
                    </p>
                    <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                      {formatEurPrice(creditPackage.priceEur)}
                    </p>

                    <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      {copy.credits.creditsIncluded}
                    </p>
                    <p className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                      {formatCredits(shownCredits)}{" "}
                      <span className="text-base font-semibold text-slate-600 sm:text-lg">
                        {copy.credits.creditsUnit}
                      </span>
                    </p>
                    <p className="mt-2 text-xs leading-5 text-slate-600">
                      {formatCopy(copy.credits.standardImages, {
                        count: shownCredits,
                      })}
                    </p>
                  </div>

                  <ul className="mt-4 flex-1 space-y-2">
                    {creditPackage.benefits.map((benefit) => (
                      <li
                        key={benefit}
                        className="flex items-start gap-2 text-sm leading-5 text-slate-700"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => startCheckout(creditPackage.key)}
                    disabled={checkoutInProgress}
                    aria-busy={isLoading}
                    className={`mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed ${
                      creditPackage.highlight
                        ? "bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
                        : "border border-orange-100 bg-orange-50 text-orange-700 hover:bg-orange-100 disabled:opacity-60"
                    } ${isDisabled ? "opacity-60" : ""}`}
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

        <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {copy.credits.trustNotes.map((note) => (
            <li
              key={note}
              className="flex items-start gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-xs leading-5 text-slate-600"
            >
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
              <span>{note}</span>
            </li>
          ))}
        </ul>

        <details className="mt-4 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <summary className="cursor-pointer list-none select-none">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-800">{copy.credits.modeCostsLabel}</p>
              <span className="text-xs font-medium text-slate-500">
                {copy.credits.workflowChargeNote}
              </span>
            </div>
          </summary>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <ul className="space-y-2">
                {[
                  copy.credits.modeCosts.standard,
                  copy.credits.modeCosts.fastDraft,
                  copy.credits.modeCosts.ugcLook,
                  copy.credits.modeCosts.premium,
                  copy.credits.modeCosts.brandAssets,
                  copy.credits.modeCosts.referenceEdit,
                  copy.credits.modeCosts.videoStudio,
                  copy.credits.modeCosts.creatorVideo,
                  copy.credits.modeCosts.lipSync,
                  copy.credits.modeCosts.talkingCreator,
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm leading-5 text-slate-700"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs leading-5 text-slate-600">
                {copy.credits.lipSyncUsageNote}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 self-start">
              {studioFeatures.map((feature) => {
                const Icon = feature.icon;

                return (
                  <span
                    key={feature.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600"
                  >
                    <Icon className="h-3 w-3 shrink-0 text-orange-600" />
                    {feature.label}
                  </span>
                );
              })}
            </div>
          </div>
        </details>

        <div className="mt-6 overflow-hidden rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <Tag className="h-5 w-5" aria-hidden />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  {copy.credits.watermarkedPromo.eyebrow}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <h4 className="text-lg font-semibold text-slate-900 sm:text-xl">
                    {copy.credits.watermarkedPromo.title}
                  </h4>
                  <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-600">
                    {copy.credits.watermarkedPromo.badge}
                  </span>
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {copy.credits.watermarkedPromo.description}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {copy.credits.watermarkedPromo.upgradeNote}
                </p>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  {copy.credits.watermarkedPromo.notAvailable}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-start rounded-full border border-gray-200 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {copy.sidebar.planned}
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-xs leading-5 text-slate-500">
          {copy.credits.footerNote}
        </p>
      </div>
    </section>
  );
}
