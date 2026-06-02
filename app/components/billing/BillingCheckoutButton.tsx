"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { PackageKey } from "@/app/lib/billing/credit-packages";
import { startCreditPackageCheckout } from "@/app/lib/billing/credit-packages";
import {
  creditsPageHref,
  packageKeyToUserSlug,
  setPendingPackage,
  syncPackageUrlParam,
} from "@/lib/billing/pending-package-checkout";
import { usePricingUiOptional } from "@/app/components/billing/PricingUiProvider";
import { A11Y } from "@/lib/obsidian/a11y-tokens";

type Props = {
  packageKey: PackageKey;
  label: string;
  className?: string;
};

export default function BillingCheckoutButton({
  packageKey,
  label,
  className = "",
}: Props) {
  const supabase = createClient();
  const pricingUi = usePricingUiOptional();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setPendingPackage(packageKey);
        syncPackageUrlParam(packageKey);
        if (pricingUi) {
          pricingUi.openAuthForPackage(packageKey);
          return;
        }
        window.location.href = `/auth?mode=register&package=${packageKeyToUserSlug(packageKey)}`;
        return;
      }
      const result = await startCreditPackageCheckout(
        packageKey,
        session.access_token,
        window.location.origin
      );
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      window.location.href = creditsPageHref(packageKey);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={loading}
      className={`${A11Y.primaryCta} w-full ${A11Y.disabled} disabled:bg-amber-500/45 disabled:text-neutral-800 ${className}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : label}
    </button>
  );
}

export function BillingCreditsLink({ children }: { children: React.ReactNode }) {
  return (
    <Link
      href="/dashboard/credits"
      className={`${A11Y.secondaryCta} inline-block`}
    >
      {children}
    </Link>
  );
}
