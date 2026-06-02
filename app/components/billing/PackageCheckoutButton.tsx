"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { CreditPackage } from "@/app/lib/billing/credit-packages";
import { startCreditPackageCheckout } from "@/app/lib/billing/credit-packages";
import {
  creditsPageHref,
  setPendingPackage,
  syncPackageUrlParam,
} from "@/lib/billing/pending-package-checkout";
import { obsidianButtonClass } from "@/lib/obsidian/button-tokens";
import { usePricingUi } from "./PricingUiProvider";

type Props = {
  pkg: CreditPackage;
  language: "en" | "de";
  fullWidth?: boolean;
  size?: "sm" | "md";
  className?: string;
};

export default function PackageCheckoutButton({
  pkg,
  language,
  fullWidth = true,
  size = "md",
  className = "",
}: Props) {
  const supabase = createClient();
  const { openAuthForPackage } = usePricingUi();
  const [loading, setLoading] = useState(false);
  const isDe = language === "de";
  const label = pkg.ctaLabel[language];

  async function handleClick() {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setPendingPackage(pkg.key);
        syncPackageUrlParam(pkg.key);
        openAuthForPackage(pkg.key);
        return;
      }

      const result = await startCreditPackageCheckout(
        pkg.key,
        session.access_token,
        window.location.origin
      );
      if (result.url) {
        window.location.href = result.url;
        return;
      }

      window.location.href = creditsPageHref(pkg.key);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={loading}
      className={`${obsidianButtonClass(pkg.highlight ? "primary" : "secondary", {
        size,
        fullWidth,
        surface: "landing",
      })} ${className}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : label}
    </button>
  );
}
