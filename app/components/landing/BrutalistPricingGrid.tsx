"use client";

import { Check } from "lucide-react";

type Props = {
  currentLanguage: "en" | "de";
};

const COPY = {
  en: {
    title: "Simple, outcome-based pricing.",
    subtitle: "Not credits. Not limits. Real content packs.",
    perMonth: "/ month",
    cta: "Get started",
    popular: "Most popular",
    payPerPack: "Or pay per pack from €3.50",
    plans: [
      {
        name: "Creator",
        price: "€19",
        outcome: "20 Social Asset Packs / month",
        features: ["20 Social Asset Packs", "All Image Modes", "Style Profiles", "Gallery + Download", "Email Support"],
      },
      {
        name: "Pro",
        price: "€49",
        outcome: "60 Packs + Video Studio / month",
        highlight: true,
        features: ["60 Social Asset Packs", "Video Studio", "All Image Modes", "Priority Support", "50% Credit Rollover"],
      },
      {
        name: "Studio",
        price: "€99",
        outcome: "Unlimited + Team + Brand Kit",
        features: ["Unlimited Packs", "Team Workspace", "Brand Kit", "Video Studio", "100% Rollover", "Dedicated Support"],
      },
    ],
  },
  de: {
    title: "Einfaches, ergebnisorientiertes Pricing.",
    subtitle: "Keine Credits. Keine abstrakten Limits. Echte Content-Pakete.",
    perMonth: "/ Monat",
    cta: "Jetzt starten",
    popular: "Beliebteste Wahl",
    payPerPack: "Oder einzelnes Pack ab €3,50",
    plans: [
      {
        name: "Creator",
        price: "€19",
        outcome: "20 Social Asset Packs / Monat",
        features: ["20 Social Asset Packs", "Alle Bild-Modi", "Style Profile", "Galerie + Download", "E-Mail Support"],
      },
      {
        name: "Pro",
        price: "€49",
        outcome: "60 Packs + Video Studio / Monat",
        highlight: true,
        features: ["60 Social Asset Packs", "Video Studio", "Alle Bild-Modi", "Priority Support", "50% Credit Rollover"],
      },
      {
        name: "Studio",
        price: "€99",
        outcome: "Unlimited + Team + Brand Kit",
        features: ["Unlimitierte Packs", "Team Workspace", "Brand Kit", "Video Studio", "100% Rollover", "Dedizierter Support"],
      },
    ],
  },
};

export default function BrutalistPricingGrid({ currentLanguage }: Props) {
  const t = COPY[currentLanguage];

  return (
    <section id="pricing" className="bg-[#0A0A0B] py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#d8ad5f]">Pricing</p>
          <h2 className="text-3xl font-black text-white sm:text-4xl">{t.title}</h2>
          <p className="mt-3 text-white/50">{t.subtitle}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
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
                <span className="text-white/40 text-sm">{t.perMonth}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-[#d8ad5f]">{plan.outcome}</p>

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
