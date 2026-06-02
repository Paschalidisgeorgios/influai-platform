"use client";

import { Check } from "lucide-react";

type Props = {
  currentLanguage: "en" | "de";
};

const COPY = {
  en: {
    title: "Pay for results, not tokens.",
    subtitle: "Each pack includes images, score, hooks and captions. No hidden credits.",
    perMonth: "/ month",
    cta: "Create Free Pack",
    popular: "Most popular",
    payPerPack: "Or pay per pack from €3.50",
    plans: [
      {
        name: "Creator",
        price: "€19",
        outcome: "20 Social Asset Packs / month",
        description: "Perfect for solo creators posting 5x/week",
        features: [
          "20 Social Asset Packs",
          "All image modes",
          "Style profiles",
          "Gallery + download",
          "Email support",
        ],
      },
      {
        name: "Pro",
        price: "€49",
        outcome: "60 Packs + Video Studio / month",
        description: "For creators and small brands who need more volume",
        highlight: true,
        features: [
          "60 Social Asset Packs",
          "Video Studio",
          "All image modes",
          "Priority support",
          "50% credit rollover",
        ],
      },
      {
        name: "Studio",
        price: "€99",
        outcome: "Unlimited + Team + Brand Kit",
        description: "For agencies and teams managing multiple clients",
        features: [
          "Unlimited packs",
          "Team workspace",
          "Brand Kit",
          "Video Studio",
          "100% rollover",
          "Dedicated support",
        ],
      },
    ],
  },
  de: {
    title: "Bezahle für Ergebnisse, nicht für Tokens.",
    subtitle: "Jedes Pack enthält Bilder, Score, Hooks und Captions. Keine versteckten Credits.",
    perMonth: "/ Monat",
    cta: "Kostenloses Pack erstellen",
    popular: "Beliebteste Wahl",
    payPerPack: "Oder einzelnes Pack ab €3,50",
    plans: [
      {
        name: "Creator",
        price: "€19",
        outcome: "20 Social Asset Packs / Monat",
        description: "Für Solo-Creator die 5x/Woche posten",
        features: [
          "20 Social Asset Packs",
          "Alle Bild-Modi",
          "Style Profile",
          "Galerie + Download",
          "E-Mail Support",
        ],
      },
      {
        name: "Pro",
        price: "€49",
        outcome: "60 Packs + Video Studio / Monat",
        description: "Für Creator und kleine Brands mit mehr Volumen",
        highlight: true,
        features: [
          "60 Social Asset Packs",
          "Video Studio",
          "Alle Bild-Modi",
          "Priority Support",
          "50% Credit Rollover",
        ],
      },
      {
        name: "Studio",
        price: "€99",
        outcome: "Unlimited + Team + Brand Kit",
        description: "Für Agenturen und Teams mit mehreren Kunden",
        features: [
          "Unlimitierte Packs",
          "Team Workspace",
          "Brand Kit",
          "Video Studio",
          "100% Rollover",
          "Dedizierter Support",
        ],
      },
    ],
  },
};

export default function BrutalistPricingGrid({ currentLanguage }: Props) {
  const t = COPY[currentLanguage];

  return (
    <section id="pricing" className="bg-[#0A0A0B] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#d8ad5f]">
            Pricing
          </p>
          <h2 className="text-3xl font-black text-white sm:text-4xl">{t.title}</h2>
          <p className="mt-3 text-white/50">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {t.plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl border p-8 transition ${
                plan.highlight
                  ? "border-[#d8ad5f]/40 bg-[#d8ad5f]/5"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[#d8ad5f] px-4 py-1 text-xs font-bold text-black">
                    {t.popular}
                  </span>
                </div>
              )}

              <p className="text-sm font-semibold text-white/60">{plan.name}</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">{plan.price}</span>
                <span className="text-sm text-white/40">{t.perMonth}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-[#d8ad5f]">{plan.outcome}</p>
              <p className="mt-2 text-xs leading-relaxed text-white/45">{plan.description}</p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                    <Check className="h-4 w-4 shrink-0 text-[#d8ad5f]" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`mt-8 w-full rounded-2xl py-3 text-sm font-bold transition ${
                  plan.highlight
                    ? "bg-[#d8ad5f] text-black hover:bg-[#efc777]"
                    : "border border-white/10 text-white hover:bg-white/5"
                }`}
              >
                {t.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-white/30">{t.payPerPack}</p>
      </div>
    </section>
  );
}
