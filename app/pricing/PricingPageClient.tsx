"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PlanComparisonCards from "@/app/components/billing/PlanComparisonCards";
import CreditModeCostReference from "@/app/components/billing/CreditModeCostReference";
import PendingPackageCheckoutEffect from "@/app/components/billing/PendingPackageCheckoutEffect";
import { usePricingUi } from "@/app/components/billing/PricingUiProvider";
import { formatCreditPackagesPricingSummary } from "@/app/lib/billing/credit-packages";
import { normalizePackageKey } from "@/lib/billing/pending-package-checkout";
import { CREDITS_PAGE } from "@/lib/copy/launch-user-copy";
import { MONETIZATION_COPY } from "@/app/lib/billing/pricing-config";

function PricingPageInner() {
  const searchParams = useSearchParams();
  const { openPricing } = usePricingUi();

  useEffect(() => {
    if (searchParams.get("open") === "1") {
      openPricing();
    }

    const highlight = normalizePackageKey(searchParams.get("package"));
    if (highlight) {
      const el = document.getElementById(`credit-pack-${highlight}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.classList.add("ring-2", "ring-amber-500/50");
    }
  }, [openPricing, searchParams]);

  return (
    <>
      <PendingPackageCheckoutEffect />
      <main className="min-h-screen bg-[#050505] text-white">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <header className="text-center">
            <Link
              href="/"
              className="text-sm font-semibold text-neutral-500 hover:text-amber-400"
            >
              ← InfluExAI
            </Link>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight">
              Simple, honest pricing
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-neutral-400">
              {CREDITS_PAGE.subtitle.en} {MONETIZATION_COPY.costBeforeRender.en}
            </p>
            <p className="mt-4">
              <button
                type="button"
                onClick={() => openPricing()}
                className="text-sm font-semibold text-amber-400 underline-offset-2 hover:underline"
              >
                Open pricing window
              </button>
            </p>
          </header>

          <div className="mt-12">
            <PlanComparisonCards language="en" />
          </div>

          <section className="mt-16 rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6">
            <h2 className="text-lg font-bold">Credit packs</h2>
            <p className="mt-2 text-sm text-neutral-400">
              {formatCreditPackagesPricingSummary("en")}. One-time purchase — no
              subscription.
            </p>
          </section>

          <section className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6">
            <CreditModeCostReference language="en" />
          </section>
        </div>
      </main>
    </>
  );
}

export default function PricingPageClient() {
  return (
    <Suspense fallback={null}>
      <PricingPageInner />
    </Suspense>
  );
}
