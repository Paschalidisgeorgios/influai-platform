"use client";

import Link from "next/link";
import {
  CREDIT_PACKAGES,
  formatPackageCredits,
  getCreditUsageDisclaimer,
} from "@/app/lib/billing/credit-packages";
import CreditModeCostReference from "./CreditModeCostReference";
import ObsidianModalShell from "./ObsidianModalShell";
import PackageCheckoutButton from "./PackageCheckoutButton";

type Props = {
  open: boolean;
  onClose: () => void;
  language: "en" | "de";
};

export default function PricingModal({ open, onClose, language }: Props) {
  const isDe = language === "de";
  const lang = isDe ? "de" : "en";
  const title = isDe ? "Preise & Credit-Pakete" : "Pricing & credit packs";
  const oneTime = isDe ? "einmalig" : "one-time";

  return (
    <ObsidianModalShell open={open} onClose={onClose} title={title} size="lg">
      <p className="text-sm leading-relaxed text-neutral-400">
        {isDe
          ? "Einmalige Credit-Pakete — keine Abo-Pflicht. Kosten siehst du vor jedem Render."
          : "One-time credit packs — no subscription required. You always see costs before you render."}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {CREDIT_PACKAGES.map((pkg) => (
          <article
            key={pkg.key}
            className={`relative flex flex-col rounded-2xl border p-4 sm:p-5 ${
              pkg.highlight
                ? "border-amber-500/40 bg-amber-500/5 ring-1 ring-amber-500/25"
                : "border-neutral-800/80 bg-neutral-950/40"
            }`}
          >
            {pkg.badge ? (
              <span className="mb-2 inline-flex w-fit rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300">
                {pkg.badge[lang]}
              </span>
            ) : (
              <span className="mb-2 block h-5" aria-hidden />
            )}
            <h3 className="text-lg font-bold text-white">{pkg.label}</h3>
            <p className="mt-1 text-2xl font-black text-amber-400">
              {pkg.priceLabel}{" "}
              <span className="text-xs font-semibold text-neutral-500">{oneTime}</span>
            </p>
            <p className="mt-2 text-sm font-semibold text-neutral-200">
              {formatPackageCredits(pkg.credits, lang)}
            </p>
            <p className="mt-2 flex-1 text-xs leading-relaxed text-neutral-500">
              {pkg.copy[lang]}
            </p>
            <div className="mt-4">
              <PackageCheckoutButton pkg={pkg} language={lang} />
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-neutral-800/80 bg-neutral-950/50 p-4">
        <CreditModeCostReference language={lang} compact />
        <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
          {getCreditUsageDisclaimer(lang)}
        </p>
      </div>

      <p className="mt-4 text-center text-[11px] text-neutral-600">
        <Link
          href="/pricing"
          onClick={onClose}
          className="font-semibold text-neutral-500 underline-offset-2 hover:text-amber-400 hover:underline"
        >
          {isDe ? "Vollständige Preisseite" : "Full pricing page"}
        </Link>
      </p>
    </ObsidianModalShell>
  );
}
