import Link from "next/link";
import { CreditCard, Lock, Sparkles, Tag, Zap } from "lucide-react";

import {
  formatCredits,
  formatEurPrice,
  PRICING_PACKAGES,
  type PackageKey,
} from "./pricingPackages";

type Language = "en" | "de";

const pricingDescriptions: Record<
  PackageKey,
  { en: string; de: string }
> = {
  starter: {
    en: "For testing prompts, formats and your first campaign drafts.",
    de: "Zum Testen von Prompts, Formaten und ersten Kampagnen-Drafts.",
  },
  professional: {
    en: "Recommended for weekly creation and ongoing campaigns.",
    de: "Empfohlen für wöchentliche Produktion und laufende Kampagnen.",
  },
  ultimate: {
    en: "For high-volume production and larger teams.",
    de: "Für hohe Produktionsvolumen und größere Teams.",
  },
};

type PricingSectionProps = {
  language: Language;
  headingFontClass?: string;
  secureLabel: string;
  pricingTitle: string;
  pricingNote: string;
  getStartedLabel: string;
};

export function PricingSection({
  language,
  headingFontClass = "",
  secureLabel,
  pricingTitle,
  pricingNote,
  getStartedLabel,
}: PricingSectionProps) {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.35em] text-[#d8ad5f]">
        {language === "en" ? "Pricing" : "Preise"}
      </p>

      <h2
        className={`${headingFontClass} max-w-4xl text-5xl font-bold leading-none tracking-tight sm:text-7xl`}
      >
        {pricingTitle}
      </h2>

      <p className="mt-6 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
        {pricingNote}
      </p>

      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#d8ad5f]/25 bg-[#d8ad5f]/10 px-3 py-1.5 text-xs font-bold text-[#d8ad5f]">
        {language === "en"
          ? "Standard image: 1 credit"
          : "Standard-Bild: 1 Credit"}
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:items-stretch lg:gap-5">
        {PRICING_PACKAGES.map((plan) => {
          const description =
            language === "en"
              ? pricingDescriptions[plan.key].en
              : pricingDescriptions[plan.key].de;

          return (
            <div
              key={plan.key}
              className={`relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border p-5 sm:rounded-[2rem] sm:p-6 ${
                plan.highlight
                  ? "order-first border-[#d8ad5f]/45 bg-gradient-to-b from-[#d8ad5f]/14 to-[#d8ad5f]/[0.03] shadow-[0_24px_80px_rgba(216,173,95,0.18)] ring-1 ring-[#d8ad5f]/35 lg:order-none lg:z-10 lg:-mt-1 lg:mb-1"
                  : "border-white/10 bg-white/[0.035] shadow-[0_20px_70px_rgba(0,0,0,0.2)]"
              }`}
            >
              {plan.highlight && (
                <>
                  <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-[#d8ad5f]/20 blur-3xl" />
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d8ad5f]/60 to-transparent" />
                </>
              )}

              <div className="relative z-10 flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      plan.highlight
                        ? "bg-[#d8ad5f] text-black"
                        : "bg-white/[0.08] text-[#d8ad5f]"
                    }`}
                  >
                    {plan.highlight ? (
                      <Sparkles className="h-5 w-5" />
                    ) : plan.key === "ultimate" ? (
                      <Zap className="h-5 w-5" />
                    ) : (
                      <CreditCard className="h-5 w-5" />
                    )}
                  </div>

                  {plan.badge && (
                    <span className="rounded-full bg-[#d8ad5f] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-black shadow-[0_8px_24px_rgba(216,173,95,0.35)]">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <h3 className="mt-5 text-2xl font-black text-white sm:text-3xl">
                  {plan.name}
                </h3>

                <div
                  className={`mt-5 rounded-2xl border p-4 sm:p-5 ${
                    plan.highlight
                      ? "border-[#d8ad5f]/25 bg-black/20"
                      : "border-white/10 bg-black/25"
                  }`}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
                    {language === "en" ? "Price" : "Preis"}
                  </p>
                  <p className="mt-2 text-4xl font-black tracking-tight text-[#d8ad5f] sm:text-5xl">
                    {formatEurPrice(plan.priceEur)}
                  </p>

                  <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
                    {language === "en" ? "Credits included" : "Enthaltene Credits"}
                  </p>
                  <p className="mt-1 text-2xl font-black text-white sm:text-3xl">
                    {formatCredits(plan.credits)}{" "}
                    <span className="text-lg font-bold text-white/55 sm:text-xl">
                      Credits
                    </span>
                  </p>
                </div>

                <p className="mt-4 flex-1 text-sm leading-7 text-white/55">
                  {description}
                </p>

                <div className="mt-6 flex items-center gap-2 text-xs text-white/45">
                  <CreditCard className="h-4 w-4 shrink-0" />
                  {secureLabel}
                </div>

                <Link
                  href="/login"
                  className={`mt-5 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-black transition ${
                    plan.highlight
                      ? "bg-[#d8ad5f] text-black hover:bg-[#efc777]"
                      : "bg-white text-black hover:border-[#d8ad5f]/40 hover:bg-[#efc777]/90"
                  }`}
                >
                  {getStartedLabel}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="mt-8 overflow-hidden rounded-[1.5rem] border border-dashed border-white/15 bg-white/[0.02] p-5 sm:rounded-[2rem] sm:p-6"
        aria-label={
          language === "en"
            ? "Watermarked promo package planned"
            : "Watermarked Promo-Paket geplant"
        }
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#d8ad5f]/10 text-[#d8ad5f]">
              <Tag className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-black text-white sm:text-xl">
                  {language === "en"
                    ? "Watermarked Promo Package"
                    : "Watermarked Promo-Paket"}
                </h3>
                <span className="rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/45">
                  {language === "en" ? "Planned" : "Geplant"}
                </span>
              </div>

              <p className="mt-2 text-sm leading-7 text-white/50">
                {language === "en"
                  ? "Watermarked promo exports — planned. Low-cost watermarked exports for early testing and brand discovery. Upgrade later to export without watermark."
                  : "Watermarked Promo-Exporte — geplant. Günstige Exporte mit sichtbarem InfluExAi-Wasserzeichen zum Testen und für Brand Discovery. Später Upgrade für Export ohne Wasserzeichen."}
              </p>

              <p className="mt-2 text-xs font-semibold text-white/35">
                {language === "en"
                  ? "Planned monetization module · not available for purchase in this release"
                  : "Geplantes Monetarisierungsmodul · in diesem Release nicht kaufbar"}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/40">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            {language === "en" ? "Coming later" : "Später verfügbar"}
          </div>
        </div>
      </div>
    </section>
  );
}
